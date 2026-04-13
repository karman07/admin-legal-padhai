import { ResourcesManager } from './media/ResourcesManager';

export const StudyMaterialManager = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Material Manager</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create categories first, then manage complete study material CRUD.
          </p>
        </div>

        <ResourcesManager contentKind="study-material" contentTitle="Study Material" />
      </div>
    </div>
  );
};
