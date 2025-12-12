# 🎟️ Ticket Booking System

A **production-ready**, **concurrency-safe** ticket booking system built with **Node.js**, **Express**, **PostgreSQL**, **React**, and **Vite**. This system prevents overbooking using PostgreSQL row-level locking and provides a modern, responsive UI for seamless ticket booking.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📸 Screenshots

> **Note:** Add your screenshots in the `/screenshots` folder after deployment

---

## ✨ Features

### Backend
- ✅ **Concurrency-safe booking** - Prevents double booking using PostgreSQL `SELECT ... FOR UPDATE`
- ✅ **Automatic expiry** - Pending bookings expire after 2 minutes
- ✅ **Transaction-based** - All operations are atomic
- ✅ **RESTful API** - Clean, documented endpoints
- ✅ **Docker support** - Easy deployment with Docker Compose
- ✅ **Comprehensive testing** - Concurrency test suite included

### Frontend
- ✅ **Modern UI** - Clean, card-based design with deep teal & coral accents
- ✅ **Real-time updates** - Seat availability updates dynamically
- ✅ **Responsive** - Works perfectly on mobile, tablet, and desktop
- ✅ **Context API** - Efficient state management
- ✅ **Error handling** - Graceful handling of booking conflicts
- ✅ **Accessibility** - Keyboard navigation and ARIA labels

---

## 🏗️ Architecture

```
ticket-booking-system/
├── backend/                 # Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── workers/        # Background jobs (expiry)
│   │   ├── migrations/     # Database setup
│   │   └── utils/          # Helpers & logging
│   ├── tests/              # Concurrency tests
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
│
└── frontend/               # React + Vite
    ├── src/
    │   ├── pages/          # Route pages
    │   ├── components/     # Reusable components
    │   ├── context/        # Global state
    │   ├── api/            # API client
    │   └── utils/          # Helpers
    └── public/             # Static assets
```

### How Concurrency is Handled

1. **Row-level locking**: `SELECT ... FOR UPDATE` locks seat rows during booking
2. **Transactions**: All booking operations are atomic (all-or-nothing)
3. **Backend as source of truth**: Frontend always validates with backend
4. **Graceful conflict handling**: UI updates when seats are taken by others

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/)) or use Docker

### 1️⃣ Clone the Repository
```bash
git clone <your-repo-url>
cd ticket-booking-system
```

### 2️⃣ Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your database credentials
# DATABASE_URL=postgres://username@localhost:5432/ticketdb
# PORT=4000

# Create database
createdb ticketdb

# Run migrations
npm run migrate

# Start server
npm run dev
```

**Backend running at:** `http://localhost:4000`

### 3️⃣ Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with backend URL
# VITE_API_BASE_URL=http://localhost:4000

# Start development server
npm run dev
```

**Frontend running at:** `http://localhost:5173`

---

## 🐳 Docker Setup (Alternative)

```bash
cd backend

# Start backend + database
docker compose up --build

# The API will be available at http://localhost:3000
```

Then update frontend `.env`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 📡 API Endpoints

### Shows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shows` | List all shows |
| GET | `/shows/:id/seats` | Get seats for a show |
| POST | `/shows/:id/book` | Book seats |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/shows` | Create a new show |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings/:id` | Get booking details |

**Full API documentation:** See [`backend/README.md`](backend/README.md)

---

## 🧪 Testing

### Run Concurrency Test

Test that only 1 booking succeeds when 10 users try to book the same seats:

```bash
cd backend
npm run test:concurrent
```

**Expected output:**
```
✓ PASS: Exactly 1 booking succeeded (concurrency control working!)
✓ PASS: 9 bookings failed as expected
```

### Manual Testing

```bash
# List shows
curl http://localhost:4000/shows

# Book seats
curl -X POST http://localhost:4000/shows/1/book \
  -H "Content-Type: application/json" \
  -d '{"seat_nos":["1","2"],"user_id":"user123","immediate_confirm":true}'
```

---

## 🌍 Deployment

### Deploy Backend (Free Options)

#### **Option 1: Render.com** (Recommended)
1. Create account at [render.com](https://render.com)
2. Create new **PostgreSQL** database
3. Create new **Web Service**
   - Connect GitHub repo
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`
4. Add environment variables:
   - `DATABASE_URL` → Copy from PostgreSQL database
   - `NODE_ENV=production`
5. Run migration: `npm run migrate` (from Render shell)

#### **Option 2: Railway.app**
```bash
cd backend

# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add postgresql
railway up

# Run migrations
railway run npm run migrate
```

### Deploy Frontend (Free Options)

#### **Option 1: Vercel** (Recommended)
```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variable
vercel env add VITE_API_BASE_URL
# Enter your deployed backend URL
```

#### **Option 2: Netlify**
1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repo
3. Build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
4. Add environment variable:
   - `VITE_API_BASE_URL` → Your deployed backend URL

---

## 🎨 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL 15
- **ORM:** node-postgres (pg)
- **Auth:** None (mock auth for demo)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** react-router-dom v6
- **State Management:** Context API
- **HTTP Client:** Axios
- **Styling:** Plain CSS (no framework)

---

## 📁 Project Structure

<details>
<summary>Click to expand</summary>

```
ticket-booking-system/
├── README.md
├── .gitignore
│
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── schema.sql
│   ├── seed.sql
│   ├── README.md
│   ├── postman_collection.json
│   ├── src/
│   │   ├── index.js              # Express app
│   │   ├── db.js                 # Database connection
│   │   ├── routes/
│   │   │   ├── admin.js          # Admin endpoints
│   │   │   ├── shows.js          # Show endpoints
│   │   │   └── bookings.js       # Booking endpoints
│   │   ├── workers/
│   │   │   └── expiryWorker.js   # Auto-expire bookings
│   │   ├── migrations/
│   │   │   └── runMigrations.js  # DB setup script
│   │   └── utils/
│   │       ├── errors.js         # Error classes
│   │       └── logger.js         # Logging utility
│   └── tests/
│       └── concurrentTest.js     # Concurrency tests
│
└── frontend/
    ├── package.json
    ├── .env.example
    ├── vite.config.js
    ├── index.html
    ├── README.md
    ├── src/
    │   ├── main.jsx              # App entry
    │   ├── App.jsx               # Router setup
    │   ├── index.css             # Global styles
    │   ├── api/
    │   │   └── api.js            # Axios client
    │   ├── context/
    │   │   └── AppContext.jsx    # Global state
    │   ├── pages/
    │   │   ├── Home.jsx          # Show listing
    │   │   ├── Booking.jsx       # Seat selection
    │   │   ├── Admin.jsx         # Create shows
    │   │   └── NotFound.jsx      # 404 page
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ShowCard.jsx
    │   │   ├── SeatGrid.jsx      # Seat layout
    │   │   ├── Seat.jsx          # Single seat
    │   │   ├── BookingStatus.jsx
    │   │   ├── Loading.jsx
    │   │   └── ErrorBanner.jsx
    │   └── utils/
    │       ├── validators.js
    │       └── format.js
    └── public/
```
</details>

---

## 🔒 Security & Best Practices

- ✅ Environment variables for sensitive config
- ✅ Input validation on backend
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS enabled for cross-origin requests
- ✅ Error handling and logging
- ✅ Transaction-based database operations

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Verify DATABASE_URL in .env
echo $DATABASE_URL

# Check port availability
lsof -ti:4000
```

### Frontend can't connect to backend
```bash
# Verify backend is running
curl http://localhost:4000/health

# Check VITE_API_BASE_URL in frontend/.env
cat frontend/.env

# Ensure CORS is enabled in backend
```

### Database migration errors
```bash
# Drop and recreate database
dropdb ticketdb
createdb ticketdb
npm run migrate
```

---

## 📚 Documentation

- **Backend API:** [`backend/README.md`](backend/README.md)
- **Frontend Setup:** [`frontend/README.md`](frontend/README.md)
- **Postman Collection:** [`backend/postman_collection.json`](backend/postman_collection.json)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👏 Acknowledgments

- Built with ❤️ for learning concurrency control in booking systems
- Inspired by RedBus and BookMyShow UX patterns
- PostgreSQL documentation for transaction isolation levels

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**⭐ Star this repo if you found it helpful!**
