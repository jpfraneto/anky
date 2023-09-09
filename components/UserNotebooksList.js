import React, { useState, useEffect } from 'react';
import { getUserMintedNotebooks } from '../lib/notebooks';

function UserNotebooksList({ userAddress }) {
  const [notebooks, setNotebooks] = useState([]);

  useEffect(() => {
    async function fetchNotebooks() {
      let result = await getUserMintedNotebooks(userAddress);
      setNotebooks(result);
    }

    fetchNotebooks();
  }, [userAddress]);

  return (
    <div>
      {notebooks.map(notebook => (
        <div key={notebook.id} className='p-4 border rounded'>
          <a
            href={`YOUR_WRITING_APP_URL/${notebook.id}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <h2>{notebook.metadataURI}</h2>
          </a>
          {/* More details if needed */}
        </div>
      ))}
    </div>
  );
}

export default UserNotebooksList;
