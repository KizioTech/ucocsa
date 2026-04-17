import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Search, Heart, ArrowLeft, Music, Star, Book, Baby,
  Sunrise, Shield, Flame, Info, X, Play, Pause, ChevronDown,
  MonitorPlay, Type, Menu, BookOpen, Sparkles, Plus, Share2, Clipboard, Image as ImageIcon
} from "lucide-react";
import { backgroundImages } from "@/data/backgrounds";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InstallHymnsButton, InstallHymnsPopup } from "@/components/InstallHymnsPrompt";
import SharePoster from "@/components/SharePoster";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Types & Metadata ─────────────────────────────────────────────────────────

interface Hymn {
  id: number;
  title: string;
  author: string | null;
  category: string | null;
  verses: string[];
  youtube_id: string | null;
  first_line: string | null;
  bio: string | null;
}

const CATEGORY_META: Record<string, { icon: React.ElementType; label: string }> = {
  Traditional:  { icon: Book,    label: "Traditional"  },
  Birth:        { icon: Baby,    label: "Birth"        },
  Resurrection: { icon: Sunrise, label: "Resurrection" },
  Worship:      { icon: Music,   label: "Worship"      },
  Praise:       { icon: Music,   label: "Praise"       },
  Assurance:    { icon: Shield,  label: "Assurance"    },
  Faith:        { icon: Heart,   label: "Faith"        },
  Hope:         { icon: Star,    label: "Hope"         },
  Salvation:    { icon: Flame,   label: "Salvation"    },
};

const GREETINGS: Record<string, Array<{ message: string; verse: string }>> = {
  morning: [
    { message: "Good morning! It's a beautiful day to sing.", verse: '"Let everything that has breath praise the Lord." – Psalm 150:6' },
    { message: "Rise and shine! Let's praise the Lord.", verse: '"This is the day that the Lord has made; let us rejoice and be glad in it." – Psalm 118:24' },
  ],
  afternoon: [
    { message: "Good afternoon! Let's praise together.", verse: '"My heart, O God, is steadfast; I will sing and make music with all my soul." – Psalm 108:1' },
  ],
  evening: [
    { message: "Good evening! Let's worship in song.", verse: '"From the rising of the sun to its setting, the name of the Lord is to be praised." – Psalm 113:3' },
  ],
};

function getGreeting() {
  const h = new Date().getHours();
  const period = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
  const list = GREETINGS[period];
  return list[Math.floor(Math.random() * list.length)];
}

// ─── Presentation Overlay ─────────────────────────────────────────────────

const PresentationOverlay = ({ hymn, onClose }: { hymn: Hymn; onClose: () => void }) => {
  const slides = useMemo(() => {
    const seq: { type: string; text: string; title: string }[] = [];
    const hasGlobalChorus = hymn.verses.length > 1 && hymn.verses[0].includes('\n \n') && !hymn.verses[1].includes('\n \n');

    let globalChorusText = "";
    if (hasGlobalChorus) {
      globalChorusText = hymn.verses[0].split(/\n \n/).slice(1).join('\n \n');
    }

    hymn.verses.forEach((verse, i) => {
      const parts = verse.split(/\n \n/);

      if (hasGlobalChorus && i === 0) {
        seq.push({ type: 'verse', text: parts[0], title: `Verse 1` });
        seq.push({ type: 'chorus', text: globalChorusText, title: `Chorus` });
      } else if (hasGlobalChorus && i > 0) {
        seq.push({ type: 'verse', text: verse, title: `Verse ${i + 1}` });
        seq.push({ type: 'chorus', text: globalChorusText, title: `Chorus` });
      } else {
        seq.push({ type: 'verse', text: parts[0], title: `Verse ${i + 1}` });
        if (parts.length > 1) {
          seq.push({ type: 'chorus', text: parts.slice(1).join('\n \n'), title: `Chorus` });
        }
      }
    });

    return seq.filter(s => s.text.trim().length > 0);
  }, [hymn.verses]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        setIdx(i => Math.min(i + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, onClose]);

  if (slides.length === 0) return null;

  const slide = slides[idx];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-900 via-neutral-900 to-stone-900 transition-colors animate-in fade-in duration-300">
      <Button variant="ghost" size="icon" onClick={() => {
        onClose();
        if (document.fullscreenElement) document.exitFullscreen().catch(console.error);
      }} className="absolute top-6 right-6 text-white/50 hover:bg-white/10 hover:text-white">
        <X className="h-8 w-8" />
      </Button>

      <div className="absolute top-8 left-8 text-left text-white/50 hidden sm:block">
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-white/80">{hymn.id}. {hymn.title}</h1>
        <p className="text-sm">Slide {idx + 1} of {slides.length}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-5xl w-full">
        <div className="text-sm font-semibold text-primary uppercase mb-6 tracking-[0.2em]">{slide.title}</div>
        <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-relaxed font-medium whitespace-pre-line text-center drop-shadow-md pb-16">
          {slide.text}
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
        <Button
          variant="outline" size="lg"
          onClick={() => setIdx(i => Math.max(i - 1, 0))}
          disabled={idx === 0}
          className="bg-transparent border-white/20 text-white hover:bg-white/10 disabled:opacity-30 w-32"
        >
          Back
        </Button>
        <Button
          variant="outline" size="lg"
          onClick={() => setIdx(i => Math.min(i + 1, slides.length - 1))}
          disabled={idx === slides.length - 1}
          className="bg-transparent border-white/20 text-white hover:bg-white/10 disabled:opacity-30 w-32"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// ── Verse renderer for document view ───────────────────────────────────────
const renderVerse = (text: string) => {
  const parts = text.split(/\n \n/);
  if (parts.length > 1) {
    return (
      <>
        <div className="whitespace-pre-line">{parts[0]}</div>
        <div className="mt-4 pl-4 border-l-4 border-primary italic font-semibold whitespace-pre-line text-primary">
          {parts.slice(1).join("\n \n")}
        </div>
      </>
    );
  }
  return <div className="whitespace-pre-line">{text}</div>;
};

// ─── Sidebar (top-level memoized — prevents focus loss on every keystroke) ─
interface SidebarProps {
  search: string;
  setSearch: (s: string) => void;
  listMode: "all" | "favorites";
  setListMode: (m: "all" | "favorites") => void;
  favorites: Set<number>;
  filteredHymns: Hymn[];
  selected: Hymn | null;
  openHymn: (h: Hymn) => void;
  onSuggest: () => void;
  isLoggedIn: boolean;
}

const SidebarContents = memo(({
  search, setSearch, listMode, setListMode, favorites, filteredHymns, selected, openHymn, onSuggest, isLoggedIn,
}: SidebarProps) => (
  <div className="flex flex-col h-full overflow-hidden bg-card border-r border-border drop-shadow-sm z-20">
    <div className="p-4 border-b border-border bg-card shrink-0 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-primary flex items-center gap-2">
          <BookOpen className="h-5 w-5" /> Hymn Library
        </h2>
        {isLoggedIn && (
          <Button size="sm" variant="outline" onClick={onSuggest} className="h-7 text-xs gap-1" title="Suggest a new hymn (admin approval required)">
            <Plus className="h-3 w-3" /> Suggest
          </Button>
        )}
      </div>

      <div className="flex text-xs rounded-md border border-border p-0.5 bg-muted">
        <button
          onClick={() => setListMode('all')}
          className={`flex-1 py-1.5 rounded-sm font-semibold transition-colors ${listMode === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          All Hymns
        </button>
        <button
          onClick={() => setListMode('favorites')}
          className={`flex-1 py-1.5 rounded-sm font-semibold transition-colors ${listMode === 'favorites' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Favorites ({favorites.size})
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search title, number, author..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
      {filteredHymns.length === 0 ? (
        <div className="text-center p-6 text-muted-foreground text-sm">
          {listMode === 'favorites' ? 'No favorites yet.' : 'No hymns found.'}
        </div>
      ) : (
        filteredHymns.map(h => (
          <button
            key={h.id}
            onClick={() => openHymn(h)}
            className={`w-full flex items-start gap-3 px-3 py-2.5 text-left rounded-md transition-colors text-sm border-l-2 ${
              selected?.id === h.id
                ? 'bg-primary/10 border-primary text-foreground font-semibold'
                : 'border-transparent hover:bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className={`w-6 shrink-0 font-bold ${selected?.id === h.id ? 'text-primary' : 'text-muted-foreground/60'}`}>{h.id}.</span>
            <span className="truncate flex-1 font-medium">{h.title}</span>
          </button>
        ))
      )}
    </div>
  </div>
));
SidebarContents.displayName = "SidebarContents";

// ─── Main Component ────────────────────────────────────────────────────────
const Hymns: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Hymn | null>(null);
  const [search, setSearch] = useState("");
  const [listMode, setListMode] = useState<"all" | "favorites">("all");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [recent, setRecent] = useState<Hymn[]>([]);
  const [fontSize, setFontSize] = useState(16);
  const [autoScroll, setAutoScroll] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [youtubeMode, setYoutubeMode] = useState<'none' | 'audio' | 'video'>('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHymnInfo, setShowHymnInfo] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [greeting] = useState(getGreeting);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sharingPoster, setSharingPoster] = useState<any | null>(null);
  const [scrollSpeed, setScrollSpeed] = useState(3);
  // Chosen once on mount — changes only on page refresh, never during the session
  const [bgIndex] = useState(() => Math.floor(Math.random() * backgroundImages.length));

  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync isPlaying state to the native YouTube iframe
  useEffect(() => {
    if (youtubeMode !== 'none' && iframeRef.current && iframeRef.current.contentWindow) {
      const command = isPlaying ? 'playVideo' : 'pauseVideo';
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: command }), '*');
    }
  }, [isPlaying, youtubeMode]);

  const { data: hymns = [] } = useQuery({
    queryKey: ["hymns"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("hymns").select("*").order("id");
      if (error) throw error;
      return data as Hymn[];
    },
  });

  // Backgrounds from DB (managed by admins); falls back to bundled list while loading
  const { data: dbBackgrounds = [] } = useQuery({
    queryKey: ["hymn_backgrounds"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("hymn_backgrounds")
        .select("url")
        .order("sort_order");
      if (error) throw error;
      return (data as { url: string }[]).map((r) => r.url);
    },
  });

  const backgrounds = dbBackgrounds.length > 0 ? dbBackgrounds : backgroundImages;
  const bgUrl = backgrounds[bgIndex % backgrounds.length];

  useEffect(() => {
    setFavorites(new Set(JSON.parse(localStorage.getItem("hymnFavorites") || "[]")));
    setRecent(JSON.parse(localStorage.getItem("hymnRecent") || "[]"));
    setFontSize(parseInt(localStorage.getItem("hymnFontSize") || "16"));
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Background is static per session — no auto-cycling; changes only on full page refresh.

  useEffect(() => { localStorage.setItem("hymnFavorites", JSON.stringify([...favorites])); }, [favorites]);
  useEffect(() => { localStorage.setItem("hymnRecent", JSON.stringify(recent)); }, [recent]);
  useEffect(() => { localStorage.setItem("hymnFontSize", fontSize.toString()); }, [fontSize]);

  useEffect(() => {
    if (autoScroll) {
      const delay = 150 - (scrollSpeed * 20); // speed 1 = 130ms, 5 = 50ms
      scrollIntervalRef.current = setInterval(() => {
        if (detailRef.current) {
          detailRef.current.scrollBy(0, 1);
        }
      }, delay);
    } else {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    }
    return () => { if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current); };
  }, [autoScroll, scrollSpeed]);

  // Handle Fullscreen exit natively syncing to presentationMode state
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && presentationMode) {
        setPresentationMode(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [presentationMode]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const openHymn = useCallback((hymn: Hymn) => {
    setSelected(hymn);
    setYoutubeMode('none');
    setIsPlaying(false);
    setAutoScroll(false);
    setRecent(prev => [hymn, ...prev.filter(h => h.id !== hymn.id)].slice(0, 10));
    setIsMobileSidebarOpen(false);
    if (detailRef.current) detailRef.current.scrollTo(0, 0);
  }, []);

  const handleShareText = () => {
    if (!selected) return;
    const firstVerse = selected.verses[0].split(/\n \n/)[0];
    const text = `${selected.id}. ${selected.title}\n\n${firstVerse}\n\nRead more at: ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: selected.title,
        text: text,
        url: window.location.href
      }).catch(() => {
        navigator.clipboard.writeText(text);
        toast.success("Hymn lyrics copied to clipboard");
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Hymn lyrics copied to clipboard");
    }
  };

  const handleSharePoster = () => {
    if (!selected) return;
    const details: Record<string, string> = {};
    if (selected.verses.length > 1) details["Verse 2"] = selected.verses[1].split(/\n \n/)[0];
    if (selected.verses.length > 2) details["Verse 3"] = selected.verses[2].split(/\n \n/)[0];

    setSharingPoster({
      title: `${selected.id}. ${selected.title}`,
      subtitle: selected.verses[0].split(/\n \n/)[0],
      theme: selected.author,
      details: Object.keys(details).length > 0 ? details : null,
      type: "hymn"
    });
  };

  const filteredHymns = useMemo(() => {
    let source = listMode === "favorites" ? hymns.filter(h => favorites.has(h.id)) : hymns;
    const q = search.toLowerCase();
    if (q) {
      source = source.filter(h =>
        h.title.toLowerCase().includes(q) ||
        (h.author || "").toLowerCase().includes(q) ||
        (h.first_line || "").toLowerCase().includes(q) ||
        h.id.toString() === search
      );
    }
    return source;
  }, [hymns, search, listMode, favorites]);


  // ─── Suggest Hymn (members) ─────────────────────────────────────────────
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestForm, setSuggestForm] = useState({ title: "", author: "", category: "", verses: "", youtube_id: "" });

  const suggestMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to suggest a hymn.");
      if (!suggestForm.title.trim() || !suggestForm.verses.trim()) {
        throw new Error("Title and at least one verse are required.");
      }
      const verses = suggestForm.verses
        .split(/\n\s*\n+/)
        .map((v) => v.trim())
        .filter(Boolean);
      const { error } = await (supabase as any).from("hymns").insert({
        title: suggestForm.title.trim(),
        author: suggestForm.author.trim() || null,
        category: suggestForm.category.trim() || null,
        verses,
        youtube_id: suggestForm.youtube_id.trim() || null,
        first_line: verses[0]?.split("\n")[0] || null,
        submitted_by: user.id,
        is_approved: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thank you! Your hymn has been submitted for admin approval.");
      setSuggestOpen(false);
      setSuggestForm({ title: "", author: "", category: "", verses: "", youtube_id: "" });
      queryClient.invalidateQueries({ queryKey: ["hymns"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to submit hymn."),
  });

  const handleSuggestClick = useCallback(() => {
    if (!user) {
      toast.info("Please log in to suggest a hymn.");
      return;
    }
    setSuggestOpen(true);
  }, [user]);

  const sidebarProps: SidebarProps = {
    search, setSearch, listMode, setListMode, favorites,
    filteredHymns, selected, openHymn,
    onSuggest: handleSuggestClick,
    isLoggedIn: !!user,
  };

  return (
    <div className="h-[100dvh] bg-background text-foreground flex flex-col overflow-hidden">
      <SEO 
        title="Hymn Library & Lyrics"
        description="Browse, search, and read hymns from the UCOCSA hymnal. Worship, praise, and sing along with our student community."
      />
      <Navbar />
      <InstallHymnsPopup />

      {/* Floating install button (only renders when installable) */}
      <div className="fixed bottom-4 right-4 z-40 md:top-20 md:bottom-auto">
        <InstallHymnsButton />
      </div>

      {/* Persistent mobile sidebar — always mounted so Browse Library works from the welcome screen */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 border-r border-border">
          <SidebarContents {...sidebarProps} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex pt-[64px] h-full overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 lg:w-80 flex-col shrink-0">
          <SidebarContents {...sidebarProps} />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 h-full relative">
          
          {/* Internal Header for Mobile Trigger & Actions — only shown when a hymn is selected */}
          {selected && (
          <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden -ml-2 text-foreground"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {selected && (
                <div className="font-heading font-bold text-lg md:text-xl truncate flex items-center gap-2 text-foreground">
                  <span className="text-primary hidden sm:inline">{selected.id}.</span> {selected.title}
                </div>
              )}
            </div>

            {selected && (
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleShareText} className="gap-2 cursor-pointer">
                      <Clipboard size={14} /> Copy as Text
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSharePoster} className="gap-2 cursor-pointer">
                      <ImageIcon size={14} /> Share as Image
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" onClick={() => setShowHymnInfo(true)} className="text-muted-foreground hover:text-primary">
                  <Info className="h-5 w-5" />
                </Button>
              </div>
            )}
          </header>
          )}

          <div className="flex-1 relative overflow-hidden">
            {!selected ? (
              /* ── Full-page cover ── */
              <div className="absolute inset-0 overflow-hidden">

                {/* Static background — randomly selected once per page load */}
                <img
                  src={bgUrl}
                  alt="Worship background"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Layered gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-transparent" />

                {/* Content — centered vertically */}
                <div className="relative z-10 h-full flex flex-col items-start justify-end p-8 md:p-16 pb-24">

                  {/* Time-of-day badge */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-5"
                  >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/75 backdrop-blur-md text-xs font-bold text-primary shadow-lg border border-primary/25 uppercase tracking-widest">
                      <Sparkles className="h-3.5 w-3.5" />
                      {new Date().getHours() < 12 ? "Morning Worship" : new Date().getHours() < 18 ? "Afternoon Praise" : "Evening Devotion"}
                    </span>
                  </motion.div>

                  {/* Greeting */}
                  <motion.h2
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading text-white leading-tight mb-5 drop-shadow-xl max-w-3xl"
                  >
                    {greeting.message}
                  </motion.h2>

                  {/* Bible verse */}
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28, duration: 0.6 }}
                    className="text-white/80 text-base md:text-lg italic leading-relaxed border-l-4 border-primary pl-5 max-w-2xl"
                  >
                    {greeting.verse}
                  </motion.p>

                  {/* Hint + mobile CTA */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                    className="mt-8 flex items-center gap-4"
                  >
                    <p className="text-white/40 text-sm font-medium hidden sm:block">
                      Select a hymn from the library to begin.
                    </p>
                    <Button
                      className="md:hidden bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold shadow-xl shadow-primary/40 hover:shadow-primary/60 transition-shadow active:scale-95"
                      onClick={() => setIsMobileSidebarOpen(true)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" /> Browse Library
                    </Button>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div ref={detailRef} className="flex-1 overflow-y-auto w-full h-full p-4 md:p-8 pb-32">
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-border">
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 border border-border">
                    <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                      <Type className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs text-muted-foreground px-2 font-mono">{fontSize}px</span>
                    <button onClick={() => setFontSize(s => Math.min(28, s + 2))} className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                      <Type className="h-4.5 w-4.5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-background border border-border rounded-md pr-2">
                    <Button variant={autoScroll ? "default" : "ghost"} size="sm" onClick={() => setAutoScroll(a => !a)} className="rounded-r-none border-r border-border hover:bg-muted">
                      <ChevronDown className="h-4 w-4 mr-1" />
                      {autoScroll ? "Stop Scroll" : "Auto Scroll"}
                    </Button>
                    {autoScroll && (
                      <div className="w-24 px-2 hidden sm:block">
                        <Slider value={[scrollSpeed]} min={1} max={5} step={1} onValueChange={(v) => setScrollSpeed(v[0])} aria-label="Scroll Speed" />
                      </div>
                    )}
                  </div>
                  
                  <Button variant="default" size="sm" onClick={() => {
                    setPresentationMode(true);
                    document.documentElement.requestFullscreen().catch(console.error);
                  }} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <MonitorPlay className="h-4 w-4 mr-1.5" />
                    Presentation
                  </Button>
                  
                  {isOnline && selected.youtube_id && (
                     <div className="flex items-center bg-background border border-border rounded-md shadow-sm h-8 mt-0.5 animate-in fade-in">
                       <Button variant={youtubeMode !== 'none' ? "secondary" : "ghost"} size="sm" 
                               onClick={() => {
                                 if (youtubeMode === 'none') {
                                   setYoutubeMode('audio');
                                   setIsPlaying(true);
                                 } else {
                                   setYoutubeMode('none');
                                   setIsPlaying(false);
                                 }
                               }} 
                               className={`rounded-none rounded-l-md h-full px-3 ${youtubeMode !== 'none' ? 'border-r border-border hover:bg-destructive hover:text-white' : 'hover:bg-muted'}`}>
                         <Music className="h-4 w-4 mr-1.5" /> {youtubeMode !== 'none' ? "Stop Tune" : "Listen to Tune"}
                       </Button>
                       
                       {youtubeMode === 'audio' && (
                         <div className="flex items-center px-1 animate-in fade-in slide-in-from-left-2 duration-300">
                           <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 hover:bg-muted text-foreground transition-colors rounded outline-none flex items-center justify-center" title={isPlaying ? "Pause Audio" : "Play Audio"}>
                             {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                           </button>
                           {/* Switch to video icon */}
                           <button onClick={() => setYoutubeMode('video')} className="p-1.5 hover:bg-muted text-muted-foreground transition-colors rounded outline-none ml-0.5 flex items-center justify-center" title="Switch to Video View">
                             <MonitorPlay className="h-4 w-4" />
                           </button>
                         </div>
                       )}
                       
                       {youtubeMode === 'video' && (
                         <div className="flex items-center px-1 animate-in fade-in slide-in-from-left-2 duration-300">
                           {/* Switch to audio icon */}
                           <button onClick={() => setYoutubeMode('audio')} className="p-1.5 hover:bg-muted text-muted-foreground transition-colors rounded outline-none flex items-center justify-center" title="Switch to Audio Only">
                             <Music className="h-4 w-4" />
                           </button>
                         </div>
                       )}
                     </div>
                  )}
                </div>

                {/* YouTube iframe — only mounted when activated, autoplays for instant start */}
                {selected.youtube_id && youtubeMode !== 'none' && (
                  <div className={`transition-all duration-500 origin-top flex justify-center ${
                    youtubeMode === 'video'
                      ? "mb-10 w-full rounded-2xl overflow-hidden shadow-xl border border-border bg-black h-[350px] opacity-100 scale-100 pointer-events-auto"
                      : "h-0 opacity-0 scale-95 pointer-events-none -mb-2"
                  }`}>
                    <iframe
                      ref={iframeRef}
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${selected.youtube_id}?enablejsapi=1&autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=${youtubeMode === 'video' ? 1 : 0}`}
                      title={selected.title}
                      frameBorder="0"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                <div className="space-y-8">
                  {selected.verses.map((verse, i) => (
                    <Card key={i} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6 md:p-8">
                        <div className="text-xs font-bold text-primary uppercase tracking-[0.15em] mb-4">Verse {i + 1}</div>
                        <div style={{ fontSize: `${fontSize}px` }} className="leading-relaxed text-foreground font-medium">
                          {renderVerse(verse)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {presentationMode && selected && (
        <PresentationOverlay hymn={selected} onClose={() => {
          setPresentationMode(false);
          if (document.fullscreenElement) document.exitFullscreen().catch(console.error);
        }} />
      )}

      {/* The floating mini-player has been removed as per Option A choice */}

      {showHymnInfo && selected && (
        <div className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowHymnInfo(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl p-6 shadow-2xl bg-card border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground font-heading pr-4">About the Hymn</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowHymnInfo(false)} className="shrink-0 -mr-2">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                 <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Title</p>
                 <p className="font-heading font-bold text-lg">{selected.title}</p>
              </div>
              <div>
                 <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Author / Composer</p>
                 <p>{selected.author || 'Unknown'}</p>
              </div>
              {selected.category && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">Category</p>
                  <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full inline-block">{selected.category}</span>
                </div>
              )}
              {selected.bio && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1.5">Background</p>
                  <div className="p-3.5 rounded-xl bg-muted text-sm leading-relaxed text-muted-foreground border border-border/50">
                    {selected.bio}
                  </div>
                </div>
              )}
            </div>
            <Button onClick={() => setShowHymnInfo(false)} className="mt-8 w-full font-semibold">
              Close Detail
            </Button>
          </div>
        </div>
      )}

      {/* Suggest Hymn Dialog (members only — submission requires admin approval) */}
      <Dialog open={suggestOpen} onOpenChange={setSuggestOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Suggest a New Hymn
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Your submission will be reviewed by an admin before appearing in the public hymn library.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={suggestForm.title}
                onChange={(e) => setSuggestForm({ ...suggestForm, title: e.target.value })}
                placeholder="Title *"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                value={suggestForm.author}
                onChange={(e) => setSuggestForm({ ...suggestForm, author: e.target.value })}
                placeholder="Author"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={suggestForm.category}
                onChange={(e) => setSuggestForm({ ...suggestForm, category: e.target.value })}
                placeholder="Category (e.g. Worship)"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                value={suggestForm.youtube_id}
                onChange={(e) => setSuggestForm({ ...suggestForm, youtube_id: e.target.value })}
                placeholder="YouTube ID (optional)"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <textarea
              value={suggestForm.verses}
              onChange={(e) => setSuggestForm({ ...suggestForm, verses: e.target.value })}
              placeholder="Lyrics — separate each verse with a blank line *"
              rows={8}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary font-mono leading-relaxed resize-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setSuggestOpen(false)}>Cancel</Button>
              <Button onClick={() => suggestMut.mutate()} disabled={suggestMut.isPending}>
                {suggestMut.isPending ? "Submitting…" : "Submit for Approval"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {sharingPoster && (
        <SharePoster
          {...sharingPoster}
          isOpen={!!sharingPoster}
          onClose={() => setSharingPoster(null)}
        />
      )}
    </div>
  );
};

export default Hymns;
