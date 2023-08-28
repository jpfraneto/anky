const saveTextAnon = async text => {
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
  return { 123: 456 };
};

module.exports = { saveTextAnon };
