import React, { useState, useEffect } from 'react';
import { ThirdwebSDK } from '@thirdweb-dev/sdk/evm';
import {
  useContract,
  useContractWrite,
  useSigner,
  useAddress,
  Web3Button,
  MediaRenderer,
} from '@thirdweb-dev/react';
import { ethers, BigNumber } from 'ethers';

const Profile = () => {
  const signer = useSigner();
  const address = useAddress();
  const [contract, setContract] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [userTokens, setUserTokens] = useState([]);
  const [loadedData, setLoadedData] = useState(false);
  let sdk;
  if (signer) {
    sdk = ThirdwebSDK.fromSigner(signer);
  }
  useEffect(() => {
    const loadSmartContract = async () => {
      if (signer) {
        sdk = ThirdwebSDK.fromSigner(signer);
      }
      if (sdk) {
        const contractResponse = await sdk.getContract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
        );
        if (contractResponse) {
          setContract(contractResponse);
        }
      }
    };
    loadSmartContract();
  }, [signer]);

  const fetchMetadata = async tokenCID => {
    try {
      const data = await fetch(
        `https://ipfs.thirdwebstorage.com/ipfs/${tokenCID}/`
      );
      const jsonResponse = await data.json();
      return jsonResponse;
    } catch (error) {
      console.log('There was an error fetching the metadata');
    }
    setLoadingMetadata(false);
  };

  useEffect(() => {
    const checkAddressTokens = async () => {
      let tempData, temp, tempMetadata, thisMetadata;
      if (loadedData) return;
      try {
        if (contract && address) {
          const totalTokensResponse = await contract.call('balanceOf', [
            address,
          ]);
          console.log('totl', totalTokensResponse);
          const totalTokens = BigNumber.from(
            totalTokensResponse._hex
          ).toString();
          console.log('the totalk tokens are: ', totalTokens);
          for (let i = 0; i < totalTokens; i++) {
            tempData = await contract.call('tokenOfOwnerByIndex', [address, i]);
            temp = BigNumber.from(tempData._hex).toString();
            tempMetadata = await contract.call('getTokenURI', [temp]);
            thisMetadata = await fetchMetadata(tempMetadata.split('//')[1]);
            setUserTokens(prev => [...prev, thisMetadata]);
          }
          setLoadedData(true);
        }
        setLoadingPage(false);
      } catch (error) {
        console.log('the error is: ', error);
      }
      setLoadingPage(false);
    };
    checkAddressTokens();
  }, [contract]);

  const mintTheNFT = async () => {
    const data = await contract.call('tokenOfOwnerByIndex', [address, 0]);
  };

  if (loadingPage) return <p className='text-white'>Loading</p>;
  return (
    <div className='flex flex-col items-center'>
      <div className='w-96'>
        <button onClick={() => console.log(contract)}>Print contract</button>
        <button onClick={() => console.log(userTokens)}>
          Print user tokens
        </button>
      </div>
      {userTokens && (
        <div className='flex flex-wrap text-center'>
          {userTokens.map((x, i) => {
            return (
              <div key={i}>
                {x.image && <MediaRenderer src={x.image} />}
                <p>{x.name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Profile;
