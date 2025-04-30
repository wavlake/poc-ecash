"use client";

import React from "react";
import { useWallet } from "../contexts/WalletContext";

const WalletInfo: React.FC = () => {
  const { balance, transactions, reset } = useWallet();

  // Calculate total sent and received
  const totalSent = transactions
    .filter((tx) => tx.type === "send")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalReceived = transactions
    .filter((tx) => tx.type === "receive")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Wallet Summary</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <h4 className="text-gray-400 text-sm">Current Balance</h4>
          <p className="text-2xl font-bold text-blue-500">{balance} sats</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <h4 className="text-gray-400 text-sm">Total Sent</h4>
          <p className="text-2xl font-bold text-red-500">{totalSent} sats</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <h4 className="text-gray-400 text-sm">Total Received</h4>
          <p className="text-2xl font-bold text-green-500">
            {totalReceived} sats
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <h4 className="text-gray-400 text-sm mb-2">Debug Options</h4>
        <button
          onClick={reset}
          className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Reset Wallet
        </button>
      </div>
    </div>
  );
};

export default WalletInfo;
