/* app.js */

// State Management
let currentCurrency = 'USD';
const defaultRates = {
    USD: 36.00,
    EUR: 40.00
};
const exchangeRates = {
    USD: 36.00,
    EUR: 40.00
};
const multipliers = [4.0, 3.0, 2.0, 1.5];
const tierRanges = [
    "ราคา 1 - 500 USD / Euro",
    "ราคา 501 - 1,000 USD / Euro",
    "ราคา 1,001 - 1,500 USD / Euro",
    "ราคา 1,501 USD / Euro ขึ้นไป"
];

// Initialize on Load
window.addEventListener('DOMContentLoaded', () => {
    // Set Current Date in Buddhist Calendar style or Thai format
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Set Default Rate Value in input
    const rateInput = document.getElementById('input-rate');
    if (rateInput) {
        rateInput.value = exchangeRates[currentCurrency];
    }

    // Run initial calculation
    calculate();

    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

// Switch Currency
function switchCurrency(currency) {
    if (currentCurrency === currency) return;
    currentCurrency = currency;

    // Update Tab Buttons UI
    const usdTab = document.getElementById('tab-usd');
    const eurTab = document.getElementById('tab-eur');
    
    if (currency === 'USD') {
        usdTab.classList.add('active');
        eurTab.classList.remove('active');
    } else {
        eurTab.classList.add('active');
        usdTab.classList.remove('active');
    }

    // Update Input Labels and Badges
    const currencyBadge = document.getElementById('currency-badge');
    const currencyIcon = document.getElementById('currency-icon');
    
    if (currencyBadge) currencyBadge.textContent = currency;
    if (currencyIcon) {
        currencyIcon.innerHTML = currency === 'USD' 
            ? '<i data-lucide="dollar-sign"></i>' 
            : '<i data-lucide="euro"></i>';
    }

    // Update Exchange Rate Input with current rate
    const rateInput = document.getElementById('input-rate');
    if (rateInput) {
        rateInput.value = exchangeRates[currency];
    }

    // Recalculate
    calculate();

    // Recreate Lucide Icons inside updated containers
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Apply preset prices
function applyPreset(amount) {
    const priceInput = document.getElementById('input-price');
    if (priceInput) {
        priceInput.value = amount;
        calculate();
    }
}

// Reset exchange rate to defaults from Excel sheet
function resetExchangeRate() {
    exchangeRates[currentCurrency] = defaultRates[currentCurrency];
    const rateInput = document.getElementById('input-rate');
    if (rateInput) {
        rateInput.value = defaultRates[currentCurrency];
    }
    calculate();
    showToast(`รีเซ็ตอัตราแลกเปลี่ยนเป็นค่าเริ่มต้น (${defaultRates[currentCurrency]} THB)`);
}

// Reset the full input form to its default state
function resetCalculator() {
    currentCurrency = 'USD';
    exchangeRates.USD = defaultRates.USD;
    exchangeRates.EUR = defaultRates.EUR;

    const priceInput = document.getElementById('input-price');
    const rateInput = document.getElementById('input-rate');
    const usdTab = document.getElementById('tab-usd');
    const eurTab = document.getElementById('tab-eur');
    const currencyBadge = document.getElementById('currency-badge');
    const currencyIcon = document.getElementById('currency-icon');

    if (priceInput) priceInput.value = '';
    if (rateInput) rateInput.value = defaultRates.USD;
    if (usdTab) usdTab.classList.add('active');
    if (eurTab) eurTab.classList.remove('active');
    if (currencyBadge) currencyBadge.textContent = 'USD';
    if (currencyIcon) currencyIcon.innerHTML = '<i data-lucide="dollar-sign"></i>';

    calculate();

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    showToast('รีเซ็ตค่าที่ป้อนเรียบร้อยแล้ว');
}

// Format numbers to Thai Currency style
function formatCurrency(val) {
    return new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(val);
}

// Main Calculator Engine
function calculate() {
    const priceInput = document.getElementById('input-price');
    const rateInput = document.getElementById('input-rate');
    const costThbEl = document.getElementById('cost-thb');

    if (!priceInput || !rateInput) return;

    let price = parseFloat(priceInput.value);
    if (isNaN(price) || price < 0) {
        price = 0;
    }

    let rate = parseFloat(rateInput.value);
    if (isNaN(rate) || rate < 0) {
        rate = 0;
    }

    // Save active exchange rate
    exchangeRates[currentCurrency] = rate;

    // 1. Calculate Cost (ต้นทุน)
    const cost = price * rate;
    costThbEl.textContent = `${formatCurrency(cost)} ฿`;

    // Determine which tier is active based on input price range (USD or EUR)
    let activeTier = 0;
    if (price > 0) {
        if (price <= 500) activeTier = 1;
        else if (price <= 1000) activeTier = 2;
        else if (price <= 1500) activeTier = 3;
        else activeTier = 4;
    }

    // 2. Calculate Tiers
    for (let t = 1; t <= 4; t++) {
        const mult = multipliers[t - 1];
        
        // Selling Price = Cost * Multiplier
        const sellingPrice = cost * mult;
        
        // Vat 7% = Selling Price * 1.07 (calculated as inclusive selling price in the sheet)
        const priceVat = sellingPrice * 1.07;
        
        // Discounts
        const d10Val = sellingPrice * 0.90;
        const d15Val = sellingPrice * 0.85;
        const d20Val = sellingPrice * 0.80;
        const d25Val = sellingPrice * 0.75;

        // DOM elements
        const priceEl = document.getElementById(`t${t}-price`);
        const vatValEl = document.getElementById(`t${t}-vat-val`);
        const d10El = document.getElementById(`t${t}-d10`);
        const d15El = document.getElementById(`t${t}-d15`);
        const d20El = document.getElementById(`t${t}-d20`);
        const d25El = document.getElementById(`t${t}-d25`);
        const cardEl = document.getElementById(`tier-card-${t}`);

        if (priceEl) priceEl.textContent = `${formatCurrency(sellingPrice)} ฿`;
        if (vatValEl) vatValEl.textContent = formatCurrency(priceVat);
        if (d10El) d10El.textContent = `${formatCurrency(d10Val)} ฿`;
        if (d15El) d15El.textContent = `${formatCurrency(d15Val)} ฿`;
        if (d20El) d20El.textContent = `${formatCurrency(d20Val)} ฿`;
        if (d25El) d25El.textContent = `${formatCurrency(d25Val)} ฿`;

        // Highlight active card
        if (cardEl) {
            if (t === activeTier) {
                cardEl.classList.add('active-tier');
            } else {
                cardEl.classList.remove('active-tier');
            }
        }
    }
}

// Copy Quotation text to Clipboard
function copyTierToClipboard(tier) {
    const priceInput = document.getElementById('input-price');
    const rateInput = document.getElementById('input-rate');
    
    if (!priceInput || !rateInput) return;

    const price = parseFloat(priceInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;
    const cost = price * rate;
    const mult = multipliers[tier - 1];
    const range = tierRanges[tier - 1];
    
    const sellingPrice = cost * mult;
    const priceVat = sellingPrice * 1.07;
    const d10 = sellingPrice * 0.90;
    const d15 = sellingPrice * 0.85;
    const d20 = sellingPrice * 0.80;
    const d25 = sellingPrice * 0.75;

    const curSymbol = currentCurrency === 'USD' ? '$' : '€';

    const text = `====================================
📄 ใบคำนวณราคาแนะนำขาย (ระดับที่ ${tier})
====================================
สกุลเงินต้นทาง: ${currentCurrency}
ราคาอะไหล่: ${curSymbol}${formatCurrency(price)}
อัตราแลกเปลี่ยน: ${formatCurrency(rate)} THB
------------------------------------
ต้นทุนสินค้า: ${formatCurrency(cost)} THB
ระดับคำนวณ: ระดับที่ ${tier} (${range})
ตัวคูณเพิ่มราคา: ${mult.toFixed(1)}x
------------------------------------
ราคาแนะนำขาย (ก่อน VAT): ${formatCurrency(sellingPrice)} THB
ราคาแนะนำขาย (รวม VAT 7%): ${formatCurrency(priceVat)} THB
------------------------------------
ราคาหักส่วนลดพันธมิตร:
• ส่วนลด 10%: ${formatCurrency(d10)} THB
• ส่วนลด 15%: ${formatCurrency(d15)} THB
• ส่วนลด 20%: ${formatCurrency(d20)} THB
• ส่วนลด 25%: ${formatCurrency(d25)} THB
====================================`;

    navigator.clipboard.writeText(text).then(() => {
        showToast(`คัดลอกข้อมูลใบเสนอราคา ระดับที่ ${tier} ไปยังคลิปบอร์ดแล้ว!`);
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

// Toast System
let toastTimeout;
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}
