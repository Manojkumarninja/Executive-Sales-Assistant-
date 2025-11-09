# Sales Executive Web App

A gamified, professional web application for sales executives to track their performance, targets, and earnings.

## Features

- **Authentication**: Secure login page with username, email, and password
- **Dashboard (Home)**:
  - Daily earnings tracker with "Last Mile for Today" and "Today's Victory"
  - Three target cards (AB, Tonnage, OC) with progress tracking
  - Rankings leaderboard with City/Cluster toggle
- **Metrics Pages**: Track Customer Acquisition, Product Mix, and Market Coverage
- **Earnings Dashboard**: View detailed earnings breakdown and trends
- **More Options**: Access to profile, settings, and additional features
- **Responsive Design**: Mobile-first approach with bottom navigation on mobile
- **Gamified UI**: Animated counters, progress bars, and motivational elements

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animations (optional enhancement)
- **React Icons** - Icon library
- **React Circular Progressbar** - Progress visualizations

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps

1. **Install Dependencies**

   If you encounter permission errors with npm install, try one of these approaches:

   ```bash
   # Option 1: Use legacy peer deps
   npm install --legacy-peer-deps

   # Option 2: Clean install
   rm -rf node_modules package-lock.json
   npm install

   # Option 3: Run as administrator (Windows)
   # Right-click Command Prompt -> Run as Administrator
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Navigate to `http://localhost:5173`
   - Login with any credentials (placeholder authentication)

4. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
SalesExecutiveApp/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   ├── home/
│   │   │   ├── DailyEarningsCard.jsx
│   │   │   ├── TargetCard.jsx
│   │   │   └── RankingsCard.jsx
│   │   └── shared/
│   │       ├── ProgressBar.jsx
│   │       └── AnimatedCounter.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Home.jsx
│   │   ├── Metric1.jsx
│   │   ├── Metric2.jsx
│   │   ├── Metric3.jsx
│   │   ├── Earnings.jsx
│   │   └── More.jsx
│   ├── hooks/
│   │   └── usePlaceholderData.js
│   ├── App.jsx
│   └── main.jsx
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Placeholder Data & Database Integration

All data is currently using **placeholder hooks** located in `src/hooks/usePlaceholderData.js`.

### To Integrate with Your Database:

1. **Daily Earnings** (`useDailyEarnings` hook)
   - Replace placeholder with API call to fetch daily targets and achievements
   - Example query location: Line 8-15 in `usePlaceholderData.js`

2. **Targets** (`useTargets` hook)
   - Replace with query for AB, Tonnage, and OC targets
   - Example query location: Line 29-44 in `usePlaceholderData.js`

3. **Rankings** (`useRankings` hook)
   - Replace with query for city and cluster rankings
   - Example query location: Line 63-79 in `usePlaceholderData.js`

4. **Authentication** (`useAuth` hook)
   - Replace with actual authentication API
   - Example location: Line 86-113 in `usePlaceholderData.js`

5. **Metrics Data** (`useMetricsData` hook)
   - Replace with actual metrics queries
   - Example location: Line 116-149 in `usePlaceholderData.js`

6. **Earnings Data** (`useEarningsData` hook)
   - Replace with earnings breakdown queries
   - Example location: Line 152-182 in `usePlaceholderData.js`

### Example Database Integration:

```javascript
// Before (Placeholder)
export const useDailyEarnings = () => {
  const [data, setData] = useState({
    remainingTarget: 25000,
    achievedToday: 18500,
    // ... more placeholder data
  });
  return data;
};

// After (Database Integration)
export const useDailyEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/daily-earnings');
      const result = await response.json();
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { data, loading };
};
```

## Color Scheme

- **Primary Purple**: #6C5DD3
- **Success Green**: #10B981
- **Warning Orange**: #F59E0B
- **Danger Red**: #EF4444

## Features to Add

- [ ] Connect to actual database
- [ ] Implement real authentication (JWT, OAuth, etc.)
- [ ] Add chart libraries (Chart.js, Recharts, etc.)
- [ ] Add real-time data updates via WebSocket
- [ ] Implement push notifications
- [ ] Add PDF report generation
- [ ] Add data export functionality (CSV, Excel)
- [ ] Implement user profile management
- [ ] Add dark mode toggle
- [ ] Add multi-language support

## Demo Credentials

Since authentication is currently placeholder-based, you can login with **any username, email, and password**.

## Notes

- All TODO comments in the code indicate where database queries should be integrated
- The app is fully responsive and works on mobile, tablet, and desktop
- Animations are built with CSS and custom React hooks
- The sidebar auto-expands on hover (desktop) and uses bottom navigation on mobile

## Support

For issues or questions, please refer to the inline code comments marked with `TODO:` tags.

---

**Built with ❤️ for Sales Excellence**
