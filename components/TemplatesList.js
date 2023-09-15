import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import AnkyTemplatesAbi from '../lib/templatesABI.json';
import NotebooksAbi from '../lib/notebookABI.json'; // Assuming you have this
import { processFetchedTemplate } from '../lib/notebooks.js';
import { useRouter } from 'next/router';
import Button from './Button';
import Spinner from './Spinner';

function loadExampleToState(example) {
  setTitle(example.title);
  setDescription(example.description);
  setPrice(example.price);
  setPrompts(example.prompts);
}

const EXAMPLE_NOTEBOOKS = [
  {
    title: 'Journey of Self',
    description:
      'Dive deep into the realms of self-awareness and understanding. Let this notebook guide you on a voyage of introspection and self-discovery.',
    price: 0.01,
    prompts: [
      'What does self-awareness mean to you?',
      'Describe a moment when you felt most connected to yourself.',
      'How has your perception of self changed over the years?',
      // ... Add more prompts as needed
    ],
  },
  // ... 9 more example notebook objects
];

function TemplatesList() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [displayInfo, setDisplayInfo] = useState(false);
  const { wallets } = useWallets();

  const thisWallet = wallets[0];

  const setExampleNotebook = notebook => {
    setTitle(notebook.title);
    setDescription(notebook.description);
    setPrice(notebook.price);
    setPrompts(notebook.prompts);
  };

  useEffect(() => {
    async function fetchTemplates() {
      if (!thisWallet) return;

      let fetchedProvider = await thisWallet.getEthersProvider();
      setProvider(fetchedProvider);
      let signer = await fetchedProvider.getSigner();

      const templatesContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_TEMPLATES_CONTRACT_ADDRESS,
        AnkyTemplatesAbi,
        signer
      );
      const templateCount = await templatesContract.templateCount();

      const fetchedTemplates = [];

      for (let i = 0; i < templateCount; i++) {
        const template = await templatesContract.getTemplate(i);

        if (template) {
          const formattedTemplate = await processFetchedTemplate(template);
          console.log('The formatter template is: ', formattedTemplate);
          fetchedTemplates.push(formattedTemplate);
        }
      }
      setTemplates(fetchedTemplates);
      setLoading(false);
    }

    fetchTemplates();
  }, [thisWallet]);

  if (!templates) return <p>There are no templates</p>;
  if (loading)
    return (
      <div>
        <Spinner />
        <p className='text-white'>Loading the templates...</p>
      </div>
    );

  return (
    <div className='flex flex-col'>
      <h2 className='text-white text-center'>Templates</h2>
      <div className='flex flex-wrap '>
        {templates.map((template, index) => (
          <TemplateItem
            key={index}
            template={template}
            provider={provider}
            thisWallet={thisWallet}
          />
        ))}
      </div>
      <div className='mt-4 flex flex-col w-64 mx-auto'>
        <div className='flex justify-center'>
          <Button
            buttonText='Add new template'
            buttonColor='bg-green-600'
            buttonAction={() => router.push('/templates/new')}
          />
          <Button
            buttonText='?'
            buttonAction={() => setDisplayInfo(x => !x)}
            buttonColor={`${displayInfo ? 'bg-purple-600' : 'bg-purple-400'}`}
          />
        </div>
        {displayInfo && (
          <div className='text-white mt-2 text-sm'>
            <p>a template is the blueprint</p>
            <p>that others will follow</p>
            <p>to have you guide them through the unknown</p>
            <p>with the power of your prompts</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateItem({ template, provider, thisWallet }) {
  const router = useRouter();
  const handleMint = async () => {
    if (!thisWallet || !provider) return;

    const signer = await provider.getSigner();
    const notebooksContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_NOTEBOOKS_CONTRACT,
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
    <div className='text-white w-48 flex flex-col p-2 m-2 border border-white rounded bg-black opacity-70'>
      <h2 className='italic'>{template.metadata?.title || 'undefined'}</h2>
      <p>{template.metadata?.prompts?.length || 'undefined'} prompts</p>
      <p>{template.metadata.supply - template.supply} notebooks minted</p>
      <p>{template.supply} templates remaining</p>

      <Button
        buttonAction={() => router.push(`/template/${template.templateId}`)}
        buttonColor='bg-green-600'
        buttonText='Visit'
      />
    </div>
  );
}

export default TemplatesList;
