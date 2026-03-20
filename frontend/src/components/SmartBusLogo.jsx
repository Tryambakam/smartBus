import React from 'react';

export default function SmartBusLogo({ className = "w-10 h-10" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Wi-Fi Waves */}
      <path d="M40 30 Q50 20 60 30" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
      <path d="M35 23 Q50 10 65 23" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M45 37 A 5 5 0 0 1 55 37" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
      
      {/* Green Swoosh */}
      <path d="M15 75 Q 50 85 85 75 C 85 75, 70 82, 50 82 C 30 82, 15 75, 15 75 Z" fill="#10b981" />
      
      {/* Bus Body */}
      <path d="M22 55 C 22 42, 30 38, 50 38 L 73 40 C 82 42, 82 55, 78 65 L 26 65 C 22 65, 22 60, 22 55 Z" fill="#2563eb" />
      
      {/* Bus Windows */}
      <rect x="25" y="44" width="10" height="8" rx="2" fill="#bfdbfe" />
      <rect x="38" y="44" width="15" height="8" rx="2" fill="#bfdbfe" />
      <rect x="56" y="42" width="18" height="15" rx="3" fill="#ffffff" />
      
      {/* Wheels */}
      <circle cx="32" cy="65" r="4.5" fill="#f8fafc" stroke="#1e3a8a" strokeWidth="2.5" />
      <circle cx="68" cy="65" r="4.5" fill="#f8fafc" stroke="#1e3a8a" strokeWidth="2.5" />
      
      {/* Map Pin Overlaid */}
      <path d="M50 25 C 43 25, 38 31, 38 39 C 38 48, 50 60, 50 60 C 50 60, 62 48, 62 39 C 62 31, 57 25, 50 25 Z" fill="#1d4ed8" stroke="#ffffff" strokeWidth="1.5" />
      <circle cx="50" cy="37" r="4.5" fill="#ffffff" />
      <circle cx="50" cy="37" r="2.5" fill="#1d4ed8" />
    </svg>
  );
}
