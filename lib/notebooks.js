import { ethers } from "ethers";
import { getContainerInfoFromIrys, getDementorInfoFromIrys } from "./irys";
import notebooksABI from "./notebookABI.json";
import eulogiasABI from "./eulogiaABI.json";
import journalsABI from "./journalsABI.json";
import AnkyDementorsAbi from "../lib/ankyDementorsAbi.json"; // Assuming you have the ABI

async function fetchUserJournals(signer, thisWallet) {
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_JOURNALS_CONTRACT_ADDRESS,
    journalsABI,
    signer
  );
  console.log("iIASJCO, ", contract);
  const userJournals = await contract.getUserJournals();
  console.log("the raw journal tokens are: ", userJournals);

  const userJournalsPromises = userJournals.map((tokenId) =>
    contract.getJournal(ethers.utils.formatUnits(tokenId, 0))
  );

  const rawDetailedJournals = await Promise.all(userJournalsPromises);
  console.log("the raw detailed journals", rawDetailedJournals);

  const formattedJournals = await formatUserJournals(
    rawDetailedJournals,
    thisWallet
  );
  console.log("the formatted journals are: ", formattedJournals);
  const journalsWithContent = await fetchAllEntriesContent(formattedJournals);
  return journalsWithContent;
}

async function fetchUserNotebooks(signer, userTba, thisWallet) {
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
    notebooksABI,
    signer
  );

  const rawNotebookIds = await contract.getUserNotebooks();
  console.log("the user notebook IDs are : ", rawNotebookIds);
  const notebookIds = rawNotebookIds.map((x) => ethers.utils.formatUnits(x, 0));
  console.log("the user notebook IDs edited are : ", notebookIds);
  // Fetch full notebook object for each notebook ID
  const notebookObjects = [];
  for (const notebookId of notebookIds) {
    console.log("BEFORE HERE", notebookId);
    const rawNotebookObject = await contract.getNotebook(notebookId);
    console.log("the raw notebook object is: ", rawNotebookObject);
    const notebookMetadata = await fetchJSONFromIrys(
      rawNotebookObject.metadataCID
    );
    console.log("the notebook metadata is: ", notebookMetadata);
    const fetchedPages = await getContainerInfoFromIrys(
      "notebook",
      notebookId,
      thisWallet.address,
      process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT
    );

    const processedNotebook = {
      notebookId: notebookId,
      pages: fetchedPages,
      metadata: notebookMetadata,
    };

    console.log("the processedNotebook notebook data is: ", processedNotebook);
    notebookObjects.push(processedNotebook);
  }

  return notebookObjects;
}

async function fetchUserEulogias(signer, thisWallet) {
  const contract = new ethers.Contract(
    process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS,
    eulogiasABI,
    signer
  );

  const userOwnedEulogias = await contract.getUserOwnedEulogias();
  console.log("the user owned eulogias are: ", userOwnedEulogias);
  const eulogiaDataArray = [];
  for (let i = 0; i < userOwnedEulogias.length; i++) {
    const thisEulogiaId = userOwnedEulogias[i];
    console.log("******_^^^SDPS^D", thisEulogiaId);
    const eulogiaData = await contract.getEulogia(thisEulogiaId);
    console.log("the eulogia data", eulogiaData);
    const processedEulogia = await processFetchedEulogia(
      eulogiaData,
      thisWallet
    );
    console.log("the processed eulogia", processedEulogia);
    processedEulogia.eulogiaId = ethers.utils.formatUnits(thisEulogiaId, 0);
    eulogiaDataArray.push(processedEulogia);
  }
  console.log("OUT HERE", eulogiaDataArray);
  return eulogiaDataArray;
}

async function fetchUserDementors(signer, wallet) {
  const ankyDementorsContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_ANKY_DEMENTORS_CONTRACT,
    AnkyDementorsAbi,
    signer
  );
  console.log("ankyu deemeentors contract", ankyDementorsContract);
  const userDementors = await ankyDementorsContract.getUserDementors();
  console.log("the user dementors are: ", userDementors);
  const dementorsDataArray = [];
  for (let i = 0; i < userDementors.length; i++) {
    const dementorId = userDementors[i];
    console.log("the dementor id is: ", dementorId);
    const thisDementor = await getIndividualDementorFormatted(
      dementorId,
      wallet
    );
    dementorsDataArray.push(thisDementor);
  }

  return dementorsDataArray;
}

async function getIndividualDementorFormatted(dementorId, wallet) {
  const provider = await wallet.getEthersProvider();
  const signer = await provider.getSigner();
  const ankyDementorsContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_ANKY_DEMENTORS_CONTRACT,
    AnkyDementorsAbi,
    signer
  );
  const dementorData = await ankyDementorsContract.getDementor(dementorId);
  const processedDementor = await processFetchedDementor(
    dementorData,
    ethers.utils.formatUnits(dementorId, 0),
    wallet
  );
  processedDementor.dementorId = ethers.utils.formatUnits(dementorId, 0);
  return processedDementor;
}

async function processFetchedDementor(rawDementor, dementorId, thisWallet) {
  try {
    // Check and modify the metadataURI if it starts with "https://arweave.net/"
    console.log("the raw dementor is", rawDementor);
    let firstPage = await metadataUrlToObject(rawDementor.firstPageCid);
    let formattedMetadata = JSON.parse(firstPage);
    console.log("the firstPage is: ", formattedMetadata);

    const processedDementor = {
      title: formattedMetadata.title,
      description: formattedMetadata.description,
      pages: [
        {
          pageNumber: 0,
          prompts: formattedMetadata.prompts.includes("%%")
            ? formattedMetadata.prompts.split("%%")
            : [formattedMetadata.prompts],
          metadataCid: rawDementor.firstPageCid,
        },
      ],
    };

    const newProcessedDementor = await getDementorInfoFromIrys(
      processedDementor,
      "dementor",
      dementorId,
      thisWallet.address
    );

    // Convert the raw data into a formatted object
    return newProcessedDementor;
  } catch (error) {
    console.error("Error processing the fetched template:", error);
    throw error; // Re-throw the error after logging to ensure it's handled further up
  }
}

function appendArweave(str) {
  const arweavePrefix = "https://arweave.net/";
  if (str && str.startsWith(arweavePrefix)) {
    str.replace(arweavePrefix, "");
  }
  return arweavePrefix + str;
}

async function newProcessFetchedNotebook(rawNotebook) {
  console.log("the raw notebook is: ", rawNotebook);
  let notebookMetadata = await fetchJSONFromIrys(rawNotebook.metadataCID);
  console.log("THE NOTEBOOK METADATA IS: ", notebookMetadata);
  let processedNotebook = {
    metadata: notebookMetadata,
    price: ethers.utils.formatEther(rawNotebook.price),
    supply: ethers.utils.formatUnits(rawNotebook.supply, 0),
    notebookId: ethers.utils.formatUnits(rawNotebook.notebookId, 0),
  };
  return processedNotebook;
}

async function fetchJSONFromIrys(cid) {
  const response = await fetch(`https://gateway.irys.xyz/${cid}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch page data for CID: ${arweaveCID}`);
  }
  const jsonData = await response.json(); // get the string content
  return jsonData;
}

async function processFetchedNotebook(rawNotebook) {
  try {
    const userPagesWithAdditionalData = [];

    for (const userPage of rawNotebook.pages) {
      const pageContentFromArweave = await fetchPageDataFromArweave(
        userPage.arweaveCID
      );
      userPagesWithAdditionalData.push({
        arweaveCID: userPage.arweaveCID,
        timestamp: ethers.utils.formatUnits(userPage.timestamp, 0),
        pageContent: pageContentFromArweave,
      });
    }
    const processedNotebook = {
      isVirgin: rawNotebook.isVirgin,
      templateId: rawNotebook.templateId,
      pages: userPagesWithAdditionalData,
    };

    return processedNotebook;
  } catch (error) {
    console.error("Error processing the fetched notebook:", error);
    throw error; // Re-throw the error after logging to ensure it's handled further up
  }
}

async function processFetchedEulogia(rawEulogia, thisWallet) {
  try {
    // Extract metadata URI
    const metadataURI = rawEulogia.metadataCID;
    // Check and modify the metadataURI if it starts with "https://arweave.net/"

    // Fetch metadata from Arweave
    const metadata = await fetch(`https://node2.irys.xyz/${metadataURI}`);
    const jsonMetadata = await metadata.json();
    console.log("the mtadata is: ", jsonMetadata);
    metadata.coverImageUrl = `https://ipfs.io/ipfs/${metadata.coverImageCid}`;
    metadata.backgroundImageUrl = `https://ipfs.io/ipfs/${metadata.backgroundImageCid}`;

    const fetchedPages = await getContainerInfoFromIrys(
      "eulogia",
      rawEulogia.eulogiaId,
      thisWallet.address,
      process.env.NEXT_PUBLIC_EULOGIAS_CONTRACT_ADDRESS
    );

    // Create a formatted eulogia object
    const eulogia = {
      metadata: jsonMetadata,
      pages: fetchedPages,
      messageCount: fetchedPages.length,
    };

    console.log("HHHASIDAIUHA", eulogia);

    return eulogia;
  } catch (error) {
    console.error("Error processing the fetched Eulogia:", error);
    throw error;
  }
}

async function formatUserJournal(rawJournal) {
  const formattedEntries = await Promise.all(
    rawJournal[4].map(async (entry) => {
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
    pagesLeft: rawJournal[1],
    journalId: rawJournal[2],
    title: rawJournal[3],
    entries: formattedEntries,
  };
}

// Function to format the raw journals
async function formatUserJournals(rawJournals, thisWallet) {
  return Promise.all(
    rawJournals.map(async (journal) => {
      // Use Promise.all to await all promises inside map
      console.log("in here, the journal is: ", journal, thisWallet.address);

      // Call your new function and await its result
      const writtenPages = await getContainerInfoFromIrys(
        "journal",
        journal.journalId, // assuming this is the containerId you need
        thisWallet.address,
        process.env.NEXT_PUBLIC_JOURNALS_CONTRACT_ADDRESS
      );

      // Return the new object structure with the fetched entries
      return {
        journalId: ethers.utils.formatUnits(journal.journalId, 0),
        title: journal[1],
        entries: writtenPages, // Add the fetched pages here
      };
    })
  );
}

// Your getContainerInfoFromIrys function remains unchanged

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
    console.error("There was a problem with fetching the metadata:", error);
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
        console.error("Error fetching Arweave content", error);
        return {
          text: "",
          pageIndex: index + 1,
          written: false,
        };
      }
    })
  );
  return contentArray;
}

module.exports = {
  processFetchedEulogia,
  metadataUrlToObject,
  fetchArweaveContent,
  processFetchedNotebook,
  formatUserJournal,
  fetchAllEntriesContent,
  formatUserJournals,
  fetchUserEulogias,
  fetchUserNotebooks,
  fetchUserJournals,
  fetchUserDementors,
  processFetchedDementor,
  newProcessFetchedNotebook,
  getIndividualDementorFormatted,
};
