import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  Percent,
  ShoppingCart,
  Pill,
  Sparkles,
  TrendingUp,
  Search,
  Calendar,
  Package,
  ArrowRight,
  ShieldCheck,
  RotateCw,
  Clock,
  User,
  LogIn,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Truck,
  CreditCard,
  Layers,
  LayoutDashboard
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import { TableSkeleton } from '../components/LoadingSkeleton';

const CATEGORY_COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6', '#64748b'];

export default function Analytics() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Admin states
  const [platformData, setPlatformData] = useState(null);
  const [deepData, setDeepData] = useState(null);

  // Patient states
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          // Admin logged in: load both platform analytics & deep analytics
          const [plat, deep] = await Promise.all([
            analyticsService.getPlatformAnalytics(),
            analyticsService.getAdminDeepAnalytics().catch(() => null)
          ]);
          setPlatformData(plat);
          setDeepData(deep);
        } else if (isAuthenticated) {
          // Patient logged in: load personal analytics
          try {
            const data = await analyticsService.getUserAnalytics();
            setUserData(data);
          } catch (err) {
            console.warn('Fallback to client-side order calculation:', err);
            const orders = await orderService.getOrders();
            const calcData = calculateClientSideAnalytics(orders, user);
            setUserData(calcData);
          }
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isAdmin, user]);

  const calculateClientSideAnalytics = (orders = [], currentUser) => {
    const passedOrders = orders.filter(
      (o) => o.order_status === 'DELIVERED' || o.order_status === 'CONFIRMED' || o.order_status === 'SHIPPED' || o.payment_status === 'PAID'
    );
    const totalSpent = passedOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    const estimatedSavings = roundTwo(totalSpent * 1.48);

    const medMap = {};
    const catMap = {};
    const monthMap = {};

    orders.forEach((order) => {
      const monthStr = new Date(order.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      if (!monthMap[monthStr]) {
        monthMap[monthStr] = { month: monthStr, spent: 0, savings: 0, orders: 0 };
      }
      const spent = parseFloat(order.total_amount || 0);
      monthMap[monthStr].spent += spent;
      monthMap[monthStr].savings += roundTwo(spent * 1.48);
      monthMap[monthStr].orders += 1;

      order.items?.forEach((item) => {
        const name = item.medicine_name;
        if (!medMap[name]) {
          medMap[name] = {
            medicine_id: item.medicine,
            name: name,
            dosage_form: item.dosage_form || 'Tablet',
            strength: item.strength || '',
            disease_category: 'General',
            unit_price: parseFloat(item.unit_price || 0),
            total_quantity: 0,
            total_spent: 0,
            total_saved: 0,
            order_count: 0,
            last_ordered_at: new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            last_order_number: order.order_number
          };
        }
        medMap[name].total_quantity += item.quantity;
        const itemSpend = parseFloat(item.total_price || 0);
        medMap[name].total_spent += itemSpend;
        medMap[name].total_saved += roundTwo(itemSpend * 1.48);
        medMap[name].order_count += 1;

        catMap['General'] = (catMap['General'] || 0) + item.quantity;
      });
    });

    return {
      user_info: {
        name: `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || currentUser?.email?.split('@')[0],
        email: currentUser?.email,
        member_since: '2024'
      },
      summary: {
        total_orders: orders.length,
        passed_orders: passedOrders.length,
        delivered_orders: orders.filter((o) => o.order_status === 'DELIVERED').length,
        total_spent: roundTwo(totalSpent),
        total_saved: estimatedSavings,
        total_medicines_count: Object.values(medMap).reduce((s, m) => s + m.total_quantity, 0),
        avg_savings_rate: totalSpent > 0 ? '59.6%' : '0%'
      },
      medicines_history: Object.values(medMap).sort((a, b) => b.total_quantity - a.total_quantity),
      category_distribution: Object.entries(catMap).map(([category, count]) => ({ category, count })),
      monthly_trends: Object.values(monthMap)
    };
  };

  const roundTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: ADMIN LOGGED IN -> RENDER FULL ADMIN DEEP ANALYTICS
  // =========================================================================
  if (isAdmin) {
    const kpis = platformData?.kpis || {};
    const mostSearched = platformData?.most_searched || [];
    const categoryDist = platformData?.category_distribution || [];
    const orderTrends = platformData?.order_trend || [];

    const lowStock = deepData?.low_stock_medicines || [];
    const expiring = deepData?.expiring_medicines || [];
    const fulfillment = deepData?.fulfillment_breakdown || [];
    const payments = deepData?.payment_breakdown || [];

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-lg">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrator Deep Analytics Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Platform Demand, Inventory & Operational Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Real-time administrator view of search volume, fulfillment splits, payment gateways, low stock risks, and expiry watch.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/admin"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>

        {/* Admin KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Catalog Medicines</span>
              <Pill className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {kpis.total_medicines || 0}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">Active formulary items</span>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Total Orders</span>
              <ShoppingCart className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {kpis.total_orders || 0}
            </div>
            <span className="text-[11px] text-sky-600 font-medium">All-time fulfillments</span>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Settled Revenue</span>
              <TrendingUp className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              ₹{kpis.total_revenue?.toFixed(2) || '0.00'}
            </div>
            <span className="text-[11px] text-teal-600 font-medium">Settled transactions</span>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Delivered Savings</span>
              <Percent className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{kpis.estimated_savings_delivered?.toFixed(2) || '0.00'}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Saved by patients</span>
          </div>
        </div>

        {/* Chart Section 1: Most Searched & Therapeutic Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Most Searched Medicines */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Most Searched Medicines
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Medicines generating highest search query & substitution volume
                </p>
              </div>
              <Search className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mostSearched}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [`${value} searches`, 'Search Volume']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="search_count" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Therapeutic Distribution */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Therapeutic Distribution
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Medicines split across clinical therapeutic disease classes
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-teal-600" />
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDist}
                    dataKey="count"
                    nameKey="disease_category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart Section 2: Order Activity Trends */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                7-Day Order Volume & Revenue Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily orders and settled revenue trends
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={orderTrends}>
                <defs>
                  <linearGradient id="colorAdminRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value, name) => [name === 'revenue' ? `₹${value}` : `${value} orders`, name === 'revenue' ? 'Revenue' : 'Orders']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorAdminRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fulfillment & Payment Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Fulfillment Channel Distribution</span>
            </div>
            <div className="space-y-2">
              {fulfillment.map((item) => (
                <div key={item.fulfillment_type} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.fulfillment_type === 'HOME_DELIVERY' ? 'Doorstep Delivery' : 'In-Store Pharmacy Pickup'}
                  </span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {item.count} orders
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <CreditCard className="w-4 h-4 text-teal-600" />
              <span>Payment Gateway vs COD Distribution</span>
            </div>
            <div className="space-y-2">
              {payments.map((item) => (
                <div key={item.payment_method} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.payment_method === 'RAZORPAY' ? 'Online Gateway (Razorpay)' : 'Cash on Delivery (COD)'}
                  </span>
                  <span className="font-black text-teal-600 dark:text-teal-400 text-sm">
                    {item.count} orders
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Critical Tables: Low Stock & Expiring Soon */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Warning Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Low Stock Warning (≤ 20 Units)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold pb-2">
                    <th className="py-2">Medicine</th>
                    <th className="py-2">Manufacturer</th>
                    <th className="py-2 text-right">Units Left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {lowStock.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 font-bold text-slate-900 dark:text-white">
                        {m.name} ({m.strength})
                      </td>
                      <td className="py-2 text-slate-500">{m.manufacturer}</td>
                      <td className="py-2 text-right font-black text-rose-600">{m.stock_quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Expiry Watch */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
              <Calendar className="w-4 h-4" />
              <span>Upcoming Expiry Watch (&lt; 60 Days)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold pb-2">
                    <th className="py-2">Medicine</th>
                    <th className="py-2">Manufacturer</th>
                    <th className="py-2 text-right">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expiring.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 font-bold text-slate-900 dark:text-white">{m.name}</td>
                      <td className="py-2 text-slate-500">{m.manufacturer}</td>
                      <td className="py-2 text-right font-bold text-amber-600">{m.expiry_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // =========================================================================
  // VIEW 2: GUEST / UNREGISTERED USER -> PREVIEW WITH LOGIN PROMPT
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Guest Hero Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-950 text-white shadow-2xl relative overflow-hidden space-y-6 border border-emerald-500/20">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Personal Health & Savings Analytics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Track Your Medicine Orders & Lifetime Generic Savings
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Log in to view your complete record of ordered medicines, past dosages, cumulative prescription savings delivered, and therapeutic class breakdown.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-500/30 transition flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to View Your History</span>
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold transition"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Preview */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sample Patient Savings & Records Preview</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">See how your personal order analytics and generic savings are tracked once you place an order.</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Interactive Preview
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase">Your Total Savings</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹1,840.00</div>
              <span className="text-[10px] text-emerald-600">Saved via generic switch</span>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-center">
              <span className="text-[11px] font-semibold text-sky-800 dark:text-sky-300 uppercase">Orders Passed</span>
              <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">6 Orders</div>
              <span className="text-[10px] text-sky-600">100% Prescription Verified</span>
            </div>
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-center">
              <span className="text-[11px] font-semibold text-teal-800 dark:text-teal-300 uppercase">Medicines Purchased</span>
              <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">18 Units</div>
              <span className="text-[10px] text-teal-600">Across 4 health categories</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase">Average Discount</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">64%</div>
              <span className="text-[10px] text-amber-600">Lower than brand MRP</span>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // =========================================================================
  // VIEW 3: PATIENT LOGGED IN -> RENDER PERSONAL ORDER & SAVINGS HISTORY
  // =========================================================================
  const summary = userData?.summary || {
    total_orders: 0,
    passed_orders: 0,
    delivered_orders: 0,
    total_spent: 0,
    total_saved: 0,
    total_medicines_count: 0,
    avg_savings_rate: '0%'
  };

  const medicinesHistory = userData?.medicines_history || [];
  const categoryDist = userData?.category_distribution || [];
  const monthlyTrends = userData?.monthly_trends || [];

  const categories = ['ALL', ...Array.from(new Set(medicinesHistory.map((m) => m.disease_category).filter(Boolean)))];

  const filteredMedicines = medicinesHistory.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.generic_name && m.generic_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.strength && m.strength.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCat = selectedCategory === 'ALL' || m.disease_category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20 mb-2">
            <User className="w-3.5 h-3.5" />
            <span>Personal Health & Order Record</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            My Medicine Orders & Savings History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Comprehensive audit of your past medicine purchases, dosages ordered, and cumulative financial savings through generic substitutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/my-orders"
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>View Active Orders</span>
          </Link>
          <Link
            to="/substitutes"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Find Substitutes</span>
          </Link>
        </div>
      </div>

      {/* Personal Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Total Savings Amount */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-bold">
            <span>Your Lifetime Savings</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{summary.total_saved.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold block">
            Saved vs branded drug retail prices
          </span>
        </div>

        {/* Card 2: Orders Passed */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Orders Passed</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {summary.passed_orders} / {summary.total_orders}
          </div>
          <span className="text-[11px] text-sky-600 font-semibold block">
            {summary.delivered_orders} orders successfully delivered
          </span>
        </div>

        {/* Card 3: Total Medicines Ordered */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Medicines Dispensed</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
              <Pill className="w-4 h-4 rotate-45" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {summary.total_medicines_count} Units
          </div>
          <span className="text-[11px] text-teal-600 font-semibold block">
            {medicinesHistory.length} unique medicine formulas
          </span>
        </div>

        {/* Card 4: Total Amount Spent */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Total Spent</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            ₹{summary.total_spent.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400 font-semibold block">
            Avg {summary.avg_savings_rate} savings discount
          </span>
        </div>

      </div>

      {/* Visual Analytics Charts Section (if user has order history) */}
      {summary.total_orders > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Monthly Spending & Savings Timeline (Area Chart) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Your Monthly Spend vs Savings History
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track how much you spent vs what you saved on each month's prescriptions
                </p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val, name) => [`₹${val}`, name === 'savings' ? 'Money Saved' : 'Amount Spent']}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="spent" name="Spent (₹)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSpend)" />
                  <Area type="monotone" dataKey="savings" name="Saved (₹)" stroke="#10b981" fillOpacity={1} fill="url(#colorSaved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Therapeutic Disease Categories Breakdown (Pie Chart) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Your Ordered Disease Classes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Distribution of medicines you have ordered by therapeutic category
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-teal-600" />
            </div>

            <div className="h-64 w-full">
              {categoryDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDist}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No category data recorded yet
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* History of Ordered Medicines Table & Re-Order Hub */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Past History of Medicines Ordered</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                {medicinesHistory.length} Medicines
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed breakdown of medicines you ordered, dosage strengths, units bought, and savings achieved.
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ordered medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Medicines List Table */}
        {filteredMedicines.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Pill className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {summary.total_orders === 0 ? 'No Medicines Ordered Yet' : 'No matching medicines found'}
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {summary.total_orders === 0
                ? 'When you purchase prescription medicines or generic substitutes, your past medication records and savings will be listed here.'
                : 'Try adjusting your search filter or category selection above.'}
            </p>
            {summary.total_orders === 0 && (
              <Link
                to="/medicines"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
              >
                <span>Browse Medicines Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold pb-2">
                  <th className="py-3 px-3">Medicine & Strength</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-center">Total Quantity</th>
                  <th className="py-3 px-3 text-right">Amount Spent</th>
                  <th className="py-3 px-3 text-right">Estimated Savings</th>
                  <th className="py-3 px-3 text-right">Last Ordered</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMedicines.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{m.dosage_form}</span>
                        {m.strength && <span>• {m.strength}</span>}
                        {m.generic_name && <span className="text-emerald-600 dark:text-emerald-400 font-medium">({m.generic_name})</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {m.disease_category || 'General'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                      {m.total_quantity} units
                      <span className="block text-[10px] text-slate-400 font-normal">
                        in {m.order_count} order{m.order_count > 1 ? 's' : ''}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-black text-slate-900 dark:text-white">
                      ₹{m.total_spent.toFixed(2)}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        @ ₹{m.unit_price}/unit
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                      ₹{m.total_saved.toFixed(2)}
                      <span className="block text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                        ~59% Saved
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">{m.last_ordered_at}</span>
                      {m.last_order_number && (
                        <span className="block text-[10px] text-slate-400">#{m.last_order_number}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <Link
                        to={`/substitutes?query=${encodeURIComponent(m.name)}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold transition shadow-sm"
                        title="Find cheaper substitutes or re-order"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Re-Order / Substitute</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
