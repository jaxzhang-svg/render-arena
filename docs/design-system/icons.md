# Icon System

## Icon Library

**Primary Icon Set**: [Phosphor Icons](https://phosphoricons.com/)

Phosphor Icons provides a consistent, clean icon style that matches the Novita design aesthetic.

## Icon Styles

Phosphor Icons offers three weights:
- **Regular** - Primary choice for most UI elements
- **Light** - For more delicate icons
- **Bold** - For emphasis (use sparingly)

## Common Icons

Based on the Figma designs, these icons are commonly used:

### Navigation
- `chevron-down` / `chevron-up` - Dropdown indicators
- `caret-down` / `caret-up` - Alternative dropdown indicators
- `list` - Menu/hamburger icon

### Actions
- `arrow-right` - Forward navigation, CTAs
- `arrow-left` - Back navigation
- `x` / `close` - Close modals, dismiss
- `plus` - Add new items
- `minus` - Remove items

### Status
- `check-circle` - Success states
- `warning-circle` - Warnings
- `info` - Information
- `alert-circle` - Errors

### Media
- `play` - Play media
- `pause` - Pause media
- `stop` - Stop media

## Icon Sizes

| Size | Usage | Dimensions |
|------|-------|------------|
| **XS** | Small icons within text | 12px |
| **S** | Buttons, small UI elements | 16px |
| **M** | Standard UI elements | 24px |
| **L** | Large displays, hero sections | 32px |
| **XL** | Extra large displays | 48px |

## Icon Colors

Icons inherit text color by default. Specific color usage:

| Context | Color | Hex |
|---------|-------|-----|
| **Default** | Black | `#000000` |
| **Hover** | Black | `#000000` |
| **Active** | Brand 1 | `#16B063` |
| **Disabled** | Dark 3 | `#9E9C98` |
| **Inverse** | White | `#FFFFFF` |

## Icon Implementation

### Using Phosphor Icons with React

**Installation**:
```bash
npm install @phosphor-icons/react
```

**Import**:
```tsx
import {
  CaretDown,
  CaretUp,
  ArrowRight,
  ArrowLeft,
  X,
  List,
} from '@phosphor-icons/react';
```

**Usage**:
```tsx
// Basic icon
<CaretDown size={24} color="#000000" />

// In a button
<button>
  <ArrowRight size={24} className="mr-2" />
  Continue
</button>

// With custom styling
<CaretUp
  size={24}
  weight="regular"
  className="text-[#16B063]"
/>
```

### Icon Component Wrapper

Create a consistent icon component:

```tsx
import { PhosphorIcon, IconProps } from '@phosphor-icons/react';

interface IconProps {
  icon: PhosphorIcon;
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  color?: string;
  className?: string;
}

const sizeMap = {
  xs: 12,
  s: 16,
  m: 24,
  l: 32,
  xl: 48,
};

export function Icon({
  icon: IconComponent,
  size = 'm',
  color = '#000000',
  className,
}: IconProps) {
  return (
    <IconComponent
      size={sizeMap[size]}
      color={color}
      weight="regular"
      className={className}
    />
  );
}
```

## Icon Best Practices

### 1. Maintain Consistency
Use the same icon style (Regular weight) throughout the interface unless there's a specific reason to vary.

### 2. Provide Context
Always use icons with text labels unless the icon's meaning is universally understood (e.g., search, close, menu).

### 3. Consider Scale
Choose icon sizes appropriate to their context:
- **16px** for buttons and small UI elements
- **24px** for standard icons
- **32px+** for feature icons and illustrations

### 4. Accessibility
- Always include `aria-label` for icon-only buttons
- Use meaningful alt text
- Ensure sufficient color contrast
- Don't rely on color alone to convey meaning

### 5. Performance
- Use tree-shaking to import only needed icons
- Consider SVG sprites for frequently used icons
- Optimize icon file sizes

## Icon-Only Button

When using icons as buttons, ensure proper accessibility:

```tsx
<button
  aria-label="Close"
  className="p-2 hover:bg-gray-100 rounded"
>
  <X size={24} />
</button>
```

## Loading Icons

For loading states, use an animated icon:

```tsx
import { Spinner } from '@phosphor-icons/react';

<Spinner size={24} className="animate-spin" />
```

## Custom Icons

For brand-specific icons not available in Phosphor:
1. Create custom SVG icons
2. Follow the same visual style as Phosphor Icons
3. Use consistent stroke width (2px for regular weight)
4. Maintain 24px × 24px viewbox
5. Store in `public/icons` directory

## Resources

- [Phosphor Icons Library](https://phosphoricons.com/)
- [Phosphor Icons React Documentation](https://phosphoricons.com/docs/react)
- [Icon Best Practices](https://www.nngroup.com/articles/icon-usability/)
