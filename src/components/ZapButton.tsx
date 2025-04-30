"use client";

import React, { useState } from "react";
import { useWallet } from "../contexts/WalletContext";

interface ZapButtonProps {
  trackId: string;
  trackTitle: string;
}

const ZapButton: React.FC<ZapButtonProps> = ({ trackId, trackTitle }) => {
  const { balance, zapTrack, isLoading } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleZap = async () => {
    if (amount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    if (amount > balance) {
      setError("Insufficient balance");
      return;
    }

    try {
      setError(null);
      setSuccess(false);

      await zapTrack(trackId, amount);

      setSuccess(true);

      // Close the modal after a successful zap
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("Failed to zap track:", err);
      setError(err.message || "Failed to zap track");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="bg-yellow-600 text-white p-2 rounded-full hover:bg-yellow-700 focus:outline-none"
        title="Zap this track"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Zap Track</h3>
            <p className="mb-4 text-gray-300">Send a zap to "{trackTitle}"</p>

            {error && (
              <div className="bg-red-500 text-white p-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500 text-white p-3 rounded mb-4">
                Successfully zapped {amount} sats!
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Amount (sats)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-2 bg-gray-700 rounded-lg text-white"
                min="1"
                max={balance}
              />
              <p className="text-gray-400 text-sm mt-1">
                Wallet balance: {balance} sats
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleZap}
                disabled={isLoading}
                className={`px-4 py-2 ${
                  isLoading
                    ? "bg-gray-600"
                    : "bg-yellow-600 hover:bg-yellow-700"
                } text-white rounded-lg`}
              >
                {isLoading ? "Processing..." : "Zap"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZapButton;
