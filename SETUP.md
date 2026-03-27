# Hướng dẫn cài đặt Macaron Workingspace

## Bước 1 — Tạo dự án Firebase

1. Vào **https://console.firebase.google.com**
2. Bấm **"Create a project"** (hoặc "Thêm dự án")
3. Đặt tên: `macaron-workingspace` → Tiếp tục → Tắt Google Analytics → **Tạo dự án**

## Bước 2 — Bật Authentication (đăng nhập)

1. Trong Firebase Console → Chọn **Authentication** → **Get started**
2. Chọn tab **Sign-in method**
3. Bấm **Email/Password** → Bật (Enable) → **Save**

## Bước 3 — Tạo Firestore Database

1. Trong Firebase Console → Chọn **Firestore Database** → **Create database**
2. Chọn **"Start in production mode"** → Chọn vùng `asia-southeast1 (Singapore)` → **Enable**
3. Vào tab **Rules** → Xoá hết nội dung cũ → Dán nội dung từ file `firestore.rules` → **Publish**

## Bước 4 — Lấy Firebase Config

1. Trong Firebase Console → **Project Settings** (biểu tượng bánh răng)
2. Kéo xuống **"Your apps"** → Bấm **"</ >"** (Web app)
3. Đặt tên app: `macaron-web` → **Register app**
4. Sao chép đoạn config (bắt đầu từ `apiKey: ...`)

## Bước 5 — Tạo file .env

1. Trong thư mục dự án, tạo file tên `.env`
2. Điền thông tin từ Firebase config:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=macaron-workingspace.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=macaron-workingspace
VITE_FIREBASE_STORAGE_BUCKET=macaron-workingspace.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Bước 6 — Chạy ứng dụng

Mở terminal trong thư mục dự án:

```
npm install
npm run dev
```

Mở trình duyệt tại: **http://localhost:5173**

## Deploy lên Vercel (chia sẻ với toàn bộ đội)

1. Vào **https://vercel.com** → Đăng nhập bằng GitHub
2. **"New Project"** → Chọn repo `Macaron-Workingspace`
3. Trong **Environment Variables**, thêm tất cả các biến từ file `.env`
4. Bấm **Deploy** → Xong!

Đội của bạn có thể truy cập qua link Vercel, đăng ký tài khoản và dùng ngay.
