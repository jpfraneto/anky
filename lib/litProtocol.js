import * as LitJsSdk from '@lit-protocol/lit-node-client';

const litNodeClient = new LitJsSdk.LitNodeClient({
  litNetwork: 'serrano',
});
await litNodeClient.connect();

const authSig = await LitJsSdk.checkAndSignAuthMessage({
  chain: 'baseGoerli',
});

const accs = [
  {
    contractAddress: '',
    standardContractType: '',
    chain: 'baseGoerli',
    method: 'eth_getBalance',
    parameters: [':userAddress', 'latest'],
    returnValueTest: {
      comparator: '>=',
      value: '0',
    },
  },
];

const res = await LitJsSdk.encryptString('This test is working! Omg!');

const encryptedString = res.encryptedString;
const symmetricKey = res.symmetricKey;

const base64EncryptedString = await LitJsSdk.blobToBase64String(
  encryptedString
);

const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
  accessControlConditions: accs,
  symmetricKey: symmetricKey,
  authSig: authSig,
  chain: 'baseGoerli',
});

const toDecrypt = await LitJsSdk.uint8arrayToString(
  encryptedSymmetricKey,
  'base16'
);

const encryptionKey = await litNodeClient.getEncryptionKey({
  accessControlConditions: accs,
  toDecrypt: toDecrypt,
  authSig: authSig,
  chain: 'baseGoerli',
});

const blob = LitJsSdk.base64StringToBlob(base64EncryptedString);

const decryptedString = await LitJsSdk.decryptString(blob, encryptionKey);

console.log('decryptedString:', `${decryptedString}`);
