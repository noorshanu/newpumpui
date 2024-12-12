// @ts-nocheck
"use client";

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import React, { useEffect, useState } from 'react';
import { FaEthereum, FaTelegramPlane, FaGlobe, FaTwitter, FaTimes, FaSpinner, FaSync } from 'react-icons/fa';
import Generate from '@/components/Popup/Generate';
import SetAmount from '@/components/Popup/SetAmount';
import { Keypair, Connection, SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from "bs58";
import { Toaster, toast } from 'react-hot-toast';
import SetTokenAmount from '@/components/Popup/SetTokenAmount';
import { API_URL } from '@/utils/config';


const Page = ({ params }: { params: { id: string } }) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [fundingWallet, setFundingWallet] = useState('');
  const [logo, setLogo] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [showGeneratePopup, setShowGeneratePopup] = useState(false);
  const [showSetAmountPopup, setShowSetAmountPopup] = useState(false);
  const [showSetTokenAmountPopup, setShowSetTokenAmountPopup] = useState(false);
  const [deployerWallet, setDeployerWallet] = useState('');
  const [initialBuyAmount, setInitialBuyAmount] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [isDeployed, setIsDeployed] = useState(false);

  const [loading, setLoading] = useState({
    createMetadata: false,
    generateWallets: false,
    setAmount: false,
    fundWallets: false,
    buy: false,
    sell: false,
    withdraw: false,
    downloadWallets: false,
    setTokenAmount: false,
  });

  const [solAmount, setSolAmount] = useState('');

  const [token, setToken] = useState<{
    contractAddress: string;
    name: string;
    symbol: string;
  }[]>([]);
  
  const [wallets, setWallets] = useState<{
    id: number;
    address: string;
    solAmount: string;
    solBalance: string;
    tokenBalance: string;
    tokensToBuy: string;
    additionalSol: string;
    selected: boolean;
    secretKey?: string;
    tokenAmount: string;
  }[]>([]);

  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  // Add a new state for refresh button loading
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    getToken();
  }, []);

  const getToken = async () => {
    const response = await fetch(`${API_URL}/api/token/get-token/${params.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    if(data.token.isDeployed) {
      setIsDeployed(true);
    } else {
      setIsDeployed(false);
    }
    console.log(data.token.contractAddress);
    setToken(data.token);
    setTokenAddress(data.token.contractAddress);
  }

  const handleCreateMetadata = async () => {
    try {
      setLoading(prev => ({...prev, createMetadata: true}));
      const response = await fetch(`${API_URL}/api/token/create-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({
          name: tokenName,
          symbol: tokenSymbol,
          logo,
          description: tokenDescription,
          telegramUrl,
          websiteUrl, 
          twitterUrl,
          secretKey: deployerWallet,
          projectId: params.id
        }),
      });
      

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create token');
        throw new Error(errorData.message || 'Failed to create token');
      }

      const data = await response.json();
      console.log(data);
      // Ensure tokenAddress is never set to undefined
      setTokenAddress(data.token.contractAddress);
      setToken(data.token);
      toast.success('Token metadata created successfully');
      console.log('Token metadata created successfully:', data);
    
    } catch (error) {
      console.error('Error creating token:', error);
      toast.error('Error creating token');
      setTokenAddress(''); // Set to empty string on error
    } finally {
      setLoading(prev => ({...prev, createMetadata: false}));
    }
  };
  const handleCreatePmetadata = async () => {
    try {
      setLoading(prev => ({...prev, createMetadata: true}));
      const logoFileBuffer = logoFile ? new Blob([logoFile], { type: logoFile.type }) : null;

      const ipfsFormData = new FormData();
      console.log(tokenName);

      if (logoFileBuffer) {
        ipfsFormData.append("file", logoFileBuffer, "logo.png");
      }
      ipfsFormData.append("name", tokenName);
      ipfsFormData.append("symbol", tokenSymbol); 
      ipfsFormData.append("description", tokenDescription);
      ipfsFormData.append("twitter", twitterUrl);
      ipfsFormData.append("telegram", telegramUrl);
      ipfsFormData.append("website", websiteUrl);
      ipfsFormData.append("showName", "true");

      console.log(ipfsFormData);

      const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        body: ipfsFormData,
      });
      const metadataResponseJSON = await metadataResponse.json();

      const response = await fetch(`${API_URL}/api/token/create-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({
          name: tokenName,
          symbol: tokenSymbol,
          logo,
          description: tokenDescription,
          telegramUrl,
          websiteUrl, 
          twitterUrl,
          secretKey: deployerWallet,
          projectId: params.id,
          metadataUri: metadataResponseJSON.metadataUri,
          initialBuyAmount: initialBuyAmount
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create token');
        throw new Error(errorData.message || 'Failed to create token');
      }

      const data = await response.json();
      console.log(data);
      // Ensure tokenAddress is never set to undefined
      setTokenAddress(data.token.contractAddress);
      setToken(data.token);
      toast.success('Token metadata created successfully');
      console.log('Token metadata created successfully:', data);

    } catch (error) {
      console.error('Error creating token:', error);
      toast.error('Error creating token');
      setTokenAddress(''); // Set to empty string on error
    } finally {
      setLoading(prev => ({...prev, createMetadata: false}));
    }
  }

  const handleCreateToken = async () => {
    try {
      if (!tokenAddress) {
        getToken();
      }
      console.log(tokenAddress);
      setLoading(prev => ({...prev, createMetadata: true}));
      const response = await fetch(`${API_URL}/api/token/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({
          contractAddress: tokenAddress,
          wallets: wallets.filter(wallet => wallet.selected).map(wallet => ({
            address: wallet.address,
            privateKey: wallet.secretKey,
            amount: wallet.solAmount
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create token');
        throw new Error(errorData.message || 'Failed to create token');
      }

      const data = await response.json();
      console.log(data);
      setTokenAddress(data.token.contractAddress);
      toast.success('Token created successfully');
      console.log('Token created successfully:', data);
    } catch (error) {
      console.error('Error creating token:', error);
      toast.error('Error creating token');
      setTokenAddress(''); // Set to empty string on error
    } finally {
      setLoading(prev => ({...prev, createMetadata: false}));
    }
  }


  const handleCreateAndBuy2 = async () => {
    try {
      if(!tokenAddress) {
        getToken();
      }
      console.log(tokenAddress);
      setLoading(prev => ({...prev, createMetadata: true}));
      const response = await fetch(`${API_URL}/api/token/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        }, 
        body: JSON.stringify({
          contractAddress: tokenAddress,
          initialBuyAmount: initialBuyAmount
        }),
      });
      

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create token');
        throw new Error(errorData.message || 'Failed to create token');
      }

      const data = await response.json();
      console.log(data);
      // Ensure tokenAddress is never set to undefined
      setTokenAddress(data.token.contractAddress);
      toast.success('Token created successfully');
      console.log('Token created successfully:', data);


      
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          await handleSeparateBuy();
          break; // Success - exit loop
        } catch (error) {
          attempts++;
          if (attempts === maxAttempts) {
            throw error; // Re-throw if all attempts failed
          }
          console.log(`Attempt ${attempts} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between retries
        }
      }

    } catch (error) {
      console.error('Error creating token:', error);
      toast.error('Error creating token');
      setTokenAddress(''); // Set to empty string on error
    } finally {
      setLoading(prev => ({...prev, createMetadata: false}));
      updateAllWalletBalances(wallets, tokenAddress);
    }
  }

  const handleGenerateWallets = () => {
    setLoading(prev => ({...prev, generateWallets: true}));
    setShowGeneratePopup(true);
    toast.success('Opening wallet generator');
    setLoading(prev => ({...prev, generateWallets: false}));
  };

  const handleSetAmount = () => {
    setLoading(prev => ({...prev, setAmount: true}));
    setShowSetAmountPopup(true);
    toast.success('Opening amount setter');
    setLoading(prev => ({...prev, setAmount: false}));
  };

  const handleSetTAmount = () => {
    setLoading(prev => ({...prev, setTokenAmount: true}));
    setShowSetTokenAmountPopup(true);
    toast.success('Opening token amount setter');
    setLoading(prev => ({...prev, setTokenAmount: false}));
  };

  const handleWalletGeneration = (generatedWallets: {
    id: number;
    address: string;
    solBalance: string;
    tokenBalance: string;
    tokensToBuy: string;
    additionalSol: string;
    selected: boolean;
  }[]) => {
    // Adjust IDs for new wallets based on existing wallets
    const adjustedNewWallets = generatedWallets.map((wallet, index) => ({
      ...wallet,
      id: wallets.length + index + 1
    }));

    // Combine existing wallets with new ones
    const updatedWallets = [...wallets, ...adjustedNewWallets];
    setWallets(updatedWallets);
    toast.success(`Generated ${generatedWallets.length} additional wallets`);
  };

  const handleSetSolAmount = (amount: string) => {
    const selectedWallets = wallets.filter(wallet => wallet.selected);
    
    if (selectedWallets.length === 0) {
      toast.error('Please select wallets first');
      setShowSetAmountPopup(false);
      return;
    }

    const updatedWallets = wallets.map(wallet => 
      wallet.selected ? { 
        ...wallet, 
        solAmount: amount
      } : wallet
    );

    setWallets(updatedWallets);
    setShowSetAmountPopup(false);
    toast.success(`Set SOL amount to ${amount} for ${selectedWallets.length} wallet(s)`);
  };

  const handleSetTokenAmount = (amount: string) => {
    const updatedWallets = wallets.map(wallet => 
      wallet.selected ? { ...wallet, tokenAmount: amount } : wallet
    );
    setWallets(updatedWallets);
    setShowSetTokenAmountPopup(false);
    toast.success(`Set token amount to ${amount}`);
  };

  const handleSeparateBuy = async () => {
    try {
      if(!tokenAddress) {
        getToken();
      }
      setLoading(prev => ({...prev, buy: true}));
      const response = await fetch(`${API_URL}/api/token/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallets: wallets.filter(w => w.selected).map(wallet => ({
            address: wallet.address,
            solAmount: wallet.solAmount,
          })),
          tokenAddress: tokenAddress
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);

        if (errorData.error?.includes("Custom\":6002")) {
          toast.error("Some wallets may have insufficient funds. Please try again with more balance.");
          return;
        }

        toast.error(errorData.message || 'Failed to buy tokens');
        throw new Error(errorData.message || 'Failed to buy tokens');
      }

      const data = await response.json();
      toast.success('Tokens bought successfully');
      console.log('Tokens bought successfully:', data);
    } catch (error) {
      console.error('Error buying tokens:', error);
      toast.error('Error buying tokens');
    } finally {
      setLoading(prev => ({...prev, buy: false}));
      await updateAllWalletBalances(wallets, tokenAddress);
    }
  };

  const handleFundWallets = async () => {
    try {
      setLoading(prev => ({...prev, fundWallets: true}));
      const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=ed92c171-221f-4e06-8127-952ceea45fc4");
      const fundingAccount = Keypair.fromSecretKey(new Uint8Array(bs58.decode(fundingWallet)));

      const walletsToFund = wallets.filter(w => w.solAmount && Number(w.solAmount) > 0);

      for (const wallet of walletsToFund) {
        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: fundingAccount.publicKey,
            toPubkey: new PublicKey(wallet.address),
            lamports: Number(wallet.solAmount) * LAMPORTS_PER_SOL,
          })
        );

        const signature = await sendAndConfirmTransaction(connection, tx, [fundingAccount]);
        toast.success(`Funded wallet ${wallet.address} with ${wallet.solAmount} SOL`);
        console.log(`Funded wallet ${wallet.address} with ${wallet.solAmount} SOL`);
        console.log(signature);
      }

      const updatedWallets = await Promise.all(
        wallets.map(async (wallet) => {
          if (wallet.solAmount && Number(wallet.solAmount) > 0) {
            const balance = await connection.getBalance(new PublicKey(wallet.address));
            return {
              ...wallet,
              solBalance: (balance / LAMPORTS_PER_SOL).toString()
            };
          }
          return wallet;
        })
      );

      setWallets(updatedWallets);
      toast.success('All wallets funded successfully');

    } catch (error) {
      console.error('Error funding wallets:', error);
      toast.error('Error funding wallets');
    } finally {
      setLoading(prev => ({...prev, fundWallets: false}));
    }
  }

  const handleFundWallets2 = async () => {
    try {
      // Check for funding wallet first
      if (!fundingWallet) {
        toast.error('Please enter funding wallet private key first');
        return;
      }

      setLoading(prev => ({...prev, fundWallets: true}));
      const selectedWallets = wallets.filter(wallet => wallet.selected);
      
      if (selectedWallets.length === 0) {
        toast.error('No wallets selected');
        return;
      }

      const response = await fetch(`${API_URL}/api/token/fund-wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wallets: selectedWallets.map(wallet => ({
            address: wallet.address,
            solAmount: wallet.solAmount
          })),
          privateKey: fundingWallet
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to fund wallets');
        throw new Error(errorData.message || 'Failed to fund wallets');
      }

      const data = await response.json();
      toast.success('Wallets funded successfully');
      console.log('Wallets funded successfully:', data);

      // Update wallet balances after funding
      const updatedWallets = await Promise.all(
        wallets.map(async (wallet) => {
          if (selectedWallets.find(w => w.address === wallet.address)) {
            const balance = await getSolBalance(wallet.address);
            return {
              ...wallet,
              solBalance: balance.toString()
            };
          }
          return wallet;
        })
      );

      setWallets(updatedWallets);

    } catch (error) {
      console.error('Error funding wallets:', error);
      toast.error('Error funding wallets');
    } finally {
      setLoading(prev => ({...prev, fundWallets: false}));
    }
  }
  const handleSellTokens = async () => {
    try {
      setLoading(prev => ({...prev, sell: true}));
      const selectedWallets = wallets.filter(wallet => wallet.selected);
      
      const response   = await fetch(`${API_URL}/api/token/sell`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wallets: selectedWallets.map(wallet => ({
            address: wallet.address,
            tokenAmount: wallet.tokenAmount
          })),
          tokenAddress: tokenAddress
        })
      }); 

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to sell tokens');
        throw new Error(errorData.message || 'Failed to sell tokens');
      }

      const data = await response.json();
      toast.success('Tokens sold successfully');
      console.log('Tokens sold successfully:', data);
    } catch (error) {
      console.error('Error selling tokens:', error);
      toast.error('Error selling tokens');
    } finally {
      setLoading(prev => ({...prev, sell: false}));
      updateAllWalletBalances(wallets, tokenAddress);
    }
  }

  const getTokenList = async () => {
    try {
      const response = await fetch(`${API_URL}/api/token/get-token/${params.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        // Only throw error if it's not a 404 (not found)
        if (response.status !== 404) {
          throw new Error('Failed to fetch token list');
        }
        return null; // Return null for new projects with no tokens
      }

      const data = await response.json();
      if(data.token) {
        console.log(data.token);
        setToken(data.token);
        setTokenAddress(data.token.contractAddress);
        return data.token.contractAddress;
      }
      return null;
    } catch (error) {
      console.error('Error fetching token list:', error);
      // Only show error toast for unexpected errors
      if (error instanceof Error && !error.message.includes('not found')) {
        toast.error('Error fetching token list');
      }
      throw error;
    }
  }

  const getWallets = async (mint: string | null) => {
    try {
      const response = await fetch(`${API_URL}/api/token/get-wallets/${params.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status !== 404) {
          throw new Error('Failed to fetch wallets');
        }
        setWallets([]); 
        return;
      }

      const data = await response.json();
      // Ensure no duplicate wallets by checking addresses
      const uniqueWallets = data.wallets.filter((newWallet: any) => 
        !wallets.some(existingWallet => existingWallet.address === newWallet.publicKey)
      );

      const formattedWallets = uniqueWallets.map((wallet: any, index: number) => ({
        id: wallets.length + index + 1, // Adjust ID based on existing wallets
        address: wallet.publicKey,
        secretKey: wallet.secretKey,
        solAmount: '0',
        solBalance: wallet.solBalance || '0',
        tokenBalance: wallet.tokenBalance || '0', 
        tokensToBuy: '0',
        additionalSol: '0',
        tokenAmount: '0',
        selected: false
      }));

      // Combine existing wallets with new ones
      const updatedWallets = [...wallets, ...formattedWallets];
      setWallets(updatedWallets);
      
      if(formattedWallets.length > 0 && mint) {
        updateAllWalletBalances(updatedWallets, mint);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
      if (error instanceof Error && !error.message.includes('not found')) {
        toast.error('Error fetching wallets');
      }
    }
  }

  const handleWithdraw = async () => {
    // Check for funding wallet first
    if (!fundingWallet) {
      toast.error('Please enter funding wallet private key first');
      return;
    }

    const selectedWallets = wallets.filter(wallet => wallet.selected);

    if (selectedWallets.length === 0) {
      toast.error('No wallets selected for withdrawal');
      console.error('No wallets selected for withdrawal');
      return;
    }

    try {
      setLoading(prev => ({...prev, withdraw: true}));
      const fundingWalletKeypair = Keypair.fromSecretKey(bs58.decode(fundingWallet));
      const fundingWalletPublicKey = fundingWalletKeypair.publicKey.toString();

      const response = await fetch(`${API_URL}/api/token/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wallets: selectedWallets.map(wallet => ({
            address: wallet.address
          })),
          fundingWallet: fundingWalletPublicKey
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to withdraw funds');
        throw new Error(errorData.message || 'Failed to withdraw funds');
      }

      const data = await response.json();
      console.log(data);
      toast.success('Withdrawals executed successfully');
      console.log('Withdrawals executed successfully:', data);
      await updateAllWalletBalances(wallets);
    } catch (error) {
      console.error('Error executing withdrawals:', error);
      toast.error('Error executing withdrawals');
    } finally {
      setLoading(prev => ({...prev, withdraw: false}));
    }
  }


  const handleDownloadWallets = () => {
    const selectedWallets = wallets.filter(w => w.solAmount && Number(w.solAmount) > 0);

    if (selectedWallets.length === 0) {
      toast.error('No wallets with SOL amount to download');
      return;
    }

    try {
      setLoading(prev => ({...prev, downloadWallets: true}));

      // Create CSV content directly from wallets array
      const csvContent = [
        'ID,Address,Secret Key',
        ...selectedWallets.map(wallet => {
          return `${wallet.id},${wallet.address},${wallet.secretKey || 'N/A'}`;
        })
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', 'wallets.csv');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`Downloaded ${selectedWallets.length} wallets`);
    } catch (error) {
      console.error('Error downloading wallets:', error);
      toast.error('Error downloading wallets');
    } finally {
      setLoading(prev => ({...prev, downloadWallets: false}));
    }
  }

  const getMintAndWallets = async () => {
    const mint = await getTokenList();
    await getWallets(mint);
  };

  useEffect(() => {
    getMintAndWallets();
  }, []);

  const getSolBalance = async (address: string) => {
    const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=ed92c171-221f-4e06-8127-952ceea45fc4", 'confirmed');
    const balance = await connection.getBalance(new PublicKey(address));
    return balance / LAMPORTS_PER_SOL;
  }

  const updateWalletBalances = async (wallets: any[]) => {
    const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=ed92c171-221f-4e06-8127-952ceea45fc4", 'confirmed');
    
    const updatedWallets = await Promise.all(
      wallets.map(async (wallet) => {
        // Get SOL balance
        const solBalance = await connection.getBalance(new PublicKey(wallet.address));
        
        // Get token balance
        let tokenBalance = '0';
        if (tokenAddress) {
          try {
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
              new PublicKey(wallet.address),
              { mint: new PublicKey(tokenAddress) }
            );
            
            if (tokenAccounts.value.length > 0) {
              tokenBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.amount;
            }
          } catch (error) {
            console.error('Error fetching token balance:', error);
          }
        }

        return {
          ...wallet,
          solBalance: (solBalance / LAMPORTS_PER_SOL).toString(),
          tokenBalance: tokenBalance
        };
      })
    );
    return updatedWallets;
  }

  const updateAllWalletBalances = async (wallets: any[]) => {
    setIsBalanceLoading(true);
    try {
      const updatedWallets = await updateWalletBalances(wallets);
      setWallets(updatedWallets);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  // Update the refresh balances handler
  const handleRefreshBalances = async () => {
    if (wallets.length > 0) {
      setIsRefreshing(true);
      setIsBalanceLoading(true);
      try {
        const updatedWallets = await updateWalletBalances(wallets);
        setWallets(updatedWallets);
      } finally {
        setIsRefreshing(false);
        setIsBalanceLoading(false);
      }
    }
  }

  useEffect(() => {
    const initializeData = async () => {
      const mint = await getTokenList();
      await getWallets(mint);
      if (wallets.length > 0) {
        const updatedWallets = await updateWalletBalances(wallets);
        setWallets(updatedWallets);
      }
    };
    
    initializeData();
  }, []);

  return (
    <DefaultLayout>
      <div className="flex flex-col lg:flex-row gap-6 p-4 bg-[#1C1C1C] text-white min-h-screen">
        {/* Left Column - Create Meme Token */}
        <div className="lg:w-1/3 p-6 bg-[#242424] rounded-md">
        {isDeployed ? (
         <></>
        ) : 
        <h2 className="text-2xl font-bold mb-6">Create Meme Token</h2>

        }
        {isDeployed ? (
          <>
          


          <div className="space-y-4">
              <div className="bg-[#2B2B2B] border border-[#3A3A3A] p-4 rounded">
                <div className="flex items-center justify-center mb-4">

                  <span className="text-green-500 font-medium">                  ✅ Token Already Deployed</span>
                </div>
                <p className="text-sm text-gray-400 text-center">
                  This token has already been created and deployed.
                </p>
              </div>
            </div>
          </>

            ) : (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium">Name *</label>
                  <input
                    type="text"
                    placeholder="PepeArtist"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    className="w-full rounded bg-[#2B2B2B] border border-[#3A3A3A] py-2 px-3 text-sm focus:outline-none focus:border-[#4CAF50]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Symbol *</label>
                  <input
                    type="text"
                    placeholder="PEPEARTIST"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    className="w-full rounded bg-[#2B2B2B] border border-[#3A3A3A] py-2 px-3 text-sm focus:outline-none focus:border-[#4CAF50]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        setLogo(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full rounded bg-[#2B2B2B] border border-[#3A3A3A] py-2 px-3 text-sm focus:outline-none focus:border-[#4CAF50] file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:bg-[#4CAF50] file:text-white hover:file:bg-[#45a049]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Telegram URL</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter telegram url"
                      value={telegramUrl}
                      onChange={(e) => setTelegramUrl(e.target.value)}
                      className="w-full rounded bg-[#2B2B2B] border border-[#3A3A3A] py-2 pl-8 pr-3 text-sm focus:outline-none focus:border-[#4CAF50]"
                    />
                    <FaTelegramPlane className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4CAF50]" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Website URL</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter website url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full rounded bg-[#2B2B2B] border border-[#3A3A3A] py-2 pl-8 pr-3 text-sm focus:outline-none focus:border-[#4CAF50]"
                    />
                    <FaGlobe className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4CAF50]" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Twitter URL</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter twitter url"
                      value={twitterUrl}
                      onChange={(e) => setTwitterUrl(e.target.value)}
                      className="w-full rounded bg-[#2B2B2B] border border-[#3A3A3A] py-2 pl-8 pr-3 text-sm focus:outline-none focus:border-[#4CAF50]"
                    />
                    <FaTwitter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4CAF50]" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Description</label>
                  <textarea
                    placeholder="Enter description"
                    className="w-full rounded bg-[#2B2B2B] border border-[#3A3A3A] py-2 px-3 text-sm focus:outline-none focus:border-[#4CAF50]"
                    rows={4}
                    value={tokenDescription}
                    onChange={(e) => setTokenDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Dev Wallet (Private Key)</label>
                  <input
                    type="text"
                    placeholder="Enter your private key"
                    value={deployerWallet}
                    onChange={(e) => setDeployerWallet(e.target.value)}
                    className="w-full rounded bg-[#2B2B2B] border border-[#3A3A3A] py-2 px-3 text-sm focus:outline-none focus:border-[#4CAF50]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Initial Buy Amount (in SOL)</label>
                  <input
                    type="text"
                    placeholder="Enter initial buy amount + 0.005 (automatically added for rent)"
                    value={initialBuyAmount}
                    onChange={(e) => setInitialBuyAmount(e.target.value)}
                    className="w-full rounded bg-[#2B2B2B] border border-[#3A3A3A] py-2 px-3 text-sm focus:outline-none focus:border-[#4CAF50]"
                  />
                </div>

                <button
                  onClick={handleCreatePmetadata}
                  disabled={loading.createMetadata}
                  className="w-full bg-[#4CAF50] text-white py-2 px-4 rounded hover:bg-[#45a049] transition duration-300 flex items-center justify-center"
                >
                  {loading.createMetadata ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : null}
                  Create Metadata
                </button>
              </>
            )}
        </div>

        {/* Right Column - Token Buying Section */}
        <div className="lg:w-2/3 p-6 bg-[#242424] rounded-md">
          <h2 className="text-2xl font-bold mb-6">
            {token.name}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Token Address *</label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={token.contractAddress || ''}
                  className="w-full rounded bg-[#2B2B2B] border border-[#3A3A3A] py-2 pl-8 pr-3 text-sm focus:outline-none focus:border-[#4CAF50]"
                />
                <FaEthereum className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4CAF50]" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Funding Wallet (Private Key)</label>
              <input
                type="text"
                placeholder="NOT SET"
                value={fundingWallet}
                onChange={(e) => setFundingWallet(e.target.value)}
                className="w-full rounded bg-[#2B2B2B] border border-[#3A3A3A] py-2 px-3 text-sm focus:outline-none focus:border-[#4CAF50]"
              />
            </div>
            
            <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={handleGenerateWallets} 
                disabled={loading.generateWallets}
                className="bg-[#4CAF50] text-white py-1 px-3 rounded text-sm hover:bg-[#45a049] transition duration-300 flex items-center"
              >
                {loading.generateWallets ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : null}
                Generate Wallets
              </button>
             
              <button 
                onClick={handleSetAmount} 
                disabled={loading.setAmount}
                className="bg-[#4CAF50] text-white py-1 px-3 rounded text-sm hover:bg-[#45a049] transition duration-300 flex items-center"
              >
                {loading.setAmount ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : null}
                Set SOL Amount
              </button>

              <button 
                onClick={handleSetTAmount} 
                disabled={loading.setTokenAmount}
                className="bg-[#4CAF50] text-white py-1 px-3 rounded text-sm hover:bg-[#45a049] transition duration-300 flex items-center"
              >
                Set Token Amount
              </button>
            </div>
            <div>
              <button 
                onClick={handleRefreshBalances}
                disabled={isRefreshing}
                className="bg-[#4CAF50] text-white py-1 px-3 rounded text-sm hover:bg-[#45a049] transition duration-300 flex items-center"
              >
                <FaSync className={`${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            </div>


            {/* Wallet Table */}
            <div className="overflow-x-auto">
              {isBalanceLoading ? (
                <div className="flex justify-center items-center py-8">
                  <FaSpinner className="animate-spin text-2xl text-[#4CAF50]" />
                  <span className="ml-2 text-sm">Updating balances...</span>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#2B2B2B] text-left">
                      <th className="py-2 px-3 font-medium">
                        <input
                          type="checkbox"
                          onChange={() => {
                            const updatedWallets = wallets.map((w) => ({
                              ...w,
                              selected: !wallets.every(w => w.selected)
                            }));
                            setWallets(updatedWallets);
                            toast.success(wallets.every(w => w.selected) ? 'Deselected all wallets' : 'Selected all wallets');
                          }}
                          checked={wallets.length > 0 && wallets.every(w => w.selected)}
                          className="form-checkbox h-4 w-4 text-[#4CAF50] rounded border-[#3A3A3A] bg-[#2B2B2B]"
                        />
                      </th>
                      <th className="py-2 px-3 font-medium">#</th>
                      <th className="py-2 px-3 font-medium">Address</th>
                      <th className="py-2 px-3 font-medium">SOL Amount</th>
                      <th className="py-2 px-3 font-medium">SOL Balance</th>
                      <th className="py-2 px-3 font-medium">Token Balance</th>
                      <th className="py-2 px-3 font-medium">Token Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallets.map((wallet) => (
                      <tr key={wallet.id} className="border-b border-[#3A3A3A]">
                        <td className="py-2 px-3">
                          <input
                            type="checkbox"
                            checked={wallet.selected}
                            onChange={() => {
                              const updatedWallets = wallets.map((w) =>
                                w.id === wallet.id ? { ...w, selected: !w.selected } : w
                              );
                              setWallets(updatedWallets);
                              toast.success(wallet.selected ? `Deselected wallet #${wallet.id}` : `Selected wallet #${wallet.id}`);
                            }}
                            className="form-checkbox h-4 w-4 text-[#4CAF50] rounded border-[#3A3A3A] bg-[#2B2B2B]"
                          />
                        </td>
                        <td className="py-2 px-3">{wallet.id}</td>
                        <td className="py-2 px-3">{wallet.address}</td>
                        <td className="py-2 px-3">{wallet.solAmount}</td>
                        <td className="py-2 px-3">
                          {isBalanceLoading ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            Number(wallet.solBalance).toFixed(3)
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {isBalanceLoading ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            Number(wallet.tokenBalance).toFixed(0)
                          )}
                        </td>
                        <td className="py-2 px-3">{wallet.tokenAmount}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Target Wallet & Actions */}
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="flex flex-wrap gap-2 w-full">
                {/* Wallet Management */}
                <div className="flex gap-2">
                  <button 
                    onClick={handleFundWallets2} 
                    disabled={loading.fundWallets}
                    className="bg-[#4CAF50] text-white py-2 px-4 rounded text-sm hover:bg-[#45a049] transition duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.fundWallets ? (
                      <FaSpinner className="animate-spin" />
                    ) : null}
                    <span>Fund Wallets</span>
                  </button>

                  <button 
                    onClick={handleCreateToken}
                    disabled={loading.createMetadata}
                    className="bg-[#4CAF50] text-white py-2 px-4 rounded text-sm hover:bg-[#45a049] transition duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Create & Buy</span>
                  </button>

                  <button 
                    onClick={handleDownloadWallets}
                    disabled={loading.downloadWallets}
                    className="bg-[#4CAF50] text-white py-2 px-4 rounded text-sm hover:bg-[#45a049] transition duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.downloadWallets ? (
                      <FaSpinner className="animate-spin" />
                    ) : null}
                    <span>Download Wallets</span>
                  </button>
                </div>

                {/* Trading Actions */}
                <div className="flex gap-2">
                  {/* <button 
                    onClick={handleCreateAndBuy2}
                    disabled={loading.buy}
                    className="bg-[#4CAF50] text-white py-2 px-4 rounded text-sm hover:bg-[#45a049] transition duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.buy ? (
                      <FaSpinner className="animate-spin" />
                    ) : null}
                    <span>Create & Buy</span>
                  </button> */}

                  <button 
                    onClick={handleSeparateBuy}
                    disabled={loading.buy} 
                    className="bg-[#4CAF50] text-white py-2 px-4 rounded text-sm hover:bg-[#45a049] transition duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.buy ? (
                      <FaSpinner className="animate-spin" />
                    ) : null}
                    <span>Buy</span>
                  </button>

                  <button 
                    onClick={handleSellTokens}
                    disabled={loading.sell}
                    className="bg-[#4CAF50] text-white py-2 px-4 rounded text-sm hover:bg-[#45a049] transition duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.sell ? (
                      <FaSpinner className="animate-spin" />
                    ) : null}
                    <span>Sell</span>
                  </button>

                  <button 
                    onClick={handleWithdraw}
                    disabled={loading.withdraw}
                    className="bg-[#4CAF50] text-white py-2 px-4 rounded text-sm hover:bg-[#45a049] transition duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.withdraw ? (
                      <FaSpinner className="animate-spin" />
                    ) : null}
                    <span>Withdraw</span>
                  </button>

              
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showGeneratePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="p-6 rounded-lg w-full max-w-md relative">
            <button 
              onClick={() => {
                setShowGeneratePopup(false);
                toast.success('Closed wallet generator');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>
            <Generate onGenerate={handleWalletGeneration} params={params} />
          </div>
        </div>
      )}

      {showSetAmountPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="p-6 rounded-lg w-full max-w-md relative">
            <button 
              onClick={() => {
                setShowSetAmountPopup(false);
                toast.success('Closed amount setter');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>
            <SetAmount onSetAmount={handleSetSolAmount} />
          </div>
        </div>
      )}

      {showSetTokenAmountPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="p-6 rounded-lg w-full max-w-md relative">
            <button 
              onClick={() => {
                setShowSetTokenAmountPopup(false);
                toast.success('Closed token amount setter');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>
            <SetTokenAmount onSetAmount={handleSetTokenAmount} />
          </div>
        </div>
      )}

      <Toaster
        position="bottom-center"
        reverseOrder={false}
      />
    </DefaultLayout>
  );
};

export default Page;
