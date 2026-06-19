import { useMutation, useQuery } from "@apollo/client";
import { Card, Col, Flex, Row, Typography, Input, Checkbox, Button, Popover, Select } from "antd";
import { selectGlobalSlice } from "app/slice/selectors";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import query_smeStoresWarehouse from "graphql/queries/query_smeStoresWarehouse";
import { FilterOutlined } from "@ant-design/icons";
import query_smeStore from "graphql/queries/query_smeStore";
import query_smeChatStore from "graphql/queries/query_smeChatStore";
import query_smeWarehouse from "graphql/queries/query_smeWarehouse";
import query_scListConnectorStoreAgency from "graphql/queries/query_scListConnectorStoreAgency";
const { Text } = Typography;

type CurrentSelectType = {
    smes: number[];
    stores: number[];
    chat_stores: number[];
    warehouses: number[];
}

const SubUserRole = ({ currentSelect, setCurrentSelect }) => {
    const { user } = useSelector(selectGlobalSlice)
    const [searchTermSme, setSearchTermSme] = useState<string>("");
    const [searchTermStores, setSearchTermStores] = useState<string>("");
    const [searchTermChatStores, setSearchTermChatStores] = useState<string>("");
    const [searchTermWarehouses, setSearchTermWarehouses] = useState<string>("");
    const [tempFilterOption, setTempFilterOption] = useState<"all" | "selected" | "unselected">("all");
    const [filterOption, setFilterOption] = useState<"all" | "selected" | "unselected">("all");
    const [popoverVisible, setPopoverVisible] = useState<boolean>(false);

    const { data: dataSme } = useQuery(query_smeStoresWarehouse, {
        fetchPolicy: 'network-only'
    })

    const { data: dataStore } = useQuery(query_smeStore, {
        fetchPolicy: 'network-only'
    })

    const { data: dataScListConnectorStoreAgency } = useQuery(query_scListConnectorStoreAgency, {
        variables: {
            status: [0, 1]
        },
        fetchPolicy: 'cache-and-network'
    })

    const { data: dataChatStore } = useQuery(query_smeChatStore, {
        fetchPolicy: 'network-only'
    })

    const { data: dataWarehouse } = useQuery(query_smeWarehouse, {
        fetchPolicy: 'network-only'
    })

    const groupedData = useMemo(() => {
        if (!dataSme || !dataSme?.agencyGetSme || !dataStore?.scAgencySaleStores?.data || !dataWarehouse?.sme_warehouses || !dataChatStore?.scAgencyConversationStores?.data) {
            return [];
        }
        const groupedData = dataSme?.agencyGetSme?.map(user => {
            const sme_id = user.sme_id;
            return {
                sme: user,
                stores: dataStore?.scAgencySaleStores?.data?.filter(store => {
                    return dataScListConnectorStoreAgency?.scListConnectorStoreAgency?.map(item => item?.store_id)?.includes(store?.id)
                })?.filter(store => store.sme_id === sme_id),
                chat_stores: dataChatStore?.scAgencyConversationStores?.data.filter(chat_store => chat_store.sme_id === sme_id),
                warehouses: dataWarehouse?.sme_warehouses.filter(warehouse => warehouse.sme_id === sme_id)
            };
        })
        return groupedData
    }, [dataSme, dataStore, dataChatStore, dataWarehouse, dataScListConnectorStoreAgency])

    const handleCheckboxChange = (category, id) => {
        setCurrentSelect(prevState => {
            const categoryArray = prevState[category];
            const isExist = categoryArray.includes(id);
            return {
                ...prevState,
                [category]: isExist
                    ? categoryArray.filter(item => item !== id)
                    : [...categoryArray, id]
            };
        });
    };

    const handleSmeCheckboxChange = (smeId: number, category: keyof CurrentSelectType, items: any[]) => {
        setCurrentSelect(prevState => {
            const isSmeSelected = prevState.smes.includes(smeId);
            let newItems;

            const allItemsSelected = items.every(item => prevState[category].includes(item.id));

            if (isSmeSelected && allItemsSelected) {
                newItems = {
                    ...prevState,
                    [category]: prevState[category].filter(id => !items.map(item => item.id).includes(id))
                };
            } else {
                newItems = {
                    ...prevState,
                    [category]: [...prevState[category], ...items.map(item => item.id)]
                };
            }

            return newItems;
        });
    };

    const clearAllCategoriesForSme = (smeId: number) => {
        setCurrentSelect(prevState => ({
            ...prevState,
            smes: prevState.smes.filter(id => id !== smeId),
            stores: prevState.stores.filter(id => !groupedData.find(sme => sme.sme.sme_id === smeId)?.stores.map(store => store.id).includes(id)),
            chat_stores: prevState.chat_stores.filter(id => !groupedData.find(sme => sme.sme.sme_id === smeId)?.chat_stores.map(chatStore => chatStore.id).includes(id)),
            warehouses: prevState.warehouses.filter(id => !groupedData.find(sme => sme.sme.sme_id === smeId)?.warehouses.map(warehouse => warehouse.id).includes(id))
        }));
    };

    const isSmeChecked = (smeId: number, category: keyof CurrentSelectType, items: any[]) => {
        const itemIds = items.map(item => item.id);
        return itemIds.every(id => currentSelect[category].includes(id));
    };

    const filteredStores = groupedData?.filter((sme) => {
        const matchedByName = currentSelect.smes.includes(sme.sme.sme_id) && sme.stores.some((store) => store.name.toLowerCase().includes(searchTermStores.toLowerCase()))
        switch (filterOption) {
            case "selected":
                return currentSelect.smes.includes(sme.sme.sme_id) && matchedByName;
            case "unselected":
                return !currentSelect.smes.includes(sme.sme.sme_id) && matchedByName;
            default:
                return matchedByName;
        }
    }).map((sme) => {
        const filteredStores = sme.stores.filter((store) => store.name.toLowerCase().includes(searchTermStores.toLowerCase()));
        return {
            ...sme,
            stores: filteredStores,
        };
    })
        .filter((sme) => sme.stores.length > 0);

    const filteredSmes = groupedData?.filter((sme) => {
        const matchedByEmail = sme.sme.email.toLowerCase().includes(searchTermSme.toLowerCase());
        switch (filterOption) {
            case "selected":
                return currentSelect.smes.includes(sme.sme.sme_id) && matchedByEmail;
            case "unselected":
                return !currentSelect.smes.includes(sme.sme.sme_id) && matchedByEmail;
            default:
                return matchedByEmail;
        }
    });

    const filteredChatStores = groupedData?.filter((sme) => {
        const matchedByName = currentSelect.smes.includes(sme.sme.sme_id) && sme.chat_stores.some((chatStore) => chatStore.name.toLowerCase().includes(searchTermChatStores.toLowerCase()));
        switch (filterOption) {
            case "selected":
                return currentSelect.smes.includes(sme.sme.sme_id) && matchedByName;
            case "unselected":
                return !currentSelect.smes.includes(sme.sme.sme_id) && matchedByName;
            default:
                return matchedByName;
        }
    }).map((sme) => {
        const filteredStores = sme.chat_stores.filter((store) => store.name.toLowerCase().includes(searchTermChatStores.toLowerCase()));
        return {
            ...sme,
            chat_stores: filteredStores,
        };
    })
        .filter((sme) => sme.chat_stores.length > 0);

    const filteredWarehouses = groupedData?.filter((sme) => {
        const matchedByName = currentSelect.smes.includes(sme.sme.sme_id) &&
            sme.warehouses.some((warehouse) => warehouse.name.toLowerCase().includes(searchTermWarehouses.toLowerCase()))
        switch (filterOption) {
            case "selected":
                return currentSelect.smes.includes(sme.sme.sme_id) && matchedByName;
            case "unselected":
                return !currentSelect.smes.includes(sme.sme.sme_id) && matchedByName;
            default:
                return matchedByName;
        }
    }).map((sme) => {
        const filterWarehouses = sme.warehouses.filter((wh) => wh.name.toLowerCase().includes(searchTermWarehouses.toLowerCase()));
        return {
            ...sme,
            warehouses: filterWarehouses,
        };
    })
        .filter((sme) => sme.warehouses.length > 0);

    const handleFilterChange = (value: "all" | "selected" | "unselected") => {
        setTempFilterOption(value);
    };

    const handleOkButtonClick = () => {
        setFilterOption(tempFilterOption);
        setPopoverVisible(false);
    };

    const smeTitle = useMemo(() => {
        return (<Flex style={{ width: '60%', marginLeft: "auto" }} justify="space-between">
            <span>UpS</span>
            <Popover
                placement="bottom"
                content={
                    <>
                        <div style={{ marginBottom: 10 }}>
                            <Checkbox
                                checked={tempFilterOption === "selected"}
                                onChange={(e) => handleFilterChange(e.target.checked ? "selected" : "all")}
                            >
                                Đã chọn
                            </Checkbox>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <Checkbox
                                checked={tempFilterOption === "unselected"}
                                onChange={(e) => handleFilterChange(e.target.checked ? "unselected" : "all")}
                            >
                                Chưa chọn
                            </Checkbox>
                        </div>
                        <Button type="primary" onClick={handleOkButtonClick} style={{ width: "100%" }}>
                            OK
                        </Button>
                    </>
                }
                trigger="click"
                visible={popoverVisible}
                onVisibleChange={(visible) => setPopoverVisible(visible)}
            >
                <Button style={{ color: filterOption != 'all' ? "#e74c3c" : "inherit", border: "none", padding: 0 }} icon={<FilterOutlined />} type="text" />
            </Popover>
        </Flex>
        )
    }, [popoverVisible, filterOption, tempFilterOption])

    return <>
        <Row style={{ marginTop: '40px' }}>
            <Flex style={{ height: '100%', width: '100%' }} gap={10}>
                <Col span={5}>
                    <Card title={smeTitle} bordered={false} style={{ textAlign: 'center' }}>

                        <Flex vertical gap={10} align="left">
                            <Input
                                placeholder="Tìm kiếm UpS"
                                value={searchTermSme}
                                onChange={(e) => setSearchTermSme(e.target.value)}
                            />
                            {filteredSmes?.map(sme => {
                                return <Checkbox
                                    checked={currentSelect?.smes?.includes(sme?.sme?.sme_id)}
                                    onChange={() => {
                                        if (currentSelect?.smes?.includes(sme?.sme?.sme_id)) {
                                            clearAllCategoriesForSme(sme?.sme?.sme_id);
                                        } else {
                                            handleCheckboxChange('smes', sme?.sme?.sme_id);
                                        }
                                    }}>{sme?.sme?.email}</Checkbox>
                            })}
                        </Flex>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card title="Gian hàng" bordered={false} style={{ textAlign: 'center' }}>
                        <Flex vertical gap={10}>
                            <Input
                                placeholder="Tìm kiếm gian hàng"
                                value={searchTermStores}
                                onChange={(e) => setSearchTermStores(e.target.value)}
                            />
                            {filteredStores?.length > 0 && filteredStores?.map((sme: any) => {
                                return <><Checkbox className="bold"
                                    onChange={() => handleSmeCheckboxChange(sme.sme.sme_id, 'stores', sme.stores)}
                                    checked={isSmeChecked(sme.sme.sme_id, 'stores', sme.stores)}>{sme?.sme?.email || '--'}</Checkbox>
                                    <Flex>
                                        <div style={{ marginLeft: '12px' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-return-right" viewBox="0 0 16 16">
                                                <path fill-rule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5" />
                                            </svg>
                                        </div>
                                        <Row style={{ width: '100%' }}>
                                            {
                                                sme?.stores?.map(store => {
                                                    const storeLogo = dataStore?.op_connector_channels?.find(channel => channel?.code == store?.connector_channel_code)?.logo_asset_url
                                                    return <Col span={12} style={{ textAlign: 'left' }}>
                                                        <Checkbox
                                                            style={{ marginLeft: '18px', display: 'flex', alignItems: 'flex-start' }}
                                                            onChange={() => handleCheckboxChange('stores', store.id)}
                                                            checked={currentSelect.stores.includes(store.id)}
                                                        >
                                                            <img height={16} width={16} src={storeLogo} />
                                                            <Text style={{ marginLeft: '8px' }}>{store?.name}</Text>
                                                        </Checkbox>
                                                    </Col>
                                                })
                                            }
                                        </Row>
                                    </Flex>
                                </>
                            })}
                        </Flex>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card title="Gian hàng chat" bordered={false} style={{ textAlign: 'center' }}>
                        <Flex vertical gap={10}>
                            <Input
                                placeholder="Tìm kiếm gian hàng chat"
                                value={searchTermChatStores}
                                onChange={(e) => setSearchTermChatStores(e.target.value)}
                            />
                            {filteredChatStores?.length > 0 && filteredChatStores?.map((sme: any) => {
                                return <><Checkbox className="bold"
                                    onChange={() => handleSmeCheckboxChange(sme.sme.sme_id, 'chat_stores', sme.chat_stores)}
                                    checked={isSmeChecked(sme.sme.sme_id, 'chat_stores', sme.chat_stores)}>{sme?.sme?.email || '--'}</Checkbox>
                                    <Flex>
                                        <div style={{ marginLeft: '12px' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-return-right" viewBox="0 0 16 16">
                                                <path fill-rule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5" />
                                            </svg>
                                        </div>
                                        <Row style={{ width: '100%' }}>
                                            {
                                                sme?.chat_stores?.map(store => {
                                                    const storeLogo = dataStore?.op_connector_channels?.find(channel => channel?.code == store?.connector_channel_code)?.logo_asset_url
                                                    return <Col span={12} style={{ textAlign: 'left' }}>
                                                        <Checkbox
                                                            style={{ marginLeft: '18px', display: 'flex', alignItems: 'flex-start' }}
                                                            onChange={() => handleCheckboxChange('chat_stores', store.id)}
                                                            checked={currentSelect.chat_stores.includes(store.id)}
                                                        >
                                                            <img height={16} width={16} src={storeLogo} />
                                                            <Text style={{ marginLeft: '8px' }}>{store?.name}</Text>
                                                        </Checkbox>
                                                    </Col>
                                                })
                                            }
                                        </Row>
                                    </Flex>
                                </>
                            })}
                        </Flex>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card title="Kho hàng" bordered={false} style={{ textAlign: 'center' }}>
                        <Flex vertical gap={10}>
                            <Input
                                placeholder="Tìm kiếm kho hàng"
                                value={searchTermWarehouses}
                                onChange={(e) => setSearchTermWarehouses(e.target.value)}
                            />
                            {filteredWarehouses?.length > 0 && filteredWarehouses?.map((sme: any) => {
                                return <><Checkbox className="bold"
                                    onChange={() => handleSmeCheckboxChange(sme.sme.sme_id, 'warehouses', sme.warehouses)}
                                    checked={isSmeChecked(sme.sme.sme_id, 'warehouses', sme.warehouses)}
                                >{sme?.sme?.email || '--'}</Checkbox>
                                    <Flex>
                                        <div style={{ marginLeft: '12px' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-return-right" viewBox="0 0 16 16">
                                                <path fill-rule="evenodd" d="M1.5 1.5A.5.5 0 0 0 1 2v4.8a2.5 2.5 0 0 0 2.5 2.5h9.793l-3.347 3.346a.5.5 0 0 0 .708.708l4.2-4.2a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 8.3H3.5A1.5 1.5 0 0 1 2 6.8V2a.5.5 0 0 0-.5-.5" />
                                            </svg>
                                        </div>
                                        <Row style={{ width: '100%' }}>
                                            {
                                                sme?.warehouses?.map(wh => {
                                                    return <Col span={24} style={{ textAlign: 'left' }}>
                                                        <Checkbox
                                                            style={{ marginLeft: '10px' }}
                                                            onChange={() => handleCheckboxChange('warehouses', wh.id)}
                                                            checked={currentSelect.warehouses.includes(wh.id)}>{wh?.name}</Checkbox>
                                                    </Col>
                                                })
                                            }
                                        </Row>
                                    </Flex>
                                </>
                            })}
                        </Flex>
                    </Card>
                </Col>
            </Flex>
        </Row>
    </>
};

export default SubUserRole;