# ShopHub E-Commerce

Full-stack e-commerce web app built with React + Spring Boot + MySQL + Redis.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Tailwind CSS, Vite |
| Backend | Java Spring Boot 2.7, Spring Security, JPA |
| Database | MySQL 8.0 |
| Cache | Redis |
| Auth | JWT + BCrypt |
| Deploy | Docker & Docker Compose |

## Chạy dự án

### Yêu cầu
- Docker & Docker Compose

### Khởi động

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/api/swagger-ui.html |

## Tài khoản demo

| Role | Email | Password |
|---|---|---|
| Admin | admin@ecommerce.com | admin123 |
| User | user@ecommerce.com | user123 |

## Tính năng

- Đăng ký / đăng nhập JWT
- Duyệt & tìm kiếm sản phẩm, lọc theo danh mục & giá
- Giỏ hàng, đặt hàng, theo dõi đơn hàng
- Đánh giá sản phẩm
- Admin dashboard: quản lý sản phẩm, đơn hàng, người dùng

## Cấu trúc

```
ShopHub/
├── backend/      # Spring Boot REST API
├── frontend/     # React SPA
├── database/     # MySQL schema
└── docker-compose.yml
```
