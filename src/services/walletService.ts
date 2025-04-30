// services/walletService.ts
import {
  CashuMint,
  CashuWallet,
  Proof,
  getDecodedToken,
} from "@cashu/cashu-ts";
import { Transaction } from "../types/wallet";

// Check if code is running in browser environment
const isClient = typeof window !== "undefined";

// Default mints to use - use trusted mint servers in a production app
const DEFAULT_MINTS = [
  "https://8333.space:3338",
  "https://legend.lnbits.com/cashu/api/v1/LnbitsCompat",
];

class WalletService {
  private wallets: Map<string, CashuWallet> = new Map();
  private proofs: Proof[] = [];
  private transactions: Transaction[] = [];
  private isInitialized = false;

  constructor() {
    // Initialize when the service is created
    this.initialize();
  }

  async initialize() {
    try {
      // Load saved data from localStorage if available
      this.loadWalletState();

      // Create wallet instances for each mint
      for (const mintUrl of DEFAULT_MINTS) {
        if (!this.wallets.has(mintUrl)) {
          const mint = new CashuMint(mintUrl);
          // Initialize the wallet with the mint
          const wallet = new CashuWallet(mint);

          // The wallet will automatically fetch the mint's keys when needed
          // No need to explicitly call loadMint() as it doesn't exist

          this.wallets.set(mintUrl, wallet);
        }
      }

      this.isInitialized = true;

      // Save state after initialization
      this.saveWalletState();
    } catch (error: any) {
      console.error("Failed to initialize wallet:", error);
      throw new Error("Failed to initialize wallet");
    }
  }

  private loadWalletState() {
    try {
      // Skip localStorage operations on server-side
      if (!isClient) {
        console.log("Running on server, skipping localStorage operations");
        return;
      }

      // Load proofs from localStorage
      const savedProofs = localStorage.getItem("cashu_proofs");
      if (savedProofs) {
        this.proofs = JSON.parse(savedProofs);
      }

      // Load transactions from localStorage
      const savedTransactions = localStorage.getItem("cashu_transactions");
      if (savedTransactions) {
        this.transactions = JSON.parse(savedTransactions);
      }
    } catch (error: any) {
      console.error("Failed to load wallet state:", error);
    }
  }

  private saveWalletState() {
    try {
      // Skip localStorage operations on server-side
      if (!isClient) {
        console.log("Running on server, skipping localStorage operations");
        return;
      }

      // Save proofs to localStorage
      localStorage.setItem("cashu_proofs", JSON.stringify(this.proofs));

      // Save transactions to localStorage
      localStorage.setItem(
        "cashu_transactions",
        JSON.stringify(this.transactions)
      );
    } catch (error: any) {
      console.error("Failed to save wallet state:", error);
    }
  }

  async getBalance(): Promise<number> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this.proofs.reduce((total, proof) => total + proof.amount, 0);
  }

  async getProofs(): Promise<Proof[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return [...this.proofs];
  }

  async getTransactions(): Promise<Transaction[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return [...this.transactions];
  }

  async receiveToken(token: string): Promise<Proof[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Decode the token
      const decodedToken = getDecodedToken(token);

      if (
        !decodedToken ||
        !decodedToken.token ||
        decodedToken.token.length === 0
      ) {
        throw new Error("Invalid token");
      }

      let receivedProofs: Proof[] = [];

      // Process each token entry
      for (const entry of decodedToken.token) {
        const { mint: mintUrl, proofs } = entry;

        // Find or create wallet for this mint
        let wallet = this.wallets.get(mintUrl);

        if (!wallet) {
          // Create a new wallet for this mint
          const mint = new CashuMint(mintUrl);
          wallet = new CashuWallet(mint);
          // No explicit loadMint call needed
          this.wallets.set(mintUrl, wallet);
        }

        // Receive proofs
        const newProofs = await wallet.receive(token);

        // Add the received proofs to our collection
        receivedProofs = [...receivedProofs, ...newProofs];
        this.proofs = [...this.proofs, ...newProofs];

        // Record the transaction
        const amount = newProofs.reduce((sum, proof) => sum + proof.amount, 0);
        this.addTransaction({
          id: `receive_${Date.now()}`,
          type: "receive",
          amount,
          timestamp: Date.now(),
          token,
          status: "complete",
        });
      }

      // Save the updated state
      this.saveWalletState();

      return receivedProofs;
    } catch (error: any) {
      console.error("Failed to receive token:", error);
      throw new Error(`Failed to receive token: ${error.message}`);
    }
  }

  async sendToken(amount: number, memo?: string): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const balance = await this.getBalance();
    if (balance < amount) {
      throw new Error("Insufficient balance");
    }

    try {
      // For simplicity, we'll use the first wallet to send the token
      const mintUrl = DEFAULT_MINTS[0];
      const wallet = this.wallets.get(mintUrl);

      if (!wallet) {
        throw new Error("Wallet not available");
      }

      // Select proofs to send
      const { send: proofsToSend, returnChange: proofsToKeep } =
        await wallet.send(amount, this.proofs);

      // Update the stored proofs
      this.proofs = proofsToKeep;

      // Create a custom token format without using getEncodedTokenV4
      // Using our own implementation of base64url encoding
      const tokenData = {
        token: [{ mint: mintUrl, proofs: proofsToSend }],
        memo,
      };

      // Serialize to JSON string
      const jsonString = JSON.stringify(tokenData);

      // Convert to base64 and then to base64url format manually
      const base64 = Buffer.from(jsonString).toString("base64");
      const base64url = base64
        .replace(/\+/g, "-") // Replace + with -
        .replace(/\//g, "_") // Replace / with _
        .replace(/=+$/, ""); // Remove padding characters

      // Prepend the cashu token prefix
      const token = "cashuB" + base64url;

      // Record the transaction
      this.addTransaction({
        id: `send_${Date.now()}`,
        type: "send",
        amount,
        timestamp: Date.now(),
        memo,
        token,
        status: "complete",
      });

      // Save the updated state
      this.saveWalletState();

      return token;
    } catch (error: any) {
      console.error("Failed to send token:", error);
      throw new Error(`Failed to send token: ${error.message}`);
    }
  }

  async zapTrack(trackId: string, amount: number): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const balance = await this.getBalance();
    if (balance < amount) {
      throw new Error("Insufficient balance");
    }

    try {
      // Step 1: Get the LNURL data from the track's payRequest endpoint
      const lnurlEndpoint = `https://wavlake.com/api/lnurl/track/${trackId}`;

      const lnurlResponse = await fetch(lnurlEndpoint);
      if (!lnurlResponse.ok) {
        throw new Error(
          `Failed to fetch LNURL data: ${lnurlResponse.statusText}`
        );
      }

      const payRequestData = await lnurlResponse.json();

      // Validate the response has required fields according to LUD-06
      if (
        payRequestData.tag !== "payRequest" ||
        !payRequestData.callback ||
        !payRequestData.metadata
      ) {
        throw new Error("Invalid LNURL payRequest response");
      }

      // Ensure the amount is within the allowed limits
      const minSendable = payRequestData.minSendable || 1000; // Default to 1 sat (1000 msats)
      const maxSendable = payRequestData.maxSendable || 100000000000; // Default to 1000 sats

      // Convert amount from sats to msats for LNURL
      const amountMsats = amount * 1000;

      if (amountMsats < minSendable) {
        throw new Error(
          `Amount too small. Minimum is ${minSendable / 1000} sats`
        );
      }

      if (amountMsats > maxSendable) {
        throw new Error(
          `Amount too large. Maximum is ${maxSendable / 1000} sats`
        );
      }

      // Step 2: Get the lightning invoice by calling the callback URL
      const separator = payRequestData.callback.includes("?") ? "&" : "?";
      const callbackUrl = `${payRequestData.callback}${separator}amount=${amountMsats}`;

      const invoiceResponse = await fetch(callbackUrl);
      if (!invoiceResponse.ok) {
        throw new Error(`Failed to get invoice: ${invoiceResponse.statusText}`);
      }

      const invoiceData = await invoiceResponse.json();

      if (!invoiceData.pr) {
        throw new Error("No invoice received from the server");
      }

      // Verify metadata hash against invoice description_hash if needed
      // (This would require a lightning invoice decoder, which is out of scope for this implementation)

      const bolt11Invoice = invoiceData.pr;

      // Step 3: Use the mint to pay the invoice via NUT-05 melt process
      // Get the first mint
      const mintUrl = this.wallets.keys().next().value;
      if (!mintUrl) {
        throw new Error("No mints available");
      }

      const wallet = this.wallets.get(mintUrl);
      if (!wallet) {
        throw new Error("Wallet not available");
      }

      // Step 3a: Request a melt quote from the mint
      const meltQuoteUrl = `${mintUrl}/v1/melt/quote/bolt11`;
      const quoteResponse = await fetch(meltQuoteUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request: bolt11Invoice,
          unit: "sat",
        }),
      });

      if (!quoteResponse.ok) {
        throw new Error(
          `Failed to get melt quote: ${quoteResponse.statusText}`
        );
      }

      const quoteData = await quoteResponse.json();

      // Calculate total amount needed (amount + fees + reserve)
      const totalAmountNeeded = quoteData.amount + (quoteData.fee_reserve || 0);

      if (totalAmountNeeded > balance) {
        throw new Error(
          `Insufficient balance with fees. Need ${totalAmountNeeded} sats`
        );
      }

      // Select proofs to spend
      const { send: proofsToSend, returnChange: proofsToKeep } =
        await wallet.send(totalAmountNeeded, this.proofs);

      // Step 3b: Melt the tokens to pay the invoice
      const meltUrl = `${mintUrl}/v1/melt/bolt11`;
      const meltResponse = await fetch(meltUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quote: quoteData.quote,
          inputs: proofsToSend,
        }),
      });

      if (!meltResponse.ok) {
        throw new Error(`Failed to melt tokens: ${meltResponse.statusText}`);
      }

      const meltResult = await meltResponse.json();

      // Check if the payment was successful
      if (meltResult.state !== "PAID") {
        throw new Error(`Payment failed: ${meltResult.state}`);
      }

      // Update the stored proofs (remove spent ones)
      this.proofs = proofsToKeep;

      // Record the transaction
      this.addTransaction({
        id: `zap_${Date.now()}`,
        type: "melt", // Using melt as the type since we're melting tokens
        amount,
        timestamp: Date.now(),
        memo: `Zap for track ${trackId}`,
        recipient: trackId,
        status: "complete",
      });

      // Save the updated state
      this.saveWalletState();

      return meltResult.payment_preimage || "success";
    } catch (error: any) {
      console.error("Failed to zap track:", error);
      throw new Error(`Failed to zap track: ${error.message}`);
    }
  }

  private addTransaction(transaction: Transaction) {
    this.transactions.push(transaction);
    this.transactions.sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp descending
  }

  // For debugging purposes
  async reset() {
    this.proofs = [];
    this.transactions = [];

    if (isClient) {
      localStorage.removeItem("cashu_proofs");
      localStorage.removeItem("cashu_transactions");
    }

    this.saveWalletState();
  }
}

// Export a singleton instance
export const walletService = new WalletService();
