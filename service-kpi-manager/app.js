const KPI = {
  assistant_daily: {
    label: "ผู้ช่วยผู้จัดการฝ่ายบริการ — ประเมินรายวัน",
    role: "ผู้ช่วยผู้จัดการฝ่ายบริการ",
    frequency: "รายวัน",
    scored: true,
    criteria: [
      ["daily_control", "การบริหารและติดตามงานประจำวัน", 25, "แผนงานประจำวัน ลำดับความสำคัญ ผู้รับผิดชอบ กำหนดเสร็จ และรายการติดตาม"],
      ["team_quality", "คุณภาพและความถูกต้องของงานทีม", 20, "งานซ่อมซ้ำ รายงานบริการ แบบตรวจสอบ และแนวทางป้องกันปัญหาซ้ำ"],
      ["coordination", "การประสานงานลูกค้าและภายใน", 15, "บันทึกการติดต่อ นัดหมาย สถานะอะไหล่ และการส่งต่องาน"],
      ["rapid_problem_solving", "การแก้ปัญหาเร่งด่วน", 15, "ระยะเวลาตอบกลับ การสนับสนุนช่างบริการ และบันทึกการส่งต่อปัญหา"],
      ["team_accountability", "การควบคุมทีมและความรับผิดชอบ", 10, "สถานะงาน ผู้รับผิดชอบ สิ่งที่ต้องทำต่อ และกำหนดเสร็จ"],
      ["team_development", "การพัฒนาทีม", 5, "การสอนงาน การอบรมย่อย และการแบ่งปันความรู้"],
      ["discipline", "ความตรงต่อเวลาและวินัย", 5, "การประชุม กำหนดส่งรายงาน และตารางปฏิบัติงาน"],
      ["leadership", "กฎระเบียบและภาวะผู้นำ", 5, "การปฏิบัติตามข้อกำหนด การเป็นแบบอย่าง และการสื่อสารในทีม"]
    ]
  },
  manager_monthly: {
    label: "ผู้จัดการฝ่ายบริการ — ประเมินรายวัน",
    role: "ผู้จัดการฝ่ายบริการ",
    frequency: "รายวัน",
    scored: true,
    criteria: [
      ["service_results", "ผลการดำเนินงานของทีมบริการ", 25, "อัตราปิดงานตรงเวลา งานตามข้อตกลง งานค้าง เวลาที่เครื่องหยุดใช้งาน และงานบำรุงรักษาตามแผน"],
      ["quality_recurrence", "คุณภาพงานและการลดปัญหาซ้ำ", 20, "อัตราซ่อมสำเร็จครั้งแรก งานซ่อมซ้ำ ข้อร้องเรียน และเหตุอุปกรณ์เสียหาย"],
      ["team_management", "การบริหารทีม", 15, "ภาระงาน กำลังคน ผลงาน และวินัยของทีม"],
      ["customer_management", "การบริหารลูกค้า", 15, "ระยะเวลาตอบกลับ แผนดำเนินการ ความพึงพอใจของลูกค้า และการปิดข้อร้องเรียน"],
      ["decision_making", "การแก้ปัญหาและตัดสินใจ", 10, "การหาสาเหตุ แนวทางแก้ไขและป้องกัน บันทึกการตัดสินใจ และแนวโน้มปัญหาซ้ำ"],
      ["system_development", "การพัฒนาระบบและทีม", 10, "ขั้นตอนปฏิบัติงาน แผนอบรม การป้องกันล่วงหน้า และโครงการปรับปรุง"],
      ["manager_leadership", "วินัยและภาวะผู้นำ", 5, "ความรับผิดชอบ ความโปร่งใส และรายงานต่อผู้บริหาร"]
    ]
  }
};

const SCORE_GUIDE = [
  [5, "ยอดเยี่ยม", "สูงกว่าเป้าหมายอย่างชัดเจนและมีหลักฐานผลกระทบเชิงบวกต่อทีมหรือระบบ"],
  [4, "ดีมาก", "ทำได้สูงกว่าเป้าหมายอย่างสม่ำเสมอและมีข้อบกพร่องเพียงเล็กน้อย"],
  [3, "ตามความคาดหวัง", "ทำได้ตามมาตรฐานที่ตำแหน่งงานต้องรับผิดชอบ"],
  [2, "ต้องปรับปรุง", "ต่ำกว่ามาตรฐานบางด้านและต้องมีแผนปรับปรุง"],
  [1, "ไม่เป็นที่น่าพอใจ", "ไม่ผ่านมาตรฐานอย่างชัดเจนหรือก่อให้เกิดผลกระทบสำคัญ"]
];

const RATING_COLORS = {
  "Outstanding": "#10a779",
  "Very Good": "#00a8b5",
  "Meet Expectation": "#5e76d6",
  "Need Improvement": "#d99121",
  "Performance Improvement Required": "#db4f69"
};

const RATING_LABELS = {
  "Outstanding": "ยอดเยี่ยม",
  "Very Good": "ดีมาก",
  "Meet Expectation": "เป็นไปตามที่คาดหวัง",
  "Need Improvement": "ควรปรับปรุง",
  "Performance Improvement Required": "ต้องจัดทำแผนปรับปรุง"
};

const TEAM_STORAGE_KEY = "service-kpi-team-v1";
const state = { records: [], historyRecords: [], view: "dashboard", period: "month", loading: false, activeRecordId: "", editingRecordId: "", pendingMutation: null, confirmResolver: null, team: { manager: "", assistant: "" } };
const $ = (id) => document.getElementById(id);
const now = new Date();
const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const currentMonth = localDate.slice(0, 7);
const currentYear = currentMonth.slice(0, 4);

function apiUrl() { return String(window.KPI_CONFIG?.API_URL || "").trim(); }
function ratingFor(score) { return score >= 90 ? "Outstanding" : score >= 80 ? "Very Good" : score >= 70 ? "Meet Expectation" : score >= 60 ? "Need Improvement" : "Performance Improvement Required"; }
function ratingLabel(rating) { return RATING_LABELS[rating] || rating; }
function formatDate(value) { if (!value) return "—"; const [year, month, day] = value.split("-"); return `${day}/${month}/${year}`; }
function formatMonth(value) {
  if (!/^\d{4}-\d{2}$/.test(value)) return value;
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("th-TH-u-ca-gregory", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
}
function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }
function generateRequestId() { return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function refreshIcons() { if (globalThis.lucide) globalThis.lucide.createIcons(); }
function visibleRecords(records = state.records) { return records.filter((record) => record.assessmentKind !== "manager_daily_check"); }

function showAlert(message, type = "success") {
  const element = $("alert");
  element.textContent = message;
  element.className = `alert ${type}`;
  element.hidden = false;
  clearTimeout(showAlert.timer);
  showAlert.timer = setTimeout(() => { element.hidden = true; }, 4200);
}

function setConnection(status, text) {
  document.querySelector(".status-dot").className = `status-dot ${status}`;
  $("connectionLabel").textContent = text;
}

function emptyTable(message) { return `<div class="empty-state"><i data-lucide="inbox"></i><span>${escapeHtml(message)}</span></div>`; }

async function request(action, payload = {}) {
  if (!apiUrl()) throw new Error("ยังไม่ได้ตั้งค่า Google Apps Script URL ในไฟล์ config.js");
  if (action === "list") {
    const url = new URL(apiUrl());
    url.searchParams.set("action", "list");
    url.searchParams.set("month", payload.month);
    const response = await fetch(url.toString(), { redirect: "follow" });
    if (!response.ok) throw new Error(`เชื่อมต่อฐานข้อมูลไม่สำเร็จ (${response.status})`);
    return response.json();
  }
  const response = await fetch(apiUrl(), {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
    redirect: "follow"
  });
  if (!response.ok) throw new Error(`บันทึกข้อมูลไม่สำเร็จ (${response.status})`);
  return response.json();
}

async function loadRecords(month, notify = false, target = "both") {
  if (state.loading) return;
  state.loading = true;
  $("refreshButton").classList.add("loading");
  try {
    const data = await request("list", { month });
    if (!data.ok) throw new Error(data.error || "ไม่สามารถอ่านข้อมูลได้");
    const records = Array.isArray(data.records) ? data.records : [];
    if (target === "dashboard" || target === "both") state.records = records;
    if (target === "history" || target === "both") state.historyRecords = records;
    setConnection("online", "เชื่อมต่อ Google Sheets แล้ว");
    $("syncTime").textContent = `อัปเดตล่าสุด ${new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.`;
    if (target === "dashboard" || target === "both") renderDashboard();
    if (target === "history" || target === "both") renderHistory();
    if (notify) showAlert("อัปเดตข้อมูลแล้ว");
  } catch (error) {
    if (target === "dashboard" || target === "both") state.records = [];
    if (target === "history" || target === "both") state.historyRecords = [];
    setConnection("offline", apiUrl() ? "เชื่อมต่อ Google Sheets ไม่สำเร็จ" : "รอตั้งค่า Google Apps Script");
    if (target === "dashboard" || target === "both") renderDashboard();
    if (target === "history" || target === "both") renderHistory();
    if (notify || apiUrl()) showAlert(error.message, "error");
  } finally {
    state.loading = false;
    $("refreshButton").classList.remove("loading");
  }
}

async function loadYearRecords(year, notify = false) {
  if (state.loading) return;
  state.loading = true;
  $("refreshButton").classList.add("loading");
  try {
    const months = Array.from({ length: 12 }, (_, index) => `${year}-${String(index + 1).padStart(2, "0")}`);
    const responses = await Promise.all(months.map((month) => request("list", { month })));
    const failed = responses.find((response) => !response.ok);
    if (failed) throw new Error(failed.error || "ไม่สามารถอ่านข้อมูลรายปีได้");
    state.records = responses.flatMap((response) => Array.isArray(response.records) ? response.records : []).sort((a, b) => `${b.assessmentDate}${b.createdAt || ""}`.localeCompare(`${a.assessmentDate}${a.createdAt || ""}`));
    setConnection("online", "เชื่อมต่อ Google Sheets แล้ว");
    $("syncTime").textContent = `อัปเดตล่าสุด ${new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.`;
    renderDashboard();
    if (notify) showAlert("อัปเดตข้อมูลรายปีแล้ว");
  } catch (error) {
    state.records = [];
    setConnection("offline", apiUrl() ? "เชื่อมต่อ Google Sheets ไม่สำเร็จ" : "รอตั้งค่า Google Apps Script");
    renderDashboard();
    if (notify || apiUrl()) showAlert(error.message, "error");
  } finally {
    state.loading = false;
    $("refreshButton").classList.remove("loading");
  }
}

function refreshDashboard(notify = false) {
  if (state.period === "year") return loadYearRecords($("dashboardYear").value, notify);
  return loadRecords($("dashboardMonth").value, notify, "dashboard");
}

function setPeriod(period, load = true) {
  state.period = period;
  document.querySelectorAll(".period-button").forEach((button) => button.classList.toggle("active", button.dataset.period === period));
  $("monthControl").hidden = period !== "month";
  $("yearControl").hidden = period !== "year";
  $("employeePeriodLabel").textContent = period === "year" ? "คนในปีนี้" : "คนในเดือนนี้";
  $("evaluationPeriodLabel").textContent = period === "year" ? "รายการในปีนี้" : "รายการในเดือนนี้";
  $("exportButton").innerHTML = `<i data-lucide="download"></i>${period === "year" ? "ส่งออกรายงานรายปี" : "ส่งออกรายงานรายเดือน"}`;
  refreshIcons();
  if (load) refreshDashboard();
}

function switchView(view) {
  state.view = view;
  document.querySelectorAll(".view").forEach((element) => element.classList.toggle("active", element.id === `${view}View`));
  document.querySelectorAll(".nav-item").forEach((element) => element.classList.toggle("active", element.dataset.view === view));
  const meta = {
    dashboard: ["Service KPI Manager", "ติดตามคุณภาพการบริหารงานบริการแบบรายเดือนและรายปี"],
    evaluation: ["ประเมินผลรายวัน", "บันทึกผลจากหลักฐานที่ตรวจสอบได้"],
    history: ["ประวัติการประเมิน", "ค้นและตรวจสอบข้อมูลย้อนหลัง"],
    criteria: ["เกณฑ์การประเมิน", "มาตรฐานคะแนนและหลักฐานอ้างอิง"]
  }[view];
  $("pageTitle").textContent = meta[0];
  $("pageSubtitle").textContent = meta[1];
  closeSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });
  refreshIcons();
}

function scored(records = visibleRecords()) { return records.filter((record) => record.score !== null && record.score !== "" && Number.isFinite(Number(record.score))); }

function renderDashboard() {
  const rows = visibleRecords();
  const scores = scored(rows);
  const periodText = state.period === "year" ? "ปีนี้" : "เดือนนี้";
  const names = new Set(rows.map((record) => record.employeeName).filter(Boolean));
  $("employeeCount").textContent = names.size;
  $("evaluationCount").textContent = scores.length;
  $("averageScore").textContent = scores.length ? (scores.reduce((sum, record) => sum + Number(record.score), 0) / scores.length).toFixed(1) : "—";
  $("exportButton").disabled = rows.length === 0;

  const grouped = {};
  scores.forEach((record) => (grouped[record.employeeName] ??= []).push(Number(record.score)));
  const averages = Object.entries(grouped).map(([name, values]) => [name, values.reduce((a, b) => a + b, 0) / values.length, values.length]).sort((a, b) => b[1] - a[1]);
  $("employeeAverages").className = "rank-list";
  $("employeeAverages").innerHTML = averages.length ? averages.map(([name, average, count]) => `<div class="rank-row"><span>${escapeHtml(name)} <small>${count} ครั้ง</small></span><div class="progress"><span style="width:${average}%"></span></div><strong>${average.toFixed(1)}</strong></div>`).join("") : emptyTable(`ยังไม่มีข้อมูลคะแนนใน${periodText}`);

  const counts = {};
  scores.forEach((record) => { const rating = record.rating || ratingFor(Number(record.score)); counts[rating] = (counts[rating] || 0) + 1; });
  $("ratingSummary").className = "rating-list";
  $("ratingSummary").innerHTML = scores.length ? Object.keys(RATING_COLORS).map((name) => `<div class="rating-row" style="--color:${RATING_COLORS[name]}"><span>${ratingLabel(name)}</span><strong>${counts[name] || 0}</strong></div>`).join("") : emptyTable(`ยังไม่มีข้อมูลคะแนนใน${periodText}`);
  $("recentRecords").innerHTML = rows.length ? recordsTable(rows.slice(0, 6)) : emptyTable(`ยังไม่มีรายการใน${periodText}`);
  renderTrend(scores);
  refreshIcons();
}

function renderTrend(scores) {
  const annual = state.period === "year";
  const periodValue = annual ? $("dashboardYear").value : $("dashboardMonth").value;
  $("trendTitle").textContent = annual ? "แนวโน้มคะแนนรายเดือน" : "แนวโน้มคะแนนรายวัน";
  $("trendSubtitle").textContent = annual ? "กดแท่งกราฟเพื่อดูรายละเอียดของเดือนนั้น" : `คะแนนเฉลี่ยใน${formatMonth(periodValue)}`;
  const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const itemCount = annual ? 12 : new Date(Number(periodValue.slice(0, 4)), Number(periodValue.slice(5, 7)), 0).getDate();
  const groups = Array.from({ length: itemCount }, () => []);
  scores.forEach((record) => {
    const index = annual ? Number(record.assessmentDate.slice(5, 7)) - 1 : Number(record.assessmentDate.slice(8, 10)) - 1;
    if (groups[index]) groups[index].push(Number(record.score));
  });
  const points = groups.map((values, index) => ({
    index,
    value: values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null,
    count: values.length,
    label: annual ? monthNames[index] : String(index + 1)
  }));
  const chart = $("trendChart");
  chart.className = `trend-chart ${annual ? "annual" : "monthly"}`;
  chart.innerHTML = scores.length ? `<div class="chart-scale"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div class="chart-bars">${points.map((point) => {
    const month = `${periodValue}-${String(point.index + 1).padStart(2, "0")}`;
    const title = point.value === null ? `${point.label}: ไม่มีข้อมูล` : `${point.label}: ${point.value.toFixed(1)} คะแนน จาก ${point.count} รายการ`;
    return `<button type="button" class="trend-item ${point.value === null ? "empty" : ""}" ${annual && point.value !== null ? `data-month="${month}"` : "disabled"} title="${title}" aria-label="${title}"><span class="trend-value">${point.value === null ? "" : point.value.toFixed(1)}</span><span class="bar-track"><span class="trend-bar" style="height:${Math.max(point.value || 0, 3)}%"></span></span><span class="trend-label">${point.label}</span></button>`;
  }).join("")}</div>` : emptyTable(annual ? "ยังไม่มีข้อมูลสำหรับสร้างกราฟรายปี" : "ยังไม่มีข้อมูลสำหรับสร้างกราฟรายวัน");
}

function csvCell(value) {
  const text = String(value ?? "").replace(/\r?\n/g, " ");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportPeriodSummary() {
  const rows = visibleRecords();
  if (!rows.length) {
    showAlert(`ยังไม่มีข้อมูลสำหรับส่งออกใน${state.period === "year" ? "ปี" : "เดือน"}ที่เลือก`, "error");
    return;
  }

  const periodValue = state.period === "year" ? $("dashboardYear").value : $("dashboardMonth").value;
  const periodLabel = state.period === "year" ? `ค.ศ. ${periodValue}` : formatMonth(periodValue);
  const scores = scored(rows);
  const names = new Set(rows.map((record) => record.employeeName).filter(Boolean));
  const average = scores.length ? (scores.reduce((sum, record) => sum + Number(record.score), 0) / scores.length).toFixed(1) : "—";
  const lines = [
    ["รายงานสรุปผลการประเมินฝ่ายบริการ"],
    [state.period === "year" ? "ปี" : "เดือน", periodLabel],
    ["จำนวนผู้ได้รับการประเมิน", names.size],
    ["จำนวนแบบประเมิน", scores.length],
    ["คะแนนเฉลี่ยรวม", average],
    [],
    ["วันที่ประเมิน", "ผู้รับการประเมิน", "ตำแหน่ง", "คะแนน", "ระดับผลงาน", "หลักฐานและการติดตาม"],
    ...rows.map((record) => [
      formatDate(record.assessmentDate),
      record.employeeName,
      KPI[record.assessmentKind]?.role || record.role,
      Number(record.score).toFixed(1),
      ratingLabel(record.rating || ratingFor(Number(record.score))),
      record.evidence || ""
    ])
  ];
  const csv = `\ufeff${lines.map((line) => line.map(csvCell).join(",")).join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `สรุปผลประเมินฝ่ายบริการ-${periodValue}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showAlert(`ส่งออกรายงาน${state.period === "year" ? "รายปี" : "รายเดือน"}แล้ว`);
}

function typePill(record) {
  const className = record.assessmentKind === "manager_monthly" ? "manager" : "assistant";
  return `<span class="pill ${className}">${escapeHtml(KPI[record.assessmentKind]?.label || record.assessmentKind)}</span>`;
}

function ratingClass(score) { return score >= 70 ? "good" : score >= 60 ? "warn" : "bad"; }

function recordsTable(rows) {
  return `<table><thead><tr><th>วันที่</th><th>ผู้รับการประเมิน</th><th>ตำแหน่ง</th><th>คะแนน</th><th>ระดับผลงาน</th><th class="action-column">จัดการ</th></tr></thead><tbody>${rows.map((record) => `<tr><td>${formatDate(record.assessmentDate)}</td><td><strong>${escapeHtml(record.employeeName)}</strong></td><td>${typePill(record)}</td><td><strong>${Number(record.score).toFixed(1)}</strong></td><td><span class="rating ${ratingClass(Number(record.score))}">${escapeHtml(ratingLabel(record.rating || ratingFor(Number(record.score))))}</span></td><td class="action-column"><button type="button" class="row-action" data-record-id="${escapeHtml(record.id)}"><i data-lucide="eye"></i>ดูรายละเอียด</button></td></tr>`).join("")}</tbody></table>`;
}

function renderHistory() {
  const rows = visibleRecords(state.historyRecords);
  $("historyRecords").innerHTML = rows.length ? recordsTable(rows) : emptyTable("ไม่พบข้อมูลในเดือนที่เลือก");
  refreshIcons();
}

function findRecord(recordId) {
  return [...state.historyRecords, ...state.records].find((record) => String(record.id) === String(recordId));
}

function openRecordModal(recordId) {
  const record = findRecord(recordId);
  if (!record) { showAlert("ไม่พบข้อมูลรายการนี้ กรุณาโหลดข้อมูลใหม่", "error"); return; }
  state.activeRecordId = String(record.id);
  const template = KPI[record.assessmentKind];
  const score = Number(record.score);
  $("recordSummary").innerHTML = [
    ["วันที่ประเมิน", formatDate(record.assessmentDate)],
    ["ผู้รับการประเมิน", record.employeeName],
    ["ตำแหน่ง", template?.role || record.role],
    ["คะแนนรวม", Number.isFinite(score) ? score.toFixed(1) : "—"],
    ["ระดับผลงาน", ratingLabel(record.rating || (Number.isFinite(score) ? ratingFor(score) : ""))]
  ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "—")}</strong></div>`).join("");
  $("recordScores").innerHTML = template?.criteria?.length ? template.criteria.map(([id, title, weight]) => `<div><div><strong>${escapeHtml(title)}</strong><span>น้ำหนัก ${weight}%</span></div><b>${escapeHtml(record.scores?.[id] ?? "—")}</b></div>`).join("") : emptyTable("ไม่มีรายละเอียดคะแนนรายหัวข้อ");
  $("recordEvidence").textContent = record.evidence || "ไม่ได้ระบุหลักฐานและการติดตาม";
  $("recordModal").hidden = false;
  document.body.classList.add("modal-open");
  refreshIcons();
  setTimeout(() => $("closeRecordModal").focus(), 40);
}

function closeRecordModal() {
  $("recordModal").hidden = true;
  document.body.classList.remove("modal-open");
}

function confirmAction({ title, message, confirmLabel = "ยืนยัน", danger = false }) {
  if (state.confirmResolver) state.confirmResolver(false);
  $("confirmTitle").textContent = title;
  $("confirmMessage").textContent = message;
  $("acceptConfirm").textContent = confirmLabel;
  $("acceptConfirm").className = danger ? "danger-button" : "primary";
  $("confirmIcon").classList.toggle("danger", danger);
  $("confirmModal").hidden = false;
  document.body.classList.add("modal-open");
  setTimeout(() => $("cancelConfirm").focus(), 40);
  return new Promise((resolve) => { state.confirmResolver = resolve; });
}

function closeConfirmModal(accepted = false) {
  $("confirmModal").hidden = true;
  if ($("recordModal").hidden && $("teamModal").hidden) document.body.classList.remove("modal-open");
  const resolve = state.confirmResolver;
  state.confirmResolver = null;
  if (resolve) resolve(accepted);
}

function updateEditMode() {
  const record = state.editingRecordId ? findRecord(state.editingRecordId) : null;
  $("editModeBanner").hidden = !record;
  if (record) $("editModeDescription").textContent = `${formatDate(record.assessmentDate)} · ${record.employeeName}`;
  $("submitButton").innerHTML = record ? '<i data-lucide="save"></i>บันทึกการแก้ไข' : '<i data-lucide="save"></i>บันทึกแบบประเมิน';
  refreshIcons();
}

function beginEditRecord() {
  const record = findRecord(state.activeRecordId);
  if (!record) { showAlert("ไม่พบข้อมูลรายการนี้ กรุณาโหลดข้อมูลใหม่", "error"); return; }
  state.editingRecordId = String(record.id);
  $("assessmentKind").value = record.assessmentKind;
  renderEvaluationForm();
  $("assessmentDate").value = record.assessmentDate;
  if (![...$("employeeName").options].some((option) => option.value === record.employeeName)) {
    $("employeeName").add(new Option(record.employeeName, record.employeeName));
  }
  $("employeeName").value = record.employeeName;
  Object.entries(record.scores || {}).forEach(([id, score]) => {
    const input = document.querySelector(`input[name="score_${id}"][value="${Number(score)}"]`);
    if (input) input.checked = true;
  });
  $("evidence").value = record.evidence || "";
  calculateForm();
  closeRecordModal();
  switchView("evaluation");
  updateEditMode();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cancelEditMode() {
  state.editingRecordId = "";
  resetForm();
  showAlert("ยกเลิกการแก้ไขแล้ว");
}

async function deleteRecord() {
  const record = findRecord(state.activeRecordId);
  if (!record) { showAlert("ไม่พบข้อมูลรายการนี้ กรุณาโหลดข้อมูลใหม่", "error"); return; }
  const confirmed = await confirmAction({
    title: "ยืนยันการลบข้อมูล",
    message: `ต้องการลบผลประเมินของ ${record.employeeName} วันที่ ${formatDate(record.assessmentDate)} ใช่หรือไม่ การลบนี้ไม่สามารถเรียกคืนจากหน้าเว็บได้`,
    confirmLabel: "ลบข้อมูล",
    danger: true
  });
  if (!confirmed) return;
  const button = $("deleteRecordButton");
  button.disabled = true;
  button.innerHTML = '<span class="button-spinner danger-spinner"></span>กำลังลบ...';
  try {
    const result = await request("delete", { id: record.id, requestId: generateRequestId() });
    if (!result.ok) throw new Error(result.error || "ลบข้อมูลไม่สำเร็จ");
    state.records = state.records.filter((item) => String(item.id) !== String(record.id));
    state.historyRecords = state.historyRecords.filter((item) => String(item.id) !== String(record.id));
    state.activeRecordId = "";
    closeRecordModal();
    renderDashboard();
    renderHistory();
    showAlert("ลบข้อมูลเรียบร้อย");
  } catch (error) {
    showAlert(error.message, "error");
  } finally {
    button.disabled = false;
    button.innerHTML = '<i data-lucide="trash-2"></i>ลบข้อมูล';
    refreshIcons();
  }
}

function calculateForm() {
  const template = KPI[$("assessmentKind").value];
  let total = 0;
  let complete = true;
  template.criteria.forEach(([id, , weight]) => {
    const checked = document.querySelector(`input[name="score_${id}"]:checked`);
    if (!checked) complete = false;
    else total += Number(checked.value) / 5 * weight;
  });
  if (!complete) {
    $("scorePreview").textContent = "—";
    $("ratingPreview").textContent = "กรอกให้ครบทุกหัวข้อ";
    $("lowScoreNotice").hidden = true;
    return null;
  }
  total = Math.round(total * 10) / 10;
  $("scorePreview").textContent = total.toFixed(1);
  $("ratingPreview").textContent = ratingLabel(ratingFor(total));
  $("lowScoreNotice").hidden = total >= 70;
  return total;
}

function renderEvaluationForm() {
  const template = KPI[$("assessmentKind").value];
  $("criteriaFormTitle").textContent = `เกณฑ์ประเมิน ${template.role}`;
  $("criteriaFormHelp").textContent = "ให้คะแนนครบทุกหัวข้อจากผลงานและหลักฐานของวันที่เลือก";
  $("criteriaForm").innerHTML = template.criteria.map(([id, title, weight, evidence]) => `<div class="criterion-row"><div><div class="criterion-title">${escapeHtml(title)}</div><div class="criterion-meta"><span class="weight">${weight}%</span>${escapeHtml(evidence)}</div></div><div class="score-options">${[1, 2, 3, 4, 5].map((score) => `<div><input id="${id}_${score}" type="radio" name="score_${id}" value="${score}" required><label for="${id}_${score}"><strong>${score}</strong><small>${score === 1 ? "ต่ำ" : score === 3 ? "ตามเกณฑ์" : score === 5 ? "ยอดเยี่ยม" : ""}</small></label></div>`).join("")}</div></div>`).join("");
  document.querySelectorAll("#criteriaForm input").forEach((element) => element.addEventListener("change", calculateForm));
  updateEmployeeSelect();
  calculateForm();
}

function renderCriteriaReference() {
  $("criteriaReference").innerHTML = Object.values(KPI).map((template) => `<article class="card criteria-group"><div class="card-heading"><div><span class="eyebrow">${escapeHtml(template.role)}</span><h2>${escapeHtml(template.label)}</h2><p>รวม 100% · ประเมินรายวัน</p></div></div><div class="table-wrap"><table class="criteria-table"><thead><tr><th>เกณฑ์</th><th>น้ำหนัก</th><th>หลักฐานตัวอย่าง</th></tr></thead><tbody>${template.criteria.map(([, name, weight, evidence]) => `<tr><td>${escapeHtml(name)}</td><td><span class="weight">${weight}%</span></td><td>${escapeHtml(evidence)}</td></tr>`).join("")}</tbody></table></div></article>`).join("");
  $("scoreGuide").innerHTML = SCORE_GUIDE.map(([score, name, description]) => `<div class="guide-row"><span class="guide-score">${score}</span><strong>${name}</strong><span>${description}</span></div>`).join("");
}

function collectScores() {
  const template = KPI[$("assessmentKind").value];
  const scores = {};
  for (const [id] of template.criteria) {
    const input = document.querySelector(`input[name="score_${id}"]:checked`);
    if (!input) throw new Error("กรุณากรอกคะแนนให้ครบทุกหัวข้อ");
    scores[id] = Number(input.value);
  }
  return scores;
}

async function submitEvaluation(event) {
  event.preventDefault();
  const button = $("submitButton");
  try {
    if (!$("evaluationForm").checkValidity()) { $("evaluationForm").reportValidity(); return; }
    const isEditing = Boolean(state.editingRecordId);
    const formData = {
      id: isEditing ? state.editingRecordId : undefined,
      assessmentKind: $("assessmentKind").value,
      assessmentDate: $("assessmentDate").value,
      employeeName: $("employeeName").value.trim(),
      evaluatorName: "ไม่ระบุผู้ประเมิน",
      scores: collectScores(),
      evidence: $("evidence").value.trim()
    };
    if (isEditing) {
      const confirmed = await confirmAction({
        title: "ยืนยันการแก้ไขข้อมูล",
        message: "ข้อมูลใหม่จะบันทึกทับรายการเดิม กรุณาตรวจสอบวันที่ คะแนน และหลักฐานให้ถูกต้องก่อนดำเนินการต่อ",
        confirmLabel: "บันทึกการแก้ไข"
      });
      if (!confirmed) return;
    }
    const action = isEditing ? "update" : "create";
    const mutationKey = JSON.stringify({ action, ...formData });
    const requestId = state.pendingMutation?.key === mutationKey ? state.pendingMutation.requestId : generateRequestId();
    state.pendingMutation = { key: mutationKey, requestId };
    const payload = { requestId, ...formData };
    button.disabled = true;
    button.innerHTML = '<span class="button-spinner"></span>กำลังบันทึก...';
    const result = await request(action, payload);
    if (!result.ok) throw new Error(result.error || "บันทึกข้อมูลไม่สำเร็จ");
    state.pendingMutation = null;
    showAlert(isEditing ? "บันทึกการแก้ไขเรียบร้อย" : "บันทึกแบบประเมินเรียบร้อย");
    resetForm();
    const month = payload.assessmentDate.slice(0, 7);
    $("dashboardMonth").value = month;
    $("historyMonth").value = month;
    setPeriod("month", false);
    await loadRecords(month, false, "both");
    switchView("dashboard");
  } catch (error) {
    showAlert(error.message, "error");
  } finally {
    button.disabled = false;
    updateEditMode();
  }
}

function resetForm() {
  const kind = $("assessmentKind").value || "assistant_daily";
  state.editingRecordId = "";
  state.pendingMutation = null;
  $("evaluationForm").reset();
  $("assessmentKind").value = kind;
  $("assessmentDate").value = localDate;
  renderEvaluationForm();
  updateEditMode();
}

function readTeam() {
  try {
    const stored = JSON.parse(localStorage.getItem(TEAM_STORAGE_KEY) || "{}");
    state.team = { manager: String(stored.manager || ""), assistant: String(stored.assistant || "") };
  } catch (_) {
    state.team = { manager: "", assistant: "" };
  }
  updateTeamStatus();
}

function updateTeamStatus() {
  const count = [state.team.manager, state.team.assistant].filter(Boolean).length;
  $("teamStatus").textContent = count === 2 ? "บันทึกครบ 2 ตำแหน่ง" : count === 1 ? "บันทึกแล้ว 1 ตำแหน่ง" : "ยังไม่ได้บันทึกชื่อ";
}

function updateEmployeeSelect() {
  const select = $("employeeName");
  const kind = $("assessmentKind").value;
  const name = kind === "manager_monthly" ? state.team.manager : state.team.assistant;
  const role = KPI[kind].role;
  select.innerHTML = name ? `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>` : `<option value="">กรุณาบันทึกชื่อ ${escapeHtml(role)}</option>`;
}

function openTeamModal() {
  $("managerName").value = state.team.manager;
  $("assistantName").value = state.team.assistant;
  $("teamModal").hidden = false;
  document.body.classList.add("modal-open");
  setTimeout(() => $("managerName").focus(), 40);
}

function closeTeamModal() {
  $("teamModal").hidden = true;
  document.body.classList.remove("modal-open");
}

function saveTeam(event) {
  event.preventDefault();
  state.team = { manager: $("managerName").value.trim(), assistant: $("assistantName").value.trim() };
  try { localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(state.team)); }
  catch (_) { showAlert("อุปกรณ์นี้ไม่อนุญาตให้จดจำรายชื่อ", "error"); return; }
  updateTeamStatus();
  updateEmployeeSelect();
  closeTeamModal();
  showAlert("บันทึกรายชื่อผู้จัดการแล้ว");
}

function closeSidebar() {
  document.querySelector(".sidebar").classList.remove("open");
  $("mobileOverlay").classList.remove("open");
}

function init() {
  $("dashboardMonth").value = currentMonth;
  $("dashboardYear").innerHTML = Array.from({ length: 7 }, (_, index) => Number(currentYear) + 1 - index).map((year) => `<option value="${year}">ค.ศ. ${year}</option>`).join("");
  $("dashboardYear").value = currentYear;
  $("historyMonth").value = currentMonth;
  $("assessmentDate").value = localDate;
  $("assessmentKind").innerHTML = Object.entries(KPI).map(([key, value]) => `<option value="${key}">${escapeHtml(value.label)}</option>`).join("");
  readTeam();
  document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.view)));
  document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => switchView(button.dataset.go)));
  $("assessmentKind").addEventListener("change", renderEvaluationForm);
  $("evaluationForm").addEventListener("submit", submitEvaluation);
  $("resetForm").addEventListener("click", resetForm);
  $("cancelEditMode").addEventListener("click", cancelEditMode);
  document.querySelectorAll(".period-button").forEach((button) => button.addEventListener("click", () => setPeriod(button.dataset.period)));
  $("refreshButton").addEventListener("click", () => refreshDashboard(true));
  $("exportButton").addEventListener("click", exportPeriodSummary);
  $("dashboardMonth").addEventListener("change", (event) => { $("historyMonth").value = event.target.value; loadRecords(event.target.value, false, "dashboard"); });
  $("dashboardYear").addEventListener("change", (event) => loadYearRecords(event.target.value));
  $("historyMonth").addEventListener("change", (event) => loadRecords(event.target.value, false, "history"));
  $("trendChart").addEventListener("click", (event) => {
    const point = event.target.closest("[data-month]");
    if (!point) return;
    $("dashboardMonth").value = point.dataset.month;
    $("historyMonth").value = point.dataset.month;
    setPeriod("month", false);
    loadRecords(point.dataset.month, false, "dashboard");
  });
  $("menuButton").addEventListener("click", () => { document.querySelector(".sidebar").classList.add("open"); $("mobileOverlay").classList.add("open"); });
  $("mobileOverlay").addEventListener("click", closeSidebar);
  $("openTeamSettings").addEventListener("click", openTeamModal);
  $("closeTeamSettings").addEventListener("click", closeTeamModal);
  $("cancelTeamSettings").addEventListener("click", closeTeamModal);
  $("teamForm").addEventListener("submit", saveTeam);
  $("teamModal").addEventListener("click", (event) => { if (event.target === $("teamModal")) closeTeamModal(); });
  document.addEventListener("click", (event) => { const button = event.target.closest("[data-record-id]"); if (button) openRecordModal(button.dataset.recordId); });
  $("closeRecordModal").addEventListener("click", closeRecordModal);
  $("dismissRecordModal").addEventListener("click", closeRecordModal);
  $("editRecordButton").addEventListener("click", beginEditRecord);
  $("deleteRecordButton").addEventListener("click", deleteRecord);
  $("recordModal").addEventListener("click", (event) => { if (event.target === $("recordModal")) closeRecordModal(); });
  $("cancelConfirm").addEventListener("click", () => closeConfirmModal(false));
  $("acceptConfirm").addEventListener("click", () => closeConfirmModal(true));
  $("confirmModal").addEventListener("click", (event) => { if (event.target === $("confirmModal")) closeConfirmModal(false); });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!$("confirmModal").hidden) closeConfirmModal(false);
    else if (!$("recordModal").hidden) closeRecordModal();
    else if (!$("teamModal").hidden) closeTeamModal();
  });
  renderEvaluationForm();
  renderCriteriaReference();
  setPeriod("month", false);
  refreshIcons();
  if (apiUrl()) loadRecords(currentMonth);
  else { setConnection("offline", "รอตั้งค่า Google Apps Script"); renderDashboard(); renderHistory(); }
}

document.addEventListener("DOMContentLoaded", init);
