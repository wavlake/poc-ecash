// services/nostrWalletService.ts
import {
  EncryptedNostrProofContent,
  EncryptedNostrWalletContent,
  NostrWalletEvent,
  NostrProofEvent,
} from "../types/wallet";
import { generateSecretKey, getPublicKey, nip04 } from "nostr-tools";
import { getDecodedToken, getEncodedTokenV4, Proof } from "@cashu/cashu-ts";

// Event kinds defined in NIP-60
const WALLET_EVENT_KIND = 17375;
const PROOF_EVENT_KIND = 7375;
const SPEND_HISTORY_KIND = 7376;

// Default relays to use
const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.nostr.band",
  "wss://relay.wavlake.com",
];

// Helper function to convert Uint8Array to hex string for storage
function arrayToHex(array: Uint8Array): string {
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper function to convert hex string back to Uint8Array
function hexToArray(hex: string): Uint8Array {
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return result;
}

class NostrWalletService {
  private privateKey: Uint8Array | null = null;
  private publicKey: string | null = null;
  private relays: string[] = DEFAULT_RELAYS;

  constructor() {
    // Try to load keys from localStorage
    this.loadKeys();
  }

  // Generate or load Nostr keys
  private loadKeys() {
    try {
      const savedPrivateKey = localStorage.getItem("nostr_private_key");
      if (savedPrivateKey) {
        this.privateKey = hexToArray(savedPrivateKey);
        this.publicKey = getPublicKey(this.privateKey);
      } else {
        // For demo purposes, we'll generate a new keypair
        // In a real app, you would use NIP-07 or other secure methods
        this.privateKey = generateSecretKey();
        this.publicKey = getPublicKey(this.privateKey);
        localStorage.setItem("nostr_private_key", arrayToHex(this.privateKey));
      }
    } catch (error) {
      console.error("Failed to load or generate Nostr keys:", error);
    }
  }

  // Get the user's public key
  getPublicKey(): string | null {
    return this.publicKey;
  }

  // Initialize or update the wallet event
  async initializeWallet(mints: string[]): Promise<boolean> {
    if (!this.privateKey || !this.publicKey) {
      throw new Error("Nostr keys not available");
    }

    try {
      // Create wallet content
      const walletContent: EncryptedNostrWalletContent = {
        mints: mints,
      };

      // In a real app, you would encrypt this with NIP-04 or NIP-44
      // For simplicity, we're just using JSON.stringify here
      const contentString = JSON.stringify(walletContent);

      // In a real app, you would publish this to Nostr relays
      // For now, we'll just store it locally
      localStorage.setItem("nostr_wallet_content", contentString);

      return true;
    } catch (error) {
      console.error("Failed to initialize wallet:", error);
      return false;
    }
  }

  // Save proofs to Nostr
  async saveProofs(mint: string, proofs: Proof[]): Promise<boolean> {
    if (!this.privateKey || !this.publicKey) {
      throw new Error("Nostr keys not available");
    }

    try {
      // Create proof content
      const proofContent: EncryptedNostrProofContent = {
        mint,
        proofs,
      };

      // In a real app, you would encrypt this with NIP-04 or NIP-44
      // For simplicity, we're just using JSON.stringify here
      const contentString = JSON.stringify(proofContent);

      // In a real app, you would publish this to Nostr relays
      // For now, we'll just store it locally
      const existingProofs = localStorage.getItem("nostr_proofs");
      const proofsArray = existingProofs ? JSON.parse(existingProofs) : [];

      proofsArray.push(proofContent);
      localStorage.setItem("nostr_proofs", JSON.stringify(proofsArray));

      return true;
    } catch (error) {
      console.error("Failed to save proofs:", error);
      return false;
    }
  }

  // Load proofs from Nostr
  async loadProofs(): Promise<Proof[]> {
    try {
      // In a real app, you would fetch this from Nostr relays
      // For now, we'll just load from localStorage
      const existingProofs = localStorage.getItem("nostr_proofs");

      if (!existingProofs) {
        return [];
      }

      const proofsArray: EncryptedNostrProofContent[] =
        JSON.parse(existingProofs);

      // Flatten all proofs from all entries
      const allProofs = proofsArray.reduce((acc, entry) => {
        return [...acc, ...entry.proofs];
      }, [] as Proof[]);

      return allProofs;
    } catch (error) {
      console.error("Failed to load proofs:", error);
      return [];
    }
  }

  // Record a spend in the history
  async recordSpend(
    mint: string,
    amount: number,
    recipient?: string,
    token?: string
  ): Promise<boolean> {
    if (!this.privateKey || !this.publicKey) {
      throw new Error("Nostr keys not available");
    }

    try {
      // Create spend history entry
      const spendEntry = {
        mint,
        amount,
        timestamp: Date.now(),
        recipient,
        token,
      };

      // In a real app, you would encrypt and publish this to Nostr relays
      // For now, we'll just store it locally
      const existingHistory = localStorage.getItem("nostr_spend_history");
      const historyArray = existingHistory ? JSON.parse(existingHistory) : [];

      historyArray.push(spendEntry);
      localStorage.setItem("nostr_spend_history", JSON.stringify(historyArray));

      return true;
    } catch (error) {
      console.error("Failed to record spend:", error);
      return false;
    }
  }

  // Creating a NIP-60 compatible token for a specific Nostr pubkey
  async createP2PKToken(
    recipientPubkey: string,
    amount: number,
    mint: string,
    proofs: Proof[]
  ): Promise<string> {
    try {
      // In a real implementation, this would create proper P2PK tokens
      // For demo purposes, we'll just create a regular token with a memo indicating the recipient
      const memo = `For ${recipientPubkey}`;

      // Generate the token (this is simplified)
      const token = getEncodedTokenV4({
        token: [{ mint, proofs }],
        memo,
      });

      return token;
    } catch (error) {
      console.error("Failed to create P2PK token:", error);
      throw new Error("Failed to create token for recipient");
    }
  }

  // Check if this is a NIP-60/NIP-61 token meant for us
  async isTokenForUs(token: string): Promise<boolean> {
    try {
      if (!this.publicKey) return false;

      // Decode the token
      const decodedToken = getDecodedToken(token);

      // This is highly simplified
      // In a real implementation, you would check if the token is P2PK
      // and if it's locked to your public key

      // For demo purposes, we'll just check if the memo contains our pubkey
      const memo = decodedToken.memo || "";

      return memo.includes(this.publicKey);
    } catch (error) {
      console.error("Failed to check token recipient:", error);
      return false;
    }
  }
}

// Export a singleton instance
export const nostrWalletService = new NostrWalletService();
