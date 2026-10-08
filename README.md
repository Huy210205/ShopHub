# Scalable E-Commerce Platform

A production-ready full-stack e-commerce application built with **React**, **Spring Boot**, **MySQL**, **Redis**, and **JWT Authentication** — inspired by Amazon/Flipkart.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Vite, Axios, React Router |
| Backend | Java Spring Boot 2.7, Spring Security, Spring Data JPA |
| Database | MySQL 8.0 |
| Cache | Redis |
| Auth | JWT + BCrypt |
| API Docs | Swagger/OpenAPI |
| Build | Maven (backend), npm (frontend) |
| Deploy | Docker & Docker Compose |

## Project Structure

```
e-commerce/
├── backend/                 # Spring Boot REST API
│   ├── src/main/java/com/ecommerce/
│   │   ├── config/          # Redis, OpenAPI, Data init
│   │   ├── controller/      # REST controllers
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── entity/          # JPA entities
│   │   ├── exception/       # Global exception handler
│   │   ├── mapper/          # Entity mappers
│   │   ├── repository/      # Spring Data repos
│   │   ├── security/        # JWT & Security config
│   │   ├── service/         # Business logic
│   │   └── util/            # Utilities
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                # React SPA
│   ├── src/
│   │   ├── components/      # Navbar, CartDrawer, ProductCard
│   │   ├── context/         # Auth, Cart, Theme providers
│   │   ├── pages/           # All application pages
│   │   └── services/        # Axios API client
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── schema.sql           # MySQL schema with indexes
├── docker-compose.yml
└── README.md
```

## Features

### User Features
- Registration, Login, Logout with JWT
- BCrypt password encryption
- Forgot/Reset password flow
- Profile management & change password
- Order history

### Product Features
- Product catalog with pagination
- Search by name, filter by category & price
- Sort: price, rating, newest
- Product details with reviews & ratings
- Redis caching for products

### Shopping & Orders
- Persistent cart for logged-in users
- Checkout with mock payments (Card, UPI, COD)
- Order placement, cancellation, tracking
- Order statuses: Pending → Processing → Shipped → Delivered

### Admin Dashboard
- Analytics: users, products, orders, revenue
- Top selling products chart
- Product & category CRUD
- User management (block/delete)
- Order status management

## Quick Start with Docker

```bash
# Clone and navigate to project
cd e-commerce

# Start all services (MySQL, Redis, Backend, Frontend)
docker-compose up --build

# Access:
# Frontend:  http://localhost:5173
# Backend:   http://localhost:8080/api
# Swagger:   http://localhost:8080/api/swagger-ui.html
```

## Manual Setup (Step-by-Step)

### Prerequisites
- Java 8+ (JDK)
- Maven 3.6+
- Node.js 18+
- MySQL 8.0
- Redis (optional but recommended)

### Step 1: Database Setup

```bash
mysql -u root -p < database/schema.sql
```

Or let Spring Boot auto-create tables (`ddl-auto: update`).

### Step 2: Start Redis

```bash
redis-server
# Or with Docker:
docker run -d -p 6379:6379 redis:7-alpine
```

### Step 3: Backend

```bash
cd backend

# Configure environment (optional)
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=root
set REDIS_HOST=localhost

# Build and run
mvn clean install -DskipTests
mvn spring-boot:run
```

Backend runs at `http://localhost:8080/api`

### Step 4: Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Demo Credentials

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@ecommerce.com    | admin123  |
| User  | user@ecommerce.com     | user123   |

Sample products and categories are auto-seeded on first startup.

## API Documentation

Swagger UI: **http://localhost:8080/api/swagger-ui.html**

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login & get JWT |
| GET | `/products` | Search/filter products |
| GET | `/products/{id}` | Product details |
| POST | `/cart/items` | Add to cart |
| POST | `/orders` | Place order |
| GET | `/users/profile` | Get profile |
| GET | `/admin/analytics` | Dashboard stats |

Include JWT token in header: `Authorization: Bearer <token>`

## Database Schema

Normalized tables with indexes on product name, category, and price:

- `users`, `categories`, `products`
- `cart`, `cart_items`
- `orders`, `order_items`
- `reviews`, `payments`

See `database/schema.sql` for full DDL.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────┐
│  React SPA  │────▶│ Spring Boot  │────▶│  MySQL  │
│  (Vite)     │     │  REST API    │     │         │
└─────────────┘     └──────┬───────┘     └─────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    Redis     │
                    │   (Cache)    │
                    └──────────────┘
```

**Backend Layers:** Controller → Service → Repository → Entity

## Scalability Features

- **Pagination** on all list endpoints
- **Redis caching** for products and categories
- **Database indexes** on frequently queried columns
- **Stateless JWT** authentication for horizontal scaling
- **Docker** containerization for deployment

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | localhost | MySQL host |
| DB_PORT | 3306 | MySQL port |
| DB_NAME | ecommerce_db | Database name |
| DB_USER | root | DB username |
| DB_PASSWORD | root | DB password |
| REDIS_HOST | localhost | Redis host |
| JWT_SECRET | (built-in) | JWT signing key |
| SERVER_PORT | 8080 | Backend port |

## Testing the Application

1. **Register/Login** — Create account or use demo credentials
2. **Browse Products** — Search, filter, sort on `/products`
3. **Add to Cart** — Click product → Add to Cart
4. **Checkout** — Select payment method and place order
5. **Track Orders** — View order history at `/orders`
6. **Admin Panel** — Login as admin → `/admin` for dashboard

## Interview Highlights

- Clean layered architecture (Controller/Service/Repository)
- JWT stateless authentication with Spring Security
- Global exception handling with validation
- DTO pattern separating API from entities
- Redis caching strategy
- Normalized database design with proper indexes
- Docker-ready deployment
- Modern responsive UI with dark mode

## License

MIT — Free for learning, internships, and portfolio projects.
