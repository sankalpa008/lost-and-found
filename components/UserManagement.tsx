"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Trash2, UserPlus } from "lucide-react";
import { deleteUser, createStudentUser } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  _count: {
    items: number;
  };
}

interface UserManagementProps {
  users: User[];
}

export default function UserManagement({ users }: UserManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This will also delete all their items.`)) {
      return;
    }

    setLoading(true);
    const result = await deleteUser(userId);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const result = await createStudentUser(email, password, name);

    if (result.success) {
      setShowAddForm(false);
      router.refresh();
      // Reset form
      e.currentTarget.reset();
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600">Total users: {users.length}</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <UserPlus className="w-5 h-5" />
          Add Student
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Student</h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input type="text" id="name" name="name" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input type="email" id="email" name="email" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input type="password" id="password" name="password" required minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                {loading ? "Adding..." : "Add Student"}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Posted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name || "No name"}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}`}>{user.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user._count.items}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(user.createdAt), "MMM d, yyyy")}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {user.role !== "ADMIN" && (
                    <button onClick={() => handleDeleteUser(user.id, user.name || user.email)} disabled={loading} className="text-red-600 hover:text-red-900 disabled:opacity-50">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
