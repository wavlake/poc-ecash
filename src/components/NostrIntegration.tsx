"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "../contexts/WalletContext";
import { nostrWalletService } from "../services/nostrWalletService";

const NostrIntegration: React.FC = () => {
  const { balance } = useWallet();
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [recipientPubkey, setRecipientPubkey] = useState<string>("");
  const [amount, setAmount] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load Nostr public key on component mount
  useEffect(() => {
    const loadNostrKey = () => {
      try {
        const publicKey = nostrWalletService.getPublicKey();
        setPubkey(publicKey);

        // Check if Nostr integration is enabled
        const enabled = localStorage.getItem("nostr_integration_enabled");
        setIsEnabled(enabled === "true");
      } catch (err) {
        console.error("Failed to load Nostr key:", err);
        setError("Failed to load Nostr key");
      }
    };

    loadNostrKey();
  }, []);

  // Toggle Nostr integration
  const toggleNostrIntegration = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!isEnabled) {
        // Initialize Nostr wallet with default mints
        const mints = [
          "https://8333.space:3338",
          "https://legend.lnbits.com/cashu/api/v1/LnbitsCompat",
        ];

        await nostrWalletService.initializeWallet(mints);
        localStorage.setItem("nostr_integration_enabled", "true");
        setIsEnabled(true);
        setSuccess("Nostr integration enabled successfully");
      } else {
        localStorage.setItem("nostr_integration_enabled", "false");
        setIsEnabled(false);
        setSuccess("Nostr integration disabled");
      }
    } catch (err) {
      console.error("Failed to toggle Nostr integration:", err);
      setError("Failed to toggle Nostr integration");
    }
  };

  // Format public key for display
  const formatPubkey = (key: string | null): string => {
    if (!key) return "Not available";
    if (key.length <= 16) return key;
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
  };

  // Handle sending token to a Nostr pubkey
  const handleSendToNostr = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientPubkey.trim()) {
      setError("Please enter a recipient public key");
      return;
    }

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
      setSuccess(null);

      // This is just a placeholder - in a real app, you'd create a proper
      // NIP-61 nutzap with P2PK locking to the recipient's pubkey
      setSuccess(
        "Sending to Nostr users is not fully implemented in this demo"
      );
    } catch (err) {
      console.error("Failed to send to Nostr user:", err);
      setError("Failed to send to Nostr user");
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Nostr Integration (NIP-60)</h3>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
      )}

      {success && (
        <div className="bg-green-500 text-white p-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="mb-6">
        <p className="text-gray-300 mb-2">
          Your Nostr Public Key:{" "}
          <span className="font-mono">{formatPubkey(pubkey)}</span>
        </p>

        <div className="flex items-center mt-4">
          <span className="mr-3 text-gray-300">Nostr Wallet Integration:</span>
          <button
            onClick={toggleNostrIntegration}
            className={`px-4 py-2 rounded-lg ${
              isEnabled ? "bg-green-600" : "bg-gray-500"
            } text-white`}
          >
            {isEnabled ? "Enabled" : "Disabled"}
          </button>
        </div>
      </div>

      {isEnabled && (
        <div className="border-t border-gray-600 pt-4 mt-4">
          <h4 className="text-lg font-medium mb-3">
            Send to Nostr User (NIP-61)
          </h4>

          <form onSubmit={handleSendToNostr}>
            <div className="mb-4">
              <label
                htmlFor="recipientPubkey"
                className="block text-gray-400 mb-2"
              >
                Recipient Public Key
              </label>
              <input
                type="text"
                id="recipientPubkey"
                value={recipientPubkey}
                onChange={(e) => setRecipientPubkey(e.target.value)}
                className="w-full p-2 bg-gray-800 rounded-lg text-white"
                placeholder="npub1..."
                required
              />
            </div>

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

            <button
              type="submit"
              className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Send to Nostr User
            </button>
          </form>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-400">
        <p>
          Note: This is a simplified implementation for demonstration purposes.
        </p>
        <p>
          A full implementation would include proper NIP-60/61 support with
          encryption and relay communication.
        </p>
      </div>
    </div>
  );
};

export default NostrIntegration;
