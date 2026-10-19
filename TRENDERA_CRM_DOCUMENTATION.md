# Trendera CRM - Mukammal System Documentation (Roman Punjabi)

Eh document Trendera Dry Cleaning & Laundry CRM di mukammal technical ate operational documentation hai. Is vich pure system da architectural structure, order lifecycle (order banan ton leke delivery tak), screens, buttons, files, APIs, database storage, ate security permissions bare vistaar naal samjhaya gaya hai.

---

## 1. System Overview ate Architecture

Trendera CRM ik full-stack modern Dry Cleaning & Laundry Management application hai.
- **Frontend Stack**: React 19 SPA (Single Page Application) with Vite, Tailwind CSS, TypeScript, ate Lucide React icons.
- **Backend Stack**: Node.js Express server (`server.ts`) jo port 3000 te chaldia hai.
- **Data Storage**: File-based persistent storage (`data_storage.json`) ate automated JSON backup system (`/backups/`).
- **Main State Management**: `src/context/AppContext.tsx` (Global context jo orders, customers, settings, notifications, ate authentication nu manage karda hai).
- **Public Portal**: Bina login ton chalne wala customer invoice portal (`/portal/invoice?Reciept=...`), jithe customer apna bill dekh sakda hai ate UPI / Razorpay naal online payment kar sakda hai.

---

## 2. Roles ate Access Permissions (Admin vs Manager)

System vich do mukh roles hunde han jo `src/types.ts` ate `server.ts` vich define kite gaye han:

### A. ADMIN Role (`usr-admin-1`, Username: `admin`)
- **Full System Access**: CRM da har ik section open kar sakda hai.
- **User Management**: Naven staff users (Managers) create karna, password reset karna, active/inactive toggle karna, ate delete karna (`src/components/admin/AdminScreen.tsx`).
- **Business Identity & Settings**: Store name, address, GSTIN, branch code (default `TE02`), UPI VPA (`smarthub.2988354@hdfcbank`), payment QR image, default due days, delivery prices setup karna (`src/components/settings/BusinessSettingsModal.tsx`).
- **Backup & Restore**: System da full database backup lena ate purane backups restore karna (`/api/backup/create`, `/api/backup/restore`).
- **Audit Logs**: Kis user ne ki change kiti, kado order delete kita ya rate badleya, sab dekhna (`src/components/reports/ReportsScreen.tsx`).

### B. MANAGER Role (`usr-manager-1`, Username: `rajesh`)
- **Daily Operations Access**: Home Desk, Customer Directory, POS Order Booking (Drop), Workshop Processing, Delivery, Accounts, te Master Data dekh sakda hai.
- **Restricted Access**: Manager Admin Screen (`activeView === 'ADMIN'`) open nahi kar sakda. Je Manager Admin screen open karan di koshish kare, taan `Access Restricted` shield warning aundi hai: *"Administrative controls, user management, and system configuration are strictly reserved for the ADMIN role."*
- **Discounts**: Manager kol discount limit admin de rules mutabik hundi hai.

---

## 3. Order Lifecycle (Kadam-dar-Kadam Safar)

Trendera CRM vich ik order banan ton leke customer tak pahunchan tak 8 mukhiya stages vichon langhda hai.

```
[DRAFT] 
   ⬇ (POS Booking te Save Order F12 click kita)
[RECEIVED] 
   ⬇ (Workshop vich kapde shift kite)
[IN_PROCESS / PROCESSING] 
   ⬇ (Washing complete, Steam Press / Finishing baki)
[PENDING_FINISHING] 
   ⬇ (Ironing & packing complete, Mark Ready kita)
[READY] (Auto WhatsApp WA-005 dispatched)
   ⬇ (Rider ya Counter Delivery)
[DELIVERED] (Auto WhatsApp WA-004 Feedback request)
   (Je kapde cancel hon taan [CANCELLED])
```

---

## 4. Screens ate Workflows di Vistaar Purvak Jankari

### Step 1: Counter Booking (POS Screen - `DropScreen.tsx`)
**Screen Name**: `DropScreen` (`activeView === 'DROP'` ya `'ORDER_CREATE'`)  
**File**: `src/components/pos/DropScreen.tsx`

1. **Customer Selection (F2 Shortcut)**:
   - Counter staff customer search box vich Mobile number ya Name type karda hai.
   - Je customer pehlan ton add hai, taan click karke select ho janda hai. Customer da address, pending balance, te adjustment balance live show hunda hai.
   - Je nava customer hai, taan `+ Quick Add Customer` button te click karke turant create kita ja sakda hai (`handleQuickCreateCustomer`).

2. **Garment & Service Selection**:
   - Screen te Category tabs han: Men, Women, Kids, Household, Shoes, Special.
   - Category de theek thalle Service toggle buttons han: **Dry Clean (DC)** ate **Steam Press (SP)**.
   - Staff garment card te click karda hai (e.g. Kurta, Blazer, Shirt).
   - Har garment card te click karan te oh cart (`items` state) vich add ho janda hai.
   - Cart vich har piece da Quantity (+ / - ya direct input), Base Price, Sub-services (Add-ons jiven Starch, Stain Removal, Minor Mending), Pressing Method (Iron Press, Steam Press, Fold Only), ate Garment Remarks (Stains, Cuts, Color fade) add kite ja sakde han.

3. **Weight Package Booking (Je kapde KG de hisaab naal hon)**:
   - Staff `orderType = 'PER_WEIGHT'` chunda hai (e.g. Laundry by KG / Wash & Steam Iron).
   - Weight (e.g. `2.5` kg) ate estimated pieces enter karke `handleAddWeightPackage` button te click karda hai.
   - Line total auto-calculate hunda hai: `Weight x RatePerKg`.

4. **Speed / Surcharge Options**:
   - **Standard**: Normal delivery (No surcharge, standard due date).
   - **Next Day (+₹200)**: Button te direct editable price hai. Click karan te Due Date agle din te set ho jandi hai.
   - **Same Day (+₹400)**: Button te direct editable price hai. Click karan te Due Date ajj di set ho jandi hai.

5. **Delivery Options Selection (Strictly Required)**:
   - System initially kisse vi delivery option nu auto-select nahi karda taaki galti na hove.
   - Staff nu heth likhe 3 options chon ik select karna painda hai:
     1. **Store Counter (`btn-delivery-counter`)**: Customer aape chhadega te aape laike jayega (Free ₹0).
     2. **Home Delivery (`btn-delivery-home`)**: Store ton customer de ghar drop (Editable delivery fee, default ₹50).
     3. **Pick & Drop (`btn-delivery-pick-drop`)**: Rider 2-way pickup ate drop (Editable fee, default ₹50).
   - Jado tak delivery option select nahi hunda, thalle wale `Create Order (F12)` te `Preview 2R Piece Tags` buttons disabled rehnde han.

6. **Due Date Calculation**:
   - Standard orders lai target date `today + defaultDueDays` (default 4 din) te set hundi hai.
   - **Thursday Holiday Rule**: Trendera store da har Thursday weekly holiday hunda hai. Je calculate kiti date Thursday aave, taan system aape agle din yaani Friday (+1 day) te shift kar dinda hai.
   - Interactive calendar widget (`ReadyDateCalendar.tsx`) raahi counter staff kisse vi din te manually click karke delivery date badal sakda hai (Thursday click karna disabled hai).

7. **Advance Payment & Round-off**:
   - Customer ne jo advance ditta (Cash, UPI, Card), oh staff `Advance Paid` input vich panda hai.
   - Balance due live calculate hunda hai: `Net Total - Advance Paid`.

8. **Order Save (F12 Shortcut ya Button)**:
   - Staff `Create Order (F12)` button dabda hai.
   - Function `handleSaveOrder()` run hunda hai.
   - Order backend te sync hunda hai (`POST /api/orders`), unique order number generate hunda hai (e.g. `#1005`), customer stats update hunde han, audit log banna hai, ate turant do actions trigger hunde han:
     1. **Auto WhatsApp Order Confirmation**: Customer de mobile te official WhatsApp message bhejia janda hai (`WA-001`).
     2. **Thermal Receipt Modal Open**: Counter print slip samne open ho jandi hai.

---

### Step 2: Piece Tag Printing (`GarmentTagPrintModal.tsx`)
**File**: `src/components/tags/GarmentTagPrintModal.tsx` & `src/utils/pieceTagUtils.ts`

- Kapde workshop bhejan ton pehlan har garment te thermal sticker tag lagaya janda hai.
- **Tag Size**: Standard 2R roll format: 1.5" x 1.12" (38mm x 28mm).
- **Tag Content**:
  - Business Name (e.g. `TRENDERA DRY CLEANING`)
  - Order Code (e.g. `TE02-9911`)
  - Client Name & Client Code (e.g. `CL-1`)
  - Piece Sequence (e.g. `1/4`, `2/4`, `3/4`, `4/4`)
  - Service Code (e.g. `DC` for Dry Clean, `SP` for Steam Press)
  - QR Code: High density scannable code jo garment tracking lai kam aunda hai.
  - **Tag Due Date Rule**:
    - **Normal Orders**: Tag te delivery date hamesha **order due date ton 1 din pehlan** show hundi hai (`Due Date - 1 day`), taaki workshop staff kapda delivery wale din ton ik din pehlan ready kar sake (e.g. Je CRM due date `23 Oct 2026` hai, taan tag te `22 Oct 2026` print hunda hai).
    - **Same Day Orders**: Tag te bina koi din ghataaye exact same day date print hundi hai (e.g. `18 Oct 2026`).

---

### Step 3: Counter Thermal Receipt (`ThermalReceiptModal.tsx`)
**File**: `src/components/receipt/ThermalReceiptModal.tsx` & `src/utils/printUtils.ts`

- **Print Format**: 80mm (3-inch) ESC/POS standard continuous thermal roll printer.
- **Receipt Structure**:
  1. Store Logo & Store Header (Trendera Cleaners, Branch Address, Phone, GSTIN).
  2. Order Number & Barcode (e.g. `*9911-2*`).
  3. Booking Date & Time ate Expected Due Date.
  4. Customer Details (Name, Masked Mobile e.g. `+91 98151*****`, Delivery Address).
  5. Detailed Garment Table: Sr No, Garment Name, Service, Pressing Method, Qty, Amount.
  6. Financial Breakdown: Gross Total, Surcharges, Delivery Charges, Discounts, Round-off, Net Payable, Advance Paid, ate Balance Due.
  7. Payment QR Code: Dynamic UPI QR code jithe scan karke customer baki bache paise transfer kar sakda hai.
  8. Store Terms & Conditions ate barcode footer.
- **Shortcuts**: `Ctrl + P` dabke thermal print window khul jandi hai.

---

### Step 4: Workshop Processing (`ProcessScreen.tsx`)
**Screen Name**: `ProcessScreen` (`activeView === 'PROCESS'`)  
**File**: `src/components/workshop/ProcessScreen.tsx`

- Workshop manager kapde receive karda hai.
- Statuses update kite ja sakde han:
  - `RECEIVED` ➡️ `PROCESSING` (Kapde wash/dry clean drum vich gaye).
  - `PROCESSING` ➡️ `PENDING_FINISHING` (Wash ho chukka hai, steam ironing baki hai).
  - `PENDING_FINISHING` ➡️ `READY` (Ironing complete, quality check pass, packing complete).
- **Mark Ready Action**:
  - Jado order `READY` mark hunda hai, CRM turant customer nu **WhatsApp Notification WA-005** bhejda hai:  
    *"Dear [Customer], Your order #[OrderNo] is now CLEAN & READY for delivery or pickup at Trendera..."*

---

### Step 5: Inspection & Price Correction Workflow (`PriceCorrectionModal.tsx`)
**File**: `src/components/workflow/PriceCorrectionModal.tsx`

- Je kapda check karde waqt workshop staff nu pata lagge ki kapde te ziddi daag han ya extra repair di lod hai:
  1. Staff price correction request submit karda hai (`pendingPriceRequests`).
  2. Store Manager / Admin kol notification badge aunda hai.
  3. Admin approve karda hai, jiss naal order amount update ho jandi hai.
  4. Customer nu automated WhatsApp message janda hai: *"Your Order has been inspected and updated by our store manager. New Amount: Rs. X..."*

---

### Step 6: Final Delivery & Balance Collection (`DeliveryScreen.tsx`)
**Screen Name**: `DeliveryScreen` (`activeView === 'DELIVERY'` ya `'PICKUP'`)  
**File**: `src/components/delivery/DeliveryScreen.tsx`

1. **Rider / Counter QR Scan**: Staff kapde de tag da QR code scan karda hai (`QRPickupScanModal.tsx`) taaki verify ho sake ki sahi kapde deliver ho rahe han.
2. **Payment Collection**:
   - Je balance due baki hai (e.g. ₹500), taan staff payment method choose karda hai (Cash, Counter UPI QR, Card, Net Banking).
   - System payment transaction record karda hai (`payments` array vich) ate balance zero kar dinda hai.
   - Customer nu **WhatsApp WA-003** payment receipt notification chali jandi hai.
3. **Digital Signature (`SignatureModal.tsx`)**:
   - Customer screen te finger ya stylus naal apna signature karda hai.
   - Signature base64 image banke order de `customerSignature` field vich store ho janda hai.
4. **Mark Delivered**:
   - Status `DELIVERED` bann janda hai.
   - Customer nu WhatsApp feedback message (`WA-004`) send hunda hai.

---

## 5. WhatsApp Messaging Engine (`notificationService.ts`)

Trendera CRM da messaging engine customer nu har step te updated rakhda hai.

### WhatsApp Triggers Summary:
| Trigger Code | Trigger Name | Purpose | Kado Trigger Hunda Hai |
| :--- | :--- | :--- | :--- |
| **WA-001** | `ORDER_CREATED` | Order confirmation & bill | POS vich order save hunde hi |
| **WA-002** | `PICKUP_SCHEDULED` | Rider pickup timing slot | Jado pickup schedule hove |
| **WA-003** | `PAYMENT_RECEIVED` | Advance ya balance payment receipt | Jado payment record hove |
| **WA-004** | `ORDER_DELIVERED_FEEDBACK` | Feedback request rating | Jado status DELIVERED hove |
| **WA-005** | `ORDER_READY` | Ready for delivery / pickup | Jado workshop READY mark kare |

### Exact WhatsApp Message Format (Order Created WA-001):
```text
Trendera

Hi Aman Singh, Your order #1005 is registered.
Amt: Rs. 520
Qty: 4 Pcs
Weight: 2.5 kg       <-- (Eh line sirf Weight-based orders lai aundi hai)
Due Date: 23 Oct 2026
Receipt: https://crm.trenderacleaners.com/portal/invoice?Reciept=TE02-1005-520-cust1-312

We will inform you in case the order is updated after in-store inspection.

Thanks,
Team Trendera

Note: Please save our number to activate the Receipt link.
```

- **Weight Display Rule**: Je order weight-based hove (`orderType === 'PER_WEIGHT'` ya `totalWeightKg > 0`), taan message vich pieces quantity de naal actual weight (e.g. `Weight: 2.5 kg`) show hunda hai. Piece count replace nahi hunda.
- **In-App WhatsApp Simulator (`WhatsAppSimulator.tsx`)**: Staff CRM de top bar ton WhatsApp simulator open karke bhejiyan gaiyan sariyan messages di history live preview dekh sakda hai.

---

## 6. Public Invoice Portal & Razorpay Integration

### A. Public Customer Portal (`PublicInvoicePortalPage.tsx`)
- Customer WhatsApp link te click karda hai:  
  `https://crm.trenderacleaners.com/portal/invoice?Reciept=TE02-1005-520-cust1-312`
- **Security Checksum**: URL vich `checksum = ((orderNumber * 37 + 101) % 900 + 100)` judeya hunda hai taaki koi hor number badal ke kisse dooje da bill na dekh sake.
- Customer nu pura bill, kapde, payment status, store details, ate UPI QR code nazar aunda hai.
- Customer direct UPI app (Google Pay, PhonePe, Paytm) raahi pay karke **12-digit UTR Reference** submit kar sakda hai (`POST /api/orders/:id/submit-upi-ref`).

### B. Razorpay Payment Gateway Integration
**Files**: `src/utils/razorpayClient.ts` & `server.ts` (Lines 760-1050)

1. **Test Mode Credentials**:
   - `server.ts` backend vich configured Key ID ate Key Secret use hunde han.
   - Secret key kadi vi frontend client nu expose nahi kiti jandi. Frontend sirf `/api/razorpay/config` ton public `keyId` mangwanda hai.
2. **Order Creation (`POST /api/razorpay/create-order`)**:
   - Customer jab portal te "Pay Online with Razorpay" click karda hai, backend Razorpay official orders API (`https://api.razorpay.com/v1/orders`) call karke order initialize karda hai.
   - Je external network block hove ya demo mode hove, taan backend graceful local test order ID (`order_test_...`) assign karda hai.
3. **Checkout Experience**:
   - Official Razorpay SDK popup load hunda hai. Je popup band ho jaave, taan CRM da built-in branded Razorpay checkout modal fallback ban janda hai.
4. **Cryptographic HMAC SHA256 Signature Verification (`POST /api/razorpay/verify-payment`)**:
   - Payment complete hon te Razorpay `razorpay_payment_id` ate `razorpay_signature` return karda hai.
   - Backend `crypto.createHmac('sha256', keySecret)` naal `razorpayOrderId|razorpayPaymentId` nu hash karke expected signature calculate karda hai.
   - Je signature match kare:
     - `order.paymentStatus = 'PAID'`
     - `order.balanceDue = 0`
     - Payment transaction record generate hunda hai.
     - Database persist hunda hai.

---

## 7. Backend API Reference (`server.ts`)

| HTTP Method | API Endpoint | Description | Role / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | User login (bcrypt password verification & cookie session) | Public |
| `GET` | `/api/auth/me` | Current session user details | Authenticated |
| `POST` | `/api/auth/logout` | Session destroy | Authenticated |
| `GET` | `/api/orders` | Sare orders di list fetch karna | Authenticated |
| `POST` | `/api/orders` | Nava order create karna ya update karna | Authenticated |
| `DELETE` | `/api/orders/:id` | Order delete karna | Authenticated |
| `POST` | `/api/orders/:id/pay` | Order di counter payment record karna | Authenticated |
| `POST` | `/api/orders/:id/submit-upi-ref` | Customer portal ton UTR reference submit karna | Public |
| `GET` | `/api/customers` | Sare customers fetch karna | Authenticated |
| `POST` | `/api/customers` | Customer add ya update karna | Authenticated |
| `GET` | `/api/settings` | Business settings & branding read karna | Public |
| `POST` | `/api/settings` | Business settings save karna | ADMIN only |
| `GET` | `/api/users` | Staff users list | ADMIN only |
| `POST` | `/api/users` | Nava staff user banana | ADMIN only |
| `PUT` | `/api/users/:id` | Staff user update karna | ADMIN only |
| `POST` | `/api/users/:id/reset-password` | Password reset karna | ADMIN only |
| `GET` | `/api/razorpay/config` | Public Razorpay Key ID | Public |
| `POST` | `/api/razorpay/create-order` | Razorpay order initiate karna | Public |
| `POST` | `/api/razorpay/verify-payment` | Backend HMAC signature verify karna | Public |
| `GET` | `/api/backup/list` | Saved JSON backups di list | Public |
| `POST` | `/api/backup/create` | Instant JSON database backup lena | Authenticated |
| `POST` | `/api/backup/restore-saved/:filename` | Purana backup restore karna | ADMIN only |
| `POST` | `/api/extract-price-list-pdf` | Gemini AI raahi PDF rate list parse karna | Public |

---

## 8. JSON Database Storage Mechanism (`data_storage.json`)

Trendera CRM database file system te `data_storage.json` file vich save rehndi hai.
File da structure heth likhe mutabik hai:

```json
{
  "orders": [ /* Sare booked orders, garments, barcode items, due dates */ ],
  "customers": [ /* Customer names, phones, addresses, outstanding balances */ ],
  "settings": { /* Store name, UPI VPA, branch code, pricing settings */ },
  "users": [ /* Admin te Managers de bcrypt password hashed profiles */ ],
  "sessions": { /* Active user login tokens with expiration timestamps */ },
  "articleUsageCounts": { /* Frequently booked garments da auto-ranking count */ }
}
```

- **Atomic Writes**: Jab vi koi order create ya update hunda hai, `saveDatabase()` function pura state JSON string banake `data_storage.json` vich synchronous write karda hai.
- **Auto Backups**: Har backup `backups/Cleanera_Backup_YYYY-MM-DD_HH-mm.json` name naal store hunda hai.

---

## 9. Error Handling & Non-Blocking Design

1. **Non-Blocking Notifications**:
   - `dispatchOrderNotifications()` function async try-catch blocks vich wrapped hai.
   - Je customer da phone number invalid hove ya WhatsApp connection fail ho jaave, taan vi order create hon vich koi rukawat nahi aundi. Order successfully save ho janda hai ate error audit log vich record ho jandi hai.
2. **Timezone Offset Handling**:
   - JavaScript de `new Date("YYYY-MM-DD")` parsing vich UTC timezone shift di wajah naal tareekh 1 din piche shift hon da risk hunda hai. Trendera CRM direct regex pattern (`YYYY-MM-DD`, `DD MMM YYYY`) naal day, month, te year alag karke local date bananda hai, jiss naal date kadi vi shift nahi hundi.
3. **UI Crash Protection (`ErrorBoundary.tsx`)**:
   - Har major screen inline ErrorBoundary naal wrapped hai. Je kisse component vich runtime crash aave, taan pura app freeze hon di bajaye sirf oh screen fallback message dikhandi hai ate user dooji tab te switch kar sakda hai.

---

## 10. Unverified Details & Known Observations (Khulaasa)

1. **Simulated WhatsApp Outbound**:
   - Real-world deployment lai CRM ch WhatsApp simulator and click-to-chat links (`https://api.whatsapp.com/send?phone=...`) maujood han. Je third-party WhatsApp Business Cloud API (Meta API) raahi direct background webhook chalaana hove, taan Meta API credentials environment variables vich configure karne honge.
2. **Email SMTP Credentials**:
   - `dispatchOrderNotifications` vich customer email format verify hunda hai ate email template build hunda hai, par live server te SMTP server (SendGrid / AWS SES / Gmail SMTP) integrate karna optional setting te depend karda hai.
3. **Razorpay Live vs Test Mode**:
   - System standard test credentials naal fully functional hai te HMAC signature verify karda hai. Live production payments lai Admin Settings vich real `rzp_live_...` Key ID te Secret save karne honge.

---

*Document Tayar Kita Gaya: 18 October 2026*  
*Trendera Dry Cleaning & Laundry Services Private Limited - Internal Technical Team*
