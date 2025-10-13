# Tính năng Badge Giỏ hàng

## Mô tả

Tính năng này thêm một badge thông báo số lượng món trong giỏ hàng trên navigation bar. Khi người dùng thêm món vào giỏ hàng, badge sẽ hiển thị số lượng món và có hiệu ứng animation.

## Các thành phần đã thêm/cập nhật

### 1. CartContext (`src/contexts/CartContext.jsx`)

- Quản lý state của giỏ hàng toàn cục
- Hỗ trợ cả đăng nhập và chưa đăng nhập
- Tự động sync giữa server và localStorage
- Tính toán tổng số lượng món trong giỏ hàng

### 2. CartBadge Component (`src/components/CartBadge/CartBadge.jsx`)

- Component hiển thị icon giỏ hàng với badge số lượng
- Badge chỉ hiển thị khi có món trong giỏ hàng
- Có hiệu ứng animation và shadow
- Hỗ trợ số lượng lớn (hiển thị "99+" nếu > 99)

### 3. Toast System

- **Toast Component** (`src/components/Toast/Toast.jsx`): Component hiển thị thông báo
- **ToastContext** (`src/contexts/ToastContext.jsx`): Quản lý các thông báo toast
- Hiển thị thông báo khi thêm món vào giỏ hàng

### 4. Cập nhật các component hiện có

#### Header (`src/components/Header/Header.jsx`)

- Thay thế icon giỏ hàng cũ bằng CartBadge component
- Badge tự động cập nhật khi có thay đổi trong giỏ hàng

#### MenuPage (`src/pages/MenuPage.jsx`)

- Sử dụng CartContext thay vì logic localStorage trực tiếp
- Hiển thị toast thông báo khi thêm món vào giỏ hàng
- Tự động cập nhật badge sau khi thêm món

#### CartPage (`src/pages/CartPage.jsx`)

- Sử dụng CartContext để quản lý giỏ hàng
- Tự động cập nhật badge khi thay đổi số lượng hoặc xóa món

#### App.jsx

- Wrap toàn bộ ứng dụng với CartProvider và ToastProvider

## Tính năng chính

### 1. Badge thông báo

- Hiển thị số lượng món trong giỏ hàng
- Chỉ hiển thị khi có món (totalItems > 0)
- Có hiệu ứng pulse animation
- Hỗ trợ số lượng lớn (99+)

### 2. Tự động cập nhật

- Badge tự động cập nhật khi:
  - Thêm món vào giỏ hàng
  - Thay đổi số lượng món
  - Xóa món khỏi giỏ hàng
  - Xóa toàn bộ giỏ hàng

### 3. Thông báo toast

- Hiển thị thông báo khi thêm món vào giỏ hàng
- Tự động ẩn sau 3 giây
- Có thể đóng thủ công

### 4. Hỗ trợ đa trạng thái

- Hoạt động khi đã đăng nhập (sync với server)
- Hoạt động khi chưa đăng nhập (localStorage)
- Tự động fallback khi API lỗi

## Cách sử dụng

### Trong component

```jsx
import { useCart } from "../contexts/CartContext";
import { useToast } from "../contexts/ToastContext";

function MyComponent() {
  const { addToCart, totalItems } = useCart();
  const { showSuccess } = useToast();

  const handleAddToCart = async (item) => {
    await addToCart(item, 1);
    showSuccess(`${item.name} đã được thêm vào giỏ hàng!`);
  };
}
```

### Hiển thị badge

```jsx
import CartBadge from "../components/CartBadge/CartBadge";

function Header() {
  return (
    <div>
      <CartBadge />
    </div>
  );
}
```

## Styling

Badge sử dụng Tailwind CSS với các class:

- `bg-red-500`: Màu nền đỏ
- `text-white`: Màu chữ trắng
- `animate-pulse`: Hiệu ứng nhấp nháy
- `shadow-lg`: Đổ bóng
- `rounded-full`: Bo tròn

## Lưu ý kỹ thuật

1. **Performance**: Context được tối ưu để tránh re-render không cần thiết
2. **Error Handling**: Có fallback khi API lỗi
3. **Storage Sync**: Tự động sync giữa các tab browser
4. **Responsive**: Badge hoạt động tốt trên mọi kích thước màn hình
