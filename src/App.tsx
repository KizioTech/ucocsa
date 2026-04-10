import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Events from "./pages/Events.tsx";
import Resources from "./pages/Resources.tsx";
import Prayer from "./pages/Prayer.tsx";
import Blog from "./pages/Blog.tsx";
import Contact from "./pages/Contact.tsx";
import Give from "./pages/Give.tsx";
import Join from "./pages/Join.tsx";
import Auth from "./pages/Auth.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminEvents from "./pages/admin/AdminEvents.tsx";
import AdminPrayers from "./pages/admin/AdminPrayers.tsx";
import AdminMembers from "./pages/admin/AdminMembers.tsx";
import AdminBlog from "./pages/admin/AdminBlog.tsx";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements.tsx";
import Profile from "./pages/Profile.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Messages from "./pages/Messages.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/prayer" element={<Prayer />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/give" element={<Give />} />
            <Route path="/join" element={<Join />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/events" element={<ProtectedRoute><AdminEvents /></ProtectedRoute>} />
            <Route path="/admin/prayers" element={<ProtectedRoute><AdminPrayers /></ProtectedRoute>} />
            <Route path="/admin/members" element={<ProtectedRoute><AdminMembers /></ProtectedRoute>} />
            <Route path="/admin/blog" element={<ProtectedRoute><AdminBlog /></ProtectedRoute>} />
            <Route path="/admin/announcements" element={<ProtectedRoute><AdminAnnouncements /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
