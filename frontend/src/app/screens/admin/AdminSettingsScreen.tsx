import React from 'react';
import { Settings, Shield, Bell, Database, Lock } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function AdminSettingsScreen() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin System Settings</h1>
        <p className="text-xs text-gray-500 mt-1">Configure supermarket app parameters, notifications, and security policies</p>
      </div>

      <Card className="p-6 rounded-2xl border border-gray-200/80 bg-white space-y-4">
        <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
          <Shield className="w-5 h-5 text-orange-500" />
          <span>Security &amp; Access Controls</span>
        </h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <p className="font-bold text-gray-900">Enforce Backend JWT Role Validation</p>
              <p className="text-gray-400">All admin API routes require valid JWT with Role='Admin' claim</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px]">ENABLED</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <div>
              <p className="font-bold text-gray-900">Mask Sensitive Credentials</p>
              <p className="text-gray-400">Passwords and secret tokens are never sent to frontend admin views</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px]">ENFORCED</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
