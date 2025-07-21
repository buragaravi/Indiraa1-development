# E-Commerce Frontend Application

![React](https://img.shields.io/badge/React-v19.1+-blue.svg)
![Vite](https://img.shields.io/badge/Vite-v6.3+-purple.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.1+-cyan.svg)
![PWA](https://img.shields.io/badge/PWA-Enabled-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 📋 Overview

A modern, responsive e-commerce frontend application built with React 19, Vite, and TailwindCSS. This application provides a complete shopping experience with multi-role dashboards, real-time analytics, PWA capabilities, and comprehensive order management.

### 🚀 Key Features

- **Multi-Role Dashboards**: Customer, Admin, Sub-Admin, Warehouse Manager, Delivery Agent
- **Responsive Design**: Mobile-first approach with full responsive support
- **Progressive Web App (PWA)**: Offline functionality and app-like experience
- **Real-time Analytics**: Interactive charts and data visualization
- **Order Management**: Complete order lifecycle with tracking
- **Return System**: Comprehensive return and refund management
- **Batch Management**: Advanced inventory tracking and allocation
- **Delivery Tracking**: Real-time delivery updates with map integration
- **Wallet System**: Virtual wallet with coins and transaction history
- **Referral Program**: User referrals with reward tracking
- **Push Notifications**: Real-time notifications with service worker
- **Dark/Light Theme**: Theme switching with system preference detection
- **Internationalization**: Multi-language support ready

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: React 19.1+ with Hooks and Context API
- **Build Tool**: Vite 6.3+ for lightning-fast development
- **Styling**: TailwindCSS 4.1+ with custom design system
- **Router**: React Router DOM 7.6+ for navigation
- **State Management**: React Context API + Custom Hooks

### UI & UX Libraries
- **Icons**: React Icons 5.5+ & Lucide React 0.525+
- **Animations**: Framer Motion 12.18+ for smooth transitions
- **Charts**: Recharts 2.15+ for data visualization
- **Notifications**: React Hot Toast 2.5+ for user feedback
- **Lottie**: React Lottie 1.2+ for animations

### Utilities & Services
- **HTTP Client**: Axios 1.10+ for API communication
- **File Processing**: PapaParse 5.5+ for CSV handling
- **Excel Support**: XLSX 0.18+ for spreadsheet operations
- **QR Codes**: QRCode React 4.2+ for QR generation
- **Storage**: LocalForage 1.10+ & IndexedDB (IDB 8.0+)
- **PWA**: Vite Plugin PWA 1.0+ with Workbox

### Development Tools
- **Linting**: ESLint 9.25+ with React plugins
- **Code Quality**: Pre-commit hooks and formatting
- **Hot Reload**: Vite HMR for instant development feedback

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git installed

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your configuration
nano .env

# Start the development server
npm run dev

# Open browser at http://localhost:5173
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=E-Commerce App
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Modern E-Commerce Platform

# PWA Configuration
VITE_PWA_NAME=E-Commerce
VITE_PWA_SHORT_NAME=ECommerce
VITE_PWA_THEME_COLOR=#10b981
VITE_PWA_BACKGROUND_COLOR=#ffffff

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_DARK_MODE=true

# External Services
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
VITE_FIREBASE_CONFIG=your_firebase_config

# Development
VITE_DEBUG_MODE=true
VITE_MOCK_DATA=false
```

## 📁 Project Structure

```
frontend/
├── public/                     # Static assets
│   ├── icons/                 # App icons and favicons
│   ├── images/                # Static images
│   └── manifest.json          # PWA manifest
├── src/
│   ├── admin/                 # Admin-specific components
│   │   ├── dashboard/         # Admin dashboard
│   │   ├── analytics/         # Admin analytics
│   │   └── management/        # User/product management
│   ├── components/            # Reusable components
│   │   ├── admin/             # Admin components
│   │   ├── analytics/         # Chart components
│   │   ├── auth/              # Authentication components
│   │   ├── checkout/          # Checkout flow
│   │   ├── common/            # Shared components
│   │   ├── customer/          # Customer components
│   │   ├── delivery/          # Delivery components
│   │   ├── home/              # Homepage components
│   │   ├── layout/            # Layout components
│   │   ├── pwa/               # PWA components
│   │   ├── returns/           # Return management
│   │   ├── subadmin/          # Sub-admin components
│   │   └── warehouse/         # Warehouse components
│   ├── context/               # React Context providers
│   │   ├── AuthContext.jsx    # Authentication state
│   │   ├── CartContext.jsx    # Shopping cart state
│   │   ├── ThemeContext.jsx   # Theme management
│   │   └── NotificationContext.jsx # Notifications
│   ├── hooks/                 # Custom React hooks
│   │   ├── useApi.js          # API communication
│   │   ├── useAuth.js         # Authentication logic
│   │   ├── useLocalStorage.js # Local storage management
│   │   ├── usePWA.js          # PWA functionality
│   │   └── useSocket.js       # WebSocket connection
│   ├── pages/                 # Page components
│   │   ├── admin/             # Admin pages
│   │   ├── auth/              # Authentication pages
│   │   ├── customer/          # Customer pages
│   │   ├── delivery/          # Delivery agent pages
│   │   ├── subadmin/          # Sub-admin pages
│   │   └── warehouse/         # Warehouse pages
│   ├── services/              # API services
│   │   ├── api.js             # Base API configuration
│   │   ├── authService.js     # Authentication APIs
│   │   ├── productService.js  # Product APIs
│   │   ├── orderService.js    # Order APIs
│   │   ├── returnService.js   # Return APIs
│   │   └── analyticsService.js # Analytics APIs
│   ├── styles/                # Global styles
│   │   ├── globals.css        # Global CSS
│   │   ├── components.css     # Component styles
│   │   └── themes.css         # Theme variables
│   ├── utils/                 # Utility functions
│   │   ├── constants.js       # App constants
│   │   ├── helpers.js         # Helper functions
│   │   ├── formatters.js      # Data formatters
│   │   ├── validators.js      # Form validators
│   │   └── storage.js         # Storage utilities
│   ├── assets/                # Local assets
│   │   ├── images/            # Image assets
│   │   ├── icons/             # Icon assets
│   │   └── animations/        # Lottie animations
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # Application entry point
│   └── sw.js                  # Service worker
├── dist/                      # Build output
├── .env                       # Environment variables
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML template
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # TailwindCSS configuration
├── vite.config.js             # Vite configuration
└── vercel.json                # Deployment configuration
```

## 🚀 Available Scripts

```bash
# Development
npm run dev              # Start development server with HMR
npm run dev:host         # Start dev server accessible on network
npm run dev:debug        # Start with debug mode enabled

# Building
npm run build            # Build for production
npm run build:analyze    # Build with bundle analyzer
npm run preview          # Preview production build locally

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors automatically
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:e2e         # Run end-to-end tests

# PWA
npm run pwa:dev          # Development with PWA enabled
npm run pwa:build        # Build with PWA optimization

# Utilities
npm run clean            # Clean build artifacts
npm run deps:update      # Update dependencies
npm run analyze          # Analyze bundle size
```

## 🎨 UI/UX Design System

### Color Palette
```css
/* Primary Colors */
--primary-50: #ecfdf5;
--primary-500: #10b981;   /* Main brand color */
--primary-600: #059669;
--primary-900: #064e3b;

/* Secondary Colors */
--secondary-50: #f0fdf4;
--secondary-500: #22c55e;
--secondary-600: #16a34a;

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-500: #6b7280;
--gray-900: #111827;

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Typography Scale
```css
/* Headings */
.text-xs    { font-size: 0.75rem; }
.text-sm    { font-size: 0.875rem; }
.text-base  { font-size: 1rem; }
.text-lg    { font-size: 1.125rem; }
.text-xl    { font-size: 1.25rem; }
.text-2xl   { font-size: 1.5rem; }
.text-3xl   { font-size: 1.875rem; }
.text-4xl   { font-size: 2.25rem; }
```

### Spacing System
```css
/* Consistent spacing scale */
.space-1    { margin: 0.25rem; }
.space-2    { margin: 0.5rem; }
.space-4    { margin: 1rem; }
.space-6    { margin: 1.5rem; }
.space-8    { margin: 2rem; }
.space-12   { margin: 3rem; }
```

## 🏗️ Component Architecture

### Component Categories

#### 1. Layout Components
```jsx
// Main layout wrapper
<Layout>
  <Header />
  <Sidebar />
  <MainContent />
  <Footer />
</Layout>

// Responsive grid system
<Grid cols={12} gap={4}>
  <GridItem span={8}>Content</GridItem>
  <GridItem span={4}>Sidebar</GridItem>
</Grid>
```

#### 2. UI Components
```jsx
// Buttons with variants
<Button variant="primary" size="lg" loading={isLoading}>
  Submit Order
</Button>

// Form controls
<Input 
  type="email" 
  validation={emailValidator}
  error={errors.email}
/>

// Data display
<Card className="shadow-lg">
  <CardHeader>
    <CardTitle>Order Details</CardTitle>
  </CardHeader>
  <CardContent>
    <OrderItems />
  </CardContent>
</Card>
```

#### 3. Feature Components
```jsx
// Product catalog
<ProductGrid 
  products={products}
  onProductClick={handleProductClick}
  loading={isLoading}
/>

// Order tracking
<OrderTracker 
  orderId={orderId}
  realTime={true}
/>

// Analytics dashboard
<AnalyticsDashboard 
  dateRange={dateRange}
  metrics={['revenue', 'orders', 'customers']}
/>
```

## 🔐 Authentication & Authorization

### Authentication Flow
```jsx
// Protected route wrapper
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

// Role-based component rendering
{hasPermission('orders.create') && (
  <CreateOrderButton />
)}

// Authentication context usage
const { user, login, logout, isAuthenticated } = useAuth();
```

### User Roles & Permissions
```javascript
const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  SUB_ADMIN: 'sub_admin',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  DELIVERY_AGENT: 'delivery_agent'
};

const PERMISSIONS = {
  'orders.create': ['customer', 'admin'],
  'orders.manage': ['admin', 'sub_admin'],
  'products.manage': ['admin', 'warehouse_manager'],
  'analytics.view': ['admin', 'sub_admin']
};
```

## 📱 Progressive Web App (PWA)

### PWA Features
- **Offline Functionality**: Works without internet connection
- **App-like Experience**: Full-screen mode with native feel
- **Push Notifications**: Real-time updates
- **Background Sync**: Sync data when connection is restored
- **Install Prompt**: Add to home screen capability

### Service Worker Configuration
```javascript
// sw.js - Service Worker
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate()
);
```

### PWA Installation
```jsx
// PWA install prompt component
const PWAInstallPrompt = () => {
  const { isInstallable, install } = usePWA();
  
  return isInstallable ? (
    <Button onClick={install}>
      Install App
    </Button>
  ) : null;
};
```

## 📊 State Management

### Context Providers
```jsx
// App.jsx - Context setup
<AuthProvider>
  <ThemeProvider>
    <CartProvider>
      <NotificationProvider>
        <Router>
          <App />
        </Router>
      </NotificationProvider>
    </CartProvider>
  </ThemeProvider>
</AuthProvider>
```

### Custom Hooks
```jsx
// useApi hook example
const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, [endpoint]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoint, options);
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  return { data, loading, error, refetch: fetchData };
};
```

## 🎯 Performance Optimization

### Code Splitting
```jsx
// Route-level code splitting
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));

// Component lazy loading
<Suspense fallback={<LoadingSpinner />}>
  <Route path="/admin" component={AdminDashboard} />
</Suspense>
```

### Image Optimization
```jsx
// Optimized image component
<OptimizedImage
  src="/products/product-1.jpg"
  alt="Product Name"
  width={300}
  height={300}
  lazy={true}
  quality={80}
/>
```

### Bundle Optimization
- **Tree Shaking**: Automatic dead code elimination
- **Code Splitting**: Route and component-level splitting
- **Asset Optimization**: Image compression and lazy loading
- **Caching Strategy**: Aggressive caching for static assets

## 📱 Responsive Design

### Breakpoint System
```css
/* Mobile First Approach */
.container {
  @apply px-4;           /* Mobile */
  @apply sm:px-6;        /* 640px+ */
  @apply md:px-8;        /* 768px+ */
  @apply lg:px-12;       /* 1024px+ */
  @apply xl:px-16;       /* 1280px+ */
  @apply 2xl:px-20;      /* 1536px+ */
}
```

### Component Responsiveness
```jsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// Responsive navigation
<nav className="hidden md:flex md:space-x-8">
  <NavLink to="/products">Products</NavLink>
  <NavLink to="/orders">Orders</NavLink>
</nav>
```

## 🧪 Testing Strategy

### Testing Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

### Test Examples
```jsx
// Component test
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

test('renders product card with correct information', () => {
  const product = {
    id: 1,
    name: 'Test Product',
    price: 99.99
  };
  
  render(<ProductCard product={product} />);
  
  expect(screen.getByText('Test Product')).toBeInTheDocument();
  expect(screen.getByText('$99.99')).toBeInTheDocument();
});

// Hook test
import { renderHook } from '@testing-library/react';
import { useAuth } from './useAuth';

test('useAuth returns correct initial state', () => {
  const { result } = renderHook(() => useAuth());
  
  expect(result.current.isAuthenticated).toBe(false);
  expect(result.current.user).toBe(null);
});
```

## 🚀 Deployment

### Build Configuration
```bash
# Production build
npm run build

# Build with environment
VITE_NODE_ENV=production npm run build

# Preview production build
npm run preview
```

### Deployment Platforms

#### Vercel Deployment
```json
// vercel.json
{
  "build": {
    "env": {
      "VITE_API_BASE_URL": "@api-base-url"
    }
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### Netlify Deployment
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📈 Analytics & Monitoring

### Performance Monitoring
```jsx
// Performance tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### User Analytics
```jsx
// Custom analytics hook
const useAnalytics = () => {
  const trackEvent = (eventName, properties) => {
    // Send to analytics service
    analytics.track(eventName, properties);
  };
  
  const trackPageView = (pageName) => {
    analytics.page(pageName);
  };
  
  return { trackEvent, trackPageView };
};
```

## 🔧 Development Guidelines

### Code Style
```javascript
// ESLint configuration
module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error'
  }
};
```

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/new-dashboard
git add .
git commit -m "feat: add new analytics dashboard"
git push origin feature/new-dashboard

# Create pull request
# After review and approval, merge to main
```

### Component Guidelines
```jsx
// Component structure template
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ComponentName.css';

const ComponentName = ({ prop1, prop2, onAction }) => {
  const [state, setState] = useState(initialState);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  const handleAction = () => {
    onAction?.(data);
  };
  
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  onAction: PropTypes.func
};

ComponentName.defaultProps = {
  prop2: 0,
  onAction: null
};

export default ComponentName;
```

## 🐛 Troubleshooting

### Common Issues

#### Vite Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
npx vite build --force
```

#### TailwindCSS Not Working
```bash
# Verify tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
}
```

#### API Connection Issues
```javascript
// Check API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Verify CORS settings
// Ensure backend allows frontend origin
```

#### PWA Not Installing
```javascript
// Check manifest.json
{
  "name": "E-Commerce App",
  "short_name": "ECommerce",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981"
}
```

### Debug Mode
```bash
# Enable debug logging
VITE_DEBUG_MODE=true npm run dev

# React DevTools
# Install React Developer Tools browser extension

# Vite debug
DEBUG=vite:* npm run dev
```

## 📞 Support & Community

### Documentation
- [Component Library](#component-architecture) - Reusable component guide
- [API Integration](#) - Backend integration guide
- [PWA Guide](#progressive-web-app-pwa) - PWA implementation
- [Deployment Guide](#deployment) - Production deployment

### Getting Help
- **Issues**: [GitHub Issues](link-to-issues)
- **Discussions**: [GitHub Discussions](link-to-discussions)
- **Email**: frontend-support@yourdomain.com

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 🔄 Changelog

### Version 1.0.0 (Current)
- ✅ Complete responsive design system
- ✅ Multi-role authentication and dashboards
- ✅ PWA functionality with offline support
- ✅ Real-time analytics and charts
- ✅ Comprehensive order management
- ✅ Return and refund system
- ✅ Batch and inventory management
- ✅ Delivery tracking system
- ✅ Wallet and referral system
- ✅ Push notification support

### Upcoming Features (v1.1.0)
- 🔄 Enhanced mobile experience
- 🔄 Advanced search and filtering
- 🔄 Real-time chat support
- 🔄 Voice search capability
- 🔄 AR product preview
- 🔄 Multi-language support
- 🔄 Advanced PWA features
- 🔄 Performance optimizations

## 📋 FAQ

### General Questions

**Q: What browsers are supported?**
A: Modern browsers including Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

**Q: Is the app mobile-friendly?**
A: Yes, it's built with mobile-first responsive design and PWA capabilities

**Q: Can I use this offline?**
A: Yes, PWA functionality allows basic offline browsing and data sync

### Technical Questions

**Q: How do I add a new component?**
A: Follow the component structure in `/src/components` and update the style guide

**Q: How do I integrate with a different backend?**
A: Update the API base URL in `.env` and modify service files in `/src/services`

**Q: How do I customize the theme?**
A: Modify TailwindCSS config and CSS custom properties in `/src/styles`

## 🏗️ Architecture Overview

### Application Flow
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  React Router   │───▶│   Page Component│
│   (Browser)     │    │   (Routing)     │    │    (Render)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │ Context Providers│
                        │ (State Management)│
                        └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │   API Services  │
                        │  (HTTP Requests)│
                        └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  Backend API    │
                        │   (Express.js)  │
                        └─────────────────┘
```

### Component Hierarchy
```
App
├── AuthProvider
├── ThemeProvider
├── CartProvider
├── NotificationProvider
└── Router
    ├── Layout
    │   ├── Header
    │   ├── Sidebar
    │   └── Footer
    └── Pages
        ├── CustomerDashboard
        ├── AdminDashboard
        ├── ProductCatalog
        ├── OrderManagement
        └── Analytics
```

## 🔐 Security Features

### Client-Side Security
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Token-based request validation
- **Secure Storage**: Encrypted local storage for sensitive data
- **Content Security Policy**: Strict CSP headers
- **Dependency Security**: Regular security audits

### Authentication Security
- **JWT Token Management**: Secure token storage and refresh
- **Role-Based Access**: Component-level permission checks
- **Session Management**: Automatic logout on inactivity
- **Secure Communication**: HTTPS enforcement

## 📊 Performance Metrics

### Target Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Bundle Size Targets
- **Initial Bundle**: < 250KB gzipped
- **Vendor Bundle**: < 150KB gzipped
- **Route Chunks**: < 50KB gzipped each
- **Assets**: Optimized images and fonts

## 📖 Additional Resources

### Learning Resources
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

### Tools & Extensions
- **React DevTools**: Browser extension for debugging
- **Redux DevTools**: State management debugging
- **Lighthouse**: Performance and PWA auditing
- **VS Code Extensions**: ES7+ React snippets, Tailwind IntelliSense

---

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style and conventions
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting PR

### Code Review Process
1. All PRs require at least one review
2. Automated tests must pass
3. Documentation must be updated
4. Security implications must be considered

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
Error: MongoNetworkError: failed to connect to server
```
**Solution**: Ensure MongoDB is running and connection string is correct

#### JWT Token Invalid
```bash
Error: jwt malformed
```
**Solution**: Check token format and ensure it's properly passed in headers

#### File Upload Error
```bash
Error: LIMIT_FILE_SIZE
```
**Solution**: Check file size limits in configuration

#### CORS Error
```bash
Access-Control-Allow-Origin error
```
**Solution**: Update CORS configuration with correct frontend URL

### Debug Mode
```bash
# Enable debug logging
DEBUG=app:* npm run dev

# Database debug
DEBUG=mongoose:* npm run dev
```

## 📞 Support

### Documentation
- [API Documentation](#) - Complete API reference
- [Database Schema](#database-models-overview) - Data structure guide
- [Authentication Guide](#authentication--authorization) - Auth implementation

### Contact
- **Email**: support@yourdomain.com
- **Issues**: [GitHub Issues](link-to-issues)
- **Discussions**: [GitHub Discussions](link-to-discussions)

### Community
- **Discord**: [Join our Discord](link-to-discord)
- **Stack Overflow**: Tag `your-project-name`

## 🔄 Changelog

### Version 1.0.0 (Current)
- ✅ Complete authentication system
- ✅ Product management with variants
- ✅ Order processing and tracking
- ✅ Return and refund system
- ✅ Batch inventory management
- ✅ Delivery agent integration
- ✅ Analytics dashboard
- ✅ Referral and rewards system
- ✅ Wallet and transaction management
- ✅ Push notification system

### Upcoming Features (v1.1.0)
- 🔄 Payment gateway integration
- 🔄 Advanced search and filtering
- 🔄 Inventory forecasting
- 🔄 Multi-language support
- 🔄 Advanced analytics with charts
- 🔄 Automated testing suite
- 🔄 API rate limiting improvements

## 📋 FAQ

### General Questions

**Q: What databases are supported?**
A: Currently MongoDB is the primary database. PostgreSQL support is planned for v2.0.

**Q: Can I use this API with mobile apps?**
A: Yes, this REST API works with any client that can make HTTP requests.

**Q: Is there a rate limit?**
A: Yes, rate limiting is implemented. See [Rate Limiting](#rate-limiting) section.

### Technical Questions

**Q: How do I handle file uploads?**
A: Use multipart/form-data with appropriate endpoints. See [File Upload Guidelines](#file-upload-guidelines).

**Q: How do I implement real-time features?**
A: WebSocket support is planned. Currently use polling or implement custom WebSocket layer.

**Q: Can I customize the user roles?**
A: Yes, the role system is flexible. Modify the auth middleware and models as needed.

## 🏗️ Architecture

### System Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend App  │───▶│   Backend API   │───▶│    MongoDB      │
│   (React/Vue)   │    │   (Express.js)  │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  External APIs  │
                        │ (Email, SMS,    │
                        │  Payments)      │
                        └─────────────────┘
```

### Request Flow
1. **Client Request** → API Gateway
2. **Authentication** → JWT Validation
3. **Authorization** → Role/Permission Check
4. **Validation** → Request Body Validation
5. **Business Logic** → Controller Processing
6. **Database** → MongoDB Operations
7. **Response** → JSON Response

### Database Design Principles
- **Normalization** for relational data integrity
- **Denormalization** for performance optimization
- **Indexing** on frequently queried fields
- **Aggregation Pipelines** for complex analytics

## 🔐 Security Best Practices

### Authentication Security
- Secure JWT secret rotation
- Token expiration handling
- Refresh token mechanism
- Multi-factor authentication (planned)

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF token implementation

### Infrastructure Security
- HTTPS enforcement
- Security headers (Helmet.js)
- Rate limiting and DDoS protection
- Regular security audits

## 📊 Performance Metrics

### Response Time Targets
- **Authentication**: < 200ms
- **Product Listing**: < 500ms
- **Order Creation**: < 1s
- **Analytics Queries**: < 2s

### Scalability
- **Concurrent Users**: 1000+ supported
- **Requests per Second**: 500+ supported
- **Database Connections**: Pooled for efficiency
- **Memory Usage**: Optimized for production

## 📖 Additional Resources

### Learning Resources
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [REST API Design Guidelines](https://restfulapi.net/)

### Tools & Extensions
- **Postman Collection**: Available in `/postman` directory
- **Swagger/OpenAPI**: Auto-generated documentation
- **Database Visualization**: MongoDB Compass recommended
- **API Testing**: Jest + Supertest

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Your Company Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Vite Team** for the lightning-fast build tool
- **TailwindCSS Team** for the utility-first CSS framework
- **Open Source Community** for the incredible ecosystem

---

**Made with ❤️ by [Your Team Name]**

For more information, visit our [website](https://yourdomain.com) or contact us at [frontend-support@yourdomain.com](mailto:frontend-support@yourdomain.com)
