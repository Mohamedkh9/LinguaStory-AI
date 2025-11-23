
import React from 'react';

interface LogoProps {
  className?: string;
  inverted?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", inverted = false }) => {
  // Colors based on inverted state
  const bgFill = inverted ? "#FFFFFF" : "url(#logo_gradient)";
  const iconFill = inverted ? "#4F46E5" : "#FFFFFF";
  const cutoutFill = inverted ? "#FFFFFF" : "#4F46E5"; // Used for the 'cutout' effect inside the icon

  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        {!inverted && (
          <linearGradient id="logo_gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" /> {/* Indigo-500 */}
            <stop offset="1" stopColor="#4338CA" /> {/* Indigo-700 */}
          </linearGradient>
        )}
      </defs>

      {/* Background Container */}
      <rect width="100" height="100" rx="24" fill={bgFill} />
      
      {/* Main Icon: Speech Bubble */}
      <path 
        d="M24 48C24 33.6406 35.6406 22 50 22C64.3594 22 76 33.6406 76 48C76 54.2 73.8 59.9 70.1 64.4L74 78L60.4 74.1C57.3 76.5 53.8 78 50 78C35.6406 78 24 66.3594 24 48Z" 
        fill={iconFill} 
      />
      
      {/* Cutout: Play Symbol (Story) */}
      {/* We use the cutoutFill color (which matches the bg usually) to make it look transparent */}
      <path 
        d="M44 38V58L60 48L44 38Z" 
        fill={cutoutFill} 
        stroke={cutoutFill} 
        strokeWidth="3" 
        strokeLinejoin="round" 
        strokeLinecap="round"
      />
      
      {/* AI Accents: Floating Dots/Sparks outside the bubble but inside the container */}
      <circle cx="80" cy="30" r="3" fill={iconFill} opacity="0.8" />
      <circle cx="84" cy="40" r="2" fill={iconFill} opacity="0.6" />
      <circle cx="18" cy="70" r="2" fill={iconFill} opacity="0.6" />

    </svg>
  );
};

export default Logo;
