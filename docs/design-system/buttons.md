# Button Components

## Button Variants

### Primary Button

**Use for**: Main call-to-action, primary actions in a flow

**Default State**

- Background: Brand 0 (`#23D57C`)
- Text: Black (`#000000`)
- Border: None
- Font: TT Interphases Pro Mono, 16px

**Hover State**

- Background: Brand 1 (`#16B063`)
- Text: Black (`#000000`)

**Disabled State**

- Background: N/A
- Text: Dark 2 (`#4F4E4A`)
- Cursor: not-allowed

### Secondary Button

**Use for**: Secondary actions, alternative options

**Default State**

- Background: Transparent
- Text: Black (`#000000`)
- Border: 1px solid Black (`#000000`)
- Font: TT Interphases Pro Mono, 16px

**Hover State**

- Background: Gray 3 (`#F5F5F5`)
- Text: Black (`#000000`)
- Border: 1px solid Black (`#000000`)

**Disabled State**

- Background: Transparent
- Text: Dark 3 (`#9E9C98`)
- Border: 1px solid Dark 3 (`#9E9C98`)

### Tertiary Button

**Use for**: Low-emphasis actions, tertiary options

**Default State**

- Background: Transparent
- Text: Black (`#000000`)
- Border: None
- Text decoration: Underline
- Font: TT Interphases Pro Mono, 16px

**Hover State**

- Background: Transparent
- Text: Black (`#000000`)
- Text decoration: Underline

**Disabled State**

- Background: Transparent
- Text: Dark 3 (`#9E9C98`)
- Text decoration: Underline

## Button Sizes

### Size S (Small)

- Height: 32px
- Padding: 8px horizontal
- Font size: 14px
- Icon size: 16px

### Size M (Medium)

- Height: 40px
- Padding: 16px horizontal
- Font size: 16px
- Icon size: 24px

## Icon-Only Buttons

Icon-only buttons come in the same three variants (Primary, Secondary, Tertiary) and two sizes (S, M).

**Dimensions**

- S: 24px × 24px
- M: 32px × 32px

## Button Implementation

### React Component Example

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 's' | 'm'
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function Button({
  variant = 'primary',
  size = 's',
  disabled = false,
  children,
  onClick,
  className,
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-mono transition-colors'

  const variantStyles = {
    primary: disabled
      ? 'bg-transparent text-[#4F4E4A]'
      : 'bg-[#23D57C] text-black hover:bg-[#16B063]',
    secondary: disabled
      ? 'bg-transparent text-[#9E9C98] border border-[#9E9C98]'
      : 'bg-transparent text-black border border-black hover:bg-[#F5F5F5]',
    tertiary: disabled ? 'text-[#9E9C98] underline' : 'text-black underline hover:bg-transparent',
  }

  const sizeStyles = {
    s: 'h-8 px-4 text-sm',
    m: 'h-10 px-4 text-base',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### Tailwind Classes

#### Primary - Size S

```html
<button class="h-8 rounded bg-[#23D57C] px-4 font-mono text-sm text-black hover:bg-[#16B063]">
  Button
</button>
```

#### Primary - Size M

```html
<button class="h-10 rounded bg-[#23D57C] px-4 font-mono text-base text-black hover:bg-[#16B063]">
  Button
</button>
```

#### Secondary - Size S

```html
<button
  class="h-8 rounded border border-black px-4 font-mono text-sm text-black hover:bg-[#F5F5F5]"
>
  Button
</button>
```

#### Tertiary - Size S

```html
<button class="h-8 px-4 font-mono text-sm text-black underline hover:bg-transparent">Button</button>
```

## Button States

### Loading State

Add a spinner icon and disable the button:

```tsx
<Button disabled>
  <LoaderIcon className="animate-spin" />
  Loading...
</Button>
```

### With Icons

```tsx
<Button>
  <ArrowRightIcon className="mr-2" />
  Continue
</Button>
```

### Icon Only

```tsx
<Button variant="primary" size="s">
  <SearchIcon />
</Button>
```

## Best Practices

1. **Use Primary** for the main action in a view
2. **Use Secondary** for alternative actions
3. **Use Tertiary** for low-emphasis actions or to reduce visual hierarchy
4. **Always provide visual feedback** for hover and focus states
5. **Disable buttons** when actions are not available
6. **Consider button placement** - primary actions should be most prominent
7. **Use concise labels** - 1-3 words maximum
8. **Maintain consistent sizing** within the same context
