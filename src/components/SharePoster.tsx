import React, { useRef } from "react";
import { toPng } from "html-to-image";
import { Share2, Download, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logo from "@/assets/ucocsa-logo.png";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

const SharePoster: React.FC<PosterProps> = ({ 
  title, subtitle, date, time, location, theme, details, type, isOpen, onClose 
}) => {
  const posterRef = useRef<HTMLDivElement>(null);

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
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-transparent border-none shadow-none">
        <div className="flex flex-col gap-4">
          {/* Poster Preview */}
          <div className="flex justify-center p-4">
            <div 
              ref={posterRef}
              className="w-full max-w-sm aspect-[4/5] bg-gradient-to-br from-forest-deep to-[#0a2e1f] text-cream p-8 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl rounded-sm"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mb-32 blur-3xl" />
              
              <div className="relative z-10 w-full flex flex-col items-center h-full">
                <img src={logo} alt="UCOCSA Logo" className="w-16 h-16 mb-6 drop-shadow-lg" />
                
                <p className="text-gold-light text-[10px] uppercase tracking-[0.3em] font-bold mb-2">University of Malawi</p>
                <p className="text-cream/60 text-[8px] uppercase tracking-[0.2em] mb-6">Church of Christ Student Association</p>
                
                <div className="flex-1 flex flex-col justify-center w-full">
                  <h2 className="text-2xl md:text-3xl font-heading text-gradient-gold mb-4 leading-tight">
                    {title}
                  </h2>
                  
                  {theme && (
                    <div className="mb-6">
                      <p className="text-[10px] text-gold-light/60 uppercase tracking-widest mb-1 italic">Theme</p>
                      <p className="text-lg font-medium text-cream italic px-4">"{theme}"</p>
                    </div>
                  )}

                  {subtitle && <p className="text-sm text-cream/80 mb-6 px-4">{subtitle}</p>}

                  <div className="space-y-3 mt-4">
                    {date && (
                      <div className="flex items-center justify-center gap-2 text-gold-light">
                        <span className="w-8 h-px bg-gold-light/30" />
                        <span className="text-sm font-semibold">{date}</span>
                        <span className="w-8 h-px bg-gold-light/30" />
                      </div>
                    )}
                    {time && <p className="text-xs font-medium text-cream/90">{time}</p>}
                    {location && <p className="text-xs text-cream/70 uppercase tracking-wider">{location}</p>}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-cream/10 w-full">
                  <p className="text-[9px] text-cream/40 uppercase tracking-widest mb-1">Join us for fellowship & growth</p>
                  <p className="text-[10px] text-gold-light font-bold">www.ucocsa.vercel.app</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center p-4 bg-background/80 backdrop-blur rounded-xl border border-border">
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
