import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { ethConnect } from "@lit-protocol/auth-browser";

const client = new LitJsSdk.LitNodeClient({
  litNetwork: "cayenne",
});

class Lit {
  litNodeClient;
  async connect() {
    await client.connect();
    this.litNodeClient = client;
  }
}
export default new Lit();

async function generateNewEncryptionVariables({ wallet }) {
  if (!wallet) return alert("please connect your privy wallet");
  const provider = await wallet.getEthersProvider();

  //this has to be on page load.
  const litNodeClient = new LitJsSdk.LitNodeClient({
    litNetwork: "jalapeno",
  });
  await litNodeClient.connect();

  // const authSig = await LitJsSdk.checkAndSignAuthMessage({
  //   chain: 'ethereum',
  // });

  const authSig = await ethConnect.signAndSaveAuthMessage({
    web3: provider,
    account: wallet.address,
    chainId: 8453,
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  });
  console.log("the auth sig is: ", authSig);

  const accs = [
    {
      contractAddress: "0xc8d33EdFDD29CCe3eC58D6AD47582B1E38529634",
      standardContractType: "ERC721",
      chain: "baseGoerli",
      method: "ownerOf",
      parameters: [":userAddress"],
      returnValueTest: {
        comparator: ">",
        value: "0",
      },
    },
  ];

  return { litNodeClient, authSig, accs };
}

async function encryptStringWithLit({
  litNodeClient,
  authSig,
  accs,
  stringToEncrypt,
}) {
  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    {
      accessControlConditions: accs,
      authSig: authSig,
      chain: "baseGoerli",
      dataToEncrypt: stringToEncrypt,
    },
    litNodeClient
  );
  console.log("THE ENCRYPT RES IS: ", ciphertext, dataToEncryptHash);
  return { ciphertext, dataToEncryptHash };
}

async function decryptStringWithLit({
  litNodeClient,
  authSig,
  accs,
  ciphertext,
  dataToEncryptHash,
}) {
  const decryptedString = await LitJsSdk.decryptToString(
    {
      accessControlConditions: accs,
      ciphertext: ciphertext,
      dataToEncryptHash: dataToEncryptHash,
      authSig: authSig,
      chain: "baseGoerli",
    },
    litNodeClient
  );
  return decryptedString;
}

module.exports = {
  generateNewEncryptionVariables,
  encryptStringWithLit,
  decryptStringWithLit,
};
