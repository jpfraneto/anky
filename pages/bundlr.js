import React, { useState } from 'react';

const Bundlr = () => {
  const [pubKey, setPubKey] = useState(null);
  const getPubKey = async () => {
    const pubKeyRes = await (
      await fetch('http://localhost:3000/publicKey')
    ).json();
    const aloja = Buffer.from(pubKeyRes.pubKey, 'hex');
    setPubKey(aloja);
  };

  const provider = {
    // for ETH wallets
    getPublicKey: async () => {
      return pubKey;
    },
    getSigner: () => {
      return {
        getAddress: () => pubKey,
        _signTypedData: async (_domain, _types, message) => {
          let convertedMsg = Buffer.from(message['Transaction hash']).toString(
            'hex'
          );
          const res = await fetch('http://localhost:3000/signData', {
            method: 'POST',
            body: JSON.stringify({ signatureData: convertedMsg }),
          });
          const { signature } = await res.json();
          const bSig = Buffer.from(signature, 'hex');
          const pad = Buffer.concat([Buffer.from([0]), bSig]).toString('hex');
          return pad;
        },
      };
    },
    _ready: () => {},
  };

  return <div></div>;
};

export default Bundlr;
