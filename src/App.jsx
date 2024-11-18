```jsx
import { createSignal, onMount, Show, For } from "solid-js";
import axios from "axios";
import * as Sentry from "@sentry/browser";

function App() {
  const [currencies, setCurrencies] = createSignal([]);
  const [exchangeRates, setExchangeRates] = createSignal({});
  const [selectedCurrency, setSelectedCurrency] = createSignal("");
  const [walletAddress, setWalletAddress] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [message, setMessage] = createSignal("");
  const [messageType, setMessageType] = createSignal("success"); // 'success' or 'error'
  const [formErrors, setFormErrors] = createSignal({});

  const currencyMap = {
    btc: { id: "bitcoin", name: "Bitcoin" },
    ltc: { id: "litecoin", name: "Litecoin" },
    doge: { id: "dogecoin", name: "Dogecoin" },
    eth: { id: "ethereum", name: "Ethereum" },
    dash: { id: "dash", name: "Dash" },
    bch: { id: "bitcoin-cash", name: "Bitcoin Cash" },
    dgb: { id: "digibyte", name: "DigiByte" },
    trx: { id: "tron", name: "TRON" },
    usdt: { id: "tether", name: "Tether" },
    zec: { id: "zcash", name: "Zcash" },
  };

  onMount(async () => {
    // Fetch the list of supported currencies from the backend
    try {
      const response = await fetch("/api/getCurrencies");
      const data = await response.json();
      setCurrencies(data);
      fetchExchangeRates(data);
    } catch (error) {
      Sentry.captureException(error);
      console.error("Error fetching currencies:", error);
    }
  });

  const fetchExchangeRates = async (currencyCodes) => {
    try {
      const coinIds = currencyCodes.map((code) => currencyMap[code].id).join(",");
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`
      );
      setExchangeRates(response.data);
    } catch (error) {
      Sentry.captureException(error);
      console.error("Error fetching exchange rates:", error);
    }
  };

  const validateForm = () => {
    let errors = {};
    if (!selectedCurrency()) {
      errors.currency = "الرجاء اختيار العملة.";
    }
    if (!walletAddress()) {
      errors.address = "الرجاء إدخال عنوان محفظتك.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const requestPayout = async () => {
    if (!validateForm()) {
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
        setMessageType("success");
        setMessage(`تم بنجاح! تم إرسال ${data.amount} ${selectedCurrency().toUpperCase()} إلى محفظتك.`);
        setWalletAddress("");
        setSelectedCurrency("");
      } else {
        setMessageType("error");
        setMessage(`خطأ: ${data.error}`);
      }
    } catch (error) {
      Sentry.captureException(error);
      console.error("Error requesting payout:", error);
      setMessageType("error");
      setMessage("حدث خطأ أثناء معالجة طلبك.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4" dir="rtl">
      <div class="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 class="text-3xl font-bold text-purple-600 mb-6 text-center">صنبور FaucetPay</h1>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">اختر العملة</label>
          <select
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border cursor-pointer"
            value={selectedCurrency()}
            onInput={(e) => setSelectedCurrency(e.target.value)}
          >
            <option value="">-- اختر العملة --</option>
            <For each={currencies()}>
              {(currency) => (
                <option value={currency}>
                  {currency.toUpperCase()} - {currencyMap[currency].name}
                </option>
              )}
            </For>
          </select>
          <Show when={formErrors().currency}>
            <p class="text-red-500 text-sm mt-1">{formErrors().currency}</p>
          </Show>
        </div>
        <Show when={selectedCurrency()}>
          <div class="mb-4">
            <p class="text-gray-700">
              سعر الصرف الحالي:{" "}
              <span class="font-semibold">
                {exchangeRates()[currencyMap[selectedCurrency()].id]?.usd} USD
              </span>
            </p>
          </div>
        </Show>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">عنوان محفظتك</label>
          <input
            type="text"
            placeholder="أدخل عنوان محفظتك"
            class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent box-border"
            value={walletAddress()}
            onInput={(e) => setWalletAddress(e.target.value)}
          />
          <Show when={formErrors().address}>
            <p class="text-red-500 text-sm mt-1">{formErrors().address}</p>
          </Show>
        </div>
        <button
          class={`w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
            loading() ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={requestPayout}
          disabled={loading()}
        >
          {loading() ? "جاري المعالجة..." : "طلب الدفع"}
        </button>
        <Show when={message()}>
          <div
            class={`mt-4 p-3 text-center text-white rounded-lg ${
              messageType() === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {message()}
          </div>
        </Show>
      </div>
    </div>
  );
}

export default App;
```