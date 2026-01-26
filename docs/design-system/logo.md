# Logo & Branding

## Logo Overview

The Novita logo consists of two components:

1. **Icon/Mark** - The graphical symbol
2. **Logotype/Wordmark** - The brand name in text

## Logo Specifications

### Logo Icon

- **Format**: SVG
- **Dimensions**: Various sizes available
- **Primary color**: Brand 0 (`#23D57C`)
- **Style**: Clean, minimalist geometric design

### Logo Usage

The logo appears in multiple sizes in the design system:

- **Large**: ~116px height
- **Medium**: ~58px height
- **Small**: ~29px height
- **XSmall**: ~14px height

### Logo File Locations

Based on the Figma assets, logo files are referenced as image assets that should be downloaded to the project.

## Logo Clear Space

Maintain clear space around the logo equal to the height of the "O" in the logotype.

## Logo Placement

### Primary Navigation

- **Position**: Left-aligned
- **Size**: 24px height for icon
- **Background**: White
- **Padding**: 6px gap between icon and wordmark

### Page Header

- **Position**: Left-aligned or center-aligned
- **Size**: Medium or large
- **Background**: White or light gray

### Footer

- **Position**: Left-aligned
- **Size**: Small
- **Background**: Dark or light depending on theme

## Logo Color Variations

### Primary (Recommended)

- **Icon**: Brand 0 (`#23D57C`)
- **Text**: Black (`#292827`)
- **Background**: White (`#FFFFFF`)

### Inverted

- **Icon**: White (`#FFFFFF`)
- **Text**: White (`#FFFFFF`)
- **Background**: Brand 0 (`#23D57C`) or dark

### Monochrome

- **Icon**: Black (`#292827`)
- **Text**: Black (`#292827`)
- **Background**: White (`#FFFFFF`)

## Logo Don'ts

❌ **Don't** stretch or distort the logo
❌ **Don't** change the logo proportions
❌ **Don't** add drop shadows or effects
❌ **Don't** place the logo on busy backgrounds
❌ **Don't** use the logo in colors other than specified
❌ **Don't** rearrange the logo elements
❌ **Don't** modify the logo spacing

## Logo Implementation

### React Component

```tsx
import Image from 'next/image'

interface LogoProps {
  variant?: 'full' | 'icon' | 'wordmark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ variant = 'full', size = 'md', className }: LogoProps) {
  const sizeMap = {
    sm: { height: 32, width: 'auto' },
    md: { height: 48, width: 'auto' },
    lg: { height: 64, width: 'auto' },
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {variant !== 'wordmark' && (
        <Image
          src="/logo-icon.svg"
          alt="Novita"
          height={sizeMap[size].height}
          width={sizeMap[size].height}
        />
      )}
      {variant !== 'icon' && (
        <Image src="/logo-wordmark.svg" alt="Novita" height={sizeMap[size].height} width="auto" />
      )}
    </div>
  )
}
```

### Next.js Image Component

Using Next.js Image for optimization:

```tsx
import Image from 'next/image';

// Logo with icon and wordmark
<Image
  src="/logo-full.svg"
  alt="Novita"
  width={120}
  height={24}
  priority
/>

// Icon only
<Image
  src="/logo-icon.svg"
  alt="Novita"
  width={24}
  height={24}
  priority
/>
```

## Logo Assets

After downloading from Figma, organize logo assets in the project:

```
public/
├── logo/
│   ├── logo-full.svg         # Complete logo (icon + wordmark)
│   ├── logo-icon.svg         # Icon only
│   ├── logo-wordmark.svg     # Wordmark only
│   ├── logo-full-light.svg   # For light backgrounds
│   └── logo-full-dark.svg    # For dark backgrounds
```

## Favicon

Create favicon variations from the logo icon:

- `favicon.ico` - 32x32
- `favicon-16x16.png` - 16x16
- `favicon-32x32.png` - 32x32
- `apple-touch-icon.png` - 180x180

## Brand Colors

See [Colors](./colors.md) for complete brand color specifications.

### Primary Brand Colors

- **Brand 0 (Mint)**: `#23D57C` - Primary brand color
- **Brand 1 (Dark Mint)**: `#16B063` - Hover/active states
- **Brand 2 (Light Mint)**: `#CAF6E0` - Background accents

## Typography

The brand uses **TT Interphases Pro** as its primary typeface.

See [Typography](./typography.md) for complete specifications.

## Voice & Tone

The Novita brand voice is:

- **Clear**: Simple, direct communication
- **Professional**: Expert but approachable
- **Modern**: Contemporary and forward-thinking
- **Helpful**: Focused on solving user problems

## Additional Resources

- Figma File: Novita-web-UI-Kit--（外部）--Copy-
- File Key: `HVn4WeYOBTpjE6Qvu8zgfL`
