import React from 'react';

export default function SmartBusLogo({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 120 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Advanced Metallic Dark Base */}
        <linearGradient id="cyberBase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B1B3D" />
          <stop offset="50%" stopColor="#06326E" />
          <stop offset="100%" stopColor="#031535" />
        </linearGradient>
        
        {/* Radiant Cyan Glow */}
        <linearGradient id="neonCyan" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="50%" stopColor="#00A8FF" />
          <stop offset="100%" stopColor="#005BFF" />
        </linearGradient>

        {/* Hyper-Emerald Signal */}
        <linearGradient id="neonEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFA3" />
          <stop offset="100%" stopColor="#02A36B" />
        </linearGradient>
        
        <filter id="hyperGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="innerGlow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
          <feFlood floodColor="#00F0FF" floodOpacity="0.5" result="glowColor"/>
          <feComposite in="glowColor" in2="blur" operator="in" result="glow"/>
          <feMerge>
            <feMergeNode in="glow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Orbit Rings / Radar Waves */}
      <circle cx="55" cy="45" r="40" fill="none" stroke="url(#cyberBase)" strokeWidth="1" strokeDasharray="4 6" opacity="0.6" />
      <circle cx="55" cy="45" r="30" fill="none" stroke="url(#neonCyan)" strokeWidth="0.5" strokeDasharray="1 3" opacity="0.4" />

      {/* Sweeping Tech Streams */}
      <path d="M 10 50 Q 30 20 60 10" fill="none" stroke="url(#neonCyan)" strokeWidth="3" filter="url(#hyperGlow)" opacity="0.7" strokeLinecap="round" />
      <path d="M 15 75 Q 40 90 70 80" fill="none" stroke="url(#neonEmerald)" strokeWidth="4" filter="url(#hyperGlow)" opacity="0.8" strokeLinecap="round" />
      
      {/* Dynamic Data Nodes on the Stream */}
      <circle cx="20" cy="38" r="2" fill="#00F0FF" filter="url(#hyperGlow)" />
      <circle cx="50" cy="84" r="2.5" fill="#00FFA3" filter="url(#hyperGlow)" />

      <g filter="url(#innerGlow)">
        {/* Core Bus Frame */}
        <path d="M 32 50 C 32 35, 55 28, 80 32 C 98 34, 110 45, 110 58 L 110 75 C 110 78, 105 80, 100 80 L 38 80 C 30 80, 32 68, 32 50 Z" fill="url(#cyberBase)" />
        
        {/* Aerodynamic Windshield & HUD Profile */}
        <path d="M 75 34 C 95 36, 105 45, 105 55 L 75 55 Z" fill="url(#neonCyan)" opacity="0.2" />
        <path d="M 80 40 Q 95 46 98 55" fill="none" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" />
        
        {/* Speed Streaks on Body */}
        <path d="M 45 42 L 65 42" fill="none" stroke="#00A8FF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <path d="M 40 48 L 70 48" fill="none" stroke="#00A8FF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

        {/* Tactical Ground Shadow Line */}
        <path d="M 28 85 L 112 85" stroke="#005BFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

        {/* Magnetic Hover Wheels */}
        <circle cx="55" cy="76" r="7" fill="#031535" stroke="url(#neonCyan)" strokeWidth="2" />
        <circle cx="55" cy="76" r="2" fill="#00F0FF" filter="url(#hyperGlow)" />
        
        <circle cx="90" cy="76" r="7" fill="#031535" stroke="url(#neonCyan)" strokeWidth="2" />
        <circle cx="90" cy="76" r="2" fill="#00F0FF" filter="url(#hyperGlow)" />
      </g>

      {/* Cyber Map Pin / Satellite Uplink */}
      <g filter="url(#hyperGlow)">
        <path d="M 50 0 C 35 0, 25 12, 25 24 C 25 38, 50 60, 50 60 C 50 60, 75 38, 75 24 C 75 12, 65 0, 50 0 Z" fill="url(#neonCyan)" opacity="0.9" />
        <path d="M 50 3 C 38 3, 30 13, 30 24 C 30 35, 50 51, 50 51 C 50 51, 70 35, 70 24 C 70 13, 62 3, 50 3 Z" fill="#031535" />
        {/* Pulsing Core inside Pin */}
        <circle cx="50" cy="22" r="6" fill="url(#neonEmerald)" />
        <circle cx="50" cy="22" r="2" fill="#ffffff" />
      </g>
    </svg>
  );
}
