"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { MapPin, Phone, Mail, Calendar, Edit, Trash2, CheckCircle } from "lucide-react";
import { deleteItem, markItemAsResolved } from "@/app/actions/items";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ItemDetailProps {
  item: {
    id: string;
    title: string;
    description: string;
    category: string;
    imageUrl?: string | null;
    location: string;
    contactNumber: string;
    status: string;
    isResolved: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
      name: string | null;
      email: string;
    };
  };
  currentUser?: {
    id: string;
    role: string;
  } | null;
}

export default function ItemDetail({ item, currentUser }: ItemDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isOwner = currentUser?.id === item.userId;
  const isAdmin = currentUser?.role === "ADMIN";
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    setLoading(true);
    const result = await deleteItem(item.id);
    if (result.success) {
      router.push("/");
    } else {
      alert(result.error);
      setLoading(false);
    }
  };

  const handleToggleResolved = async () => {
    setLoading(true);
    const result = await markItemAsResolved(item.id, !item.isResolved);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-96 bg-gray-200">
        {item.imageUrl ? <Image src={item.imageUrl} alt={item.title} fill className="object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400 text-xl">No Image Available</div>}
        <div className="absolute top-4 right-4 flex gap-2">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${item.status === "LOST" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>{item.status}</span>
          {item.isResolved && <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-500 text-white">Resolved</span>}
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">{item.category}</span>
          </div>

          {canEdit && (
            <div className="flex gap-2">
              {isOwner && (
                <button onClick={handleToggleResolved} disabled={loading} className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" />
                  {item.isResolved ? "Mark Unresolved" : "Mark Resolved"}
                </button>
              )}
              <Link href={`/items/${item.id}/edit`} className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700">
                <Edit className="w-4 h-4" />
                Edit
              </Link>
              {canDelete && (
                <button onClick={handleDelete} disabled={loading} className="flex items-center gap-1 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-b border-gray-200 py-4 my-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{item.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Contact Number</p>
              <p className="font-medium">{item.contactNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Mail className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Posted by</p>
              <p className="font-medium">{item.user.name || item.user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Posted on</p>
              <p className="font-medium">{format(new Date(item.createdAt), "PPP")}</p>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">Last updated: {format(new Date(item.updatedAt), "PPp")}</div>
      </div>
    </div>
  );
}
