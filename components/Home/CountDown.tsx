"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountDown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const targetDate = new Date("2025-10-26T00:00:00").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isExpired) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-full">
          <Clock className="h-4 w-4 text-emerald-300" />
          <span className="text-sm font-semibold text-emerald-200">Event Started!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col items-center">
          <div className="bg-white/20 rounded-lg p-2 w-full">
            <div className="text-xl font-black text-white">
              {timeLeft.days.toString().padStart(2, "0")}
            </div>
          </div>
          <div className="text-xs text-slate-300 mt-1">Days</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-white/20 rounded-lg p-2 w-full">
            <div className="text-xl font-black text-white">
              {timeLeft.hours.toString().padStart(2, "0")}
            </div>
          </div>
          <div className="text-xs text-slate-300 mt-1">Hours</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-white/20 rounded-lg p-2 w-full">
            <div className="text-xl font-black text-white">
              {timeLeft.minutes.toString().padStart(2, "0")}
            </div>
          </div>
          <div className="text-xs text-slate-300 mt-1">Mins</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-white/20 rounded-lg p-2 w-full">
            <div className="text-xl font-black text-white">
              {timeLeft.seconds.toString().padStart(2, "0")}
            </div>
          </div>
          <div className="text-xs text-slate-300 mt-1">Secs</div>
        </div>
      </div>
    </div>
  );
}