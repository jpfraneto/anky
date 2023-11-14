import Editor from '@monaco-editor/react';
import { benchmark } from '../lib/utils';
import React, { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';

const LitProtocol = () => {
  const [appName, setAppName] = useState('anky');
  const [lang, setLang] = useState('json');
  const [primero, setPrimero] = useState('');
  const [segundo, setSegundo] = useState('');
  const [data, setData] = useState({
    data: {
      name: 'anky',
      description: 'write as if the world was going to end.',
    },
  });
  const [str, setStr] = useState('The test is working!');
  const { wallets } = useWallets();
  const wallet = wallets[0];

  const go = async () => {
    if (!wallet) return alert('please connect your privy wallet');
    const provider = await wallet.getEthersProvider();

    console.log('the sdk is: ', LitJsSdk);

    // const client = new LitJsSdk.LitNodeClient({
    //   litNetwork: 'jalapeno',
    // });
    // await client.connect();
    // window.litNodeClient = client;
    // console.log('the litNodeClient is: ', client);

    // const authSig = await ethConnect.signAndSaveAuthMessage({
    //   web3: provider,
    //   account: wallet.address,
    //   chainId: 8453,
    //   expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    // });
    // // const authSig = await LitJsSdk.checkAndSignAuthMessage({
    // //   chain: 'baseGoerli',
    // // });
    // console.log('the auth sig is: ', authSig);

    // const accs = [
    //   {
    //     contractAddress: '0xc8d33EdFDD29CCe3eC58D6AD47582B1E38529634',
    //     standardContractType: 'ERC721',
    //     chain: 'baseGoerli',
    //     method: 'ownerOf',
    //     parameters: [':userAddress'],
    //     returnValueTest: {
    //       comparator: '>',
    //       value: '0',
    //     },
    //   },
    // ];

    // console.log('NETWORK PUB KEY:', client.networkPubKey);
    // // --------- NEXT STEP ---------
    // const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    //   {
    //     accessControlConditions: accs,
    //     authSig: authSig,
    //     chain: 'baseGoerli',
    //     dataToEncrypt: str,
    //   },
    //   client
    // );
    // // --------- NEXT STEP ---------
    // console.log('*****************before the decryption************');
    // console.log(accs);
    // console.log(ciphertext);
    // console.log(dataToEncryptHash);
    // console.log(authSig);
    // console.log(client);

    // const decryptedText = await LitJsSdk.decryptToString(
    //   {
    //     accessControlConditions: accs,
    //     ciphertext: ciphertext,
    //     dataToEncryptHash: dataToEncryptHash,
    //     authSig: authSig,
    //     chain: 'baseGoerli',
    //   },
    //   client
    // );
    // console.log('the decrypted text is: ', decryptedText);
    // const decryptRes = await LitJsSdk.decryptToString(
    //   {
    //     accessControlConditions: accs,
    //     ciphertext: ciphertext,
    //     dataToEncryptHash: dataToEncryptHash,
    //     authSig: authSig,
    //     chain: 'baseGoerli',
    //   },
    //   litNodeClient
    // );
    // console.log('THE DECRYPT RESSSSSS IS: ', decryptRes);
  };

  const decryptString = async () => {
    const provider = await wallet.getEthersProvider();

    const litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: 'jalapeno',
    });
    await litNodeClient.connect();
    const authSig = await LitJsSdk.ethConnect.signAndSaveAuthMessage({
      web3: provider,
      account: wallet.address,
      chainId: 8453,
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    });
    // const authSig = await LitJsSdk.checkAndSignAuthMessage({
    //   chain: 'baseGoerli',
    // });
    const accs = [
      {
        contractAddress: '0xc8d33EdFDD29CCe3eC58D6AD47582B1E38529634',
        standardContractType: 'ERC721',
        chain: 'baseGoerli',
        method: 'ownerOf',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '>',
          value: '0',
        },
      },
    ];
    const decryptRes = await LitJsSdk.decryptToString(
      {
        accessControlConditions: accs,
        ciphertext: cypherTEXT,
        dataToEncryptHash: otherData,
        authSig: authSig,
        chain: 'baseGoerli',
      },
      litNodeClient
    );
    console.log('THE DECRYPTED ISsssss IS: ', decryptRes);
  };

  return (
    <div className='w-4/5 mx-auto h-4/5 text-white'>
      <header>
        <h4>
          React Demo for: {appName}
          <br />
        </h4>
        <button onClick={decryptString}>decrypt</button>
        {primero && <p className='text-white'>PRIMERO: {primero}</p>}
        {segundo && <p className='text-white'>SEGUNDO: {segundo}</p>}
        <table>
          <tr>
            <td>
              <label>String</label>
            </td>
          </tr>
          <tr>
            <td>
              <input
                type='text'
                className='text-black p-2 rounded-xl'
                value={str}
                onChange={newStr => {
                  setStr(newStr.target.value);
                }}
              />
            </td>
          </tr>
        </table>

        <button onClick={go}>Encrypt & Decrypt String!</button>
      </header>

      <div className='editor mt-4'>
        <Editor
          theme='vs-dark'
          height='30vh'
          language={lang}
          value={lang === 'json' ? JSON.stringify(data, null, 2) : `${data}`}
          options={{
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
};

export default LitProtocol;
