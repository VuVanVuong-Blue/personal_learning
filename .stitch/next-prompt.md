---
page: admin_dashboard
---
An Admin Dashboard page for managing the learning platform.

**DESIGN SYSTEM (REQUIRED):**
# Design System: Personal Learning Platform
## 1. Visual Theme & Atmosphere
Clean, focused, utilitarian minimalist aesthetic. Airy and exceptionally fast.
Key Characteristics: Razor-thin borders, crisp typography, expansive whitespace, vibrant primary brand color (Indigo).

## 2. Color Palette & Roles
- Crisp Off-White (#FAFAFA or Slate-50) – Primary background color.
- Pure White (#FFFFFF) – Secondary surface color for cards and modals.
- Electric Indigo (#4F46E5) – The signature brand and primary action color.
- Deep Midnight Violet (#312E81) – Hover states on primary buttons.
- Deep Charcoal Slate (#0F172A) – Primary text color for all H1/H2 headlines.
- Muted Ash Gray (#64748B) – Secondary text color for descriptions.
- Whisper Gray (#E2E8F0) – 1px internal dividers and subtle card borders.

## 3. Typography Rules
Primary Font Family: Inter (or Onest)
- Display Headlines (H1): Extra-bold weight (800).
- Body Text: Regular (400), relaxed line-height (1.75).

## 4. Component Stylings
- Buttons: Soft pill-rounded (12px / 0.75rem). Primary is Electric Indigo, white text, no borders. 
- Cards & Tables: Soft rounded (12px / 0.75rem), pure white, hairline Whisper Gray border.

## 5. Layout Principles
A professional Left-Right Split administrative layout (like Vercel or Stripe dashboard).
1. Sidebar (Left): A tall, thin column (max 250px) on the left side with a pure white background and Whisper Gray right border. Contains the logo and a vertical list of admin navigation links (e.g., 'Users', 'Roadmaps', 'Settings'). Active link has a light blue background block and Indigo text.
2. Main Content (Right): Off-White background. 
   - A minimalist top bar showing breadcrumbs and the admin profile.
   - A grid of 4 very small pure white KPI summary cards (Total Users, Active Roadmaps, etc.).
   - A large, prominent Data Table card below. The table displays 'Recent Users' using clean rows. Data headers are in Muted Ash Gray. Row dividers are Whisper Gray 1px lines. No heavy zebra striping, just pure whitespace.
