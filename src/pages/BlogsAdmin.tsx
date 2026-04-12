import { useEffect, useState } from 'react';
import { blogsAdminService, BlogAdminItem } from '../services/blogsService';
import { Edit2, Plus, Trash2 } from 'lucide-react';

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string;
  coverImage: string;
  isPublished: boolean;
};

const emptyForm: BlogForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  author: 'LegalPadhai Editorial',
  tags: '',
  coverImage: '',
  isPublished: true,
};

export function BlogsAdmin() {
  const [items, setItems] = useState<BlogAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const res = await blogsAdminService.list(1, 50);
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      slug: form.slug || undefined,
      excerpt: form.excerpt,
      content: form.content,
      author: form.author,
      coverImage: form.coverImage || undefined,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      isPublished: form.isPublished,
    };

    if (editingId) {
      await blogsAdminService.update(editingId, payload);
    } else {
      await blogsAdminService.create(payload);
    }

    setEditingId(null);
    setForm(emptyForm);
    await load();
  };

  const onEdit = (item: BlogAdminItem) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      content: item.content,
      author: item.author || 'LegalPadhai Editorial',
      tags: (item.tags || []).join(', '),
      coverImage: item.coverImage || '',
      isPublished: !!item.isPublished,
    });
  };

  const onDelete = async (id: string) => {
    await blogsAdminService.remove(id);
    await load();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blogs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage public blog posts.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <form onSubmit={onSubmit} className="xl:col-span-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-3 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editingId ? 'Edit Blog' : 'New Blog'}</h2>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-950" />
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug (optional)" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-950" />
            <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Author" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-950" />
            <input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="Cover image URL (optional)" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-950" />
            <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Excerpt" rows={3} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-950" />
            <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Content" rows={8} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-950" />
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-950" />
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
              Published
            </label>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                <Plus className="w-4 h-4" />
                {editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="px-4 py-2 border rounded-lg">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="xl:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Blogs</h2>
            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item._id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">/{item.slug} · {item.isPublished ? 'Published' : 'Draft'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => onEdit(item)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(item._id)} className="p-2 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    {item.excerpt && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{item.excerpt}</p>}
                  </div>
                ))}
                {items.length === 0 && <div className="text-sm text-gray-500">No blogs yet.</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
