import { useState, useEffect } from "react";

const getNextWednesday = () => {
  const now = new Date();
  const day = now.getDay();
  const daysUntilWed = (3 - day + 7) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilWed);
  next.setHours(17, 0, 0, 0); // 5 PM
  if (next <= now) next.setDate(next.getDate() + 7);
  return next;
};

const CountdownTimer = () => {
  const [target] = useState(getNextWednesday);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
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
  );
};

export default CountdownTimer;
