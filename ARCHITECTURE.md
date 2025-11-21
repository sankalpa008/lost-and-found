# Architecture & Design Explanation

## Overview

This document explains how Next.js, Supabase, Prisma, and Server Actions work together to create a full-stack Lost & Found application with authentication, database access, image storage, and real-time UI updates.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           React Components (Client/Server)                │  │
│  │  - Pages (app/**/page.tsx)                               │  │
│  │  - Components (components/*.tsx)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Supabase Client SDK (Browser)                   │  │
│  │  - Authentication (login/signup)                          │  │
│  │  - Storage (image uploads)                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS SERVER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Middleware (middleware.ts)                │  │
│  │  - Session validation on every request                    │  │
│  │  - Route protection                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Server Components & Server Actions               │  │
│  │  - app/actions/*.ts (CRUD operations)                     │  │
│  │  - lib/auth.ts (authorization helpers)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                Prisma Client (lib/prisma.ts)              │  │
│  │  - Type-safe database queries                             │  │
│  │  - ORM abstraction layer                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ PostgreSQL Protocol
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE CLOUD                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            PostgreSQL Database                            │  │
│  │  - User table                                             │  │
│  │  - Item table                                             │  │
│  │  - auth.users (managed by Supabase)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase Auth Service                        │  │
│  │  - User authentication                                    │  │
│  │  - Session management                                     │  │
│  │  - JWT token generation                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Supabase Storage                             │  │
│  │  - Image file storage                                     │  │
│  │  - Public URL generation                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

### 1. Authentication Flow

#### Signup Process

```
User fills signup form
    ↓
Client Component (app/signup/page.tsx)
    ↓ supabase.auth.signUp()
Supabase Auth creates user in auth.users
    ↓ Returns user object
syncUserToPrisma() Server Action
    ↓ prisma.user.create()
User record created in custom User table
    ↓
Session cookie set (HTTP-only)
    ↓
User redirected to /dashboard
```

**Why this approach?**

- Supabase handles password hashing, email verification, and session management
- Prisma stores additional user data (name, role) and relationships (items)
- Two-table approach allows extending user data without modifying Supabase auth

#### Login Process

```
User enters credentials
    ↓
Client Component (app/login/page.tsx)
    ↓ supabase.auth.signInWithPassword()
Supabase Auth validates credentials
    ↓ Returns session
Session cookie set automatically
    ↓ Middleware validates on next request
User redirected to /dashboard
```

#### Session Validation (Every Request)

```
Browser makes request
    ↓
Middleware (middleware.ts)
    ↓ updateSession()
Supabase SSR helper validates session
    ↓ Checks JWT token in cookie
If invalid/missing: Redirect to /login
If valid: Continue to page
    ↓
Server Component
    ↓ getCurrentUser()
Fetch user from Prisma by supabaseId
    ↓
Render page with user data
```

### 2. Data Access Pattern (CRUD Operations)

#### Creating an Item (with Image)

```
1. CLIENT SIDE (components/ItemForm.tsx)
   User fills form + selects image
        ↓
   uploadImage(file) → Supabase Storage
        ↓
   Returns: https://xxx.supabase.co/storage/v1/.../image.jpg
        ↓
   Form submitted with imageUrl

2. SERVER SIDE (app/actions/items.ts)
   createItem(formData) Server Action called
        ↓
   requireAuth() - Verify user logged in
        ↓
   Extract form data (title, description, etc.)
        ↓
   prisma.item.create({
     data: { ...itemData, userId: user.id }
   })
        ↓
   PostgreSQL INSERT executed
        ↓
   revalidatePath('/') - Clear Next.js cache
        ↓
   Return { success: true, item }

3. CLIENT UPDATE
   Form receives response
        ↓
   router.push('/dashboard')
        ↓
   Page re-renders with new data
```

**Key Concepts:**

- **Server Actions**: Functions that run on server but can be called from client
- **Form Data**: Natural way to submit data from HTML forms
- **Type Safety**: Prisma ensures correct data types
- **Cache Invalidation**: revalidatePath() ensures fresh data

#### Reading Items (Homepage)

```
1. SERVER SIDE (app/page.tsx)
   async function Home() {
     const items = await getItems()  // Server Action
        ↓
     const user = await getCurrentUser()
        ↓
     return <ItemList items={items} />  // Props passed to client
   }

2. SERVER ACTION (app/actions/items.ts)
   async function getItems(filters?) {
     const items = await prisma.item.findMany({
       where: { ...filters },
       include: { user: true }  // Join with User table
     })
        ↓
     return items
   }

3. CLIENT COMPONENT (components/ItemList.tsx)
   Receives items as props
        ↓
   Client-side filtering/search (optional)
        ↓
   Renders ItemCard for each item
```

**Benefits:**

- Server Components fetch data on server (faster, secure)
- Data passed to client as props (no extra API calls)
- Client components handle interactivity (search, filters)

#### Updating an Item

```
User clicks Edit → /items/[id]/edit
    ↓
Server Component fetches item
    ↓ getItemById(id)
Prisma query with authorization check
    ↓
Render ItemForm with initialData
    ↓
User modifies form → submits
    ↓ updateItem(id, formData)
Server Action validates ownership
    ↓ prisma.item.update()
Database updated
    ↓ revalidatePath()
Cache cleared → fresh data shown
```

#### Deleting an Item

```
User clicks Delete button
    ↓
Client confirms (window.confirm)
    ↓ deleteItem(itemId)
Server Action checks ownership/admin
    ↓ prisma.item.delete()
Cascading delete handled by Prisma
    ↓ revalidatePath()
User redirected → item gone
```

### 3. Authorization Flow

#### Role-Based Access Control (RBAC)

```typescript
// lib/auth.ts
export async function requireAuth() {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get user from Prisma with role
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });

  return dbUser; // Has role: 'STUDENT' | 'ADMIN'
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}
```

**Usage in Server Actions:**

```typescript
// Student can only edit their own items
export async function updateItem(itemId: string, formData: FormData) {
  const user = await requireAuth(); // Must be logged in

  const item = await prisma.item.findUnique({ where: { id: itemId } });

  // Authorization check
  if (item.userId !== user.id && user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  // Proceed with update...
}
```

**Route Protection:**

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()

  // Public routes: /, /login, /signup
  // Protected routes: /dashboard, /items/new, /admin

  if (!user && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect('/login')
  }

  return response
}
```

### 4. Image Storage Flow

#### Upload Process

```
1. User selects file in <input type="file" />
   ↓
2. Client Component (ItemForm)
   const handleImageChange = (e) => {
     const file = e.target.files[0]
     setImageFile(file)
     // Show preview
   }
   ↓
3. Form Submit
   if (imageFile) {
     const imageUrl = await uploadImage(imageFile)
     formData.set('imageUrl', imageUrl)
   }
   ↓
4. lib/storage.ts - uploadImage()
   const fileName = `${Math.random()}-${Date.now()}.jpg`
   ↓
   await supabase.storage
     .from('lost-and-found-images')
     .upload(fileName, file)
   ↓
   const publicUrl = supabase.storage
     .from('lost-and-found-images')
     .getPublicUrl(fileName)
   ↓
   return publicUrl  // e.g., https://xxx.supabase.co/storage/v1/...
   ↓
5. Save URL in database via Prisma
   prisma.item.create({
     data: { imageUrl: publicUrl, ...otherData }
   })
```

**Security:**

- Public bucket allows reading images without auth
- RLS policies restrict uploads to authenticated users
- File validation can be added (size, type)

### 5. Real-Time UI Updates

Next.js provides several mechanisms for updating the UI:

#### Server Actions + revalidatePath

```typescript
export async function createItem(formData: FormData) {
  // ... create item in database

  revalidatePath("/"); // Clear cache for homepage
  revalidatePath("/dashboard"); // Clear cache for dashboard

  return { success: true };
}
```

- `revalidatePath()` tells Next.js to refetch data for those routes
- On next render, Server Components re-run and fetch fresh data
- No manual API calls needed

#### router.refresh()

```typescript
// Client component
const router = useRouter();

const handleDelete = async () => {
  await deleteItem(itemId);
  router.refresh(); // Re-run Server Components on current page
};
```

#### Optimistic Updates (Optional)

```typescript
// For instant feedback before server confirms
const [items, setItems] = useState(initialItems);

const handleCreate = async (newItem) => {
  setItems([newItem, ...items]); // Optimistic update

  const result = await createItem(newItem);

  if (!result.success) {
    setItems(items); // Rollback on error
  }
};
```

## Data Flow Examples

### Example 1: Student Posts a Lost Item

```
1. Student navigates to /items/new
2. Server checks auth (middleware)
3. Page renders ItemForm (client component)
4. Student fills form:
   - Title: "Black Backpack"
   - Description: "Lost near library"
   - Category: BAGS
   - Location: "Library 2nd Floor"
   - Contact: "+1234567890"
   - Status: LOST
   - Image: backpack.jpg
5. Student clicks upload image
   → uploadImage() → Supabase Storage
   → Returns: https://xxx.supabase.co/storage/.../abc123.jpg
6. Student submits form
   → createItem(formData) Server Action
   → requireAuth() validates student is logged in
   → Extracts data from formData
   → prisma.item.create({
        title: "Black Backpack",
        description: "Lost near library",
        category: "BAGS",
        location: "Library 2nd Floor",
        contactNumber: "+1234567890",
        status: "LOST",
        imageUrl: "https://xxx.supabase.co/storage/.../abc123.jpg",
        userId: student.id
      })
   → Database INSERT executed
   → revalidatePath('/') and revalidatePath('/dashboard')
   → Returns { success: true, item: {...} }
7. Client receives success
   → router.push('/dashboard')
   → Dashboard re-renders with new item included
```

### Example 2: Public User Searches for Items

```
1. User visits homepage (no login required)
2. Server Component (app/page.tsx) runs
   → const items = await getItems()
   → Prisma query: SELECT * FROM Item ORDER BY createdAt DESC
   → Returns array of items with user info
3. ItemList component receives items as props
4. User types "laptop" in search box
   → Client-side filter (no server request)
   → filteredItems = items.filter(item =>
        item.title.includes('laptop') ||
        item.description.includes('laptop')
      )
5. ItemList re-renders showing only matching items
6. User clicks on item
   → Navigate to /items/[id]
   → Server fetches single item
   → ItemDetail component shows full details
```

### Example 3: Admin Deletes a Student

```
1. Admin logs in → role: 'ADMIN'
2. Navigates to /admin/users
3. Server Component runs
   → await requireAdmin()  // Validates ADMIN role
   → const users = await getAllUsers()
   → Prisma query with item counts
4. UserManagement component renders table
5. Admin clicks delete on student "John Doe"
   → Confirmation dialog
   → deleteUser(userId) Server Action
   → requireAdmin() validates
   → prisma.user.delete({ where: { id: userId } })
   → Cascading delete removes all John's items
   → Also calls supabaseAdmin.auth.admin.deleteUser()
   → revalidatePath('/admin/users')
   → Returns { success: true }
6. router.refresh()
7. Page re-renders without John in the list
```

## Best Practices Implemented

### 1. Separation of Concerns

- **Client Components**: Handle user input, interactivity
- **Server Components**: Fetch data, initial rendering
- **Server Actions**: Mutations, authorization
- **Middleware**: Authentication, routing

### 2. Security

- Never expose service role key to client
- Always validate auth on server
- Check ownership before mutations
- Use Prisma to prevent SQL injection
- HTTP-only cookies for sessions

### 3. Performance

- Server Components reduce client JS bundle
- Static rendering where possible
- Image optimization with Next.js Image
- Database indexes on frequently queried fields
- Connection pooling with Prisma

### 4. Developer Experience

- Type safety with TypeScript + Prisma
- Auto-generated Prisma types
- Declarative routing with App Router
- Hot reload in development
- Clear error messages

## Common Patterns

### Pattern: Protected Server Action

```typescript
export async function protectedAction(data: any) {
  const user = await requireAuth(); // Throws if not logged in

  // Now safe to proceed with user.id
  await prisma.item.create({
    data: { ...data, userId: user.id },
  });
}
```

### Pattern: Conditional Rendering by Role

```typescript
// Server Component
async function Page() {
  const user = await getCurrentUser();

  return (
    <>
      {user?.role === "ADMIN" && <AdminPanel />}
      {user?.role === "STUDENT" && <StudentPanel />}
    </>
  );
}
```

### Pattern: Form with Server Action

```tsx
// Client Component
<form action={createItem}>
  <input name="title" />
  <button type="submit">Create</button>
</form>;

// Server Action
export async function createItem(formData: FormData) {
  const title = formData.get("title");
  // ... process and save
}
```

## Conclusion

This architecture leverages the strengths of each technology:

- **Next.js**: Full-stack framework with optimal rendering strategies
- **Supabase**: Managed auth, database, and storage with minimal setup
- **Prisma**: Type-safe ORM with excellent DX
- **Server Actions**: Seamless client-server communication

The result is a modern, secure, and maintainable web application with clear separation of concerns and excellent performance.
