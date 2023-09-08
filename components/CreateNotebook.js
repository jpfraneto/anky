import { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { useContractRead } from 'wagmi';
import { createTBA } from '../lib/backend';
import notebookContractABI from '../lib/notebookABI.json';

function CreateNotebook({ userAnky }) {
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
      '0x662cfd89ef9F98AE171648c2805e7c58A86A6F31';

    try {
      // const response = await axios.post(
      //   `${process.env.NEXT_PUBLIC_SERVER_URL}/notebooks`,
      //   {
      //     title,
      //     description,
      //     numPages,
      //     price,
      //     supply,
      //     ownerAddress: userAnky.wallet.address,
      //     tbaAddress: userAnky.tbaAddress,
      //   }
      // );
      const metadataURI =
        'https://arweave.net/1qOQOByDpkeiEtI77LyfZAvuln4dzwW12YQxqgSNQwQ';
      console.log('the metadata uri is: ', metadataURI);
      console.log('the user wallet is: ', userWallet);

      if (userAnky.wallet && userAnky.signer) {
        // The thing here is that I'm trying to send this transaction from the wallet of the user, not from the erc6551 token.

        const notebookContract = new ethers.Contract(
          NOTEBOOK_CONTRACT_ADDRESS,
          notebookContractABI,
          userAnky.signer
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
            userAnky.wallet.address,
            userAnky.tbaAddress,
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

export default CreateNotebook;
