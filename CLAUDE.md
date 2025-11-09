# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running Both Servers
The application requires both frontend (Vite) and backend (Flask) servers running simultaneously.

```bash
# Backend Server (Flask) - Run from /server directory
cd server
python app.py
# Runs on http://localhost:5000
# Database: MySQL at 116.202.114.156:3971

# Frontend Server (Vite) - Run from project root
npm run dev
# Runs on http://localhost:5173
# If you get dependency issues or silent failures, use:
npx vite --force

# IMPORTANT: Run these in separate terminal windows/sessions
```

### Other Commands
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm lint

# Install dependencies (use if encountering permission errors on Windows)
npm install --legacy-peer-deps
```

### Server Troubleshooting
- **Frontend fails silently (exit code 1)**: Use `npx vite --force` to force dependency re-optimization
- **Backend database connection fails**: Check MySQL server availability at 116.202.114.156:3971
- **Port conflicts**: Frontend uses 5173, backend uses 5000 - ensure ports are available

## Architecture Overview

### Backend API (Flask)
The Flask backend (`/server/app.py`) provides REST API endpoints for the frontend:
- **Port**: 5000
- **Database**: MySQL (host: 116.202.114.156, port: 3971)
- **Main Tables**: `executives`, `targets`, `incentives`, `orders`, etc.
- **Key Endpoints**:
  - `/api/executives/<employee_id>` - Get executive details
  - `/api/targets/<employee_id>` - Get daily/weekly targets
  - `/api/incentives/<employee_id>` - Get incentive calculations
  - `/api/orders/<employee_id>` - Get order history

**Database Connection**:
- Uses MySQL connector with connection pooling
- Database name: `u862661815_salesapp`
- Credentials stored in environment or hardcoded (update for production)

### Routing Structure
- **Public Route**: Login page (`/`) - accessible without authentication
- **Protected Routes**: All other routes require authentication via `isAuthenticated` state
- **Router Wrapper**: `<BrowserRouter>` wraps the entire App in `App.jsx`
- **Nested Routes**: Protected routes use `<Layout>` component which includes `<Outlet>` for nested route rendering

Route hierarchy:
```
/ (Login) → /home → /metric1, /metric2, /metric3, /earnings, /more
```

### Authentication Flow
1. User submits login form (any credentials accepted in demo mode)
2. `handleLogin()` in `App.jsx` sets `isAuthenticated` to `true`
3. App redirects to `/home` via `<Navigate>` component
4. Protected routes render through `<Layout>` component
5. Logout resets `isAuthenticated` and redirects to `/`

**Important**: Login component (`src/pages/Login.jsx`) must NOT use `useNavigate()` hook directly because it renders outside `<Router>`. Navigation after login is handled by parent App component.

### Placeholder Data System
All data hooks are centralized in `src/hooks/usePlaceholderData.js`:

- `useDailyEarnings()` - Daily target and achievement data
- `useTargets()` - AB, Tonnage, OC target metrics
- `useRankings()` - City/Cluster leaderboard rankings
- `useNudgeZoneCustomers()` - All customers with last order info
- `useSoCloseCustomers()` - Customers who opened app but didn't order today
- `useNearbyCustomers()` - Nearby customers with distance/location
- `useAuth()` - Authentication state (unused, kept for future)
- `useMetricsData(type)` - Metric page data (metric1, metric2, metric3)
- `useEarningsData()` - Earnings breakdown and trends

**Database Integration Pattern**:
Each hook contains TODO comments with example SQL queries. To integrate with a real database:
1. Add `useEffect` with async fetch/query
2. Add loading states
3. Replace hardcoded data with fetched data
4. Handle errors appropriately

Example:
```javascript
// Current placeholder pattern
export const useDailyEarnings = () => {
  const [data] = useState({ /* hardcoded data */ });
  return data;
};

// After database integration
export const useDailyEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/daily-earnings');
      setData(await res.json());
      setLoading(false);
    };
    fetchData();
  }, []);

  return { data, loading };
};
```

### Component Structure
- **Pages** (`src/pages/`): Full page components (Login, Home, Metric1-3, Earnings, More)
- **Layout** (`src/components/layout/`): Sidebar + Layout wrapper
- **Home Components** (`src/components/home/`): Dashboard-specific cards (DailyEarningsCard, TargetCard, RankingsCard, CustomerListCard)
- **Shared Components** (`src/components/shared/`): Reusable utilities (ProgressBar, AnimatedCounter)

### Home Dashboard Features

#### Greeting and Global Refresh
- Displays **"Welcome Back Ninja! 👋"** as the main greeting
- Shows current date with clock icon
- **Global Refresh Button** - Replaces the "Your Performance" card
  - Manual refresh button with gradient styling
  - Shows last refreshed time (updates every 10 seconds)
  - Auto-refreshes all data every 10 minutes
  - Refreshes: targets data and DailyEarningsCard incentives
  - Located in header next to greeting

#### Daily Earnings Card with Live Timer
The `DailyEarningsCard` component displays:
- **⚡ Final Push Today!** - Remaining target amount for today
  - Shows amount in large font
  - Subtitle: "₹X left for the day"
  - Fire icon with orange gradient background
- **🎯 Remaining for the Week** - Remaining target for the week
  - Shows `weeklyRemainingTarget` amount
  - Subtitle: "₹X left for the week"
  - Trophy icon with purple gradient background
- **Live Countdown Timer** - Shows time remaining until end of day (HH:MM:SS format)
  - Updates every second using `setInterval`
  - Positioned as a badge in top-right corner
  - Purple gradient background with pulsing clock icon

Data structure required:
```javascript
{
  remainingTarget: 25000,        // Daily remaining
  achievedToday: 18500,
  totalTarget: 43500,
  percentage: 42.5,
  weeklyRemainingTarget: 85000,  // Weekly remaining
}
```

#### Target Cards with Navigation
Three clickable target cards (AB, Tonnage, OC) that navigate to detailed metric pages:
- **AB (Annual Budget)** → Clicking navigates to `/metric1`
- **Tonnage (Product Tonnage)** → Clicking navigates to `/metric2`
- **OC (Order Count)** → Clicking navigates to `/metric3`

Features:
- Cards are clickable with `cursor-pointer` styling
- Hover effect with scale animation
- Uses `useNavigate()` hook from React Router
- Each card shows progress, achieved/target values, and status badges

#### Customer Engagement Section
Three scrollable customer list cards displayed in a grid:

1. **💬 Nudge Zone** - All customers needing engagement
   - Shows: Customer ID, Name, Phone, Last Order
   - Scrollable list (max height: 24rem)

2. **🔥 So Close!** - Customers who opened app but didn't order today
   - Shows: Customer ID, Name, Phone, Last Seen time
   - Highlights potential conversion opportunities

3. **📍 In and Around You** - Nearby customers based on location
   - Shows: Customer ID, Name, Phone, Distance, Location
   - Sorted by proximity for field visits

Each customer card includes:
- Hover effects with border color change
- "Call" button for quick contact
- Scrollable content area
- Footer showing total count

### Styling System
- **Framework**: Tailwind CSS with custom configuration
- **Theme**: Purple color scheme (#6C5DD3 primary)
- **Custom Classes**: Defined in `src/index.css` (`.gradient-bg`, `.card`, `.btn-primary`, `.input-field`)
- **Responsive**: Mobile-first with breakpoints (sidebar → bottom nav on mobile)
- **Animations**: Custom CSS animations + potential Framer Motion integration

Color palette:
- Primary: `#6C5DD3` (purple)
- Success: `#10B981` (green)
- Warning: `#F59E0B` (orange)
- Danger: `#EF4444` (red)

### Desktop vs Mobile Behavior
**Desktop** (≥768px):
- Sidebar on left (auto-expands on hover)
- Icon-only collapsed state (80px), full labels on hover (256px)
- **Main content adjusts dynamically**:
  - Collapsed sidebar: `md:ml-20` (80px margin)
  - Expanded sidebar: `md:ml-64` (256px margin)
  - Sidebar state managed in `Layout.jsx` and passed to `Sidebar.jsx` as props
  - Smooth transition prevents content overlap

**Mobile** (<768px):
- Bottom navigation bar (fixed position)
- 5 main nav items + logout
- Content uses full width with bottom padding (`pb-20`)

## Important Patterns & Constraints

### React Icons Usage
Only use icons from `react-icons/fa` that actually exist. Common mistake: `FaTrendingUp` doesn't exist - use `FaArrowUp` instead.

Check available icons at: https://react-icons.github.io/react-icons/icons/fa/

### React Version
Currently using **React 18.3.1** (downgraded from 19.x for compatibility). Do not upgrade to React 19 without testing all dependencies.

### State Management
Authentication state lives in `App.jsx` and is passed down via props. No external state management library (Redux, Zustand, etc.) is used.

### Protected Route Pattern
```jsx
<Route
  path="/*"
  element={
    isAuthenticated ? <Layout /> : <Navigate to="/" replace />
  }
>
  <Route path="home" element={<Home />} />
  {/* ... nested routes */}
</Route>
```

## Key Files to Modify

### Adding New Pages
1. Create component in `src/pages/NewPage.jsx`
2. Add route in `App.jsx` inside protected routes section
3. Add navigation item to `Sidebar.jsx` (both desktop and mobile arrays)
4. Create placeholder data hook in `usePlaceholderData.js` if needed

### Integrating Database
Primary file: `src/hooks/usePlaceholderData.js`
- Replace each hook's hardcoded data with API calls
- Search for `// TODO:` comments for integration points
- Maintain same return structure to avoid breaking components

### Styling Changes
- Theme colors: `tailwind.config.js` → `theme.extend.colors`
- Global styles: `src/index.css`
- Component-specific: Tailwind utility classes in JSX

## Demo Mode Behavior
- **Login**: Accepts any credentials (no validation)
- **Data**: All hardcoded in placeholder hooks
- **Navigation**: Full access after login
- **Logout**: Clears auth state, returns to login

## Known Gotchas
1. **Running Servers**: Both frontend (Vite) and backend (Flask) must be running for full functionality
   - Backend: `cd server && python app.py` (port 5000)
   - Frontend: `npx vite --force` (port 5173)
   - Run in separate terminal sessions/windows
2. **Frontend Silent Failures**: If `npm run dev` exits with code 1 without errors, use `npx vite --force` to force dependency re-optimization
3. Don't use `useNavigate()` in Login component (outside Router context)
4. Vite dev server runs on port 5173 (configurable in `vite.config.js`)
5. Windows may require admin permissions for `npm install`
6. Hard refresh (Ctrl+Shift+R) often needed after major changes
7. Sidebar hover effect requires `onMouseEnter`/`onMouseLeave` events
