import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const trackView = async () => {
      try {
        await supabase.from("page_views").insert({
          path: location.pathname,
          user_id: user?.id || null,
        });
      } catch (err) {
        // Silently fail for analytics
      }
    };
    trackView();
  }, [location.pathname, user?.id]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 shrink-0 flex items-center border-b border-border px-4 bg-background">
            <SidebarTrigger className="mr-4" />
            <span className="font-heading text-lg text-foreground">UCOCSA Admin</span>
          </header>
          <main className="flex-1 p-4 sm:p-6 bg-muted/30 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
