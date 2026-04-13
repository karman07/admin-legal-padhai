import { X, Download } from 'lucide-react';
import { CustomPDFViewer } from './CustomPDFViewer';

interface ResourceFileViewerModalProps {
  title: string;
  fileType: 'pdf' | 'md';
  fileUrl: string;
  onClose: () => void;
}

export const ResourceFileViewerModal = ({
  title,
  fileType,
  fileUrl,
  onClose,
}: ResourceFileViewerModalProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-4">
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Unified Study Material Viewer</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              download
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <Download className="h-4 w-4" />
              Download
            </a>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 dark:bg-gray-950">
          <CustomPDFViewer title={title} fileType={fileType} fileUrl={fileUrl} />
        </div>
      </div>
    </div>
  );
};
