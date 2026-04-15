import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Heart, Grid, Moon, Sun, ArrowLeft, ChevronDown, ChevronUp,
  Music, Clock, Star, Book, Gift, Sunrise, Shield, Flame, Info, X
} from "lucide-react";
import Navbar from "@/components/Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Category metadata ─────────────────────────────────────────────────────────
const CATEGORY_META: Record<string, { icon: React.ElementType; color: string }> = {
  Traditional: { icon: Book, color: "text-blue-400" },
  Christmas:   { icon: Gift, color: "text-red-400" },
  Easter:      { icon: Sunrise, color: "text-yellow-400" },
  Worship:     { icon: Music, color: "text-purple-400" },
  worship:     { icon: Music, color: "text-purple-400" },
  Praise:      { icon: Music, color: "text-green-400" },
  Assurance:   { icon: Shield, color: "text-orange-400" },
  Faith:       { icon: Heart, color: "text-pink-400" },
  Hope:        { icon: Star, color: "text-teal-400" },
  Salvation:   { icon: Flame, color: "text-yellow-500" },
};

// ─── Time-based greetings ──────────────────────────────────────────────────────
const GREETINGS: Record<string, Array<{ message: string; verse: string }>> = {
  morning: [
    { message: "Good morning! It's a beautiful day to sing.", verse: '"Let everything that has breath praise the Lord." – Psalm 150:6' },
    { message: "Rise and shine! Let's praise the Lord.", verse: '"This is the day that the Lord has made; let us rejoice and be glad in it." – Psalm 118:24' },
    { message: "His mercies are new every morning.", verse: '"Because of the Lord\'s great love we are not consumed, for his compassions never fail." – Lamentations 3:22–23' },
  ],
  afternoon: [
    { message: "Good afternoon! Let's praise together.", verse: '"My heart, O God, is steadfast; I will sing and make music with all my soul." – Psalm 108:1' },
    { message: "Keep the song in your heart this afternoon.", verse: '"Sing to the Lord, for he has done glorious things." – Isaiah 12:5' },
  ],
  evening: [
    { message: "Good evening! Let's worship in song.", verse: '"From the rising of the sun to its setting, the name of the Lord is to be praised." – Psalm 113:3' },
    { message: "Close your day with songs of thanksgiving.", verse: '"Let them give thanks to the Lord for his unfailing love." – Psalm 107:21' },
  ],
};

function getGreeting() {
  const h = new Date().getHours();
  const period = h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
  const list = GREETINGS[period];
  return list[Math.floor(Math.random() * list.length)];
}

// ─── Main Component ────────────────────────────────────────────────────────────
const Hymns: React.FC = () => {
  const [view, setView]                       = useState<"home" | "hymn" | "recent" | "favorites">("home");
  const [selected, setSelected]               = useState<Hymn | null>(null);
  const [search, setSearch]                   = useState("");
  const [category, setCategory]               = useState("");
  const [favorites, setFavorites]             = useState<Set<number>>(new Set());
  const [recent, setRecent]                   = useState<Hymn[]>([]);
  const [darkMode, setDarkMode]               = useState(true);
  const [fontSize, setFontSize]               = useState(16);
  const [autoScroll, setAutoScroll]           = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [showYouTube, setShowYouTube]         = useState(false);
  const [showHymnInfo, setShowHymnInfo]       = useState(false);
  const [showNumberGrid, setShowNumberGrid]   = useState(false);
  const [isOnline, setIsOnline]               = useState(navigator.onLine);
  const [greeting]                            = useState(getGreeting);

  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedScrollY      = useRef(0);

  // ── Fetch hymns from Supabase ──────────────────────────────────────────────
  const { data: hymns = [], isLoading } = useQuery({
    queryKey: ["hymns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hymns")
        .select("*")
        .order("id");
      if (error) throw error;
      return data as Hymn[];
    },
  });

  // ── Persist state in localStorage ──────────────────────────────────────────
  useEffect(() => {
    setFavorites(new Set(JSON.parse(localStorage.getItem("hymnFavorites") || "[]")));
    setRecent(JSON.parse(localStorage.getItem("hymnRecent") || "[]"));
    setDarkMode(localStorage.getItem("hymnTheme") === "dark");
    setFontSize(parseInt(localStorage.getItem("hymnFontSize") || "16"));

    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => { localStorage.setItem("hymnFavorites", JSON.stringify([...favorites])); }, [favorites]);
  useEffect(() => { localStorage.setItem("hymnRecent",    JSON.stringify(recent)); },          [recent]);
  useEffect(() => { localStorage.setItem("hymnTheme",     darkMode ? "dark" : "light"); },    [darkMode]);
  useEffect(() => { localStorage.setItem("hymnFontSize",  fontSize.toString()); },             [fontSize]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (autoScroll) {
      scrollIntervalRef.current = setInterval(() => window.scrollBy(0, 1), 80);
    } else {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    }
    return () => { if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current); };
  }, [autoScroll]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const openHymn = (hymn: Hymn) => {
    savedScrollY.current = window.scrollY;
    setSelected(hymn);
    setView("hymn");
    setShowYouTube(false);
    setRecent(prev => [hymn, ...prev.filter(h => h.id !== hymn.id)].slice(0, 10));
    window.scrollTo(0, 0);
  };

  const goHome = () => {
    setView("home");
    setTimeout(() => window.scrollTo(0, savedScrollY.current), 0);
  };

  const filteredHymns = hymns.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      h.title.toLowerCase().includes(q) ||
      (h.author || "").toLowerCase().includes(q) ||
      (h.first_line || "").toLowerCase().includes(q) ||
      h.id.toString() === search;
    const matchCat = !category || h.category === category;
    return matchSearch && matchCat;
  });

  // ── Dark / Light theme classes ───────────────────────────────────────────────
  const bg       = darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900";
  const cardBg   = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const inputBg  = darkMode ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500";
  const pillBase = darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200";

  // ── Sub-components ───────────────────────────────────────────────────────────
  const renderVerse = (text: string) => {
    const parts = text.split(/\n \n/);
    if (parts.length > 1) {
      return (
        <>
          <div className="whitespace-pre-line">{parts[0]}</div>
          <div className="mt-4 pl-4 border-l-4 border-amber-500 italic font-semibold whitespace-pre-line text-amber-300">
            {parts.slice(1).join("\n \n")}
          </div>
        </>
      );
    }
    return <div className="whitespace-pre-line">{text}</div>;
  };

  const HymnCard = ({ hymn, keyPrefix = "" }: { hymn: Hymn; keyPrefix?: string }) => {
    const Icon = CATEGORY_META[hymn.category || ""]?.icon || Music;
    const iconColor = CATEGORY_META[hymn.category || ""]?.color || "text-gray-400";
    return (
      <div
        key={`${keyPrefix}${hymn.id}`}
        onClick={() => openHymn(hymn)}
        className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl ${cardBg} hover:border-amber-500`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg">{hymn.id}</div>
            <div className="flex items-center gap-1.5">
              <Icon className={`h-4 w-4 ${iconColor}`} />
              <span className="text-xs text-muted-foreground">{hymn.category}</span>
            </div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); toggleFavorite(hymn.id); }}
            className={`p-1.5 rounded-full transition-colors ${favorites.has(hymn.id) ? "text-red-400" : "text-gray-500 hover:text-red-400"}`}
          >
            <Heart className={`h-5 w-5 ${favorites.has(hymn.id) ? "fill-current" : ""}`} />
          </button>
        </div>
        <h3 className="text-base font-bold mb-1">{hymn.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">by {hymn.author}</p>
        <p className="text-sm italic text-gray-400 truncate">"{hymn.first_line}"</p>
        <div className="mt-3 flex items-center justify-between">
          {isOnline && hymn.youtube_id && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              ▶ Video available
            </span>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {hymn.verses.length} verse{hymn.verses.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    );
  };

  // ── HEADER ──────────────────────────────────────────────────────────────────
  const Header = () => (
    <header className={`sticky top-0 z-40 border-b ${darkMode ? "bg-gray-900/95 border-gray-700" : "bg-white/95 border-gray-200"} backdrop-blur-sm shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {view !== "home" && (
            <button onClick={goHome} className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <button onClick={() => setShowNumberGrid(true)} className="p-2 rounded-lg hover:bg-gray-700 transition-colors" title="Quick access by number">
            <Grid className="h-5 w-5 text-amber-400" />
          </button>
          <h1 className="text-lg font-bold tracking-wide text-amber-400 font-heading hidden sm:block">SING UNTO THE LORD</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">Offline</span>}
          <button onClick={() => setDarkMode(d => !d)} className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
            {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );

  // ── HOME VIEW ───────────────────────────────────────────────────────────────
  const HomeView = () => {
    const categories = [...new Set(hymns.map(h => h.category).filter(Boolean))] as string[];
    const favoriteHymns = hymns.filter(h => favorites.has(h.id));

    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Greeting */}
        <div className="text-center mb-8 py-8 px-4 rounded-2xl bg-gradient-to-br from-amber-900/30 to-purple-900/30 border border-amber-500/20">
          <p className="text-2xl font-bold text-amber-300 mb-2">{greeting.message}</p>
          <p className="text-sm italic text-gray-400">{greeting.verse}</p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            id="hymn-search"
            type="text"
            placeholder="Search by title, author, number or first line…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${inputBg}`}
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setCategory("")}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${category === "" ? "bg-amber-500 text-black font-semibold" : pillBase}`}
          >All</button>
          {categories.map(cat => {
            const Icon = CATEGORY_META[cat]?.icon || Music;
            return (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-colors ${category === cat ? "bg-amber-500 text-black font-semibold" : pillBase}`}
              >
                <Icon className="h-3.5 w-3.5" />{cat}
              </button>
            );
          })}
        </div>

        {/* Quick nav buttons */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setView("recent")} className="flex items-center gap-2 text-sm text-amber-400 hover:underline">
            <Clock className="h-4 w-4" /> Recently Viewed
          </button>
          <button onClick={() => setView("favorites")} className="flex items-center gap-2 text-sm text-amber-400 hover:underline">
            <Star className="h-4 w-4" /> Favorites ({favorites.size})
          </button>
        </div>

        {/* Favorite hymns strip */}
        {favoriteHymns.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" /> Favorites
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteHymns.slice(0, 3).map(h => <HymnCard key={`fav-${h.id}`} hymn={h} keyPrefix="fav-" />)}
            </div>
          </div>
        )}

        {/* All hymns */}
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {search || category ? `Results (${filteredHymns.length})` : `All Hymns (${hymns.length})`}
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={`h-40 rounded-xl animate-pulse ${darkMode ? "bg-gray-800" : "bg-gray-100"}`} />
            ))}
          </div>
        ) : filteredHymns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHymns.map(h => <HymnCard key={h.id} hymn={h} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-muted-foreground">No hymns found for "{search}".</p>
          </div>
        )}
      </div>
    );
  };

  // ── HYMN DETAIL VIEW ────────────────────────────────────────────────────────
  const HymnView = () => {
    const hymn = selected;
    if (!hymn) return null;
    if (presentationMode) {
      return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-8 text-center bg-black`}>
          <button onClick={() => setPresentationMode(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
            <X className="h-6 w-6" />
          </button>
          <h1 className="text-5xl font-bold text-white mb-2">{hymn.title}</h1>
          <p className="text-xl text-gray-400 mb-10">by {hymn.author}</p>
          <div className="space-y-10 max-w-4xl w-full text-left">
            {hymn.verses.map((v, i) => (
              <div key={i}>
                <div className="text-xs font-semibold text-amber-400 uppercase mb-2">Verse {i + 1}</div>
                <div className="text-2xl text-white leading-relaxed">{renderVerse(v)}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Title row */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-amber-400 bg-amber-400/10 px-4 py-2 rounded-xl">{hymn.id}</div>
            <div>
              <h1 className="text-2xl font-bold">{hymn.title}</h1>
              <p className="text-muted-foreground">by {hymn.author}</p>
              {hymn.category && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 mt-1 inline-block">{hymn.category}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => toggleFavorite(hymn.id)} className={`p-2 rounded-full transition-colors ${favorites.has(hymn.id) ? "text-red-400" : "text-gray-500 hover:text-red-400"}`}>
              <Heart className={`h-6 w-6 ${favorites.has(hymn.id) ? "fill-current" : ""}`} />
            </button>
            <button onClick={() => setShowHymnInfo(true)} className="p-2 rounded-full text-gray-500 hover:text-amber-400 transition-colors">
              <Info className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
            <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="text-sm font-bold hover:text-amber-400">A-</button>
            <span className="text-xs text-muted-foreground px-1">{fontSize}px</span>
            <button onClick={() => setFontSize(s => Math.min(28, s + 2))} className="text-sm font-bold hover:text-amber-400">A+</button>
          </div>
          <button
            onClick={() => setAutoScroll(a => !a)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors ${autoScroll ? "bg-amber-500 text-black font-semibold" : "bg-gray-800 hover:bg-gray-700"}`}
          >{autoScroll ? "Stop Scroll" : "Auto-scroll"}</button>
          <button
            onClick={() => setPresentationMode(true)}
            className="px-4 py-1.5 rounded-lg text-sm bg-purple-700 hover:bg-purple-600 transition-colors"
          >Presentation Mode</button>
        </div>

        {/* YouTube embed */}
        {isOnline && hymn.youtube_id && (
          <div className="mb-8">
            {!showYouTube ? (
              <button onClick={() => setShowYouTube(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                ▶ Show Video
              </button>
            ) : (
              <div>
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    width="100%" height="315"
                    src={`https://www.youtube.com/embed/${hymn.youtube_id}?autoplay=1`}
                    title={hymn.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <button onClick={() => setShowYouTube(false)} className="mt-2 text-xs text-gray-400 hover:text-gray-200 underline">Hide video</button>
              </div>
            )}
          </div>
        )}

        {/* Verses */}
        <div className="space-y-8">
          {hymn.verses.map((verse, i) => (
            <div key={i} className={`p-6 rounded-xl border ${darkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50"}`}>
              <div className="text-xs font-semibold text-amber-400 uppercase mb-3">Verse {i + 1}</div>
              <div style={{ fontSize: `${fontSize}px` }} className="leading-relaxed">
                {renderVerse(verse)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── RECENTLY VIEWED ──────────────────────────────────────────────────────────
  const RecentView = () => (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-amber-400" /> Recently Viewed</h2>
      {recent.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">Nothing viewed yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recent.map(h => <HymnCard key={`rec-${h.id}`} hymn={h} keyPrefix="rec-" />)}
        </div>
      )}
    </div>
  );

  // ── FAVORITES VIEW ───────────────────────────────────────────────────────────
  const FavoritesView = () => {
    const favHymns = hymns.filter(h => favorites.has(h.id));
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Star className="h-5 w-5 text-yellow-400" /> Favorites</h2>
        {favHymns.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center">No favorites yet. Tap the ❤ on any hymn!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favHymns.map(h => <HymnCard key={`fav-${h.id}`} hymn={h} keyPrefix="fav-" />)}
          </div>
        )}
      </div>
    );
  };

  // ── NUMBER GRID MODAL ────────────────────────────────────────────────────────
  const NumberGridModal = () => (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className={`w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-2xl ${darkMode ? "bg-gray-900" : "bg-white"}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Quick Access — Select Hymn #</h2>
          <button onClick={() => setShowNumberGrid(false)} className="p-2 rounded-full hover:bg-gray-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {hymns.map(h => (
            <button key={h.id} onClick={() => { setShowNumberGrid(false); setTimeout(() => openHymn(h), 80); }}
              className={`h-12 rounded-lg border-2 font-bold text-sm transition-all hover:scale-105 hover:border-amber-500 hover:text-amber-400 ${darkMode ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-700"}`}
            >{h.id}</button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── HYMN INFO MODAL ──────────────────────────────────────────────────────────
  const HymnInfoModal = () => {
    const hymn = selected;
    if (!hymn) return null;
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className={`w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-2xl ${darkMode ? "bg-gray-900" : "bg-white"}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">About "{hymn.title}"</h2>
            <button onClick={() => setShowHymnInfo(false)} className="p-2 rounded-full hover:bg-gray-700"><X className="h-5 w-5" /></button>
          </div>
          <p><strong>Author:</strong> {hymn.author}</p>
          <p><strong>Category:</strong> {hymn.category}</p>
          <p className="italic mt-2 text-gray-400">"{hymn.first_line}"</p>
          {hymn.bio && (
            <div className="mt-4 p-4 rounded-xl bg-gray-800/50 text-sm leading-relaxed">
              <p className="font-semibold mb-1 text-amber-400">Composer Biography</p>
              <p>{hymn.bio}</p>
            </div>
          )}
          <button onClick={() => setShowHymnInfo(false)} className="mt-6 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold w-full">Close</button>
        </div>
      </div>
    );
  };

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${bg}`}>
      <Navbar />
      <Header />

      {view === "home"      && <HomeView />}
      {view === "hymn"      && <HymnView />}
      {view === "recent"    && <RecentView />}
      {view === "favorites" && <FavoritesView />}

      {showNumberGrid && <NumberGridModal />}
      {showHymnInfo   && <HymnInfoModal />}
    </div>
  );
};

export default Hymns;
