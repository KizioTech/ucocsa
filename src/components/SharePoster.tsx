import React, { useRef } from "react";
import { toPng } from "html-to-image";
import { Share2, Download, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logo from "@/assets/ucocsa-logo.png";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PosterProps {
  title: string;
  subtitle?: string | null;
  date?: string | null;
  time?: string | null;
  location?: string | null;
  theme?: string | null;
  details?: Record<string, any> | null;
  type: "program" | "hymn";
  isOpen: boolean;
  onClose: () => void;
}

type PosterSize = "compact" | "expanded";

function getPosterSize(props: Omit<PosterProps, "isOpen" | "onClose">): PosterSize {
  let score = 0;

  if (props.theme) score += 1;
  if (props.subtitle) score += 1;
  if (props.date || props.time || props.location) score += 1;
  if (props.details) score += Object.keys(props.details).length;

  // hymn verses or long program agendas push it over
  if (props.type === "hymn" && props.details) score += 2;

  return score >= 5 ? "expanded" : "compact";
}

const SharePoster: React.FC<PosterProps> = ({ 
  title, subtitle, date, time, location, theme, details, type, isOpen, onClose 
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const posterSize = getPosterSize({ title, subtitle, date, time, location, theme, details, type });
  const isExpanded = posterSize === "expanded";

  const handleDownload = async () => {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toPng(posterRef.current, { quality: 0.95, cacheBust: true });
      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-poster.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Poster downloaded!");
    } catch (err) {
      toast.error("Failed to generate image");
      console.error(err);
    }
  };

  const handleShare = async () => {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toPng(posterRef.current, { quality: 0.95, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "poster.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
          text: `Check out this ${type} from UCOCSA`,
        });
      } else {
        await handleDownload();
      }
    } catch (err) {
      toast.error("Sharing failed");
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-transparent border-none shadow-none max-h-[95vh] overflow-y-auto">
        <div className="flex flex-col gap-4">
          {/* Scrollable preview wrapper — clipped from export */}
          <div className="flex justify-center p-4 max-h-[75vh] overflow-y-auto scrollbar-hide">
            <div 
              ref={posterRef}
              className={`
                w-full bg-gradient-to-br from-forest-deep to-[#0a2e1f] text-cream
                flex flex-col items-center justify-between text-center
                relative overflow-hidden shadow-2xl rounded-sm
                ${isExpanded ? "max-w-sm aspect-[3/5]" : "max-w-sm aspect-[4/5]"}
              `}
              style={{
                fontFamily: "'Outfit', sans-serif",
                padding: isExpanded ? "1.5rem 1.75rem" : "2rem"
              }}
            >
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />
              
              <div className="relative z-10 w-full flex flex-col items-center h-full">
                <img
                  src={logo}
                  alt="UCOCSA Logo"
                  className={`drop-shadow-lg ${isExpanded ? "w-8 h-8 mb-3" : "w-10 h-10 mb-5"}`}
                />
                
                <p className="text-gold-light text-[10px] uppercase font-bold tracking-[0.2em] mb-1">University of Malawi</p>
                <p className={`text-cream/60 text-[8px] uppercase tracking-[0.2em] ${isExpanded ? "mb-3" : "mb-6"}`}>
                  Church of Christ Student Association
                </p>
                
                <div className="flex-1 flex flex-col justify-center w-full">
                  <h2 className={`font-heading text-gradient-gold leading-tight mb-2 ${isExpanded ? "text-lg" : "text-xl md:text-2xl"}`}>
                    {title}
                  </h2>
                  
                  {theme && (
                    <div className={isExpanded ? "mb-2" : "mb-4"}>
                      <p className="text-[8px] text-gold-light/60 uppercase tracking-widest mb-1 italic">Theme</p>
                      <p className={`font-medium text-cream italic px-2 ${isExpanded ? "text-xs" : "text-sm"}`}>"{theme}"</p>
                    </div>
                  )}

                  {subtitle && <p className={`text-cream/80 px-4 ${isExpanded ? "text-[10px] mb-3" : "text-xs mb-4"}`}>{subtitle}</p>}

                  {/* Details section — dynamic for both hymns and programs */}
                  {details && (
                    <div className={`w-full ${isExpanded ? "space-y-1.5 mt-2" : "space-y-2 mt-4"}`}>
                      {Object.entries(details).map(([key, value]) => (
                        <div key={key} className={type === "program" ? "flex justify-between gap-3 border-b border-cream/5 pb-1" : "text-left border-l-2 border-primary/30 pl-3 py-0.5"}>
                          <span className="text-[8px] text-gold-light/50 uppercase tracking-wide shrink-0">{key}</span>
                          <span className={`text-cream/80 ${isExpanded ? "text-[9px]" : "text-[10px]"} ${type === "hymn" ? "leading-relaxed block" : "text-right font-medium"}`}>
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={`mt-auto ${isExpanded ? "space-y-2 pt-3" : "space-y-3 pt-4"}`}>
                    {(date || time || location) && (
                      <div className="flex items-center justify-center gap-2 text-gold-light">
                        <span className="w-6 h-px bg-gold-light/20" />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">Event Details</span>
                        <span className="w-6 h-px bg-gold-light/20" />
                      </div>
                    )}
                    <div className="space-y-1 text-cream/90">
                      {date && <p className="text-[10px] font-bold">{date}</p>}
                      {time && <p className="text-[9px] font-medium">{time}</p>}
                      {location && <p className="text-[9px] text-cream/60 uppercase tracking-wide">{location}</p>}
                    </div>
                  </div>
                </div>

                <div className={`pt-4 border-t border-cream/10 w-full ${isExpanded ? "mt-4" : "mt-8"}`}>
                  <p className="text-[8px] text-cream/40 uppercase tracking-widest mb-1">Join us for fellowship & growth</p>
                  <p className="text-[10px] text-gold-light font-bold">www.ucocsa.vercel.app</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center p-4 bg-background/80 backdrop-blur rounded-xl border border-border mx-4 mb-4">
            <Button onClick={handleShare} className="gap-2 flex-1">
              <Share2 size={16} /> Share Now
            </Button>
            <Button variant="outline" onClick={handleDownload} className="gap-2 shrink-0">
              <Download size={16} /> Save
            </Button>
            <Button variant="ghost" onClick={onClose} size="icon" className="shrink-0">
              <X size={18} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SharePoster;
