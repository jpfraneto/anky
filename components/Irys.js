import React, { useState } from "react";
import { WebIrys } from "@irys/sdk";
import { useWallets, usePrivy } from "@privy-io/react-auth";
import Query from "@irys/query";
import Button from "./Button";
import Spinner from "./Spinner";

const IrysPage = () => {
  const { authenticated, login, loading } = usePrivy();
  const [pages, setPages] = useState([]);
  const { wallets } = useWallets();
  const [text, setText] = useState("this is the data to upload");
  const [containerId, setContainerId] = useState(291237972);
  const [bundlrResponseId, setBundlrResponseId] = useState("");
  const [containerType, setContainerType] = useState("eulogia");
  const [pageNumber, setPageNumber] = useState(0);
  const [version, setVersion] = useState(0);
  const thisWallet = wallets[0];

  const str = "https://node2.irys.xyz";
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
    console.log("the web irys is: ", webIrys);
    return webIrys;
  };

  const uploadData = async () => {
    const webIrys = await getWebIrys();
    console.log(
      "in here",
      containerType,
      containerId,
      pageNumber,
      thisWallet.address,
      version
    );
    const dataToUpload = JSON.stringify({
      containerType: containerType,
      containerId: containerId,
      page: pageNumber,
      author: thisWallet.address,
      text: text,
    });
    let thisPagePassword = "1234567890";
    const tags = [
      { name: "Content-Type", value: "text/plain" },
      { name: "application-id", value: "Anky Dementors" },
      { name: "container-type", value: containerType },
      { name: "container-id", value: containerId.toString() },
      { name: "page-number", value: pageNumber.toString() },
      { name: "author", value: thisWallet.address },
      { name: "version", value: version.toString() },
      { name: "previous-page", value: bundlrResponseId },
      { name: "password", value: thisPagePassword },
    ];
    try {
      const receipt = await webIrys.upload(dataToUpload, { tags });
      setBundlrResponseId(receipt.id);
      setPageNumber((x) => x + 1);
      console.log(`Data uploaded ==> https://gateway.irys.xyz/${receipt.id}`);
    } catch (e) {
      console.log("Error uploading data ", e);
    }
  };

  const queryWritingData = async () => {
    console.log("querying the data: ", containerType, containerId);
    const myQuery = new Query({ url: "https://node2.irys.xyz/graphql" });
    const results = await myQuery
      .search("irys:transactions")
      .limit(42)
      .tags([
        { name: "Content-Type", values: ["text/plain"] },
        { name: "application-id", values: ["Anky Dementors"] },
      ])
      .sort("DESC")
      .limit(20);
    console.log("the results are: ", results);
    const processedPages = await Promise.all(
      results.map(async (result) => {
        const content = await fetch(`${str}/${result.id}`);
        return content.text();
      })
    );
    console.log("the processed pages are: ", processedPages);
    setPages(processedPages);
  };

  if (!authenticated) {
    return (
      <div>
        <p>please login</p>
        <button onClick={login}>login</button>
      </div>
    );
  }
  if (loading || !thisWallet)
    return (
      <div>
        <p>loading</p>
        <Spinner />
      </div>
    );
  return (
    <div className="text-white">
      <p className="my-8">Irys Page</p>
      <form className="w-96 mx-auto">
        <div className="my-2 flex justify-between">
          <label htmlFor="content-type">Text:</label>
          <textarea
            className="p-2 text-black rounded-xl"
            id="text"
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </div>
        <div className="my-2 flex justify-between">
          <label htmlFor="content-type">Content-Type:</label>
          <select
            className="p-2 text-black rounded-xl"
            id="content-type"
            name="content-type"
          >
            <option value="text/plain">text/plain</option>
          </select>
        </div>
        <div className="my-2 flex justify-between">
          <label htmlFor="application-id">Application ID:</label>
          <select
            className="p-2 text-black rounded-xl"
            id="application-id"
            name="application-id"
          >
            <option value="Anky Dementors">Anky Dementors</option>
          </select>
        </div>
        <div className="my-2 flex justify-between">
          <label htmlFor="container-type">Container Type:</label>
          <select
            className="p-2 text-black rounded-xl"
            id="container-type"
            onChange={(e) => setContainerType(e.target.value)}
            name="container-type"
          >
            <option value="eulogia">eulogia</option>
            <option value="notebook">notebook</option>
            <option value="dementor">dementor</option>
            <option value="journal">journal</option>
          </select>
        </div>
        <div className="my-2 flex justify-between">
          <label htmlFor="container-id">Container ID:</label>
          <input
            onChange={(e) => setContainerId(e.target.value)}
            className="p-2 text-black rounded-xl"
            type="number"
            value={containerId}
          />
        </div>
        <div className="my-2 flex justify-between">
          <label htmlFor="container-id">Page Number:</label>
          <input
            onChange={(e) => setPageNumber(e.target.value)}
            className="p-2 text-black rounded-xl"
            type="number"
            value={pageNumber}
          />
        </div>
        <div className="my-2 flex justify-between">
          <label htmlFor="container-id">Page Version:</label>
          <input
            onChange={(e) => setVersion(e.target.value)}
            className="p-2 text-black rounded-xl"
            type="number"
            value={version}
          />
        </div>
      </form>
      <div>
        <p>Container Type : {containerType}</p>
        <p>Container ID : {containerId}</p>
        <p>Page Number : {pageNumber}</p>
        <p>Page Version : {version}</p>
        <p>Bundlr response id : {bundlrResponseId}</p>
      </div>
      <div className="flex space-x-2">
        <Button
          buttonAction={uploadData}
          buttonText="upload data"
          buttonColor="bg-green-600"
        />
        <Button
          buttonAction={queryWritingData}
          buttonText="query data"
          buttonColor="bg-purple-600"
        />
      </div>
    </div>
  );
};

export default IrysPage;
