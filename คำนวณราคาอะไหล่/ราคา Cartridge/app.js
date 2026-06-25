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
