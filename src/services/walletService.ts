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
  "https://mint.minibits.cash/Bitcoin",
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

      console.log(`Fetching LNURL data from: ${lnurlEndpoint}`);
      const lnurlResponse = await fetch(lnurlEndpoint);
      if (!lnurlResponse.ok) {
        throw new Error(
          `Failed to fetch LNURL data: ${lnurlResponse.statusText}`
        );
      }

      const payRequestData = await lnurlResponse.json();
      console.log(`LNURL response:`, payRequestData);

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

      console.log(`Requesting invoice from: ${callbackUrl}`);
      const invoiceResponse = await fetch(callbackUrl);
      if (!invoiceResponse.ok) {
        throw new Error(`Failed to get invoice: ${invoiceResponse.statusText}`);
      }

      const invoiceData = await invoiceResponse.json();
      console.log(`Invoice response:`, invoiceData);

      if (!invoiceData.pr) {
        throw new Error("No invoice received from the server");
      }

      const bolt11Invoice = invoiceData.pr;

      // Step 3: Check existing proofs to determine which mint they belong to
      // We need to add a way to know which mint each proof belongs to

      // For now, we're going to check each mint we have in the wallet
      // This is a workaround - in the future, store the mint URL with each proof

      // Try all available mints to find which one can spend our proofs
      for (const [mintUrl, wallet] of this.wallets.entries()) {
        console.log(`Trying mint: ${mintUrl}`);

        try {
          // Step 3a: Get mint keys to verify if this is the right mint
          console.log(`Fetching keys from mint: ${mintUrl}`);
          const keysResponse = await fetch(`${mintUrl}/v1/keys`);
          if (!keysResponse.ok) {
            console.log(
              `Failed to get keys from ${mintUrl}, trying next mint...`
            );
            continue;
          }

          const keysData = await keysResponse.json();
          console.log(
            `Mint keysets:`,
            keysData.keysets?.map((k: any) => k.id) || []
          );

          if (!keysData.keysets || keysData.keysets.length === 0) {
            console.log(
              `No keysets available from mint ${mintUrl}, trying next mint...`
            );
            continue;
          }

          // Try to validate our proofs against this mint's keysets
          // Check if any of our proofs have IDs that match any of this mint's keysets
          const matchingKeysets = keysData.keysets.filter((keyset: any) =>
            this.proofs.some((proof) => proof.id === keyset.id)
          );

          if (matchingKeysets.length === 0) {
            console.log(
              `No matching keysets found for mint ${mintUrl}, trying next mint...`
            );

            // Extra check - see if this might be the minibits mint
            if (mintUrl.includes("minibits")) {
              console.log(
                "This appears to be the minibits mint, checking proofs..."
              );
              console.log(
                "Sample proof IDs:",
                this.proofs.slice(0, 3).map((p) => p.id)
              );

              // For minibits, try the first available keyset anyway
              const activeKeysetId = keysData.keysets[0].id;
              console.log(
                `Using keyset ID ${activeKeysetId} for minibits mint`
              );
            } else {
              continue;
            }
          }

          // Use the first matching keyset, or the first available one if using minibits
          const activeKeysetId =
            matchingKeysets.length > 0
              ? matchingKeysets[0].id
              : keysData.keysets[0].id;

          console.log(`Using keyset ID ${activeKeysetId} for mint ${mintUrl}`);

          // Step 3b: Request a melt quote from the mint
          console.log(
            `Requesting melt quote from: ${mintUrl}/v1/melt/quote/bolt11`
          );
          const quoteResponse = await fetch(`${mintUrl}/v1/melt/quote/bolt11`, {
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
            console.log(
              `Failed to get melt quote from ${mintUrl}, trying next mint...`
            );
            continue;
          }

          const quoteData = await quoteResponse.json();
          console.log(`Melt quote response:`, quoteData);

          // Calculate total amount needed (amount + fee_reserve)
          const totalAmountNeeded =
            quoteData.amount + (quoteData.fee_reserve || 0);
          console.log(`Total amount needed: ${totalAmountNeeded} sats`);

          if (totalAmountNeeded > balance) {
            throw new Error(
              `Insufficient balance with fees. Need ${totalAmountNeeded} sats`
            );
          }

          // Step 3c: Prepare proofs for melting
          // For minibits mint specifically, we need to modify the proof ID
          // For other mints, we'll use the proofs as-is if they have matching IDs

          let proofsToSpend: Proof[] = [];
          let remainingAmount = totalAmountNeeded;
          let remainingProofs = [...this.proofs];

          // Sort proofs by amount (largest first) to minimize the number of proofs used
          remainingProofs.sort((a, b) => b.amount - a.amount);

          console.log(
            `Original proof IDs: ${remainingProofs
              .slice(0, 3)
              .map((p) => p.id)
              .join(", ")}`
          );

          // Determine if we need to update proof IDs (for minibits mint)
          const needToUpdateProofIds =
            mintUrl.includes("minibits") ||
            !matchingKeysets.length ||
            !this.proofs.some((p) =>
              keysData.keysets.some((k: any) => k.id === p.id)
            );

          // Collect proofs to spend, updating keyset ID if necessary
          while (remainingAmount > 0 && remainingProofs.length > 0) {
            const proof = remainingProofs.shift()!;

            // Create a proof, potentially with updated ID
            const proofToSpend = needToUpdateProofIds
              ? { ...proof, id: activeKeysetId } // Update ID for minibits mint
              : { ...proof }; // Use as-is for other mints

            proofsToSpend.push(proofToSpend);
            remainingAmount -= proof.amount;
          }

          if (remainingAmount > 0) {
            throw new Error(`Not enough proofs to cover the amount needed`);
          }

          console.log(
            `Selected ${proofsToSpend.length} proofs to spend with mint ${mintUrl}`
          );
          console.log(`Using keyset ID: ${proofsToSpend[0]?.id || "none"}`);
          console.log(
            `Proofs to spend:`,
            JSON.stringify(proofsToSpend.slice(0, 2))
          );

          // Step 3d: Melt the tokens to pay the invoice
          console.log(`Melting tokens at: ${mintUrl}/v1/melt/bolt11`);
          console.log(
            `Melt request payload:`,
            JSON.stringify(
              {
                quote: quoteData.quote,
                inputs: proofsToSpend,
              },
              null,
              2
            )
          );

          const meltResponse = await fetch(`${mintUrl}/v1/melt/bolt11`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              quote: quoteData.quote,
              inputs: proofsToSpend,
            }),
          });

          if (!meltResponse.ok) {
            const errorText = await meltResponse.text();
            console.error(`Melt response error from ${mintUrl}:`, errorText);
            continue; // Try the next mint if this one fails
          }

          const meltResult = await meltResponse.json();
          console.log(`Melt result:`, meltResult);

          // Check if the payment was successful
          if (meltResult.state !== "PAID") {
            console.log(
              `Payment failed with mint ${mintUrl}: ${meltResult.state}, trying next mint...`
            );
            continue;
          }

          // If we got here, payment was successful!
          console.log(`Successfully melted tokens with mint ${mintUrl}`);

          // Update stored proofs - remove the spent ones
          this.proofs = this.proofs.filter(
            (proof) =>
              !proofsToSpend.some(
                (spent) =>
                  spent.secret === proof.secret && spent.amount === proof.amount
              )
          );

          // Handle any change from melt operation
          if (meltResult.change && meltResult.change.length > 0) {
            this.proofs = [...this.proofs, ...meltResult.change];
          }

          // Record the transaction
          this.addTransaction({
            id: `zap_${Date.now()}`,
            type: "melt", // Using melt as the type since we're melting tokens
            amount: totalAmountNeeded,
            timestamp: Date.now(),
            memo: `Zap for track ${trackId}`,
            recipient: trackId,
            status: "complete",
          });

          // Save the updated state
          this.saveWalletState();

          return meltResult.payment_preimage || "success";
        } catch (error: any) {
          console.error(`Error with mint ${mintUrl}:`, error.message);
          // Continue to try the next mint
        }
      }

      // If we got here, none of the mints worked
      throw new Error(
        "Failed to melt tokens with any available mint. Your tokens may be from a different mint than those configured in the wallet."
      );
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
