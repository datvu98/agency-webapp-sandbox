import Axios from "axios";
import { useCallback } from "react";
import { showAlert } from "utils/helper";

function useUploadImage() {
  const uploadImage = useCallback(async (file: File): Promise<string> => {
    if (file.size > 10 * 1024 * 1024) {
      showAlert.error("Dung lượng file tối đa 10MB");
      throw new Error("File too large");
    }

    const formData = new FormData();
    formData.append("type", "file");
    formData.append("file", file, file.name);

    const res = await Axios.post(
      `${process.env.REACT_APP_URL_FILE_UPLOAD}`,
      formData,
    );

    if (res.data?.success) {
      return res.data.data.source;
    }

    showAlert.error(res.data?.message || "Tệp tải lên không thành công");
    throw new Error("Upload failed");
  }, []);

  return { uploadImage };
}

export { useUploadImage };
