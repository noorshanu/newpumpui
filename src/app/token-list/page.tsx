"use client";

import DefaultLayout from "@/components/Layouts/DefaultLayout";
import React, { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import axios from "axios";
import RpcToast from "../../components/RpcToast";
import { FaCopy, FaList } from "react-icons/fa6";
import { RiCheckboxCircleFill, RiCloseCircleFill, RiExpandUpDownFill, RiLoader4Line } from "react-icons/ri";
import Loader from "../Loader";
import { ethers } from "ethers";

interface Token {
  verified: boolean;
  _id: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  rpcUrl: string;
  publicKey: string;
  deployer: string;
  deployValue: string;
  success: boolean;
  deploymentHash: string;
  createdAt: string;
  tokenAddress: string;
}

const TokenList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { address, isConnected } = useAccount(); // Connected wallet address
  const [tokens, setTokens] = useState<Token[]>([]);
  const [verifications, setVerifications] = useState<{ [key: string]: boolean | null }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    RpcToast("Token address copied to clipboard!", "success");
  };
  const getChainName = (rpcUrl: string) => {
    if (rpcUrl.includes("bsc")) return "Binance Smart Chain";
    if (rpcUrl.includes("eth") || rpcUrl.includes("ethereum")) return "Ethereum";
    if (rpcUrl.includes("polygon")) return "Polygon";
    if (rpcUrl.includes("avalanche")) return "Avalanche";
    if (rpcUrl.includes("base")) return "Base";
    if (rpcUrl.includes("tron")) return "Tron";
    // Add other chain mappings as needed
    return "Unknown Chain";
  };
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tokens.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tokens.length / itemsPerPage);

  // Check if the wallet is registered and register if not
  const checkAndRegisterWallet = useCallback(async () => {
    if (isConnected && address) {
      try {
        const response = await axios.post("https://api-tg.blocktools.ai/auth/register", {
          ownerWallet: address,
        });
        if (response.data.success) {
          RpcToast("Wallet registered successfully!", "success");
        }
      } catch (error) {
        console.error("Wallet registration failed:", error);
        RpcToast("Failed to register wallet.", "error");
      }
    }
  }, [isConnected, address]);

  // Fetch tokens associated with the ownerWallet
  const fetchTokens = useCallback(async () => {
    if (!isConnected || !address) {
      setError("Please connect your wallet.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("https://api-tg.blocktools.ai/external/projectsettings/get-tokens", {
        ownerWallet: address,
      });

      // Filter tokens where success is true
      const successfulTokens = response.data.tokens.filter((token: Token) => token.success);
      setTokens(successfulTokens);
    } catch (err) {
      console.error("Error fetching tokens:", err);
      setError("Failed to fetch tokens.");
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);

  // Run checkAndRegisterWallet and fetchTokens when the component mounts
  useEffect(() => {
    if (isConnected) {
      checkAndRegisterWallet().then(() => {
        fetchTokens();
      });
    }
  }, [isConnected, checkAndRegisterWallet, fetchTokens]);

  // Check if the token address is verified by checking for ERC20 functions
  const checkTokenVerification = async (tokenAddress: string) => {
    try {
      const provider = ethers.getDefaultProvider(); // Ensure this matches the token's network
      const contract = new ethers.Contract(
        tokenAddress,
        ["function totalSupply() view returns (uint256)", "function symbol() view returns (string)"],
        provider
      );

      const symbol = await contract.symbol(); // Attempt to read ERC-20 symbol to verify the contract
      return !!symbol; // If symbol is accessible, the contract is likely verified as ERC-20
    } catch (error) {
      console.error("Verification check failed for token:", tokenAddress, error);
      return false;
    }
  };
  useEffect(() => {
    const fetchVerifications = async () => {
      const verificationResults: { [key: string]: boolean | null } = {};
      await Promise.all(
        tokens.map(async (token) => {
          const isVerified = await checkTokenVerification(token.tokenAddress);
          verificationResults[token.tokenAddress] = isVerified;
        })
      );
      setVerifications(verificationResults);
    };

    fetchVerifications();
  }, [tokens]);

   // Render logic for the verification status of each token
   const renderVerificationStatus = (tokenAddress: string) => {
    const verified = verifications[tokenAddress];

    if (verified === null) {
      // Loading state for verification
      return (
        <button className="flex items-center justify-center rounded-full bg-[#020308a7] border border-[#B7B6BB26] px-2 py-1 font-semibold text-gray-400">
          <RiLoader4Line className="animate-spin mr-1" /> Checking...
        </button>
      );
    }

    return verified ? (
      <button className="flex items-center justify-center rounded-full bg-[#020308a7] border border-[#B7B6BB26] px-2 py-1 font-semibold text-[#0FF48F]">
        <RiCheckboxCircleFill className="mr-1" /> Verified
      </button>
    ) : (
      <button className="flex items-center justify-center rounded-full bg-[#020308a7] border border-[#B7B6BB26] px-2 py-1 font-semibold text-[#F45019]">
        <RiCloseCircleFill className="mr-1" /> Not Verified
      </button>
    );
  };


  return (
    <DefaultLayout>
      <div className="container mx-auto h-full sm:h-[100vh] px-2 pt-4 pb-[100%] sm:pb-[12%]">
        {/* Header */}
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-white ">
          <FaList /> Token List
        </h2>

        {/* Table */}
        <div className="overflow-x-auto border border-[#B7B6BB26] rounded-lg shadow-md">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {loading ? (
            <div className="text-lg text-center"><Loader/></div>
          ) : tokens.length > 0 ? (
            <table className="min-w-full rounded-lg  p-4  shadow-lg bg-[#ffffff0e]  border border-[#B7B6BB26] backdrop-blur-lg text-white">
              <thead>
                <tr className="">
                  <th className="border-[#B7B6BB26] border-b border-r p-4 text-left">
                    <div className="flex items-center justify-between gap-4">
                      No <RiExpandUpDownFill />
                    </div>
                  </th>
                  <th className="border-[#B7B6BB26] border-b border-r p-4 text-left">
                    <div className="flex items-center justify-between gap-4">
                      Name <RiExpandUpDownFill />
                    </div>
                  </th>
                  <th className="border-[#B7B6BB26] border-b border-r p-4 text-left">
                    <div className="flex items-center justify-between gap-4">
                      Chain <RiExpandUpDownFill />
                    </div>
                  </th>
                  <th className="border-[#B7B6BB26] border-b border-r p-4 text-left">
                    <div className="flex items-center justify-between gap-4">
                      Address <RiExpandUpDownFill />
                    </div>
                  </th>
                  <th className="border-[#B7B6BB26] border-b p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((token, index) => (
                  <tr key={token._id} className="border-[#B7B6BB26] border-t">
                    <td className="border-r border-[#B7B6BB26] p-4">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="border-r border-[#B7B6BB26] p-4">
                      <a href="/token-details">{token.name}</a>
                    </td>
                    <td className="border-r border-[#B7B6BB26] p-4"> {getChainName(token.rpcUrl)}</td>
                    <td className="flex items-center border-r border-[#B7B6BB26] p-4 gap-2">
                      <span>
                        {`${token.tokenAddress.slice(0, 8)}...${token.tokenAddress.slice(-8)}`}
                      </span>
                      <button
                        className="ml-2 text-[#fff] py-1 px-4  text-sm bg-[#21d181] font-medium rounded-md"
                        onClick={() => copyToClipboard(token.tokenAddress)}
                      >
                        <FaCopy/>
                      </button>
                    </td>
                    <td className="px-4">
                      <div className="flex items-center justify-center">
                      {renderVerificationStatus(token.tokenAddress)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center text-white">No tokens found.</div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-center space-x-2">
          <button
            className={`rounded-md px-4 py-2 ${
              currentPage === 1 ? "bg-gray-400" : "bg-blue-600 text-white"
            }`}
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className={`rounded-md px-4 py-2 ${
              currentPage === totalPages ? "bg-gray-400" : "bg-blue-600 text-white"
            }`}
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default TokenList;
