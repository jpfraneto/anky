import { usePrivy, useWallets } from '@privy-io/react-auth';
import React, { useState, useEffect, useCallback } from 'react';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { useContractRead } from 'wagmi';
import contractABI from '../lib/contractABI.json';
import Link from 'next/link';
import { TokenboundClient } from '@tokenbound/sdk';
import { usePWA } from '../context/pwaContext';
import CreateNotebook from './CreateNotebook';

const NotebooksPage = () => {
  const { login, ready, authenticated } = usePrivy();
  const { userAnky } = usePWA();

  const [displayCreateNotebook, setDisplayCreateNotebook] = useState(false);
  let tokenboundClient;
  const address = userAnky.wallet.address;
  const tokenId = userAnky.ankyIndex;
  let provider;
  let signer;
  console.log('the user anky is: 0', userAnky);

  useEffect(() => {
    const setup = async () => {
      provider = await userAnky.wallet.getEthersProvider();
      signer = await provider.getSigner();
      tokenboundClient = new TokenboundClient({ signer, chainId: 84531 });
      const account = await tokenboundClient.getAccount({
        tokenContract: '0x4C890Ef00257df4fC311137b584f1B2be6fbAf62',
        tokenId: tokenId,
      });
      console.log('the account is:', account);

      const preparedExecuteCall = await tokenboundClient.prepareExecuteCall({
        account: account,
        to: account,
        value: 0n,
        data: '',
      });

      const preparedAccount = await tokenboundClient.prepareCreateAccount({
        tokenContract: '0x4C890Ef00257df4fC311137b584f1B2be6fbAf62',
        tokenId: tokenId,
      });

      console.log('getAccount', account);
      console.log('prepareExecuteCall', preparedExecuteCall);
      console.log('preparedAccount', preparedAccount);
    };
    setup();
  }, []);

  const createAccount = useCallback(async () => {
    if (!tokenboundClient || !address) return;
    const createdAccount = await tokenboundClient.createAccount({
      tokenContract: '0x4C890Ef00257df4fC311137b584f1B2be6fbAf62',
      tokenId: tokenId,
    });
    alert(`new account: ${createdAccount}`);
  }, [tokenboundClient]);

  const executeCall = useCallback(async () => {
    if (!tokenboundClient || !userAnky) return;
    const executedCall = await tokenboundClient.executeCall({
      account: address,
      to: address,
      value: 0n,
      data: '0x',
    });
  }, [tokenboundClient]);

  if (!ready) return null;

  if (!userAnky.wallet) {
    // Use Privy login instead of wagmi's connect
    return <Link href='/explore'>setup</Link>;
  }

  return (
    <div>
      <div className='bg-red-200 p-2'>
        <button onClick={() => setDisplayCreateNotebook(true)}>
          create notebook
        </button>
        <p>{userAnky.wallet.address}</p>
        <button onClick={() => executeCall()}>EXECUTE CALL</button>
        <button onClick={() => createAccount()}>CREATE ACCOUNT</button>
      </div>
      {displayCreateNotebook && <CreateNotebook userAnky={userAnky} />}
    </div>
  );
};

export default NotebooksPage;
