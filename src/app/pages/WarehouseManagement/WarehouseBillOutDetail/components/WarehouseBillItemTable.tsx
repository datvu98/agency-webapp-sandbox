import React, { useMemo, useState } from "react";
import { Col, Collapse, Flex, Image, Row, Table, Tabs, Tag, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
import Pagination from "app/components/Pagination";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import queryString from 'querystring'
import { useQuery } from "@apollo/client";
import query_warehouseBillItemListWithPagination from "graphql/queries/query_warehouseBillItemListWithPagination";
import client from "apollo";
import query_sme_catalog_product_variant_stock from "graphql/queries/query_sme_catalog_product_variant_stock";
import SkuIcon from 'assets/ic_sku.svg';
import { formatNumberToCurrency } from "utils/helper";
import ModalDetailLocation from "../dialogs/ModalDetailLocation";

const { Text, Paragraph } = Typography;

const queryGetSmeProductVariants = async (ids) => {
	if (ids?.length == 0) return [];

	const { data } = await client.query({
		query: query_sme_catalog_product_variant_stock,
		variables: {
			where: {
				id: { _in: ids },
			},
		},
		fetchPolicy: "network-only",
	});

	return data?.sme_catalog_product_variant || [];
};

const WarehouseBillOutItemTable = ({ dataDetail }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = queryString.parse(location.search.slice(1, 100000)) as any;
	const {id} = useParams()
	const [dataTable, setDataTable] = useState([])
	const [showDetailLocation, setShowDetailLocation] = useState({
		show: false,
		dataInfo: {
			variant_full_name: '',
			sku: '',
			variant_id: '',
			warehouse_bill_item_id: 0,
			warehouse_bill_id: 0
		}
	})
    const page = useMemo(() => {
        try {
            let _page = Number(params.page);
            if (!Number.isNaN(_page)) {
                return Math.max(1, _page);
            } else {
                return 1;
            }
        } catch (error) {
            return 1;
        }
    }, [params.page]);

    const limit = useMemo(() => {
        try {
            let _value = Number(params.limit);
            if (!Number.isNaN(_value)) {
                return Math.max(25, _value);
            } else {
                return 25;
            }
        } catch (error) {
            return 25;
        }
    }, [params?.limit]);

	const {data: dataWarehouseBillItem, loading: loadingDataWarehouseBillItem} = useQuery(query_warehouseBillItemListWithPagination, {
		variables: {
			limit: limit,
			offset: (page - 1) * limit,
			where: {
				warehouseBillId: {
					_eq: Number(id)
				}
			}
		},
		fetchPolicy: 'cache-and-network',
		onCompleted: async (data) => {
			const variantIdList = data?.warehouseBillItemListWithPagination?.data?.map(item => item?.variantId)
			const variantList = await queryGetSmeProductVariants(variantIdList)
			const newDataMap = data?.warehouseBillItemListWithPagination?.data?.map(billItem => {
				let variant = variantList?.find(_v => _v?.id == billItem?.variantId)
				return {
					...billItem,
					variant: variant
				}
			})
			setDataTable(newDataMap)
		}	
	})
    const columns = [
		{
			title: "Sản phẩm",
			dataIndex: "product",
			key: "product",
			width: 300,
			render: (_item, record) => {
				console.log(record)
				const imgUrl = record?.variant?.sme_catalog_product_variant_assets?.length ? record?.variant?.sme_catalog_product_variant_assets[0]?.asset_url : ''
				return <Row gutter={8} align="middle">
					<Col span={5}>
						<Image
							className="image-product"
							preview={false}
							src={`${imgUrl}`}
						/>
					</Col>
					<Col span={19}>
						<Flex vertical className="text-wrapper">
							<Tooltip title={record?.variant?.sme_catalog_product?.name} placement="bottom">
								<Paragraph
									ellipsis={{ rows: 2 }}
									style={{marginBottom: 0}}
								>
									{record?.variant?.sme_catalog_product?.name}
								</Paragraph>
							</Tooltip>
							{!!record?.variant?.sku && <Flex align="center" gap={4}>
								{/* <img
									className="icon-sku"
									src={SkuIcon}
								/> */}
								<Paragraph type="secondary" className="text-sub" style={{ margin: 0 }} ellipsis={{ rows: 2 }}>
									{record?.variant?.sku}
								</Paragraph>
							</Flex>}
						</Flex>
					</Col>
				</Row>
			},
		},
		{
			title: "ĐVT",
			dataIndex: "unit",
			key: "unit",
			width: 200,
			align: "center",
			render: (_item, record) => {
                return <Text>{record?.variant?.unit || "--"}</Text>;
			},
		},
		{
			title: "Số lượng xuất kho",
			dataIndex: "quantity",
			key: "quantity",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text className="cursor-pointer"
					onClick={() => {
						setShowDetailLocation({
							show: true,
							dataInfo: {
								variant_full_name: record?.variant?.variant_full_name,
								sku: record?.variant?.sku,
								variant_id: record?.variant?.id,
								warehouse_bill_id: Number(id),
								warehouse_bill_item_id: record?.id
							}
						})
					}}
				>{_item ? formatNumberToCurrency(_item) : "--"}</Text>;
			},
		},
        {
			title: "Ghi chú",
			dataIndex: "note",
			key: "note",
			width: 200,
			align: "center",
			render: (_item, record) => {
				return <Text>{record?.note || "--"}</Text>;
			},
		},
	];
    return (
        <>
			{showDetailLocation?.show && <ModalDetailLocation
				show={showDetailLocation?.show}
				onHide={() => {
					setShowDetailLocation({
						show: false,
						dataInfo: {
							variant_full_name: '',
							sku: '',
							variant_id: '',
							warehouse_bill_id: 0,
							warehouse_bill_item_id: 0
						}
					})
				}}
				dataInfo={showDetailLocation?.dataInfo}
			/>}
            <Table
				className="setting-table ant-upbase"
				dataSource={dataTable || []}
				columns={columns as any}
				bordered
				tableLayout="auto"
				sticky={{ offsetHeader: 0 }}
				scroll={{ x: "max-content" }}
				pagination={false}
			/>
            <Pagination
                page={page}
                totalPage={dataWarehouseBillItem?.warehouseBillItemListWithPagination?.meta?.totalPages}
                limit={limit}
                totalRecord={dataWarehouseBillItem?.warehouseBillItemListWithPagination?.meta?.totalItems}
                count={dataWarehouseBillItem?.warehouseBillItemListWithPagination?.data?.length}
                basePath={`${location.pathname}`}
                options={[
                    { label: 25, value: 25 },
                    { label: 50, value: 50 },
                    { label: 100, value: 100 },
                ]}
            />
        </>
    );
};

export default WarehouseBillOutItemTable;
