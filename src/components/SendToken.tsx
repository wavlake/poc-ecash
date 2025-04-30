"use client";

import React, { useState } from "react";
import { useWallet } from "../contexts/WalletContext";

const SendToken: React.FC = () => {
  const { balance, sendToken, isLoading } = useWallet();
  const [amount, setAmount] = useState<number>(10);
  const [memo, setMemo] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    if (amount > balance) {
      setError("Insufficient balance");
      return;
    }

    try {
      setError("");
      setSuccess(false);
      setToken("");

      const generatedToken = await sendToken(amount, memo);

      setToken(generatedToken);
      setSuccess(true);
    } catch (err: any) {
      console.error("Failed to send token:", err);
      setError(err.message || "Failed to send token");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
    alert("Token copied to clipboard!");
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Send Tokens</h3>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
      )}

      {success && (
        <div className="bg-green-500 text-white p-3 rounded mb-4">
          Token successfully created!
        </div>
      )}

      {token ? (
        <div className="mb-4">
          <div className="bg-gray-800 p-4 rounded-lg mb-2 break-all">
            <p className="font-mono text-xs">{token}</p>
          </div>
          <button
            onClick={copyToClipboard}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
          >
            Copy Token
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-400 mb-2">
              Amount (sats)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-2 bg-gray-800 rounded-lg text-white"
              required
              min="1"
              max={balance}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="memo" className="block text-gray-400 mb-2">
              Memo (optional)
            </label>
            <input
              type="text"
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded-lg text-white"
              placeholder="Enter a memo for this transaction"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-2 rounded-lg ${
              isLoading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isLoading ? "Creating Token..." : "Create Token"}
          </button>
        </form>
      )}
    </div>
  );
};

export default SendToken;
