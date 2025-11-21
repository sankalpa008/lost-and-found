# Quick Reference Guide

## Common Tasks & Commands

### Development Workflow

```bash
# Start development server
npm run dev

# Access application
http://localhost:3000

# Access Prisma Studio (database GUI)
npx prisma studio
```

### Database Operations

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name descriptive_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset

# View database in browser
npx prisma studio

# Generate Prisma Client after schema changes
npx prisma generate

# Check migration status
npx prisma migrate status
```

### Creating a New Admin User

**Method 1: Via Supabase Dashboard**

1. Sign up through the app at `/signup`
2. Go to Supabase Dashboard → Table Editor → User table
3. Find your user and change `role` from `STUDENT` to `ADMIN`

**Method 2: Via Prisma Studio**

1. Run `npx prisma studio`
2. Open User table
3. Find user and edit `role` field to `ADMIN`

**Method 3: Via Admin Panel (if you already have an admin)**

1. Login as admin
2. Go to `/admin/users`
3. Click "Add Student"
4. After creating, manually change role in database

### Environment Setup Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Create Supabase project
- [ ] Get Supabase URL and keys
- [ ] Get PostgreSQL connection string
- [ ] Create storage bucket `lost-and-found-images`
- [ ] Set bucket to public
- [ ] Configure storage RLS policies
- [ ] Update `.env` with all credentials
- [ ] Run `npx prisma migrate dev`
- [ ] Create first admin user

### Troubleshooting

#### Error: Prisma Client not found

```bash
npx prisma generate
```

#### Error: Cannot connect to database

- Check `DATABASE_URL` in `.env`
- Verify Supabase project is running
- Test connection: `npx prisma db push`

#### Error: Auth not working

- Clear browser cookies and localStorage
- Verify Supabase keys in `.env`
- Check middleware.ts is not redirecting incorrectly

#### Error: Images not uploading

- Verify storage bucket exists and is public
- Check bucket name matches `.env`
- Verify RLS policies are set

#### Error: TypeScript errors after schema change

```bash
npx prisma generate
# Restart TypeScript server in VS Code (Cmd+Shift+P → "Restart TS Server")
```

### File Structure Reference

```
app/
├── actions/              # Server Actions (backend logic)
│   ├── auth.ts          # Authentication actions
│   ├── items.ts         # Item CRUD operations
│   └── admin.ts         # Admin-only operations
├── admin/               # Admin-only pages
│   ├── page.tsx         # Admin dashboard
│   ├── users/           # User management
│   └── items/           # All items view
├── dashboard/           # Student dashboard
│   └── page.tsx
├── items/               # Item-related pages
│   ├── new/             # Create item
│   ├── [id]/            # View item
│   └── [id]/edit/       # Edit item
├── login/               # Login page
├── signup/              # Signup page
├── layout.tsx           # Root layout
└── page.tsx             # Homepage

components/              # React components
├── ItemCard.tsx         # Item display card
├── ItemForm.tsx         # Create/edit form
├── ItemList.tsx         # List with filters
├── ItemDetail.tsx       # Full item view
├── Navbar.tsx           # Navigation bar
└── UserManagement.tsx   # Admin user table

lib/                     # Utility libraries
├── supabase/
│   ├── client.ts        # Client-side Supabase
│   ├── server.ts        # Server-side Supabase
│   ├── middleware.ts    # Session management
│   └── admin.ts         # Admin Supabase client
├── auth.ts              # Auth helper functions
├── prisma.ts            # Prisma client
├── storage.ts           # Image upload/delete
├── types.ts             # TypeScript types
└── utils.ts             # Utility functions

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Migration history
```

### API Reference (Server Actions)

All server actions are in `app/actions/`

#### Auth Actions (`auth.ts`)

```typescript
syncUserToPrisma(supabaseId, email, name?)
signOut()
```

#### Item Actions (`items.ts`)

```typescript
createItem(formData)
updateItem(itemId, formData)
deleteItem(itemId)
markItemAsResolved(itemId, resolved)
getItems(filters?)
getItemById(itemId)
getUserItems()
```

#### Admin Actions (`admin.ts`)

```typescript
getAllUsers()
deleteUser(userId)
createStudentUser(email, password, name?)
createAdminUser(email, password, name?)
```

### Database Schema Reference

#### User Table

| Column     | Type     | Notes                       |
| ---------- | -------- | --------------------------- |
| id         | UUID     | Primary key                 |
| email      | String   | Unique, indexed             |
| name       | String?  | Optional                    |
| role       | Enum     | STUDENT or ADMIN            |
| supabaseId | String   | Unique, links to auth.users |
| createdAt  | DateTime | Auto-generated              |
| updatedAt  | DateTime | Auto-updated                |

#### Item Table

| Column        | Type     | Notes                    |
| ------------- | -------- | ------------------------ |
| id            | UUID     | Primary key              |
| title         | String   | Required                 |
| description   | String   | Required                 |
| category      | Enum     | ELECTRONICS, BOOKS, etc. |
| imageUrl      | String?  | Optional                 |
| location      | String   | Required                 |
| contactNumber | String   | Required                 |
| status        | Enum     | LOST or FOUND            |
| isResolved    | Boolean  | Default false            |
| userId        | UUID     | Foreign key to User      |
| createdAt     | DateTime | Auto-generated           |
| updatedAt     | DateTime | Auto-updated             |

### Useful Queries (Prisma Studio)

**Find all unresolved items:**

```
Filter: isResolved = false
```

**Find all admin users:**

```
Filter: role = ADMIN
```

**Find items by status:**

```
Filter: status = LOST
```

### Testing Checklist

Before deployment, test:

- [ ] Signup new user
- [ ] Login with credentials
- [ ] Create item without image
- [ ] Create item with image
- [ ] Edit own item
- [ ] Delete own item
- [ ] Mark item as resolved
- [ ] Search and filter on homepage
- [ ] View item detail page
- [ ] Try to edit someone else's item (should fail)
- [ ] Login as admin
- [ ] Access admin dashboard
- [ ] View all users
- [ ] Add student user
- [ ] Delete student user
- [ ] Edit any item as admin
- [ ] Delete any item as admin
- [ ] Logout

### Performance Tips

1. **Database Indexes**: Already set on frequently queried fields
2. **Image Optimization**: Use Next.js Image component (already implemented)
3. **Caching**: Use `revalidatePath()` strategically
4. **Loading States**: Add Suspense boundaries for better UX
5. **Pagination**: For large datasets, implement pagination in queries

### Security Checklist

- [x] Environment variables not committed
- [x] Service role key only on server
- [x] All mutations require authentication
- [x] Ownership checks before edit/delete
- [x] Admin-only actions check role
- [x] SQL injection prevented (Prisma)
- [x] XSS prevented (React escaping)
- [ ] Rate limiting (implement if needed)
- [ ] Input validation (add custom validators)
- [ ] CAPTCHA on signup (optional)

### Deployment Checklist (Vercel)

- [ ] Push code to GitHub
- [ ] Create Vercel project
- [ ] Link GitHub repository
- [ ] Add environment variables in Vercel
- [ ] Deploy
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Update Supabase allowed URLs
- [ ] Test production deployment
- [ ] Set up custom domain (optional)
- [ ] Enable Analytics (optional)

### Monitoring & Maintenance

**Database:**

- Monitor Supabase dashboard for usage
- Check for slow queries
- Review disk usage

**Application:**

- Check Vercel logs for errors
- Monitor API response times
- Review user feedback

**Security:**

- Regularly update dependencies: `npm update`
- Monitor CVEs: `npm audit`
- Review Supabase logs for suspicious activity

### Support Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **TailwindCSS Docs**: https://tailwindcss.com/docs
- **TypeScript Docs**: https://www.typescriptlang.org/docs

### Common Code Snippets

#### Add a new field to Item schema:

```prisma
// In prisma/schema.prisma
model Item {
  // ... existing fields
  newField String?  // Add your field
}
```

Then run: `npx prisma migrate dev --name add_new_field`

#### Create a new category:

```prisma
enum Category {
  // ... existing categories
  NEW_CATEGORY
}
```

Then run: `npx prisma migrate dev --name add_new_category`

#### Add a new route protection:

```typescript
// In middleware.ts
if (request.nextUrl.pathname.startsWith("/protected-route") && !user) {
  return NextResponse.redirect("/login");
}
```

This guide should help you quickly navigate and maintain the Lost & Found application!
