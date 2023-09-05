import { useEffect, useState } from 'react';

function Notebooks() {
  const [notebooks, setNotebooks] = useState([]);

  useEffect(() => {
    async function fetchNotebooks() {
      // Call your backend API or directly from the smart contract to get available notebooks
      const notebooksData = []; // This will come from your backend or contract
      setNotebooks(notebooksData);
    }
    fetchNotebooks();
  }, []);

  return (
    <div>
      {notebooks.map(notebook => (
        <div key={notebook.id}>
          <h2>{notebook.title}</h2>
          <p>{notebook.description}</p>
          <button onClick={() => mintNotebook(notebook.id)}>Mint</button>
        </div>
      ))}
    </div>
  );
}

export default Notebooks;
