"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useWallet } from "../contexts/WalletContext";

const WalletButton: React.FC = () => {
  const { balance, isLoading } = useWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path
            fillRule="evenodd"
            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
            clipRule="evenodd"
          />
        </svg>
        <span className="mr-1">Wallet</span>
        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
          {isLoading ? "..." : `${balance} sats`}
        </span>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <Link
              href="/wallet"
              className="block px-4 py-2 text-white hover:bg-gray-700 rounded-lg"
            >
              Open Wallet
            </Link>
            <Link
              href="/wallet?tab=send"
              className="block px-4 py-2 text-white hover:bg-gray-700 rounded-lg"
            >
              Send
            </Link>
            <Link
              href="/wallet?tab=receive"
              className="block px-4 py-2 text-white hover:bg-gray-700 rounded-lg"
            >
              Receive
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletButton;
