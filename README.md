# OCEM Sports Hub

🏅 OCEM Sports Hub — A central platform for managing and tracking OCEM Sports Week events. View fixtures, live scores, results, and leaderboards across football, cricket, badminton, chess, and quizzes. Built with Next.js, React, Tailwind CSS, and Supabase.

## 🚀 Production-Ready Setup

Follow these steps to get your OCEM Sports Hub up and running in production.

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (version 8 or higher)
- A Supabase account (free tier available at [supabase.com](https://supabase.com/))

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd ocem-sports-hub
   ```

2. Install dependencies using pnpm:

   ```bash
   pnpm install
   ```

### Environment Configuration

1. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
   ```

#### Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com/) and create an account
2. Create a new project
3. In your Supabase project dashboard, go to Settings > API
4. Copy the Project URL and place it in `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the `anon` public key and place it in `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Optional Environment Variables

- `NEXT_PUBLIC_SITE_URL`: Set this to your deployed site URL for proper OAuth redirects. If not set, the application will use the current domain.

### Database Setup

After setting up your Supabase project and environment variables:

1. Navigate to the SQL Editor in your Supabase dashboard
2. Run the SQL scripts from the `scripts` directory in numerical order:
   - [01-create-tables.sql](file:///d:/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/01-create-tables.sql) - Creates all database tables and indexes
   - [02-enable-rls.sql](file:///d:/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/02-enable-rls.sql) - Enables Row Level Security policies
   - [03-seed-data.sql](file:///d:/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/03-seed-data.sql) - Inserts basic seed data (sports and teams)
   - [04-create-functions.sql](file:///d:/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/04-create-functions.sql) - Creates database functions and triggers
   - [07-add-profile-fields.sql](file:///d:/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/07-add-profile-fields.sql) - Adds new profile fields for enhanced functionality (run after initial setup)

For comprehensive sample data, additionally run:

- [05-sample-data.sql](file:///d:/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/05-sample-data.sql) - Inserts comprehensive sample data for testing
- [06-complete-sample-data.sql](file:///d:/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/scripts/06-complete-sample-data.sql) - Complete sample data with players, fixtures, quizzes, and more

### Authentication Setup

The application uses Supabase Auth for user management. Ensure the following settings in your Supabase dashboard:

1. Go to Authentication > Settings
2. Set "Site URL" to your deployed application URL (for local development: `http://localhost:3000`)
3. Add "Additional Redirect URLs" for OAuth callbacks if needed

### Running the Application

#### Development Mode

```bash
pnpm dev
```

#### Production Build

```bash
pnpm build
pnpm start
```

### Authentication

This project uses Supabase for authentication with the following features:

- Email/Password authentication
- Protected routes with client-side and server-side validation
- Admin-only routes
- Automatic session management
- Profile management

To protect a client-side route, wrap your component with the `ProtectedRoute` component:

```tsx
<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>
```

For admin-only routes:

```tsx
<ProtectedRoute requireAdmin={true}>
  <YourAdminComponent />
</ProtectedRoute>
```

For server-side protection in Next.js pages:

```ts
import { requireAuth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ProtectedPage() {
  const { user, profile } = await requireAuth()
  
  if (!user || !profile) {
    redirect("/auth/login?redirect=/your-page")
  }
  
  // Your page content here
}
```

### API Routes

The application includes several API routes for testing and health checks:

- `/api/health` - Basic health check
- `/api/auth-health` - Authentication health check
- `/api/supabase-test` - Supabase connection test

### Deployment

#### Vercel (Recommended)

1. Push your code to a GitHub repository
2. Sign up for [Vercel](https://vercel.com/)
3. Create a new project and import your repository
4. Add your environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (optional but recommended)
5. Deploy!

#### Other Platforms

When deploying to other platforms, ensure you set the environment variables as specified in the [.env.example](file:///d:/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/.env.example) file.

### Troubleshooting

If you encounter dependency conflicts:

1. Make sure you're using pnpm instead of npm or yarn
2. Delete any `package-lock.json` or `yarn.lock` files if they exist
3. Clear pnpm cache if needed: `pnpm store prune`

Common issues:

- Missing environment variables: Double-check your `.env.local` file
- Database connection errors: Verify your Supabase credentials
- Authentication issues: Ensure your Supabase Auth settings are configured correctly

### Project Structure

```bash
├── app/                 # Next.js app router pages
├── components/          # React components
├── lib/                 # Utility functions and Supabase clients
├── scripts/             # Database setup scripts
├── public/              # Static assets
└── styles/              # Global styles
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

### License

This project is licensed under the MIT License - see the [LICENSE](file:///d:/Web%20Codes/Web%20Application/OCEM%20Sports%20Hub/LICENSE) file for details.
