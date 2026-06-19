import { useMutation, useQuery } from "@apollo/client";
import { FileExcelTwoTone } from "@ant-design/icons";
import { Button, Col, Form, Input, Modal, Radio, Row, Select, Spin, Table, Typography } from "antd";
import Axios from "axios";
import React, { useRef, useState } from "react";
import mutate_inventoryCountingCreate from "graphql/mutations/mutate_inventoryCountingCreate";
import query_agencyGetSme from "graphql/queries/query_agencyGetSme";
import query_sme_warehouse_list from "graphql/queries/query_sme_warehouse_list";
import { showAlert } from "utils/helper";
import { TEMPLATE_LINKS, TYPE_IMPORT_OPTIONS } from "../constants";

const { Text } = Typography;

interface ImportError {
	row: number;
	code: string;
	reason: string;
}

interface Props {
	open: boolean;
	onClose: () => void;
	onSuccess: (id: number) => void;
}

const CreateWorkDialog = ({ open, onClose, onSuccess }: Props) => {
	const [form] = Form.useForm();
	const inputRef = useRef<HTMLInputElement>(null);

	const [linkFile, setLinkFile] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [uploadLoading, setUploadLoading] = useState(false);
	const [importErrors, setImportErrors] = useState<ImportError[]>([]);
	const [typeImport, setTypeImport] = useState("location_code");

	const { data: warehouseData } = useQuery(query_sme_warehouse_list, {
		fetchPolicy: "cache-and-network",
	});

	const warehouseOptions = (warehouseData?.smeWarehouseByAgency?.data ?? []).map((w: any) => ({
		label: w?.name,
		value: w?.id,
	}));

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e?.target?.files?.[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			showAlert.error("Dung lượng file tối đa 5MB");
			return;
		}
		setUploadLoading(true);
		try {
			const formData = new FormData();
			formData.append("type", "file");
			formData.append("file", file, file.name);
			const res = await Axios.post(`${process.env.REACT_APP_URL_FILE_UPLOAD}`, formData);
			if (res?.data?.success) {
				setLinkFile(res.data.data.source);
				setFileName(file.name);
			} else {
				showAlert.error("Tệp tải lên không thành công");
			}
		} catch {
			showAlert.error("Tệp tải lên không thành công");
		} finally {
			setUploadLoading(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	};

	const [create, { loading: creating }] = useMutation(mutate_inventoryCountingCreate, {
		onCompleted: (data) => {
			const result = data?.inventoryCountingCreate;
			if (!result?.success) {
				showAlert.error(result?.message ?? "Tạo kiểm kê thất bại");
				return;
			}
			const { failCount, errors, id } = result?.data ?? {};
			if (failCount > 0 && errors?.length) {
				setImportErrors(errors);
				return;
			}
			showAlert.success("Tạo kiểm kê thành công");
			onSuccess(id);
		},
		onError: () => showAlert.error("Tạo kiểm kê thất bại"),
        awaitRefetchQueries: true,
        refetchQueries: ['inventoryCountingList']
	});

	const handleOk = async () => {
		const values = await form.validateFields();
		if (!linkFile) {
			showAlert.error("Vui lòng chọn file import");
			return;
		}
		create({
			variables: {
                input: {
                    warehouseId: values?.warehouseId,
                    fileImportLink: linkFile,
                    typeImport: values?.typeImport,
                    note: values.note ?? undefined,
                }
			},
		});
	};

	const handleClose = () => {
		form.resetFields();
		setLinkFile(null);
		setFileName(null);
		setImportErrors([]);
		setTypeImport("location_code");
		onClose();
	};

	const errorColumns = [
		{ title: "Dòng", dataIndex: "row", key: "row", width: 60 },
		{ title: "Mã", dataIndex: "code", key: "code" },
		{ title: "Lý do", dataIndex: "reason", key: "reason" },
	];

	return (
		<Modal
			open={open}
			title="Tạo kiểm kê qua file"
			width={800}
			onCancel={handleClose}
			footer={
				importErrors.length > 0 ? (
					<Button onClick={handleClose}>Đóng</Button>
				) : (
					<>
						<Button onClick={handleClose}>Huỷ</Button>
						<Button type="primary" loading={uploadLoading || creating} disabled={!linkFile} onClick={handleOk}>
							Chấp nhận
						</Button>
					</>
				)
			}
		>
			{importErrors.length > 0 ? (
				<>
					<p>Import có lỗi ở {importErrors.length} dòng. Vui lòng kiểm tra và thử lại.</p>
					<Table rowKey="row" size="small" dataSource={importErrors} columns={errorColumns} pagination={false} scroll={{ y: 240 }} />
				</>
			) : (
				<Form form={form} layout="vertical" initialValues={{ typeImport: "location_code" }}>
					<Form.Item name="warehouseId" label="Kho" rules={[{ required: true, message: "Vui lòng chọn kho" }]}>
						<Select placeholder="Chọn kho" showSearch optionFilterProp="label" options={warehouseOptions} />
					</Form.Item>
					<Form.Item name="typeImport" label="Loại dữ liệu đầu vào">
						<Radio.Group options={TYPE_IMPORT_OPTIONS} onChange={(e) => setTypeImport(e?.target?.value)} />
					</Form.Item>

					<Row style={{ marginBottom: 12, alignItems: "center" }}>
						<Col span={6}>Tải excel mẫu</Col>
						<Col span={18}>
							<a
								href={TEMPLATE_LINKS[typeImport]}
								style={{
									display: "inline-flex",
									alignItems: "center",
									height: 36,
									backgroundColor: "#ff5629",
									color: "#ffffff",
									padding: "0 12px",
									borderRadius: 8,
								}}
							>
								Tải file mẫu tại đây
							</a>
						</Col>
					</Row>
					<Text>
						Tải lên tập tin<Text style={{ color: "red" }}>*</Text>
					</Text>
					<Row style={{ marginBottom: 12 }}>
						<Col
							span={24}
							style={{
								height: 140,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								border: "1px solid rgba(0,0,0,0.2)",
								borderRadius: 5,
							}}
						>
							<input ref={inputRef} accept=".xlsx,.xls" style={{ display: "none" }} type="file" onChange={handleFileChange} />
							<div style={{ textAlign: "center" }}>
								{uploadLoading && <Spin />}
								{!linkFile && !uploadLoading && (
									<>
										<div role="button" onClick={async () => inputRef?.current?.click()}>
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
										<div style={{ fontSize: 14, marginBottom: 8 }}>File dưới 5MB, định dạng xls</div>
									</>
								)}
								{linkFile && !uploadLoading && (
									<div role="button" onClick={() => inputRef?.current?.click()} style={{ cursor: "pointer" }}>
										<FileExcelTwoTone twoToneColor="green" style={{ fontSize: 48 }} />
										<p style={{ fontSize: 13, color: "#888", marginTop: 8 }}>{fileName}</p>
									</div>
								)}
							</div>
						</Col>
					</Row>

					<Form.Item name="note" label="Ghi chú">
						<Input.TextArea maxLength={255} rows={3} showCount placeholder="Nhập ghi chú" />
					</Form.Item>
				</Form>
			)}
		</Modal>
	);
};

export default CreateWorkDialog;
