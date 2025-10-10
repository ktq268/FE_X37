import { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, Button, Switch, message } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import UploadImage from "../UploadImage";
import { createMenuItem, updateMenuItem } from "../../api/api";

const { TextArea } = Input;

const categories = [
  "Món chính",
  "Món Á",
  "Súp",
  "Đồ uống",
  "Tráng miệng",
  "Khai vị",
];

const MenuForm = ({ initialValues, onSuccess }) => {
  const [form] = Form.useForm();
  const [imageList, setImageList] = useState(
    Array.isArray(initialValues?.imageUrl)
      ? initialValues.imageUrl
      : initialValues?.imageUrl
      ? [initialValues.imageUrl]
      : []
  );

  // 🌀 Gán giá trị mặc định khi sửa
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      if (Array.isArray(initialValues.imageUrl)) {
        setImageList(initialValues.imageUrl);
      } else if (initialValues.imageUrl) {
        setImageList([initialValues.imageUrl]);
      } else {
        setImageList([]);
      }
    } else {
      form.resetFields();
      setImageList([]);
    }
  }, [initialValues, form]);

  // 🖼️ Khi upload ảnh xong
  const handleImageUploaded = (url) => {
    setImageList((prev) => [...prev, url]);
  };

  // ❌ Xóa 1 ảnh khỏi danh sách
  const handleRemoveImage = (url) => {
    setImageList((prev) => prev.filter((img) => img !== url));
  };

  // 💾 Submit form
  const handleSubmit = async (values) => {
    const token = localStorage.getItem("token");
    const payload = { ...values, imageUrl: imageList };

    try {
      if (initialValues?._id) {
        await updateMenuItem(initialValues._id, payload, token);
        message.success("Cập nhật món ăn thành công!");
      } else {
        await createMenuItem(payload, token);
        message.success("Thêm món ăn thành công!");
      }

      form.resetFields();
      setImageList([]);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error:", err);
      message.error("Không thể lưu món ăn!");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ isAvailable: true }}
    >
      <Form.Item
        label="Tên món"
        name="name"
        rules={[{ required: true, message: "Vui lòng nhập tên món ăn!" }]}
      >
        <Input placeholder="Nhập tên món" />
      </Form.Item>

      <Form.Item label="Mô tả" name="description">
        <TextArea rows={3} placeholder="Nhập mô tả" />
      </Form.Item>

      <Form.Item
        label="Giá (VND)"
        name="price"
        rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
      >
        <InputNumber
          min={0}
          step={1000}
          className="w-full"
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        />
      </Form.Item>

      <Form.Item
        label="Phân loại"
        name="category"
        rules={[{ required: true, message: "Vui lòng chọn loại món!" }]}
      >
        <Select placeholder="Chọn loại món">
          {categories.map((c) => (
            <Select.Option key={c} value={c}>
              {c}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      {/* 🖼️ Upload và quản lý danh sách ảnh */}
      <Form.Item label="Ảnh món ăn">
        <UploadImage onUploaded={handleImageUploaded} />
        {imageList.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {imageList.map((url) => (
              <div key={url} className="relative w-24 h-24">
                <img
                  src={url}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded"
                />
                <CloseCircleOutlined
                  className="absolute top-0 right-0 text-red-500 bg-white rounded-full cursor-pointer"
                  onClick={() => handleRemoveImage(url)}
                />
              </div>
            ))}
          </div>
        )}
      </Form.Item>

      <Form.Item label="Có sẵn" name="isAvailable" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          {initialValues ? "Cập nhật món ăn" : "Thêm món ăn"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default MenuForm;
