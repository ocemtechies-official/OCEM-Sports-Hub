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
        <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
          <Clock className="h-5 w-5" />
          <span className="text-lg font-semibold">Event Started!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/30 to-red-500/30 backdrop-blur-sm px-6 py-3 rounded-full mb-8 border border-orange-400/30">
        <Clock className="h-5 w-5 text-orange-200" />
        <span className="text-base font-semibold text-orange-100">
          Event Starts In
        </span>
      </div>

      <div className="flex justify-center items-center gap-2 md:gap-4 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl p-6 border border-orange-400/30 shadow-lg hover:scale-105 transition-transform duration-300">
          <div className="text-4xl md:text-5xl font-black text-orange-100 mb-2 drop-shadow-lg">
            {timeLeft.days.toString().padStart(2, "0")}
          </div>
          <div className="text-sm font-bold text-orange-200 uppercase tracking-wider">
            Days
          </div>
        </div>

        <div className="text-3xl md:text-4xl font-bold text-orange-200/60">
          :
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl p-6 border border-orange-400/30 shadow-lg hover:scale-105 transition-transform duration-300">
          <div className="text-4xl md:text-5xl font-black text-orange-100 mb-2 drop-shadow-lg">
            {timeLeft.hours.toString().padStart(2, "0")}
          </div>
          <div className="text-sm font-bold text-orange-200 uppercase tracking-wider">
            Hours
          </div>
        </div>

        <div className="text-3xl md:text-4xl font-bold text-orange-200/60">
          :
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl p-6 border border-orange-400/30 shadow-lg hover:scale-105 transition-transform duration-300">
          <div className="text-4xl md:text-5xl font-black text-orange-100 mb-2 drop-shadow-lg">
            {timeLeft.minutes.toString().padStart(2, "0")}
          </div>
          <div className="text-sm font-bold text-orange-200 uppercase tracking-wider">
            Minutes
          </div>
        </div>

        <div className="text-3xl md:text-4xl font-bold text-orange-200/60">
          :
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl p-6 border border-orange-400/30 shadow-lg hover:scale-105 transition-transform duration-300">
          <div className="text-4xl md:text-5xl font-black text-orange-100 mb-2 drop-shadow-lg">
            {timeLeft.seconds.toString().padStart(2, "0")}
          </div>
          <div className="text-sm font-bold text-orange-200 uppercase tracking-wider">
            Seconds
          </div>
        </div>
      </div>
    </div>
  );
}
