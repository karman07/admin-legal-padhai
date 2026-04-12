import { useState, useEffect } from 'react';
import { Upload, Edit, Trash2, Search, Eye } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { mediaService } from '../../services/mediaService';
import type { AudioLesson, Category } from '../../types/media';
import { AudioUploadModal } from './AudioUploadModal';
import { AudioEditModal } from './AudioEditModal';
import { AudioStructureViewerModal } from './AudioStructureViewerModal';

export const AudioManager = () => {
  const [audios, setAudios] = useState<AudioLesson[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingAudio, setEditingAudio] = useState<AudioLesson | null>(null);
  const [viewingAudio, setViewingAudio] = useState<AudioLesson | null>(null);

  const fetchAudios = async () => {
    setLoading(true);
    try {
      const data = await mediaService.listAudio({
        page,
        limit,
        category: categoryFilter || undefined,
        isActive: statusFilter || undefined,
        search: appliedSearch || undefined,
      });
      setAudios(data.audioLessons);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await mediaService.getCategories();
      setCategories(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchAudios();
  }, [page, limit, categoryFilter, statusFilter, appliedSearch]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setAppliedSearch(searchTerm.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this audio lesson?')) return;
    try {
      await mediaService.deleteAudio(id);
      fetchAudios();
    } catch (e) {}
  };

  // const formatFileSize = (bytes?: number) => {
  //   if (!bytes) return 'N/A';
  //   if (bytes < 1024) return bytes + ' B';
  //   if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  //   return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  // };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search audio lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </div>
          <Button onClick={() => setShowUploadModal(true)} className="gap-2">
            <Upload className="w-4 h-4" /> Upload Audio
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : audios.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No audio lessons found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {audios.map((audio) => (
              <Card key={audio._id} className="hover:shadow-md transition-all border border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {audio.headTitle && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                              {audio.headTitle}
                            </div>
                          )}
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {audio.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span>{audio.category}</span>
                            {audio.totalSections && <span>• {audio.totalSections} sections</span>}
                            {audio.totalSubsections && audio.totalSubsections > 0 && (
                              <span>• {audio.totalSubsections} subsections</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {audio.isActive ? (
                            <span className="px-3 py-1 text-xs font-medium rounded-full border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 text-xs font-medium rounded-full border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      {audio.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {audio.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Content:</span>
                          {audio.totalSections && <span className="px-2 py-1 text-xs rounded border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">{audio.totalSections} Sections</span>}
                          {audio.totalSubsections && audio.totalSubsections > 0 && <span className="px-2 py-1 text-xs rounded border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">{audio.totalSubsections} Subsections</span>}
                        </div>
                      </div>

                      {audio.tags && audio.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {audio.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => setViewingAudio(audio)} className="gap-2">
                        <Eye className="w-4 h-4" /> View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingAudio(audio)} className="gap-2">
                        <Edit className="w-4 h-4" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(audio._id)} className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400">
                        <Trash2 className="w-4 h-4" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && audios.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {total > 0 ? `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, total)} of ${total}` : 'Showing 0 of 0'}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">{page}</span>
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

      {showUploadModal && (
        <AudioUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchAudios();
          }}
          categories={categories}
        />
      )}

      {editingAudio && (
        <AudioEditModal
          audio={editingAudio}
          onClose={() => setEditingAudio(null)}
          onSuccess={() => {
            setEditingAudio(null);
            fetchAudios();
          }}
          categories={categories}
        />
      )}

      {viewingAudio && (
        <AudioStructureViewerModal
          audio={viewingAudio}
          onClose={() => setViewingAudio(null)}
        />
      )}
    </>
  );
};
