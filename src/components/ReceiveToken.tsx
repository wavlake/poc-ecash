"use client";

import React, { useState } from "react";
import { useWallet } from "../contexts/WalletContext";

const ReceiveToken: React.FC = () => {
  const { receiveToken, isLoading } = useWallet();
  const [token, setToken] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [receivedAmount, setReceivedAmount] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      setError("Please enter a token");
      return;
    }

    try {
      setError("");
      setSuccess(false);

      const proofs = await receiveToken(token);

      // Calculate the total amount of received tokens
      const amount = proofs.reduce((sum, proof) => sum + proof.amount, 0);
      setReceivedAmount(amount);
      setSuccess(true);
      setToken(""); // Clear input after successful redemption
    } catch (err: any) {
      console.error("Failed to receive token:", err);
      setError(err.message || "Failed to receive token");
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Receive Tokens</h3>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
      )}

      {success && (
        <div className="bg-green-500 text-white p-3 rounded mb-4">
          Successfully received {receivedAmount} sats!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="token" className="block text-gray-400 mb-2">
            Token
          </label>
          <textarea
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-2 bg-gray-800 rounded-lg text-white h-24"
            placeholder="Paste the Cashu token here"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full p-2 rounded-lg ${
            isLoading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
        >
          {isLoading ? "Receiving Token..." : "Receive Token"}
        </button>
      </form>
    </div>
  );
};

export default ReceiveToken;
