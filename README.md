# OCEM-Sports-Hub

🏅 OCEM Sports Hub — A central platform for managing and tracking OCEM Sports Week events. View fixtures, live scores, results, and leaderboards across football, cricket, badminton, chess, and quizzes. Built with React, Tailwind, Django, and Framer Motion

## Getting Started

This project uses **pnpm** as the package manager. Do not use npm or yarn as they may cause dependency conflicts.

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (version 8 or higher)

### Installation

1. Install dependencies using pnpm:

   ```bash
   pnpm install
   ```

2. Run the development server:

   ```bash
   pnpm dev
   ```

### Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Troubleshooting

If you encounter dependency conflicts:

1. Make sure you're using pnpm instead of npm
2. Delete any `package-lock.json` files if they exist
3. Clear pnpm cache if needed: `pnpm store prune`
