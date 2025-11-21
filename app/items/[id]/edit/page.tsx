import { getItemById } from "@/app/actions/items";
import { requireAuth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import ItemForm from "@/components/ItemForm";
import { notFound, redirect } from "next/navigation";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAuth();
  const item = await getItemById(id);

  if (!item) {
    notFound();
  }

  // Check if user owns the item or is admin
  if (item.userId !== user.id && user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Item</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <ItemForm
            mode="edit"
            initialData={{
              id: item.id,
              title: item.title,
              description: item.description,
              category: item.category,
              location: item.location,
              contactNumber: item.contactNumber,
              status: item.status,
              imageUrl: item.imageUrl,
            }}
          />
        </div>
      </div>
    </div>
  );
}
