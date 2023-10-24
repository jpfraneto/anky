import { ethers } from 'ethers';
import notebooksABI from './notebookABI.json';
import eulogiasABI from './eulogiaABI.json';
import templatesABI from './templatesABI.json';
import journalsABI from './journalsABI.json';
import AnkyDementorsAbi from '../lib/ankyDementorsAbi.json'; // Assuming you have the ABI

async function fetchUserJournals(signer) {
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_JOURNALS_CONTRACT_ADDRESS,
    journalsABI,
    signer
  );
  console.log('iIASJCO, ', contract);
  const userJournals = await contract.getUserJournals();
  console.log('the raw journal tokens are: ', userJournals);

  const userJournalsPromises = userJournals.map(tokenId =>
    contract.getJournal(ethers.utils.formatUnits(tokenId, 0))
  );

  const rawDetailedJournals = await Promise.all(userJournalsPromises);
  console.log('the raw detailed journals', rawDetailedJournals);
  const formattedJournals = formatUserJournals(rawDetailedJournals);
  const journalsWithContent = await fetchAllEntriesContent(formattedJournals);
  return journalsWithContent;
}

async function fetchUserTemplates(signer, userAddress) {
  const templatesContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_TEMPLATES_CONTRACT_ADDRESS,
    templatesABI,
    signer
  );
  console.log('the templates contract is: , ', templatesContract, userAddress);
  const userTemplatesIds = await templatesContract.getTemplatesByCreator(
    userAddress
  );
  console.log('the user templates ids is: ', userTemplatesIds);
  const templateObjects = [];
  for (const templateId of userTemplatesIds) {
    const rawTemplate = await templatesContract.getTemplate(templateId);
    console.log('th RAW template ****  is: ', rawTemplate);

    const processedTemplate = await processFetchedTemplate(rawTemplate);
    console.log('th processed template ****  is: ', processedTemplate);
    templateObjects.push(processedTemplate);
  }
  console.log('we finished fetching the templates: ', templateObjects);
  return templateObjects;
}

async function fetchUserNotebooks(signer, userTba) {
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
    notebooksABI,
    signer
  );
  console.log('the contract is: ', contract);
  console.log('the wallet is: ', userTba);

  const notebookIds = await contract.getOwnedNotebooks(userTba);
  console.log('the user notebook IDs are : ', notebookIds);

  // Create an instance for templates contract (assuming it's the same ABI and signer)
  const templatesContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_TEMPLATES_CONTRACT_ADDRESS, // Assuming templates are fetched from the Eulogias contract
    templatesABI,
    signer
  );

  // Fetch full notebook object for each notebook ID
  const notebookObjects = [];
  for (const notebookId of notebookIds) {
    console.log('BEFORE HERE', notebookId);
    const rawNotebookObject = await contract.getFullNotebook(notebookId);

    const rawTemplate = await templatesContract.getTemplate(
      rawNotebookObject.templateId
    );
    const processedTemplate = await processFetchedTemplate(rawTemplate);

    const processedNotebook = await processFetchedNotebook(rawNotebookObject);
    processedNotebook.notebookId = notebookId;
    const combinedNotebookData = {
      ...processedNotebook,
      template: processedTemplate,
    };
    console.log('the combined notebook data is: ', combinedNotebookData);
    notebookObjects.push(combinedNotebookData);
  }

  return notebookObjects;
}

async function fetchUserEulogias(signer) {
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
    eulogiasABI,
    signer
  );
  console.log('contact', contract);
  const [userCreatedEulogias, userWrittenEulogias] =
    await contract.getUserEulogias();
  const allUserEulogias = [...userCreatedEulogias, ...userWrittenEulogias];
  console.log('the user eulogias are: ', allUserEulogias);
  const eulogiaDataArray = [];
  for (let i = 0; i < allUserEulogias.length; i++) {
    const thisEulogiaId = allUserEulogias[i];
    console.log('******_^^^SDPS^D', thisEulogiaId);
    const eulogiaData = await contract.getEulogia(thisEulogiaId);
    console.log('the eulogia data', eulogiaData);
    const processedEulogia = await processFetchedEulogia(eulogiaData);
    console.log('the processed eulogia', processedEulogia);
    processedEulogia.eulogiaId = thisEulogiaId;
    eulogiaDataArray.push(processedEulogia);
  }
  console.log('OUT HERE', eulogiaDataArray);
  return eulogiaDataArray;
}

async function fetchUserDementors(signer) {
  const ankyDementorsContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_ANKY_DEMENTORS_CONTRACT,
    AnkyDementorsAbi,
    signer
  );
  console.log('ankyu deemeentors contract', ankyDementorsContract);
  const userDementors = await ankyDementorsContract.getUserDementors();
  console.log('the user dementors are: ', userDementors);
  const dementorsDataArray = [];
  for (let i = 0; i < userDementors.length; i++) {
    const dementorId = userDementors[i];
    console.log('the dementor id is: ', dementorId);
    const dementorData = await ankyDementorsContract.getDementor(dementorId);
    console.log('the dementor data is: ', dementorData);
    const processedDementor = await processFetchedDementor(dementorData);
    console.log('the processed dementor is: ', processedDementor);
    processedDementor.dementorId = dementorId;
    dementorsDataArray.push(processedDementor);
  }

  return dementorsDataArray;
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

async function processFetchedDementor(rawDementor) {
  try {
    // Check and modify the metadataURI if it starts with "https://arweave.net/"
    console.log('the raw dementor is', rawDementor);
    let intro = await metadataUrlToObject(rawDementor.introCID);

    console.log('the intro is: ', intro);

    const dementorPagesWithAdditionalData = [];

    for (const dementorPage of rawDementor.pages) {
      console.log('the dementor Page is: ', dementorPage);
      let pagePromptsContentFromArweave,
        pageWritingsContentFromArweave,
        thisPagePromptsArray,
        thisPageWritingsArray;

      if (dementorPage.promptCID.length > 0) {
        pagePromptsContentFromArweave = await fetchPageDataFromArweave(
          dementorPage.promptCID
        );
        const pagePromptsContent = JSON.parse(
          JSON.parse(pagePromptsContentFromArweave)
        );
        thisPagePromptsArray = pagePromptsContent.prompts.split('%%');
      } else {
        thisPagePromptsArray = [];
      }
      if (dementorPage.userWritingCID.length > 0) {
        pageWritingsContentFromArweave = await fetchPageDataFromArweave(
          dementorPage.userWritingCID
        );
        thisPageWritingsArray = pageWritingsContentFromArweave.split('---');
      } else {
        thisPageWritingsArray = [];
      }

      const pageCreationTimestamp = dementorPage.creationTimestamp.toNumber();
      const pageWritingTimestamp = dementorPage.writingTimestamp.toNumber();
      dementorPagesWithAdditionalData.push({
        prompts: thisPagePromptsArray,
        writings: thisPageWritingsArray,
        creationTimestamp: pageCreationTimestamp,
        writingTimestamp: pageWritingTimestamp,
      });
    }
    const processedDementor = {
      intro,
      pages: dementorPagesWithAdditionalData,
      currentPage: rawDementor.currentPage.toNumber(),
    };
    console.log('in here, the processed dementor is: ', processedDementor);

    // Convert the raw data into a formatted object
    return processedDementor;
  } catch (error) {
    console.error('Error processing the fetched template:', error);
    throw error; // Re-throw the error after logging to ensure it's handled further up
  }
}

function appendArweave(str) {
  const arweavePrefix = 'https://arweave.net/';
  if (str && str.startsWith(arweavePrefix)) {
    str.replace(arweavePrefix, '');
  }
  return arweavePrefix + str;
}

async function processFetchedTemplate(rawTemplate) {
  console.log('IN HERES', rawTemplate);
  try {
    // Check and modify the metadataURI if it starts with "https://arweave.net/"
    let modifiedMetadataURI = rawTemplate.metadataCID;
    const arweavePrefix = 'https://arweave.net/';
    if (modifiedMetadataURI && modifiedMetadataURI.startsWith(arweavePrefix)) {
      modifiedMetadataURI = modifiedMetadataURI.replace(arweavePrefix, '');
    }

    // Convert the raw data into a formatted object
    const metadata = await metadataUrlToObject(modifiedMetadataURI);
    console.log('the metadata for this template is: ', metadata);
    const template = {
      creator: rawTemplate.creator,
      metadata,
      price: ethers.utils.formatEther(rawTemplate.price), // Convert BigNumber to a readable string in Ether
      templateId: rawTemplate.templateId,
      supply: ethers.utils.formatUnits(rawTemplate.supply, 0), // Convert BigNumber to a readable string (assuming supply is a whole number)
    };

    return template;
  } catch (error) {
    console.error('Error processing the fetched template:', error);
    throw error; // Re-throw the error after logging to ensure it's handled further up
  }
}

async function processFetchedNotebook(rawNotebook) {
  try {
    const userPagesWithAdditionalData = [];

    for (const userPage of rawNotebook.userPages) {
      const pageContentFromArweave = await fetchPageDataFromArweave(
        userPage.arweaveCID
      );
      userPagesWithAdditionalData.push({
        arweaveCID: userPage.arweaveCID,
        timestamp: userPage.timestamp,
        pageContent: pageContentFromArweave,
      });
    }
    const processedNotebook = {
      isVirgin: rawNotebook.isVirgin,
      templateId: rawNotebook.templateId,
      userPages: userPagesWithAdditionalData,
    };

    return processedNotebook;
  } catch (error) {
    console.error('Error processing the fetched notebook:', error);
    throw error; // Re-throw the error after logging to ensure it's handled further up
  }
}

async function processFetchedEulogia(rawEulogia) {
  try {
    // Extract metadata URI
    const metadataURI = rawEulogia.metadataURI;
    console.log('inside here in the eulogia processing: ', metadataURI);
    // Check and modify the metadataURI if it starts with "https://arweave.net/"
    let modifiedMetadataURI = metadataURI;
    const arweavePrefix = 'https://arweave.net/';
    if (modifiedMetadataURI.startsWith(arweavePrefix)) {
      modifiedMetadataURI = modifiedMetadataURI.replace(arweavePrefix, '');
    }

    // Fetch metadata from Arweave
    const metadata = await fetchJSONDataFromArweave(modifiedMetadataURI);
    metadata.coverImageUrl = `https://ipfs.io/ipfs/${metadata.coverImageCid}`;
    metadata.backgroundImageUrl = `https://ipfs.io/ipfs/${metadata.backgroundImageCid}`;

    // Fetch content for each message using the cid
    const fetchContentFromCID = async cid => {
      const contentURL = `${arweavePrefix}${cid}`; // Assuming CID is on Arweave
      const response = await fetch(contentURL);
      return await response.text(); // assuming the content is text
    };

    // Process messages
    const processedMessages = await Promise.all(
      rawEulogia.messages.map(async message => {
        const content = await fetchPageDataFromArweave(message.cid);
        return {
          writer: message.writer,
          whoWroteIt: message.whoWroteIt,
          cid: message.cid,
          content, // the fetched content
          timestamp: message.timestamp.toNumber(), // Convert BigNumber to regular number
        };
      })
    );

    // Create a formatted eulogia object
    const eulogia = {
      metadata,
      maxMessages: rawEulogia.maxMessages.toNumber(), // Convert BigNumber to regular number
      messages: processedMessages,
      messageCount: processedMessages.length,
    };

    console.log('HHHASIDAIUHA', eulogia);

    return eulogia;
  } catch (error) {
    console.error('Error processing the fetched Eulogia:', error);
    throw error;
  }
}

async function formatUserJournal(rawJournal) {
  const formattedEntries = await Promise.all(
    rawJournal[4].map(async entry => {
      const cid = entry[0];
      const pageContent = await fetchPageDataFromArweave(cid);
      return {
        cid: cid,
        timestamp: ethers.utils.formatUnits(entry[1], 0),
        isPublic: entry[2],
        text: pageContent,
      };
    })
  );

  return {
    journalType: rawJournal[0],
    pagesLeft: rawJournal[1],
    journalId: rawJournal[2],
    metadataCID: rawJournal[3],
    entries: formattedEntries,
  };
}

async function formatUserTemplates(rawTemplate) {
  const formattedMetadata = await fetchPageDataFromArweave(
    rawTemplate.metadataCID
  );
  const formattedTemplate = {
    creator: rawTemplate.creator,
    lastCreatedTimestamp: Number(
      ethers.utils.formatUnits(rawTemplate.lastCreatedTimestamp, 0)
    ),
    metadata: formattedMetadata,
    numberOfPrompts: Number(
      ethers.utils.formatUnits(rawTemplate.numberOfPrompts, 0)
    ),
    price: Number(ethers.utils.formatUnits(rawTemplate.price, 0)),
    supply: Number(ethers.utils.formatUnits(rawTemplate.supply, 0)),
    templateId: rawTemplate.templateId,
  };
  return formattedTemplate;
}

// Function to format the raw journals
function formatUserJournals(rawJournals) {
  return rawJournals.map(journal => {
    console.log('in here, the journal iasakdls: ', journal);
    return {
      journalType: journal[0],
      pagesLeft: journal[1],
      journalId: journal[2],
      metadataCID: journal[3],
      entries: journal[4].map(entry => {
        console.log('the entry is: ', entry);
        return {
          cid: entry[0],
          timestamp: ethers.utils.formatUnits(entry[1], 0),
          isPublic: entry[2],
        };
      }),
    };
  });
}

// Function to fetch content from Arweave for each entry's cid
async function fetchAllEntriesContent(formattedJournals) {
  // Loop over each journal
  for (let journal of formattedJournals) {
    // Loop over each entry inside the journal
    for (let entry of journal.entries) {
      try {
        entry.content = await fetchPageDataFromArweave(entry.cid);
      } catch (error) {
        console.error(`Error fetching content for CID: ${entry.cid}`, error);
      }
    }
  }
  return formattedJournals;
}

async function fetchJSONDataFromArweave(arweaveCID) {
  const response = await fetch(`https://www.arweave.net/${arweaveCID}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch page data for CID: ${arweaveCID}`);
  }
  const pageContent = await response.json(); // get the string content
  return pageContent;
}

async function fetchPageDataFromArweave(arweaveCID) {
  const response = await fetch(`https://www.arweave.net/${arweaveCID}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch page data for CID: ${arweaveCID}`);
  }
  const pageContent = await response.text(); // get the string content
  return pageContent;
}

async function metadataUrlToObject(cid) {
  try {
    const response = await fetch(`https://www.arweave.net/${cid}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('There was a problem with fetching the metadata:', error);
  }
}

async function fetchArweaveContent(cids) {
  const contentArray = await Promise.all(
    cids.map(async (cid, index) => {
      try {
        const response = await fetch(
          `https://www.arweave.net/${cid.arweaveCID}`
        );
        const text = await response.text();
        return {
          text: text,
          pageIndex: index + 1,
          written: !!text, // true if there's text, false if not
        };
      } catch (error) {
        console.error('Error fetching Arweave content', error);
        return {
          text: '',
          pageIndex: index + 1,
          written: false,
        };
      }
    })
  );
  return contentArray;
}

module.exports = {
  getUserMintedNotebooks,
  processFetchedTemplate,
  processFetchedEulogia,
  metadataUrlToObject,
  fetchArweaveContent,
  processFetchedNotebook,
  formatUserJournal,
  fetchAllEntriesContent,
  formatUserJournals,
  fetchUserTemplates,
  fetchUserEulogias,
  fetchUserNotebooks,
  fetchUserJournals,
  fetchUserDementors,
  processFetchedDementor,
};
