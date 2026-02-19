import { Navigate, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        {/* Vintifi wordmark */}
        <span
          className="text-2xl font-bold text-primary tracking-tight"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Vintifi
        </span>

        {/* Spinning coral ring */}
        <motion.div
          className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
