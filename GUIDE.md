# 🎓 University Lost & Found - Complete Guide

Welcome to the University Lost & Found System! This guide will help you understand, set up, and use this full-stack application.

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [What You Need to Know](#what-you-need-to-know)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Using the Application](#using-the-application)
5. [Understanding the Code](#understanding-the-code)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)
8. [Deployment](#deployment)

## 🚀 Quick Start

**For the impatient:**

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 2. Set up database
npx prisma migrate dev

# 3. Run the app
npm run dev
```

Then visit http://localhost:3000

**But wait!** You'll need Supabase configured first. See [Step-by-Step Setup](#step-by-step-setup) below.

## 🧠 What You Need to Know

### Technologies Used

This is a **modern full-stack application** using:

- **Next.js 15**: React framework with server-side rendering
- **Supabase**: Backend-as-a-Service (auth, database, storage)
- **Prisma**: Database ORM (Object-Relational Mapping)
- **TypeScript**: JavaScript with types
- **TailwindCSS**: Utility-first CSS framework

### How It Works (Simple Explanation)

```
┌─────────────────┐
│   Your Browser  │
│  (What you see) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Next.js App   │
│  (Frontend +    │
│   Backend)      │
└────────┬────────┘
         │
    ┌────┴────────────────────┐
    ▼                         ▼
┌─────────┐            ┌──────────┐
│ Supabase│            │  Prisma  │
│  Auth   │            │   ORM    │
└─────────┘            └─────┬────┘
    │                        │
    ▼                        ▼
┌─────────┐            ┌──────────┐
│ Storage │            │PostgreSQL│
│(Images) │            │(Database)│
└─────────┘            └──────────┘
```

**In plain English:**

1. User interacts with website (forms, buttons)
2. Next.js processes requests on server
3. Supabase handles login/signup and image storage
4. Prisma talks to PostgreSQL database
5. Data flows back to user's browser
6. Page updates with new information

## 📋 Step-by-Step Setup

### Prerequisites

- [ ] Computer with macOS, Windows, or Linux
- [ ] Node.js installed (version 18 or higher)
  - Check: `node --version`
  - If not installed: [Download Node.js](https://nodejs.org)
- [ ] A code editor (VS Code recommended)
- [ ] Internet connection

### Step 1: Create Supabase Account & Project

1. **Go to https://supabase.com**
2. Click "Start your project"
3. Sign up with GitHub or email
4. Click "New Project"
5. Fill in:
   - **Organization**: Create new or select existing
   - **Name**: `lost-and-found`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to you
6. Click "Create new project"
7. Wait ~2 minutes for setup

### Step 2: Get Supabase Credentials

1. In your Supabase dashboard, click on your project
2. Go to **Settings** (gear icon) → **API**
3. Copy these values (you'll need them):

   ```
   Project URL: https://xxxxxxxxxxxxx.supabase.co
   anon public key: eyJhbGc...very.long.string
   ```

4. Go to **Settings** → **Database**
5. Scroll to "Connection string" → Select **URI** mode
6. Copy the connection string:
   ```
   postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws...
   ```
7. **Important**: Replace `[YOUR-PASSWORD]` with the database password you created

8. Back to **Settings** → **API**
9. Copy the `service_role` key (keep this secret!)

### Step 3: Create Storage Bucket

1. In Supabase dashboard, go to **Storage** (left sidebar)
2. Click **New bucket**
3. Name: `lost-and-found-images`
4. ✅ Check "Public bucket"
5. Click **Create bucket**
6. Click on the bucket you just created
7. Go to **Policies** tab
8. Click **New Policy** → Create policy from scratch

   **Policy 1: Allow authenticated uploads**

   ```sql
   CREATE POLICY "Allow authenticated uploads"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'lost-and-found-images');
   ```

   **Policy 2: Allow public reads**

   ```sql
   CREATE POLICY "Allow public reads"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'lost-and-found-images');
   ```

   **Policy 3: Allow authenticated deletes**

   ```sql
   CREATE POLICY "Allow authenticated deletes"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'lost-and-found-images');
   ```

### Step 4: Configure Environment Variables

1. In your project folder, copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your editor and fill in:

   ```env
   # From Step 2
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your.anon.key
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your.service.role.key

   # Connection string from Step 2 (with password filled in)
   DATABASE_URL=postgresql://postgres.[ref]:[YOUR-PASSWORD]@aws...

   # From Step 3
   NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=lost-and-found-images
   ```

3. Save the file

### Step 5: Set Up Database

Run this command to create database tables:

```bash
npx prisma migrate dev --name init
```

You should see:

```
✔ Generated Prisma Client
✔ Applied migration
```

### Step 6: Create First Admin User

**Option A: Sign up then promote**

1. Start the app: `npm run dev`
2. Go to http://localhost:3000/signup
3. Create account with your email
4. Go to Supabase dashboard → **Table Editor** → **User** table
5. Find your user, click edit
6. Change `role` from `STUDENT` to `ADMIN`
7. Refresh the app

**Option B: Use Prisma Studio**

1. Run `npx prisma studio`
2. Opens in browser at http://localhost:5555
3. Click **User** table
4. Add new record:
   - email: admin@university.edu
   - name: System Admin
   - role: ADMIN
   - supabaseId: (you'll need to get this from Supabase after signup)

### Step 7: Run the Application

```bash
npm run dev
```

Visit http://localhost:3000

You should see the homepage! 🎉

## 💻 Using the Application

### As a Student

1. **Sign Up**

   - Click "Sign In" → "Sign up"
   - Enter name, email, password
   - Click "Sign up"

2. **Post a Lost Item**

   - Login → Dashboard
   - Click "Post New Item"
   - Fill in details:
     - Title: "Black Backpack"
     - Description: "Lost near library, has laptop inside"
     - Category: Bags
     - Location: "Library 2nd Floor"
     - Contact: Your phone number
     - Status: Lost
     - Upload image (optional)
   - Click "Create Item"

3. **Search for Found Items**

   - Go to homepage
   - Use search bar: "laptop"
   - Filter by category: Electronics
   - Filter by status: Found
   - Click on items to see details

4. **Mark Item as Found**

   - Go to Dashboard
   - Click on your item
   - Click "Mark Resolved"

5. **Edit/Delete Items**
   - Dashboard → Your item
   - Click "Edit" to modify
   - Click "Delete" to remove

### As an Admin

1. **Access Admin Dashboard**

   - Login with admin account
   - Click "Admin" in navbar
   - View statistics and activity

2. **Manage Users**

   - Admin → Manage Users
   - View all students
   - Add new students
   - Delete students (removes their items too)

3. **Manage All Items**
   - Admin → Manage All Items
   - View/edit/delete any item
   - Monitor system activity

## 🔍 Understanding the Code

### Project Structure Explained

```
lost-and-found/
├── app/                    # Where pages live
│   ├── page.tsx           # Homepage (/)
│   ├── login/             # Login page (/login)
│   ├── signup/            # Signup page (/signup)
│   ├── dashboard/         # Student dashboard
│   ├── admin/             # Admin pages
│   ├── items/             # Item-related pages
│   └── actions/           # Backend logic (Server Actions)
│       ├── auth.ts        # Login, signup, logout
│       ├── items.ts       # Create, read, update, delete items
│       └── admin.ts       # Admin operations
│
├── components/             # Reusable UI pieces
│   ├── Navbar.tsx         # Top navigation
│   ├── ItemCard.tsx       # Single item display
│   ├── ItemForm.tsx       # Create/edit form
│   └── ItemList.tsx       # List of items with filters
│
├── lib/                    # Helper functions
│   ├── supabase/          # Supabase connections
│   ├── prisma.ts          # Database connection
│   ├── auth.ts            # Check if user logged in
│   └── storage.ts         # Upload/delete images
│
└── prisma/
    └── schema.prisma       # Database structure
```

### Key Concepts

#### Server Components vs Client Components

**Server Components** (default):

- Run on server only
- Can access database directly
- Good for fetching data
- Example: `app/page.tsx`

```tsx
// Server Component
export default async function HomePage() {
  const items = await getItems(); // Runs on server
  return <ItemList items={items} />;
}
```

**Client Components** (with `'use client'`):

- Run in browser
- Handle user interactions
- Can use React hooks (useState, useEffect)
- Example: `components/ItemForm.tsx`

```tsx
"use client";

export default function ItemForm() {
  const [title, setTitle] = useState("");
  // Handle form submission, clicks, etc.
}
```

#### Server Actions

Functions that run on the server but can be called from client:

```tsx
"use server";

export async function createItem(formData: FormData) {
  // Runs on server - secure!
  // Can access database
  // User can't see this code
}
```

#### Prisma Queries

Type-safe database operations:

```typescript
// Get all items
const items = await prisma.item.findMany();

// Get one item
const item = await prisma.item.findUnique({
  where: { id: itemId },
});

// Create item
const newItem = await prisma.item.create({
  data: { title, description, userId },
});

// Update item
await prisma.item.update({
  where: { id: itemId },
  data: { title: newTitle },
});

// Delete item
await prisma.item.delete({
  where: { id: itemId },
});
```

## 🛠️ Common Tasks

### Add a New Category

1. Edit `prisma/schema.prisma`:

   ```prisma
   enum Category {
     ELECTRONICS
     BOOKS
     // ... existing categories
     JEWELRY  // Add this
   }
   ```

2. Run migration:

   ```bash
   npx prisma migrate dev --name add_jewelry_category
   ```

3. Update the form in `components/ItemForm.tsx`:
   ```tsx
   const CATEGORIES = [
     "ELECTRONICS",
     "BOOKS",
     // ...
     "JEWELRY", // Add this
   ];
   ```

### View Database

```bash
npx prisma studio
```

Opens visual database editor at http://localhost:5555

### Reset Database (⚠️ Deletes all data!)

```bash
npx prisma migrate reset
```

### Check for Errors

```bash
npm run lint
```

## 🐛 Troubleshooting

### "Prisma Client not found"

```bash
npx prisma generate
```

### "Can't connect to database"

- Check `DATABASE_URL` in `.env`
- Make sure password is correct
- Verify Supabase project is running

### "Images won't upload"

- Check bucket name matches in `.env`
- Verify bucket is public
- Check RLS policies are set

### "Unauthorized" errors

- Clear browser cookies
- Logout and login again
- Check middleware.ts isn't blocking route

### "Module not found" errors

```bash
npm install
```

### TypeScript errors after schema change

```bash
npx prisma generate
# Then restart VS Code TypeScript server:
# Cmd/Ctrl + Shift + P → "Restart TS Server"
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - All variables from `.env`
6. Click "Deploy"
7. After deployment:
   - Run migrations: `npx prisma migrate deploy`
   - Update Supabase:
     - Go to Supabase → Auth → URL Configuration
     - Add your Vercel URL to allowed URLs

## 📚 Additional Resources

- **[README.md](./README.md)** - Project overview
- **[SETUP.md](./SETUP.md)** - Detailed setup guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - How everything works
- **[QUICKREF.md](./QUICKREF.md)** - Quick reference
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete summary

### External Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## ✅ Checklist for Success

Before considering setup complete:

- [ ] Supabase project created
- [ ] All environment variables set in `.env`
- [ ] Storage bucket created and configured
- [ ] Database migrations run successfully
- [ ] Admin user created
- [ ] App runs without errors
- [ ] Can sign up new user
- [ ] Can create item with image
- [ ] Can edit and delete items
- [ ] Admin can access admin dashboard
- [ ] Search and filters work

## 🎯 What You've Learned

By working with this project, you've seen:

✅ Full-stack app development
✅ Authentication and authorization
✅ Database design and relationships
✅ Image upload handling
✅ Server-side rendering
✅ API development with Server Actions
✅ Type-safe database queries
✅ Role-based access control
✅ Modern React patterns
✅ Professional project structure

## 💡 Next Steps

Consider adding:

- Email notifications when items match
- Real-time chat between users
- Mobile app version
- QR code generation
- Advanced search with AI
- Analytics dashboard
- Multi-language support
- Dark mode theme

---

**Need Help?**

1. Check the error message carefully
2. Review the troubleshooting section
3. Check relevant documentation files
4. Search for the error online
5. Review the code in similar working examples

**Happy coding!** 🚀
