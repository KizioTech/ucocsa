import React, { useState, useEffect } from "react";
import { Bell, Megaphone, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const NotificationBell: React.FC = () => {
  const [hasUnread, setHasUnread] = useState(false);
  const [open, setOpen] = useState(false);

  const { data: latestAnnouncement } = useQuery({
    queryKey: ["latest-announcement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });

  useEffect(() => {
    if (!latestAnnouncement) return;

    let lastSeenId = null;
    let lastSeenAt = 0;

    try {
      lastSeenId = localStorage.getItem("lastAnnouncementId");
      lastSeenAt = parseInt(localStorage.getItem("lastAnnouncementSeenAt") || "0");
    } catch (e) {
      console.warn("localStorage access failed:", e);
    }

    const now = Date.now();
    const announcementTime = new Date(latestAnnouncement.created_at).getTime();

    // Condition for "unread":
    // 1. Never seen this announcement before
    // 2. OR it's a "periodic reminder": if it's less than 24h old AND hasn't been seen in the last 4 hours
    const isNew = lastSeenId !== latestAnnouncement.id;
    const isReminderNeeded = (now - announcementTime < 1000 * 60 * 60 * 24) && (now - lastSeenAt > 1000 * 60 * 60 * 4);

    if (isNew || isReminderNeeded) {
      setHasUnread(true);
    } else {
      setHasUnread(false);
    }
  }, [latestAnnouncement]);

  const markAsRead = () => {
    if (latestAnnouncement) {
      try {
        localStorage.setItem("lastAnnouncementId", latestAnnouncement.id);
        localStorage.setItem("lastAnnouncementSeenAt", Date.now().toString());
      } catch (e) {
        console.warn("localStorage setItem failed:", e);
      }
      setHasUnread(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (v) markAsRead(); }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary transition-colors">
          <Bell size={20} className={hasUnread ? "animate-tada" : ""} />
          {hasUnread && (
            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-primary border-2 border-background animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Megaphone size={14} className="text-primary" /> Notifications
          </h3>
          <Link to="/announcements" className="text-[10px] text-primary hover:underline font-bold uppercase tracking-wider" onClick={() => setOpen(false)}>
            View All
          </Link>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {latestAnnouncement ? (
            <Link 
              to="/announcements" 
              className="block p-4 hover:bg-muted transition-colors border-b border-border last:border-0"
              onClick={() => setOpen(false)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground leading-tight mb-1">{latestAnnouncement.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(latestAnnouncement.created_at).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No new notifications
            </div>
          )}
        </div>
        {latestAnnouncement && (
          <div className="p-2 bg-muted/10 text-center">
            <button 
              onClick={() => setOpen(false)}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
