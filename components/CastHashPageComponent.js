import { useRouter } from "next/router";
import React, { useEffect } from "react";

const CastHashPageComponent = () => {
  const router = useRouter();
  useEffect(() => {
    async function fetchThisCastsInformationFromServer() {
      try {
        console.log("the router query is: ", router.query);
      } catch (error) {
        console.log(
          "there was an error fetching the casts information on the server"
        );
        console.log(error);
      }
    }
    fetchThisCastsInformationFromServer();
  }, [router]);
  return <div>CastHashPageComponent</div>;
};

export default CastHashPageComponent;
