import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import Index from "./pages/Index";
import LoveNotes from "./pages/LoveNotes";
import Events from "./pages/Events";
import Surprises from "./pages/Surprises";
import Memories from "./pages/Memories";
import BucketList from "./pages/BucketList";
import ReasonsILoveYou from "./pages/ReasonsILoveYou";
import Challenges from "./pages/Challenges";
import CheckIns from "./pages/CheckIns";
import LoveLanguageQuiz from "./pages/LoveLanguageQuiz";
import Stats from "./pages/Stats";
import MindfulMoments from "./pages/MindfulMoments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="max-w-md mx-auto min-h-screen bg-background relative">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/love-notes" element={<LoveNotes />} />
            <Route path="/reasons" element={<ReasonsILoveYou />} />
            <Route path="/events" element={<Events />} />
            <Route path="/surprises" element={<Surprises />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/bucket-list" element={<BucketList />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/check-ins" element={<CheckIns />} />
            <Route path="/love-quiz" element={<LoveLanguageQuiz />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/mindful" element={<MindfulMoments />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
