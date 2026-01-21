# Coding Standards

## Root Elements of Triggers (Base UI)

### Rule: Avoid Nested Buttons in Triggers

When using components from `@base-ui/react` (such as `Tooltip`, `Popover`, `Menu`, etc.), their `Trigger` components (e.g., `Tooltip.Trigger`) render a `<button>` element by default.

**Do NOT nest a `<button>` or a custom `Button` component directly inside a `Trigger`.** 
Nesting a button inside another button is invalid HTML and can cause accessibility issues and unexpected behavior.

### Recommended Solution

Use the `render` prop on the `Trigger` component to specify the root element or to pass a custom component. This allows the `Trigger` to merge its props onto your component instead of wrapping it.

#### Incorrect ❌
```tsx
<Tooltip.Trigger>
  <Button variant="outline">Hover me</Button>
</Tooltip.Trigger>
```

#### Correct (using render) ✅
```tsx
<Tooltip.Trigger 
  render={<Button variant="outline" />}
>
  Hover me
</Tooltip.Trigger>
```

### Why this matters
1. **HTML Validity**: The HTML specification states that a `<button>` element must not contain any interactive content, including other buttons.
2. **Accessibility**: Screen readers and other assistive technologies may fail to correctly interpret nested interactive elements.
3. **Event Handling**: Nested buttons can lead to issues with event propagation and focus management.
