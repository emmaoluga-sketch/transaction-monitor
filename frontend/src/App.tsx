import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CreditCard, Bell, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import TransactionTable from './components/transactions/TransactionTable';
import CustomerTable from './components/customers/CustomerTable';
import AlertList from './components/alerts/AlertList';
import TransactionDetails from './components/transactions/TransactionDetails';
import CustomerDetails from './components/customers/CustomerDetails';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const navItems = [
  { path: '/transactions', label: 'Transactions', icon: CreditCard },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/alerts', label: 'Alerts', icon: Bell },
];

function App() {
  const { token, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  if (!token) return <Login />;

  return (
    <div className="app-layout">
      {/* Mobile toggle button - always rendered, hidden on desktop with CSS */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">📊</div>
          <div className="sidebar-brand-text">
            Smart<span>Comply</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button className="sidebar-logout" onClick={logout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>

        <div className="sidebar-user">
          <div className="sidebar-user-label">Logged in as</div>
          <div className="sidebar-user-name">Admin</div>
        </div>
      </motion.aside>

      {/* Mobile backdrop */}
      {sidebarOpen && isMobile && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">
            {location.pathname === '/transactions' && '💳 Transactions'}
            {location.pathname === '/customers' && '👥 Customers'}
            {location.pathname === '/alerts' && '🔔 Alerts'}
            {location.pathname === '/' && '📊 Dashboard'}
            {location.pathname.startsWith('/transactions/') && '📄 Transaction Details'}
            {location.pathname.startsWith('/customers/') && '👤 Customer Details'}
          </h2>
          <p className="page-subtitle">
            {location.pathname === '/transactions' && 'Monitor and manage your financial data'}
            {location.pathname === '/customers' && 'View and manage your customers'}
            {location.pathname === '/alerts' && 'Track all triggered alerts'}
            {location.pathname.startsWith('/transactions/') && 'View full transaction details'}
            {location.pathname.startsWith('/customers/') && 'View customer profile and transactions'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className="content-card"
          >
            <Routes location={location}>
              <Route path="/transactions" element={<TransactionTable />} />
              <Route path="/transactions/:id" element={<TransactionDetails />} />
              <Route path="/customers" element={<CustomerTable />} />
              <Route path="/customers/:id" element={<CustomerDetails />} />
              <Route path="/alerts" element={<AlertList />} />
              <Route path="/" element={<TransactionTable />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;