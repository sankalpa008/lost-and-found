import { requireAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import ItemForm from "@/components/ItemForm";

export default async function NewItemPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Post New Item</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <ItemForm mode="create" />
        </div>
      </div>
    </div>
  );
}
