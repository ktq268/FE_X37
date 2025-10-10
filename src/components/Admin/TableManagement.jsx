import { useEffect, useState } from "react";
import { Table, Button, Tag, Modal, message, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getTables, updateTableStatusById } from "../../api/api";
import TableForm from "./TableForm";

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await getTables({}, token);
      setTables(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách bàn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await updateTableStatusById(id, status, token);
      message.success("Cập nhật trạng thái thành công!");
      fetchTables();
    } catch (err) {
      console.error(err);
      message.error("Không thể cập nhật trạng thái bàn");
    }
  };

  const columns = [
    { title: "Số bàn", dataIndex: "tableNumber", key: "tableNumber" },
    { title: "Sức chứa", dataIndex: "capacity", key: "capacity" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (val) =>
        val === "available" ? (
          <Tag color="green">Trống</Tag>
        ) : val === "reserved" ? (
          <Tag color="blue">Đã đặt</Tag>
        ) : (
          <Tag color="red">Đang phục vụ</Tag>
        ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => message.info(`Sửa: ${record.tableNumber}`)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleUpdateStatus(record._id, "available")}
          >
            Reset
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">🪑 Quản lý bàn</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Thêm bàn
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tables}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 6 }}
        bordered
        className="shadow-md rounded"
      />

      <Modal
        title="Thêm bàn mới"
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <TableForm
          onSuccess={() => {
            setIsModalOpen(false);
            fetchTables();
          }}
        />
      </Modal>
    </div>
  );
};

export default TableManagement;
