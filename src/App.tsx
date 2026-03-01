import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import LoveNotes from "./pages/LoveNotes";
import Events from "./pages/Events";
import Surprises from "./pages/Surprises";

import BucketList from "./pages/BucketList";
import ReasonsILoveYou from "./pages/ReasonsILoveYou";
import Challenges from "./pages/Challenges";
import CheckIns from "./pages/CheckIns";
import LoveLanguageQuiz from "./pages/LoveLanguageQuiz";
import Emergency from "./pages/Emergency";
import MindfulMoments from "./pages/MindfulMoments";
import SafeSpace from "./pages/SafeSpace";
import Chat from "./pages/Chat";
import FoodLog from "./pages/FoodLog";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

import { useState as useStateReact, useEffect as useEffectReact } from "react";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Heart className="w-12 h-12 text-primary fill-primary" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user exists but no couple code, show couple setup (handled in AuthPage)
  if (!profile?.couple_code) {
    return <AuthPage />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const [timedOut, setTimedOut] = useStateReact(false);

  // Safety timeout: if loading takes more than 20 seconds, force render
  useEffectReact(() => {
    if (!loading) {
      setTimedOut(false);
      return;
    }
    const timer = setTimeout(() => {
      console.error('[App] Loading timed out after 20s — forcing render');
      setTimedOut(true);
    }, 20000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Heart className="w-12 h-12 text-primary fill-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative">
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/love-notes" element={<ProtectedRoute><LoveNotes /></ProtectedRoute>} />
        <Route path="/reasons" element={<ProtectedRoute><ReasonsILoveYou /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/surprises" element={<ProtectedRoute><Surprises /></ProtectedRoute>} />

        <Route path="/bucket-list" element={<ProtectedRoute><BucketList /></ProtectedRoute>} />
        <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
        <Route path="/check-ins" element={<ProtectedRoute><CheckIns /></ProtectedRoute>} />
        <Route path="/love-quiz" element={<ProtectedRoute><LoveLanguageQuiz /></ProtectedRoute>} />
        <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
        <Route path="/mindful" element={<ProtectedRoute><MindfulMoments /></ProtectedRoute>} />
        <Route path="/safe-space" element={<ProtectedRoute><SafeSpace /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/food-log" element={<ProtectedRoute><FoodLog /></ProtectedRoute>} />
        <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" storageKey="love-journal-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
