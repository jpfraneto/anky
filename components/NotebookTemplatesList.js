import React, { useEffect, useState } from 'react';

function NotebookTemplatesList() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    async function fetchTemplates() {
      let result = await getAvailableTemplates();
      setTemplates(result);
    }

    fetchTemplates();
  }, []);

  return (
    <div>
      {templates.map(template => (
        <div key={template.id} className='p-4 border rounded'>
          <h2>{template.metadataURI}</h2>
          <p>Minted: {template.minted.toString()}</p>
          <p>Total Supply: {template.supply.toString()}</p>
          {/* More details if needed */}
        </div>
      ))}
    </div>
  );
}

export default NotebookTemplatesList;
