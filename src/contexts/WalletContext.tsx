"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { walletService } from "../services/walletService";
import { Transaction } from "../types/wallet";
import { Proof } from "@cashu/cashu-ts";

interface WalletContextType {
  balance: number;
  isLoading: boolean;
  transactions: Transaction[];
  error: string | null;
  sendToken: (amount: number, memo?: string) => Promise<string>;
  receiveToken: (token: string) => Promise<Proof[]>;
  zapTrack: (trackId: string, amount: number) => Promise<string>;
  reset: () => Promise<void>;
}

// Create context with default values
const WalletContext = createContext<WalletContextType>({
  balance: 0,
  isLoading: false,
  transactions: [],
  error: null,
  sendToken: async () => "",
  receiveToken: async () => [],
  zapTrack: async () => "",
  reset: async () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize wallet on component mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);

        // Initialize the wallet
        await walletService.initialize();

        // Load initial wallet state
        await refreshWalletState();

        setIsLoading(false);
      } catch (err: any) {
        console.error("Failed to initialize wallet:", err);
        setError("Failed to initialize wallet. Please try again later.");
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Function to refresh wallet state (balance, transactions)
  const refreshWalletState = async () => {
    try {
      const balance = await walletService.getBalance();
      const transactions = await walletService.getTransactions();

      setBalance(balance);
      setTransactions(transactions);
    } catch (err: any) {
      console.error("Failed to refresh wallet state:", err);
      setError("Failed to get wallet details. Please try again later.");
    }
  };

  // Send a token
  const sendToken = async (amount: number, memo?: string): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await walletService.sendToken(amount, memo);

      // Refresh wallet state after transaction
      await refreshWalletState();

      setIsLoading(false);
      return token;
    } catch (err: any) {
      console.error("Failed to send token:", err);
      setError(`Failed to send token: ${err.message}`);
      setIsLoading(false);
      throw err;
    }
  };

  // Receive a token
  const receiveToken = async (token: string): Promise<Proof[]> => {
    try {
      setIsLoading(true);
      setError(null);

      const proofs = await walletService.receiveToken(token);

      // Refresh wallet state after transaction
      await refreshWalletState();

      setIsLoading(false);
      return proofs;
    } catch (err: any) {
      console.error("Failed to receive token:", err);
      setError(`Failed to receive token: ${err.message}`);
      setIsLoading(false);
      throw err;
    }
  };

  // Zap a track (simplified for now)
  const zapTrack = async (trackId: string, amount: number): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await walletService.zapTrack(trackId, amount);

      // Refresh wallet state after transaction
      await refreshWalletState();

      setIsLoading(false);
      return token;
    } catch (err: any) {
      console.error("Failed to zap track:", err);
      setError(`Failed to zap track: ${err.message}`);
      setIsLoading(false);
      throw err;
    }
  };

  // Reset wallet (for debugging)
  const reset = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await walletService.reset();

      // Refresh wallet state after reset
      await refreshWalletState();

      setIsLoading(false);
    } catch (err: any) {
      console.error("Failed to reset wallet:", err);
      setError(`Failed to reset wallet: ${err.message}`);
      setIsLoading(false);
      throw err;
    }
  };

  // Context value
  const contextValue: WalletContextType = {
    balance,
    isLoading,
    transactions,
    error,
    sendToken,
    receiveToken,
    zapTrack,
    reset,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};
