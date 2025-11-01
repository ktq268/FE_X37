import { Form, InputNumber, Select, Button, message } from "antd";
import { createTable, updateTable, updateTableStatusById } from "../../api/api";

const TableForm = ({ restaurantId, initialData, onSuccess }) => {
  const [form] = Form.useForm();
  const token = localStorage.getItem("token");

  const handleSubmit = async (values) => {
    try {
      const { status, ...rest } = values;
      const data = { ...rest, restaurantId };

      if (initialData) {
        await updateTable(initialData._id, data, token);
        if (status && status !== initialData.status) {
          await updateTableStatusById(initialData._id, status, token);
        }
        message.success("Cập nhật bàn thành công!");
      } else {
        await createTable({ ...data, status: status || "available" }, token);
        message.success("Thêm bàn thành công!");
      }

      onSuccess();
    } catch (err) {
      message.error("Không thể lưu bàn");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialData}
      onFinish={handleSubmit}
    >
      <Form.Item
        label="Số bàn"
        name="tableNumber"
        rules={[{ required: true, message: "Vui lòng nhập số bàn" }]}
      >
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        label="Sức chứa"
        name="capacity"
        rules={[{ required: true, message: "Vui lòng nhập sức chứa" }]}
      >
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item 
        label="Trạng thái" 
        name="status"
        extra="Lưu ý: Trạng thái 'Đã đặt' và 'Đang phục vụ' sẽ được tự động cập nhật theo booking"
      >
        <Select
          options={[
            { label: "Trống", value: "available" },
            { label: "Khóa", value: "blocked" },
          ]}
        />
      </Form.Item>

      <Form.Item label="Loại bàn" name="type">
        <Select
          options={[
            { label: "Normal", value: "normal" },
            { label: "VIP", value: "vip" },
          ]}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" block>
        {initialData ? "Cập nhật" : "Thêm mới"}
      </Button>
    </Form>
  );
};

export default TableForm;
