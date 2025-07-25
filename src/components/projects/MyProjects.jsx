import React from 'react';
import ProjectsView from '../common/ProjectsView';

const MyProjects = () => {
  const handleImportClick = () => {
    // TODO: Implement import functionality
    console.log('Import clicked');
  };

  return (
    <ProjectsView
      title="Projects"
      apiEndpoint="/api/projects"
      createButtonText="Create"
      importButtonText="Import"
      onImportClick={handleImportClick}
      entityType="project"
    />
  );
};

export default MyProjects;