import React from 'react'
import CoLaunchLogo from './CoLaunchLogo'

export default function WingLogo({
  size = 22,
  className = '',
  showText = false,
  showWordmark = false,
  color = null,
  theme = 'dark',
}) {
  return (
    <CoLaunchLogo
      size={size}
      className={className}
      showText={showText}
      showWordmark={showWordmark}
      color={color}
      theme={theme}
    />
  )
}
