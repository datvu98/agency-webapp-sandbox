import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Spin, Tooltip, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import styled from "styled-components";

const EditorWrapper = styled.div`
  .ql-editor {
    max-height: 400px;
    overflow-y: auto;
  }
`;

type Props = {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  copyable?: boolean;
  copyType?: "text" | "html";
  style?: React.CSSProperties;
} & React.ComponentProps<typeof ReactQuill>;

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "indent",
  "align",
  "color",
  "background",
  "link",
  "image",
  "video",
  "code",
  "clean",
];

const TOOLBAR_TOOLTIPS: Record<string, string> = {
  bold: "In đậm",
  italic: "In nghiêng",
  underline: "Gạch chân",
  strike: "Gạch ngang",
  link: "Chèn liên kết",
  image: "Chèn hình ảnh",
  video: "Chèn video",
  clean: "Xóa format",
  list: "Danh sách",
  bullet: "Danh sách bullet",
  indent: "Thụt lề",
  align: "Căn lề",
  color: "Màu chữ",
  background: "Màu nền",
  header: "Tiêu đề",
  font: "Font chữ",
  size: "Kích thước chữ",
};

const TextEditor: React.FC<Props> = ({
  value,
  onChange,
  placeholder,
  onUploadImage,
  style,
  copyable = false,
  copyType = "text",
  ...rest
}) => {
  const quillRef = useRef<ReactQuill | null>(null);
  const [uploading, setUploading] = useState(false);

  // ================================
  // COPY CONTENT
  // ================================
  const handleCopy = useCallback(async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    try {
      let content = "";

      if (copyType === "html") {
        content = quill.root.innerHTML;
      } else {
        content = quill.getText();
      }

      await navigator.clipboard.writeText(content.trim());
      message.success("Đã copy nội dung");
    } catch {
      message.error("Copy thất bại");
    }
  }, [copyType]);

  // ================================
  // IMAGE UPLOAD HANDLER
  // ================================
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !onUploadImage) return;

      const quill = quillRef.current?.getEditor();
      if (!quill) return;

      const range = quill.getSelection(true);
      const index = range ? range.index : 0;

      setUploading(true);
      try {
        const url = await onUploadImage(file);

        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        editor.insertEmbed(index, "image", url);
        editor.setSelection(index + 1, 0);
      } catch {
        message.error("Upload ảnh thất bại");
      } finally {
        setUploading(false);
      }
    };
  }, [onUploadImage]);

  // ================================
  // FULL TOOLBAR CONFIG
  // ================================
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ font: [] }, { size: [] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
          ],
          ["link", "image"],
          // ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [imageHandler]
  );

  // ================================
  // ADD TOOLTIP TO TOOLBAR ICONS
  // ================================
  useEffect(() => {
    const toolbar = document.querySelector(".ql-toolbar");
    if (!toolbar) return;

    const elements = toolbar.querySelectorAll(
      "button, .ql-picker"
    );

    elements.forEach((el) => {
      const classList = Array.from(el.classList);
      const qlClass = classList.find((cls) =>
        cls.startsWith("ql-")
      );

      if (!qlClass) return;

      const key = qlClass.replace("ql-", "");
      const label = TOOLBAR_TOOLTIPS[key];

      if (label) {
        (el as HTMLElement).title = label;
      }
    });
  }, []);

  return (
    <div style={{ position: "relative" }}>
      {/* Copy Button */}
      {copyable && (
        <Tooltip title="Copy nội dung">
          <CopyOutlined
            onClick={handleCopy}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              cursor: "pointer",
              color: "#8c8c8c",
              fontSize: 16,
              zIndex: 11,
            }}
          />
        </Tooltip>
      )}

      {/* Editor */}
      <EditorWrapper>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value || ""}
          modules={modules}
          formats={formats}
          onChange={onChange}
          placeholder={placeholder}
          style={style}
          {...rest}
        />
      </EditorWrapper>

      {/* Upload Overlay */}
      {uploading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.6)",
            zIndex: 10,
          }}
        >
          <Spin />
        </div>
      )}
    </div>
  );
};

export { TextEditor };