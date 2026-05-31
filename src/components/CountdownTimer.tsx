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

const CountdownTimer = () => {
  const [target, setTarget] = useState(getNextService);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
      
      if (result.isExpired) {
        // Target reached, find next service
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
  }, [target.date, calculateTimeLeft]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-cream/80 text-xs font-medium uppercase tracking-wider">{target.label}</p>
      <div className="flex gap-3">
        {units.map((u) => (
          <div key={u.label} className="flex flex-col items-center bg-secondary/80 backdrop-blur rounded-lg px-3 py-2 min-w-[60px]">
            <span className="text-2xl font-bold text-secondary-foreground font-heading">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-secondary-foreground/60">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
