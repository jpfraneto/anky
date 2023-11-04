// helpers.js
import { ethers } from 'ethers';

export const sendRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export async function sendTestEth(wallet, provider, authToken) {
  console.log('SENDING THE TEST ETH, via calling the get-initial-eth route');
  const balanceWei = await provider.getBalance(wallet.address);
  const balanceEth = ethers.utils.formatEther(balanceWei);
  console.log('the wallets balance is: ', balanceEth);
  if (Number(balanceEth) === 0) {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        wallet: wallet.address,
      }),
    };
    const initialEthTransaction = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/get-initial-eth`,
      fetchOptions
    );
    const data = await initialEthTransaction.json();
    return data;
  } else {
    return { success: true };
  }
}

export async function airdropCall(wallet, setUserAppInformation, authToken) {
  try {
    console.log('sending the call to the airdrop route', wallet.address);
    console.log(
      'The call is being sent to:',
      `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/airdrop`
    );
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/airdrop`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          wallet: wallet.address,
        }),
      }
    );
    const data = await response.json();
    return {
      success: true,
      ankyIndex: data.userAnkyIndex,
      tokenUri: data.tokenUri,
    };
  } catch (error) {
    console.log('The airdrop was not successful', error);
  }
}

export async function callTba(address, setUserAppInformation) {
  try {
    console.log('calling the tba', address);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/getTBA/${address}`
    );
    const data = await response.json();
    console.log('the data is: ', data);
    return { success: true, tba: data.ankyTba };
  } catch (error) {
    console.log('The airdrop was not successful', error);
  }
}

export async function airdropFirstJournal(address, authToken) {
  try {
    console.log('calling the first journal of the user', address);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/sendFirstJournal`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          wallet: address,
        }),
      }
    );
    const data = await response.json();
    if (data) {
      return data; // Return the data which contains success and txHash
    } else {
      throw new Error('There was an error retrieving the first journal');
    }
  } catch (error) {
    console.log('The airdrop was not successful', error);
  }
}

export function generatePagePasswords(numPages) {
  const result = [];

  // Helper function to generate a random string
  function randomString(length) {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let str = '';
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return str;
  }

  for (let i = 1; i <= numPages; i++) {
    result.push(randomString(20)); // This will generate a random string of length 20. Adjust if needed.
  }

  return result;
}

// Example usage:
const passwords = generatePagePasswords(3);
console.log(passwords);
