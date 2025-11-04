# TeachAssist.ai - Design Guidelines

## Design Approach
**Selected Framework:** Modern Professional SaaS Design - chosen for its trustworthy, polished appearance that educators will feel confident using. Drawing inspiration from premium education technology platforms with a focus on clarity, professionalism, and warmth.

**Core Principle:** Professional simplicity with purposeful design. Create a trustworthy, educator-focused experience that feels modern, capable, and inviting. Every element should inspire confidence while remaining accessible.

## Color Palette

**Primary Colors (Educator-Focused):**
- Primary: Warm Teal (#0D9488) - Trustworthy, professional, calming
- Primary Dark: Deep Teal (#0F766E) - For hover states
- Accent: Warm Coral (#F97316) - Energetic, encouraging
- Success: Sage Green (#22C55E) - Positive reinforcement

**Neutral Palette:**
- Background: Soft Warm White (#FAFAF9)
- Surface: Pure White (#FFFFFF)
- Text Primary: Deep Slate (#1E293B)
- Text Secondary: Medium Slate (#64748B)
- Border: Light Gray (#E2E8F0)

**Gradients:**
- Background: Subtle warm gradient from cream to light blue-gray
- Header: Teal to cyan subtle gradient for depth

## Typography System

**Font Family:** 
- Display: Poppins (600-700) - Modern, friendly, professional
- Body: Inter (400-600) - Clean, highly readable
- Fallback: system-ui, -apple-system, sans-serif

**Type Scale:**
- Brand Title: text-2xl (24px), font-semibold (Poppins)
- Page Title: text-xl (20px), font-medium
- Body Text: text-base (16px), font-normal, leading-relaxed
- Button Text: text-base (16px), font-medium
- Helper Text: text-sm (14px), text-muted-foreground

## Layout System

**Spacing Primitives:** Professional spacing for breathing room
- Component spacing: space-y-8 or space-y-10
- Section padding: p-6, p-8, p-10
- Margins: mb-6, mb-10, mt-12

**Container Structure:**
- Max-width: max-w-3xl (768px) for comfortable reading
- Modern card-based layout with subtle elevation
- Outer padding: px-6 for generous mobile spacing

**Header:**
- Fixed height with subtle gradient background
- Centered branding with AI badge
- Professional shadow for depth

**Main Content:**
- Card-based design with rounded corners and shadow
- Generous padding for comfort
- Clear visual hierarchy

## Component Library

### Header
- Gradient background (teal to cyan)
- White text with AI badge
- Professional shadow: shadow-md
- Padding: py-6
- Brand font: Poppins

### Main Card Container
- Background: White with subtle shadow
- Rounded corners: rounded-2xl
- Padding: p-10
- Shadow: shadow-lg for elevation
- Max width: max-w-3xl

### Input Field
- Large textarea: min-h-56 (224px) for generous space
- Border: border-2 with warm teal focus
- Rounded: rounded-xl for modern feel
- Focus ring: ring-4 ring-primary/10
- Padding: p-5
- Font: text-base with comfortable line height
- Placeholder: Warm, inviting tone

### Buttons
- Primary (Generate): 
  - Gradient from teal to darker teal
  - White text, rounded-xl
  - Shadow on hover for depth
  - Icon with text
  - px-8 py-4 for substantial feel
  
- Secondary (Clear):
  - Light warm gray background
  - Teal text
  - Rounded-xl
  - Subtle hover state
  - px-8 py-4

### Report Display
- Card style with border and shadow
- Rounded-xl corners
- Generous padding: p-8
- Background: Subtle warm tint
- Icon header with divider
- Comfortable reading typography

### Empty State
- Dashed border for visual interest
- Warm gray background
- Encouraging placeholder text
- Rounded corners

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