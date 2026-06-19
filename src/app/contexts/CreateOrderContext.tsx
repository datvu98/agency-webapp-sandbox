import { useQuery } from "@apollo/client";
import { Form } from "antd";
import { selectCurrentConverstation } from "app/pages/ChatPage/slice/selectors";
import query_crmFindCustomer from "graphql/queries/query_crmFindCustomer";
import query_crmGetDistrict from "graphql/queries/query_crmGetDistrict";
import query_crmGetProvince from "graphql/queries/query_crmGetProvince";
import query_scGetShippingUnit from "graphql/queries/query_scGetShippingUnit";
import query_smeCatalogStores from "graphql/queries/query_smeCatalogStores";
import { groupBy } from "lodash";
import React, { useMemo, useCallback, useContext, useState, useRef } from "react";
import { useSelector } from "react-redux";
import * as Yup from "yup";

type ContextProps = {
    collapseActiveKey: string[],
    setCollapseActiveKey: any
};

const CreateOrderContext = React.createContext<Partial<any>>({});

export function useCreateOrderContext() {
    return useContext(CreateOrderContext);
}

export function CreateOrderProvider({ children }) {
    const [infoReceiver, setInfoReceiver] = useState<any>(null);
    const [variantsOrder, setVariantsOrder] = useState([]);
    const [smeWarehouseSelected, setSmeWarehouseSelected] = useState<any>(null);
    const [collapseActiveKey, setCollapseActiveKey] = useState<string[]>([]);
    const currentConversation = useSelector(selectCurrentConverstation);
    const [validateSchema, setValidateSchema] = useState<any>(null);

    const { data: dataCustomer } = useQuery(query_crmFindCustomer, {
        variables: {
            ref_customer_id: currentConversation?.customer?.ref_id
        },
        skip: !currentConversation?.customer?.ref_id,
        fetchPolicy: 'cache-and-network'
    });

    const { data: dataCrmGetProvince } = useQuery(query_crmGetProvince, {
        fetchPolicy: "cache-and-network",
    });

    const { data: dataCrmGetDistrict } = useQuery(query_crmGetDistrict, {
        fetchPolicy: "cache-and-network",
    });

    const { data: dataCatalogStores } = useQuery(query_smeCatalogStores, {
        fetchPolicy: 'cache-and-network'
    });

    const { data: dataShippingUnit } = useQuery(query_scGetShippingUnit, {
        fetchPolicy: 'cache-and-network'
    });

    const infoCustomer = useMemo(() => {
        return dataCustomer?.crmFindCustomer || null
    }, [dataCustomer]);

    const optionsProvince = useMemo(() => {
        return dataCrmGetProvince?.crmGetProvince?.map(province => ({
            value: province?.code,
            label: province?.name
        }));
    }, [dataCrmGetProvince]);

    const optionsDistrict = useMemo(() => {
        const opsParse = dataCrmGetDistrict?.crmGetDistrict?.map(district => ({
            value: district?.code,
            label: district?.full_name,
            province_code: district?.province_code,
        }));

        return groupBy(opsParse, 'province_code')
    }, [dataCrmGetDistrict]);


    const optionsSmeWarehouse = useMemo(() => {
        const optionsCatalogStores = dataCatalogStores?.sme_warehouses?.map(store => ({
            value: store?.id,
            label: store?.name,
            isDefault: store?.is_default,
            ...store
        }));

        return optionsCatalogStores
    }, [dataCatalogStores]);

    const optionsShippingUnit = useMemo(() => {
        const options = dataShippingUnit?.scGetShippingUnit?.map((item, key) => ({
            label: item?.name,
            value: item?.key
        }));

        return options
    }, [dataShippingUnit]);

    const BASE_SCHEMA = useRef({
        name_receiver: Yup.string()
            .nullable()
            .max(50, "Tên người nhận tối đa 50 ký tự")
            .required("Vui lòng nhập tên người nhận")
            .test(
                'chua-ky-tu-space-o-dau-cuoi',
                'Tên người nhận không được chứa dấu cách ở đầu và cuối',
                (value, context) => {
                    if (!!value) {
                        return value.length == value.trim().length;
                    }
                    return true;
                },
            )
            .test(
                'chua-ky-tu-2space',
                'Tên người nhận không được chứa 2 dấu cách liên tiếp',
                (value, context) => {
                    if (!!value) {
                        return !(/\s\s+/g.test(value))
                    }
                    return true;
                },
            ),
        phone_receiver: Yup.string()
            .nullable()
            .required("Vui lòng nhập số điện thoại người nhận")
            .length(10, "Độ dài số điện thoại người nhận phải 10 số")
            .test('sai-dinh-dang-phone', 'Số điện thoại người nhận không hợp lệ',
                (value, context) => {
                    if (!!value) {
                        return (/^0[0-9]\d{8}$/g.test(value))
                    }
                    return true;
                },
            ),
        province: Yup.string()
            .required("Vui lòng chọn tỉnh/thành phố"),
        district: Yup.string()
            .required("Vui lòng chọn quận/huyện"),
        address: Yup.string()
            .required("Vui lòng nhập địa chỉ người nhận"),
        order_code: Yup.string()
            .nullable()
            .max(20, "Mã đơn hàng tối đa 20 ký tự")
            .required("Vui lòng nhập mã đơn hàng")
            .test(
                'chua-ky-tu-space-o-dau-cuoi',
                'Mã đơn hàng không được chứa dấu cách ở đầu và cuối',
                (value, context) => {
                    if (!!value) {
                        return value.length == value.trim().length;
                    }
                    return false;
                },
            )
            .test(
                'chua-ky-tu-2space',
                'Mã đơn hàng không được chứa 2 dấu cách liên tiếp',
                (value, context) => {
                    if (!!value) {
                        return !(/\s\s+/g.test(value))
                    }
                    return false;
                },
            )
            .when(`order_code_boolean`, {
                is: values => {
                    return !!values && !!values[`order_code`];
                },
                then: () => Yup.string().oneOf(['order_code'], 'Mã đơn hàng đã tồn tại')
            }),
        payment_method: Yup.string()
            .required("Vui lòng chọn phương thức thanh toán"),
        order_code_boolean: Yup.object().notRequired(),
        package_weight: Yup.number()
            .notRequired()
            .transform((value) => Number.isNaN(value) ? null : value)
            .nullable()
            .moreThan(0, "Trọng lượng kiện hàng phải lớn hơn 0g")
            .max(100000, "Trọng lượng kiện hàng tối đa 100,000g"),
        shipping_carrier: Yup.string()
            .nullable()
            .required("Vui lòng chọn đơn vị vận chuyển"),
        shipping_original_fee: Yup.number()
            .nullable()
            .transform((value) => Number.isNaN(value) ? null : value)
            .max(10000000, "Phí vận chuyển tối đa 10,000,000đ"),
        shipping_discount_seller_fee: Yup.number()
            .when(`shipping_original_fee`, ([shipping_original_fee]) => {
                if (typeof shipping_original_fee == 'number') {
                    return Yup.number().max(shipping_original_fee, 'Hỗ trợ vận chuyển không thể lớn hơn phí vận chuyển thực tế')
                } else {
                    return Yup.number()
                }
            }),
    });

    useMemo(() => {
        let schema = { ...BASE_SCHEMA.current };

        (variantsOrder || []).forEach((variant: any) => {
            if (!smeWarehouseSelected) return;

            const smeWarehouse = variant?.variant?.inventories?.find(wh => wh?.sme_store_id == smeWarehouseSelected?.value);
            const isCheckStock = smeWarehouse?.stock_available <= 999999;

            schema[`variant_${variant?.variant?.id}_discount`] = Yup.number()
                .notRequired()
            // .when(`variant_${variant?.variant?.id}_price`, values => {
            //     if (typeof values == 'number') {
            //         return Yup.number()
            //             .max(values, 'Chiết khấu không được vượt quá đơn giá của hàng hóa')
            //     } 

            //     return Yup.number()
            // })
            // .when(`variant_${variant?.variant?.id}_unit`, values => {
            //     if (!!values?.value) {
            //         return Yup.number()
            //             .max(100, 'Chiết khấu tối đa 100%' })
            //     } 

            //     return Yup.number()  
            // })
            schema[`variant_${variant?.variant?.id}_price`] = Yup.number()
                .required('Vui lòng nhập đơn giá')
                .max(120000000, 'Đơn giá tối đa 120.000.000đ')
            schema[`variant_${variant?.variant?.id}_quantity`] = Yup.number()
                .required('Vui lòng nhập số lượng hàng hóa')
                .moreThan(0, 'Số lượng hàng hóa phải lớn hơn 0')
                .max(
                    isCheckStock ? smeWarehouse?.stock_available : 999999,
                    isCheckStock ? 'Số lượng phải nhỏ hơn hoặc bằng tồn sẵn sàng bán' : 'Số lượng hàng hóa phải nhỏ hơn hoặc bằng 999.999'
                )


        })

        setValidateSchema(Yup.object().shape(schema))
    }, [variantsOrder, smeWarehouseSelected]);

    const yupSync: any = {
        async validator({ field }, value) {
            await validateSchema.validateSyncAt(field, { [field]: value });
        },
    };

    const value = useMemo(() => {
        return {
            collapseActiveKey, setCollapseActiveKey, optionsProvince, optionsDistrict,
            optionsSmeWarehouse, optionsShippingUnit, yupSync, setSmeWarehouseSelected, smeWarehouseSelected,
            variantsOrder, setVariantsOrder, infoCustomer, infoReceiver, setInfoReceiver
        }
    }, [
        collapseActiveKey, setCollapseActiveKey, optionsProvince, optionsDistrict,
        optionsSmeWarehouse, optionsShippingUnit, validateSchema, smeWarehouseSelected,
        variantsOrder, infoCustomer, infoReceiver
    ]);

    return (
        <CreateOrderContext.Provider value={value}>
            {children}
        </CreateOrderContext.Provider>
    );
}