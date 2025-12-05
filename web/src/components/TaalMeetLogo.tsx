interface TaalMeetLogoProps {
  size?: number;
  className?: string;
}

export function TaalMeetLogo({ size = 96, className = '' }: TaalMeetLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rounded Square Background */}
      <rect
        x="5"
        y="5"
        width="90"
        height="90"
        rx="20"
        fill="url(#logoGradient)"
      />
      
      {/* Double Speech Bubble Icon */}
      <g>
        {/* Main speech bubble shape */}
        <rect
          x="25"
          y="30"
          width="50"
          height="30"
          rx="15"
          fill="white"
        />
        
        {/* Speech bubble tail */}
        <path
          d="M45 60 L40 70 L50 60 Z"
          fill="white"
        />
      </g>
      
      <defs>
        <linearGradient
          id="logoGradient"
          x1="5"
          y1="5"
          x2="95"
          y2="95"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4DB8B8" />
          <stop offset="100%" stopColor="#2D9B9B" />
        </linearGradient>
      </defs>
    </svg>
  );
}
