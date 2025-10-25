import { useState, useEffect } from "react";
import { Select, Table, Button, Tag, Modal, message, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { getTables, updateTableStatusById, createTable, deleteTable, updateTable } from "../../api/api";
import { getRestaurants } from "../../api/api";
import TableForm from "./TableForm";

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [region, setRegion] = useState("");

  const token = localStorage.getItem("token");

  const fetchRestaurants = async (selectedRegion) => {
    try {
      const query = selectedRegion ? { region: selectedRegion } : {};
      const res = await getRestaurants(query);
      if (res) {
        setRestaurants(res);
      } else {
        setRestaurants([]);
      }
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách chi nhánh");
    }
  };

  const fetchTables = async () => {
    if (!selectedRestaurant) return;
    try {
      setLoading(true);
      const res = await getTables({ restaurantId: selectedRestaurant }, token);
      setTables(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách bàn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants(region);
    setSelectedRestaurant(null); // Reset selected restaurant when region changes
  }, [region]);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchTables();
    }
  }, [selectedRestaurant]);

  const handleDelete = async (id) => {
    try {
      await deleteTable(id, token);
      message.success("Xóa bàn thành công!");
      fetchTables();
    } catch (err) {
      console.error(err);
      message.error("Không thể xóa bàn");
    }
  };

  const handleEdit = (record) => {
    setEditingTable(record);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    fetchRestaurants(region);
    if (selectedRestaurant) {
      fetchTables();
    }
  };

  const columns = [
    { title: "Số bàn", dataIndex: "tableNumber", key: "tableNumber" },
    { title: "Sức chứa", dataIndex: "capacity", key: "capacity" },
    {
      title: "Loại bàn",
      dataIndex: "type",
      key: "type",
      render: (val) => (
        <Tag color={val === "vip" ? "gold" : "blue"}>
          {val === "vip" ? "VIP" : "Normal"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (val) =>
        val === "available" ? (
          <Tag color="green">Trống</Tag>
        ) : val === "reserved" ? (
          <Tag color="blue">Đã đặt</Tag>
        ) : val === "occupied" ? (
          <Tag color="red">Đang phục vụ</Tag>
        ) : (
          <Tag color="gray">Khóa</Tag>
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
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">🪑 Quản lý bàn</h2>
        <div className="flex gap-2 items-center">
          <Select
            placeholder="Chọn miền"
            style={{ width: 120 }}
            onChange={(value) => setRegion(value)}
            value={region}
            options={[
              { value: "", label: "Tất cả miền" },
              { value: "north", label: "Miền Bắc" },
              { value: "central", label: "Miền Trung" },
              { value: "south", label: "Miền Nam" },
            ]}
          />
          <Select
            placeholder="Chọn chi nhánh"
            style={{ width: 200 }}
            value={selectedRestaurant}
            onChange={setSelectedRestaurant}
            options={restaurants.map((r) => ({
              label: r.name,
              value: r._id,
            }))}
            disabled={!region}
          />
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTable(null);
              setIsModalOpen(true);
            }}
            disabled={!selectedRestaurant}
          >
            Thêm bàn
          </Button>
        </div>
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
        title={editingTable ? "Sửa bàn" : "Thêm bàn mới"}
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        destroyOnHidden
      >
        <TableForm
          restaurantId={selectedRestaurant}
          initialData={editingTable}
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
