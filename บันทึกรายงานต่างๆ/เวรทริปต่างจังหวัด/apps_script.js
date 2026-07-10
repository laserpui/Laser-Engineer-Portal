/**
 * Google Apps Script for Out-of-Province Trip Duty Management
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code in the editor and paste this code.
 * 4. Click Save (disk icon).
 * 5. Click "Deploy" > "New deployment".
 * 6. Select "Web app" as the type.
 * 7. Set:
 *    - Description: Out-of-Province Trip Duty API
 *    - Execute as: Me (your-email@gmail.com)
 *    - Who has access: Anyone
 * 8. Click "Deploy", authorize permissions, and copy the Web App URL.
 */

// Default employee list
const DEFAULT_EMPLOYEES = [
  "กษิเดช",
  "กันต์ศักดิ์",
  "ชาติชาย",
  "ณัฐพงษ์",
  "ธนบูรณ์",
  "ประวิทย์",
  "พงษ์ศักดิ์",
  "สมชาย",
  "อภิลักษณ์",
  "เอกเลิศ"
];

// Sheet names
const SHEET_TRIPS = "Trips";
const SHEET_QUEUE = "Queue";

// Initialize spreadsheet sheets if they don't exist
function initSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Trips Sheet
  let tripsSheet = ss.getSheetByName(SHEET_TRIPS);
  if (!tripsSheet) {
    tripsSheet = ss.insertSheet(SHEET_TRIPS);
    tripsSheet.appendRow(["Timestamp", "Departure Date", "Return Date", "Employee Name", "Work Details", "Original Queue Index"]);
    // Format header
    tripsSheet.getRange("A1:F1").setFontWeight("bold").setBackground("#f3f4f6");
    tripsSheet.setFrozenRows(1);
  } else {
    ensureTripsMetadataColumns(tripsSheet);
  }

  // 2. Setup Queue Sheet
  let queueSheet = ss.getSheetByName(SHEET_QUEUE);
  if (!queueSheet) {
    queueSheet = ss.insertSheet(SHEET_QUEUE);
    queueSheet.appendRow(["Employee Name", "Queue Order"]);
    queueSheet.getRange("A1:B1").setFontWeight("bold").setBackground("#f3f4f6");
    queueSheet.setFrozenRows(1);
    
    // Populate default employees
    DEFAULT_EMPLOYEES.forEach((name, index) => {
      queueSheet.appendRow([name, index + 1]);
    });
  }
  
  return { tripsSheet, queueSheet };
}

// Helper to create CORS-compliant JSON response
function jsonResponse(data, e) {
  const JSONString = JSON.stringify(data);
  if (e && e.parameter && e.parameter.callback) {
    return ContentService.createTextOutput(e.parameter.callback + '(' + JSONString + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSONString)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle GET Requests: Fetch current queue and trip records
 */
function doGet(e) {
  try {
    // Check if proxy CSV request
    if (e && e.parameter && e.parameter.action === 'fetchCsv') {
      const csvUrl = e.parameter.url;
      const response = UrlFetchApp.fetch(csvUrl);
      return jsonResponse({ success: true, status: "success", content: response.getContentText() }, e);
    }

    const { tripsSheet, queueSheet } = initSpreadsheet();
    
    // Get Queue Data
    const queueData = queueSheet.getDataRange().getValues();
    const queue = [];
    // Skip header row
    for (let i = 1; i < queueData.length; i++) {
      if (queueData[i][0]) {
        queue.push({
          name: queueData[i][0].toString().trim(),
          order: Number(queueData[i][1])
        });
      }
    }
    // Sort by order ascending
    queue.sort((a, b) => a.order - b.order);

    // Get Trip Logs Data
    const tripsData = tripsSheet.getDataRange().getValues();
    const trips = [];
    // Skip header row, read backwards to get newest first
    for (let i = tripsData.length - 1; i >= 1; i--) {
      if (tripsData[i][0]) {
        trips.push({
          rowNumber: i + 1,
          timestamp: tripsData[i][0],
          startDate: tripsData[i][1],
          endDate: tripsData[i][2],
          employeeName: tripsData[i][3].toString().trim(),
          details: tripsData[i][4],
          originalQueueIndex: normalizeQueueIndex(tripsData[i][5])
        });
      }
    }

    return jsonResponse({
      success: true,
      queue: queue.map(q => q.name),
      trips: trips
    }, e);
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() }, e);
  }
}

/**
 * Handle POST Requests: Write trip and update/rotate queue
 */
function doPost(e) {
  try {
    const { tripsSheet, queueSheet } = initSpreadsheet();
    
    // Parse request body
    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (err) {
      // Fallback to parameters if raw body parsing fails
      requestData = e.parameter;
    }
    
    const action = requestData.action;

    if (action === "addTrip") {
      const { startDate, endDate, employeeName, details, rotateQueue } = requestData;
      
      if (!startDate || !endDate || !employeeName || !details) {
        return jsonResponse({ success: false, error: "Missing required fields" });
      }

      // 1. Capture queue position before saving and rotating
      let currentQueue = getQueueList(queueSheet);
      const nameToRotate = employeeName.trim();
      const originalQueueIndex = currentQueue.indexOf(nameToRotate);

      // 2. Add record to Trips sheet
      const timestamp = new Date();
      tripsSheet.appendRow([timestamp, startDate, endDate, employeeName.trim(), details.trim(), originalQueueIndex >= 0 ? originalQueueIndex : ""]);
      
      if (rotateQueue && currentQueue.includes(nameToRotate)) {
        // Move the selected person to the back of the queue
        currentQueue = currentQueue.filter(name => name !== nameToRotate);
        currentQueue.push(nameToRotate);
        
        // Save the updated queue to the sheet
        saveQueue(queueSheet, currentQueue);
      }

      return jsonResponse({
        success: true,
        message: "Trip added successfully",
        queue: currentQueue
      });

    } else if (action === "updateTrip") {
      const rowNumber = Number(requestData.rowNumber);
      const startDate = requestData.startDate;
      const endDate = requestData.endDate;
      const employeeName = requestData.employeeName ? requestData.employeeName.toString().trim() : "";
      const details = requestData.details ? requestData.details.toString().trim() : "";
      const originalEmployeeName = requestData.originalEmployeeName ? requestData.originalEmployeeName.toString().trim() : "";

      if (!rowNumber || rowNumber < 2 || !startDate || !endDate || !employeeName || !details) {
        return jsonResponse({ success: false, error: "Missing required fields for trip update" });
      }
      if (rowNumber > tripsSheet.getLastRow()) {
        return jsonResponse({ success: false, error: "Trip row not found" });
      }

      const existingRow = tripsSheet.getRange(rowNumber, 1, 1, 6).getValues()[0];
      const previousEmployeeName = originalEmployeeName || (existingRow[3] ? existingRow[3].toString().trim() : "");
      const originalQueueIndex = normalizeQueueIndex(existingRow[5]);
      tripsSheet.getRange(rowNumber, 2, 1, 4).setValues([[startDate, endDate, employeeName, details]]);

      let currentQueue = getQueueList(queueSheet);
      if (previousEmployeeName && previousEmployeeName !== employeeName) {
        currentQueue = reconcileQueueAfterTripEmployeeEdit(currentQueue, previousEmployeeName, employeeName, originalQueueIndex);
        saveQueue(queueSheet, currentQueue);
      }

      return jsonResponse({
        success: true,
        message: "Trip updated successfully",
        queue: currentQueue
      });

    } else if (action === "updateQueue") {
      const newQueue = requestData.queue;
      if (!newQueue || !Array.isArray(newQueue)) {
        return jsonResponse({ success: false, error: "Invalid queue data" });
      }
      
      saveQueue(queueSheet, newQueue);
      
      return jsonResponse({
        success: true,
        message: "Queue updated successfully",
        queue: newQueue
      });

    } else if (action === "initializeQueue") {
      const employees = requestData.employees || DEFAULT_EMPLOYEES;
      saveQueue(queueSheet, employees);
      
      return jsonResponse({
        success: true,
        message: "Queue initialized successfully",
        queue: employees
      });

    } else {
      return jsonResponse({ success: false, error: "Unknown action: " + action });
    }

  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

function ensureTripsMetadataColumns(tripsSheet) {
  if (tripsSheet.getMaxColumns() < 6) {
    tripsSheet.insertColumnsAfter(tripsSheet.getMaxColumns(), 6 - tripsSheet.getMaxColumns());
  }
  if (!tripsSheet.getRange(1, 6).getValue()) {
    tripsSheet.getRange(1, 6).setValue("Original Queue Index");
  }
  tripsSheet.getRange("A1:F1").setFontWeight("bold").setBackground("#f3f4f6");
}

function normalizeQueueIndex(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? Math.floor(num) : null;
}

// Helper: Get queue as simple array of names in order (with deduplication)
function getQueueList(queueSheet) {
  const data = queueSheet.getDataRange().getValues();
  const queue = [];
  const seen = new Set();
  for (let i = 1; i < data.length; i++) {
    const name = data[i][0] ? data[i][0].toString().trim() : "";
    if (name && !seen.has(name)) {
      seen.add(name);
      queue.push({
        name: name,
        order: Number(data[i][1]) || i
      });
    }
  }
  queue.sort((a, b) => a.order - b.order);
  return queue.map(q => q.name);
}

// Helper: restore the previous engineer to their original queue slot and move the new one to the back
function reconcileQueueAfterTripEmployeeEdit(queueArray, oldName, newName, originalQueueIndex) {
  const oldEmployee = oldName ? oldName.toString().trim() : "";
  const newEmployee = newName ? newName.toString().trim() : "";
  const queue = queueArray.filter(name => name !== oldEmployee && name !== newEmployee);

  if (oldEmployee && oldEmployee !== newEmployee) {
    const restoreIndex = getRestoreQueueIndex(queue, oldEmployee, originalQueueIndex);
    queue.splice(restoreIndex, 0, oldEmployee);
  }
  if (newEmployee) {
    queue.push(newEmployee);
  }

  return queue.filter((name, index, arr) => name && arr.indexOf(name) === index);
}

function getRestoreQueueIndex(queue, employeeName, originalQueueIndex) {
  if (originalQueueIndex !== null && originalQueueIndex !== undefined) {
    return Math.max(0, Math.min(Number(originalQueueIndex), queue.length));
  }

  const employeeDefaultIndex = DEFAULT_EMPLOYEES.indexOf(employeeName);
  if (employeeDefaultIndex >= 0) {
    const nextDefaultIndex = queue.findIndex(name => {
      const defaultIndex = DEFAULT_EMPLOYEES.indexOf(name);
      return defaultIndex >= 0 && defaultIndex > employeeDefaultIndex;
    });
    if (nextDefaultIndex >= 0) return nextDefaultIndex;
  }

  return 0;
}

// Helper: Save queue array to sheet (deduplicated & atomic setValues)
function saveQueue(queueSheet, queueArray) {
  // 1. Deduplicate
  const uniqueQueue = [];
  queueArray.forEach(name => {
    const trimmed = name ? name.toString().trim() : "";
    if (trimmed && !uniqueQueue.includes(trimmed)) {
      uniqueQueue.push(trimmed);
    }
  });

  // 2. Clear all rows below header (Columns A and B)
  const maxRows = queueSheet.getMaxRows();
  if (maxRows > 1) {
    queueSheet.getRange(2, 1, maxRows - 1, 2).clearContent();
  }

  // 3. Write new queue atomically
  if (uniqueQueue.length > 0) {
    const values = uniqueQueue.map((name, index) => [name, index + 1]);
    queueSheet.getRange(2, 1, values.length, 2).setValues(values);
  }
}
