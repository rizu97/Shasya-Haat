import { Product } from './types';

export const COLORS = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#FF9800',
  secondary: '#4CAF50', // Green for Add/Stock
  accent: '#FF5722',   // Orange for Sell
  error: '#CF6679',
  success: '#4CAF50',
  warning: '#FFC107',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
};

export const TRANSLATIONS = {
  appName: { en: 'KiranaKlick', bn: 'কিরানাক্লিক' },
  welcome: { en: 'Welcome Back', bn: 'স্বাগতম' },
  welcomeOwner: { en: 'Welcome back, Owner', bn: 'স্বাগতম, মালিক' },
  accessDashboard: { en: 'Access your shop dashboard', bn: 'আপনার দোকানের ড্যাশবোর্ড দেখুন' },
  registerNewShop: { en: 'Register a new shop', bn: 'নতুন দোকান নিবন্ধন করুন' },
  signUp: { en: 'Sign Up', bn: 'সাইন আপ করুন' },
  logInAction: { en: 'Log In', bn: 'লগ ইন করুন' },
  support: { en: 'Support', bn: 'সহায়তা' },

  // Register Shop
  registerShop: { en: 'Register Shop', bn: 'দোকান নিবন্ধন করুন' },
  shopDetailsHint: { en: 'Enter your shop details to get started.', bn: 'শুরু করতে আপনার দোকানের বিবরণ লিখুন।' },
  shopName: { en: 'Shop Name', bn: 'দোকানের নাম' },
  shopNamePlaceholder: { en: 'e.g. Bhai Bhai Store', bn: 'যেমন: ভাই ভাই স্টোর' },
  shopAddress: { en: 'Shop Address', bn: 'দোকানের ঠিকানা' },
  shopAddressPlaceholder: { en: 'Area, City', bn: 'এলাকা, শহর' },
  continue: { en: 'Continue', bn: 'এগিয়ে যান' },
  agreeTerms: { en: 'By registering, you agree to our Terms & Privacy Policy', bn: 'নিবন্ধন করে আপনি আমাদের শর্তাবলী এবং গোপনীয়তা নীতিতে সম্মত হন' },

  // Verify Phone
  verifyPhone: { en: 'Verify Phone', bn: 'ফোন যাচাই করুন' },
  enterCodeHint: { en: 'Verify your mobile number', bn: 'আপনার মোবাইল নম্বর যাচাই করুন' }, // Updated
  didntReceive: { en: "Didn't receive code?", bn: "কোড পাননি?" },
  resendOtp: { en: 'Resend OTP', bn: 'ওটিপি আবার পাঠান' },
  submit: { en: 'SUBMIT', bn: 'জমা দিন' },

  // Login
  loginTitle: { en: 'Login', bn: 'লগ ইন করুন' },
  enterMobileSub: { en: 'Enter your registered mobile number', bn: 'আপনার নিবন্ধিত মোবাইল নম্বর লিখুন' },
  phoneNumberLabel: { en: 'Phone Number', bn: 'ফোন নম্বর' },
  sendOtp: { en: 'SEND OTP', bn: 'ওটিপি পাঠান' },
  needHelp: { en: 'Need Help?', bn: 'সাহায্য দরকার?' },
  enterOtpTitle: { en: 'Enter OTP', bn: 'ওটিপি লিখুন' },

  today: { en: 'TODAY', bn: 'আজ' },
  soldToday: { en: 'SOLD TODAY', bn: 'আজ বিক্রি' },
  stockAdded: { en: 'STOCK ADDED', bn: 'স্টক যোগ' },
  scan: { en: 'Scan Item', bn: 'আইটেম স্ক্যান' },
  dashboard: { en: 'Dashboard', bn: 'ড্যাশবোর্ড' },
  inventory: { en: 'Stock', bn: 'স্টক' },
  reports: { en: 'Reports', bn: 'রিপোর্ট' },
  settings: { en: 'Settings', bn: 'সেটিংস' },
  add: { en: 'Add', bn: 'যোগ করুন' },
  addItem: { en: 'Add Item', bn: 'নতুন আইটেম যোগ করুন' },
  searchPlaceholder: { en: 'Search items...', bn: 'পণ্য খুঁজুন...' },
  totalAddedToday: { en: 'Added Today', bn: 'আজ যোগ করা হয়েছে' },
  lowStock: { en: 'Low Stock', bn: 'কম স্টক' },
  expired: { en: 'Expiring', bn: 'মেয়াদ শেষ' },
  expiringSoon: { en: 'Expiring Soon', bn: 'শীঘ্রই মেয়াদ শেষ' },
  good: { en: 'Good', bn: 'ভালো' },
  name: { en: 'Name', bn: 'নাম' },
  productName: { en: 'Product Name', bn: 'পণ্যের নাম' },
  productNamePlaceholder: { en: 'e.g. Basmati Rice 5kg', bn: 'যেমন: বাসমতি চাল ৫ কেজি' },
  category: { en: 'Category', bn: 'বিভাগ' },
  selectCategory: { en: 'Select Category', bn: 'বিভাগ নির্বাচন করুন' },
  costPrice: { en: 'Cost Price', bn: 'কেনা দাম' },
  currentStock: { en: 'Current Stock', bn: 'বর্তমান স্টক' },
  expiryDate: { en: 'Expiry Date', bn: 'মেয়াদ শেষ হওয়ার তারিখ' },
  productPhoto: { en: 'Product Photo', bn: 'পণ্যের ছবি' },
  tapToUpload: { en: 'Tap to upload', bn: 'আপলোড করতে ট্যাপ করুন' },

  mrp: { en: 'MRP', bn: 'মূল্য' },
  expiry: { en: 'Expiry', bn: 'মেয়াদ' },
  quantity: { en: 'Qty', bn: 'পরিমাণ' },
  unit: { en: 'Unit', bn: 'একক' },
  jarLevel: { en: 'Jar Level', bn: 'জারের মাত্রা' },
  save: { en: 'Save Item', bn: 'সংরক্ষণ করুন' },
  todaySales: { en: 'Today\'s Sales', bn: 'আজকের বিক্রি' }, // Added safely
  saveItem: { en: 'Save Item', bn: 'আইটেম সংরক্ষণ করুন' },
  update: { en: 'Update Item', bn: 'আপডেট করুন' },
  cancel: { en: 'Cancel', bn: 'বাতিল' },
  packet: { en: 'Packet', bn: 'প্যাকেট' },
  loose: { en: 'Loose/Jar', bn: 'খোলা/জার' },
  analyzing: { en: 'Analyzing...', bn: 'বিশ্লেষণ করা হচ্ছে...' },
  retake: { en: 'Retake', bn: 'আবার নিন' },
  totalItems: { en: 'TOTAL ITEMS', bn: 'মোট আইটেম' },
  totalValue: { en: 'Total Value', bn: 'মোট মূল্য' },
  sell: { en: 'Sell', bn: 'বিক্রয়' },
  howMany: { en: 'How many sold?', bn: 'কত বিক্রি হয়েছে?' },
  soldAt: { en: 'Sold at', bn: 'বিক্রি হয়েছে' },
  totalSales: { en: 'Total Sales', bn: 'মোট বিক্রয়' },
  noSales: { en: 'No sales recorded for this period', bn: 'এই সময়ের জন্য কোন বিক্রয় নেই' },
  selectDate: { en: 'Select Date', bn: 'তারিখ নির্বাচন করুন' },
  thisMonth: { en: 'This Month', bn: 'এই মাস' },
  login: { en: 'Login', bn: 'লগইন' },
  added: { en: 'Added', bn: 'যোগ' },
  sold: { en: 'Sold', bn: 'বিক্রি' },
  modeAdd: { en: 'ADD MODE', bn: 'যোগ মোড' },
  modeSell: { en: 'SELL MODE', bn: 'বিক্রয় মোড' },
  dailyPulse: { en: 'Daily Pulse (AI)', bn: 'দৈনিক পালস (AI)' },
  itemNotFound: { en: 'Item not found in inventory', bn: 'পণ্যটি ইনভেন্টরিতে পাওয়া যায়নি' },
  unitPrice: { en: 'Unit Price', bn: 'একক মূল্য' },
  itemsSold: { en: 'Items Sold', bn: 'আইটেম বিক্রি' },
  itemsAdded: { en: 'Items Added', bn: 'আইটেম যোগ' },
  enterQty: { en: 'Enter Quantity', bn: 'পরিমাণ লিখুন' },
  enterPrice: { en: 'Total Sale Price', bn: 'মোট বিক্রয় মূল্য' },
  confirmSell: { en: 'Confirm Sell', bn: 'বিক্রয় নিশ্চিত করুন' },
  available: { en: 'Available', bn: 'উপলব্ধ' },
  analyzeShop: { en: 'Analyze Shop', bn: 'দোকান বিশ্লেষণ' },
  analyzingShop: { en: 'Generating Insights...', bn: 'অন্তর্দৃষ্টি তৈরি হচ্ছে...' },
  insightTitle: { en: 'Get AI insights on your sales & stock', bn: 'আপনার বিক্রয় এবং স্টকের উপর AI পরামর্শ পান' },
  analyzeNow: { en: 'Analyze Now', bn: 'এখনই বিশ্লেষণ করুন' },

  // Bulk Edit
  bulkEdit: { en: 'Bulk Edit', bn: 'বাল্ক এডিট' },
  done: { en: 'Done', bn: 'সম্পন্ন' },
  selectAll: { en: 'Select All', bn: 'সব নির্বাচন' },
  itemsSelected: { en: 'Items Selected', bn: 'টি আইটেম নির্বাচিত' },
  addStock: { en: 'Add Stock', bn: 'স্টক যোগ' },
  setExpiry: { en: 'Set Expiry', bn: 'মেয়াদ সেট' },
  apply: { en: 'Apply', bn: 'প্রয়োগ' },
  qtyToAdd: { en: 'Quantity to Add', bn: 'যোগ করার পরিমাণ' },
  newExpiry: { en: 'New Expiry Date', bn: 'নতুন মেয়াদের তারিখ' },

  // Report Filters
  allTransactions: { en: 'All Transactions', bn: 'সব লেনদেন' },
  salesOnly: { en: 'Sales Only', bn: 'শুধুমাত্র বিক্রয়' },
  stockAdds: { en: 'Stock Adds', bn: 'স্টক যোগ' },
  viewDay: { en: 'Day View', bn: 'দিন হিসেবে' },
  viewWeek: { en: 'Week View', bn: 'সপ্তাহ হিসেবে' },
  viewMonth: { en: 'Month View', bn: 'মাস হিসেবে' },

  // Image Source
  choosePhoto: { en: 'Choose Photo', bn: 'ছবি নির্বাচন করুন' },
  camera: { en: 'Camera', bn: 'ক্যামেরা' },
  gallery: { en: 'Gallery', bn: 'গ্যালারি' },

  // Transaction Details
  transDetails: { en: 'Transaction Details', bn: 'লেনদেনের বিবরণ' },
  totalCost: { en: 'Total Cost', bn: 'মোট খরচ' },

  // Dashboard
  topSelling: { en: 'Top Selling Today', bn: 'আজকের সেরা বিক্রি' },
  noSalesToday: { en: 'No sales yet today', bn: 'আজ এখনও কোন বিক্রি নেই' },

  // Inventory Filter
  allItems: { en: 'All Items', bn: 'সব আইটেম' },
  outOfStock: { en: 'Out of Stock', bn: 'স্টক শেষ' },

  // Scanner & Offline
  offlineMode: { en: 'Offline Mode', bn: 'অফলাইন মোড' },
  offlineMessage: { en: 'No internet. Manual entry enabled.', bn: 'ইন্টারনেট নেই। ম্যানুয়াল এন্ট্রি চালু।' },
  confidenceLow: { en: 'Low Confidence', bn: 'কম আস্থা' },
  confidenceMessage: { en: 'AI is unsure. Please verify details.', bn: 'AI নিশ্চিত নয়। বিবরণ যাচাই করুন।' },
  confirm: { en: 'Confirm', bn: 'নিশ্চিত করুন' },
  syncRestored: { en: 'Connectivity restored. Data synced.', bn: 'সংযোগ পুনরুদ্ধার হয়েছে। ডেটা সিঙ্ক হয়েছে।' },
  identifying: { en: 'Identifying...', bn: 'শনাক্ত করা হচ্ছে...' },

  // Settings Translations
  managePrefs: { en: 'Manage your preferences', bn: 'আপনার পছন্দগুলি পরিচালনা করুন' },
  storeProfile: { en: 'Store Profile', bn: 'দোকান প্রোফাইল' },
  ownerName: { en: 'Owner Name', bn: 'মালিকের নাম' },
  alertThresholds: { en: 'Alert Thresholds', bn: 'সতর্কতা সীমা' },
  lowStockAlert: { en: 'Low Stock Alert Level', bn: 'কম স্টক সতর্কতা স্তর' },
  nearExpiryAlert: { en: 'Near Expiry Alert (Days)', bn: 'মেয়াদ শেষের সতর্কতা (দিন)' },
  preferences: { en: 'Preferences', bn: 'পছন্দসমূহ' },
  appLanguage: { en: 'App Language', bn: 'অ্যাপের ভাষা' },
  darkMode: { en: 'Dark Mode', bn: 'ডার্ক মোড' },
  dataManagement: { en: 'Data Management', bn: 'ডেটা ব্যবস্থাপনা' },
  exportCsv: { en: 'Export as CSV', bn: 'CSV হিসেবে এক্সপোর্ট করুন' },
  downloadReport: { en: 'Download sales report', bn: 'বিক্রয় রিপোর্ট ডাউনলোড করুন' },

  // Delete Confirmation
  deleteItem: { en: 'Delete Item', bn: 'আইটেম মুছুন' },
  confirmDelete: { en: 'Are you sure you want to delete this item?', bn: 'আপনি কি এই আইটেমটি মুছতে চান?' },
  deleteWarning: { en: 'This action cannot be undone.', bn: 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।' },
  delete: { en: 'Delete', bn: 'মুছুন' },

  // Trade / POS
  trade: { en: 'Trade', bn: 'ব্যবসা' },
  quickScanSell: { en: 'Quick Scan to Sell', bn: 'দ্রুত স্ক্যান করে বিক্রি করুন' },
  currentCart: { en: 'Current Cart', bn: 'বর্তমান কার্ট' },
  clearAll: { en: 'Clear All', bn: 'সব মুছুন' },
  totalPayable: { en: 'TOTAL PAYABLE', bn: 'মোট দেয় পরিমাণ' },
  confirmSale: { en: 'Confirm Sale', bn: 'বিক্রি নিশ্চিত করুন' },
  customers: { en: 'Customers', bn: 'ক্রেতা' },
  more: { en: 'More', bn: 'আরও' },
  itemSearch: { en: 'Search items...', bn: 'আইটেম খুঁজুন...' },
  cartEmpty: { en: 'Cart is empty', bn: 'কার্ট খালি' },
  posSubtitle: { en: 'KiranaKlick POS', bn: 'কিরানাক্লিক POS' },

  // More Page
  morePage: { en: 'More', bn: 'আরও' },
  manageProfile: { en: 'Manage profile, settings & account', bn: 'প্রোফাইল, সেটিংস ও অ্যাকাউন্ট পরিচালনা' },
  general: { en: 'General', bn: 'সাধারণ' },
  helpSupport: { en: 'Help & Support', bn: 'সাহায্য ও সহায়তা' },
  account: { en: 'Account', bn: 'অ্যাকাউন্ট' },
  logOut: { en: 'Log Out', bn: 'লগ আউট' },

  // Quick Actions
  scanToSell: { en: 'Scan to Sell', bn: 'স্ক্যান করে বিক্রি করুন' },
  scanToSellSub: { en: 'Quick scan products for billing', bn: 'দ্রুত বিলিংয়ের জন্য পণ্য স্ক্যান করুন' },
  addStockAction: { en: 'Add Stock', bn: 'স্টক যোগ করুন' },
  addStockSub: { en: 'Add new items to inventory', bn: 'ইনভেন্টরিতে নতুন আইটেম যোগ করুন' },
  lowStockAction: { en: 'Low Stock', bn: 'কম স্টক' },
  lowStockSub: { en: 'View items running low', bn: 'কম স্টকের আইটেম দেখুন' },
  quickActions: { en: 'Quick Actions', bn: 'দ্রুত কাজ' },
  ownerDashboard: { en: 'Owner Dashboard', bn: 'মালিক ড্যাশবোর্ড' },

  // Inventory Filters
  expiredFilter: { en: 'Expired', bn: 'মেয়াদ শেষ' },

  // Notifications
  notifications: { en: 'Notifications', bn: 'বিজ্ঞপ্তি' },
  noNotifications: { en: 'No new notifications', bn: 'কোনো নতুন বিজ্ঞপ্তি নেই' },

  // Export
  exportSuccess: { en: 'CSV downloaded successfully!', bn: 'CSV সফলভাবে ডাউনলোড হয়েছে!' },
  noDataExport: { en: 'No data to export', bn: 'এক্সপোর্ট করার জন্য কোনো ডেটা নেই' },
};

// Mock local database for hybrid search
export const MOCK_DB: Partial<Product>[] = [
  { name: 'Maggi Noodles', nameBn: 'ম্যাগি নুডলস', mrp: 14, category: 'packet', unit: 'pcs' },
  { name: 'Tata Salt', nameBn: 'টাটা লবণ', mrp: 28, category: 'packet', unit: 'kg' },
  { name: 'Red Label Tea', nameBn: 'রেড লেবেল চা', mrp: 150, category: 'packet', unit: 'g' },
  { name: 'Basmati Rice', nameBn: 'বাসমতি চাল', category: 'loose', fillLevel: 100, unit: 'kg' },
  { name: 'Moong Dal', nameBn: 'মুগ ডাল', category: 'loose', fillLevel: 100, unit: 'kg' },
  { name: 'Sugar', nameBn: 'চিনি', category: 'loose', fillLevel: 100, unit: 'kg' },
  { name: 'Amul Butter', nameBn: 'আমুল মাখন', mrp: 56, category: 'packet', unit: 'g' },
  { name: 'Oreo Biscuits', nameBn: 'ওরিও বিস্কুট', mrp: 35, category: 'packet', unit: 'pcs' },
  { name: 'Mustard Oil', nameBn: 'সরিষার তেল', mrp: 180, category: 'packet', unit: 'l' },
];