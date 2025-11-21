# University Lost & Found - Setup Guide

This is a full-stack Lost & Found web application built with Next.js 15, Supabase, Prisma, and TailwindCSS.

## Architecture Overview

### Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS
- **Backend**: Next.js Server Actions, Prisma ORM
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (Email/Password)
- **Storage**: Supabase Storage (Image uploads)
- **UI Components**: Custom components with TailwindCSS

### Architecture Flow

```
Client (Browser)
    ↓
Next.js App Router (pages/components)
    ↓
Server Actions (app/actions/*.ts)
    ↓
Prisma Client (lib/prisma.ts)
    ↓
Supabase PostgreSQL Database

Parallel:
    Client → Supabase Client SDK → Supabase Auth/Storage
```

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git (optional)

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: `lost-and-found`
   - Database password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to be provisioned (~2 minutes)

### 1.2 Get Supabase Credentials

1. In your Supabase dashboard, go to **Project Settings** → **API**
2. Copy the following:
   - `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Go to **Project Settings** → **Database** and copy:
     - Connection string (URI mode) → This is your `DATABASE_URL`
     - Replace `[YOUR-PASSWORD]` with your database password
3. In **Project Settings** → **API** → Service role key section:
   - Copy `service_role` key → This is your `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ Keep this secret! Never expose it to clients

### 1.3 Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click **New bucket**
3. Name: `lost-and-found-images`
4. Set as **Public bucket** ✓
5. Click **Create bucket**

### 1.4 Configure Row Level Security (RLS) Policies

#### For Auth Users Table

Already handled by Supabase Auth automatically.

#### For Storage Bucket

1. Go to **Storage** → `lost-and-found-images` → **Policies**
2. Create the following policies:

**Policy 1: Allow authenticated users to upload**

```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lost-and-found-images');
```

**Policy 2: Allow public read access**

```sql
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'lost-and-found-images');
```

**Policy 3: Allow users to delete their own files**

```sql
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'lost-and-found-images');
```

## Step 2: Environment Setup

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Fill in the `.env` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=lost-and-found-images
```

## Step 3: Database Setup with Prisma

### 3.1 Push Database Schema

Run Prisma migration to create tables:

```bash
npx prisma migrate dev --name init
```

This creates:

- `User` table (linked to Supabase Auth users)
- `Item` table (lost/found items)
- Enums for Role, ItemStatus, Category

### 3.2 Generate Prisma Client

```bash
npx prisma generate
```

### 3.3 (Optional) Seed Admin User

To create an admin user, you can either:

**Option A: Use Supabase Dashboard**

1. Sign up through your app at `/signup`
2. Go to Supabase → **Table Editor** → `User` table
3. Find your user and change `role` from `STUDENT` to `ADMIN`

**Option B: Create a seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

async function main() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Create admin in Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email: "admin@university.edu",
    password: "admin123",
    email_confirm: true,
  });

  if (error) throw error;

  // Create admin in Prisma
  await prisma.user.create({
    data: {
      supabaseId: data.user.id,
      email: "admin@university.edu",
      name: "System Admin",
      role: "ADMIN",
    },
  });

  console.log("Admin user created!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run: `npx tsx prisma/seed.ts`

## Step 4: Install Dependencies & Run

All dependencies are already installed. To run the development server:

```bash
npm run dev
```

Visit http://localhost:3000

## Step 5: Testing the Application

### Test User Flow (Student)

1. Go to `/signup` and create a student account
2. Login at `/login`
3. Create a lost/found item at `/items/new`
4. Upload an image
5. View item details
6. Edit/delete your own items
7. Mark items as resolved

### Test Admin Flow

1. Login with admin credentials
2. Access `/admin` dashboard
3. View all users and items
4. Add/delete students
5. Edit/delete any item

## Project Structure

```
lost-and-found/
├── app/
│   ├── actions/          # Server actions for CRUD
│   │   ├── auth.ts       # Auth actions
│   │   ├── items.ts      # Item CRUD
│   │   └── admin.ts      # Admin actions
│   ├── admin/            # Admin pages
│   ├── dashboard/        # Student dashboard
│   ├── items/            # Item pages
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/           # React components
│   ├── ItemCard.tsx
│   ├── ItemForm.tsx
│   ├── ItemList.tsx
│   ├── ItemDetail.tsx
│   ├── Navbar.tsx
│   └── UserManagement.tsx
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase clients
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # Auth helpers
│   ├── storage.ts        # Image upload
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration files
├── middleware.ts         # Auth middleware
├── .env                  # Environment variables
└── package.json
```

## How It Works

### Authentication Flow

1. **Signup**: User creates account via Supabase Auth
2. **Sync**: Server action syncs Supabase user to Prisma database
3. **Login**: Supabase Auth handles authentication
4. **Session**: Middleware checks auth on every request
5. **Protection**: Server actions verify user before CRUD operations

### Data Flow for Creating an Item

```
Client Component (ItemForm)
    ↓ (User submits form)
uploadImage() → Supabase Storage (returns URL)
    ↓
createItem() Server Action
    ↓
Prisma creates record in PostgreSQL
    ↓
revalidatePath() refreshes page data
    ↓
Client shows updated data
```

### Role-Based Access Control

- **Public**: View all items (homepage)
- **Student**: CRUD own items, mark as resolved
- **Admin**: CRUD all items, manage users

Implemented via:

- `requireAuth()` - Ensures user is logged in
- `requireAdmin()` - Ensures user has ADMIN role
- Component-level checks for UI rendering

### Image Upload Flow

1. User selects image in ItemForm
2. Client uploads to Supabase Storage bucket
3. Supabase returns public URL
4. URL saved in Prisma database
5. Images displayed via Next.js Image component

## Common Issues & Solutions

### Issue: Prisma Client not found

**Solution**: Run `npx prisma generate`

### Issue: Database connection error

**Solution**:

- Check `DATABASE_URL` in `.env`
- Ensure password doesn't have special characters (URL encode if needed)
- Verify Supabase project is active

### Issue: Images not uploading

**Solution**:

- Verify storage bucket is public
- Check RLS policies are set correctly
- Ensure `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` matches bucket name

### Issue: Auth not working

**Solution**:

- Clear browser cookies/localStorage
- Verify environment variables are set
- Check Supabase Auth is enabled in dashboard

### Issue: Middleware redirecting incorrectly

**Solution**:

- Check `/login` and `/signup` are excluded in middleware config
- Ensure cookies are being set properly

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy
5. Update Supabase Site URL:
   - Go to Supabase → **Authentication** → **URL Configuration**
   - Add your Vercel domain to Site URL and Redirect URLs

### Database Migrations in Production

```bash
npx prisma migrate deploy
```

## Security Best Practices

✅ **Implemented**:

- Environment variables for secrets
- Service role key never exposed to client
- RLS policies on storage
- Server-side validation in actions
- HTTPS only (in production)
- Password hashing (Supabase Auth)

⚠️ **Additional Recommendations**:

- Implement rate limiting
- Add CAPTCHA to signup
- Enable 2FA for admin accounts
- Regular security audits
- Monitor Supabase logs

## API Reference

### Server Actions

All in `app/actions/*.ts`:

**Auth Actions** (`auth.ts`):

- `syncUserToPrisma(supabaseId, email, name)` - Sync user to database
- `signOut()` - Sign out user

**Item Actions** (`items.ts`):

- `createItem(formData)` - Create new item
- `updateItem(itemId, formData)` - Update item
- `deleteItem(itemId)` - Delete item
- `markItemAsResolved(itemId, resolved)` - Mark item as resolved
- `getItems(filters?)` - Get all items with filters
- `getItemById(itemId)` - Get single item
- `getUserItems()` - Get current user's items

**Admin Actions** (`admin.ts`):

- `getAllUsers()` - Get all users
- `deleteUser(userId)` - Delete user
- `createStudentUser(email, password, name)` - Create student
- `createAdminUser(email, password, name)` - Create admin

## Support

For issues or questions:

1. Check this README
2. Review Prisma docs: https://www.prisma.io/docs
3. Review Supabase docs: https://supabase.com/docs
4. Review Next.js docs: https://nextjs.org/docs

## License

MIT
