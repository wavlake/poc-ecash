// types/wallet.ts
import { Proof } from "@cashu/cashu-ts";

export interface WalletState {
  mints: string[];
  balance: number;
  isInitialized: boolean;
  proofs: Proof[];
  transactions: Transaction[];
  pubkey?: string;
  error?: string;
}

export interface Transaction {
  id: string;
  type: "send" | "receive" | "mint" | "melt";
  amount: number;
  timestamp: number;
  memo?: string;
  token?: string;
  recipient?: string;
  status: "pending" | "complete" | "failed";
}

// NIP-60 related types
export interface NostrWalletEvent {
  kind: number; // 17375 for wallet events
  content: string; // encrypted content
  tags: string[][]; // tags
  pubkey: string;
  created_at: number;
  id: string;
  sig: string;
}

export interface NostrProofEvent {
  kind: number; // 7375 for unspent proof events
  content: string; // encrypted content
  tags: string[][]; // tags
  pubkey: string;
  created_at: number;
  id: string;
  sig: string;
}

export interface NostrSpendHistoryEvent {
  kind: number; // 7376 for spending history events
  content: string; // encrypted content
  tags: string[][]; // tags
  pubkey: string;
  created_at: number;
  id: string;
  sig: string;
}

export interface EncryptedNostrWalletContent {
  privkey?: string; // P2PK private key for NIP-61 nutzaps (if supported)
  mints: string[]; // List of supported mints
}

export interface EncryptedNostrProofContent {
  mint: string;
  proofs: Proof[];
  del?: string[]; // Event IDs that this event replaces/deletes
}

export interface EncryptedNostrSpendHistoryContent {
  mint: string;
  amount: number;
  timestamp: number;
  recipient?: string;
  memo?: string;
  token?: string;
}
