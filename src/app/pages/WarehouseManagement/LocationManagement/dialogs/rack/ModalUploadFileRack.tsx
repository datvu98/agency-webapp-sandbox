import React, { memo, useMemo, useRef, useState } from "react";
import { Button, Col, Modal, Row, Select, Spin, Typography } from "antd";
import { FileExcelTwoTone } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import Axios from "axios";
import { showAlert } from "utils/helper";
import query_locationManagerList from "graphql/queries/query_locationManagerList";
import mutate_locationManagerCreateBulkByFile from "graphql/mutations/mutate_locationManagerCreateBulkByFile";
const { Text } = Typography;
const FILE_IMPORT_STAG = "https://prod-statics.s3.ap-southeast-1.amazonaws.com/template/Stagging/Filemauthemke.xlsx";
const FILE_IMPORT_PROD = "https://prod-statics.s3.ap-southeast-1.amazonaws.com/template/prod/Filemauthemke.xlsx";

const ModalUploadFileRack = ({ currentWh, onHide, onShowModalFileUploadResults }) => {
	const [linkFile, setLinkFile] = useState(null);
	const [currentArea, setCurrentArea] = useState<any>(null);
	const [fileName, setFileName] = useState(null);
	const [loading, setLoading] = useState(false);
	const inputRef = useRef<any>(null);
	const { data: dataArea, loading: loadingDataArea } = useQuery(query_locationManagerList, {
		variables: {
			warehouseId: currentWh?.id,
			isActive: true,
			type: "area",
		},
		fetchPolicy: "cache-and-network",
	});

	const [locationManagerCreateBulkByFile, { loading: loadingLocationManagerCreateBulkByFile }] = useMutation(mutate_locationManagerCreateBulkByFile, {
		awaitRefetchQueries: true,
		refetchQueries: ["locationManagerList"],
	});

	const resetData = () => {
		setLinkFile(null);
		setFileName(null);
		onHide();
	};

	const addLocationByFile = async () => {
		let { data } = await locationManagerCreateBulkByFile({
			variables: {
				created: {
					areaId: currentArea,
					warehouseId: currentWh?.id,
					file: linkFile,
					type: "rack",
				},
			},
		});
		if (data?.locationManagerCreateBulkByFile?.success == 1) {
			resetData();
			onShowModalFileUploadResults(data?.locationManagerCreateBulkByFile);
		} else {
			showAlert.error(data?.locationManagerCreateBulkByFile?.message || "Nhập file thêm kệ không thành công");
		}
	};

	const optionArea = useMemo(() => {
		if (!dataArea?.locationManagerList?.data?.length) return [];
		return dataArea?.locationManagerList?.data?.map((item) => ({
			label: item?.code,
			value: item?.id,
		}));
	}, [dataArea]);

	const handleFileChange = async (event) => {
		const fileObj = event.target.files && event.target.files[0];
		if (!fileObj) {
			return;
		}

		if (event.target.files[0].size > 2 * 1024 * 1024) {
			showAlert.error("Dung lượng file tối đa 2MB");
			return;
		}
		const fileType = event.target.files[0].type;
		if (fileType !== "application/vnd.ms-excel" && fileType !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
			showAlert.error("Chưa đúng định dạng file");
			return;
		}

		setLoading(true);
		try {
			let formData = new FormData();
			formData.append("type", "file");
			formData.append("file", fileObj, fileObj.name);
			let res = await Axios.post(`${process.env.REACT_APP_URL_FILE_UPLOAD}`, formData);
			if (res.data?.success) {
				setLinkFile(res.data?.data.source);
				setFileName(fileObj.name);
			} else {
				showAlert.error("Upload file không thành công.");
			}
		} catch (error) {
			console.log("error", error);
		} finally {
			setLoading(false);
		}
	};

	const fileTemplate = process.env.REACT_APP_MODE === "STAG" ? FILE_IMPORT_STAG : FILE_IMPORT_PROD;

	return (
		<Modal open={!!true} centered title={"Thêm kệ qua file"} onCancel={resetData} footer={null} width={720}>
			<Spin spinning={loadingDataArea || loadingLocationManagerCreateBulkByFile}>
				<Row gutter={[16, 12]}>
					<Col span={6}>
						<Text strong>Mã kho</Text>
					</Col>
					<Col span={18}>{currentWh?.name}</Col>

					<Col span={6}>
						<Text strong>
							Mã khu vực <span className="color-base">*</span>
						</Text>
					</Col>
					<Col span={18}>
						<Select
							placeholder={"Chọn khu vực"}
							options={optionArea}
							loading={loadingDataArea}
							value={currentArea}
							onChange={(value) => {
								setCurrentArea(value);
							}}
							style={{ width: "100%" }}
						/>
					</Col>

					<Col span={6}>
						<Text strong>Tải file mẫu</Text>
					</Col>
					<Col span={18}>
						<a
							href={fileTemplate}
							type="button"
							style={{ display: "inline-flex", alignItems: "center", height: 36, backgroundColor: "#ff5629", color: "#ffffff", borderColor: "#ff5629", padding: "10px", borderRadius: 8 }}
						>
							Tải file mẫu tại đây
						</a>
					</Col>

					<Col span={6}>
						<Text strong>
							Tải tập tin lên <span className="color-base">*</span>
						</Text>
					</Col>
					<Col span={18} style={{ height: 150, alignItems: "center", justifyContent: "center", display: "flex", border: "1px solid rgba(0, 0, 0, 0.2)", borderRadius: 5 }}>
						<input accept=".xlsx, .xls" style={{ display: "none" }} type="file" onChange={handleFileChange} ref={inputRef} />
						<div style={{ textAlign: "center" }}>
							{loading && <span className="spinner "></span>}
							{!linkFile && !loading && (
								<>
									<div role="button" onClick={async () => inputRef.current.click()}>
										<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
											<g clip-path="url(#clip0_1804_188140)">
												<rect width="48" height="48" transform="translate(0 0.000976562)" fill="white" fill-opacity="0.01" />
												<path
													d="M14.9397 12C14.7148 12.0003 14.493 12.0512 14.2904 12.1488C14.0879 12.2464 13.9099 12.3883 13.7697 12.564L4.61965 24H17.9997C18.3975 24 18.779 24.158 19.0603 24.4393C19.3416 24.7206 19.4997 25.1022 19.4997 25.5C19.4997 26.6935 19.9738 27.8381 20.8177 28.682C21.6616 29.5259 22.8062 30 23.9997 30C25.1931 30 26.3377 29.5259 27.1816 28.682C28.0255 27.8381 28.4997 26.6935 28.4997 25.5C28.4997 25.1022 28.6577 24.7206 28.939 24.4393C29.2203 24.158 29.6018 24 29.9997 24H43.3797L34.2297 12.564C34.0894 12.3883 33.9114 12.2464 33.7089 12.1488C33.5063 12.0512 33.2845 12.0003 33.0597 12H14.9397ZM44.8017 27H31.3497C31.0054 28.6954 30.0856 30.2197 28.746 31.3146C27.4065 32.4094 25.7297 33.0075 23.9997 33.0075C22.2696 33.0075 20.5928 32.4094 19.2533 31.3146C17.9137 30.2197 16.9939 28.6954 16.6497 27H3.19765L4.15765 34.686C4.20304 35.0492 4.37969 35.3833 4.65432 35.6254C4.92894 35.8674 5.2826 36.0006 5.64865 36H42.3507C42.7162 35.9999 43.0691 35.8663 43.3431 35.6244C43.6171 35.3824 43.7933 35.0487 43.8387 34.686L44.7987 27H44.8017ZM11.4267 10.689C11.8484 10.1617 12.3835 9.73612 12.9921 9.44374C13.6008 9.15136 14.2674 8.9997 14.9427 9H33.0567C33.7319 8.9997 34.3985 9.15136 35.0072 9.44374C35.6158 9.73612 36.1509 10.1617 36.5727 10.689L47.6727 24.564C47.7974 24.7205 47.8895 24.9005 47.9436 25.0932C47.9977 25.2859 48.0127 25.4874 47.9877 25.686L46.8177 35.058C46.6816 36.1467 46.1525 37.1481 45.3299 37.8741C44.5073 38.6 43.4478 39.0004 42.3507 39H5.64865C4.55152 39.0004 3.49202 38.6 2.6694 37.8741C1.84677 37.1481 1.3177 36.1467 1.18165 35.058L0.0116514 25.686C-0.0129373 25.4872 0.00253271 25.2855 0.0571489 25.0928C0.111765 24.9001 0.204421 24.7203 0.329651 24.564L11.4297 10.689H11.4267Z"
													fill="#0D6EFD"
												/>
											</g>
											<defs>
												<clipPath id="clip0_1804_188140">
													<rect width="48" height="48" fill="white" transform="translate(0 0.000976562)" />
												</clipPath>
											</defs>
										</svg>
									</div>
									<b style={{ fontSize: 16, marginBottom: 8 }}>Click or drag file to this area to upload</b>
									<div style={{ fontSize: 14, marginBottom: 8 }}>File dưới 2MB, định dạng xls</div>
								</>
							)}
							{linkFile && (
								<>
									{/* <i class="fas fa-file-excel mb-4" style={{color: "green",fontSize: 70,}}></i> */}
									<FileExcelTwoTone twoToneColor={"green"} style={{ fontSize: 70 }} />
									<p style={{ fontSize: 14, color: "#888" }}>{fileName}</p>
								</>
							)}
						</div>
					</Col>
				</Row>

				<div style={{ textAlign: "right", marginTop: 24 }}>
					<Button className="btn-base" onClick={resetData} style={{ marginRight: 8 }}>
						Thoát
					</Button>
					<Button className="btn-base" type="primary" onClick={addLocationByFile} disabled={!fileName || !currentArea || loadingLocationManagerCreateBulkByFile}>
						Đồng ý
					</Button>
				</div>
			</Spin>
		</Modal>
	);
};

export default memo(ModalUploadFileRack);
