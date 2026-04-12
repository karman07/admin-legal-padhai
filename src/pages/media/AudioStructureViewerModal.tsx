import { useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ListTree } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { mediaService } from '../../services/mediaService';
import type { AudioLesson, AudioSectionListItem, AudioSubsectionListItem } from '../../types/media';
import { resolveApiFileUrl } from '../../lib/utils';

type Props = {
  audio: AudioLesson;
  onClose: () => void;
};

const audioTypes = [
  { key: 'englishAudio', label: 'English' },
  { key: 'hindiAudio', label: 'Hindi' },
  { key: 'easyEnglishAudio', label: 'Easy English' },
  { key: 'easyHindiAudio', label: 'Easy Hindi' },
] as const;

export const AudioStructureViewerModal = ({ audio, onClose }: Props) => {
  const [loadingSections, setLoadingSections] = useState(false);
  const [sections, setSections] = useState<AudioSectionListItem[]>([]);
  const [sectionPage, setSectionPage] = useState(1);
  const sectionLimit = 20;
  const [sectionTotal, setSectionTotal] = useState(0);
  const [sectionJumpInput, setSectionJumpInput] = useState('1');

  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [sectionDetail, setSectionDetail] = useState<any | null>(null);

  const [subPage, setSubPage] = useState(1);
  const subLimit = 25;
  const [subTotal, setSubTotal] = useState(0);
  const [subsections, setSubsections] = useState<AudioSubsectionListItem[]>([]);
  const [selectedSubsection, setSelectedSubsection] = useState<number | null>(null);
  const [subsectionDetail, setSubsectionDetail] = useState<any | null>(null);

  const fetchSections = async () => {
    setLoadingSections(true);
    try {
      const data = await mediaService.listAudioSections(audio._id, sectionPage, sectionLimit);
      setSections(data.items || []);
      setSectionTotal(data.total || 0);
    } finally {
      setLoadingSections(false);
    }
  };

  const openSection = async (sectionIndex: number) => {
    setSelectedSection(sectionIndex);
    setSelectedSubsection(null);
    setSubsectionDetail(null);
    setSubPage(1);
    const detail = await mediaService.getAudioSectionDetail(audio._id, sectionIndex);
    setSectionDetail(detail);

    const subData = await mediaService.listAudioSubsections(audio._id, sectionIndex, 1, subLimit);
    setSubsections(subData.items || []);
    setSubTotal(subData.total || 0);
  };

  const jumpToSection = async () => {
    const n = Number(sectionJumpInput);
    if (!Number.isFinite(n)) return;
    const target = Math.max(1, n) - 1;
    if (target < 0) return;
    await openSection(target);
    const targetPage = Math.floor(target / sectionLimit) + 1;
    if (targetPage !== sectionPage) setSectionPage(targetPage);
  };

  const fetchSubsections = async (sectionIndex: number, page: number, limit: number) => {
    const subData = await mediaService.listAudioSubsections(audio._id, sectionIndex, page, limit);
    setSubsections(subData.items || []);
    setSubTotal(subData.total || 0);
  };

  const openSubsection = async (subIndex: number) => {
    if (selectedSection === null) return;
    setSelectedSubsection(subIndex);
    const detail = await mediaService.getAudioSubsectionDetail(audio._id, selectedSection, subIndex);
    setSubsectionDetail(detail);
  };

  useEffect(() => {
    void fetchSections();
  }, [sectionPage, sectionLimit, audio._id]);

  useEffect(() => {
    if (selectedSection === null) return;
    void fetchSubsections(selectedSection, subPage, subLimit);
  }, [selectedSection, subPage, subLimit]);

  const sectionToShow = sectionDetail || {};
  const subsectionToShow = subsectionDetail || {};

  const sectionRange = useMemo(() => {
    if (sectionTotal === 0) return 'Showing 0 of 0';
    const start = (sectionPage - 1) * sectionLimit + 1;
    const end = Math.min(sectionPage * sectionLimit, sectionTotal);
    return `Showing ${start} to ${end} of ${sectionTotal}`;
  }, [sectionPage, sectionLimit, sectionTotal]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white inline-flex items-center gap-2">
              <ListTree className="w-6 h-6 text-blue-600" />
              Audio Structure Viewer
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{audio.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          <div className="border-r border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-semibold mb-3">Sections</h3>
            <div className="mb-3 flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={sectionJumpInput}
                onChange={(e) => setSectionJumpInput(e.target.value.replace(/[^0-9]/g, '') || '1')}
                className="w-24 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-xs"
              />
              <Button size="sm" variant="outline" onClick={() => void jumpToSection()}>
                Load First
              </Button>
            </div>
            {loadingSections ? (
              <div className="py-8 text-center text-sm text-gray-500">Loading sections...</div>
            ) : sections.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">No sections available</div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {sections.map((section) => (
                  <button
                    key={section._index}
                    onClick={() => void openSection(section._index)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      selectedSection === section._index
                        ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-800 hover:border-blue-200'
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{section._index + 1}. {section.title || 'Untitled section'}</p>
                    <p className="text-xs text-gray-500 mt-1">{section.totalSubsections || 0} subsections</p>
                    <div className="mt-1 text-[11px] text-gray-500">
                      {section.hasEnglishAudio ? 'EN ' : ''}
                      {section.hasHindiAudio ? 'HI ' : ''}
                      {section.hasEasyEnglishAudio ? 'E-EN ' : ''}
                      {section.hasEasyHindiAudio ? 'E-HI' : ''}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs text-gray-500">{sectionRange}</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={sectionPage <= 1} onClick={() => setSectionPage((p) => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={sectionPage * sectionLimit >= sectionTotal} onClick={() => setSectionPage((p) => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="border-r border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-semibold mb-3">Section Audio & Subsections</h3>
            {selectedSection === null ? (
              <div className="py-8 text-sm text-gray-500">Select a section to inspect details.</div>
            ) : (
              <>
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3 mb-3">
                  <p className="font-semibold text-sm mb-2">Section {selectedSection + 1}</p>
                  <div className="space-y-2">
                    {audioTypes.map((type) => {
                      const file = sectionToShow[type.key] as any;
                      return (
                        <div key={type.key} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-300">{type.label}</span>
                          {file?.url ? (
                            <audio controls className="h-8" src={resolveApiFileUrl(file.url)} />
                          ) : (
                            <span className="text-gray-400">Not uploaded</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
                  {subsections.map((sub) => (
                    <button
                      key={sub._index}
                      onClick={() => void openSubsection(sub._index)}
                      className={`w-full text-left rounded-lg border p-3 ${
                        selectedSubsection === sub._index
                          ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-800 hover:border-blue-200'
                      }`}
                    >
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{sub._index + 1}. {sub.title || 'Untitled subsection'}</p>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{sub.englishTextPreview || 'No preview text'}</p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {sub.hasEnglishAudio ? 'EN ' : ''}
                        {sub.hasHindiAudio ? 'HI ' : ''}
                        {sub.hasEasyEnglishAudio ? 'E-EN ' : ''}
                        {sub.hasEasyHindiAudio ? 'E-HI' : ''}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-500">
                    {subTotal > 0 ? `Showing ${(subPage - 1) * subLimit + 1} to ${Math.min(subPage * subLimit, subTotal)} of ${subTotal}` : 'No subsections'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" disabled={subPage <= 1} onClick={() => setSubPage((p) => p - 1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" disabled={subPage * subLimit >= subTotal} onClick={() => setSubPage((p) => p + 1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-semibold mb-3">Subsection Audio</h3>
            {selectedSubsection === null ? (
              <div className="py-8 text-sm text-gray-500">Select a subsection to inspect all audio variants.</div>
            ) : (
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                <p className="font-semibold text-sm mb-2">Subsection {selectedSubsection + 1}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{subsectionToShow.title || 'Untitled subsection'}</p>
                <div className="space-y-2">
                  {audioTypes.map((type) => {
                    const file = subsectionToShow[type.key] as any;
                    return (
                      <div key={type.key} className="text-xs">
                        <p className="text-gray-600 dark:text-gray-300 mb-1">{type.label}</p>
                        {file?.url ? (
                          <audio controls className="w-full" src={resolveApiFileUrl(file.url)} />
                        ) : (
                          <p className="text-gray-400">Not uploaded</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                {subsectionToShow.englishText && (
                  <div className="mt-3 rounded-md bg-gray-50 dark:bg-gray-800 p-2 text-xs text-gray-600 dark:text-gray-300">
                    <p className="font-semibold mb-1">English Text</p>
                    <p className="line-clamp-6">{subsectionToShow.englishText}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
