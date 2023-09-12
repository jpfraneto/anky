import { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { useContractRead } from 'wagmi';
import { createTBA } from '../lib/backend';
import templatesContractABI from '../lib/templatesABI.json';

function CreateNotebookTemplate({ userAnky }) {
  const [loadingNotebookCreation, setLoadingNotebookCreation] = useState(false);
  const [title, setTitle] = useState('the process of being');
  const [description, setDescription] = useState('96 days of exploration');
  const [numPages, setNumPages] = useState(96);
  const [userWallet, setUserWallet] = useState(null);
  const [price, setPrice] = useState(0.001);
  const [supply, setSupply] = useState(88);

  const { wallets } = useWallets();
  console.log('the wallets are: ', wallets);

  const thisWallet = wallets[0];

  async function handleSubmit(event) {
    setLoadingNotebookCreation(true);
    event.preventDefault();
    const TEMPLATES_CONTRACT_ADDRESS =
      '0xc52698D6C745C516FAba2115f1B453E14e5503a1';

    try {
      console.log('the user anky is after: ', thisWallet);
      let provider = await thisWallet.getEthersProvider();
      let signer = await provider.getSigner();
      console.log('in here, the provider and signer are', provider, signer);
      const metadataURI =
        'https://arweave.net/1qOQOByDpkeiEtI77LyfZAvuln4dzwW12YQxqgSNQwQ';
      console.log('the metadata uri is: ', metadataURI);
      console.log('the user wallet is: ', thisWallet);

      if (thisWallet && signer) {
        // The thing here is that I'm trying to send this transaction from the wallet of the user, not from the erc6551 token.

        const templatesContract = new ethers.Contract(
          TEMPLATES_CONTRACT_ADDRESS,
          templatesContractABI,
          signer
        );

        const userEnteredPriceInWei = ethers.utils.parseEther(price.toString());
        // Call the contract's method and send the transaction
        const transactionResponse = await templatesContract.createTemplate(
          userEnteredPriceInWei,
          [
            'Describe the moment you found out you were going to be a mother.',
            "What are some challenges and joys you've faced as a mother?",
            'How has motherhood changed your perspective on life?',
            'Write a letter to your child, sharing hopes, dreams, and guidance.',
          ],
          metadataURI,
          supply,
          {
            gasLimit: 1000000000,
          }
        );

        console.log('Transaction hash:', transactionResponse.hash);
        await transactionResponse.wait(); // Wait for the transaction to be mined
        console.log('Notebook template created successfully');
        setLoadingNotebookCreation(false);
      } else {
        console.error('Wallet not connected or not authenticated with Privy');
      }
    } catch (error) {
      console.error('There was an error creating the notebook:', error);
    }
  }

  if (!userAnky?.wallet) return <p>please setup first</p>;

  return (
    <div className='my-8 text-gray-600 flex items-center justify-center'>
      {userAnky?.wallet?.address ? (
        <form
          className='bg-white p-6 rounded shadow-md space-y-4'
          onSubmit={handleSubmit}
        >
          <h2 className='text-black text-xl'>New Notebook Template</h2>

          <div>
            <input
              className='border p-2 w-full rounded'
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <p className='text-sm text-gray-500 mt-1'>Title</p>
          </div>

          <div>
            <textarea
              className='border p-2 w-full rounded'
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
            <p className='text-sm text-gray-500 mt-1'>Description</p>
          </div>

          <div>
            <input
              className='border p-2 w-full rounded'
              type='number'
              value={numPages}
              onChange={e => setNumPages(e.target.value)}
              required
            />
            <p className='text-sm text-gray-500 mt-1'>Number of Pages</p>
          </div>

          <div>
            <input
              className='border p-2 w-full rounded'
              type='number'
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
            />
            <p className='text-sm text-gray-500 mt-1'>Price (in eth)</p>
          </div>

          <div>
            <input
              className='border p-2 w-full rounded'
              type='number'
              value={supply}
              onChange={e => setSupply(e.target.value)}
              required
            />
            <p className='text-sm text-gray-500 mt-1'>Supply (max notebooks)</p>
          </div>

          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4'
            type='submit'
          >
            {loadingNotebookCreation
              ? 'Loading...'
              : 'Create Notebook Template'}
          </button>
        </form>
      ) : (
        <button
          className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
          onClick={login}
        >
          Login with Privy
        </button>
      )}
    </div>
  );
}

export default CreateNotebookTemplate;
