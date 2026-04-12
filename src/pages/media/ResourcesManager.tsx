import { useEffect, useState } from 'react';
import { Upload, Search, Trash2, Edit, Save, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { mediaService } from '../../services/mediaService';
import type { ResourceItem } from '../../types/media';
import { resolveApiFileUrl } from '../../lib/utils';

export const ResourcesManager = () => {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [fileType, setFileType] = useState('');
  const [isActive, setIsActive] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newTags, setNewTags] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('General');
  const [editTags, setEditTags] = useState('');
  const [editIsActive, setEditIsActive] = useState('true');
  const [editFile, setEditFile] = useState<File | null>(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await mediaService.listResources({
        page,
        limit,
        search: appliedSearch || undefined,
        fileType: (fileType || undefined) as 'pdf' | 'md' | undefined,
        isActive: isActive || undefined,
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchResources();
  }, [page, limit, fileType, isActive, appliedSearch]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setAppliedSearch(search.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const handleCreate = async () => {
    if (!newFile || !newTitle.trim()) return;
    const formData = new FormData();
    formData.append('title', newTitle.trim());
    formData.append('description', newDescription.trim());
    formData.append('category', newCategory.trim());
    formData.append('tags', newTags.trim());
    formData.append('file', newFile);
    await mediaService.createResource(formData);

    setNewTitle('');
    setNewDescription('');
    setNewCategory('General');
    setNewTags('');
    setNewFile(null);
    await fetchResources();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    await mediaService.deleteResource(id);
    await fetchResources();
  };

  const startEdit = (item: ResourceItem) => {
    setEditingId(item._id);
    setEditTitle(item.title || '');
    setEditDescription(item.description || '');
    setEditCategory(item.category || 'General');
    setEditTags((item.tags || []).join(', '));
    setEditIsActive(item.isActive ? 'true' : 'false');
    setEditFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFile(null);
  };

  const handleUpdate = async (id: string) => {
    const formData = new FormData();
    formData.append('title', editTitle.trim());
    formData.append('description', editDescription.trim());
    formData.append('category', editCategory.trim());
    formData.append('tags', editTags.trim());
    formData.append('isActive', editIsActive);
    if (editFile) formData.append('file', editFile);

    await mediaService.updateResource(id, formData);
    setEditingId(null);
    setEditFile(null);
    await fetchResources();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Resource (PDF/MD)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Input placeholder="Category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
            <Input placeholder="Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
            <Input placeholder="Tags (comma separated)" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
            <Input type="file" accept=".pdf,.md,text/markdown,text/plain,application/pdf" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
          </div>
          <Button onClick={() => void handleCreate()} className="gap-2" disabled={!newFile || !newTitle.trim()}>
            <Upload className="w-4 h-4" /> Upload Resource
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={fileType} onChange={(e) => setFileType(e.target.value)}>
            <option value="">All Types</option>
            <option value="pdf">PDF</option>
            <option value="md">Markdown</option>
          </Select>
          <Select value={isActive} onChange={(e) => setIsActive(e.target.value)}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500 dark:text-gray-400">No resources found</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const isEditing = editingId === item._id;
            return (
              <Card key={item._id}>
                <CardContent className="p-5">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />
                        <Input value={editCategory} onChange={(e) => setEditCategory(e.target.value)} placeholder="Category" />
                        <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" />
                        <Input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="Tags" />
                        <Select value={editIsActive} onChange={(e) => setEditIsActive(e.target.value)}>
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </Select>
                        <Input type="file" accept=".pdf,.md,text/markdown,text/plain,application/pdf" onChange={(e) => setEditFile(e.target.files?.[0] || null)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => void handleUpdate(item._id)} className="gap-2">
                          <Save className="w-4 h-4" /> Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} className="gap-2">
                          <X className="w-4 h-4" /> Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.description || 'No description'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Type: {item.fileType.toUpperCase()} | Category: {item.category || 'General'} | Status: {item.isActive ? 'Active' : 'Inactive'}
                        </p>
                        <a
                          href={resolveApiFileUrl(item.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-blue-600 hover:text-blue-700"
                        >
                          Open File
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(item)} className="gap-2">
                          <Edit className="w-4 h-4" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => void handleDelete(item._id)} className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400">
                          <Trash2 className="w-4 h-4" /> Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {total > 0 ? `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, total)} of ${total}` : 'Showing 0 of 0'}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-300">{page}</span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
            <Select value={String(limit)} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};
