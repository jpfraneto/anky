import { WebIrys } from "@irys/sdk";
import Query from "@irys/query";
import { all } from "axios";

async function uploadToIrys(thisWallet, text) {
  const getWebIrys = async () => {
    // Ethers5 provider
    // await window.ethereum.enable();
    if (!thisWallet) return;
    // const provider = new providers.Web3Provider(window.ethereum);
    const provider = await thisWallet.getEthersProvider();

    const url = "https://node2.irys.xyz";
    const token = "ethereum";
    const rpcURL = "https://rpc-mumbai.maticvigil.com"; // Optional parameter

    // Create a wallet object
    const wallet = { rpcUrl: rpcURL, name: "ethersv5", provider: provider };
    // Use the wallet object
    const webIrys = new WebIrys({ url, token, wallet });
    await webIrys.ready();
    return webIrys;
  };
  const webIrys = await getWebIrys();

  const tags = [{ name: "Content-Type", value: "text/plain" }];
  try {
    const receipt = await webIrys.upload(text, { tags });
    console.log("the receipt is: ", receipt);
    console.log(`Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
    return receipt.id;
  } catch (e) {
    console.log("Error uploading data ", e);
  }
}

async function fetchContentFromIrys(cid) {
  const response = await fetch(`https://gateway.irys.xyz/${cid}`);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const usable = await response.json();
  return usable;
}

async function getCommunityWritings() {
  const myQuery = new Query({ url: "https://node2.irys.xyz/graphql" });
  const results = await myQuery
    .search("irys:transactions")
    .tags([
      { name: "Content-Type", values: ["text/plain"] },
      { name: "application-id", values: ["Anky Dementors"] },
      { name: "container-type", values: ["community-notebook"] },
    ])
    .sort("DESC")
    .limit(100);
  const allUserWritings = await Promise.all(
    results.map(async (result, index) => {
      const content = await fetch(`https://node2.irys.xyz/${result.id}`);
      const thisText = await content.text();
      return {
        cid: result.id,
        timestamp: result.timestamp,
        text: thisText,
        writingContainerType: result?.tags[2]?.value || undefined,
      };
    })
  );
  return allUserWritings;
}

async function getOneWriting(cid) {
  try {
    if (cid.length > 12) {
      const content = await fetch(`https://node2.irys.xyz/${cid}`);
      if (content) {
        const thisText = await content.text();
        return {
          text: thisText,
          content,
        };
      } else {
        return {
          text: "no text",
          content: {},
        };
      }
    }
    return {
      text: "no text",
      content: {},
    };
  } catch (error) {
    return {
      text: "no text",
      content: {},
    };
  }
}

async function getAllUsersWritings(authorAddress) {
  const myQuery = new Query({ url: "https://node2.irys.xyz/graphql" });
  const results = await myQuery
    .search("irys:transactions")
    .tags([
      { name: "Content-Type", values: ["text/plain"] },
      { name: "application-id", values: ["Anky Dementors"] },
    ])
    .sort("DESC")
    .limit(100);
  console.log("the results are: ", results);
  const allUserWritings = await Promise.all(
    results.map(async (result, index) => {
      const content = await fetch(`https://node2.irys.xyz/${result.id}`);
      const thisText = await content.text();
      return {
        cid: result.id,
        timestamp: result.timestamp,
        text: thisText,
        writingContainerType: result?.tags[2]?.value || undefined,
        containerId: result?.tags[3]?.value || undefined,
      };
    })
  );
  return allUserWritings;
}

async function getThisUserWritings(authorAddress) {
  console.log("the authors address is: ", authorAddress);
  const myQuery = new Query({ url: "https://node2.irys.xyz/graphql" });
  const results = await myQuery
    .search("irys:transactions")
    .from([authorAddress])
    .tags([
      { name: "Content-Type", values: ["text/plain"] },
      { name: "application-id", values: ["Anky Dementors"] },
    ])
    .sort("DESC")
    .limit(100);
  console.log("the results are: ", results);
  const allUserWritings = await Promise.all(
    results.map(async (result, index) => {
      const content = await fetch(`https://node2.irys.xyz/${result.id}`);
      const thisText = await content.text();
      return {
        cid: result.id,
        timestamp: result.timestamp,
        text: thisText,
        writingContainerType: result?.tags[2]?.value || undefined,
        containerId: result?.tags[3]?.value || undefined,
      };
    })
  );
  return allUserWritings;
}

async function getContainerInfoFromIrys(
  containerType,
  containerId,
  authorAddress,
  containerContractAddress
) {
  const myQuery = new Query({ url: "https://node2.irys.xyz/graphql" });
  const results = await myQuery
    .search("irys:transactions")
    .from([authorAddress])
    .tags([
      { name: "Content-Type", values: ["text/plain"] },
      { name: "application-id", values: ["Anky Dementors"] },
      { name: "container-type", values: [containerType] },
      { name: "container-id", values: [containerId.toString()] },
      { name: "smart-contract-address", values: [containerContractAddress] },
    ])
    .sort("ASC")
    .limit(100);
  console.log("the results are: ", results);
  let prevCid;
  const containerPages = await Promise.all(
    results.map(async (result, index) => {
      const content = await fetch(`https://node2.irys.xyz/${result.id}`);
      const thisText = await content.text();
      if (index == 0) {
        prevCid = 0;
      } else {
        prevCid = results[index - 1].id;
      }
      return {
        cid: result.id,
        timestamp: result.timestamp,
        text: thisText,
        previousPageCid: prevCid,
      };
    })
  );
  console.log("the processed pages are: ", containerPages);

  return containerPages;
}

async function getDementorInfoFromIrys(
  processedDementor,
  containerType,
  containerId,
  authorAddress
) {
  const myQuery = new Query({ url: "https://node2.irys.xyz/graphql" });
  const results = await myQuery
    .search("irys:transactions")
    .from([authorAddress])
    .tags([
      { name: "Content-Type", values: ["text/plain"] },
      { name: "application-id", values: ["Anky Dementors"] },
      { name: "container-type", values: [containerType] },
      { name: "container-id", values: [containerId.toString()] },
      {
        name: "smart-contract",
        values: [process.env.NEXT_PUBLIC_ANKY_DEMENTORS_CONTRACT],
      },
    ])
    .sort("ASC")
    .limit(100);
  let prevCid;
  console.log("the processed dementor is: ", processedDementor);
  let newDementor = { ...processedDementor };
  newDementor.pages = [...processedDementor.pages];
  console.log("THE NEW DEMENTOR IS: ", newDementor);
  const unprocessedPages = await Promise.all(
    results.map(async (result, index) => {
      const content = await fetch(`https://node2.irys.xyz/${result.id}`);
      console.log("the content tttt is: ", content);
      const thisText = await content.text();
      if (index == 0) {
        prevCid = 0;
      } else {
        prevCid = results[index - 1].id;
      }
      let pageNumber = null;
      let dementorAnswer = null;
      let previousCid = null;

      result.tags.forEach((tag) => {
        if (tag.name === "page-number") {
          pageNumber = tag.value;
        } else if (tag.name === "dementor-answer") {
          dementorAnswer = tag.value;
        } else if (tag.name === "previous-cid") {
          previousCid = tag.value;
        }
        // Add more conditions if you want to extract more tag values
      });
      // find in the tags the ones associated with the page number, the dementor-answer or the  dementor-prompts

      return {
        cid: result.id,
        timestamp: result.timestamp,
        text: thisText,
        pageNumber: pageNumber,
        dementorAnswer: dementorAnswer,
        previousCid: previousCid,
      };
    })
  );
  //  I need to get a pages array that is: [{},{}]
  // where each one of those objects is page:

  console.log("the processed pages are: ", unprocessedPages);

  unprocessedPages.forEach((page) => {
    console.log("in here, the page is: ", page.pageNumber);
    const pageNum = Number(page.pageNumber);
    if (!newDementor.pages[pageNum]) {
      newDementor.pages[pageNum] = {};
    }
    if (page.dementorAnswer) {
      newDementor.pages[pageNum].writings = page.text.split("---");
      newDementor.pages[pageNum].answerTimestamp = page.timestamp;
      newDementor.pages[pageNum].answerCid = page.cid;
    } else {
      if (newDementor.pages.length == page.pageNumber) {
        let newPage = {
          prompts: page.text.includes("%%")
            ? page.text.split("%%")
            : [page.text],
          promptsTimestamp: page.timestamp,
          promptsCid: page.cid,
          pageNumber: pageNum,
        };
        newDementor.pages.push(newPage);
      } else {
        newDementor.pages[pageNum].prompts = page.text.includes("%%")
          ? page.text.split("%%")
          : [page.text];
        newDementor.pages[pageNum].promptsTimestamp = page.timestamp;
        newDementor.pages[pageNum].promptsCid = page.cid;
        newDementor.pages[pageNum].pageNumber = pageNum;
      }
    }
  });
  return newDementor;
}

module.exports = {
  uploadToIrys,
  fetchContentFromIrys,
  getCommunityWritings,
  getContainerInfoFromIrys,
  getThisUserWritings,
  getDementorInfoFromIrys,
  getAllUsersWritings,
  getOneWriting,
};
