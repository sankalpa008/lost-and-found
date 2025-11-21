import { requireAdmin } from "@/lib/auth";
import { getAllUsers } from "@/app/actions/admin";
import Navbar from "@/components/Navbar";
import UserManagement from "@/components/UserManagement";

export default async function AdminUsersPage() {
  const currentUser = await requireAdmin();
  const users = await getAllUsers();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={currentUser} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>
        <UserManagement users={users} />
      </div>
    </div>
  );
}
