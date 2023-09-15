import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { usePrivyWagmi } from '@privy-io/wagmi-connector';
import { useContractRead } from 'wagmi';
import { createTBA } from '../lib/backend';
import Button from './Button';
import templatesContractABI from '../lib/templatesABI.json';
import Spinner from './Spinner';
import SampleButton from './SampleButton';
import SuccessfulNotebookTemplate from './SuccessfulNotebookTemplate';

const NewEulogiaPage = () => {
  return <div>NewEulogiaPage</div>;
};

export default NewEulogiaPage;
