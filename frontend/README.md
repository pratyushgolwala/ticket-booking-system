# Ticket Booking System - Frontend

A modern, responsive frontend for the concurrency-safe ticket booking system built with **Vite**, **React**, and **plain CSS**. Features a polished UI with deep teal and coral accents, inspired by booking platforms but with unique design elements.

## 🎨 Features

- ✅ **Modern UI Design** - Card-based layout with subtle shadows and smooth animations
- ✅ **Responsive** - Works seamlessly on desktop, tablet, and mobile
- ✅ **Real-time Updates** - Seats refresh after booking conflicts
- ✅ **Concurrency-Safe** - Handles race conditions gracefully
- ✅ **Accessible** - Keyboard navigation and ARIA labels
- ✅ **State Management** - Context API for global state
- ✅ **Smart Caching** - Avoids unnecessary API calls
- ✅ **Error Handling** - Clear error messages and recovery

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management
- **Plain CSS** - Styling (no frameworks)

## 📋 Prerequisites

- Node.js 18+ installed
- Backend API running (default: `http://localhost:4000`)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Setup

Create `.env` file (or use `.env.example`):

```bash
cp .env.example .env
```

Update `.env` with your backend URL:

```env
VITE_API_BASE_URL=http://localhost:4000
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── api.js              # Axios instance & API functions
│   ├── components/
│   │   ├── Header.jsx          # Navigation header
│   │   ├── Footer.jsx          # Page footer
│   │   ├── ShowCard.jsx        # Show display card
│   │   ├── SeatGrid.jsx        # Seat layout grid
│   │   ├── Seat.jsx            # Individual seat component
│   │   ├── BookingStatus.jsx   # Booking result display
│   │   ├── Loading.jsx         # Loading spinner
│   │   └── ErrorBanner.jsx     # Error message display
│   ├── context/
│   │   └── AppContext.jsx      # Global state management
│   ├── pages/
│   │   ├── Home.jsx            # Shows list & search
│   │   ├── Booking.jsx         # Seat selection & booking
│   │   ├── Admin.jsx           # Create shows
│   │   └── NotFound.jsx        # 404 page
│   ├── utils/
│   │   ├── format.js           # Date/time formatting
│   │   └── validators.js       # Form validation
│   ├── App.jsx                 # Root component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── scripts/
│   └── record_gif_instructions.md  # GIF recording guide
├── .env.example                # Environment template
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🎯 Key Features Explained

### 1. Concurrency Handling

The frontend treats the backend as the **source of truth**:

- Uses optimistic UI for quick feedback
- Validates with backend before confirming
- Refreshes seat status after conflicts
- Shows clear error messages

### 2. Smart Caching

- Shows cached in Context to avoid refetching
- Seats cached per show ID
- Cache invalidated after booking conflicts
- Manual refresh available

### 3. State Management

**AppContext provides:**
- `auth` - Mock user authentication
- `shows` - Show list with caching
- `seatsCache` - Seats by show ID
- `bookings` - User booking history

### 4. Routing

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Browse and search shows |
| `/booking/:id` | Booking | Select seats and book |
| `/admin` | Admin | Create new shows |
| `*` | Not Found | 404 error page |

## 🎨 Design Philosophy

### Color Palette
- **Primary**: Deep Teal (`#0f766e`)
- **Accent**: Coral (`#f97316`)
- **Background**: Light Gray (`#f8fafc`)
- **Text**: Dark Slate (`#1e293b`)

### Unique Features
- "Recommended" ribbons on selected shows
- Bottom sticky booking bar on mobile
- Seat selection animations
- Smooth gradient buttons
- Card-based layout

## 🧪 Testing

### Manual Testing Checklist

- [ ] Navigate to homepage
- [ ] Search for shows
- [ ] Click "View Seats"
- [ ] Select multiple seats
- [ ] Confirm booking
- [ ] Verify success message
- [ ] Try booking booked seats (should fail)
- [ ] Create show in admin panel
- [ ] Verify new show appears

### Concurrency Test

**Two-browser test:**
1. Open same show in two browser windows
2. Select same seats in both
3. Click "Confirm Booking" in both
4. Only one should succeed
5. Failed one should show error and refresh seats

## 🚀 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Build and deploy:
   ```bash
   vercel
   ```

3. Set environment variable in Vercel dashboard:
   - `VITE_API_BASE_URL` = your backend URL

### Deploy to Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy `dist` folder via Netlify UI or CLI:
   ```bash
   netlify deploy --prod --dir=dist
   ```

3. Set environment variable in Netlify dashboard:
   - `VITE_API_BASE_URL` = your backend URL

### Important: CORS Configuration

Make sure your backend allows requests from your frontend domain. Update backend `.env`:

```env
CORS_ORIGIN=https://your-frontend-domain.com
```

## 🎥 Recording Demo GIFs

See `scripts/record_gif_instructions.md` for detailed instructions on recording demonstration GIFs.

## 🐛 Known Limitations

- **No real authentication** - Uses mock user IDs
- **No payment integration** - Booking is immediate
- **No real-time updates** - No WebSocket/SSE (optional polling can be added)
- **Limited seat layouts** - Simple grid only

## 🔧 Troubleshooting

### "Network Error" when booking

**Solution:** Check that backend is running and `VITE_API_BASE_URL` is correct.

### Seats not refreshing after conflict

**Solution:** The app auto-refreshes on conflict. If not working, check browser console for errors.

### Shows not loading

**Solution:**
1. Verify backend is running: `curl http://localhost:4000/shows`
2. Check browser console for CORS errors
3. Ensure `.env` file exists with correct API URL

### Build fails

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:4000` | Yes |

## 🎓 Learning Resources

- [React Router Docs](https://reactrouter.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Context API](https://react.dev/reference/react/createContext)

## 📄 License

MIT

## 👥 Contributing

This is a demonstration project. Feel free to fork and modify for your own use.

---

**Built with ❤️ using React and Vite**
