import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import AnkyAidropAbi from '../../lib/airdropABI.json'; // Assuming you have the ABI

const provider = new ethers.providers.JsonRpcProvider(
  `https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
);

const MobileFeed = ({ alchemy }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      console.log('the provider is: ', provider);
      const contract = new alchemy.core.Contract(
        process.env.NEXT_PUBLIC_ANKY_AIRDROP_SMART_CONTRACT,
        AnkyAidropAbi,
        provider
      );
      console.log('the contract is: ', contract);
      const filter = contract.filters.WritingEvent(); // Assuming WritingEvent is the name of your event
      const logs = await provider.getLogs({
        ...filter,
        fromBlock: 0, // Starting block (you might want to adjust this to avoid querying the entire history)
        toBlock: 'latest',
      });
      const parsedEvents = logs
        .map(log => contract.interface.parseLog(log))
        .slice(-20);
      setEvents(parsedEvents);
    };
    fetchEvents();
  }, []);

  return (
    <div>
      {events.map(event => (
        // Render each event as you'd like
        <div key={event.transactionHash}>
          {event.args.writingContainerType} - {event.args.cid}
        </div>
      ))}
    </div>
  );
};

export default MobileFeed;
