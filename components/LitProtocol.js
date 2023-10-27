import * as LitJsSdk from '@lit-protocol/lit-node-client';
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
  console.log('this wallet is: ', wallet);

  const go = async () => {
    if (!wallet) return alert('please connect your privy wallet');
    console.log('inside the go, the wallet is: ', wallet);
    const provider = await wallet.getEthersProvider();
    console.log('the provider is: ', provider);
    let code = `import * as LitJsSdk from '@lit-protocol/lit-node-client';

      const litNodeClient = new LitJsSdk.LitNodeClient({
        litNetwork: 'cayenne',
      });
      await litNodeClient.connect();

      // { ms }
      // { Loading... }
      const authSig = await ethConnect.signAndSaveAuthMessage({
        web3: provider,
        account: wallet.address,
        chainId: 84531,
        expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      });

      const accs = [
        {
          contractAddress: '0xc8d33EdFDD29CCe3eC58D6AD47582B1E38529634',
          standardContractType: '',
          chain: 'baseGoerli',
          method: 'members',
          parameters: [':userAddress'],
          returnValueTest: {
            comparator: "=",
            value: "true",
          },
        },
      ];

      // { ms }
      const res = await LitJsSdk.encryptString({
        accessControlConditions: accs,
        authSig,
        chain: 'baseGoerli',
        dataToEncrypt: '${str}',
      }, litNodeClient);

      // { Loading... }
      const ciphertext = res.ciphertext;
      setPrimero(ciphertext);

      // { Loading... }
      const dataToEncryptHash = res.dataToEncryptHash;
      setSegundo(dataToEncryptHash);

      // { ms }
      // { Loading... }
      const decryptedString = await LitJsSdk.decryptToString({
        accessControlConditions: accs,
        ciphertext,
        dataToEncryptHash,
        authSig: authSig,
        chain: 'baseGoerli',
      });

      console.log("decryptedString:", "Loading...");

      `;
    setLang('javascript');
    setData(code);

    const litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: 'cayenne',
    });
    await litNodeClient.connect();

    const authRes = await benchmark(async () => {
      return LitJsSdk.checkAndSignAuthMessage({
        chain: 'baseGoerli',
      });
    });
    code = code.replace('// { ms }', `// { ${authRes.duration} }`);
    code = code.replace(
      '// { Loading... }',
      `// { ${JSON.stringify(authRes.result)} }`
    );
    setData(code);
    const accs = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: 'members',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: 'true',
        },
      },
    ];

    console.log('NETWORK PUB KEY:', litNodeClient.networkPubKey);

    // --------- NEXT STEP ---------
    const encryptRes = await benchmark(async () => {
      return LitJsSdk.encryptString(
        {
          accessControlConditions: accs,
          authSig: authRes.result,
          chain: 'ethereum',
          dataToEncrypt: str,
        },
        litNodeClient
      );
    });

    code = code.replace('// { ms }', `// { ${encryptRes.duration} }`);
    code = code.replace(
      '// { Loading... }',
      `// [string] { ${encryptRes.result.ciphertext} }`
    );
    code = code.replace(
      '// { Loading... }',
      `// [Uint8Array] { ${JSON.stringify(
        encryptRes.result.dataToEncryptHash
      )} }`
    );
    setData(code);

    // --------- NEXT STEP ---------
    const decryptRes = await benchmark(async () => {
      return LitJsSdk.decryptToString(
        {
          accessControlConditions: accs,
          ciphertext: encryptRes.result.ciphertext,
          dataToEncryptHash: encryptRes.result.dataToEncryptHash,
          authSig: authRes.result,
          chain: 'ethereum',
        },
        litNodeClient
      );
    });

    code = code.replace('// { ms }', `// { ${decryptRes.duration} }`);
    code = code.replace(
      '// { Loading... }',
      `// [string] ${decryptRes.result}`
    );
    code = code.replace('"Loading..."', `"${decryptRes.result}"`);
    setData(code);
    setPrimero(ciphertext);
    setSegundo(dataToEncryptHash);
  };
  return (
    <div className='w-4/5 mx-auto h-4/5 text-white'>
      <header>
        <h4>
          React Demo for: {appName}
          <br />
        </h4>
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
                className='text-black'
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

      <div className='editor'>
        <Editor
          theme='vs-dark'
          height='100vh'
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
