import { createElement, type ReactNode } from 'react'

// @luwio/ui — headless UI helpers and components for React.
// Skeleton: starts with a couple of building blocks and will grow.

export type ClassValue = string | number | false | null | undefined

/** Join truthy class names into a single space-separated string. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}

/**
 * Hide content visually while keeping it available to assistive technology.
 */
export function VisuallyHidden({ children }: { children: ReactNode }): ReactNode {
  return createElement(
    'span',
    {
      style: {
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
        border: 0,
      },
    },
    children,
  )
}
