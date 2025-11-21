# University Lost & Found System

A full-stack web application for managing lost and found items in a university setting, built with modern web technologies.

## Features

### For Students

- 🔐 **Secure Authentication** - Email/password login and signup
- 📝 **Post Items** - Create lost or found item listings with images
- 🔍 **Search & Filter** - Find items by category, status, location, or keywords
- ✏️ **Manage Posts** - Edit, delete, and mark your items as resolved
- 📊 **Personal Dashboard** - View all your posted items in one place

### For Administrators

- 👥 **User Management** - View, add, and delete student accounts
- 🗂️ **Full Item Control** - Edit or delete any item in the system
- 📈 **System Overview** - Monitor activity and statistics
- 🛡️ **Role-Based Access** - Secure admin-only features

### General Features

- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🖼️ **Image Uploads** - Upload and display item photos
- 🏷️ **Categories** - Electronics, Books, Clothing, Accessories, Documents, Keys, Bags, Sports, Other
- 🔄 **Real-time Updates** - Instant UI updates with server actions
- 🎨 **Modern UI** - Clean, intuitive interface with TailwindCSS

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Getting Started

See [SETUP.md](./SETUP.md) for detailed installation and configuration instructions.

### Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase project and configure environment variables
4. Run database migrations: `npx prisma migrate dev`
5. Start development server: `npm run dev`

## Project Architecture

### Client-Server Interaction

The application uses Next.js Server Actions for a seamless client-server architecture:

```
User Interface (React Components)
        ↓
Next.js Server Actions
        ↓
Prisma ORM
        ↓
Supabase PostgreSQL
```

### Authentication Flow

1. User signs up/logs in via Supabase Auth
2. User data synced to Prisma database
3. Session managed via HTTP-only cookies
4. Middleware protects authenticated routes
5. Server actions verify user permissions

### Database Schema

**User Model**:

- id, email, name, role (STUDENT/ADMIN)
- supabaseId (links to Supabase Auth)
- Relationships: One-to-many with Items

**Item Model**:

- id, title, description, category, imageUrl
- location, contactNumber, status (LOST/FOUND)
- isResolved (boolean)
- userId (foreign key to User)

## Pages

- `/` - Public homepage with all items
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - Student dashboard
- `/items/new` - Create new item
- `/items/[id]` - Item detail page
- `/items/[id]/edit` - Edit item
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/items` - All items management

## Security Features

- ✅ Server-side authentication verification
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ Environment variable protection
- ✅ Image upload restrictions
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection (React)

## Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Database Commands

```bash
# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

## Environment Variables

Required environment variables (see `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Email notifications for matches
- [ ] Advanced search with ML/AI
- [ ] Mobile app (React Native)
- [ ] QR code generation for items
- [ ] Chat system between users
- [ ] Statistics and analytics dashboard
- [ ] Export reports (PDF/CSV)
- [ ] Multi-language support
- [ ] Dark mode

## License

This project is licensed under the MIT License.

## Support

For setup instructions, see [SETUP.md](./SETUP.md)

For questions or issues, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Supabase, and Prisma
