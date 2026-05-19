/**
 * Lazy Loading HOC untuk deferring component rendering
 * Gunakan untuk sections yang tidak critical pada initial load
 */

'use client';

import { ComponentType, ReactNode, useState, useEffect, useRef } from 'react';

interface LazyLoadProps {
  children: ReactNode;
  placeholder?: ReactNode;
  threshold?: number;
}

/**
 * Component untuk lazy load children berdasarkan visibility (Intersection Observer)
 * Gunakan ini untuk section yang di-scroll ke bawah untuk menunda rendering
 */
export function LazyLoad({ 
  children, 
  placeholder = <div className="h-40 bg-gray-100 animate-pulse rounded" />,
  threshold = 0.1 
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Stop observing setelah visible
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [threshold]);

  return (
    <div ref={elementRef}>
      {isVisible ? children : placeholder}
    </div>
  );
}

/**
 * HOC untuk wrapping komponen dengan lazy loading
 * Gunakan seperti: const LazyComponent = withLazyLoad(HeavyComponent);
 */
export function withLazyLoad<P extends object>(
  Component: ComponentType<P>,
  placeholder?: ReactNode
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyLoad placeholder={placeholder}>
        <Component {...props} />
      </LazyLoad>
    );
  };
}

/**
 * Hook untuk detect jika element terlihat di viewport
 * Lebih simple dari Intersection Observer manual setup
 */
export function useInViewport(options?: IntersectionObserverInit) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [options]);

  return { elementRef, isVisible };
}
