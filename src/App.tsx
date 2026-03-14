import { Suspense, lazy, useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

// Eagerly loaded (critical path)
import AuthPage from "./pages/AuthPage";
import Index from "./pages/Index";

// Lazy loaded (only fetched when navigated to)
const LoveNotes = lazy(() => import("./pages/LoveNotes"));
const Events = lazy(() => import("./pages/Events"));
const Surprises = lazy(() => import("./pages/Surprises"));
const BucketList = lazy(() => import("./pages/BucketList"));
const ReasonsILoveYou = lazy(() => import("./pages/ReasonsILoveYou"));
const Challenges = lazy(() => import("./pages/Challenges"));
const CheckIns = lazy(() => import("./pages/CheckIns"));
const LoveLanguageQuiz = lazy(() => import("./pages/LoveLanguageQuiz"));
const Emergency = lazy(() => import("./pages/Emergency"));
const MindfulMoments = lazy(() => import("./pages/MindfulMoments"));
const SafeSpace = lazy(() => import("./pages/SafeSpace"));
const Chat = lazy(() => import("./pages/Chat"));
const FoodLog = lazy(() => import("./pages/FoodLog"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const HabitTracker = lazy(() => import("./pages/HabitTracker"));
const BookClub = lazy(() => import("./pages/BookClub"));

const queryClient = new QueryClient();

// Loading fallback for lazy-loaded pages
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      <Heart className="w-8 h-8 text-primary fill-primary" />
    </motion.div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return <PageLoader />;
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
  const [timedOut, setTimedOut] = useState(false);

  // Safety timeout: if loading takes more than 20 seconds, force render
  useEffect(() => {
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
    return <PageLoader />;
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-background relative">
      <Suspense fallback={<PageLoader />}>
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
          <Route path="/habits" element={<ProtectedRoute><HabitTracker /></ProtectedRoute>} />
          <Route path="/book-club" element={<ProtectedRoute><BookClub /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
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
