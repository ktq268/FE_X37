# 🎯 Cải Thiện Error Handling và Loading States

## 📋 Tổng Quan

Đã chuẩn hóa error handling và thêm loading states cho toàn bộ ứng dụng Restaurant Management System.

## 🆕 Các Component Mới

### 1. **LoadingSpinner Component**
```jsx
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';

// Sử dụng cơ bản
<LoadingSpinner />

// Với tùy chọn
<LoadingSpinner 
  size="large" 
  text="Đang tải dữ liệu..." 
  overlay={true}
/>
```

**Props:**
- `size`: 'small' | 'default' | 'large' | 'xlarge'
- `text`: string - Text hiển thị
- `className`: string - CSS classes tùy chỉnh
- `overlay`: boolean - Hiển thị overlay toàn màn hình

### 2. **NotificationToast Component**
```jsx
import NotificationToast from '../components/NotificationToast/NotificationToast';

<NotificationToast 
  type="success"
  title="Thành công"
  message="Đã lưu thành công"
  duration={5000}
  position="top-right"
/>
```

**Props:**
- `type`: 'success' | 'error' | 'warning' | 'info'
- `title`: string - Tiêu đề thông báo
- `message`: string - Nội dung thông báo
- `duration`: number - Thời gian hiển thị (ms), 0 = không tự động đóng
- `position`: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

## 🎣 Custom Hooks

### 1. **useLoading Hook**
```jsx
import useLoading from '../hooks/useLoading';

const { isLoading, loadingText, startLoading, stopLoading, withLoading } = useLoading();

// Sử dụng vớiLoading để wrap async function
const data = await withLoading(
  () => fetchData(),
  "Đang tải dữ liệu..."
);
```

**Methods:**
- `startLoading(text)`: Bắt đầu loading với text tùy chỉnh
- `stopLoading()`: Dừng loading
- `withLoading(asyncFunction, loadingText)`: Wrap async function với loading

### 2. **useNotification Hook**
```jsx
import useNotification from '../hooks/useNotification';

const { showSuccess, showError, showWarning, showInfo, showBooking } = useNotification();

// Sử dụng
showSuccess("Thành công", "Đã lưu thành công");
showError("Lỗi", "Có lỗi xảy ra");
showWarning("Cảnh báo", "Vui lòng kiểm tra lại");
showInfo("Thông tin", "Thông tin quan trọng");
showBooking("Đặt bàn thành công", "Mã đặt bàn: ABC123");
```

## 🔧 Cải Thiện API Error Handling

### **Chuẩn hóa Error Object**
```javascript
// Error object mới có cấu trúc:
{
  message: "Thông báo lỗi",
  status: 400,
  statusText: "Bad Request", 
  details: { /* chi tiết lỗi từ server */ },
  endpoint: "/api/endpoint",
  type: "NETWORK_ERROR" // cho lỗi mạng
}
```

### **Xử lý các loại lỗi:**
- **Network Error**: Lỗi kết nối mạng
- **API Error**: Lỗi từ server (4xx, 5xx)
- **Validation Error**: Lỗi validation
- **Authentication Error**: Lỗi xác thực

## 📱 Cập Nhật Components

### **BookingPage**
- ✅ Thêm loading states cho tất cả API calls
- ✅ Cải thiện error messages
- ✅ Sử dụng notification system mới
- ✅ Loading spinner trong buttons

### **MenuPage**
- ✅ Loading spinner khi tải menu
- ✅ Error handling cho search và detail
- ✅ Notification khi thêm vào giỏ hàng

### **CartContext**
- ✅ Error handling cho cart operations
- ✅ Fallback to localStorage khi server lỗi
- ✅ User-friendly error messages

## 🎨 UI/UX Improvements

### **Loading States**
- Spinner animations với Lucide React icons
- Loading text có thể tùy chỉnh
- Disabled states cho buttons khi loading
- Overlay loading cho các operations quan trọng

### **Notifications**
- Toast notifications thay thế alert()
- 4 loại notification với màu sắc và icon phù hợp
- Auto-dismiss với thời gian tùy chỉnh
- Position tùy chỉnh
- Smooth animations

### **Error Messages**
- Thông báo lỗi bằng tiếng Việt
- Chi tiết lỗi phù hợp với context
- Không hiển thị technical errors cho user
- Fallback mechanisms khi có lỗi

## 🚀 Cách Sử Dụng

### **1. Thêm Loading cho API Call**
```jsx
const { withLoading } = useLoading();

const handleSubmit = async () => {
  try {
    const result = await withLoading(
      () => apiCall(),
      "Đang xử lý..."
    );
    // Handle success
  } catch (error) {
    showError("Lỗi", error.message);
  }
};
```

### **2. Hiển thị Notification**
```jsx
const { showSuccess, showError } = useNotification();

// Success
showSuccess("Thành công", "Đã lưu thành công");

// Error
showError("Lỗi", "Có lỗi xảy ra, vui lòng thử lại");
```

### **3. Loading Spinner trong UI**
```jsx
const { isLoading } = useLoading();

return (
  <div>
    {isLoading ? (
      <LoadingSpinner size="large" text="Đang tải..." />
    ) : (
      <YourContent />
    )}
  </div>
);
```

## 📊 Kết Quả

### **Trước khi cải thiện:**
- ❌ Sử dụng alert() cho thông báo
- ❌ Không có loading states nhất quán
- ❌ Error handling không chuẩn hóa
- ❌ UX kém khi có lỗi

### **Sau khi cải thiện:**
- ✅ Toast notifications đẹp mắt
- ✅ Loading states nhất quán
- ✅ Error handling chuẩn hóa
- ✅ UX tốt hơn với fallback mechanisms
- ✅ Thông báo lỗi thân thiện với người dùng

## 🔄 Migration Guide

### **Thay thế alert()**
```jsx
// Cũ
alert("Lỗi xảy ra");

// Mới
showError("Lỗi", "Có lỗi xảy ra, vui lòng thử lại");
```

### **Thay thế loading states**
```jsx
// Cũ
const [isLoading, setIsLoading] = useState(false);
setIsLoading(true);
// ... API call
setIsLoading(false);

// Mới
const { withLoading } = useLoading();
await withLoading(() => apiCall(), "Đang tải...");
```

## 🎯 Lợi Ích

1. **UX tốt hơn**: Loading states và notifications đẹp mắt
2. **Error handling nhất quán**: Chuẩn hóa cách xử lý lỗi
3. **Maintainable**: Code dễ bảo trì và mở rộng
4. **User-friendly**: Thông báo lỗi thân thiện với người dùng
5. **Robust**: Fallback mechanisms khi có lỗi
