import React, { useEffect, useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { productsApi } from '../../../lib/api';

export default function AdminCategoriesScreen() {
  const [categories, setCategories] = useState<{ id: number; name: string; icon: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.categories().then((res) => {
      if (res.data) setCategories(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Product Categories</h1>
          <p className="text-xs text-gray-500 mt-1">Manage grocery store product departments & icons</p>
        </div>
      </div>

      <Card className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs text-gray-600">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-gray-700 font-extrabold uppercase text-[11px]">
              <th className="py-3 px-4">Icon</th>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-lg">{c.icon}</td>
                <td className="py-3 px-4 font-bold text-gray-900">{c.name}</td>
                <td className="py-3 px-4 font-mono text-gray-400">#{c.id}</td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px] uppercase">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
