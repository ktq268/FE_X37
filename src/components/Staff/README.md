# Staff Components

Thư mục này chứa các component đã được tách từ `staffPage.jsx` để dễ quản lý và bảo trì.

## Cấu trúc Components

### 1. HeaderComponent.jsx
- **Mục đích**: Component header chung cho tất cả các trang
- **Props**: 
  - `selectedRestaurant`: Thông tin nhà hàng được chọn
  - `currentDateTime`: Thời gian hiện tại
  - `staffInfo`: Thông tin nhân viên
  - `onLogout`: Function xử lý đăng xuất

### 2. OrdersPage.jsx
- **Mục đích**: Trang quản lý orders
- **Props**: 
  - `selectedRestaurant`, `currentDateTime`, `staffInfo`, `onLogout`
  - `errorMessage`: Thông báo lỗi
  - `filterStatus`: Trạng thái filter hiện tại
  - `onFilterChange`: Function thay đổi filter
  - `loadingOrders`: Trạng thái loading
  - `filteredOrders`: Danh sách orders đã filter
  - `statusConfig`: Cấu hình màu sắc cho các trạng thái
  - `onOrderClick`: Function xử lý click vào order
  - `onRefreshOrders`: Function làm mới danh sách orders
  - `currentOrdersTable`: Bàn hiện tại đang xem orders

### 3. TablesPage.jsx
- **Mục đích**: Trang quản lý bàn
- **Props**: 
  - Các props cơ bản như OrdersPage
  - `loadingTables`: Trạng thái loading bàn
  - `tables`: Danh sách bàn
  - `tableStatusConfig`: Cấu hình màu sắc cho trạng thái bàn
  - `selectedRegion`, `selectedDate`: Filter theo miền và ngày
  - `onRegionChange`, `onRestaurantChange`, `onDateChange`: Functions xử lý thay đổi filter
  - `onTableClick`: Function xử lý click vào bàn
  - `onRefreshTables`: Function làm mới danh sách bàn
  - `getUniqueRegions`, `getRestaurantsByRegion`: Functions helper

### 4. InvoicePage.jsx
- **Mục đích**: Trang hóa đơn thanh toán
- **Props**: 
  - Các props cơ bản
  - `selectedOrder`: Order được chọn để thanh toán
  - `orders`: Danh sách orders
  - `onRefreshOrders`: Function làm mới orders
  - `onUpdateOrderStatus`: Function cập nhật trạng thái order

### 5. TableModal.jsx
- **Mục đích**: Modal quản lý bàn (đặt bàn, thay đổi trạng thái)
- **Props**: 
  - `showTableModal`: Hiển thị modal
  - `selectedTable`: Bàn được chọn
  - `selectedDate`: Ngày được chọn
  - `selectedRestaurant`: Nhà hàng được chọn
  - `tableStatusConfig`: Cấu hình trạng thái bàn
  - `orders`: Danh sách orders
  - `onClose`: Function đóng modal
  - `onChangeTableStatus`: Function thay đổi trạng thái bàn
  - `onRefreshOrdersForTable`: Function làm mới orders của bàn
  - `onUpdateBookingStatus`: Function cập nhật trạng thái booking
  - `onCreateBookingForTable`: Function tạo booking cho bàn
  - `onLoadTableBookingInfo`: Function load thông tin booking của bàn

### 6. OrderDetailModal.jsx
- **Mục đích**: Modal hiển thị chi tiết order
- **Props**: 
  - `showOrderDetailModal`: Hiển thị modal
  - `selectedOrder`: Order được chọn
  - `statusConfig`: Cấu hình trạng thái
  - `onClose`: Function đóng modal
  - `onUpdateOrderStatus`: Function cập nhật trạng thái order
  - `onGoToInvoice`: Function chuyển đến trang hóa đơn

### 7. Navigation.jsx
- **Mục đích**: Thanh navigation dưới cùng
- **Props**: 
  - `currentPage`: Trang hiện tại
  - `onPageChange`: Function thay đổi trang
  - `pendingCount`: Số lượng thông báo chờ xử lý
  - `orders`: Danh sách orders

### 8. CompactOrderCard.jsx
- **Mục đích**: Component hiển thị order card nhỏ gọn
- **Props**: 
  - `order`: Thông tin order
  - `statusConfig`: Cấu hình trạng thái
  - `onOrderClick`: Function xử lý click vào order

## Lợi ích của việc tách component

1. **Dễ bảo trì**: Mỗi component có trách nhiệm riêng biệt
2. **Tái sử dụng**: Các component có thể được sử dụng ở nhiều nơi
3. **Dễ test**: Có thể test từng component riêng lẻ
4. **Code gọn gàng**: File chính ngắn gọn, dễ đọc
5. **Phân chia trách nhiệm**: Mỗi component chỉ xử lý một phần logic cụ thể

## Cách sử dụng

```jsx
import {
  OrdersPage,
  TablesPage,
  InvoicePage,
  TableModal,
  OrderDetailModal,
  Navigation
} from '../components/Staff';
```

Hoặc import từng component riêng lẻ:

```jsx
import OrdersPage from '../components/Staff/OrdersPage.jsx';
```
