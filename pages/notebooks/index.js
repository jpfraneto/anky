import { useState, useEffect } from 'react';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import notebookContractABI from '../../lib/notebookABI.json';

const TEMPLATES_CONTRACT_ADDRESS = '0xc52698D6C745C516FAba2115f1B453E14e5503a1';
const NOTEBOOK_CONTRACT_ADDRESS = '0x131eFd7EE39806D72dA8f051D89E306049692354';

function DisplayNotebooks() {
  const { wallet: activeWallet } = usePrivyWagmi();

  const [notebookTemplates, setNotebookTemplates] = useState([]);
  const [ownedNotebooks, setOwnedNotebooks] = useState([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const notebookContract = new activeWallet.eth.Contract(
        notebookContractABI,
        NOTEBOOK_CONTRACT_ADDRESS
      );

      const total = await notebookContract.methods.getTotalTemplates().call();
      let fetchedTemplates = [];

      for (let i = 1; i <= total; i++) {
        const template = await notebookContract.methods
          .notebookTemplates(i)
          .call();
        fetchedTemplates.push(template);
      }

      setNotebookTemplates(fetchedTemplates);
    };

    const fetchOwnedNotebooks = async () => {
      const total = await notebookContract.methods.getTotalInstances().call();
      let fetchedOwned = [];

      for (let i = 1; i <= total; i++) {
        const owner = await notebookContract.methods.ownerOf(i).call();
        if (owner === activeWallet.address) {
          const notebook = await notebookContract.methods
            .notebookInstances(i)
            .call();
          fetchedOwned.push(notebook);
        }
      }

      setOwnedNotebooks(fetchedOwned);
    };

    if (activeWallet) {
      fetchTemplates();
      fetchOwnedNotebooks();
    }
  }, [activeWallet]);

  return (
    <div>
      {/* Display Templates */}
      <h2>Notebook Templates</h2>
      {notebookTemplates.map((template, index) => (
        <div key={index}>{/* Display template data */}</div>
      ))}

      {/* Display Owned Notebooks */}
      <h2>My Notebooks</h2>
      {ownedNotebooks.map((notebook, index) => (
        <div key={index}>{/* Display notebook data */}</div>
      ))}
    </div>
  );
}

export default DisplayNotebooks;
