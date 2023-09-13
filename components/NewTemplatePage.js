import React from 'react';
import CreateNotebookTemplate from './CreateNotebookTemplate';

const NewTemplatePage = ({ userAnky }) => {
  return (
    <>
      <CreateNotebookTemplate userAnky={userAnky} />
    </>
  );
};

export default NewTemplatePage;
