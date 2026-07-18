import React from "react";

interface RotatingMandalaProps {
  size?: number;
  className?: string;
  speed?: "slow" | "medium" | "fast";
  color?: string;
  secondaryColor?: string;
}

export default function RotatingMandala({
  size = 120,
  className = "",
  speed = "slow",
  color = "currentColor",
  secondaryColor = "currentColor"
}: RotatingMandalaProps) {
  const speedClass = 
    speed === "slow" ? "animate-slow-spin-120" : 
    speed === "medium" ? "animate-slow-spin-80" : 
    "animate-spin";

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Rotating Ring */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`absolute ${speedClass}`}
        style={{ color: color }}
      >
        {/* Sacred geometry circular lattices & petals */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2, 2" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.75" />
        
        {/* Surrounding triangular alignment */}
        <polygon points="50,10 84.6,70 15.4,70" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <polygon points="50,90 15.4,30 84.6,30" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />

        {/* Lotus petals array */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 360) / 8;
          return (
            <g key={i} transform={`rotate(${angle} 50 50)`}>
              <path
                d="M50,12 C53,25 50,45 50,50 C50,45 47,25 50,12"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.75"
              />
              <circle cx="50" cy="12" r="1.5" fill="currentColor" />
            </g>
          );
        })}
      </svg>

      {/* Inner Rotating Ring (Counter-rotating) */}
      <svg
        width={size * 0.7}
        height={size * 0.7}
        viewBox="0 0 100 100"
        className="absolute animate-slow-spin-80"
        style={{ color: secondaryColor }}
      >
        {/* Star of David / Shriyantra-like structure */}
        <polygon points="50,15 80.3,67.5 19.7,67.5" fill="none" stroke="currentColor" strokeWidth="1" />
        <polygon points="50,85 19.7,32.5 80.3,32.5" fill="none" stroke="currentColor" strokeWidth="1" />
        
        {/* Inner circle and center point */}
        <circle cx="50" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1, 1" />
        <circle cx="50" cy="50" r="2.5" fill="currentColor" />
      </svg>
    </div>
  );
}
