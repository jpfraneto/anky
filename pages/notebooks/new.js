import { useState } from 'react';
import axios from 'axios';
import { usePrivy, useWallets, usePrivyWagmi } from '@privy-io/react-auth';
import notebookContractABI from '../../lib/notebookABI.json';

const NOTEBOOK_CONTRACT_ADDRESS = 'Your_Notebook_Contract_Address_Here'; // Don't forget to replace this with your actual contract address.

function CreateNotebook() {
  const { login, authenticated } = usePrivy();
  const { wallet: activeWallet } = usePrivyWagmi();
  const wallets = useWallets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [numPages, setNumPages] = useState(1);
  const [price, setPrice] = useState(0);
  const [supply, setSupply] = useState(1);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks`,
        {
          title,
          description,
          numPages,
          price,
          supply,
        }
      );

      const metadataURI = response.data.metadataURI;

      if (activeWallet && authenticated) {
        const notebookContract = new activeWallet.eth.Contract(
          notebookContractABI,
          NOTEBOOK_CONTRACT_ADDRESS
        );

        // Call the smart contract method
        await notebookContract.methods
          .createNotebookTemplate(metadataURI, numPages, supply)
          .send({ from: activeWallet.address, value: price * 1e18 }); // Adjust value to be in wei

        console.log('Notebook template created successfully');
      } else {
        console.error('Wallet not connected or not authenticated with Privy');
      }
    } catch (error) {
      console.error('There was an error creating the notebook:', error);
    }
  }

  return (
    <div>
      {authenticated ? (
        <form onSubmit={handleSubmit}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder='Title'
            required
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder='Description'
            required
          />
          <input
            type='number'
            value={numPages}
            onChange={e => setNumPages(e.target.value)}
            placeholder='Number of Pages'
            required
          />
          <input
            type='number'
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder='Price (in wei)'
            required
          />
          <input
            type='number'
            value={supply}
            onChange={e => setSupply(e.target.value)}
            placeholder='Supply (max notebooks)'
            required
          />
          <button type='submit'>Create Notebook</button>
        </form>
      ) : (
        <button onClick={login}>Login with Privy</button>
      )}
    </div>
  );
}

export default CreateNotebook;
