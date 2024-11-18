# New App

## Overview

New App is a cryptocurrency faucet that allows users to receive small amounts of various cryptocurrencies supported by FaucetPay. Users can select a currency, enter their wallet address, and request a payout directly to their FaucetPay wallet.

## User Journeys

### 1. Requesting a Payout

1. **Landing Page**

   - The user navigates to the app and sees a simple form with options to select a cryptocurrency and enter their wallet address.

2. **Selecting Currency**

   - The user clicks on the "Select Currency" dropdown.
   - A list of all supported currencies is displayed.
   - The user selects their desired currency (e.g., BTC, ETH, DOGE).

3. **Entering Wallet Address**

   - The user enters their FaucetPay wallet address associated with the selected currency into the "Your Wallet Address" input field.

4. **Request Payout**

   - The user clicks the "Request Payout" button.
   - The app displays a loading state indicating the request is being processed.

5. **Receiving Confirmation**

   - Upon successful transaction, the user receives a confirmation message displaying the amount sent and the currency.
   - If there's an error (e.g., invalid address, insufficient funds), an error message is displayed.

6. **Repeat Requests**

   - The user can repeat the process to request payouts in different currencies or the same currency after any cooldown periods enforced by the faucet.

## External API Services

- **FaucetPay API**

  - **Purpose**: To send cryptocurrency payments to users' FaucetPay wallets.
  - **Usage**: The backend serverless function `sendPayment.js` communicates with FaucetPay's API to process payout requests securely.
  - **Documentation**: [FaucetPay API Documentation](https://faucetpay.io/page/api-documentation)

## Required Environment Variables

Create a `.env` file in the root directory and include the following variables:

- **VITE_PUBLIC_SENTRY_DSN**: Your Sentry Data Source Name for frontend error logging.
- **VITE_PUBLIC_SENTRY_DSN**: Your Sentry Data Source Name for backend error logging.
- **VITE_PUBLIC_APP_ENV**: The environment (e.g., `development`, `production`).
- **VITE_PUBLIC_APP_ID**: The application ID.
- **PROJECT_ID**: The project ID.
- **FAUCETPAY_API_KEY**: Your FaucetPay API key (keep this secret).
- **PAYOUT_AMOUNT**: The amount to be sent to users (in the smallest unit of the currency, e.g., satoshis for BTC).

## Notes

- Ensure that the `FAUCETPAY_API_KEY` and `PAYOUT_AMOUNT` are set correctly in the environment variables.
- This app does not require user authentication; users can request payouts without signing in.
- All sensitive API calls are handled on the backend to keep API keys secure.
- Sentry is integrated for error logging on both frontend and backend.
