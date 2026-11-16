import React from 'react';

interface GoogleIconProps {
  name: string;
  className?: string;
  size?: number;
  filled?: boolean;
}

/**
 * Componente oficial para renderizar Material Symbols de Google Fonts.
 * Totalmente integrado con la tipografía Google Sans y el sistema de diseño Warmi.
 */
export function GoogleIcon({
  name,
  className = '',
  size,
  filled = false,
}: GoogleIconProps) {
  return (
    <span
      className={`material-symbols-outlined shrink-0 ${className}`}
      style={{
        fontVariationSettings: filled
          ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        fontSize: size ? `${size}px` : undefined,
        width: size ? `${size}px` : undefined,
        height: size ? `${size}px` : undefined,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
