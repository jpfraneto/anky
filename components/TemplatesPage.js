import React from 'react';
import TemplatesList from './TemplatesList';
import { useWallets } from '@privy-io/react-auth';

const TemplatesPage = () => {
  const { wallets } = useWallets();

  const thisWallet = wallets[0];
  return (
    <div>
      <TemplatesList />
    </div>
  );
};

export default TemplatesPage;
