import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import AnkyAidropAbi from '../../lib/airdropABI.json';

const provider = new ethers.providers.JsonRpcProvider(
  `https://base-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
);

const MobileFeed = ({ alchemy }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await alchemy.core.getLogs({
        address: process.env.NEXT_PUBLIC_ANKY_AIRDROP_SMART_CONTRACT,
        topics: [
          '0x784793a26cf95517c1388aaac377b126d2469f8c9e69209984bb4ec5ceae02c3',
        ],
        fromBlock: '0xA61AAE',
      });

      const contractInterface = new ethers.utils.Interface(AnkyAidropAbi);

      const parsedEvents = response
        .map(log => contractInterface.parseLog(log).args)
        .reverse()
        .slice(-20);
      const fetchContents = async event => {
        const response = await fetch(`https://www.arweave.net/${event.cid}`);
        const text = await response.text();
        return {
          containerType: event[1],
          cid: event[2],
          text: text,
        };
      };

      const formattedEventsPromises = parsedEvents.map(fetchContents);
      const formattedEvents = await Promise.all(formattedEventsPromises);
      setEvents(formattedEvents);
    };

    fetchEvents();
  }, []);

  const getContainerColor = containerType => {
    switch (containerType) {
      case 'notebook':
        return 'bg-blue-400';
      case 'eulogia':
        return 'bg-orange-400';
      case 'journal':
        return 'bg-green-400';
      default:
        return 'white';
    }
  };

  return (
    <div className='w-full'>
      <div className='text-center h-fit py-2 w-full bg-black text-white'>
        {' '}
        <h2 className='text-2xl'>we are all crazy</h2>
        <p className='text-xl text-orange-200'>
          let&apos;s embrace it together
        </p>
      </div>
      <p className='px-2 mt-2'>
        (your computer is for writing. your phone is for reading. once you write
        inside the webapp, you will understand how writing on anky feels. treat
        it as a meditation practice.)
      </p>

      {events.length === 0 ? (
        <div>
          <p>loading...</p>
          <div class='lds-ripple'>
            <div></div>
            <div></div>
          </div>
        </div>
      ) : (
        events.map((event, index) => (
          <div
            key={index}
            className={`${getContainerColor(
              event.containerType
            )} p-2 border-2 border-black my-2 shadow-lg shadow-pink-500 `}
            style={{
              height: '50vh',
              overflow: 'auto',
              cursor: 'pointer',
            }}
            onClick={e => {
              if (e.target.style.height === 'auto') {
                e.target.style.height = '50vh';
              } else {
                e.target.style.height = 'auto';
              }
            }}
          >
            {event.text}
          </div>
        ))
      )}
    </div>
  );
};

export default MobileFeed;
