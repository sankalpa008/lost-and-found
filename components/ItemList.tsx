"use client";

import { useState } from "react";
import ItemCard from "./ItemCard";

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  location: string;
  contactNumber: string;
  status: string;
  isResolved: boolean;
  createdAt: Date;
  user?: {
    name: string | null;
    email: string;
  };
}

interface ItemListProps {
  items: Item[];
  showFilters?: boolean;
}

const CATEGORIES = ["ALL", "ELECTRONICS", "BOOKS", "CLOTHING", "ACCESSORIES", "DOCUMENTS", "KEYS", "BAGS", "SPORTS", "OTHER"];

export default function ItemList({ items, showFilters = true }: ItemListProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showResolved, setShowResolved] = useState(true);

  const filteredItems = items.filter((item) => {
    const matchesSearch = search === "" || item.title.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase()) || item.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

    const matchesResolved = showResolved || !item.isResolved;

    return matchesSearch && matchesCategory && matchesStatus && matchesResolved;
  });

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <input type="text" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ALL">All</option>
                <option value="LOST">Lost</option>
                <option value="FOUND">Found</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Show resolved items</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
