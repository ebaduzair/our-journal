import { Heart, ListChecks, Home, Utensils, HeartHandshake } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Heart, label: 'Love', path: '/love-notes' },
  { icon: Utensils, label: 'Food', path: '/food-log' },
  { icon: ListChecks, label: 'Bucket', path: '/bucket-list' },
  { icon: HeartHandshake, label: 'Safe', path: '/safe-space' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border safe-area-inset-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 py-2 relative"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 w-8 h-1 rounded-full gradient-romantic"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`p-1.5 rounded-xl transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                <Icon className="w-5 h-5" fill={isActive ? 'currentColor' : 'none'} />
              </motion.div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'
                }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
