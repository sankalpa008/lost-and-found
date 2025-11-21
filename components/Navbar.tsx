"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { Home, LayoutDashboard, LogOut, Shield } from "lucide-react";

interface NavbarProps {
  user?: {
    name: string | null;
    email: string;
    role: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-blue-600">University Lost & Found</span>
            </Link>

            <div className="ml-10 flex items-center gap-4">
              <Link href="/" className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium ${pathname === "/" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}>
                <Home className="w-4 h-4" />
                Home
              </Link>

              {user && (
                <Link href="/dashboard" className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium ${pathname === "/dashboard" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}

              {user?.role === "ADMIN" && (
                <Link href="/admin" className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium ${pathname === "/admin" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}>
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-sm">
                  <p className="font-medium text-gray-700">{user.name || "User"}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <button onClick={handleSignOut} className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
