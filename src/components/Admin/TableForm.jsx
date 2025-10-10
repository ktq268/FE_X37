import { useState } from "react";
import { Form, InputNumber, Select, Button, message } from "antd";
import { createTable } from "../../api/api";

const { Option } = Select;

const TableForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await createTable(values, token);
      message.success("Thêm bàn mới thành công!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      message.error("Không thể thêm bàn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      {/* Số bàn */}
      <Form.Item
        name="tableNumber"
        label="Số bàn"
        rules={[{ required: true, message: "Nhập số bàn!" }]}
      >
        <InputNumber min={1} className="w-full" />
      </Form.Item>

      {/* Sức chứa */}
      <Form.Item
        name="capacity"
        label="Sức chứa"
        rules={[{ required: true, message: "Nhập sức chứa!" }]}
      >
        <InputNumber min={1} className="w-full" />
      </Form.Item>

      {/* Trạng thái */}
      <Form.Item
        name="status"
        label="Trạng thái"
        initialValue="available"
        rules={[{ required: true, message: "Chọn trạng thái bàn!" }]}
      >
        <Select>
          <Option value="available">Trống</Option>
          <Option value="reserved">Đã đặt</Option>
          <Option value="occupied">Đang phục vụ</Option>
        </Select>
      </Form.Item>

      {/* Submit */}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Thêm bàn
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TableForm;
