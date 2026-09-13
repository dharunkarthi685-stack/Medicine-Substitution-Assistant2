import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  FileSpreadsheet,
  Package,
  FileCheck2,
  Users,
  BarChart3,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';

export default function AdminLayout() {
  const adminLinks = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Medicines Inventory', path: '/admin/medicines', icon: Pill },
    { name: 'Bulk CSV Import', path: '/admin/csv-import', icon: FileSpreadsheet },
    { name: 'Order Management', path: '/admin/orders', icon: Package },
    { name: 'Prescription Verification', path: '/admin/prescriptions', icon: FileCheck2 },
    { name: 'User Accounts', path: '/admin/users', icon: Users },
    { name: 'Deep Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Admin Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 text-white shadow-md mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Administration Portal
            </div>
            <div className="text-base font-extrabold text-white">
              Healthcare Operations & Inventory Management
            </div>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Public Portal</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Admin Sidebar Nav */}
        <aside className="lg:col-span-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-2 sticky top-24">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Admin Navigation
          </div>
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </aside>

        {/* Right Main Admin View */}
        <main className="lg:col-span-9 min-h-[500px]">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
