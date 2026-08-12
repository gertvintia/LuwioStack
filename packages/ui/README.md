# @luwio/ui

Headless UI helpers and components for React.

Part of [LuwioStack](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

> **Status: skeleton.** Starts with a couple of primitives; the component set will grow.

## Install

```bash
npm install @luwio/ui
```

React 18+ is a peer dependency.

## Usage

```tsx
import { cn, VisuallyHidden } from '@luwio/ui'

function Button({ active }: { active: boolean }) {
  return (
    <button className={cn('btn', active && 'btn--active')}>
      Save
      <VisuallyHidden> (saves your changes)</VisuallyHidden>
    </button>
  )
}
```

## API

- `cn(...classes)` — join truthy class names
- `<VisuallyHidden>` — hide content visually but keep it for screen readers
