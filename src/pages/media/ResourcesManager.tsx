import { useEffect, useState } from 'react';
import { Upload, Search, Trash2, Edit, Save, X, Plus, FolderTree } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { mediaService } from '../../services/mediaService';
import type { ResourceItem, StudyMaterialCategory } from '../../types/media';
import { resolveApiFileUrl } from '../../lib/utils';
import { ResourceFileViewerModal } from './ResourceFileViewerModal';

interface ResourcesManagerProps {
  contentKind?: 'resource' | 'study-material';
  contentTitle?: string;
}

export const ResourcesManager = ({
  contentKind = 'resource',
  contentTitle = 'Resource',
}: ResourcesManagerProps) => {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [categories, setCategories] = useState<StudyMaterialCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [fileType, setFileType] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isActive, setIsActive] = useState('');
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editIsActive, setEditIsActive] = useState('true');
  const [editFile, setEditFile] = useState<File | null>(null);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await mediaService.listContentCategories(contentKind);
      setCategories(data || []);

      if (!newCategory && data.length > 0) {
        setNewCategory(data[0].name);
      }

      if (!categoryFilter && data.length > 0) {
        setCategoryFilter(data[0].name);
      }
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await mediaService.listResources({
        page,
        limit,
        search: appliedSearch || undefined,
        fileType: (fileType || undefined) as 'pdf' | 'md' | undefined,
        category: categoryFilter || undefined,
        isActive: isActive || undefined,
        kind: contentKind,
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      setItems([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  useEffect(() => {
    void fetchResources();
  }, [page, limit, fileType, categoryFilter, isActive, appliedSearch, contentKind]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setAppliedSearch(search.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      await mediaService.createContentCategory(newCategoryName.trim(), contentKind);
      setNewCategoryName('');
      await fetchCategories();
    } catch {
      // error toast handled by interceptor
    }
  };

  const startCategoryEdit = (item: StudyMaterialCategory) => {
    setEditingCategoryId(item._id);
    setEditingCategoryName(item.name);
  };

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingCategoryName.trim()) return;
    try {
      await mediaService.updateContentCategory(id, editingCategoryName.trim(), contentKind);
      setEditingCategoryId(null);
      setEditingCategoryName('');
      await fetchCategories();
      await fetchResources();
    } catch {
      // error toast handled by interceptor
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Existing study materials will move to General category.')) return;
    try {
      await mediaService.deleteContentCategory(id, contentKind);
      await fetchCategories();
      await fetchResources();
    } catch {
      // error toast handled by interceptor
    }
  };

  const handleCreate = async () => {
    if (!newFile || !newTitle.trim() || !newCategory.trim()) return;
    try {
      const formData = new FormData();
      formData.append('title', newTitle.trim());
      formData.append('description', newDescription.trim());
      formData.append('category', newCategory.trim());
      formData.append('kind', contentKind);
      formData.append('tags', newTags.trim());
      formData.append('file', newFile);
      await mediaService.createResource(formData);

      setNewTitle('');
      setNewDescription('');
      setNewCategory(categories[0]?.name || '');
      setNewTags('');
      setNewFile(null);
      await fetchResources();
    } catch {
      // error toast handled by interceptor
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await mediaService.deleteResource(id);
      await fetchResources();
    } catch {
      // error toast handled by interceptor
    }
  };

  const startEdit = (item: ResourceItem) => {
    setEditingId(item._id);
    setEditTitle(item.title || '');
    setEditDescription(item.description || '');
    setEditCategory(item.category || categories[0]?.name || '');
    setEditTags((item.tags || []).join(', '));
    setEditIsActive(item.isActive ? 'true' : 'false');
    setEditFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFile(null);
  };

  const handleUpdate = async (id: string) => {
    if (!editCategory.trim()) return;
    try {
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
    } catch {
      // error toast handled by interceptor
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-600" />
            {contentTitle} Categories
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create category first, then upload {contentTitle.toLowerCase()} files under that category.
          </p>
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <Button onClick={() => void handleCreateCategory()} className="gap-2" disabled={!newCategoryName.trim()}>
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </div>

          {categoriesLoading ? (
            <div className="text-sm text-gray-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="text-sm text-amber-600 dark:text-amber-400">No categories found. Add one category to continue.</div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => {
                const isEditingCategory = editingCategoryId === cat._id;
                return (
                  <div
                    key={cat._id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-800 p-3"
                  >
                    {isEditingCategory ? (
                      <Input
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        placeholder="Category name"
                      />
                    ) : (
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{cat.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{cat.resourceCount} files</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {isEditingCategory ? (
                        <>
                          <Button size="sm" onClick={() => void handleUpdateCategory(cat._id)} className="gap-2">
                            <Save className="w-4 h-4" /> Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelCategoryEdit} className="gap-2">
                            <X className="w-4 h-4" /> Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => startCategoryEdit(cat)} className="gap-2">
                            <Edit className="w-4 h-4" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleDeleteCategory(cat._id)}
                            className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create {contentTitle} (PDF/MD)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} disabled={categories.length === 0}>
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </Select>
            <Input placeholder="Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
            <Input placeholder="Tags (comma separated)" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
            <Input type="file" accept=".pdf,.md,text/markdown,text/plain,application/pdf" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
          </div>
          <Button onClick={() => void handleCreate()} className="gap-2" disabled={!newFile || !newTitle.trim() || !newCategory.trim()}>
            <Upload className="w-4 h-4" /> Upload {contentTitle}
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
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </Select>
          <Select value={isActive} onChange={(e) => setIsActive(e.target.value)}>
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Select Category First</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setCategoryFilter(cat.name)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  categoryFilter === cat.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

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
                        <Select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                          ))}
                        </Select>
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
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedResource(item);
                          }}
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

      {selectedResource && (
        <ResourceFileViewerModal
          title={selectedResource.title}
          fileType={selectedResource.fileType}
          fileUrl={resolveApiFileUrl(selectedResource.fileUrl)}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </div>
  );
};
