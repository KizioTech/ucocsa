import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Heart, Grid, ArrowLeft, Music, Clock, Star, Book, Gift,
  Sunrise, Shield, Flame, Info, X, Play, ChevronUp, ChevronDown,
  MonitorPlay, Type
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
const CATEGORY_META: Record<string, { icon: React.ElementType; label: string }> = {
  Traditional: { icon: Book, label: "Traditional" },
  Christmas:   { icon: Gift, label: "Christmas" },
  Easter:      { icon: Sunrise, label: "Easter" },
  Worship:     { icon: Music, label: "Worship" },
  worship:     { icon: Music, label: "Worship" },
  Praise:      { icon: Music, label: "Praise" },
  Assurance:   { icon: Shield, label: "Assurance" },
  Faith:       { icon: Heart, label: "Faith" },
  Hope:        { icon: Star, label: "Hope" },
  Salvation:   { icon: Flame, label: "Salvation" },
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
  const [view, setView] = useState<"home" | "hymn" | "recent" | "favorites">("home");
  const [selected, setSelected] = useState<Hymn | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [recent, setRecent] = useState<Hymn[]>([]);
  const [fontSize, setFontSize] = useState(16);
  const [autoScroll, setAutoScroll] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);
  const [showHymnInfo, setShowHymnInfo] = useState(false);
  const [showNumberGrid, setShowNumberGrid] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [greeting] = useState(getGreeting);

  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedScrollY = useRef(0);

  const { data: hymns = [], isLoading } = useQuery({
    queryKey: ["hymns"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("hymns") as any).select("*").order("id");
      if (error) throw error;
      return data as Hymn[];
    },
  });

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

  useEffect(() => { localStorage.setItem("hymnFavorites", JSON.stringify([...favorites])); }, [favorites]);
  useEffect(() => { localStorage.setItem("hymnRecent", JSON.stringify(recent)); }, [recent]);
  useEffect(() => { localStorage.setItem("hymnFontSize", fontSize.toString()); }, [fontSize]);

  useEffect(() => {
    if (autoScroll) {
      scrollIntervalRef.current = setInterval(() => window.scrollBy(0, 1), 80);
    } else {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    }
    return () => { if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current); };
  }, [autoScroll]);

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

  // ── Verse renderer ────────────────────────────────────────────────────────
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

  // ── Hymn Card ─────────────────────────────────────────────────────────────
  const HymnCard = ({ hymn }: { hymn: Hymn }) => {
    const Icon = CATEGORY_META[hymn.category || ""]?.icon || Music;
    return (
      <Card
        onClick={() => openHymn(hymn)}
        className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-primary group"
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg font-heading">
                {hymn.id}
              </div>
              <div className="flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">{hymn.category}</span>
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); toggleFavorite(hymn.id); }}
              className={`p-1.5 rounded-full transition-colors ${
                favorites.has(hymn.id)
                  ? "text-destructive"
                  : "text-muted-foreground hover:text-destructive"
              }`}
            >
              <Heart className={`h-5 w-5 ${favorites.has(hymn.id) ? "fill-current" : ""}`} />
            </button>
          </div>
          <h3 className="text-base font-bold mb-1 text-foreground font-heading">{hymn.title}</h3>
          <p className="text-sm text-muted-foreground mb-2">by {hymn.author}</p>
          <p className="text-sm italic text-muted-foreground truncate">"{hymn.first_line}"</p>
          <div className="mt-3 flex items-center justify-between">
            {isOnline && hymn.youtube_id && (
              <span className="text-xs text-primary flex items-center gap-1">
                <Play className="h-3 w-3" /> Video available
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {hymn.verses.length} verse{hymn.verses.length !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ── HEADER ────────────────────────────────────────────────────────────────
  const Header = () => (
    <header className="sticky top-[64px] z-30 border-b border-border bg-background/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {view !== "home" && (
            <Button variant="ghost" size="icon" onClick={goHome}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => setShowNumberGrid(true)} title="Quick access by number">
            <Grid className="h-5 w-5 text-primary" />
          </Button>
          <h1 className="text-lg font-bold tracking-wide text-primary font-heading hidden sm:block">
            SING UNTO THE LORD
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <span className="text-xs px-2 py-0.5 bg-destructive/20 text-destructive rounded-full">Offline</span>
          )}
        </div>
      </div>
    </header>
  );

  // ── HOME VIEW ─────────────────────────────────────────────────────────────
  const HomeView = () => {
    const categories = [...new Set(hymns.map(h => h.category).filter(Boolean))] as string[];
    const favoriteHymns = hymns.filter(h => favorites.has(h.id));

    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Greeting */}
        <div className="text-center mb-8 py-8 px-4 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/10 border border-primary/20">
          <p className="text-2xl font-bold text-primary mb-2 font-heading">{greeting.message}</p>
          <p className="text-sm italic text-muted-foreground">{greeting.verse}</p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            id="hymn-search"
            type="text"
            placeholder="Search by title, author, number or first line..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent outline-none"
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setCategory("")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === ""
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >All</button>
          {categories.map(cat => {
            const Icon = CATEGORY_META[cat]?.icon || Music;
            return (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm flex items-center gap-1.5 font-medium transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />{cat}
              </button>
            );
          })}
        </div>

        {/* Quick nav buttons */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => setView("recent")} className="flex items-center gap-2 text-sm text-primary hover:underline font-medium">
            <Clock className="h-4 w-4" /> Recently Viewed
          </button>
          <button onClick={() => setView("favorites")} className="flex items-center gap-2 text-sm text-primary hover:underline font-medium">
            <Star className="h-4 w-4" /> Favorites ({favorites.size})
          </button>
        </div>

        {/* Favorite hymns strip */}
        {favoriteHymns.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" /> Favorites
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteHymns.slice(0, 3).map(h => <HymnCard key={`fav-${h.id}`} hymn={h} />)}
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
              <div key={i} className="h-40 rounded-xl animate-pulse bg-muted" />
            ))}
          </div>
        ) : filteredHymns.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHymns.map(h => <HymnCard key={h.id} hymn={h} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <Music className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hymns found for "{search}".</p>
          </div>
        )}
      </div>
    );
  };

  // ── HYMN DETAIL VIEW ──────────────────────────────────────────────────────
  const HymnView = () => {
    const hymn = selected;
    if (!hymn) return null;

    if (presentationMode) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 text-center bg-secondary">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPresentationMode(false)}
            className="absolute top-4 right-4 text-secondary-foreground hover:bg-secondary-foreground/10"
          >
            <X className="h-6 w-6" />
          </Button>
          <h1 className="text-4xl sm:text-5xl font-bold text-secondary-foreground mb-2 font-heading">{hymn.title}</h1>
          <p className="text-xl text-secondary-foreground/60 mb-10">by {hymn.author}</p>
          <div className="space-y-10 max-w-4xl w-full text-left">
            {hymn.verses.map((v, i) => (
              <div key={i}>
                <div className="text-xs font-semibold text-primary uppercase mb-2">Verse {i + 1}</div>
                <div className="text-2xl text-secondary-foreground leading-relaxed">{renderVerse(v)}</div>
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
            <div className="text-3xl font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl font-heading">{hymn.id}</div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-heading">{hymn.title}</h1>
              <p className="text-muted-foreground">by {hymn.author}</p>
              {hymn.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary mt-1 inline-block font-medium">
                  {hymn.category}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(hymn.id)}
              className={favorites.has(hymn.id) ? "text-destructive" : "text-muted-foreground hover:text-destructive"}
            >
              <Heart className={`h-6 w-6 ${favorites.has(hymn.id) ? "fill-current" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowHymnInfo(true)} className="text-muted-foreground hover:text-primary">
              <Info className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
            <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="text-sm font-bold text-foreground hover:text-primary">
              <Type className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs text-muted-foreground px-1">{fontSize}px</span>
            <button onClick={() => setFontSize(s => Math.min(28, s + 2))} className="text-sm font-bold text-foreground hover:text-primary">
              <Type className="h-4.5 w-4.5" />
            </button>
          </div>
          <Button
            variant={autoScroll ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoScroll(a => !a)}
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            {autoScroll ? "Stop Scroll" : "Auto-scroll"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPresentationMode(true)}
          >
            <MonitorPlay className="h-4 w-4 mr-1" />
            Presentation
          </Button>
        </div>

        {/* YouTube embed */}
        {isOnline && hymn.youtube_id && (
          <div className="mb-8">
            {!showYouTube ? (
              <Button variant="destructive" size="sm" onClick={() => setShowYouTube(true)}>
                <Play className="h-4 w-4 mr-1" /> Show Video
              </Button>
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
                <button onClick={() => setShowYouTube(false)} className="mt-2 text-xs text-muted-foreground hover:text-foreground underline">
                  Hide video
                </button>
              </div>
            )}
          </div>
        )}

        {/* Verses */}
        <div className="space-y-6">
          {hymn.verses.map((verse, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="text-xs font-semibold text-primary uppercase mb-3 tracking-wider">Verse {i + 1}</div>
                <div style={{ fontSize: `${fontSize}px` }} className="leading-relaxed text-foreground">
                  {renderVerse(verse)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // ── RECENTLY VIEWED ───────────────────────────────────────────────────────
  const RecentView = () => (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground font-heading">
        <Clock className="h-5 w-5 text-primary" /> Recently Viewed
      </h2>
      {recent.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">Nothing viewed yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recent.map(h => <HymnCard key={`rec-${h.id}`} hymn={h} />)}
        </div>
      )}
    </div>
  );

  // ── FAVORITES VIEW ────────────────────────────────────────────────────────
  const FavoritesView = () => {
    const favHymns = hymns.filter(h => favorites.has(h.id));
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground font-heading">
          <Star className="h-5 w-5 text-primary" /> Favorites
        </h2>
        {favHymns.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center">No favorites yet. Tap the heart on any hymn!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favHymns.map(h => <HymnCard key={`fav-${h.id}`} hymn={h} />)}
          </div>
        )}
      </div>
    );
  };

  // ── NUMBER GRID MODAL ─────────────────────────────────────────────────────
  const NumberGridModal = () => (
    <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setShowNumberGrid(false)}>
      <div className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-2xl bg-background border border-border" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-foreground font-heading">Quick Access — Select Hymn #</h2>
          <Button variant="ghost" size="icon" onClick={() => setShowNumberGrid(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {hymns.map(h => (
            <button
              key={h.id}
              onClick={() => { setShowNumberGrid(false); setTimeout(() => openHymn(h), 80); }}
              className="h-12 rounded-lg border-2 border-border font-bold text-sm transition-all hover:scale-105 hover:border-primary hover:text-primary bg-card text-card-foreground"
            >
              {h.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── HYMN INFO MODAL ───────────────────────────────────────────────────────
  const HymnInfoModal = () => {
    const hymn = selected;
    if (!hymn) return null;
    return (
      <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setShowHymnInfo(false)}>
        <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6 shadow-2xl bg-background border border-border" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-foreground font-heading">About "{hymn.title}"</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowHymnInfo(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-foreground"><strong>Author:</strong> {hymn.author}</p>
          <p className="text-foreground"><strong>Category:</strong> {hymn.category}</p>
          <p className="italic mt-2 text-muted-foreground">"{hymn.first_line}"</p>
          {hymn.bio && (
            <div className="mt-4 p-4 rounded-xl bg-muted text-sm leading-relaxed">
              <p className="font-semibold mb-1 text-primary">Composer Biography</p>
              <p className="text-foreground">{hymn.bio}</p>
            </div>
          )}
          <Button onClick={() => setShowHymnInfo(false)} className="mt-6 w-full">
            Close
          </Button>
        </div>
      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Header />
      {view === "home" && <HomeView />}
      {view === "hymn" && <HymnView />}
      {view === "recent" && <RecentView />}
      {view === "favorites" && <FavoritesView />}
      {showNumberGrid && <NumberGridModal />}
      {showHymnInfo && <HymnInfoModal />}
    </div>
  );
};

export default Hymns;
