import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { mediaService } from '../../services/mediaService';
import type { AudioLesson, Category, AudioSection } from '../../types/media';
import { SectionEditor } from '../../components/audio/SectionEditor';

interface AudioEditModalProps {
  audio: AudioLesson;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

export const AudioEditModal = ({ audio, onClose, onSuccess, categories }: AudioEditModalProps) => {
  const [saving, setSaving] = useState(false);
  const [loadingSection, setLoadingSection] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);
  const [sectionsLoaded, setSectionsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    title: audio.title,
    headTitle: audio.headTitle || '',
    description: audio.description || '',
    category: audio.category,
    tags: audio.tags?.join(', ') || '',
    isActive: audio.isActive,
  });
  const [sections, setSections] = useState<AudioSection[]>(audio.sections || []);
  const [sectionAudioFiles, setSectionAudioFiles] = useState<Map<string, File>>(new Map());
  const [subsectionAudioFiles, setSubsectionAudioFiles] = useState<Map<string, File>>(new Map());

  const handleSectionAudioFile = (sectionIndex: number, audioType: string, file: File) => {
    const key = `section_${sectionIndex}_${audioType}`;
    setSectionAudioFiles(prev => new Map(prev).set(key, file));
  };

  const handleSubsectionAudioFile = (sectionIndex: number, subsectionIndex: number, audioType: string, file: File) => {
    const key = `section_${sectionIndex}_subsection_${subsectionIndex}_${audioType}`;
    setSubsectionAudioFiles(prev => new Map(prev).set(key, file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      if (formData.headTitle) data.append('headTitle', formData.headTitle);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('isActive', String(formData.isActive));
      if (formData.tags) data.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(t => t)));
      // Metadata save only. Section updates are handled via per-section endpoint.

      await mediaService.updateAudio(audio._id, data);
      onSuccess();
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  const loadSelectedSection = async () => {
    setLoadingSection(true);
    try {
      const full = await mediaService.getAdminAudioSectionFull(audio._id, selectedSectionIndex);
      setSections([full as AudioSection]);
      setSectionAudioFiles(new Map());
      setSubsectionAudioFiles(new Map());
      setSectionsLoaded(true);
    } finally {
      setLoadingSection(false);
    }
  };

  const handleSaveSection = async () => {
    if (!sectionsLoaded || sections.length === 0) return;
    setSavingSection(true);
    try {
      const data = new FormData();
      data.append('section', JSON.stringify(sections[0]));

      sectionAudioFiles.forEach((file, key) => {
        const audioType = key.replace(/^section_0_/, '');
        data.append(`section_${audioType}`, file);
      });

      subsectionAudioFiles.forEach((file, key) => {
        const match = key.match(/^section_0_subsection_(\d+)_(.+)$/);
        if (!match) return;
        const subIdx = match[1];
        const audioType = match[2];
        data.append(`subsection_${subIdx}_${audioType}`, file);
      });

      await mediaService.updateAdminAudioSection(audio._id, selectedSectionIndex, data);
      onSuccess();
    } finally {
      setSavingSection(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Audio Lesson</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Head Title (Optional)</label>
              <Input value={formData.headTitle} onChange={(e) => setFormData(prev => ({ ...prev, headTitle: e.target.value }))} placeholder="e.g., Constitutional Law Fundamentals" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <Select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} required>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
              <Input value={formData.tags} onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900" rows={2} />
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-sm text-blue-900 dark:text-blue-200 dark:bg-blue-900/20 dark:border-blue-900/40">
              <p className="font-semibold">Section Editor</p>
              <p className="text-xs mt-1">
                For large lessons, load and edit one section at a time.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={Math.max(1, audio.totalSections || 1)}
                  value={selectedSectionIndex + 1}
                  onChange={(e) => {
                    const n = Math.max(1, Number(e.target.value || 1));
                    setSelectedSectionIndex(n - 1);
                  }}
                  className="w-28"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => void loadSelectedSection()} disabled={loadingSection}>
                  {loadingSection ? 'Loading section...' : `Load Section ${selectedSectionIndex + 1}`}
                </Button>
              </div>
            </div>

            {sectionsLoaded && (
              <>
                <SectionEditor
                  sections={sections}
                  onChange={setSections}
                  onAudioFileChange={handleSectionAudioFile}
                  onSubsectionAudioFileChange={handleSubsectionAudioFile}
                />
                <div className="flex justify-end">
                  <Button type="button" onClick={() => void handleSaveSection()} disabled={savingSection} className="gap-2">
                    <Save className="w-4 h-4" />
                    {savingSection ? 'Saving Section...' : `Save Section ${selectedSectionIndex + 1}`}
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 pt-4 border-t">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4" />
            <label htmlFor="isActive" className="text-sm font-medium">Active</label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
