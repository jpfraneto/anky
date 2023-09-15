import { ethers } from 'ethers';

async function getAvailableTemplates() {
  let provider = await thisWallet.getEthersProvider();
  const notebookContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
    notebookContractABI,
    provider
  );

  let templateCount = await notebookContract.templateCount();

  let templates = [];
  for (let i = 1; i <= templateCount; i++) {
    let template = await notebookContract.notebookTemplates(i);
    let minted = await notebookContract.totalSupply(i);

    templates.push({
      ...template,
      minted,
    });
  }
  return templates;
}

async function getUserMintedNotebooks(userAddress) {
  let provider = await thisWallet.getEthersProvider();
  const notebookContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
    notebookContractABI,
    provider
  );

  let templateCount = await notebookContract.templateCount();

  let userNotebooks = [];
  for (let i = 1; i <= templateCount; i++) {
    let balance = await notebookContract.balanceOf(userAddress, i);
    if (balance.gt(0)) {
      let template = await notebookContract.notebookTemplates(i);
      userNotebooks.push(template);
    }
  }

  return userNotebooks;
}

async function processFetchedTemplate(rawTemplate) {
  console.log('IN HERES', rawTemplate);
  try {
    // Convert the raw data into a formatted object
    const metadata = await metadataUrlToObject(rawTemplate.metadataURI);
    console.log('the metadata for this template is: ', metadata);
    const template = {
      creator: rawTemplate.creator,
      metadata,
      price: ethers.utils.formatEther(rawTemplate.price), // Convert BigNumber to a readable string in Ether
      prompts: rawTemplate.prompts,
      supply: ethers.utils.formatUnits(rawTemplate.supply, 0), // Convert BigNumber to a readable string (assuming supply is a whole number)
    };

    return template;
  } catch (error) {
    console.error('Error processing the fetched template:', error);
    throw error; // Re-throw the error after logging to ensure it's handled further up
  }
}

async function metadataUrlToObject(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('There was a problem with fetching the metadata:', error);
  }
}

module.exports = {
  getAvailableTemplates,
  getUserMintedNotebooks,
  processFetchedTemplate,
  metadataUrlToObject,
};
