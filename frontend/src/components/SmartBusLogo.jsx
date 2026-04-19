import React from 'react';

export default function SmartBusLogo({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 120 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="darkBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#054A7A" />
          <stop offset="100%" stopColor="#022E4D" />
        </linearGradient>
        <linearGradient id="cyanArc" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00C4DF" />
          <stop offset="100%" stopColor="#008CC4" />
        </linearGradient>
        <linearGradient id="midBlue" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#006DAA" />
          <stop offset="100%" stopColor="#008BCF" />
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
      </defs>

      <g filter="url(#shadow)">
        {/* Outer Dark Blue Swoosh */}
        <path d="M 60 85 C 20 85, -5 50, 15 25 C 25 15, 40 10, 50 15" fill="none" stroke="url(#darkBg)" strokeWidth="9" strokeLinecap="round" />
        
        {/* Middle Cyan Swoosh */}
        <path d="M 50 78 C 25 78, 5 45, 20 25 C 25 18, 35 15, 42 16" fill="none" stroke="url(#cyanArc)" strokeWidth="8" strokeLinecap="round" />
        
        {/* Inner Light Swoosh */}
        <path d="M 45 68 C 30 68, 18 45, 30 30 C 35 25, 42 22, 48 24" fill="none" stroke="url(#midBlue)" strokeWidth="7" strokeLinecap="round" />

        {/* Bus Body */}
        <path d="M 35 55 
                 C 35 35, 60 30, 80 32 
                 C 95 34, 105 45, 105 55 
                 L 105 73 
                 C 105 76, 100 78, 95 78 
                 L 40 78 
                 C 30 78, 35 65, 35 55 Z" 
              fill="url(#midBlue)" />
              
        {/* Bus Front Curve details */}
        <path d="M 80 40 Q 95 45 98 52" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

        {/* Windows */}
        <path d="M 68 35 L 80 37 C 88 38, 92 42, 92 48 L 68 48 Z" fill="#EBF6FF" />
        <path d="M 55 34 L 64 34 L 64 48 L 55 48 Z" fill="#EBF6FF" />
        <path d="M 45 33 L 51 34 L 51 48 L 45 48 C 45 40, 45 33, 45 33 Z" fill="#EBF6FF" />

        {/* Rearview mirror dash */}
        <rect x="94" y="42" width="2" height="6" rx="1" fill="#022E4D" />

        {/* Base Shadow / Ground Line offset */}
        <path d="M 45 83 L 105 83" stroke="#054A7A" strokeWidth="2" strokeLinecap="round" />

        {/* Wheels */}
        <circle cx="55" cy="74" r="7.5" fill="white" />
        <circle cx="55" cy="74" r="5" fill="#022E4D" />
        
        <circle cx="85" cy="74" r="7.5" fill="white" />
        <circle cx="85" cy="74" r="5" fill="#022E4D" />

        {/* The Mega Location Pin intersecting the swooshes */}
        <path d="M 55 0 
                 C 40 0, 30 15, 30 25 
                 C 30 40, 55 60, 55 60 
                 C 55 60, 80 40, 80 25 
                 C 80 15, 70 0, 55 0 Z" 
              fill="url(#midBlue)" />
        
        {/* Inner shadow/accent on Pin */}
        <path d="M 55 0 C 40 0, 30 15, 30 25 C 30 40, 55 60, 55 60 L 55 0 Z" fill="#054A7A" opacity="0.3" />

        <circle cx="55" cy="22" r="8" fill="white" />
      </g>
    </svg>
  );
}
