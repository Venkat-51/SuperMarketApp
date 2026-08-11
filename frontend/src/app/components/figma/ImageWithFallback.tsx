import React, { useState } from 'react'

const FALLBACK_GROCERY_IMG =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [currentSrc, setCurrentSrc] = useState<string>(props.src || FALLBACK_GROCERY_IMG)
  const [hasFailed, setHasFailed] = useState(false)

  const handleError = () => {
    if (!hasFailed) {
      setHasFailed(true)
      setCurrentSrc(FALLBACK_GROCERY_IMG)
    }
  }

  const { src, alt, style, className, ...rest } = props

  return (
    <img
      src={currentSrc}
      alt={alt || 'Product Image'}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  )
}

