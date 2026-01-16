// Wait for DOM to fully load before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    // DOM element references for easy access
    const fromSelect = document.getElementById('fromCurrency');
    const toSelect = document.getElementById('toCurrency');
    const amountInput = document.getElementById('amount');
    const convertBtn = document.getElementById('convertBtn');
    const swapBtn = document.getElementById('swap');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const convertedAmount = document.getElementById('convertedAmount');
    const targetCurrencyRate = document.getElementById('targetCurrency');
    const baseCurrencyEl = document.getElementById('baseCurrency');
    const exchangeRateEl = document.getElementById('exchangeRate');
    const targetCurrencyRateEl = document.getElementById('targetCurrencyRate');
    const updateTimeEl = document.getElementById('updateTime');

    // Load currency codes from code.js and populate dropdowns
    function populateCurrencies() {
        // Clear existing options
        fromSelect.innerHTML = '';
        toSelect.innerHTML = '';

        // Create default option
        const defaultOption = new Option('Select Currency', '');
        fromSelect.appendChild(defaultOption.cloneNode(true));
        toSelect.appendChild(defaultOption.cloneNode(true));

        // Loop through currencies object and create option elements
        Object.entries(currencies).forEach(([code, name]) => {
            const option1 = new Option(`${code} - ${name}`, code);
            const option2 = new Option(`${code} - ${name}`, code);
            fromSelect.appendChild(option1);
            toSelect.appendChild(option2);
        });

        // Set default values: USD to INR
        fromSelect.value = 'USD';
        toSelect.value = 'INR';
    }
    // Show placeholder initially
document.getElementById('placeholder').classList.remove('hidden');


    // Swap currencies in dropdowns
    swapBtn.addEventListener('click', function() {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
    });

    // Fetch exchange rates from free API endpoint
    async function fetchRates(baseCurrency) {
        try {
            // Hide previous results and show loading
            resultDiv.classList.add('hidden');
            errorDiv.classList.add('hidden');
            loadingDiv.classList.remove('hidden');

            // API endpoint: open.er-api.com provides latest rates relative to base currency
            const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            // Check API response status
            if (data.result !== 'success') {
                throw new Error(data.error_type || 'API unavailable');
            }

            return data;
        } catch (error) {
            // Handle network or API errors
            throw error;
        } finally {
            // Always hide loading
            loadingDiv.classList.add('hidden');
        }
    }

    // Calculate and display conversion result
function displayResult(data, amount, targetCurrency) {
    // Hide placeholder when results show
    document.getElementById('placeholder').classList.add('hidden');
    
    // Get exchange rate
    const rate = data.rates[targetCurrency];
    if (!rate) {
        throw new Error('Target currency not supported');
    }

    const converted = amount * rate;

    // Update elements
    convertedAmount.textContent = converted.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    targetCurrencyRate.textContent = targetCurrency;
    baseCurrencyEl.textContent = data.base_code;
    exchangeRateEl.textContent = rate.toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4});
    targetCurrencyRateEl.textContent = targetCurrency;

    const updateTime = new Date(data.time_last_update_utc).toLocaleString();
    updateTimeEl.textContent = `Updated: ${updateTime} (Next: ${data.time_next_update_utc})`;

    resultDiv.classList.remove('hidden');
}


    // Show error message
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }

    
    async function convertCurrency() {
        // Validate inputs
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromSelect.value;
        const toCurrency = toSelect.value;

        if (!amount || amount <= 0) {
            showError('Please enter a valid amount greater than 0');
            return;
        }

        if (!fromCurrency || !toCurrency) {
            showError('Please select both currencies');
            return;
        }

        if (fromCurrency === toCurrency) {
            showError('Please select different currencies');
            return;
        }

        try {
            // Fetch rates using FROM currency as base
            const data = await fetchRates(fromCurrency);
            // Display calculated result
            displayResult(data, amount, toCurrency);
        } catch (error) {
            showError(`Error: ${error.message}. Please try again later. Rate limited? Wait 20min.`);
        }
    }

    convertBtn.addEventListener('click', convertCurrency);

    // Enter key support on amount input
    amountInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertCurrency();
        }
    });

    // From here the code starts
    populateCurrencies();
});



// SUMMARY OF THE CODE 

/*       START
          |
          v
  Page Loads Completely
 (DOMContentLoaded)
          |
          v
  Get HTML Elements
 (buttons, inputs,
  dropdowns)
          |
          v
  Populate Currency
     Dropdowns
          |
          v
  Show Placeholder
 ("Enter amount")
          |
          v
   User Enters Amount
   & Selects Currencies
          |
          v
   Click Convert Button
        OR
      Press Enter
          |
          v
    Validate Inputs
  (amount > 0,
   currencies selected,
   not same)
          |
        Invalid? 
   ┌──────┴──────┐
   |             |
   |YES          |
   v             v
 Show Error     Fetch Exchange
 Message        Rate from API
                  |
                  v
            API Response OK?
                  |
          ┌───────┴────────┐
          | NO             |
          v                 v
     Show Error        Calculate Amount
                      (amount × rate)
                              |
                              v
                       Display Result
                     (converted value,
                      rate, update time)
                              |
                              v
                             END                            */
