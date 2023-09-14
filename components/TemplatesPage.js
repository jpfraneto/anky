import React from 'react';
import TemplatesList from './TemplatesList';
import { useWallets } from '@privy-io/react-auth';

const TemplatesPage = () => {
  const { wallets } = useWallets();

  const thisWallet = wallets[0];
  return (
    <div>
      <h2 className='text-white text-center'>Templates</h2>
      <TemplatesList />
    </div>
  );
};

export default TemplatesPage;
