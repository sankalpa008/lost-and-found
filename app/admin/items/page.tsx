import { requireAdmin } from "@/lib/auth";
import { getItems } from "@/app/actions/items";
import Navbar from "@/components/Navbar";
import ItemList from "@/components/ItemList";

export default async function AdminItemsPage() {
  const user = await requireAdmin();
  const items = await getItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Items</h1>
          <p className="text-gray-600 mt-1">Manage all lost and found items in the system</p>
        </div>

        <ItemList items={items} showFilters={true} />
      </div>
    </div>
  );
}
