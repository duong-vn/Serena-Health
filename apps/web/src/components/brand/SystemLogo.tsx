type SystemLogoProps = {
  className?: string
}

export function SystemLogo({ className = 'system-logo' }: SystemLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Serene Health Logo"
    >
      <defs>
        <linearGradient id="shLogoLeaf1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3D5A47" />
          <stop offset="100%" stopColor="#24382B" />
        </linearGradient>
        <linearGradient id="shLogoLeaf2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8EAA95" />
          <stop offset="100%" stopColor="#5E7866" />
        </linearGradient>
      </defs>
      {/* 4 organic healing petals meeting at center */}
      <path
        d="M16 3 C20 3 23.5 7 23.5 11 C23.5 15 19.5 19 16 21.5 C12.5 19 8.5 15 8.5 11 C8.5 7 12 3 16 3 Z"
        fill="url(#shLogoLeaf1)"
      />
      <path
        d="M16 29 C12 29 8.5 25 8.5 21 C8.5 17 12.5 13 16 10.5 C19.5 13 23.5 17 23.5 21 C23.5 25 20 29 16 29 Z"
        fill="url(#shLogoLeaf2)"
      />
      <path
        d="M3 16 C3 12 7 8.5 11 8.5 C15 8.5 19 12.5 21.5 16 C19 19.5 15 23.5 11 23.5 C7 23.5 3 20 3 16 Z"
        fill="url(#shLogoLeaf2)"
        opacity="0.9"
      />
      <path
        d="M29 16 C29 20 25 23.5 21 23.5 C17 23.5 13 19.5 10.5 16 C13 12.5 17 8.5 21 8.5 C25 8.5 29 12 29 16 Z"
        fill="url(#shLogoLeaf1)"
        opacity="0.95"
      />
      {/* Inner gentle pulse core */}
      <circle cx="16" cy="16" r="3.2" fill="#FAF7F0" />
      <circle cx="16" cy="16" r="1.6" fill="#2F4838" />
    </svg>
  )
}
