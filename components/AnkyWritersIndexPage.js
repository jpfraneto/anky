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
          anky writers · mint live · 10 march 2024 · 5 am EST
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
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 w-96 mx-auto"
            />
            <Button
              buttonText="submit"
              buttonAction={sendEmail}
              buttonColor="bg-purple-600 text-white"
            />
          </div>
        )}
      </div>

      {!loading ? (
        <div>
          {ankyWriters.map((writer, index) => {
            return (
              <div
                key={index}
                className="flex mb-4 md:mb-0 flex-col md:flex-row w-full"
              >
                <div className="md:w-96 w-full aspect-[10/16] relative">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${writer.uploadedImage}`}
                    fill
                  />
                </div>
                <div className="pt-4 md:pt-0 flex-grow w-full flex flex-col items-start text-left px-4 text-white text-2xl">
                  <h2 className="my-2">
                    {writer.newName}, inspired by {writer.writer} -{" "}
                    {writer.book}
                  </h2>

                  {writer.description ? (
                    writer.description.includes("\n") ? (
                      writer.description.split("\n").map((x, i) => (
                        <p className="my-2" key={i}>
                          {x}
                        </p>
                      ))
                    ) : (
                      <p className="my-2">{writer.description}</p>
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
