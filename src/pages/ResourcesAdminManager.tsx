import { ResourcesManager } from './media/ResourcesManager';

export const ResourcesAdminManager = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resources Manager</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage Resources categories and files independently.
          </p>
        </div>

        <ResourcesManager contentKind="resource" contentTitle="Resource" />
      </div>
    </div>
  );
};
