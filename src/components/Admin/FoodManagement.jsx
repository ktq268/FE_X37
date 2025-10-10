import { useState, useEffect } from "react";
import { Table, Button, Tag, Modal, message, Space, Switch, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../api/api";
import MenuForm from "./MenuForm";

const FoodManagement = () => {
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");
  const [deleteId, setDeleteId] = useState(null);


  // 🚀 Lấy danh sách món ăn
  const fetchMenu = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await getMenuItems({}, token);
      const items = Array.isArray(res.items) ? res.items : [];
      setMenu(items);
      setFilteredMenu(items);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách món ăn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // 🟣 Lọc theo loại
  useEffect(() => {
    let data = [...menu];

    if (categoryFilter !== "all") {
      data = data.filter((item) => item.category === categoryFilter);
    }

    if (sortOrder === "asc") {
      data.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      data.sort((a, b) => b.price - a.price);
    }

    setFilteredMenu(data);
  }, [categoryFilter, sortOrder, menu]);

  // 🟢 Toggle trạng thái
  const handleToggleStatus = async (id, currentStatus) => {
    const token = localStorage.getItem("token");
    const newStatus = !currentStatus;

    try {
      await updateMenuItem(id, { isAvailable: newStatus }, token);
      message.success(
        `Đã đổi trạng thái thành "${newStatus ? "Còn hàng" : "Hết hàng"}"`
      );
      setMenu((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isAvailable: newStatus } : item
        )
      );
    } catch (err) {
      console.error(err);
      message.error("Không thể đổi trạng thái món ăn");
    }
  };

  // 🗑️ Xóa món ăn
  const handleDelete = (id) => {
    setDeleteId(id);
  };
  

  // 🧾 Lưu dữ liệu sau khi thêm/sửa
  const handleSave = async (values) => {
    const token = localStorage.getItem("token");
    try {
      if (editingItem) {
        await updateMenuItem(editingItem._id, values, token);
        message.success("Cập nhật món ăn thành công!");
      } else {
        await createMenuItem(values, token);
        message.success("Thêm món ăn thành công!");
      }
      setIsModalOpen(false);
      fetchMenu();
    } catch (err) {
      console.error(err);
      message.error("Không thể lưu món ăn");
    }
  };

  // 🧱 Cấu trúc bảng
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="food"
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <span className="text-gray-400">Không có ảnh</span>
        ),
    },
    { title: "Tên món", dataIndex: "name", key: "name" },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toLocaleString()} đ`,
    },
    { title: "Loại", dataIndex: "category", key: "category" },
    {
      title: "Trạng thái",
      dataIndex: "isAvailable",
      key: "isAvailable",
      render: (val) => (
        <Tag color={val ? "green" : "volcano"}>
          {val ? "Còn hàng" : "Hết hàng"}
        </Tag>
      ),
    },
    {
      title: "Đổi trạng thái",
      key: "toggle",
      render: (_, record) => (
        <Switch
          checked={record.isAvailable}
          checkedChildren="Còn"
          unCheckedChildren="Hết"
          onChange={() => handleToggleStatus(record._id, record.isAvailable)}
        />
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
            onClick={() => {
              setEditingItem(record);
              setIsModalOpen(true);
            }}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() =>{
              console.log(record._id);
              handleDelete(record._id);
            }}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // 🔄 Tập hợp các loại món để filter
  const categories = ["all", ...new Set(menu.map((m) => m.category))];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">🍽️ Quản lý món ăn</h2>
        <Space>
          <Select
            value={categoryFilter}
            onChange={(val) => setCategoryFilter(val)}
            style={{ width: 150 }}
            options={categories.map((c) => ({
              label: c === "all" ? "Tất cả" : c,
              value: c,
            }))}
          />
          <Select
            value={sortOrder}
            onChange={(val) => setSortOrder(val)}
            style={{ width: 150 }}
            options={[
              { label: "Không sắp xếp", value: "none" },
              { label: "Giá tăng dần", value: "asc" },
              { label: "Giá giảm dần", value: "desc" },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchMenu}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
          >
            Thêm món ăn
          </Button>
        </Space>
      </div>

      {/* Bảng */}
      <Table
        columns={columns}
        dataSource={filteredMenu}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 6 }}
        bordered
        className="shadow-md rounded"
      />

      <Modal
        title="Xác nhận xóa món ăn"
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onOk={async () => {
          try {
            const token = localStorage.getItem("token");
            await deleteMenuItem(deleteId, token);
            message.success("Xóa món thành công!");
            setMenu((prev) => prev.filter((item) => item._id !== deleteId));
            setDeleteId(null);
          } catch (err) {
            console.error("❌ Delete failed:", err);
            message.error("Không thể xóa món ăn");
          }
        }}
        okText="Xóa"
        okType="danger"
        cancelText="Hủy"
      />
      

      {/* Modal thêm / sửa */}
      <Modal
        title={editingItem ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <MenuForm
          initialValues={editingItem}
          onSubmit={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default FoodManagement;
