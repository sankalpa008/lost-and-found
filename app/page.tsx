import { getItems } from "@/app/actions/items";
import { getCurrentUser } from "@/lib/auth";
import ItemList from "@/components/ItemList";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Plus, Search, Package, ShieldCheck, Clock } from "lucide-react";

export default async function Home() {
  const items = await getItems();
  const user = await getCurrentUser();
  const recentItems = items.slice(0, 6);

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-gray-50">
      <Navbar user={user} />

      {/* Hero Section */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">University Lost & Found</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Connect lost items with their owners. Report what you've found or search for what you've lost.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              {user ? (
                <Link href="/items/new" className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors">
                  <Plus className="w-5 h-5" />
                  Post Item
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors">
                    Get Started
                  </Link>
                  <Link href="/login" className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold border-2 border-blue-500 transition-colors">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Search</h3>
            <p className="text-gray-600">Quickly find your lost items with our advanced search and filtering system</p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Post Items</h3>
            <p className="text-gray-600">Report found items or post about what you've lost with photos and details</p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <ShieldCheck className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Platform</h3>
            <p className="text-gray-600">Verified university accounts ensure safe and reliable connections</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{items.length}</div>
              <div className="text-gray-600">Total Items</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">{items.filter((i) => i.isResolved).length}</div>
              <div className="text-gray-600">Items Reunited</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">{items.filter((i) => !i.isResolved).length}</div>
              <div className="text-gray-600">Active Listings</div>
            </div>
          </div>
        </div>

        {/* All Items Section with Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Search className="w-8 h-8 text-blue-600" />
                Browse All Items
              </h2>
              <p className="text-gray-600 mt-1">Search and filter to find what you're looking for</p>
            </div>
            {user && (
              <Link href="/items/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <Plus className="w-5 h-5" />
                Post Item
              </Link>
            )}
          </div>

          <ItemList items={items} showFilters={true} />
        </div>
      </div>
    </div>
  );
}
