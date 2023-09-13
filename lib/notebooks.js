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
  console.log('The raw template is: ', rawTemplate);
  // Convert the raw data into a formatted object
  const template = {
    creator: rawTemplate[0],
    metadataURI: rawTemplate[1],
    price: ethers.utils.formatEther(rawTemplate[2]), // Convert BigNumber to a readable string in Ether
    prompts: rawTemplate[3],
    supply: ethers.utils.formatUnits(rawTemplate[4], 0), // Convert BigNumber to a readable string (assuming supply is a whole number)
  };

  return template;
}

module.exports = {
  getAvailableTemplates,
  getUserMintedNotebooks,
  processFetchedTemplate,
};
