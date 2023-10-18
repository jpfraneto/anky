import { getAnkyverseDay } from './ankyverse';

const airdropAnky = async wallet => {
  try {
    const serverResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/airdrop`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ wallet }),
      }
    );
    console.log('The server response is: ', serverResponse);
    const airdrop = await serverResponse.json();
    console.log('The airdrop of the anky was successful', airdrop);
    return airdrop;
  } catch (error) {
    console.log('there was an error', error);
    return { error };
  }
};

const createTBA = async wallet => {
  try {
    const serverResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/blockchain/createTBA/${wallet}`
    );
    console.log('The server response is: ', serverResponse);
    const tbaAddress = await serverResponse.json();
    console.log("The tba address is: '", tbaAddress);
    return tbaAddress;
  } catch (error) {
    console.log('there was an error', error);
    return { error };
  }
};

const saveTextAnon = async (text, prompt) => {
  try {
    const date = getAnkyverseDay(new Date());
    const serverResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/upload-writing`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text, date: date }),
      }
    );
    console.log('The server response is: ', serverResponse);
    const bundlrWritingId = await serverResponse.json();
    return bundlrWritingId;
  } catch (error) {
    console.log('there was an error', error);
    return { error };
  }
};

const getAnkyFromWriting = async text => {
  try {
    const serverResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/ai/create-anky-from-writing`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      }
    );
    console.log(
      'The server response after creating the Anky is: ',
      serverResponse
    );
    const newAnky = await serverResponse.json();
    console.log('The new anky is: ', newAnky);
    return newAnky;
  } catch (error) {
    console.log('There was an error getting the anky from the writing.');
  }
};

const getFeedbackFromAnky = async (text, user, prompt) => {
  try {
    const serverResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/ai/get-feedback-from-writing`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text, user, prompt }),
      }
    );
    console.log(
      'The server response after creating the Anky is: ',
      serverResponse
    );
    const feedback = await serverResponse.json();
    console.log('The feedback from your anky is: ', feedback);
    return feedback;
  } catch (error) {}
};

module.exports = {
  saveTextAnon,
  getAnkyFromWriting,
  getFeedbackFromAnky,
  createTBA,
  airdropAnky,
};
