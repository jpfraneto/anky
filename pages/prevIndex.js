import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { ThirdwebSDK } from '@thirdweb-dev/sdk/evm';
import {
  useContract,
  useContractWrite,
  useSigner,
  useAddress,
  Web3Button,
} from '@thirdweb-dev/react';

export default function PrevIndex() {
  const signer = useSigner();
  const address = useAddress();
  const [contract, setContract] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imageURL, setImageURL] = useState(
    'https://88minutes.xyz/assets/3dbddc94-b60c-47c0-9bc6-07160bfecf45.png'
  );
  const [loadingPage, setLoadingPage] = useState(true);
  const [metadataCID, setMedatadataCID] = useState(
    'QmYwzs6515RQ68mpvHLd6JrpQJwJ9fCQFN4GLyK4V1gMHf'
  );

  const pinYourAnky = async () => {
    console.log('Adding your Anky to Pinata');
    const data = await fetch('/api/pinataPinning', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: imageURL,
        name: 'Lunamarie',
        bio: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      }),
    });
    const dataJson = await data.json();
    console.log('the data json is: ', dataJson);
    if (dataJson) {
      setMetadataCID(dataJson.IpfsHash);
    }
  };

  // let sdk;
  // if (signer) {
  //   sdk = ThirdwebSDK.fromSigner(signer);
  // }
  // useEffect(() => {
  //   const loadSmartContract = async () => {
  //     if (signer) {
  //       sdk = ThirdwebSDK.fromSigner(signer);
  //     }
  //     if (sdk) {
  //       const contractResponse = await sdk.getContract(
  //         process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  //       );
  //       if (contractResponse) {
  //         setContract(contractResponse);
  //       }
  //     }
  //     setLoadingPage(false);
  //   };
  //   loadSmartContract();
  // }, [signer]);
  // const mintTheNFT = async () => {
  //   const data = await contract.call('tokenOfOwnerByIndex', [address, 0]);
  // };

  // if (loadingPage) return <p className='text-white'>Loading</p>;

  return (
    <div className={styles.container}>
      <main className='flex flex-col w-96 mx-auto '>
        {imageURL && (
          <div className='mx-auto rounded-xl overflow-hidden'>
            <Image src={imageURL} width={333} height={333} alt='Your Anky' />
          </div>
        )}
        <p className='my.-0'>Image URL:</p>
        <input
          type='text'
          className='px-4 my-0 py-2 rounded-xl'
          onChange={e => setImageURL(e.target.value)}
          value={imageURL}
        />

        {metadataCID ? (
          <div className='flex flex-col'>
            <p>Metadata CID</p>
            <input
              type='text'
              className='px-4 mb-4 py-2 rounded-xl'
              onChange={e => setMedatadataCID(e.target.value)}
              value={metadataCID}
            />

            {success ? (
              <p>The transaction was successful!</p>
            ) : (
              <Web3Button
                contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}
                action={async contract => contract.call('mint', [metadataCID])}
                onSuccess={result => {
                  console.log(
                    'The transaction was successful, and this is the result of it:',
                    result
                  );
                  setSuccess(true);
                }}
                onError={error => alert('Something went wrong!')}
                onSubmit={() => console.log('Transaction submitted')}
              >
                Mint
              </Web3Button>
            )}
          </div>
        ) : (
          <button
            onClick={pinYourAnky}
            className='px-2 py-1 bg-blue-600 w-fit mt-2 mx-auto rounded-xl  hover:opacity-70'
          >
            Pin your Anky
          </button>
        )}
      </main>
    </div>
  );
}
