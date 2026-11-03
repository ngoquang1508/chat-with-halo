// src/components/common/logo.tsx
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  stroke?: string;
}

export function Logo({ className, size = 48, stroke = "white" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]", className)}
    >
      {/* Khối người gửi - Animated */}
      <rect
        x="20"
        y="30"
        width="35"
        height="35"
        rx="4"
        stroke={stroke}
        strokeWidth="4"
        className="animate-pulse"
      />
      {/* Khối người nhận - Static/Solid */}
      <rect
        x="45"
        y="45"
        width="35"
        height="35"
        rx="4"
        fill="white"
        stroke="black"
        strokeWidth="2"
      />
      {/* Dot tín hiệu kết nối */}
      <circle cx="52" cy="52" r="3" fill="black" />
    </svg>
  );
}
