# Cải tiến Logic Đặt Bàn - Restaurant Management System

## Tổng quan
Đã thêm logic xử lý thời gian cho việc đặt bàn và cải thiện thông báo cho staff với các tính năng sau:

## 🚀 Các tính năng mới

### 1. Validation Thời Gian Đặt Bàn (BookingPage.jsx)
- **Kiểm tra thời gian quá khứ**: Không cho phép đặt bàn trong quá khứ
- **Giới hạn thời gian**: Không thể đặt bàn quá 30 ngày trước
- **Giờ mở cửa**: Chỉ cho phép đặt bàn từ 8:00 đến 22:00
- **Hiển thị lỗi real-time**: Thông báo lỗi ngay khi người dùng nhập thời gian không hợp lệ
- **Disable button**: Nút "Kiểm tra bàn trống" bị vô hiệu hóa khi thời gian không hợp lệ

### 2. Cải thiện Thông báo Staff (NotificationsPage.jsx)
- **Phân loại theo thời gian**:
  - 🔴 **Quá hạn**: Đặt bàn đã qua thời gian
  - 🟠 **Gấp**: Đặt bàn trong vòng 1 giờ
  - 🔵 **Hôm nay**: Đặt bàn trong ngày
  - 🟢 **Tương lai**: Đặt bàn trong tương lai
- **Hiển thị thông tin chi tiết**: Tên chi nhánh, thời gian chính xác
- **Cảnh báo trực quan**: Icon cảnh báo cho các trường hợp khẩn cấp
- **Button động**: Thay đổi màu sắc và text dựa trên trạng thái thời gian

### 3. Quản lý Bàn theo Thời gian (staffPage.jsx)
- **Lọc theo ngày/giờ**: Staff có thể xem trạng thái bàn tại thời điểm cụ thể
- **Cập nhật real-time**: Tự động refresh khi thay đổi thời gian
- **Hiển thị thông tin chi tiết**: Ngày, giờ, chi nhánh đang xem

### 4. Lịch Đặt Bàn (BookingCalendar.jsx)
- **Component mới**: Hiển thị tất cả đặt bàn theo ngày/giờ
- **Phân loại trạng thái**: Màu sắc khác nhau cho từng trạng thái
- **Thông tin đầy đủ**: Tên khách, số điện thoại, email, ghi chú
- **Tương tác**: Click để xem chi tiết đặt bàn

### 5. API Endpoints mới (api.js)
- `getBookingsByDate()`: Lấy booking theo ngày và giờ
- `getBookingsByRestaurant()`: Lấy booking theo nhà hàng

## 🎯 Logic Xử lý Thời gian

### Validation Rules
```javascript
// Không được trong quá khứ
if (selectedDate <= now) return false;

// Không được quá 30 ngày
if (selectedDate > maxDate) return false;

// Chỉ trong giờ mở cửa (8:00 - 22:00)
if (hour < 8 || hour > 22) return false;
```

### Phân loại Thời gian
```javascript
const hoursDiff = (bookingDateTime - now) / (1000 * 60 * 60);

if (hoursDiff < 0) return 'overdue';      // Quá hạn
if (hoursDiff < 1) return 'urgent';       // Gấp
if (hoursDiff < 24) return 'today';       // Hôm nay
return 'future';                          // Tương lai
```

## 📱 Giao diện Staff

### Navigation mới
- **Orders**: Quản lý đơn hàng
- **Bàn**: Quản lý bàn với lọc thời gian
- **Lịch**: Xem lịch đặt bàn theo ngày/giờ
- **Thông báo**: Xử lý đặt bàn mới
- **Hóa đơn**: Thanh toán

### Tính năng Lọc
- Chọn miền (Bắc/Trung/Nam)
- Chọn chi nhánh
- Chọn ngày
- Chọn giờ
- Tự động cập nhật khi thay đổi

## 🔧 Cách sử dụng

### Cho Khách hàng
1. Chọn ngày/giờ đặt bàn
2. Hệ thống sẽ validate thời gian
3. Nếu hợp lệ, có thể tiếp tục đặt bàn
4. Nếu không hợp lệ, hiển thị thông báo lỗi

### Cho Staff
1. Vào trang **Lịch** để xem tất cả đặt bàn
2. Sử dụng bộ lọc để xem theo ngày/giờ cụ thể
3. Vào trang **Thông báo** để xử lý đặt bàn mới
4. Vào trang **Bàn** để quản lý trạng thái bàn

## 🎨 UI/UX Improvements

- **Màu sắc trực quan**: Mỗi trạng thái có màu riêng
- **Icon cảnh báo**: AlertCircle cho các trường hợp khẩn cấp
- **Responsive design**: Hoạt động tốt trên mobile
- **Loading states**: Hiển thị trạng thái loading
- **Error handling**: Xử lý lỗi một cách thân thiện

## 🚀 Lợi ích

1. **Tăng hiệu quả**: Staff có thể quản lý đặt bàn theo thời gian
2. **Giảm lỗi**: Validation ngăn chặn đặt bàn không hợp lệ
3. **Cải thiện UX**: Thông báo rõ ràng và trực quan
4. **Quản lý tốt hơn**: Xem được lịch đặt bàn theo thời gian
5. **Phản hồi nhanh**: Xử lý đặt bàn khẩn cấp ngay lập tức

## 📝 Lưu ý

- Tất cả thời gian được xử lý theo múi giờ local
- Validation chỉ hoạt động ở frontend, cần thêm validation ở backend
- Cần cập nhật API backend để hỗ trợ các endpoint mới
- Có thể cần thêm tính năng gửi email/SMS thông báo
