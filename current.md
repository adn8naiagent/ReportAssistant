# TeachAssist.ai - Current State

## Project Overview
AI-powered educational assistant for generating school reports, learning plans, and lesson plans.
Stack: React + TypeScript frontend, Express backend, OpenRouter API (Claude 3.5 Haiku)

## Key Features

### Three Assistant Types
1. **Report Assistant**: Generates natural paragraph-form report commentary (150-200 words)
2. **Learning Plan Assistant**: Victorian Government template with 8 learning areas
3. **Lesson Plan Assistant**: NSW Department of Education structure with 5 lesson stages

### Core Functionality
- Tab-based navigation with independent state per tab
- Context-specific refinement buttons (different for each assistant type)
- Batched refinement system (select multiple options, refine once)
- Sticky copy button (copies plain text to clipboard)
- Tab content persistence using localStorage
- Generation history (last 10 per tab, expandable cards)
- Clear button (visible when input/output present, no confirmation)

## File Structure

### Frontend
- `client/src/pages/home.tsx` - Main React component (all UI logic)
- `client/src/App.tsx` - Router setup
- `client/public/TeachAssist Logo.svg` - App logo

### Backend
- `server/routes.ts` - API endpoint `/api/generate-report`
- `server/index.ts` - Express server setup
- `config/prompts.ts` - System prompts and model configuration

### Configuration
- `.eslintrc.json` (deprecated) - migrated to `eslint.config.js`
- `.prettierrc.json` - Code formatting rules
- `package.json` - Dependencies and scripts

## Recent Changes (Latest First)

### Report Prompt Update (Just Completed)
- Eliminated ALL structural formatting from report commentary
- Now generates ONLY natural flowing paragraphs
- NO headers, NO bullet points, NO section titles
- 2-3 paragraphs, ~4 sentences each
- Focus on natural teacher voice

### Clear/Reset Redesign
- Removed "Start Over" section entirely
- Added Clear button near input (only shows when input/output present)
- Ghost button style, X icon
- No confirmation, clears current tab only
- Keeps history intact

### History Improvements
- Redesigned history button to be more prominent
- Full-width bordered button with hover effects
- Multiple cards can be expanded simultaneously
- No nested scrolling - cards expand naturally
- Chevron rotates 90° when expanded

### Copy Functionality
- Sticky copy button in output header
- Copies plain text for Word compatibility
- Shows "Copied!" with green checkmark for 2 seconds
- Handles clipboard errors gracefully

### Content Persistence
- localStorage saves current content per tab
- History saves last 10 generations per tab
- Tab switching preserves state
- Keys: `teachassist_[type]_current` and `teachassist_[type]_history`

### Refinement System
- Context-specific buttons per assistant type
- Report: 7 buttons (positive/negative, specific, strengths, growth, shorten, detail)
- Learning Plan: 6 buttons (detail, concise, activities, resources, specific, practical)
- Lesson Plan: 6 buttons (detail, concise, differentiation, assessment, activities, scaffolding)
- Batched refinements with single "Refine" button
- Toggleable selection (teal background when selected)

## System Prompts

### Report Commentary (config/prompts.ts)
- **Format**: Natural paragraphs ONLY, NO structural elements
- **Length**: 150-200 words
- **Structure**: Academic → Behavior → Recommendations (woven naturally)
- **Tone**: Formal, constructive, growth mindset
- **Refinement**: Selective updates (specific aspect vs general)

### Learning Plan
- Victorian Government template with 8 learning areas
- Structured sections with headers
- Plain text formatting (dashes for lists)

### Lesson Plan
- NSW Department of Education structure
- 5 lesson stages (Review, I do, We do, You do, Closure)
- Plain text formatting (dashes for lists)

## Technical Details

### State Management
- React hooks (useState, useEffect)
- Set-based selection tracking for refinements and expanded history items
- localStorage for persistence
- No external state management library

### API Integration
- Single endpoint: POST `/api/generate-report`
- Accepts: `studentInfo`, `type`, `conversationHistory`
- Returns: `{ report: string }`
- Model: anthropic/claude-3.5-haiku (configurable in config/prompts.ts)

### Styling
- Tailwind CSS with custom color scheme (teal primary)
- shadcn/ui components
- Responsive design (max-w-3xl containers)
- Gradient header (teal-600 to cyan-600)

## Code Quality
- TypeScript strict mode
- ESLint v9 flat config (eslint.config.js)
- Prettier formatting
- No linting/formatting warnings

## Environment Variables
- `OPENROUTER_API_KEY` - Required for API access
- `PORT` - Server port (default: 5000)

## Scripts
- `npm run dev` - Development server
- `npm run build` - Production build (Vite + esbuild)
- `npm run check` - TypeScript type checking
- `npm start` - Production server

## Known Issues/Notes
- npm audit shows 5 moderate vulnerabilities (dev dependencies: esbuild, vite, drizzle-kit)
- These are development-only and would require breaking changes to fix
- Browserslist data is 13 months old (cosmetic warning)

## TODO List (Completed)
All recent tasks completed:
- ✅ Context-specific refinement buttons
- ✅ Batched refinement system
- ✅ Sticky copy button
- ✅ Content persistence and history
- ✅ History UI redesign (no nested scrolling)
- ✅ Clear button redesign
- ✅ Report prompt update (natural paragraphs only)
- ✅ Removed "Saved" badges from tabs

## Next Possible Enhancements
- Export history as PDF/Word document
- User authentication
- Multiple student profiles
- Template library
- Bulk generation
- Email/share functionality

## Important Patterns

### localStorage Keys
```typescript
teachassist_report_current
teachassist_report_history
teachassist_learningplan_current
teachassist_learningplan_history
teachassist_lessonplan_current
teachassist_lessonplan_history
```

### Frontend System Prompts
System prompts are duplicated in `client/src/pages/home.tsx` for conversation history.
Keep these in sync with `config/prompts.ts` when making changes.

---
Last Updated: 2025-11-04
Session Context: Report prompt updated to eliminate structural formatting
