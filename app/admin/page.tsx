import { requireAdmin } from "@/lib/auth";
import { getAllUsers } from "@/app/actions/admin";
import { getItems } from "@/app/actions/items";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Users, Package } from "lucide-react";

// Helper function to calculate recent activity - run once during render
function calculateRecentActivity(items: Array<{ createdAt: Date; updatedAt: Date; isResolved: boolean }>) {
  "use cache";
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentItemsCount = items.filter((i) => new Date(i.createdAt) > oneDayAgo).length;
  const recentResolvedCount = items.filter((i) => new Date(i.updatedAt) > oneDayAgo && i.isResolved).length;
  return { recentItemsCount, recentResolvedCount };
}

export default async function AdminPage() {
  const user = await requireAdmin();
  const users = await getAllUsers();
  const items = await getItems();

  const studentCount = users.filter((u) => u.role === "STUDENT").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const resolvedItems = items.filter((item) => item.isResolved).length;
  const activeItems = items.filter((item) => !item.isResolved).length;

  // Calculate recent activity counts
  const { recentItemsCount, recentResolvedCount } = calculateRecentActivity(items);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users and monitor system activity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Total Users</p>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{users.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              {studentCount} students, {adminCount} admins
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Total Items</p>
              <Package className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{items.length}</p>
            <p className="text-xs text-gray-500 mt-1">All posted items</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Active Items</p>
              <Package className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeItems}</p>
            <p className="text-xs text-gray-500 mt-1">Pending resolution</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 font-medium">Resolved Items</p>
              <Package className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{resolvedItems}</p>
            <p className="text-xs text-gray-500 mt-1">Successfully resolved</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <Link href="/admin/users" className="block w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center">
                Manage Users
              </Link>
              <Link href="/admin/items" className="block w-full px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-center">
                Manage All Items
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">• {recentItemsCount} items posted in the last 24 hours</p>
              <p className="text-sm text-gray-600">• {recentResolvedCount} items resolved in the last 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
