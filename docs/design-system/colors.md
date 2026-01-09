# Color Palette

## Primary Colors

### Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Brand 0 / Mint** | `#23D57C` | Primary actions, links, brand elements |
| **Brand 1** | `#16B063` | Active states, darker mint variant |
| **Brand 2 / Light Mint** | `#CAF6E0` | Backgrounds, subtle highlights |

### Base Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Black / 01** | `#292827` | Primary text, headings |
| **Dark Gray / 02** | `#4F4E4A` | Secondary text, disabled states |
| **Medium Gray / 03** | `#9E9C98` | Tertiary text, dividers |
| **Light Gray / 04** | `#CBC9C4` | Borders, subtle lines |
| **Pale Gray / 05** | `#E7E6E2` | Background dividers |
| **White** | `#FFFFFF` | Primary backgrounds |

### Gray Scale

| Name | Hex | Usage |
|------|-----|-------|
| **Gray-1** | `#CBC9C4` | Borders, subtle dividers |
| **Gray-2** | `#E7E6E2` | Backgrounds, dividers |
| **Gray-3** | `#F5F5F5` | Light backgrounds, hover states |

### Dark Scale

| Name | Hex | Usage |
|------|-----|-------|
| **Dark-1** | `#292827` | Primary text |
| **Dark-2** | `#4F4E4A` | Secondary text, disabled |
| **Dark-3** | `#9E9C98` | Tertiary text, borders |

## Semantic Colors

### Success
- **Primary**: `#23D57C` (Brand 0)
- **Light**: `#CAF6E0` (Brand 2)
- **Dark**: `#16B063` (Brand 1)

## Color Implementation

### CSS Variables
```css
:root {
  /* Brand Colors */
  --color-brand-0: #23D57C;
  --color-brand-1: #16B063;
  --color-brand-2: #CAF6E0;

  /* Text Colors */
  --color-text-primary: #292827;
  --color-text-secondary: #4F4E4A;
  --color-text-tertiary: #9E9C98;

  /* Border Colors */
  --color-border-subtle: #CBC9C4;
  --color-border-default: #E7E6E2;

  /* Background Colors */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F5F5F5;
  --color-bg-tertiary: #CAF6E0;
}
```

### Tailwind Configuration
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          0: '#23D57C',
          1: '#16B063',
          2: '#CAF6E0',
        },
        dark: {
          1: '#292827',
          2: '#4F4E4A',
          3: '#9E9C98',
        },
        gray: {
          1: '#CBC9C4',
          2: '#E7E6E2',
          3: '#F5F5F5',
        },
      },
    },
  },
};
```

## Color Usage Guidelines

### Text Hierarchy
1. **Primary text** (`#292827`) - Headings, body text, important information
2. **Secondary text** (`#4F4E4A`) - Supporting text, descriptions
3. **Tertiary text** (`#9E9C98`) - Labels, metadata, less important content

### Interactive Elements
1. **Primary actions** - Brand 0 (`#23D57C`)
2. **Hover states** - Brand 1 (`#16B063`)
3. **Disabled states** - Dark 2 (`#4F4E4A`) or Dark 3 (`#9E9C98`)

### Backgrounds & Surfaces
1. **Primary background** - White (`#FFFFFF`)
2. **Secondary background** - Gray 3 (`#F5F5F5`)
3. **Accent background** - Brand 2 (`#CAF6E0`)

### Borders & Dividers
1. **Subtle borders** - Gray 1 (`#CBC9C4`)
2. **Default borders** - Gray 2 (`#E7E6E2`)
3. **Strong borders** - Dark 3 (`#9E9C98`)

## Accessibility

### Contrast Ratios
- Black on White: AAA compliant
- Brand 0 on White: AA compliant
- Dark Gray on White: AA compliant

### Best Practices
1. Ensure text contrast ratio of at least 4.5:1 for normal text
2. Ensure text contrast ratio of at least 3:1 for large text (18px+)
3. Use color alone to convey meaning - always include text labels or icons
4. Test color combinations with accessibility tools
