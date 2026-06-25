/* Native integration logic for the Laser Engineer parts price tab. */
window.PartsPriceIntegrated = {
    activeTool: 'spare',

    init() {
        this.spare.init();
        this.cartridge.init();
        this.switchTool('spare', false);
    },

    switchTool(tool, notify = true) {
        this.activeTool = tool === 'cartridge' ? 'cartridge' : 'spare';
        const isSpare = this.activeTool === 'spare';
        document.getElementById('parts-native-panel-spare')?.classList.toggle('hidden', !isSpare);
        document.getElementById('parts-native-panel-cartridge')?.classList.toggle('hidden', isSpare);

        const spareBtn = document.getElementById('parts-native-tab-spare');
        const cartBtn = document.getElementById('parts-native-tab-cartridge');
        const active = ['text-blue-600', 'bg-white/70', 'shadow-sm', 'border', 'border-white/60'];
        const inactive = ['text-slate-500', 'hover:bg-white/30'];
        [spareBtn, cartBtn].forEach((btn) => btn?.classList.remove(...active, ...inactive));
        (isSpare ? spareBtn : cartBtn)?.classList.add(...active);
        (isSpare ? cartBtn : spareBtn)?.classList.add(...inactive);
        if (typeof lucide !== 'undefined') lucide.createIcons();
        if (notify && window.App) App.showToast(isSpare ? 'เปิดหน้าราคาอะไหล่' : 'เปิดหน้าราคา Cartridge');
    },

    spare: (() => {
        let currentCurrency = 'USD';
        let toastTimeout;
        const defaultRates = { USD: 36.00, EUR: 40.00 };
        const exchangeRates = { USD: 36.00, EUR: 40.00 };
        const multipliers = [4.0, 3.0, 2.0, 1.5];
        const tierRanges = [
            'ราคา 1 - 500 USD / Euro',
            'ราคา 501 - 1,000 USD / Euro',
            'ราคา 1,001 - 1,500 USD / Euro',
            'ราคา 1,501 USD / Euro ขึ้นไป'
        ];
        const el = (id) => document.getElementById(`pp-spare-${id}`);

        function init() {
            const dateEl = el('current-date');
            if (dateEl) {
                dateEl.textContent = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
            }
            const rateInput = el('input-rate');
            if (rateInput) rateInput.value = exchangeRates[currentCurrency];
            calculate();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function switchCurrency(currency) {
            if (currentCurrency === currency) return;
            currentCurrency = currency;
            const usdTab = el('tab-usd');
            const eurTab = el('tab-eur');
            if (currency === 'USD') {
                usdTab?.classList.add('active');
                eurTab?.classList.remove('active');
            } else {
                eurTab?.classList.add('active');
                usdTab?.classList.remove('active');
            }
            const currencyBadge = el('currency-badge');
            const currencyIcon = el('currency-icon');
            if (currencyBadge) currencyBadge.textContent = currency;
            if (currencyIcon) currencyIcon.innerHTML = currency === 'USD' ? '<i data-lucide="dollar-sign"></i>' : '<i data-lucide="euro"></i>';
            const rateInput = el('input-rate');
            if (rateInput) rateInput.value = exchangeRates[currency];
            calculate();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        function applyPreset(amount) {
            const priceInput = el('input-price');
            if (priceInput) {
                priceInput.value = amount;
                calculate();
            }
        }

        function resetExchangeRate() {
            exchangeRates[currentCurrency] = defaultRates[currentCurrency];
            const rateInput = el('input-rate');
            if (rateInput) rateInput.value = defaultRates[currentCurrency];
            calculate();
            showToast(`รีเซ็ตอัตราแลกเปลี่ยนเป็นค่าเริ่มต้น (${defaultRates[currentCurrency]} THB)`);
        }

        function resetCalculator() {
            currentCurrency = 'USD';
            exchangeRates.USD = defaultRates.USD;
            exchangeRates.EUR = defaultRates.EUR;
            const priceInput = el('input-price');
            const rateInput = el('input-rate');
            const usdTab = el('tab-usd');
            const eurTab = el('tab-eur');
            const currencyBadge = el('currency-badge');
            const currencyIcon = el('currency-icon');
            if (priceInput) priceInput.value = '';
            if (rateInput) rateInput.value = defaultRates.USD;
            usdTab?.classList.add('active');
            eurTab?.classList.remove('active');
            if (currencyBadge) currencyBadge.textContent = 'USD';
            if (currencyIcon) currencyIcon.innerHTML = '<i data-lucide="dollar-sign"></i>';
            calculate();
            if (typeof lucide !== 'undefined') lucide.createIcons();
            showToast('รีเซ็ตค่าที่ป้อนเรียบร้อยแล้ว');
        }

        function formatCurrency(value) {
            return new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
        }

        function calculate() {
            const priceInput = el('input-price');
            const rateInput = el('input-rate');
            const costThbEl = el('cost-thb');
            if (!priceInput || !rateInput || !costThbEl) return;
            const price = Math.max(parseFloat(priceInput.value) || 0, 0);
            const rate = Math.max(parseFloat(rateInput.value) || 0, 0);
            exchangeRates[currentCurrency] = rate;
            const cost = price * rate;
            costThbEl.textContent = `${formatCurrency(cost)} บาท`;
            let activeTier = 0;
            if (price > 0) {
                if (price <= 500) activeTier = 1;
                else if (price <= 1000) activeTier = 2;
                else if (price <= 1500) activeTier = 3;
                else activeTier = 4;
            }
            for (let tier = 1; tier <= 4; tier++) {
                const sellingPrice = cost * multipliers[tier - 1];
                const priceVat = sellingPrice * 1.07;
                const values = {
                    [`t${tier}-price`]: `${formatCurrency(sellingPrice)} บาท`,
                    [`t${tier}-vat-val`]: formatCurrency(priceVat),
                    [`t${tier}-d10`]: `${formatCurrency(sellingPrice * 0.90)} บาท`,
                    [`t${tier}-d15`]: `${formatCurrency(sellingPrice * 0.85)} บาท`,
                    [`t${tier}-d20`]: `${formatCurrency(sellingPrice * 0.80)} บาท`,
                    [`t${tier}-d25`]: `${formatCurrency(sellingPrice * 0.75)} บาท`,
                };
                Object.entries(values).forEach(([id, value]) => { const target = el(id); if (target) target.textContent = value; });
                const card = el(`tier-card-${tier}`);
                card?.classList.toggle('active-tier', tier === activeTier);
            }
        }

        function copyTierToClipboard(tier) {
            const price = parseFloat(el('input-price')?.value) || 0;
            const rate = parseFloat(el('input-rate')?.value) || 0;
            const cost = price * rate;
            const mult = multipliers[tier - 1];
            const sellingPrice = cost * mult;
            const priceVat = sellingPrice * 1.07;
            const curSymbol = currentCurrency === 'USD' ? '$' : '€';
            const text = `ใบคำนวณราคาแนะนำขาย (ระดับที่ ${tier})
สกุลเงินต้นทาง: ${currentCurrency}
ราคาอะไหล่: ${curSymbol}${formatCurrency(price)}
อัตราแลกเปลี่ยน: ${formatCurrency(rate)} THB
ต้นทุนสินค้า: ${formatCurrency(cost)} THB
ระดับคำนวณ: ระดับที่ ${tier} (${tierRanges[tier - 1]})
ตัวคูณเพิ่มราคา: ${mult.toFixed(1)}x
ราคาแนะนำขายก่อน VAT: ${formatCurrency(sellingPrice)} THB
ราคาแนะนำขายรวม VAT 7%: ${formatCurrency(priceVat)} THB
ส่วนลด 10%: ${formatCurrency(sellingPrice * 0.90)} THB
ส่วนลด 15%: ${formatCurrency(sellingPrice * 0.85)} THB
ส่วนลด 20%: ${formatCurrency(sellingPrice * 0.80)} THB
ส่วนลด 25%: ${formatCurrency(sellingPrice * 0.75)} THB`;
            navigator.clipboard.writeText(text).then(() => showToast(`คัดลอกข้อมูลใบเสนอราคา ระดับที่ ${tier} แล้ว`)).catch(() => showToast('คัดลอกอัตโนมัติไม่ได้'));
        }

        function showToast(message) {
            const toast = el('toast');
            const toastMsg = el('toast-message');
            if (!toast || !toastMsg) return;
            toastMsg.textContent = message;
            toast.classList.add('show');
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
        }

        return { init, switchCurrency, applyPreset, resetExchangeRate, resetCalculator, calculate, copyTierToClipboard };
    })(),


    cartridge: (() => {
        let initialized = false;
        function init() {
            if (initialized) return;
            initialized = true;
            const nativeDocument = window.document;
            const root = nativeDocument.getElementById('pp-cart-root');
            const document = {
                getElementById(id) { return nativeDocument.getElementById(`pp-cart-${id}`); },
                querySelectorAll(selector) {
                    return root.querySelectorAll(selector.replace(/name=(['"])warranty\1/g, 'name=$1pp-cart-warranty$1'));
                }
            };
const CARTRIDGE_DATA = [
  {
    key: "ultracel",
    machine: "UltraCel Q+",
    cartridges: [
      {
        key: "dot",
        name: "Dot",
        totalShots: 10000,
        fullPrice: 40000,
        limitYear1: 5000,
        limitYear2: 5000,
        displayedRate: 4,
        formulaRate: 4,
        sheetRows: "A1:E5",
      },
      {
        key: "linear",
        name: "Linear",
        totalShots: 20000,
        fullPrice: 80000,
        limitYear1: 10000,
        limitYear2: 5000,
        displayedRate: 4,
        formulaRate: 4,
        sheetRows: "A7:E10",
      },
    ],
  },
  {
    key: "linearz",
    machine: "Linear Z",
    cartridges: [
      {
        key: "basic",
        name: "Basic, Core, Essential",
        totalShots: 30000,
        fullPrice: 200000,
        limitYear1: 15000,
        limitYear2: 10000,
        displayedRate: 6.67,
        formulaRate: 6.67,
        sheetRows: "A13:E17",
      },
      {
        key: "contour",
        name: "Contour",
        totalShots: 40000,
        fullPrice: 200000,
        limitYear1: 15000,
        limitYear2: 10000,
        displayedRate: 5,
        formulaRate: 5,
        sheetRows: "A19:E22",
      },
    ],
  },
  {
    key: "linearz-kol",
    machine: "Linear Z (KOL)",
    cartridges: [
      {
        key: "basic-kol",
        name: "Basic, Core, Essential",
        totalShots: 30000,
        fullPrice: 150000,
        limitYear1: 15000,
        limitYear2: 10000,
        displayedRate: 5,
        formulaRate: 6.67,
        sheetRows: "A25:E29",
        note: "ข้อความในชีตระบุ 5 บาท/Shot แต่สูตรคำนวณใช้ 6.67 บาท/Shot",
      },
      {
        key: "contour-kol",
        name: "Contour",
        totalShots: 40000,
        fullPrice: 150000,
        limitYear1: 15000,
        limitYear2: 10000,
        displayedRate: 3.75,
        formulaRate: 5,
        sheetRows: "A31:E34",
        note: "ข้อความในชีตระบุ 3.75 บาท/Shot แต่สูตรคำนวณใช้ 5 บาท/Shot",
      },
    ],
  },
];

const WARRANTY = {
  year1: {
    label: "ภายใน 1 ปี รวมประกัน",
    percent: 0.5,
    percentLabel: "50%",
    limitKey: "limitYear1",
  },
  year2: {
    label: "หลังจาก 1 ปี ไม่เกิน 2 ปี",
    percent: 0.2,
    percentLabel: "20%",
    limitKey: "limitYear2",
  },
};

const state = {
  machineKey: CARTRIDGE_DATA[0].key,
  cartridgeKey: CARTRIDGE_DATA[0].cartridges[0].key,
  warrantyKey: "year1",
  remainingShots: 1000,
};

const els = {
  machineSelect: document.getElementById("machineSelect"),
  cartridgeSelect: document.getElementById("cartridgeSelect"),
  remainingShots: document.getElementById("remainingShots"),
  quickButtons: document.getElementById("quickButtons"),
  cartridgeInfo: document.getElementById("cartridgeInfo"),
  discountAmount: document.getElementById("discountAmount"),
  payableAmount: document.getElementById("payableAmount"),
  fullPrice: document.getElementById("fullPrice"),
  ratePerShot: document.getElementById("ratePerShot"),
  activeLimit: document.getElementById("activeLimit"),
  limitNote: document.getElementById("limitNote"),
  formulaTag: document.getElementById("formulaTag"),
  formulaSteps: document.getElementById("formulaSteps"),
  warningBox: document.getElementById("warningBox"),
  referenceBody: document.getElementById("referenceBody"),
  copyButton: document.getElementById("copyButton"),
  resetButton: document.getElementById("resetButton"),
  toast: document.getElementById("toast"),
};

function fmt(value, digits = 2) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function fmtInt(value) {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function money(value) {
  const hasSatang = Math.abs(value - Math.round(value)) > 0.005;
  return `${fmt(value, hasSatang ? 2 : 0)} บาท`;
}

function getMachine() {
  return CARTRIDGE_DATA.find((item) => item.key === state.machineKey);
}

function getCartridge() {
  return getMachine().cartridges.find((item) => item.key === state.cartridgeKey);
}

function getWarranty() {
  return WARRANTY[state.warrantyKey];
}

function calculate() {
  const cart = getCartridge();
  const warranty = getWarranty();
  const limit = cart[warranty.limitKey];
  const eligibleShots = Math.min(state.remainingShots, limit);
  const shotValue = eligibleShots * cart.formulaRate;
  const discount = shotValue * warranty.percent;
  const payable = Math.max(cart.fullPrice - discount, 0);

  return {
    cart,
    warranty,
    limit,
    eligibleShots,
    shotValue,
    discount,
    payable,
  };
}

function renderMachineOptions() {
  els.machineSelect.innerHTML = CARTRIDGE_DATA.map((machine) => (
    `<option value="${machine.key}">${machine.machine}</option>`
  )).join("");
  els.machineSelect.value = state.machineKey;
}

function renderCartridgeOptions() {
  const machine = getMachine();
  els.cartridgeSelect.innerHTML = machine.cartridges.map((cart) => (
    `<option value="${cart.key}">${cart.name} · ${fmtInt(cart.totalShots)} Shot</option>`
  )).join("");
  state.cartridgeKey = machine.cartridges.some((cart) => cart.key === state.cartridgeKey)
    ? state.cartridgeKey
    : machine.cartridges[0].key;
  els.cartridgeSelect.value = state.cartridgeKey;
}

function renderQuickButtons() {
  const cart = getCartridge();
  const presets = [1000, cart.limitYear1 / 2, cart.limitYear1, cart.totalShots].filter((value, index, arr) => (
    value > 0 && arr.indexOf(value) === index
  ));
  els.quickButtons.innerHTML = presets.map((value) => (
    `<button type="button" data-shot="${Math.round(value)}">${fmtInt(value)}</button>`
  )).join("");
}

function renderInfo() {
  const cart = getCartridge();
  els.cartridgeInfo.innerHTML = `
    <div class="info-row"><span>ราคาเต็ม</span><strong>${money(cart.fullPrice)}</strong></div>
    <div class="info-row"><span>Total Shot</span><strong>${fmtInt(cart.totalShots)} Shot</strong></div>
    <div class="info-row"><span>Limit ปีที่ 1</span><strong>${fmtInt(cart.limitYear1)} Shot</strong></div>
    <div class="info-row"><span>Limit ปีที่ 2</span><strong>${fmtInt(cart.limitYear2)} Shot</strong></div>
    <div class="info-row"><span>ช่วงอ้างอิงในชีต</span><strong>${cart.sheetRows}</strong></div>
  `;
}

function renderReferenceTable() {
  const rows = [];
  CARTRIDGE_DATA.forEach((machine) => {
    machine.cartridges.forEach((cart) => {
      const active = machine.key === state.machineKey && cart.key === state.cartridgeKey ? "active" : "";
      rows.push(`
        <tr class="${active}">
          <td>${machine.machine}</td>
          <td>${cart.name}</td>
          <td>${fmtInt(cart.totalShots)}</td>
          <td>${fmtInt(cart.limitYear1)}</td>
          <td>${fmtInt(cart.limitYear2)}</td>
          <td>${fmt(cart.formulaRate)} บาท</td>
          <td>${money(cart.fullPrice)}</td>
        </tr>
      `);
    });
  });
  els.referenceBody.innerHTML = rows.join("");
}

function renderResult() {
  const result = calculate();
  const { cart, warranty, limit, eligibleShots, shotValue, discount, payable } = result;
  const overLimit = state.remainingShots > limit;

  els.discountAmount.textContent = money(discount);
  els.payableAmount.textContent = money(payable);
  els.fullPrice.textContent = money(cart.fullPrice);
  els.ratePerShot.textContent = `${fmt(cart.formulaRate)} บาท`;
  els.activeLimit.textContent = `${fmtInt(limit)} Shot`;
  els.formulaTag.textContent = `${warranty.label} · ${warranty.percentLabel}`;
  els.limitNote.textContent = overLimit
    ? `Shot คงเหลือ ${fmtInt(state.remainingShots)} Shot เกิน Limit จึงนำมาคิดเพียง ${fmtInt(limit)} Shot`
    : `คำนวณจาก Shot ที่เข้าเงื่อนไข ${fmtInt(eligibleShots)} Shot`;

  els.formulaSteps.innerHTML = `
    <li>Shot ที่นำมาคำนวณ = min(${fmtInt(state.remainingShots)}, ${fmtInt(limit)}) = <strong>${fmtInt(eligibleShots)} Shot</strong></li>
    <li>มูลค่า Shot คงเหลือ = ${fmtInt(eligibleShots)} × ${fmt(cart.formulaRate)} = <strong>${money(shotValue)}</strong></li>
    <li>ส่วนลดตามสัดส่วน ${warranty.percentLabel} = ${money(shotValue)} × ${warranty.percentLabel} = <strong>${money(discount)}</strong></li>
    <li>ราคาที่ต้องชำระ = ${money(cart.fullPrice)} - ${money(discount)} = <strong>${money(payable)}</strong></li>
  `;

  if (cart.note) {
    els.warningBox.hidden = false;
    els.warningBox.textContent = `${cart.note} ระบบนี้คำนวณตามตัวเลขในสูตร Excel`;
  } else {
    els.warningBox.hidden = true;
    els.warningBox.textContent = "";
  }

  renderReferenceTable();
}

function renderAll() {
  renderCartridgeOptions();
  renderQuickButtons();
  renderInfo();
  renderResult();
}

function copyResult() {
  const machine = getMachine();
  const result = calculate();
  const { cart, warranty, limit, eligibleShots, shotValue, discount, payable } = result;
  const lines = [
    "ผลคำนวณราคาขาย Cartridge",
    `เครื่อง: ${machine.machine}`,
    `Cartridge: ${cart.name} (${fmtInt(cart.totalShots)} Shot)`,
    `ราคาเต็มรวม VAT: ${money(cart.fullPrice)}`,
    `Shot คงเหลือ: ${fmtInt(state.remainingShots)} Shot`,
    `Limit: ${fmtInt(limit)} Shot`,
    `Shot ที่นำมาคำนวณ: ${fmtInt(eligibleShots)} Shot`,
    `ราคา/Shot: ${fmt(cart.formulaRate)} บาท`,
    `มูลค่า Shot: ${money(shotValue)}`,
    `เงื่อนไข: ${warranty.label} (${warranty.percentLabel})`,
    `ส่วนลด: ${money(discount)}`,
    `ราคาที่ต้องชำระหลังหักส่วนลด: ${money(payable)}`,
  ];

  navigator.clipboard.writeText(lines.join("\n")).then(() => {
    showToast("คัดลอกผลคำนวณแล้ว");
  }).catch(() => {
    showToast("คัดลอกอัตโนมัติไม่ได้");
  });
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2200);
}

function resetCalculator() {
  state.machineKey = CARTRIDGE_DATA[0].key;
  state.cartridgeKey = CARTRIDGE_DATA[0].cartridges[0].key;
  state.warrantyKey = "year1";
  state.remainingShots = 1000;

  els.remainingShots.value = state.remainingShots;
  document.querySelectorAll("input[name='warranty']").forEach((input) => {
    input.checked = input.value === state.warrantyKey;
  });

  renderMachineOptions();
  renderAll();
  showToast("รีเซ็ตค่าที่ป้อนเรียบร้อยแล้ว");
}

function bindEvents() {
  els.machineSelect.addEventListener("change", (event) => {
    state.machineKey = event.target.value;
    state.cartridgeKey = getMachine().cartridges[0].key;
    renderAll();
  });

  els.cartridgeSelect.addEventListener("change", (event) => {
    state.cartridgeKey = event.target.value;
    renderAll();
  });

  els.remainingShots.addEventListener("input", (event) => {
    state.remainingShots = Math.max(Number(event.target.value) || 0, 0);
    renderResult();
  });

  document.querySelectorAll("input[name='warranty']").forEach((input) => {
    input.addEventListener("change", (event) => {
      state.warrantyKey = event.target.value;
      renderResult();
    });
  });

  els.quickButtons.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-shot]");
    if (!button) return;
    state.remainingShots = Number(button.dataset.shot);
    els.remainingShots.value = state.remainingShots;
    renderResult();
  });

  els.copyButton.addEventListener("click", copyResult);
  els.resetButton.addEventListener("click", resetCalculator);
}

renderMachineOptions();
bindEvents();
renderAll();

        }
        return { init };
    })(),

};
