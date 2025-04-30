# Wavlake Music Player with Cashu Wallet

A Next.js web application that integrates Wavlake API for music playback with Cashu ecash payments and NIP-60/61 Nostr support.

## Features

### Music Player

- Modern music player with clean UI
- Music discovery via Wavlake API
- Search functionality to find tracks
- Basic controls (play, pause, skip, etc.)
- Track listing with artwork and metadata

### Cashu Wallet

- Built-in ecash wallet using the Cashu protocol
- Send and receive Cashu tokens
- Transaction history tracking
- Zap/tip your favorite tracks
- Reset/debug functionality

### Nostr Integration

- NIP-60 wallet integration for cross-app compatibility
- Nostr public key management
- Ability to send tokens to Nostr users (NIP-61)
- Support for restoring wallet state from Nostr relays

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Music API**: Wavlake API
- **Wallet**: Cashu-ts library
- **Nostr**: Nostr-tools library

## Installation

1. Clone the repository:

```bash
git clone https://github.com/wavlake/poc-ecash.git
cd poc-ecash
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Music Player

- Browse and play music from the Wavlake catalog
- Search for tracks using the search bar
- Use the player controls to play/pause, skip tracks, and adjust volume
- Click on tracks in the list to select and play them

### Wallet

1. Click the Wallet button in the header to access your wallet
2. Use the tabs to navigate between wallet functions:
   - **Balance**: View your current balance and summary
   - **Send**: Create a token to send to someone else
   - **Receive**: Redeem a token you've received
   - **History**: View your transaction history
   - **Nostr**: Configure Nostr integration

### Zapping Tracks

1. Play a track you enjoy
2. Click the lightning bolt (⚡) icon next to the track title
3. Enter the amount of sats you wish to zap
4. Click "Zap" to send the payment

## Deployment

This app is configured for easy deployment to Vercel:

1. Push your code to a GitHub repository
2. In Vercel, create a new project and select your repository
3. Vercel will automatically detect the Next.js project and deploy it

## Future Enhancements

- **PWA Support**: Enable offline access and mobile-app-like experience
- **User Login**: Add Nostr NIP-07 extension support
- **Additional Mints**: Support for more Cashu mints
- **Lightning Integration**: Direct Lightning Network deposits/withdrawals
- **Enhanced Nostr Integration**: Full NIP-60/61 compliance

## Development

### Project Structure

```
wavlake-player/
├── src/
│   ├── app/ - Next.js app components
│   ├── components/ - React components
│   ├── contexts/ - React contexts
│   ├── hooks/ - Custom React hooks
│   ├── services/ - Service classes
│   └── types/ - TypeScript type definitions
├── public/ - Static assets
└── (configuration files)
```

### Key Components

- `MusicPlayer.tsx`: Main music player component
- `TrackList.tsx`: List of tracks
- `WalletButton.tsx`: Wallet button in the header
- `WalletContext.tsx`: Wallet state management
- `walletService.ts`: Cashu operations
- `nostrWalletService.ts`: Nostr integration
- `ZapButton.tsx`: Zapping functionality

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## License

MIT

## Acknowledgements

- [Wavlake](https://wavlake.com) for the music API
- [Cashu](https://cashu.space) for the ecash protocol
- [cashu-ts](https://github.com/cashubtc/cashu-ts) library
- [Nostr](https://nostr.com) protocol
- [nostr-tools](https://github.com/fiatjaf/nostr-tools) library
