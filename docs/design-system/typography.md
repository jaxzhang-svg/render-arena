# Typography System

## ⚠️ Font Usage Rules

**IMPORTANT: Only use Tailwind font utilities in code**
- **Use `font-sans`** for all regular text (maps to TT Interphases Pro)
- **Use `font-mono`** for code and technical text (maps to TT Interphases Pro Mono)
- **DO NOT use** `font-['TT_Interphases_Pro']` or any explicit font family names
- **DO NOT use** `font-['Inter']` or other font family strings

The font families are configured in `tailwind.config.ts`:
```typescript
fontFamily: {
  sans: ['var(--font-interphases)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-interphases-mono)', 'monospace'],
}
```

## Font Families

### Primary Font: TT Interphases Pro (font-sans)
- **Weights Available**: Regular (400), Medium (500), DemiBold (600)
- **Usage**: Headings, body text, UI elements
- **Tailwind Class**: `font-sans`

### Secondary Font: TT Interphases Pro Mono (font-mono)
- **Weight Available**: Regular (400)
- **Usage**: Code, captions, labels, technical text
- **Tailwind Class**: `font-mono`

### Tertiary Font: TT Interfaces
- **Weight Available**: Regular (400)
- **Usage**: Secondary body text

## Typography Scale

### Headings

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| **H1 / Hero** | 80px | DemiBold (600) | 74px | -1.6px | Main page titles, hero sections |
| **H2** | 56px | DemiBold (600) | 56px | -1.12px | Section titles, major headings |
| **H3** | 48px | DemiBold (600) | 48px | -0.96px | Subsection titles |
| **H4 / Title Sections DT** | 32px | DemiBold (600) | 40px | -0.64px | Desktop section titles |
| **H5 / Subtitles** | 20px | DemiBold (600) | 24px | -0.4px | Subtitles, small headings |

### Body Text

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| **Body M** | 16px | Medium (500) | 20px | 0 | Primary body text (Hero) |
| **Body S** | 16px | Regular (400) | 20px | 0 | Standard body text |
| **Body XS** | 14px | Regular (400) | 20px | 0 | Secondary body text, details |

### Technical Text

| Name | Size | Weight | Line Height | Letter Spacing | Usage |
|------|------|--------|-------------|----------------|-------|
| **Captions** | 12px | Regular (400) | 14.4px | 1.92px (uppercase) | Labels, metadata |
| **Details** | 10px | Regular (400) | 12px | 1.6px (uppercase) | Fine print, technical details |

## Typography Implementation

### Correct Usage (✅)
```tsx
// Heading with sans font
<h1 className="font-sans text-[80px] font-semibold leading-[74px] tracking-[-1.6px]">
  Generate anything
</h1>

// Body text with sans font
<p className="font-sans text-base font-normal leading-6">
  Standard body text
</p>

// Technical text with mono font
<span className="font-mono text-sm font-normal">
  Code or technical content
</span>

// Button with mono font
<button className="font-mono text-base">
  Generate
</button>
```

### Incorrect Usage (❌)
```tsx
// DON'T use explicit font family names
<h1 className="font-['TT_Interphases_Pro',sans-serif] text-[80px]">Wrong</h1>
<p className="font-['Inter',sans-serif] text-base">Wrong</p>
<button className="font-['TT_Interphases_Pro_Mono',monospace]">Wrong</button>
```

### H1 Example
```css
/* Use font-sans in Tailwind instead */
font-family: 'TT Interphases Pro', sans-serif;
font-size: 80px;
font-weight: 600;
line-height: 74px;
letter-spacing: -1.6px;
color: #292827;
```

### H2 Example
```css
/* Use font-sans in Tailwind instead */
font-family: 'TT Interphases Pro', sans-serif;
font-size: 56px;
font-weight: 600;
line-height: 56px;
letter-spacing: -1.12px;
color: #292827;
```

### Body Text Example
```css
/* Use font-sans in Tailwind instead */
font-family: 'TT Interphases Pro', sans-serif;
font-size: 16px;
font-weight: 500;
line-height: 20px;
color: #292827;
```

### Mono/Caption Example
```css
/* Use font-mono in Tailwind instead */
font-family: 'TT Interphases Pro Mono', monospace;
font-size: 12px;
font-weight: 400;
line-height: 1.2;
letter-spacing: 1.92px;
text-transform: uppercase;
color: #292827;
```

## Font Loading

The fonts are loaded locally using Next.js `next/font/local`:

```typescript
import localFont from "next/font/local";

const interphases = localFont({
  src: [
    {
      path: "./fonts/TT_Interphases_Pro/TT_Interphases_Pro_Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/TT_Interphases_Pro/TT_Interphases_Pro_Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/TT_Interphases_Pro/TT_Interphases_Pro_Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/TT_Interphases_Pro/TT_Interphases_Pro_DemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-interphases",
  display: "swap",
});
```

## Best Practices

1. **Use DemiBold (600)** for all headings and titles
2. **Use Medium (500)** for emphasized body text
3. **Use Regular (400)** for standard body text
4. **Apply negative letter-spacing** to large headings (32px and above)
5. **Use uppercase** for captions and details with increased letter-spacing
6. **Maintain proper line-height** ratios for readability
