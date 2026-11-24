import { useState, useEffect, useCallback } from "react";

const getNextService = () => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 3=Wed

  // Next Wednesday 6 PM CAT (UTC+2)
  const getNextWed = () => {
    const d = new Date(now);
    const daysUntilWed = (3 - day + 7) % 7 || 7;
    d.setDate(now.getDate() + daysUntilWed);
    d.setHours(18, 0, 0, 0); // 6 PM local
    if (d <= now) d.setDate(d.getDate() + 7);
    return { date: d, label: "MidWeek Service" };
  };

  // Next Sunday 8 AM CAT (UTC+2)
  const getNextSun = () => {
    const d = new Date(now);
    const daysUntilSun = (7 - day) % 7 || 7;
    d.setDate(now.getDate() + daysUntilSun);
    d.setHours(8, 0, 0, 0); // 8 AM local
    if (d <= now) d.setDate(d.getDate() + 7);
    return { date: d, label: "Sunday Gathering" };
  };

  const wed = getNextWed();
  const sun = getNextSun();
  return wed.date < sun.date ? wed : sun;
};

interface CountdownTimerProps {
  /** Whether services are running (from site_settings.is_open) */
  isOpen?: boolean;
  /** The date the school re-opens (from site_settings.opens_at) — ISO date string or null */
  opensAt?: string | null;
}

const CountdownTimer = ({ isOpen = true, opensAt = null }: CountdownTimerProps) => {
  // When closed and a reopening date is set, count down to that.
  // If closed and NO reopening date, return an already-expired target.
  const deriveTarget = useCallback(() => {
    if (!isOpen) {
      if (opensAt) {
        const d = new Date(opensAt + "T08:00:00");
        return { date: d, label: "Reopening" };
      }
      return { date: new Date(0), label: "Closed" };
    }
    return getNextService();
  }, [isOpen, opensAt]);

  const [target, setTarget] = useState(deriveTarget);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Re-derive target whenever isOpen / opensAt changes
  useEffect(() => {
    setTarget(deriveTarget());
  }, [deriveTarget]);

  const calculateTimeLeft = useCallback((targetDate: Date) => {
    const diff = Math.max(0, targetDate.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      isExpired: diff === 0
    };
  }, []);

  useEffect(() => {
    const tick = () => {
      const result = calculateTimeLeft(target.date);

      if (result.isExpired && isOpen) {
        // Only auto-advance to next service when school is open
        setTarget(getNextService());
      } else {
        setTimeLeft({
          days: result.days,
          hours: result.hours,
          minutes: result.minutes,
          seconds: result.seconds
        });
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target.date, calculateTimeLeft, isOpen]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  const isClosed = !isOpen;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-cream/80 text-xs font-medium uppercase tracking-wider">
        {isClosed && opensAt ? "Break ends in" : `Next: ${target.label}`}
      </p>
      <div className="flex gap-3">
        {units.map((u) => (
          <div
            key={u.label}
            className={`flex flex-col items-center backdrop-blur rounded-lg px-3 py-2 min-w-[60px] ${
              isClosed ? "bg-amber-500/20" : "bg-secondary/80"
            }`}
          >
            <span
              className={`text-2xl font-bold font-heading ${
                isClosed ? "text-amber-200" : "text-secondary-foreground"
              }`}
            >
              {String(u.value).padStart(2, "0")}
            </span>
            <span
              className={`text-[10px] uppercase tracking-wider ${
                isClosed ? "text-amber-300/60" : "text-secondary-foreground/60"
              }`}
            >
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
