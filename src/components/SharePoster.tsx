// SharePoster — v2.0.1 (Force SW update)
import React, { useRef } from "react";
import { toPng } from "html-to-image";
import { Share2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logo from "@/assets/ucocsa-logo.png";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  /** Deep link to the specific item being shared (included in Share Now) */
  url?: string | null;
}

type PosterSize = "compact" | "expanded";

// ─── Scoring logic ─────────────────────────────────────────────────────────────

function getPosterSize(props: Omit<PosterProps, "isOpen" | "onClose">): PosterSize {
  let score = 0;
  if (props.theme) score += 1;
  if (props.subtitle) score += 1;
  if (props.date || props.time || props.location) score += 1;
  if (props.details) score += Object.keys(props.details).length;
  if (props.type === "hymn" && props.details) score += 2;
  return score >= 5 ? "expanded" : "compact";
}

// ─── SVG Assets ───────────────────────────────────────────────────────────────

/**
 * Organic wave SVG that forms the lower boundary of the white header band.
 * Uses a cubic bezier path to produce the fluid, irregular contour described
 * in the design brief. The viewBox is 400×80 so it stretches full-width and
 * stays proportional at any poster width.
 */
const WaveDivider = () => (
  <svg
    viewBox="0 0 400 72"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "block", width: "100%", position: "absolute", bottom: -1, left: 0 }}
  >
    {/* Ambient occlusion shadow strip beneath the curve */}
    <path
      d="M0,22 C55,52 110,10 180,38 C250,66 310,14 370,34 L400,28 L400,72 L0,72 Z"
      fill="rgba(0,0,0,0.10)"
    />
    {/* Main white fill */}
    <path
      d="M0,20 C55,50 110,8 180,36 C250,64 310,12 370,32 L400,26 L400,72 L0,72 Z"
      fill="#ffffff"
    />
  </svg>
);

/**
 * Fine noise texture as an inline SVG data-URI.
 * fractalNoise at high baseFrequency produces subtle grain.
 */
const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

// ─── Main Component ───────────────────────────────────────────────────────────

const SharePoster: React.FC<PosterProps> = ({
  title, subtitle, date, time, location, theme, details, type, isOpen, onClose, url,
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const posterSize = getPosterSize({ title, subtitle, date, time, location, theme, details, type });
  const isExpanded = posterSize === "expanded";

  // ── Export handlers ──────────────────────────────────────────────────────────

  const handleDownload = async () => {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toPng(posterRef.current, {
        quality: 0.95,
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: false,
      });
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
      const dataUrl = await toPng(posterRef.current, {
        quality: 0.95,
        cacheBust: true,
        pixelRatio: 2,
        skipFonts: false,
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "poster.png", { type: "image/png" });

      // Build the share text — include the deep link so recipients can open the page
      const shareUrl = url || window.location.href;
      const shareText = `Check out this ${type} from UCOCSA\n${shareUrl}`;

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await handleDownload();
      }
    } catch (err) {
      toast.error("Sharing failed");
      console.error(err);
    }
  };

  // ── Responsive sizing helpers ────────────────────────────────────────────────
  const pad = isExpanded ? "1.25rem 1.5rem" : "1.75rem";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-transparent border-none shadow-none max-h-[95vh] overflow-y-auto">
        <div className="flex flex-col gap-4">

          {/* ── Scrollable preview wrapper (not captured by toPng) ── */}
          <div className="flex justify-center p-4 max-h-[78vh] overflow-y-auto scrollbar-hide">

            {/* ════════════════════════════════════════════════════════
                POSTER — everything inside this div is exported
            ════════════════════════════════════════════════════════ */}
            <div
              ref={posterRef}
              className="w-full max-w-sm relative overflow-hidden rounded-sm shadow-2xl"
              style={{
                fontFamily: "'Outfit', sans-serif",
                outline: "2.5px solid rgba(255,255,255,0.92)",
                outlineOffset: "-6px",
                minHeight: isExpanded ? "640px" : "500px",
                display: "flex",
                flexDirection: "column",
              }}
            >

              {/* ── Layer 0: Forest green base gradient ── */}
              <div
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(ellipse at 18% 12%, rgba(79,121,66,0.55) 0%, transparent 55%),
                    radial-gradient(ellipse at 82% 80%, rgba(6,28,18,0.7) 0%, transparent 50%),
                    linear-gradient(158deg, #133d26 0%, #0e3320 35%, #0a2819 65%, #061610 100%)
                  `,
                }}
              />

              {/* ── Layer 1: Lens-dust / soft light spill ── */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(ellipse at 30% 20%, rgba(180,220,160,0.07) 0%, transparent 45%),
                    radial-gradient(ellipse at 75% 65%, rgba(10,50,25,0.3) 0%, transparent 50%)
                  `,
                }}
              />

              {/* ── Layer 2: Edge darkening / vignette ── */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    radial-gradient(ellipse at 50% 50%, transparent 42%, rgba(0,0,0,0.42) 100%)
                  `,
                }}
              />

              {/* ── Layer 3: Fine grain / grit noise texture ── */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: NOISE_BG,
                  backgroundSize: "160px 160px",
                  opacity: 0.045,
                  mixBlendMode: "overlay",
                }}
              />

              {/* ── Layer 4: Charcoal smudge diffusion (upper-left) ── */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: "18%",
                  left: "-8%",
                  width: "55%",
                  height: "30%",
                  background: "radial-gradient(ellipse, rgba(20,12,8,0.18) 0%, transparent 70%)",
                  filter: "blur(28px)",
                  transform: "rotate(-12deg)",
                }}
              />

              {/* ── Layer 5: White header band with organic wave boundary ── */}
              <div
                className="absolute top-0 left-0 right-0 pointer-events-none"
                style={{ height: isExpanded ? "120px" : "140px" }}
              >
                {/* Matte white fill */}
                <div className="absolute inset-0" style={{ background: "#ffffff" }} />
                {/* Ambient occlusion / soft shadow on white panel itself */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0.035) 100%)",
                  }}
                />
                {/* Wave SVG boundary */}
                <WaveDivider />
              </div>

              {/* ── Layer 6: Poster content ── */}
              <div
                className="relative flex flex-col flex-1 z-10"
                style={{ padding: pad }}
              >

                {/* Header (sits on white band) */}
                <div
                  className="flex flex-col items-center"
                  style={{
                    height: isExpanded ? "120px" : "140px",
                    justifyContent: "center",
                    paddingBottom: isExpanded ? "1rem" : "1.4rem",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={logo}
                    alt="UCOCSA Logo"
                    style={{
                      width: isExpanded ? 32 : 40,
                      height: isExpanded ? 32 : 40,
                      objectFit: "contain",
                      filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.12))",
                      marginBottom: isExpanded ? "4px" : "6px",
                    }}
                  />
                  <p
                    style={{
                      color: "#1a4a2e",
                      fontSize: isExpanded ? "6px" : "7px",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      marginBottom: "2px",
                      lineHeight: 1,
                    }}
                  >
                    University of Malawi
                  </p>
                  <p
                    style={{
                      color: "rgba(20,55,35,0.55)",
                      fontSize: "5.5px",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      lineHeight: 1,
                    }}
                  >
                    Church of Christ Student Association
                  </p>
                </div>

                {/* Body — scrolls content in the green zone */}
                <div className="flex flex-col flex-1 items-center" style={{ paddingTop: isExpanded ? "0.5rem" : "0.75rem" }}>

                  {/* Title */}
                  <h2
                    style={{
                      color: "#e8cc7a",
                      fontSize: isExpanded ? "15px" : "19px",
                      fontWeight: 700,
                      lineHeight: 1.2,
                      textAlign: "center",
                      marginBottom: isExpanded ? "6px" : "8px",
                      letterSpacing: "0.01em",
                      // Subtle gold text-shadow for depth
                      textShadow: "0 1px 12px rgba(212,168,83,0.25)",
                    }}
                  >
                    {title}
                  </h2>

                  {/* Decorative rule */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      width: "65%",
                      marginBottom: isExpanded ? "8px" : "10px",
                    }}
                  >
                    <div style={{ flex: 1, height: "0.5px", background: "rgba(212,168,83,0.3)" }} />
                    <div style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(212,168,83,0.6)", flexShrink: 0 }} />
                    <div style={{ flex: 1, height: "0.5px", background: "rgba(212,168,83,0.3)" }} />
                  </div>

                  {/* Theme */}
                  {theme && (
                    <div style={{ marginBottom: isExpanded ? "6px" : "8px", textAlign: "center", padding: "0 6px" }}>
                      <p style={{ color: "rgba(212,168,83,0.45)", fontSize: "6px", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "2px" }}>
                        Theme
                      </p>
                      <p style={{ color: "rgba(245,237,212,0.88)", fontSize: isExpanded ? "9px" : "11px", fontStyle: "italic", lineHeight: 1.4 }}>
                        "{theme}"
                      </p>
                    </div>
                  )}

                  {/* Subtitle */}
                  {subtitle && (
                    <div style={{ marginBottom: isExpanded ? "6px" : "8px", padding: "0 8px", width: "100%" }}>
                      {type === "hymn" ? (
                        <div style={{ textAlign: "left", paddingLeft: "10px", borderLeft: "1.5px solid rgba(212,168,83,0.25)" }}>
                          <p style={{ color: "rgba(212,168,83,0.5)", fontSize: "6px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "2px" }}>Verse 1</p>
                          <p style={{ color: "rgba(245,237,212,0.82)", fontSize: isExpanded ? "8.5px" : "10px", lineHeight: 1.6, whiteSpace: "pre-line" }}>{subtitle}</p>
                        </div>
                      ) : (
                        <p style={{ color: "rgba(245,237,212,0.6)", fontSize: isExpanded ? "8px" : "9px", textAlign: "center", fontStyle: "italic", lineHeight: 1.4 }}>{subtitle}</p>
                      )}
                    </div>
                  )}

                  {/* Details — hymn verses or program agenda */}
                  {details && (
                    <div
                      style={{
                        width: "100%",
                        marginTop: isExpanded ? "4px" : "6px",
                        borderTop: "0.5px solid rgba(255,255,255,0.08)",
                        paddingTop: isExpanded ? "8px" : "10px",
                        display: "flex",
                        flexDirection: "column",
                        gap: isExpanded ? "7px" : "6px",
                      }}
                    >
                      {Object.entries(details).map(([key, value]) => {
                        const isChorus = type === "hymn" && /chorus/i.test(key);
                        return type === "hymn" ? (
                          /* Hymn verse / chorus row */
                          <div
                            key={key}
                            style={{
                              textAlign: "left",
                              paddingLeft: "10px",
                              borderLeft: isChorus
                                ? "1.5px solid rgba(212,168,83,0.55)"
                                : "1.5px solid rgba(212,168,83,0.25)",
                              background: isChorus ? "rgba(212,168,83,0.04)" : "transparent",
                              padding: isChorus ? "4px 8px 4px 10px" : "0 0 0 10px",
                            }}
                          >
                            <p style={{ color: "rgba(212,168,83,0.6)", fontSize: "6px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "2px", fontWeight: 600 }}>
                              {key}
                            </p>
                            <p
                              style={{
                                color: isChorus ? "rgba(245,237,212,0.92)" : "rgba(245,237,212,0.82)",
                                fontSize: isExpanded ? "8.5px" : "9px",
                                lineHeight: 1.65,
                                fontStyle: isChorus ? "italic" : "normal",
                                fontWeight: isChorus ? 500 : 400,
                                whiteSpace: "pre-line",
                              }}
                            >
                              {String(value)}
                            </p>
                          </div>
                        ) : (
                          /* Program agenda row */
                          <div
                            key={key}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: "10px",
                              paddingBottom: "5px",
                              borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <span style={{ color: "rgba(212,168,83,0.55)", fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.12em", flexShrink: 0, paddingTop: "1px", lineHeight: 1.3 }}>
                              {key}
                            </span>
                            <span style={{ color: "rgba(245,237,212,0.82)", fontSize: isExpanded ? "8px" : "9px", textAlign: "right", lineHeight: 1.4 }}>
                              {String(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Date / Time / Location */}
                  {(date || time || location) && (
                    <div
                      style={{
                        marginTop: isExpanded ? "16px" : "20px",
                        paddingTop: isExpanded ? "8px" : "10px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "3px",
                        width: "100%",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", width: "70%" }}>
                        <div style={{ flex: 1, height: "0.5px", background: "rgba(212,168,83,0.2)" }} />
                        <div style={{ width: 3, height: 3, background: "rgba(212,168,83,0.45)", transform: "rotate(45deg)", flexShrink: 0 }} />
                        <div style={{ flex: 1, height: "0.5px", background: "rgba(212,168,83,0.2)" }} />
                      </div>
                      {date && (
                        <p style={{ color: "#d4a853", fontSize: isExpanded ? "9px" : "10px", fontWeight: 700, letterSpacing: "0.04em", textAlign: "center" }}>
                          {date}
                        </p>
                      )}
                      {time && (
                        <p style={{ color: "rgba(245,237,212,0.75)", fontSize: isExpanded ? "8px" : "9px", textAlign: "center" }}>
                          {time}
                        </p>
                      )}
                      {location && (
                        <p style={{ color: "rgba(245,237,212,0.45)", fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.14em", textAlign: "center" }}>
                          {location}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer — always visible, never shrinks */}
                <div
                  style={{
                    borderTop: "0.5px solid rgba(212,168,83,0.25)",
                    paddingTop: isExpanded ? "10px" : "12px",
                    textAlign: "center",
                    marginTop: isExpanded ? "12px" : "16px",
                    flexShrink: 0,
                  }}
                >
                  <p style={{ color: "rgba(245,237,212,0.55)", fontSize: "6px", letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: "3px", fontWeight: 600 }}>
                    Join us for fellowship & growth
                  </p>
                  <p style={{ color: "#d4a853", fontSize: isExpanded ? "8.5px" : "9.5px", fontWeight: 700, letterSpacing: "0.06em" }}>
                    www.ucocsa.vercel.app
                  </p>
                </div>
              </div>

              {/* ── Layer 7 (topmost): Final sheen — very subtle specular gloss ── */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 40%)",
                }}
              />

            </div>
            {/* ════ end poster ════ */}

          </div>

          {/* ── Action Buttons ── */}
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