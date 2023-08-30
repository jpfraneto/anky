const saveTextAnon = async text => {
  try {
    console.log('saving the text anon');
    const date = {
      sojourn: 1,
      wink: 19,
      kingdom: 'chryseos',
      prompt: 'What aspects of your life would you like to transform, and why?',
    };
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
    return { bundlrWritingId };
  } catch (error) {
    console.log('there was an error');
    return { error };
  }
};

module.exports = { saveTextAnon };
