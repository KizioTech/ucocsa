import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn, LogOut, ChevronDown, User, LayoutDashboard, Mail, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import logo from "@/assets/ucocsa-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationBell from "./NotificationBell";

const standaloneLinks = [
  { to: "/", label: "Home" },
];

const communityLinks = [
  { to: "/about", label: "About Us" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

const growLinks = [
  { to: "/resources", label: "Resources" },
  { to: "/prayer", label: "Prayer" },
  { to: "/blog", label: "Blog" },
  { to: "/announcements", label: "Announcements" },
  { to: "/give", label: "Give" },
];

const allMobileLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/resources", label: "Resources" },
  { to: "/prayer", label: "Prayer" },
  { to: "/blog", label: "Blog" },
  { to: "/announcements", label: "Announcements" },
  { to: "/contact", label: "Contact" },
  { to: "/give", label: "Give" },
];

const NavDropdown = ({ label, links }: { label: string; links: { to: string; label: string }[] }) => {
  const location = useLocation();
  const isActive = links.some((l) => location.pathname === l.to);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors outline-none ${
          isActive
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        {label}
        <ChevronDown size={14} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px]">
        {links.map((link) => (
          <DropdownMenuItem key={link.to} asChild>
            <Link
              to={link.to}
              className={`w-full ${
                location.pathname === link.to ? "text-primary font-semibold" : ""
              }`}
            >
              {link.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);
  const [growOpen, setGrowOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="UCOCSA" width={36} height={36} />
          <span className="font-heading text-xl text-foreground">UCOCSA</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {standaloneLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <NavDropdown label="Community" links={communityLinks} />
          <NavDropdown label="Grow" links={growLinks} />
            <Link
              to="/hymns"
              className="ml-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-gold-dark transition-colors"
            >
              Hymns
            </Link>
            
            <div className="ml-2 flex items-center gap-1 border-l border-border pl-2">
              <NotificationBell />
            </div>

            {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-2 outline-none">
                <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                  <AvatarImage src={(user as any)?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="w-full flex items-center gap-2">
                    <LayoutDashboard size={14} /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/messages" className="w-full flex items-center gap-2">
                    <Mail size={14} /> Messages
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="w-full flex items-center gap-2">
                        <Shield size={14} /> Admin
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer">
                  <LogOut size={14} /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/auth"
              className="ml-2 flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogIn size={16} /> Sign In
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <NotificationBell />
          <button onClick={() => setOpen(!open)} className="p-2 text-foreground" aria-label="Toggle menu">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-1">
              {/* Community group */}
              <button
                onClick={() => setCommunityOpen(!communityOpen)}
                className="flex items-center justify-between px-3 py-3 rounded-md text-sm font-semibold text-foreground"
              >
                Community
                <ChevronDown size={16} className={`transition-transform ${communityOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {communityOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-3">
                    {communityLinks.map((link) => (
                      <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          location.pathname === link.to ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}>
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grow group */}
              <button
                onClick={() => setGrowOpen(!growOpen)}
                className="flex items-center justify-between px-3 py-3 rounded-md text-sm font-semibold text-foreground"
              >
                Grow
                <ChevronDown size={16} className={`transition-transform ${growOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {growOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-3">
                    {growLinks.map((link) => (
                      <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                        className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          location.pathname === link.to ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}>
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Link to="/hymns" onClick={() => setOpen(false)}
                className="mt-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold text-center">
                🎵 Hymns
              </Link>
              {user && (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)}
                    className="px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/messages" onClick={() => setOpen(false)}
                    className="px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2">
                    <Mail size={16} /> Messages
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2">
                  <Shield size={16} /> Admin
                </Link>
              )}
              {user ? (
                <button onClick={() => { signOut(); setOpen(false); }}
                  className="mt-1 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-muted text-center flex items-center justify-center gap-2">
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)}
                  className="mt-1 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted text-center flex items-center justify-center gap-2">
                  <LogIn size={16} /> Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
