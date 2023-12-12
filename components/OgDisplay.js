import React, { useEffect, useState } from "react";
import axios from "axios";

const OgDisplay = ({ url }) => {
  const [ogData, setOgData] = useState({});

  useEffect(() => {
    const fetchOgData = async () => {
      try {
        const proxyUrl = "https://cors-anywhere.herokuapp.com/";
        const response = await axios.get(`${proxyUrl}${url}`);

        const html = response.data;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const metaTags = doc.getElementsByTagName("meta");
        let ogDataTemp = {};

        for (let tag of metaTags) {
          if (tag.getAttribute("property")?.includes("og:")) {
            const property = tag.getAttribute("property").replace("og:", "");
            ogDataTemp[property] = tag.getAttribute("content");
          }
        }

        setOgData(ogDataTemp);
      } catch (error) {
        console.error("Error fetching OpenGraph data:", error);
      }
    };

    fetchOgData();
  }, [url]);

  return (
    <div>
      {ogData.title && <h1>{ogData.title}</h1>}
      {ogData.description && <p>{ogData.description}</p>}
      {ogData.image && <img src={ogData.image} alt="OpenGraph Image" />}
      {/* Display more OpenGraph data as needed */}
    </div>
  );
};

export default OgDisplay;
