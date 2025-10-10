import { useState, useEffect } from "react";
import { Table, Button, Popconfirm, Tag, message } from "antd";
import { getMenuItems, deleteMenuItem } from "../../api/api";

const MenuList = () => {
  const [menu, setMenu] = useState([]);

  const fetchMenu = async () => {
    try {
      const res = await getMenuItems();
      setMenu(res.data);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách món ăn");
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id);
      message.success("Xóa món thành công!");
      fetchMenu();
    } catch (err) {
      console.error(err);
      message.error("Không thể xóa món ăn");
    }
  };

  const columns = [
    { title: "Tên món", dataIndex: "name", key: "name" },
    { title: "Giá (VND)", dataIndex: "price", key: "price" },
    { title: "Loại", dataIndex: "category", key: "category" },
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      render: (url) => <img src={url} alt="" className="w-16 h-16 object-cover" />,
    },
    {
      title: "Trạng thái",
      dataIndex: "isAvailable",
      render: (val) => (val ? <Tag color="green">Có sẵn</Tag> : <Tag color="red">Hết</Tag>),
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc muốn xóa món này?"
          onConfirm={() => handleDelete(record._id)}
        >
          <Button danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return <Table dataSource={menu} columns={columns} rowKey="_id" />;
};

export default MenuList;
