import { DownOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Col, Dropdown, Flex, Input, Row, Space, Spin, Table, Tooltip, Typography } from "antd";
import { MenuProps } from "antd/lib/menu";
import Pagination from "app/components/Pagination";
import dayjs from "dayjs";
import _ from "lodash";
import queryString from "querystring";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { showAlert } from "utils/helper";
import ModalUpdatePackStation from "../dialogs/ModalUpdatePackStation";
const { Text } = Typography;

const GeneralInfo = ({currentWorkStation}) => {
    const [showUpdate, setShowUpdate] = useState({
        show: false,
        name: ''
    })
    const handleOnUpdate = useCallback(() => {
        setShowUpdate({
            show: true,
            name: currentWorkStation?.name
        })
    }, [currentWorkStation])
	return (
		<Spin spinning={false}>
            {showUpdate?.show && <ModalUpdatePackStation 
                show={showUpdate?.show}
                name={showUpdate?.name}
                onHide={() => {
                    setShowUpdate({
                        show: false,
                        name: ''
                    })
                }}
            />}
			<Flex justify="end" gap={10} align="center">
				<Text style={{ fontSize: 16 }}>Trạm đóng gói:</Text>
				<Text className="cursor-pointer" style={{ fontSize: 16 }} onClick={handleOnUpdate}>
					{currentWorkStation?.name}
				</Text>
				<Text className="cursor-pointer" style={{ fontSize: 16 }} onClick={handleOnUpdate}>
					<EditOutlined />
				</Text>
			</Flex>
		</Spin>
	);
};

export default GeneralInfo;
