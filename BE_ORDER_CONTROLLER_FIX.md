# 🔧 BE Order Controller Fix Guide

## ❌ Vấn đề hiện tại:
- Order Controller **không lưu** `customerName`, `tableNumber`, `restaurantId` từ request body
- FE gửi đủ thông tin nhưng BE không nhận

## ✅ Fix Order Controller

### 1️⃣ Update `createOrderFromCart` function:

```javascript
export const createOrderFromCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const subtotal = cart.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );
    const discount = Number(req.body.applyDiscount || 0);
    const tax = 0;
    const total = Math.max(0, subtotal - discount + tax);

    const orderItems = cart.items.map((i) => ({
      menuItemId: i.menuItemId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      notes: i.notes,
      total: i.price * i.quantity,
    }));

    // ✅ THÊM CÁC FIELDS MỚI
    const order = await Order.create({
      userId,
      items: orderItems,
      subtotal,
      discount,
      tax,
      total,
      status: "pending",
      customerName: req.body.customerName || "",      // ✨ TÊN KHÁCH
      tableNumber: req.body.tableNumber || "",        // ✨ SỐ BÀN
      restaurantId: req.body.restaurantId || null,    // ✨ CHI NHÁNH
      region: req.body.region || null,                // ✨ MIỀN
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    console.error("createOrderFromCart error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
```

### 2️⃣ Update `staffGetOrderDetail` - Populate restaurantId:

```javascript
export const staffGetOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    // ✅ POPULATE để lấy tên nhà hàng
    const order = await Order.findById(id).populate('restaurantId', 'name');
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("staffGetOrderDetail error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
```

### 3️⃣ Update `staffListOrders` - Populate restaurantId:

```javascript
export const staffListOrders = async (req, res) => {
  try {
    const { status, q, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (q) {
      filter["items.name"] = { $regex: q, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .populate('restaurantId', 'name')  // ✅ THÊM
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
    ]);

    res.json({ page: Number(page), limit: Number(limit), total, orders });
  } catch (err) {
    console.error("staffListOrders error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
```

## 📋 Update Order Model Schema:

Đảm bảo Order schema có các fields này:

```javascript
const orderSchema = new Schema({
  userId: ObjectId,
  items: [...existing],
  subtotal: Number,
  discount: Number,
  tax: Number,
  total: Number,
  status: String,
  
  // ✅ THÊM CÁC FIELDS MỚI
  customerName: {
    type: String,
    default: ""
  },
  tableNumber: {
    type: String,
    default: ""
  },
  restaurantId: {
    type: ObjectId,
    ref: 'Restaurant',  // Đảm bảo populate được
    default: null
  },
  region: {
    type: String,
    default: null
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});
```

## 🎯 Request/Response Example:

### Request (từ CartPage):
```json
POST /api/orders
{
  "customerName": "Nguyễn Văn A",
  "tableNumber": "A1",
  "restaurantId": "507f1f77bcf86cd799439011",
  "region": "south"
}
```

### Response (từ staffGetOrderDetail):
```json
{
  "_id": "...",
  "userId": "...",
  "items": [...],
  "subtotal": 150000,
  "total": 150000,
  "status": "pending",
  "customerName": "Nguyễn Văn A",      ✅ HIỂN THỊ
  "tableNumber": "A1",                  ✅ HIỂN THỊ
  "restaurantId": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Maison De Flavors"          ✅ HIỂN THỊ
  },
  "region": "south",
  "createdAt": "2025-10-31T..."
}
```

## ✨ FE sẽ nhận và hiển thị:
- **Khách hàng:** `order.customerName`
- **Bàn số:** `order.tableNumber`
- **Chi nhánh:** `order.restaurantId.name`

---

**Sau khi fix BE, FE sẽ tự động hiển thị đúng!** 🚀
