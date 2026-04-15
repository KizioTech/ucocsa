import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const Index = lazy(() => import("./pages/Index.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Events = lazy(() => import("./pages/Events.tsx"));
const Resources = lazy(() => import("./pages/Resources.tsx"));
const Prayer = lazy(() => import("./pages/Prayer.tsx"));
const Blog = lazy(() => import("./pages/Blog.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Give = lazy(() => import("./pages/Give.tsx"));
const Join = lazy(() => import("./pages/Join.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents.tsx"));
const AdminPrayers = lazy(() => import("./pages/admin/AdminPrayers.tsx"));
const AdminMembers = lazy(() => import("./pages/admin/AdminMembers.tsx"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog.tsx"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AdminAnnouncements.tsx"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery.tsx"));
const AdminPrograms = lazy(() => import("./pages/admin/AdminPrograms.tsx"));
const AdminTeam = lazy(() => import("./pages/admin/AdminTeam.tsx"));
const AdminHymns = lazy(() => import("./pages/admin/AdminHymns.tsx"));
const Gallery = lazy(() => import("./pages/Gallery.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Messages = lazy(() => import("./pages/Messages.tsx"));
const BlogPost = lazy(() => import("./pages/BlogPost.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Hymns = lazy(() => import("./pages/Hymns.tsx"));

// Loading Fallback Component
const PageLoader = () => (
  <div className="h-screen w-full flex flex-col justify-center items-center bg-background">
    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
    <div className="text-muted-foreground animate-pulse text-lg font-medium font-heading">Loading...</div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/join" element={<Join />} />
              <Route path="/hymns" element={<Hymns />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/events" element={<ProtectedRoute><AdminEvents /></ProtectedRoute>} />
              <Route path="/admin/prayers" element={<ProtectedRoute><AdminPrayers /></ProtectedRoute>} />
              <Route path="/admin/members" element={<ProtectedRoute><AdminMembers /></ProtectedRoute>} />
              <Route path="/admin/blog" element={<ProtectedRoute><AdminBlog /></ProtectedRoute>} />
              <Route path="/admin/announcements" element={<ProtectedRoute><AdminAnnouncements /></ProtectedRoute>} />
              <Route path="/admin/gallery" element={<ProtectedRoute><AdminGallery /></ProtectedRoute>} />
              <Route path="/admin/programs" element={<ProtectedRoute><AdminPrograms /></ProtectedRoute>} />
              <Route path="/admin/team" element={<ProtectedRoute><AdminTeam /></ProtectedRoute>} />
              <Route path="/admin/hymns" element={<ProtectedRoute><AdminHymns /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
