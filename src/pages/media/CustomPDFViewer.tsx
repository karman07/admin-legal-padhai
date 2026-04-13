import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

interface CustomPDFViewerProps {
  title: string;
  fileType: 'pdf' | 'md';
  fileUrl: string;
}

export const CustomPDFViewer = ({ title, fileType, fileUrl }: CustomPDFViewerProps) => {
  const [mdContent, setMdContent] = useState('');
  const [loadingMd, setLoadingMd] = useState(false);
  const [mdError, setMdError] = useState('');

  useEffect(() => {
    const loadMarkdown = async () => {
      if (fileType !== 'md') return;
      setLoadingMd(true);
      setMdError('');
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error('Failed to load markdown file');
        }
        const text = await response.text();
        setMdContent(text);
      } catch (error: any) {
        setMdError(error?.message || 'Unable to load markdown file');
      } finally {
        setLoadingMd(false);
      }
    };

    void loadMarkdown();
  }, [fileType, fileUrl]);

  if (fileType === 'pdf') {
    return <iframe title={title} src={fileUrl} className="h-full w-full" />;
  }

  if (loadingMd) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading markdown...</p>
      </div>
    );
  }

  if (mdError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-gray-50 px-6 text-center dark:bg-gray-950">
        <FileText className="h-8 w-8 text-red-500" />
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{mdError}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-6 dark:bg-gray-950">
      <article className="prose prose-sm max-w-none whitespace-pre-wrap rounded-xl border border-gray-200 bg-white p-5 text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100">
        {mdContent || 'No markdown content found.'}
      </article>
    </div>
  );
};
