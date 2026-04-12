import { useEffect, useMemo, useState } from 'react';
import { Activity, Database, Route, ShieldCheck, RefreshCw, Users, Eye } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { adminService } from '../services/adminService';
import type { CrudCoverageItem, SystemOverviewResponse } from '../types';

const coveragePill = (value: boolean) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      value
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }`}
  >
    {value ? 'Yes' : 'No'}
  </span>
);

const PIE_COLORS = ['#2563eb', '#60a5fa', '#bfdbfe'];

export const OperationsCenter = () => {
  const [overview, setOverview] = useState<SystemOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSystemOverview();
      setOverview(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchOverview();
  }, []);

  const statCards = useMemo(() => {
    if (!overview) return [];
    return [
      { label: 'Visitors', value: overview.stats.visitors.total, icon: Eye },
      { label: 'Registered Users', value: overview.stats.users.total, icon: Users },
      { label: 'Quizzes', value: overview.stats.quizzes.total, icon: Activity },
      { label: 'PDF Documents', value: overview.stats.pdfs.total, icon: Database },
      { label: 'Audio Lessons', value: overview.stats.audioLessons.total, icon: Activity },
      { label: 'Resources', value: overview.stats.resources.total, icon: Database },
      { label: 'Blogs', value: overview.stats.blogs.total, icon: Route },
      { label: 'Chat Messages', value: overview.stats.chats.totalMessages, icon: Activity },
      { label: 'Answer Checks', value: overview.stats.answerChecks.total, icon: ShieldCheck },
    ];
  }, [overview]);

  const visitorChartData = useMemo(() => {
    if (!overview) return [];
    return [
      { name: 'Authenticated', value: overview.stats.visitors.authenticated },
      { name: 'Anonymous', value: overview.stats.visitors.anonymous },
    ];
  }, [overview]);

  const lifecycleData = useMemo(() => {
    if (!overview) return [];
    return [
      {
        name: 'Users',
        total: overview.stats.users.total,
        active: overview.stats.users.active,
      },
      {
        name: 'Quizzes',
        total: overview.stats.quizzes.total,
        active: overview.stats.quizzes.published,
      },
      {
        name: 'PDFs',
        total: overview.stats.pdfs.total,
        active: overview.stats.pdfs.active,
      },
      {
        name: 'Resources',
        total: overview.stats.resources.total,
        active: overview.stats.resources.active,
      },
      {
        name: 'Blogs',
        total: overview.stats.blogs.total,
        active: overview.stats.blogs.published,
      },
    ];
  }, [overview]);

  const healthRatios = useMemo(() => {
    if (!overview) return [];
    const safeRatio = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
    return [
      { label: 'Active Users Ratio', value: safeRatio(overview.stats.users.active, overview.stats.users.total) },
      { label: 'Verified Users Ratio', value: safeRatio(overview.stats.users.verified, overview.stats.users.total) },
      { label: 'Published Quizzes Ratio', value: safeRatio(overview.stats.quizzes.published, overview.stats.quizzes.total) },
      { label: 'Active PDFs Ratio', value: safeRatio(overview.stats.pdfs.active, overview.stats.pdfs.total) },
      { label: 'Published Blogs Ratio', value: safeRatio(overview.stats.blogs.published, overview.stats.blogs.total) },
      { label: 'Active Resources Ratio', value: safeRatio(overview.stats.resources.active, overview.stats.resources.total) },
    ];
  }, [overview]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="p-6 lg:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Operations Center</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Blue-theme analytics hub for traffic, CRUD health, and route visibility.
            </p>
          </div>
          <button
            onClick={() => void fetchOverview()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : !overview ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-sm text-gray-600 dark:text-gray-300">
            Unable to load system overview.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {statCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{item.label}</p>
                      <Icon className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{item.value.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 rounded-xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">Module Data Volume</h2>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overview.moduleVolume}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                      <XAxis dataKey="module" tick={{ fill: '#6b7280', fontSize: 12 }} interval={0} angle={-10} textAnchor="end" height={64} />
                      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">Visitor Split</h2>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={visitorChartData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={45}>
                        {visitorChartData.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Active vs Total (Lifecycle)</h2>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lifecycleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="active" stroke="#60a5fa" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">CRUD Coverage Matrix</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                      <th className="px-5 py-3">Module</th>
                      <th className="px-5 py-3">Base Path</th>
                      <th className="px-5 py-3">Create</th>
                      <th className="px-5 py-3">Read</th>
                      <th className="px-5 py-3">Update</th>
                      <th className="px-5 py-3">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.crudCoverage.map((item: CrudCoverageItem) => (
                      <tr key={item.module} className="border-b border-gray-100 dark:border-gray-800/70">
                        <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{item.module}</td>
                        <td className="px-5 py-3 text-gray-600 dark:text-gray-300">{item.basePath}</td>
                        <td className="px-5 py-3">{coveragePill(item.create)}</td>
                        <td className="px-5 py-3">{coveragePill(item.read)}</td>
                        <td className="px-5 py-3">{coveragePill(item.update)}</td>
                        <td className="px-5 py-3">{coveragePill(item.delete)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="rounded-xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Analytics Health Ratios</h3>
                <div className="space-y-3">
                  {healthRatios.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-300">{item.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-blue-100 dark:bg-gray-800">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.min(100, item.value)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900 lg:col-span-2">
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                  <Route className="w-4 h-4 text-blue-500" />
                  <h2 className="font-semibold text-gray-900 dark:text-white">API Route Coverage</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Admin APIs</h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 max-h-56 overflow-y-auto pr-1">
                      {overview.routeInventory.admin.map((path) => (
                        <li key={path} className="font-mono bg-blue-50 dark:bg-gray-800 rounded-md px-3 py-2">{path}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Public APIs</h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 max-h-56 overflow-y-auto pr-1">
                      {overview.routeInventory.publicApi.map((path) => (
                        <li key={path} className="font-mono bg-blue-50 dark:bg-gray-800 rounded-md px-3 py-2">{path}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Generated at: {new Date(overview.generatedAt).toLocaleString('en-IN')}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
