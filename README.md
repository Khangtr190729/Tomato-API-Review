# Tomato Project (Monolithic Architecture)

Dự án Tomato cung cấp công cụ thu thập thông tin và điểm số phim từ Rotten Tomatoes. Với kiến trúc Monolithic chuẩn, dự án bao gồm một Frontend Minimalist (React + Vite + TypeScript) và một Backend API (FastAPI + Playwright) mạnh mẽ.

## Tính năng

- **Minimalist Giao diện**: Tìm kiếm và tra cứu thông tin phim với giao diện tối giản, hỗ trợ Dark/Light mode, hiệu ứng mượt mà (Glassmorphism, mượt mà).
- **Lấy dữ liệu toàn diện**: Lấy ảnh poster chính (image), mô tả ngắn (description), Điểm Tomatometer, và Điểm Khán giả (Audience Score).
- **Tìm kiếm thông minh**: Hỗ trợ tìm kiếm theo tên phim (ví dụ: `Toy Story 4`, `matrix`) hoặc URL Rotten Tomatoes.
- **FastAPI Web API & Swagger UI**: Cung cấp API tích hợp tài liệu Swagger để test tự động.
- **Bắt lỗi tiếng Việt**: Các thông báo lỗi xác thực (validation) thân thiện, hiển thị hoàn toàn bằng tiếng Việt.
- **Chống chặn bot (Anti-Bot)**: Sử dụng Playwright với cấu hình tùy chỉnh để tránh bị phát hiện là bot.

## Cấu trúc dự án

Kiến trúc Monolithic phân tách rõ ràng:
- `backend/`: Chứa mã nguồn Python FastAPI và Playwright scraper.

- `frontend/`: Chứa mã nguồn giao diện người dùng React, Vite và TypeScript.

---

## Hướng dẫn cài đặt và khởi chạy

Đảm bảo bạn đã cài đặt **Python 3.12+** và **Node.js (phiên bản mới nhất)**.

### 1. Khởi chạy Backend API

Cài đặt các gói phụ thuộc Python và Chromium cho Playwright:

```bash
cd tomato/backend
pip install -r requirements.txt
playwright install chromium
```

Khởi động server Backend:

```bash
python main.py
```
*Server sẽ chạy tại địa chỉ `http://127.0.0.1:8000`.*

### 2. Khởi chạy Frontend UI

Mở một cửa sổ Terminal khác, cài đặt thư viện và chạy ứng dụng React:

```bash
cd tomato/frontend
npm install
npm run dev
```
*Giao diện người dùng sẽ có sẵn ở địa chỉ hiển thị trong terminal (thường là `http://localhost:5173`).*

---

## Kiểm thử API bằng Swagger UI

Backend API đi kèm với tài liệu tương tác Swagger UI. Đây là cách dễ nhất để test trực tiếp các endpoint:

1. Đảm bảo Backend đang chạy (bước 1 ở trên).
2. Mở trình duyệt và truy cập: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
3. Tìm endpoint `GET /api/scores`.
4. Nhấn nút **"Try it out"**.
5. Nhập tên phim hoặc URL (ví dụ: `matrix`) vào tham số `movie`.
6. Nhấn **"Execute"** và xem cấu trúc kết quả trả về cũng như các lỗi Validation (nếu có).

## Ví dụ kết quả trả về (JSON)

```json
{
    "title": "The Matrix",
    "image": "https://resizing.flixster.com/.../The_Matrix_Poster.jpg",
    "description": "Neo (Keanu Reeves) believes that Morpheus ...",
    "tomatometer": 83,
    "tomatometer_review_count": 209,
    "audience_score": 85,
    "audience_rating_count": "1,307,885 Ratings"
}
```

## Đóng góp
Mọi đóng góp cho dự án đều được hoan nghênh. Xin vui lòng tạo pull requests mới.