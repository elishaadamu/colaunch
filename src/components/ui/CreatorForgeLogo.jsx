export default function CoLaunchLogo({ size = 22, className = '', showText = true, showWordmark = undefined, theme = 'dark' }) {
  const isLight = theme === 'light'
  const displayWordmark = showWordmark !== undefined ? showWordmark : showText
  const fontSize = Math.max(13, Math.round(size * 0.68))

  return (
    <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
      {/* CoLaunch Rocket Badge */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        style={{ filter: isLight ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.06))' : 'none' }}
      >
        {/* White circular disc badge */}
        <circle cx="50" cy="50" r="48" fill="#FFFFFF" />
        {isLight && <circle cx="50" cy="50" r="47.5" stroke="#CBD5E1" strokeWidth="1" />}

        {/* Rocket Icon */}
        <g transform="translate(19.5, 19.5) scale(1.7)">
          <path fill="#A0041E" d="M1 17l8-7 16 1 1 16-7 8s.001-5.999-6-12-12-6-12-6z" />
          <path fill="#FFAC33" d="M.973 35s-.036-7.979 2.985-11S15 21.187 15 21.187 14.999 29 11.999 32c-3 3-11.026 3-11.026 3z" />
          <circle fill="#FFCC4D" cx="8.999" cy="27" r="4" />
          <path fill="#55ACEE" d="M35.999 0s-10 0-22 10c-6 5-6 14-4 16s11 2 16-4c10-12 10-22 10-22z" />
          <path fill="#292F33" d="M26.999 5c-1.623 0-3.013.971-3.641 2.36.502-.227 1.055-.36 1.641-.36 2.209 0 4 1.791 4 4 0 .586-.133 1.139-.359 1.64 1.389-.627 2.359-2.017 2.359-3.64 0-2.209-1.791-4-4-4z" />
          <path fill="#A0041E" d="M8 28s0-4 1-5 13.001-10.999 14-10-9.001 13-10.001 14S8 28 8 28z" />
        </g>
      </svg>

      {displayWordmark && (
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, Cambria, 'Times New Roman', serif",
            fontSize: `${fontSize}px`,
            letterSpacing: '-0.015em',
            lineHeight: 1,
          }}
          className={`font-semibold tracking-tight whitespace-nowrap ${
            isLight ? 'text-[#0F172A]' : 'text-white'
          }`}
        >
          CoLaunch
        </span>
      )}
    </div>
  )
}

export { CoLaunchLogo as CreatorForgeLogo, CoLaunchLogo }
