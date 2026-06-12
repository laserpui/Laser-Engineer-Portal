// Laser Engineer System Dashboard Configuration
window.DASHBOARD_CONFIG = {
  systemName: "Laser Engineer Portal",
  logoPath: "Laser Engineer_Logo_PNG-01.png",
  categories: [
    {
      id: "calculator",
      name: "เครื่องมือคำนวณ & ออกแบบ",
      icon: "calculator",
      color: "from-blue-500 to-cyan-500",
      bgClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300"
    },
    {
      id: "inventory",
      name: "รายการอะไหล่ & ผลิตภัณฑ์",
      icon: "package",
      color: "from-emerald-500 to-teal-500",
      bgClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    },
    {
      id: "reports",
      name: "บันทึกรายงานต่างๆ",
      icon: "file-text",
      color: "from-purple-500 to-indigo-500",
      bgClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300"
    }
  ],
  apps: [
    {
      id: "elec-calc",
      name: "ElectroOptic Dual Calculator",
      category: "calculator",
      path: "Electrical Calculator/index.html",
      icon: "zap",
      description: "เครื่องคำนวณไฟฟ้าและพลังงานเลเซอร์ระดับมืออาชีพ รองรับ Ohm's Law, Power Factor และ Laser Fluence",
      frequent: true
    },
    {
      id: "spare-parts",
      name: "Spare Part List",
      category: "inventory",
      path: "Spare Part List/Spare Part List.html",
      icon: "settings",
      description: "ดึงข้อมูลอะไหล่แบบ Real-time จาก Google Sheets สำหรับทีมช่างเลเซอร์",
      frequent: true
    },
    {
      id: "product-info",
      name: "ข้อมูลผลิตภัณฑ์",
      category: "inventory",
      path: "ข้อมูลผลิตภัณฑ์/ข้อมูลผลิตภัณฑ์.html",
      icon: "info",
      description: "รายละเอียดข้อมูลผลิตภัณฑ์ สเปค และเอกสารแนะนำสินค้าเลเซอร์",
      frequent: false
    },
    {
      id: "debtor-service",
      name: "รายการลูกหนี้ Service",
      category: "reports",
      path: "บันทึกรายงานต่างๆ/รายการลูกหนี้ Service/index.html",
      icon: "users",
      description: "ระบบบันทึกและดึงข้อมูลรายการลูกหนี้ Service แบบ Real-time จาก Google Sheets",
      frequent: true
    },
    {
      id: "debtor-admin",
      name: "จัดการลูกหนี้ Service (Admin)",
      category: "reports",
      path: "บันทึกรายงานต่างๆ/รายการลูกหนี้ Service/admin.html",
      icon: "user-check",
      description: "เครื่องมือจัดการและอนุมัติรายงานลูกหนี้ Service สำหรับผู้ดูแลระบบ",
      frequent: false
    },
    {
      id: "expense-service",
      name: "รายงาน คชจ. Service",
      category: "reports",
      path: "บันทึกรายงานต่างๆ/รายงาน คชจ. Service/index.html",
      icon: "wallet",
      description: "ระบบบันทึกค่าใช้จ่ายและแดชบอร์ดสรุปรายจ่ายสำหรับทีม Service Engineer",
      frequent: true
    },
    {
      "id": "holiday-work",
      "name": "รายงานทำงานวันหยุด",
      "category": "reports",
      "path": "บันทึกรายงานต่างๆ/รายงานทำงานวันหยุด/index.html",
      "icon": "calendar",
      "description": "ระบบบันทึกรายงานการทำงานนอกเวลาและวันหยุดสำหรับทีมวิศวกรเลเซอร์",
      "frequent": false
    },
    {
      "id": "provincial-trip",
      "name": "ระบบบันทึกเวรทริปต่างจังหวัด",
      "category": "reports",
      "path": "บันทึกรายงานต่างๆ/เวรทริปต่างจังหวัด/index.html",
      "icon": "calendar",
      "description": "ระบบบันทึกการเดินทางต่างจังหวัดและจัดตารางเวรหมุนเวียนคิวพนักงานอัตโนมัติ สำหรับทีม Laser Engineer",
      "frequent": true
    },
    {
      "id": "provincial-trip-admin",
      "name": "จัดการเวรทริปต่างจังหวัด (Admin)",
      "category": "reports",
      "path": "บันทึกรายงานต่างๆ/เวรทริปต่างจังหวัด/admin.html",
      "icon": "user-check",
      "description": "ระบบจัดการลำดับคิวและบันทึกเวรเดินทางต่างจังหวัดสำหรับผู้ดูแลระบบ",
      "frequent": false
    }
  ]
};
