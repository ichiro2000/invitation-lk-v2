"use client";

import { useEffect, useState, useCallback } from "react";

type CountdownProps = {
  targetDate: string;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  boxClassName?: string;
  separatorClassName?: string;
};

function calculate(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown({
  targetDate,
  className = "",
  labelClassName = "text-xs text-gray-400 mt-1",
  valueClassName = "text-2xl font-bold",
  boxClassName = "flex flex-col items-center",
  separatorClassName = "text-2xl font-light opacity-30 mx-1",
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => calculate(targetDate));

  const tick = useCallback(() => {
    setTimeLeft(calculate(targetDate));
  }, [targetDate]);

  useEffect(() => {
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [tick]);

  const items = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-4">
          <div className={boxClassName}>
            <span className={valueClassName}>
              {String(item.value).padStart(2, "0")}
            </span>
            <span className={labelClassName}>{item.label}</span>
          </div>
          {i < 3 && <span className={separatorClassName}>:</span>}
        </div>
      ))}
    </div>
  );
}
