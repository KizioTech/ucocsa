import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppFAB from "./WhatsAppFAB";

const Layout = ({ children }: { children: ReactNode }) => {
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
        // Silently fail for analytics if needed
      }
    };
    trackView();
  }, [location.pathname, user?.id]);

  return (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 pt-16">{children}</main>
    <Footer />
    <WhatsAppFAB />
  </div>
  );
};

export default Layout;
