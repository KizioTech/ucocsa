import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import logo from "@/assets/ucocsa-logo.png";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/resources", label: "Resources" },
  { to: "/prayer", label: "Prayer" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
  { to: "/give", label: "Give" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
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
          {navLinks.map((link) => (
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
          <Link
            to="/join"
            className="ml-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-gold-dark transition-colors"
          >
            Join Us
          </Link>
          {user && (
            <>
              <Link to="/dashboard" className="ml-1 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Dashboard
              </Link>
              <Link to="/messages" className="ml-1 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Messages
              </Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" className="ml-1 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              Admin
            </Link>
          )}
          {user ? (
            <button
              onClick={signOut}
              className="ml-2 flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
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
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-foreground" aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
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
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setOpen(false)}
                  className={`px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}>
                  {link.label}
                </Link>
              ))}
              <Link to="/join" onClick={() => setOpen(false)}
                className="mt-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold text-center">
                Join Us
              </Link>
              {user && (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)}
                    className="px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                    Dashboard
                  </Link>
                  <Link to="/messages" onClick={() => setOpen(false)}
                    className="px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                    Messages
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)}
                  className="px-3 py-3 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                  Admin Dashboard
                </Link>
              )}
              {user ? (
                <button onClick={() => { signOut(); setOpen(false); }}
                  className="mt-1 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted text-center flex items-center justify-center gap-2">
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
