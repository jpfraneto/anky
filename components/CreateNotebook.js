import { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { useContractRead } from 'wagmi';
import { createTBA } from '../lib/backend';
import notebookContractABI from '../lib/notebookABI.json';

function CreateNotebook({ userAnky, provider, signer }) {
  const [loadingNotebookCreation, setLoadingNotebookCreation] = useState(false);
  const [title, setTitle] = useState('the process of being');
  const [description, setDescription] = useState('96 days of exploration');
  const [numPages, setNumPages] = useState(96);
  const [userWallet, setUserWallet] = useState(null);
  const [price, setPrice] = useState(0.001);
  const [supply, setSupply] = useState(88);

  async function handleSubmit(event) {
    setLoadingNotebookCreation(true);
    event.preventDefault();
    const NOTEBOOK_CONTRACT_ADDRESS =
      '0xf8B1a05287434F82272BD4Ae3616E3E19b159E13';

    try {
      // const response = await axios.post(
      //   `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks`,
      //   {
      //     title,
      //     description,
      //     numPages,
      //     price,
      //     supply,
      //   }
      // );

      // const metadataURI = response.data.metadataURI;
      const metadataURI =
        'https://arweave.net/1qOQOByDpkeiEtI77LyfZAvuln4dzwW12YQxqgSNQwQ';
      console.log('the metadata uri is: ', metadataURI);
      console.log('the user wallet is: ', userWallet);
      const tbaAddress = await createTBA(userWallet.address);
      console.log('The tba address is: ', tbaAddress);
      if (userWallet && authenticated) {
        // The thing here is that I'm trying to send this transaction from the wallet of the user, not from the erc6551 token.

        const notebookContract = new ethers.Contract(
          NOTEBOOK_CONTRACT_ADDRESS,
          notebookContractABI,
          signer
        );

        const hardcodedPrice = ethers.utils.parseEther('0.001');

        if (ethers.utils.parseEther(price.toString()).lt(hardcodedPrice)) {
          console.error(
            'Insufficient fee sent. You must send at least 0.001 ETH.'
          );
          return;
        }

        console.log('the notebook contract is: ', notebookContract);
        // Call the contract's method and send the transaction
        const transactionResponse =
          await notebookContract.createNotebookTemplate(
            metadataURI,
            numPages,
            supply,
            {
              value: hardcodedPrice,
              gasLimit: 1000000000, // This is a high ballpark figure. Adjust based on your contract's needs.
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
    <div className=' min-h-screen text-gray-600 flex items-center justify-center'>
      {userAnky?.wallet?.address ? (
        <form
          className='bg-white p-6 rounded shadow-md space-y-4'
          onSubmit={handleSubmit}
        >
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

export default CreateNotebook;
