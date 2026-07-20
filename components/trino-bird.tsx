import React from 'react';

interface TrinoBirdProps {
  variant?: 'default' | 'music' | 'cinema' | 'theatre';
  className?: string;
  size?: number;
}

export default function TrinoBird({ variant = 'default', className = '', size = 120 }: TrinoBirdProps) {
  // SVG drawing of a cute retro cartoon bird with big pie-eyes, backwards cap, and wings.
  // Using black outline with brand colors or clean retro white fills.
  return (
    <div 
      className={`relative inline-block select-none transition-transform duration-300 hover:scale-110 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(194,255,1,0.15)]"
      >
        {/* Shadow under the bird */}
        <ellipse cx="60" cy="110" rx="25" ry="4" fill="#000000" fillOpacity="0.4" />

        {/* Legs - retro cartoon thin legs with big boots */}
        <path d="M50 85L45 105" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        <path d="M70 85L75 105" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        
        {/* Big Retro Shoes */}
        {/* Left boot */}
        <path 
          d="M32 110C32 105 40 102 48 102C53 102 54 107 52 110C48 112 32 112 32 110Z" 
          fill="#1B1D21" 
          stroke="#ffffff" 
          strokeWidth="3.5" 
          strokeLinejoin="round" 
        />
        <line x1="38" y1="108" x2="48" y2="108" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        
        {/* Right boot */}
        <path 
          d="M68 110C68 107 69 102 74 102C82 102 90 105 90 110C90 112 74 112 68 110Z" 
          fill="#1B1D21" 
          stroke="#ffffff" 
          strokeWidth="3.5" 
          strokeLinejoin="round" 
        />
        <line x1="72" y1="108" x2="82" y2="108" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

        {/* Bird Body - Fat teardrop round shape */}
        <path 
          d="M60 30C82 30 94 48 94 65C94 82 78 88 60 88C42 88 26 82 26 65C26 48 38 30 60 30Z" 
          fill="#1B1D21" 
          stroke="#ffffff" 
          strokeWidth="4" 
          strokeLinejoin="round" 
        />

        {/* Retro Pie-Eyes */}
        {/* Left Eye */}
        <ellipse cx="48" cy="50" rx="7" ry="10" fill="#ffffff" stroke="#1B1D21" strokeWidth="1" />
        <path d="M48 45C49 45 52 48 51 52L46 52C45 48 47 45 48 45Z" fill="#1B1D21" />
        {/* Right Eye */}
        <ellipse cx="64" cy="50" rx="7" ry="10" fill="#ffffff" stroke="#1B1D21" strokeWidth="1" />
        <path d="M64 45C65 45 68 48 67 52L62 52C61 48 63 45 64 45Z" fill="#1B1D21" />

        {/* Cheerful Beak */}
        <path 
          d="M50 58C50 58 55 64 58 64C61 64 66 58 66 58" 
          fill="#FE4502" 
          stroke="#ffffff" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Left Wing & Right Wing */}
        {/* Default poses or specialized props */}
        {variant === 'default' && (
          <>
            {/* Left wing waving */}
            <path 
              d="M28 62C18 58 10 65 14 74C18 78 28 68 28 62Z" 
              fill="#1B1D21" 
              stroke="#ffffff" 
              strokeWidth="3.5" 
              strokeLinejoin="round" 
            />
            {/* Right wing on waist */}
            <path 
              d="M92 62C102 58 110 65 106 74C102 78 92 68 92 62Z" 
              fill="#1B1D21" 
              stroke="#ffffff" 
              strokeWidth="3.5" 
              strokeLinejoin="round" 
            />
          </>
        )}

        {variant === 'music' && (
          <>
            {/* Playing a tiny guitar (Ukelele) */}
            <path 
              d="M20 70C15 64 12 74 18 78C22 80 26 74 20 70Z" 
              fill="#1B1D21" 
              stroke="#ffffff" 
              strokeWidth="3.5" 
            />
            {/* Ukelele body */}
            <path 
              d="M40 76C40 70 52 68 56 74C60 80 44 86 40 76Z" 
              fill="#FE4502" 
              stroke="#ffffff" 
              strokeWidth="3" 
            />
            {/* Ukelele neck */}
            <rect x="24" y="66" width="22" height="4" transform="rotate(15 24 66)" fill="#DCB8FE" stroke="#ffffff" strokeWidth="2" />
            <path 
              d="M90 68C85 64 78 72 82 76C86 80 94 72 90 68Z" 
              fill="#1B1D21" 
              stroke="#ffffff" 
              strokeWidth="3.5" 
            />
          </>
        )}

        {variant === 'cinema' && (
          <>
            {/* Wings holding Popcorn Box */}
            <path 
              d="M32 72C36 74 44 74 46 70" 
              stroke="#ffffff" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />
            <path 
              d="M88 72C84 74 76 74 74 70" 
              stroke="#ffffff" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />
            {/* Popcorn container (striped red/white box) */}
            <path 
              d="M48 68L52 88H68L72 68H48Z" 
              fill="#FE4502" 
              stroke="#ffffff" 
              strokeWidth="3" 
              strokeLinejoin="round" 
            />
            {/* White stripes on box */}
            <line x1="54" y1="68" x2="56" y2="88" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="60" y1="68" x2="60" y2="88" stroke="#ffffff" strokeWidth="2.5" />
            <line x1="66" y1="68" x2="64" y2="88" stroke="#ffffff" strokeWidth="2.5" />
            {/* Yellow popcorn bubbles */}
            <circle cx="52" cy="65" r="4" fill="#C2FF01" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="58" cy="63" r="5" fill="#C2FF01" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="64" cy="64" r="4" fill="#C2FF01" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="60" cy="66" r="3.5" fill="#C2FF01" stroke="#ffffff" strokeWidth="1.5" />
          </>
        )}

        {variant === 'theatre' && (
          <>
            {/* Wing holding a skull (Hamlet pose) */}
            <path 
              d="M32 72C25 76 18 70 24 64" 
              stroke="#ffffff" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />
            {/* Right wing outstretched holding skull */}
            <path 
              d="M84 66C88 64 96 60 98 64C100 68 94 72 88 72" 
              stroke="#ffffff" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
            />
            {/* Tiny Skull */}
            <circle cx="98" cy="56" r="6.5" fill="#ffffff" stroke="#1B1D21" strokeWidth="2" />
            <rect x="94.5" y="60.5" width="7" height="4" rx="1" fill="#ffffff" stroke="#1B1D21" strokeWidth="1.5" />
            {/* Skull eye holes */}
            <circle cx="96" cy="55" r="1.5" fill="#1B1D21" />
            <circle cx="100" cy="55" r="1.5" fill="#1B1D21" />
          </>
        )}

        {/* Backwards Cap (Gorra) - Radiant Lime color #C2FF01 */}
        {/* Cap visor pointing left/backwards */}
        <path 
          d="M30 32C22 35 20 40 28 41C38 42 42 36 40 32Z" 
          fill="#C2FF01" 
          stroke="#ffffff" 
          strokeWidth="3.5" 
          strokeLinejoin="round" 
        />
        {/* Cap dome */}
        <path 
          d="M38 33C38 22 52 14 68 14C82 14 90 22 90 33C80 34 50 34 38 33Z" 
          fill="#C2FF01" 
          stroke="#ffffff" 
          strokeWidth="3.5" 
          strokeLinejoin="round" 
        />
        {/* Small cap button on top */}
        <circle cx="64" cy="14" r="3.5" fill="#ffffff" stroke="#1B1D21" strokeWidth="1.5" />
        
        {/* Music Notes Floating around */}
        <path d="M102 30C102 26 108 26 108 28C108 30 102 30 102 32C102 34 100 34 100 32C100 30 102 30 102 30Z" fill="#DCB8FE" />
        <circle cx="100" cy="34" r="2" fill="#DCB8FE" />
        
        <path d="M14 45C14 42 18 42 18 43.5C18 45 14 45 14 46.5C14 48 12.5 48 12.5 46.5C12.5 45 14 45 14 45Z" fill="#00BBFC" />
        <circle cx="12.5" cy="48" r="1.5" fill="#00BBFC" />
      </svg>
    </div>
  );
}
