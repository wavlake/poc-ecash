"use client";

import React from "react";
import { useWallet } from "../contexts/WalletContext";
import { Transaction } from "../types/wallet";

const TransactionHistory: React.FC = () => {
  const { transactions } = useWallet();

  // Helper function to format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Helper function to shorten token strings
  const shortenToken = (token: string): string => {
    if (!token) return "";
    if (token.length <= 20) return token;
    return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
  };

  // Helper function to get transaction type class
  const getTypeClass = (type: Transaction["type"]): string => {
    switch (type) {
      case "send":
        return "text-red-500";
      case "receive":
        return "text-green-500";
      case "mint":
        return "text-blue-500";
      case "melt":
        return "text-purple-500";
      default:
        return "text-gray-400";
    }
  };

  // Helper function to get transaction icon
  const getTypeIcon = (type: Transaction["type"]): string => {
    switch (type) {
      case "send":
        return "↑";
      case "receive":
        return "↓";
      case "mint":
        return "+";
      case "melt":
        return "-";
      default:
        return "•";
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Transaction History</h3>

      {transactions.length === 0 ? (
        <div className="text-center text-gray-400 py-6">
          No transactions yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-gray-300">Type</th>
                <th className="px-4 py-2 text-left text-gray-300">Amount</th>
                <th className="px-4 py-2 text-left text-gray-300">Date</th>
                <th className="px-4 py-2 text-left text-gray-300">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-700">
                  <td className={`px-4 py-3 ${getTypeClass(tx.type)}`}>
                    <span className="mr-2">{getTypeIcon(tx.type)}</span>
                    {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={getTypeClass(tx.type)}>
                      {tx.type === "send" || tx.type === "melt" ? "-" : "+"}
                      {tx.amount}
                    </span>
                    <span className="text-gray-400 ml-1">sats</span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    {tx.memo && (
                      <div className="text-gray-300 mb-1">
                        <span className="text-gray-400">Memo: </span>
                        {tx.memo}
                      </div>
                    )}
                    {tx.token && (
                      <div className="text-gray-400 text-xs font-mono">
                        {shortenToken(tx.token)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
