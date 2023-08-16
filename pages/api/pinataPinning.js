import axios from 'axios';
const FormData = require('form-data');
const fs = require('fs');
const JWT = process.env.PINATA_JWT;
const crypto = require('crypto');

export default async function (req, res) {
  if (req.method !== 'POST') {
    return res.status(401);
  }
  try {
    console.log('PINNING YOUR ANKY');
    const { imageUrl, name, bio } = req.body;
    const id = crypto.randomBytes(16).toString('hex');
    const result = await pinFileToIPFS(imageUrl, id);
    console.log('the pinned image info is: ', result);

    const metadataResult = await uploadMetadata(id, name, bio, result.IpfsHash);
    console.log('the pinned metadata info is: ', metadataResult);
    res.json({
      message: `The metadata was pinned successfully here: ipfs://${metadataResult.IpfsHash}`,
    });
  } catch (error) {
    console.log('The error is: ', error);
    res
      .status(500)
      .json({ message: 'There was an error pinning the files to pinata' });
  }
}

const pinFileToIPFS = async (upscaledImageUrl, id) => {
  // Download image from the URL

  try {
    // 1. Get the image as a stream

    // Download image from the URL
    const response = await axios.get(upscaledImageUrl, {
      responseType: 'arraybuffer',
    });

    const formData = new FormData();

    // Convert the downloaded image data to a readable stream
    const file = Buffer.from(response.data, 'binary');
    formData.append('file', file, {
      // You need to define the filename and mimetype for the FormData
      filename: `${id}.png`,
      contentType: 'image/png',
    });

    const pinataMetadata = JSON.stringify({
      name: `${id}.png`,
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', pinataOptions);

    const result = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${JWT}`,
        },
      }
    );
    console.log('this is the result', result.data);
    return result.data;
  } catch (error) {
    console.log(error);
  }
};

const uploadMetadata = async (id, name, bio, CID) => {
  try {
    const data = JSON.stringify({
      pinataContent: {
        name: `${name}`,
        bio: `${bio}`,
        image: `ipfs://${CID}`,
      },
      pinataMetadata: {
        name: `${id}-metadata`,
      },
    });
    console.log('Uploading the metadata: ', data);

    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: data,
    });
    const resData = await res.json();
    console.log('Metadata uploaded, CID:', resData.IpfsHash);
    return resData.IpfsHash;
  } catch (error) {
    console.log(error);
  }
};
