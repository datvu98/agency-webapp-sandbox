import Axios from "axios";
import { useCallback, useState } from "react";
import { showAlert } from "utils/helper";

const MAX_SIZE_MB = 5;

function useUploadFile() {
  const [loading, setLoading] = useState(false);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      showAlert.error(`Dung lượng file tối đa ${MAX_SIZE_MB}MB`);
      throw new Error("File too large");
    }

    const formData = new FormData();
    formData.append("type", "file");
    formData.append("file", file, file.name);

    setLoading(true);
    try {
      const res = await Axios.post(`${process.env.REACT_APP_URL_FILE_UPLOAD}`, formData);
      if (res.data?.success) return res.data.data.source;
      showAlert.error("Tệp tải lên không thành công");
      throw new Error("Upload failed");
    } catch {
      showAlert.error("Tệp tải lên không thành công");
      throw new Error("Upload failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return { uploadFile, loading };
}

export { useUploadFile };
