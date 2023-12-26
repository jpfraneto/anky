import React from "react";
import Image from "next/image";
import Link from "next/link";

const EulogiaCard = ({ eulogia }) => {
  let timestamp;
  if (eulogia.messages && eulogia.messages.length > 0) {
    timestamp = eulogia?.messages[eulogia?.messages?.length - 1].timestamp;
  }
  return (
    <Link href={`/eulogias/${eulogia.eulogiaId}`} passHref>
      <div className="py-2 px-4 w-fit m-2 rounded-xl text-left flex flex-col bg-orange-600 hover:bg-orange-700 text-black">
        <div>
          <h2 className="text-2xl">{eulogia.metadata.title}</h2>
          <p className="-my-1">{eulogia.pages.length} pages written</p>
          {timestamp && (
            <p className="my-0">
              last update: {new Date(timestamp * 1000).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EulogiaCard;
