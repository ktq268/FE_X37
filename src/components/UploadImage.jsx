import { useState } from "react";
import { Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const UploadImage = ({ onUploaded }) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/api/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Tải ảnh thành công!");
      onUploaded(res.data.url);
    } catch (err) {
      message.error("Upload thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Upload
      customRequest={handleUpload}
      listType="picture-card"
      showUploadList={false}
    >
      {loading ? "Đang tải..." : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </Upload>
  );
};

export default UploadImage;
