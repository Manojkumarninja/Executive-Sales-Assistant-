# Sales Executive Web App

A gamified, professional web application for sales executives to track their performance, targets, and engage with customers.

## Live Demo

- **Frontend**: Deployed on Vercel (auto-deploys from main branch)
- **Backend**: https://executive-sales-assistant.onrender.com
- **Database**: MySQL (Remote server)

## Features

### Authentication
- Secure login with username/email and password
- Password reset functionality with OTP verification
- 6-hour session timeout for security
- Persistent authentication state

### Dashboard (Home)
- **Daily Earnings Tracker**:
  - "Final Push Today" - Remaining daily target
  - "Remaining for the Week" - Weekly target progress
  - Live countdown timer showing time left in the day
- **Target Cards**: Three clickable cards (AB, Tonnage, OC) with progress tracking
- **Rankings Leaderboard**: City/Cluster toggle with day/week period selection
- **Customer Engagement Cards**:
  - 💬 **Nudge Zone**: All customers needing engagement with last order info
  - 🔥 **So Close**: Customers who opened app but didn't order today
  - 📍 **In and Around You**: Nearby customers sorted by proximity
- **Global Refresh**: Manual refresh button with auto-refresh every 10 minutes
- **Notification Bell**: Real-time notifications from backend

### Customers Page
- View target customers based on daily/weekly metrics
- Filter by specific metrics (AB, Tonnage, OC, etc.)
- Customer detail modal with:
  - Contact information
  - SKUs to pitch with product details
  - Distance and last seen information
  - One-click call functionality
- Analytics tracking for all customer interactions

### Analytics Tracking
- Comprehensive event tracking system
- Tracks page views, customer interactions, toggles, and more
- Events stored in backend database
- See [EVENT_TRACKING.md](EVENT_TRACKING.md) for complete event list

### Responsive Design
- **Desktop** (≥768px): Sidebar navigation with hover expand/collapse
- **Mobile** (<768px): Bottom navigation bar
- Smooth transitions and adaptive layouts

### Gamified UI
- Animated counters and progress bars
- Motivational elements and status badges
- Color-coded progress indicators
- Visual feedback for user actions

## Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Styling framework with custom purple theme
- **React Icons** - Icon library (Font Awesome)
- **React Circular Progressbar** - Progress visualizations
- **Deployed on**: Vercel (auto-deploy from GitHub)

### Backend
- **Flask 3.0.0** - Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **MySQL** - Database (mysql-connector-python 8.2.0)
- **Gunicorn 21.2.0** - Production WSGI server
- **Deployed on**: Render (Singapore region)

### Database
- **MySQL** - Remote server at 116.202.114.156:3971
- Database: `datalake`
- Tables: executives, targets, incentives, orders, notifications, SA_AppNotification, etc.

## Installation

### Prerequisites
- Node.js (v18 or higher)
- Python 3.9 or higher
- npm or yarn

### Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/Manojkumarninja/Executive-Sales-Assistant-.git
cd SalesExecutiveApp
```

#### 2. Frontend Setup
```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server (runs on port 5173)
npm run dev

# If you get silent failures, force dependency re-optimization:
npx vite --force
```

#### 3. Backend Setup
```bash
# Navigate to server directory
cd server

# Install Python dependencies
pip install -r requirements.txt

# Start Flask server (runs on port 5000)
python app.py
```

**IMPORTANT**: Both frontend and backend must be running simultaneously for full functionality.

### Production Build
```bash
# Build frontend for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
SalesExecutiveApp/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx              # Desktop sidebar & mobile bottom nav
│   │   │   └── Layout.jsx               # Main layout wrapper
│   │   ├── home/
│   │   │   ├── DailyEarningsCard.jsx    # Daily/weekly targets with timer
│   │   │   ├── TargetCard.jsx           # AB, Tonnage, OC cards
│   │   │   ├── RankingsCard.jsx         # Leaderboard component
│   │   │   └── CustomerListCard.jsx     # Nudge Zone, So Close, Nearby
│   │   └── shared/
│   │       ├── ProgressBar.jsx          # Reusable progress bar
│   │       ├── AnimatedCounter.jsx      # Number animations
│   │       ├── PullToRefresh.jsx        # Pull-to-refresh component
│   │       ├── FloatingNewsButton.jsx   # Notification bell
│   │       ├── NewsModal.jsx            # Notifications modal
│   │       ├── CustomDropdown.jsx       # Metric selector
│   │       └── CustomerDetailModal.jsx  # Customer details & SKUs
│   ├── pages/
│   │   ├── Login.jsx                    # Login page
│   │   ├── ForgotPassword.jsx           # Password reset flow
│   │   ├── ResetPassword.jsx            # Password reset confirmation
│   │   ├── Home.jsx                     # Main dashboard
│   │   └── Target.jsx                   # Customers page
│   ├── contexts/
│   │   └── DataCacheContext.jsx         # Client-side caching
│   ├── hooks/
│   │   └── usePullToRefresh.js          # Pull-to-refresh hook
│   ├── utils/
│   │   └── analytics.js                 # Event tracking utilities
│   ├── constants/
│   │   └── eventNames.js                # Analytics event constants
│   ├── config.js                        # API URL configuration
│   ├── App.jsx                          # Main app component
│   └── main.jsx                         # Entry point
├── server/
│   ├── app.py                           # Flask backend application
│   └── requirements.txt                 # Python dependencies
├── vercel.json                          # Vercel deployment config
├── render.yaml                          # Render deployment config
├── CLAUDE.md                            # Development guide for Claude Code
├── EVENT_TRACKING.md                    # Analytics events documentation
├── tailwind.config.js                   # Tailwind configuration
└── package.json                         # Node dependencies
```

## Configuration Files

### Frontend Configuration
- **src/config.js**: API URL management (auto-switches between dev/prod)
- **vercel.json**: Vercel deployment settings
- **tailwind.config.js**: Custom theme and color palette

### Backend Configuration
- **server/app.py**: Flask routes and database connections
- **render.yaml**: Render deployment settings (Singapore region)
- **server/requirements.txt**: Python dependencies

## Database Schema

### Key Tables
- **executives**: Employee information and credentials
- **targets**: Daily and weekly targets by metric
- **incentives**: Earnings and incentive calculations
- **orders**: Customer order history
- **SA_AppNotification**: In-app notifications
- **SA_AppEvents**: Analytics event tracking

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP

### Executives
- `GET /api/executives/<employee_id>` - Get executive details

### Targets
- `GET /api/targets/daily/<employee_id>` - Get daily targets
- `GET /api/targets/weekly/<employee_id>` - Get weekly targets

### Customers
- `GET /api/target-customers/<employee_id>?metric=<metric>&period=<period>` - Get target customers

### Incentives
- `GET /api/incentives/daily/<employee_id>` - Get daily incentives
- `GET /api/incentives/weekly/<employee_id>` - Get weekly incentives

### Rankings
- `GET /api/rankings/<employee_id>?period=<day|week>&layer=<city|cluster>` - Get leaderboard

### Customers Lists
- `GET /api/nudge-zone-customers/<employee_id>` - Nudge zone customers
- `GET /api/so-close-customers/<employee_id>` - So close customers
- `GET /api/nearby-customers/<employee_id>` - Nearby customers

### Notifications
- `GET /api/notifications` - Get all notifications

### Analytics
- `POST /api/events/log` - Log analytics event

## Analytics Event Tracking

The app tracks comprehensive user interactions for analytics:

### Page Views
- Home Page Viewed
- Customers Page Viewed

### Customer Interactions
- Called Customer (with source tracking)
- Customer Detail Modal Viewed
- Customer SKU Details Viewed
- Customers Page Metric Selected

### Toggle Events
- Home Page Targets Toggle (Daily/Weekly)
- Customers Page Toggle (Daily/Weekly)
- Leaderboard Period Toggle (Day/Week)
- Leaderboard Layer Toggle (City/Cluster)

### Refresh Events
- Global Refresh (Home page)
- Pull to Refresh (per page)

### News Events
- News Viewed
- News Item Read

See [EVENT_TRACKING.md](EVENT_TRACKING.md) for complete documentation.

## Color Scheme

- **Primary Purple**: #6C5DD3
- **Success Green**: #10B981
- **Warning Orange**: #F59E0B
- **Danger Red**: #EF4444

## Deployment

### Frontend (Vercel)
1. Connected to GitHub repository
2. Auto-deploys on push to main branch
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend (Render)
1. Deployed as Web Service in Singapore region
2. Build command: `pip install -r server/requirements.txt`
3. Start command: `cd server && gunicorn app:app`
4. Environment variables:
   - `FLASK_ENV=production`
   - `PORT=10000`

### Continuous Deployment
Every push to the main branch automatically triggers:
- Vercel rebuild and deployment (frontend)
- The backend on Render stays running (no auto-deploy configured)

## Key Features in Detail

### Session Management
- 6-hour session timeout
- Automatic logout after inactivity
- Session expiry timestamp stored in localStorage

### Caching System
- Client-side data caching with DataCacheContext
- Reduces API calls and improves performance
- Cache keys for: targets, rankings, customers, incentives

### Pull-to-Refresh
- Available on all pages
- Manual data refresh capability
- Smooth animation feedback

### Duplicate Event Prevention
- 2-second window for duplicate event detection
- Prevents multiple identical analytics events
- Automatic cache cleanup

## Known Issues & Solutions

1. **Frontend fails silently (exit code 1)**
   - Solution: Use `npx vite --force` to force dependency re-optimization

2. **CORS errors in production**
   - Solution: Backend CORS is configured for Vercel domains

3. **Render free tier sleep**
   - Backend on Render sleeps after 15 minutes of inactivity
   - First request after sleep takes ~30 seconds to wake up

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with both frontend and backend running
5. Push to your fork and create a pull request

## Development Notes

- See [CLAUDE.md](CLAUDE.md) for detailed development instructions
- All TODO comments in code indicate potential enhancements
- Analytics events are centralized in `src/constants/eventNames.js`
- API URLs automatically switch based on environment (dev/prod)

## Support

For issues or questions:
- Check inline code comments marked with `TODO:`
- Refer to [CLAUDE.md](CLAUDE.md) for development guidelines
- Review [EVENT_TRACKING.md](EVENT_TRACKING.md) for analytics documentation

---

**Built with ❤️ for Sales Excellence**

**Deployed with Vercel + Render**
