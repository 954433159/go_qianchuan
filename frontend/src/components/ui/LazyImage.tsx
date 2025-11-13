import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
  src: string
  alt: string
  placeholder?: string | React.ReactNode
  fallback?: string
  className?: string
  wrapperClassName?: string
  threshold?: number
  rootMargin?: string
  onLoad?: () => void
  onError?: () => void
  // 支持WebP格式
  preferWebP?: boolean
}

/**
 * LazyImage - 支持懒加载和WebP的图片组件
 * 
 * 功能：
 * - 懒加载：使用Intersection Observer API
 * - WebP支持：自动检测并使用WebP格式
 * - 占位图：加载前显示占位内容
 * - 错误处理：加载失败时显示fallback图片
 * - 渐进式加载：淡入动画效果
 */
export default function LazyImage({
  src,
  alt,
  placeholder,
  fallback = '/images/placeholder.png',
  className,
  wrapperClassName,
  threshold = 0.1,
  rootMargin = '50px',
  onLoad,
  onError,
  preferWebP = true,
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [error, setError] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>('')
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // 检查是否支持WebP
  const supportsWebP = useRef<boolean | null>(null)

  useEffect(() => {
    if (supportsWebP.current === null) {
      checkWebPSupport().then((supported) => {
        supportsWebP.current = supported
      })
    }
  }, [])

  // 检测WebP支持
  const checkWebPSupport = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const webP = new Image()
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2)
      }
      webP.src =
        'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }

  // 转换为WebP URL（如果支持）
  const getOptimizedSrc = (originalSrc: string): string => {
    if (!preferWebP || supportsWebP.current === false) {
      return originalSrc
    }

    // 如果URL已经是WebP，直接返回
    if (originalSrc.endsWith('.webp')) {
      return originalSrc
    }

    // 如果是支持的图片格式，尝试转换为WebP
    const imageExtensions = ['.jpg', '.jpeg', '.png']
    const hasImageExtension = imageExtensions.some((ext) =>
      originalSrc.toLowerCase().endsWith(ext)
    )

    if (hasImageExtension && supportsWebP.current === true) {
      // 这里可以根据实际CDN配置调整WebP转换逻辑
      // 例如：https://example.com/image.jpg?format=webp
      return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    }

    return originalSrc
  }

  // Intersection Observer设置
  useEffect(() => {
    if (!imgRef.current || isInView) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            if (observerRef.current && entry.target) {
              observerRef.current.unobserve(entry.target)
            }
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [threshold, rootMargin, isInView])

  // 当图片进入视口时加载
  useEffect(() => {
    if (isInView && src) {
      const optimizedSrc = getOptimizedSrc(src)
      setImageSrc(optimizedSrc)
    }
  }, [isInView, src])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    if (fallback) {
      setImageSrc(fallback)
    }
    onError?.()
  }

  return (
    <div className={cn('relative overflow-hidden bg-muted', wrapperClassName)}>
      {/* 占位图/骨架屏 */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          {typeof placeholder === 'string' ? (
            <img
              src={placeholder}
              alt="placeholder"
              className="w-full h-full object-cover"
            />
          ) : placeholder ? (
            placeholder
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-muted via-muted/50 to-muted animate-pulse" />
          )}
        </div>
      )}

      {/* 实际图片 */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy" // 原生懒加载作为备用方案
        {...props}
      />

      {/* 错误状态 */}
      {error && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <p className="text-sm">图片加载失败</p>
        </div>
      )}
    </div>
  )
}

/**
 * LazyBackgroundImage - 懒加载背景图片组件
 */
export function LazyBackgroundImage({
  src,
  alt,
  className,
  threshold = 0.1,
  rootMargin = '50px',
  children,
  ...props
}: LazyImageProps & { children?: React.ReactNode }) {
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!divRef.current || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(divRef.current)

    return () => observer.disconnect()
  }, [threshold, rootMargin, isInView])

  useEffect(() => {
    if (isInView && src) {
      const img = new Image()
      img.src = src
      img.onload = () => setIsLoaded(true)
    }
  }, [isInView, src])

  return (
    <div
      ref={divRef}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={isLoaded ? { backgroundImage: `url(${src})` } : undefined}
      role="img"
      aria-label={alt}
      {...props}
    >
      {children}
    </div>
  )
}
