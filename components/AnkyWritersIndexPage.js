import axios from "axios";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Spinner from "./Spinner";
import Button from "./Button";

const AnkyWritersIndexPage = () => {
  const [ankyWriters, setAnkyWriters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState(false);

  useEffect(() => {
    const fetchAllAnkyWriters = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/ankywriters`
        );
        const writers = await response.data;

        setAnkyWriters(writers.ankyWriters);
        console.log("w", writers.ankyWriters);
        setLoading(false);
      } catch (error) {
        console.log("there was an error", error);
      }
    };
    fetchAllAnkyWriters();
  }, []);

  function isValidEmail(email) {
    const regex =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return regex.test(email);
  }

  async function sendEmail() {
    try {
      if (!email || !isValidEmail(email)) return alert("add a valid email");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/add-email`,
        {
          email: email,
        }
      );
      setSubmittedEmail(true);
    } catch (error) {
      alert("there was an error adding your email, please try again");
    }
  }

  return (
    <div className="w-full md:px-32">
      <div className="md:w-2/3 text-white  mt-2 mx-auto">
        <h2 className="text-3xl mb-2">
          anky writers · yoinking live · 10 march 2024 · 5 am EST
        </h2>
        <p className="text-white px-8 mb-2 text-white">
          submit your email to get yours and participate on this journey. they
          will be free.
        </p>
        <p className="text-white px-8 mb-2 text-white">
          the mission: write every day for 8 minutes during 96 days. without
          judgements. only exploring what comes.
        </p>
        {submittedEmail ? (
          <p className="text-white">your email was submitted</p>
        ) : (
          <div>
            <input
              type="email"
              placeholder="jp@anky.lat"
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 w-48 mx-auto rounded-xl my-1"
            />
            <Button
              buttonText="submit"
              buttonAction={sendEmail}
              buttonColor="bg-purple-600 text-white w-48 mb-2"
            />
          </div>
        )}
        <div className="relative">
          <p className="px-8 mb-2 text-red-600">welcome to the ankyverse</p>{" "}
          <p className=" px-8 mb-2 text-orange-600">welcome to the ankyverse</p>{" "}
          <p className="px-8 mb-2 text-yellow-600">welcome to the ankyverse</p>
        </div>
      </div>

      {!loading ? (
        <div>
          {ankyWriters.map((writer, index) => {
            return (
              <div
                key={index}
                className="flex mb-4 md:mb-0 flex-col md:flex-row w-full"
              >
                <div>
                  <div className="md:w-96 w-full aspect-[10/16] relative">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${writer.uploadedImage}`}
                      fill
                    />
                  </div>
                </div>

                <div className=" md:pt-0 flex-grow w-full flex flex-col items-start text-left px-4 text-white text-2xl">
                  <h2 className="my-2 text-3xl text-purple-200">
                    {writer.newName}
                  </h2>
                  <p className="text-yellow-400">
                    art is honoring {writer.painter}
                  </p>
                  <p className="text-red-200">
                    the image, the text, and all of its particular lore are
                    inspired by the book {writer.book}, written by{" "}
                    {writer.writer}, and the deity {writer.deity}
                  </p>

                  {writer.letterToWriter ? (
                    writer.letterToWriter.includes("\n\n") ? (
                      writer.letterToWriter.split("\n\n").map((x, i) => (
                        <p className="my-2" key={i}>
                          {x}
                        </p>
                      ))
                    ) : (
                      <p className="my-2">{writer.letterToWriter}</p>
                    )
                  ) : null}
                </div>
              </div>
            );
          })}

          <p className="text-white px-8 mb-2 text-white">
            submit your email to get yours and participate on{" "}
            <a
              className="text-blue-300 hover:text-yellow-600"
              href="https://warpcast.com/jpfraneto/0x9664dfc0"
              target="_blank"
            >
              this farcaster frame
            </a>
            . they will be free, and this will probably make an impact in your
            life.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default AnkyWritersIndexPage;
