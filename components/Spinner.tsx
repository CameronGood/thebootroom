"use client";

export default function Spinner({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  // Generate unique IDs for each spinner instance
  const clipId = `mountainClip-${size}`;

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <svg
        viewBox="0 0 100 80"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Clip path for top-to-bottom fill animation */}
          <clipPath id={clipId}>
            <rect x="0" y="80" width="100" height="0">
              <animate
                attributeName="y"
                values="80;0;0;80"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="height"
                values="0;80;80;0"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </rect>
          </clipPath>
        </defs>
        
        {/* Three triangles forming a mountain range */}
        <g clipPath={`url(#${clipId})`}>
          {/* Left mountain */}
          <path
            d="M 10 80 L 30 30 L 50 80 Z"
            fill="#F5E4D0"
            opacity="0.9"
          />
          {/* Middle mountain (tallest) */}
          <path
            d="M 35 80 L 50 15 L 65 80 Z"
            fill="#F5E4D0"
            opacity="0.95"
          />
          {/* Right mountain */}
          <path
            d="M 50 80 L 70 40 L 90 80 Z"
            fill="#F5E4D0"
            opacity="0.85"
          />
        </g>
        
        {/* Mountain outlines (always visible) */}
        <path
          d="M 10 80 L 30 30 L 50 80"
          fill="none"
          stroke="#F5E4D0"
          strokeWidth="2"
          opacity="0.3"
        />
        <path
          d="M 35 80 L 50 15 L 65 80"
          fill="none"
          stroke="#F5E4D0"
          strokeWidth="2"
          opacity="0.3"
        />
        <path
          d="M 50 80 L 70 40 L 90 80"
          fill="none"
          stroke="#F5E4D0"
          strokeWidth="2"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}
