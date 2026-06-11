document.addEventListener("DOMContentLoaded", function () {
  var amountEl = document.getElementById("amount");
  var currencyEl = document.getElementById("currency");
  var convertBtn = document.getElementById("convert");
  var resultEl = document.getElementById("result");

  convertBtn.addEventListener("click", function () {
    // disable button while fetching to prevent duplicate requests
    convertBtn.disabled = true;

    var amount = parseFloat((amountEl.value || "").trim());
    var from = currencyEl.value;

    if (isNaN(amount) || amount <= 0) {
      resultEl.textContent = "Please enter a valid amount.";
      return;
    }

    resultEl.textContent = "Converting...";

    // Use API Ninjas exchangerate endpoint (requires API key)
    // api_key.js defines `API_KEY` variable loaded before this script.
    if (typeof API_KEY === "undefined" || !API_KEY) {
      resultEl.textContent = "API key not found. Please add your API key.";
      return;
    }

    var pair = encodeURIComponent(from + "_USD");
    var url = "https://api.api-ninjas.com/v1/exchangerate?pair=" + pair;

    fetch(url, {
      headers: {
        "X-Api-Key": API_KEY,
      },
    })
      .then(function (res) {
        if (!res.ok) {
          return res.text().then(function (text) {
            throw new Error(
              "HTTP " + res.status + " " + res.statusText + " - " + text,
            );
          });
        }
        return res.json();
      })
      .then(function (data) {
        // API Ninjas returns { pair: 'EUR_USD', rate: 1.089 }
        if (!data || typeof data.rate !== "number") {
          throw new Error("Unexpected API response");
        }
        var rate = data.rate;
        resultEl.textContent =
          amount + " " + from + " = " + (amount * rate).toFixed(2) + " USD";
      })
      .catch(function (err) {
        console.error("Error fetching exchange rate:", err);
        var msg = err && err.message ? err.message : String(err);
        var stack = err && err.stack ? "\n" + err.stack : "";
        resultEl.innerText = "Error fetching exchange rate: " + msg + stack;
      })
      .then(function () {
        // re-enable the button after the request completes (success or error)
        convertBtn.disabled = false;
      });
  });
});
