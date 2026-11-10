import React from 'react'

/**
 * CoLaunch 4-Square Brand Logo
 * Matches the official CoLaunch logo shown in Blueprint and onboarding navigation:
 * A 2x2 grid with red, emerald green, amber yellow, and purple rounded squares,
 * paired with the bold clean "CoLaunch" wordmark.
 */
export default function CoLaunchLogo({
  size = 20,
  className = '',
  showText = true,
  showWordmark = undefined,
  theme = 'dark',
  href = null,
  onClick = null,
  color = null,
}) {
  const isLight = theme === 'light'
  const displayWordmark = showWordmark !== undefined ? showWordmark : showText

  // Scaled dimensions
  const primaryColor = color || '#c81e3c'
  const boxDimension = Math.max(16, size)
  const squareDimension = Math.max(5, Math.round(boxDimension * 0.36))
  const gapSize = Math.max(2, Math.round(boxDimension * 0.16))
  const fontSize = Math.max(13, Math.round(size * 0.72))

  const logoNode = (
    <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
      {/* 4-Square Colored Brand Mark */}
      <div
        className="grid grid-cols-2 shrink-0 items-center justify-center"
        style={{
          width: `${boxDimension}px`,
          height: `${boxDimension}px`,
          gap: `${gapSize}px`,
        }}
        aria-hidden="true"
      >
        <span
          className="rounded-[2px] transition-colors"
          style={{
            background: primaryColor,
            width: `${squareDimension}px`,
            height: `${squareDimension}px`,
          }}
        />
        <span
          className="rounded-[2px] bg-emerald-400"
          style={{
            width: `${squareDimension}px`,
            height: `${squareDimension}px`,
          }}
        />
        <span
          className="rounded-[2px] bg-amber-400"
          style={{
            width: `${squareDimension}px`,
            height: `${squareDimension}px`,
          }}
        />
        <span
          className="rounded-[2px] bg-purple-400"
          style={{
            width: `${squareDimension}px`,
            height: `${squareDimension}px`,
          }}
        />
      </div>

      {/* Brand Wordmark */}
      {displayWordmark && (
        <span
          className={`font-bold tracking-tight whitespace-nowrap leading-none transition-colors ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
          style={{ fontSize: `${fontSize}px` }}
        >
          CoLaunch
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className="inline-flex items-center text-inherit no-underline hover:opacity-85 transition-opacity cursor-pointer"
        title="Visit co-launch.app"
      >
        {logoNode}
      </a>
    )
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center text-inherit no-underline hover:opacity-85 transition-opacity cursor-pointer bg-transparent border-0 p-0 m-0"
      >
        {logoNode}
      </button>
    )
  }

  return logoNode
}

export { CoLaunchLogo as CreatorForgeLogo, CoLaunchLogo }
