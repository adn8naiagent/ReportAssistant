# School Report Generator - Design Guidelines

## Design Approach
**Selected Framework:** Material Design (minimal subset) - chosen for its clean forms, excellent input components, and focus on utility-first interfaces. Drawing inspiration from Google's minimalist product pages (Google Search, Google Forms).

**Core Principle:** Extreme simplicity with purposeful whitespace. Every element serves a clear function.

## Typography System

**Font Family:** 
- Primary: Inter or Roboto via Google Fonts CDN
- Fallback: system-ui, -apple-system, sans-serif

**Type Scale:**
- Page Title: text-3xl (30px), font-medium
- Input Label: text-sm (14px), font-medium, text-gray-700
- Button Text: text-base (16px), font-medium
- Report Output: text-base (16px), font-normal, leading-relaxed
- Helper Text: text-sm (14px), text-gray-500

## Layout System

**Spacing Primitives:** Use Tailwind units of **4, 6, 8, 12, 16** for consistency
- Component spacing: space-y-6 or space-y-8
- Padding: p-4, p-6, p-8
- Margins: mb-4, mb-8, mt-12

**Container Structure:**
- Max-width: max-w-2xl (672px) centered container
- Vertical centering: min-h-screen flex items-center justify-center
- Outer padding: px-4 for mobile breathing room

**Vertical Rhythm:**
- Title to input: mb-12
- Input to buttons: mt-8
- Buttons to output area: mt-16
- Internal component spacing: space-y-6

## Component Library

### Input Field
- Large textarea: min-h-48 (192px)
- Border: border-2 border-gray-300, rounded-lg
- Focus state: focus:border-blue-500 focus:ring-2 focus:ring-blue-200
- Padding: p-4
- Font size: text-base
- Placeholder styling: placeholder:text-gray-400

### Buttons
- Container: flex gap-4 justify-center
- Primary (Generate): bg-blue-600 text-white px-8 py-3 rounded-lg
- Secondary (Clear): bg-gray-200 text-gray-700 px-8 py-3 rounded-lg
- Hover states: Primary darkens, Secondary shows subtle gray increase
- Font weight: font-medium

### Report Display Area
- Container: bg-gray-50 rounded-lg p-8
- Border: border border-gray-200
- Minimum height: min-h-64 when empty (shows placeholder)
- Placeholder text: text-gray-400 italic text-center
- Content alignment: text-left with proper line-height (leading-relaxed)

### Page Title (Optional)
- Positioned above input: text-3xl font-medium mb-2
- Subtitle below: text-gray-600 text-base mb-12

## Accessibility
- All inputs have associated labels (can be visually hidden with sr-only if design requires)
- Focus indicators clearly visible with ring utilities
- Sufficient color contrast ratios (4.5:1 minimum)
- Button states clearly differentiated

## Animations
**Minimal usage only:**
- Button hover: subtle scale transform (scale-[1.02]) or background color transition
- Focus states: transition-all duration-150 for smooth ring appearance
- NO loading spinners, elaborate transitions, or scroll animations

## Images
**No images required** - This is a pure utility interface focused on input/output functionality.

## Implementation Notes
- Single-column layout at all breakpoints
- Background: Simple white (bg-white) or very light gray (bg-gray-50)
- No shadow effects except subtle focus rings
- Maintain generous whitespace - don't fill space unnecessarily
- Report output section only visible after generation (conditional rendering)