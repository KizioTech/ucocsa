import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface BibleVerse {
  bookname: string;
  chapter: string;
  verse: string;
  text: string;
}

const fetchVOTD = async (): Promise<BibleVerse> => {
  // labs.bible.org: free, no API key, has a daily VOTD endpoint
  const res = await fetch(
    "https://labs.bible.org/api/?passage=votd&type=json",
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error("Failed to fetch verse");
  const data: BibleVerse[] = await res.json();
  return data[0];
};

const VerseOfTheDay = () => {
  const { data: verse, isLoading, isError } = useQuery({
    queryKey: ["verse-of-the-day"],
    queryFn: fetchVOTD,
    // Cache for 24 hours — same verse all day, no repeat calls
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 2,
  });

  const reference = verse
    ? `${verse.bookname} ${verse.chapter}:${verse.verse}`
    : "";

  const handleCopy = () => {
    if (!verse) return;
    navigator.clipboard.writeText(`"${verse.text}" — ${reference} (NET)`);
    toast.success("Verse copied!");
  };

  const handleShare = () => {
    if (!verse) return;
    const text = `"${verse.text}" — ${reference}\n\nucocsa.vercel.app`;
    if (navigator.share) {
      navigator.share({ title: "Verse of the Day", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Verse copied for sharing!");
    }
  };

  if (isError) return null; // fail silently — don't break homepage

  return (
    <section className="py-10 bg-primary/5 border-y border-primary/10">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Label */}
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={14} className="text-primary" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Verse of the Day
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              NET Bible
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-5 bg-muted rounded w-full" />
              <div className="h-5 bg-muted rounded w-5/6" />
              <div className="h-5 bg-muted rounded w-3/5" />
              <div className="h-4 bg-muted rounded w-36 mt-4" />
            </div>
          ) : verse ? (
            <>
              <blockquote className="pl-5 border-l-4 border-primary font-serif text-lg md:text-xl leading-relaxed text-foreground italic mb-4">
                "{verse.text}"
              </blockquote>
              <p className="pl-5 text-sm font-medium text-primary mb-5">
                — {reference}
              </p>
              <div className="pl-5 flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border hover:bg-muted"
                >
                  <Copy size={12} /> Copy verse
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full border border-border hover:bg-muted"
                >
                  <Share2 size={12} /> Share
                </button>
              </div>
            </>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
};

export default VerseOfTheDay;
