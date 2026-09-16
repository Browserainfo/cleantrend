import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Home,
  Users, 
  ArrowDownToLine, 
  Workflow, 
  Truck, 
  DollarSign, 
  BarChart3, 
  Database, 
  ShieldCheck, 
  Search, 
  Edit3, 
  MessageSquare, 
  ExternalLink, 
  Printer, 
  QrCode, 
  Settings, 
  Lock, 
  ShieldAlert, 
  ChevronDown, 
  RotateCcw, 
  Check,
  ShoppingBag,
  Scan,
  LogOut
} from 'lucide-react';
import { UserRole } from '../../types';

export const HeaderNav: React.FC = () => {
  const { 
    currentUser, 
    currentRole, 
    switchRole, 
    logout,
    businessSettings, 
    activeView, 
    setActiveView,
    setWhatsAppSimulatorOpen,
    setThermalReceiptModalOpen,
    setQRTagPreviewModalOpen,
    setCustomerPortalOpen,
    openQRPickupModal,
    priceCorrectionRequests,
    setPriceCorrectionModalOpen,
    whatsAppMessages,
    showToast,
    resetToDefaults
  } = useApp();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const pendingPriceRequestsCount = priceCorrectionRequests.filter(r => r.status === 'PENDING').length;

  const handleMenuClick = (viewName: string) => {
    if (['ADMIN', 'USERS_PERMISSIONS', 'SETTINGS', 'USERS'].includes(viewName) && currentRole === 'MANAGER') {
      showToast('ACCESS RESTRICTED: Manager accounts cannot access Admin System Settings or User Management.', 'error');
      return;
    }
    setActiveDropdown(null);
    setActiveView(viewName);
  };

  const handleEditF4Click = () => {
    setActiveView('DROP');
    showToast('Order editor active. Modify garments, delivery, or operational details.', 'info');
  };

  return (
    <header className="bg-slate-900 text-slate-100 shadow-md border-b border-slate-800 select-none sticky top-0 z-40">
      {/* Top Banner / Role Status & Anti-Fraud Bar */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 gap-2">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => handleMenuClick('HOME')} 
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition"
            title={`${businessSettings.businessName || 'Store'} Front Counter Desk (Home)`}
          >
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse"></span>
            <span className="font-bold text-white tracking-wide">{businessSettings.businessName || businessSettings.displayName || businessSettings.storeName}</span>
            <span className="text-slate-400 text-[11px]">| {businessSettings.address}</span>
          </div>

          <div className="h-3.5 w-px bg-slate-800 hidden sm:block"></div>

          {/* Quick Active Role Indicator & Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 rounded p-0.5 border border-slate-800">
            <span className="text-[10px] text-slate-400 px-1.5 font-medium">Role:</span>
            
            <button
              id="role-switch-admin-btn"
              onClick={() => switchRole('ADMIN')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition ${
                currentRole === 'ADMIN'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Switch to Admin (Owner with full price & edit authority)"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>ADMIN (Owner)</span>
              {currentRole === 'ADMIN' && <Check className="w-2.5 h-2.5 text-sky-200" />}
            </button>

            <button
              id="role-switch-manager-btn"
              onClick={() => switchRole('MANAGER')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 transition ${
                currentRole === 'MANAGER'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Switch to Manager (Operational manager with anti-fraud price lock)"
            >
              <Lock className="w-3 h-3" />
              <span>MANAGER</span>
              {currentRole === 'MANAGER' && <Check className="w-2.5 h-2.5 text-amber-200" />}
            </button>
          </div>
        </div>

        {/* Quick Launchers / Simulators */}
        <div className="flex items-center gap-2">
          {/* WhatsApp & Email Notification Simulator Button */}
          <button
            id="launch-whatsapp-btn"
            onClick={() => setWhatsAppSimulatorOpen(true)}
            className="px-2.5 py-1 bg-emerald-700/90 hover:bg-emerald-600 text-white text-xs font-semibold rounded flex items-center gap-1.5 shadow-2xs transition"
            title="Open Live WhatsApp & Email Notification Center"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
            <span>Notifications</span>
            <span className="bg-emerald-500 text-slate-950 font-bold text-[9px] px-1.5 py-0.2 rounded-full">
              Live
            </span>
          </button>

          {/* Dedicated QR Pickup / Delivery Scan Workflow Button */}
          <button
            id="launch-qr-pickup-btn"
            onClick={() => openQRPickupModal('4-1-2')}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-2xs transition"
            title="Scan QR code for instant customer pickup, balance settlement & delivery"
          >
            <Scan className="w-3.5 h-3.5 text-emerald-200" />
            <span>Scan Pickup</span>
          </button>

          {/* Customer Portal Link Simulator */}
          <button
            id="launch-portal-btn"
            onClick={() => setCustomerPortalOpen(true)}
            className="px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-white text-xs font-semibold rounded flex items-center gap-1.5 shadow-2xs transition"
            title="Open customer online invoice & payment portal (Screenshot 9)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-sky-300" />
            <span>Online Invoice</span>
          </button>

          {/* Thermal Receipt Simulator */}
          <button
            id="launch-thermal-btn"
            onClick={() => setThermalReceiptModalOpen(true)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded flex items-center gap-1 border border-slate-700"
            title="Print Preview Thermal Receipt (Screenshot 7)"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>Receipt</span>
          </button>

          {/* 2R Code / Piece Tag Simulator */}
          <button
            id="launch-qrtags-btn"
            onClick={() => setQRTagPreviewModalOpen(true)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded flex items-center gap-1 border border-slate-700"
            title="Print & Preview 2R Code / Piece Garment Tags"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400" />
            <span>2R Piece Tags</span>
          </button>

          {/* Price Approval Badge (For Admin) */}
          {pendingPriceRequestsCount > 0 && currentRole === 'ADMIN' && (
            <button
              onClick={() => setPriceCorrectionModalOpen(true)}
              className="px-2 py-1 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded flex items-center gap-1 animate-pulse"
              title="Pending Manager price flags requiring Admin review"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{pendingPriceRequestsCount} Approvals</span>
            </button>
          )}

          {/* Reset button */}
          <button
            onClick={resetToDefaults}
            className="p-1 text-slate-400 hover:text-slate-200 transition"
            title="Reset database to initial demo state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Quick Top Logout */}
          <button
            id="topbar-logout-btn"
            onClick={() => {
              logout();
              showToast('Signed out successfully.', 'info');
            }}
            className="px-2 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 hover:text-white text-xs font-semibold rounded flex items-center gap-1 transition cursor-pointer"
            title="Sign Out of Cleanera CRM"
          >
            <LogOut className="w-3 h-3 text-rose-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main 8-Module Navigation Bar */}
      <div className="px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <nav className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {/* 0. Home / Front Counter */}
          <button
            id="menu-home"
            onClick={() => handleMenuClick('HOME')}
            className={`px-3 py-1.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              activeView === 'HOME'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 text-sky-400" />
            <span>Home</span>
          </button>

          {/* 1. Customer */}
          <button
            id="menu-customer"
            onClick={() => handleMenuClick('CUSTOMER')}
            className={`px-3 py-1.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              ['CUSTOMER', 'CUSTOMERS'].includes(activeView)
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-sky-300" />
            <span>Customer</span>
          </button>

          {/* 2. Drop */}
          <button
            id="menu-drop"
            onClick={() => handleMenuClick('DROP')}
            className={`px-3 py-1.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              ['DROP', 'ORDER_CREATE', 'ORDER_LIST'].includes(activeView)
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Drop</span>
          </button>

          {/* 3. Process */}
          <button
            id="menu-process"
            onClick={() => handleMenuClick('PROCESS')}
            className={`px-3 py-1.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              ['PROCESS', 'PRINT_QR_TAGS', 'PENDING_FINISHING', 'PACKING_STICKERS', 'WORKSHOP_NOTES'].includes(activeView)
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Workflow className="w-4 h-4 text-purple-400" />
            <span>Process</span>
          </button>

          {/* 4. PickUp */}
          <button
            id="menu-pickup"
            onClick={() => handleMenuClick('PICKUP')}
            className={`px-3 py-1.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              ['PICKUP', 'DELIVERY'].includes(activeView)
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>PickUp</span>
          </button>

          {/* 5. Account */}
          <button
            id="menu-account"
            onClick={() => handleMenuClick('ACCOUNT')}
            className={`px-3 py-1.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              activeView === 'ACCOUNT'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Account</span>
          </button>

          {/* 6. Reports */}
          <button
            id="menu-reports"
            onClick={() => handleMenuClick('REPORTS')}
            className={`px-3 py-1.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              ['REPORTS', 'AUDIT_TRAIL'].includes(activeView)
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Reports</span>
          </button>

          {/* 7. Master Data */}
          <button
            id="menu-master-data"
            onClick={() => handleMenuClick('MASTER_DATA')}
            className={`px-3 py-1.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              activeView === 'MASTER_DATA'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Master Data</span>
          </button>

          {/* 8. Admin */}
          <button
            id="menu-admin"
            onClick={() => handleMenuClick('ADMIN')}
            className={`px-3 py-1.5 rounded text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              ['ADMIN', 'USERS_PERMISSIONS', 'SETTINGS', 'USERS'].includes(activeView)
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4 text-rose-400" />
            <span>Admin</span>
            {currentRole === 'MANAGER' && <Lock className="w-3 h-3 text-amber-400" />}
          </button>
        </nav>

        {/* Right Action Buttons: Edit (F4), Search (F2), User Profile */}
        <div className="flex items-center gap-2">
          {/* Edit (F4) Button */}
          <button
            id="btn-edit-f4"
            onClick={handleEditF4Click}
            className="px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs transition bg-sky-600 hover:bg-sky-500 text-white border border-sky-400"
            title="Edit Order (F4)"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit (F4)</span>
          </button>

          {/* Search (F2) Button */}
          <button
            id="btn-search-f2"
            onClick={() => {
              setActiveView('HOME');
              showToast('Front counter universal search activated (F2). Search customer, order, or scan QR.', 'info');
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold flex items-center gap-1.5 shadow-2xs border border-slate-700 transition"
          >
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span>Search (F2)</span>
          </button>

          {/* User Profile Badge & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-300">
              {currentUser?.avatarInitial || currentUser?.name?.[0] || (currentRole === 'ADMIN' ? 'A' : 'M')}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                {currentUser?.name || (currentRole === 'ADMIN' ? 'Admin' : 'Manager')}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                {currentRole === 'ADMIN' ? (
                  <span className="text-sky-400 font-bold">Admin (Owner)</span>
                ) : (
                  <span className="text-amber-400 font-bold">Manager</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
