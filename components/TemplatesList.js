import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import AnkyTemplatesAbi from '../lib/templatesABI.json';
import NotebooksAbi from '../lib/notebookABI.json'; // Assuming you have this
import { processFetchedTemplate } from '../lib/notebooks.js';

const TEMPLATES_CONTRACT_ADDRESS = '0xc52698D6C745C516FAba2115f1B453E14e5503a1';
const NOTEBOOKS_CONTRACT_ADDRESS = '0x131eFd7EE39806D72dA8f051D89E306049692354';

function TemplatesList() {
  const [templates, setTemplates] = useState([]);
  const [provider, setProvider] = useState(null);
  const { wallets } = useWallets();

  const thisWallet = wallets[0];

  useEffect(() => {
    async function fetchTemplates() {
      if (!thisWallet) return;

      let fetchedProvider = await thisWallet.getEthersProvider();
      setProvider(fetchedProvider); // Setting the provider to the state
      let signer = await fetchedProvider.getSigner();

      const templatesContract = new ethers.Contract(
        TEMPLATES_CONTRACT_ADDRESS,
        AnkyTemplatesAbi,
        signer
      );
      const templateCount = await templatesContract.templateCount();

      const fetchedTemplates = [];

      for (let i = 0; i < templateCount; i++) {
        const template = await templatesContract.getTemplate(i);
        if (template && template[4].gt(0)) {
          const formattedTemplate = await processFetchedTemplate(template);
          fetchedTemplates.push(formattedTemplate);
        }
      }
      setTemplates(fetchedTemplates);
    }

    fetchTemplates();
  }, [thisWallet]);

  if (!templates) return <p>There are no templates</p>;

  return (
    <div className='flex space-x-2'>
      {templates.map((template, index) => (
        <TemplateItem
          key={index}
          template={template}
          provider={provider}
          thisWallet={thisWallet}
        />
      ))}
    </div>
  );
}

function TemplateItem({ template, provider, thisWallet }) {
  const handleMint = async () => {
    if (!thisWallet || !provider) return;

    const signer = await provider.getSigner();
    const notebooksContract = new ethers.Contract(
      NOTEBOOKS_CONTRACT_ADDRESS,
      NotebooksAbi,
      signer
    );
    const amountToMint = 1; // Change this value if you want to mint a different amount

    const requiredEther = ethers.utils.parseEther(
      (template.price * amountToMint).toString()
    );

    console.log('the required ethere is: ', requiredEther);

    try {
      // Check if all arguments are correctly populated
      const balance = await provider.getBalance(thisWallet.address);
      console.log('The wallets balance is: ', balance);

      console.log('the template is: ', template);
      console.log(
        'Minting Params:',
        thisWallet.address,
        template.templateId,
        amountToMint,
        requiredEther
      );

      const tx = await notebooksContract.mintNotebook(
        thisWallet.address, // address of the person minting the notebook
        1, // ID of the template being minted
        amountToMint, // how many notebooks you want to mint
        {
          value: requiredEther,
        }
      );
      await tx.wait();
      alert('Minting completed!');
    } catch (error) {
      console.error('Error minting:', error);
      alert('Minting failed. Please try again.');
    }
  };

  return (
    <div className='text-white bg-green-300 p-2'>
      <h2>{template.name || 'Name'}</h2>
      <p>
        {template.mintedCount}/{template.supply}
      </p>
      <button onClick={handleMint}>Mint</button>
    </div>
  );
}

export default TemplatesList;
