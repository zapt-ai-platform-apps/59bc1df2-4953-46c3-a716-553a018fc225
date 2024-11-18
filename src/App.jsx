import { createSignal, onMount, Show } from "solid-js";

function App() {
  const [currencies, setCurrencies] = createSignal([]);
  const [selectedCurrency, setSelectedCurrency] = createSignal("");
  const [walletAddress, setWalletAddress] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [message, setMessage] = createSignal("");

  onMount(async () => {
    // Fetch the list of supported currencies from the backend
    try {
      const response = await fetch("/api/getCurrencies");
      const data = await response.json();
      setCurrencies(data);
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  });

  const requestPayout = async () => {
    if (!selectedCurrency() || !walletAddress()) {
      setMessage("Please select a currency and enter your wallet address.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/sendPayment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currency: selectedCurrency(),
          address: walletAddress()
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`Success! ${data.amount} ${selectedCurrency()} sent to your wallet.`);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error requesting payout:", error);
      setMessage("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 class="text-3xl font-bold text-purple-600 mb-6 text-center">FaucetPay Faucet</h1>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Select Currency</label>
          <select
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            value={selectedCurrency()}
            onInput={(e) => setSelectedCurrency(e.target.value)}
          >
            <option value="">-- Select Currency --</option>
            <For each={currencies()}>
              {(currency) => (
                <option value={currency}>{currency.toUpperCase()}</option>
              )}
            </For>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Your Wallet Address</label>
          <input
            type="text"
            placeholder="Enter your wallet address"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            value={walletAddress()}
            onInput={(e) => setWalletAddress(e.target.value)}
          />
        </div>
        <button
          class={`w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
            loading() ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={requestPayout}
          disabled={loading()}
        >
          {loading() ? "Processing..." : "Request Payout"}
        </button>
        <Show when={message()}>
          <div class="mt-4 text-center text-gray-700">{message()}</div>
        </Show>
      </div>
    </div>
  );
}

export default App;