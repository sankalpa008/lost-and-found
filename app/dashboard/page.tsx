import { requireAuth } from "@/lib/auth";
import { getUserItems } from "@/app/actions/items";
import Navbar from "@/components/Navbar";
import ItemList from "@/components/ItemList";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth();
  const items = await getUserItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name || user.email}!</p>
          <div className="mt-4 flex gap-4">
            <div className="bg-blue-50 px-4 py-3 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Items</p>
              <p className="text-2xl font-bold text-blue-700">{items.length}</p>
            </div>
            <div className="bg-green-50 px-4 py-3 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Resolved</p>
              <p className="text-2xl font-bold text-green-700">{items.filter((item) => item.isResolved).length}</p>
            </div>
            <div className="bg-orange-50 px-4 py-3 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Active</p>
              <p className="text-2xl font-bold text-orange-700">{items.filter((item) => !item.isResolved).length}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Items</h2>
          <Link href="/items/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus className="w-5 h-5" />
            Post New Item
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">You haven&apos;t posted any items yet</p>
            <Link href="/items/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Plus className="w-5 h-5" />
              Post Your First Item
            </Link>
          </div>
        ) : (
          <ItemList items={items} showFilters={false} />
        )}
      </div>
    </div>
  );
}
