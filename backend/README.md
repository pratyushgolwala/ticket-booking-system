# Ticket Booking System - Backend

A **concurrency-safe** ticket booking system built with **Node.js**, **Express**, and **PostgreSQL**. This system prevents overbooking using PostgreSQL row-level locking (`SELECT ... FOR UPDATE`) and database transactions.

## 🎯 Features

- ✅ **Concurrency-safe booking** - Prevents double booking using row-level locks
- ✅ **Automatic expiry** - Pending bookings expire after 2 minutes
- ✅ **Transaction-based** - All booking operations are atomic
- ✅ **RESTful API** - Clean and simple API design
- ✅ **Docker support** - Easy deployment with Docker Compose
- ✅ **Comprehensive testing** - Includes concurrency test suite

## 🏗️ Architecture

### Database Schema

- **shows** - Concert/event information
- **seats** - Individual seats with status (AVAILABLE, RESERVED, BOOKED)
- **bookings** - Booking records with expiry tracking
- **booking_seats** - Junction table linking bookings to seats

### Concurrency Control

The system uses PostgreSQL's `SELECT ... FOR UPDATE` to lock rows during booking:

```sql
SELECT id, seat_no, status 
FROM seats 
WHERE show_id = $1 AND seat_no = ANY($2::text[])
FOR UPDATE;
```

This ensures that:
- Only one transaction can modify a seat at a time
- Other transactions wait until the lock is released
- No race conditions or double bookings

## 📋 Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 15+ (or use Docker)
- **npm** or **yarn**

## 🚀 Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Start the application:**
   ```bash
   docker compose up --build
   ```

2. **The API will be available at:** `http://localhost:3000`

3. **Database migrations run automatically on container startup**

### Option 2: Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` with your database credentials:**
   ```env
   DATABASE_URL=postgres://username@localhost:5432/ticketdb
   PORT=3000
   NODE_ENV=development
   ```

4. **Create database:**
   ```bash
   createdb ticketdb
   ```

5. **Run migrations:**
   ```bash
   npm run migrate
   ```

6. **Start the server:**
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Admin Routes

#### Create Show
```http
POST /admin/shows
Content-Type: application/json

{
  "name": "Rock Concert 2025",
  "start_time": "2025-12-25T19:00:00Z",
  "total_seats": 100
}
```

### Show Routes

#### List All Shows
```http
GET /shows
```

#### Get Seats for a Show
```http
GET /shows/:id/seats
```

#### Book Seats
```http
POST /shows/:id/book
Content-Type: application/json

{
  "seat_nos": ["1", "2", "3"],
  "user_id": "user123",
  "immediate_confirm": true
}
```

**Parameters:**
- `seat_nos` (array) - Array of seat numbers to book
- `user_id` (string) - User identifier
- `immediate_confirm` (boolean, default: true) - If false, booking expires in 2 minutes

### Booking Routes

#### Get Booking Details
```http
GET /bookings/:id
```

## 🧪 Testing

### Run Concurrency Test

This test fires 10 concurrent requests trying to book the same seats. Only 1 should succeed:

```bash
npm run test:concurrent
```

**Expected output:**
```
RESULTS:
--------
Total requests: 10
Successful bookings: 1
Failed bookings: 9

✓ PASS: Exactly 1 booking succeeded (concurrency control working!)
```

### Manual Testing with curl

```bash
# List shows
curl http://localhost:3000/shows

# Get seats for show 1
curl http://localhost:3000/shows/1/seats

# Book seats
curl -X POST http://localhost:3000/shows/1/book \
  -H "Content-Type: application/json" \
  -d '{"seat_nos":["7","8"],"user_id":"user789","immediate_confirm":true}'

# Get booking details
curl http://localhost:3000/bookings/1
```

### Using Postman

Import the `postman_collection.json` file into Postman for pre-configured requests.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment (development/production) | development |

### Booking Expiry

Pending bookings expire after 2 minutes. The expiry worker runs every 30 seconds.

To modify the expiry time, edit `src/routes/shows.js`:
```javascript
const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
```

## 📦 Project Structure

```
backend/
├── src/
│   ├── index.js              # Express app entry point
│   ├── db.js                 # Database connection pool
│   ├── routes/
│   │   ├── admin.js          # Admin endpoints (create shows)
│   │   ├── shows.js          # Show & booking endpoints
│   │   └── bookings.js       # Booking details endpoint
│   ├── workers/
│   │   └── expiryWorker.js   # Background job to expire bookings
│   ├── migrations/
│   │   └── runMigrations.js  # Database migration script
│   └── utils/
│       ├── errors.js         # Custom error classes
│       └── logger.js         # Logging utility
├── tests/
│   └── concurrentTest.js     # Concurrency test suite
├── schema.sql                # Database schema
├── seed.sql                  # Sample data
├── Dockerfile                # Docker image configuration
├── docker-compose.yml        # Docker Compose setup
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🚢 Deployment

### Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize:**
   ```bash
   railway login
   railway init
   ```

3. **Add PostgreSQL:**
   ```bash
   railway add postgresql
   ```

4. **Set environment variables:**
   ```bash
   railway variables set DATABASE_URL=$RAILWAY_POSTGRES_URL
   railway variables set PORT=3000
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

6. **Run migrations:**
   ```bash
   railway run npm run migrate
   ```

### Deploy to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Add PostgreSQL database
4. Set environment variables:
   - `DATABASE_URL` (from database connection string)
   - `NODE_ENV=production`
5. Build command: `npm install`
6. Start command: `npm start`

### Deploy to Heroku

1. **Create app:**
   ```bash
   heroku create your-app-name
   ```

2. **Add PostgreSQL:**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

4. **Run migrations:**
   ```bash
   heroku run npm run migrate
   ```

## 🛡️ How Concurrency is Handled

1. **Row-level locking:** When a booking request arrives, we use `SELECT ... FOR UPDATE` to lock the seat rows
2. **Transactions:** All booking operations happen within a database transaction
3. **Atomic operations:** Either all seats are booked or none (rollback on any error)
4. **SKIP LOCKED:** The expiry worker uses `FOR UPDATE SKIP LOCKED` to avoid blocking

Example booking flow:
```javascript
BEGIN TRANSACTION
  ↓
SELECT seats FOR UPDATE (locks rows)
  ↓
Check availability
  ↓
Create booking
  ↓
Update seat statuses
  ↓
COMMIT (releases locks)
```

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm run migrate` | Run database migrations and seed data |
| `npm run test:concurrent` | Run concurrency test |

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database connection failed
- Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `createdb ticketdb`

### Migrations failed
```bash
# Drop and recreate database
dropdb ticketdb
createdb ticketdb
npm run migrate
```

## 📄 License

MIT

## 👥 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

**Built with ❤️ for concurrency-safe ticket booking**
