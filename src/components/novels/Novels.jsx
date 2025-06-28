import React from 'react';
import ProjectsView from '../common/ProjectsView';

const Novels = () => {
  const handleImportClick = () => {
    // TODO: Implement import functionality
    console.log('Import novel clicked');
  };

  return (
    <ProjectsView
      title="Novels"
      apiEndpoint="/api/novels"
      createButtonText="Create"
      importButtonText="Import"
      onImportClick={handleImportClick}
      entityType="novel"
    />
  );
};

export default Novels;