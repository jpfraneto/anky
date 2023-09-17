import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import AnkyEulogiasAbi from '../../lib/eulogiaABI.json';
import { useRouter } from 'next/router';
import { processFetchedEulogia } from '../../lib/notebooks.js';
import { ethers } from 'ethers';
import Button from '../Button';
import WritingGameComponent from '../WritingGameComponent';

const IndividualEulogiaDisplayPage = ({ setLifeBarLength, lifeBarLength }) => {
  const router = useRouter();
  const [eulogia, setEulogia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadWritingGame, setLoadWritingGame] = useState(false);
  const [writingGameProps, setWritingGameProps] = useState(null);
  const [text, setText] = useState('');
  const [provider, setProvider] = useState(null);
  const { wallets } = useWallets();

  const thisWallet = wallets[0];

  useEffect(() => {
    async function fetchEulogia() {
      try {
        if (!thisWallet) return;

        let fetchedProvider = await thisWallet.getEthersProvider();
        setProvider(fetchedProvider);
        let signer = await fetchedProvider.getSigner();

        const eulogiasContract = new ethers.Contract(
          process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
          AnkyEulogiasAbi,
          signer
        );

        console.log(router);
        const eulogiaID = router.query.id;
        const thisEulogia = await eulogiasContract.getEulogia(eulogiaID);
        const formattedEulogia = await processFetchedEulogia(thisEulogia);
        formattedEulogia.eulogiaID = eulogiaID;

        if (formattedEulogia) {
          setEulogia(formattedEulogia);
          setLoading(false);
        } else {
          throw Error('No eulogia');
        }
      } catch (error) {
        console.log(error);
        console.log('There was an error.');
      }
    }
    fetchEulogia();
  }, [thisWallet]);

  const onFinish = async () => {
    alert(
      'here goes all the functionality for saving what the user wrote: ',
      text
    );
  };

  const writeOnEulogia = async () => {
    const writingGameParameters = {
      notebookType: 'eulogia',
      targetTime: 480,
      notebookTypeId: eulogia.eulogiaID,
      backgroundImage: eulogia.metadata.backgroundImage || null,
      prompt: eulogia.metadata.description,
      musicUrl: 'https://www.youtube.com/watch?v=HcKBDY64UN8',
      onFinish,
    };
    setWritingGameProps(writingGameParameters);
    console.log('the writing game parameters are :', writingGameParameters);
    setLoadWritingGame(true);
  };

  if (loading) return <p>loading...</p>;
  console.log('The eulogia is: ', eulogia);
  if (loadWritingGame)
    return (
      <div className='relative w-screen h-screen'>
        <WritingGameComponent
          {...writingGameProps}
          text={text}
          setLifeBarLength={setLifeBarLength}
          lifeBarLength={lifeBarLength}
          setText={setText}
        />
      </div>
    );
  return (
    <div className='text-white'>
      <h2 className='text-4xl my-2'>{eulogia.metadata.title}</h2>
      <p className='italic text-2xl mb-4'>{eulogia.metadata.description}</p>
      <p>You have been invited to write in this eulogia.</p>
      <p>What you will write here will stay forever associated with it.</p>
      <p>Are you ready?</p>
      <div className='mt-3  '>
        <Button
          buttonText='write'
          buttonColor='bg-purple-500 w-48 mx-auto'
          buttonAction={writeOnEulogia}
        />
      </div>
    </div>
  );
};

export default IndividualEulogiaDisplayPage;
