"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "../../contexts/WalletContext";
import WalletInfo from "../../components/WalletInfo";
import ReceiveToken from "../../components/ReceiveToken";
import SendToken from "../../components/SendToken";
import TransactionHistory from "../../components/TransactionHistory";
import NostrIntegration from "../../components/NostrIntegration";
import { useSearchParams } from "next/navigation";

export default function WalletPage() {
  const { balance, isLoading, error } = useWallet();
  const [activeTab, setActiveTab] = useState<
    "balance" | "send" | "receive" | "history" | "nostr"
  >("balance");
  const searchParams = useSearchParams();

  // Set initial tab based on URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "send") setActiveTab("send");
    else if (tab === "receive") setActiveTab("receive");
    else if (tab === "history") setActiveTab("history");
    else if (tab === "nostr") setActiveTab("nostr");
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Cashu Wallet</h1>

        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-center mb-6">
            <h2 className="text-2xl font-semibold">
              {isLoading ? "Loading..." : `Balance: ${balance} sats`}
            </h2>
          </div>

          <div className="flex flex-wrap justify-center space-x-2 space-y-2 sm:space-y-0 mb-6">
            <button
              onClick={() => setActiveTab("balance")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "balance" ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              Balance
            </button>
            <button
              onClick={() => setActiveTab("send")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "send" ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              Send
            </button>
            <button
              onClick={() => setActiveTab("receive")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "receive" ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              Receive
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "history" ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab("nostr")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "nostr" ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              Nostr
            </button>
          </div>

          <div className="mt-6">
            {activeTab === "balance" && <WalletInfo />}
            {activeTab === "send" && <SendToken />}
            {activeTab === "receive" && <ReceiveToken />}
            {activeTab === "history" && <TransactionHistory />}
            {activeTab === "nostr" && <NostrIntegration />}
          </div>
        </div>

        <p className="text-center text-gray-400 mt-8">
          This wallet uses Cashu for ecash storage and is compatible with NIP-60
        </p>
      </main>

      <footer className="py-6 text-center text-gray-400">
        <p>Powered by Next.js and Cashu</p>
      </footer>
    </div>
  );
}
