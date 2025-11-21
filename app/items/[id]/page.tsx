import { getItemById } from "@/app/actions/items";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import ItemDetail from "@/components/ItemDetail";
import { notFound } from "next/navigation";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItemById(id);
  const user = await getCurrentUser();

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ItemDetail item={item} currentUser={user} />
      </div>
    </div>
  );
}
