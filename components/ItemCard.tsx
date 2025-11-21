import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { MapPin } from "lucide-react";

interface ItemCardProps {
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

export default function ItemCard({ id, title, description, category, imageUrl, location, status, isResolved, createdAt, user }: ItemCardProps) {
  return (
    <Link href={`/items/${id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 bg-gray-200">
          {imageUrl ? <Image src={imageUrl} alt={title} fill className="object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400">No Image</div>}
          <div className="absolute top-2 right-2 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status === "LOST" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>{status}</span>
            {isResolved && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">Resolved</span>}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{title}</h3>
            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{format(new Date(createdAt), "MMM d, yyyy")}</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">{category}</span>
            {user && <span className="text-xs text-gray-500">by {user.name || user.email}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
