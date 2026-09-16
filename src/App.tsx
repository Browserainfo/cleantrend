/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderNav } from './components/common/HeaderNav';
import { ToastContainer } from './components/common/Toast';
import { LoginScreen } from './components/auth/LoginScreen';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

// 8 Core Navigation Modules
import { HomeScreen } from './components/home/HomeScreen';
import { CustomerScreen } from './components/customer/CustomerScreen';
import { DropScreen } from './components/pos/DropScreen';
import { ProcessScreen } from './components/workshop/ProcessScreen';
import { DeliveryScreen } from './components/delivery/DeliveryScreen';
import { AccountScreen } from './components/account/AccountScreen';
import { ReportsScreen } from './components/reports/ReportsScreen';
import { MasterDataScreen } from './components/master/MasterDataScreen';
import { AdminScreen } from './components/admin/AdminScreen';
import { OrderManagementScreen } from './components/orders/OrderManagementScreen';

// Secondary Modals & Interactive Simulators
import { BusinessSettingsModal } from './components/settings/BusinessSettingsModal';
import { WhatsAppSimulator } from './components/whatsapp/WhatsAppSimulator';
import { CustomerPaymentPortal } from './components/portal/CustomerPaymentPortal';
import { GarmentTagPrintModal } from './components/tags/GarmentTagPrintModal';
import { ThermalReceiptModal } from './components/receipt/ThermalReceiptModal';
import { SignatureModal } from './components/delivery/SignatureModal';
import { PriceCorrectionModal } from './components/workflow/PriceCorrectionModal';
import { QRPickupScanModal } from './components/delivery/QRPickupScanModal';
import { PublicInvoicePortalPage } from './components/portal/PublicInvoicePortalPage';
import { findOrderFromReceiptQuery } from './utils/portalUrlUtils';

const MainAppContent: React.FC = () => {
  const { 
    orders,
    activeView,
    setActiveView,
    isAuthenticated,
    isAuthenticating,
    currentRole,
    isPublicPortalMode,
    publicPortalQuery,
    exitPublicPortal,
    isWhatsAppSimulatorOpen,
    setWhatsAppSimulatorOpen,
    isCustomerPortalOpen,
    setCustomerPortalOpen,
    isThermalReceiptModalOpen,
    setThermalReceiptModalOpen,
    isQRTagPreviewModalOpen,
    setQRTagPreviewModalOpen,
    isSignatureModalOpen,
    setSignatureModalOpen,
    isPriceCorrectionModalOpen,
    setPriceCorrectionModalOpen,
    isQRPickupScanModalOpen,
    setQRPickupScanModalOpen
  } = useApp();

  // 1. PUBLIC ACCESS PRESERVATION: If accessed directly via WhatsApp invoice link or public portal URL, customer does not need CRM authentication
  if (isPublicPortalMode) {
    const matchedOrder = findOrderFromReceiptQuery(publicPortalQuery, orders);
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-800">
        <PublicInvoicePortalPage 
          order={matchedOrder || null}
          invalidQuery={publicPortalQuery}
          onExitToCrm={exitPublicPortal} 
        />
        <ToastContainer />
      </div>
    );
  }

  // 2. AUTHENTICATING STATE: Show a clean branded loader during initial session verification
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-600/90 flex items-center justify-center text-white shadow-xl shadow-sky-600/30 border border-sky-400/30 animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>TRENDERA</span>
              <span className="text-sky-400 text-xs uppercase px-1.5 py-0.5 rounded bg-sky-950 border border-sky-700">CRM</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
              <span>Verifying secure session...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. UNAUTHENTICATED: Present the secure branded login screen
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <ToastContainer />
      </>
    );
  }

  // 4. AUTHENTICATED CRM WORKSPACE
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none antialiased text-slate-800">
      {/* Top 8-Module Navigation Bar with Active Role & Logout */}
      <HeaderNav />

      {/* Primary Workspace Viewport */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'HOME' && <HomeScreen />}
        {(activeView === 'CUSTOMER' || activeView === 'CUSTOMERS') && <CustomerScreen />}
        {(activeView === 'ORDERS' || activeView === 'ORDER_LIST' || activeView === 'ORDER_MANAGEMENT') && <OrderManagementScreen />}
        {(activeView === 'DROP' || activeView === 'ORDER_CREATE') && <DropScreen />}
        {(activeView === 'PROCESS' || activeView === 'PRINT_QR_TAGS' || activeView === 'PENDING_FINISHING' || activeView === 'PACKING_STICKERS' || activeView === 'WORKSHOP_NOTES') && <ProcessScreen />}
        {(activeView === 'PICKUP' || activeView === 'DELIVERY') && <DeliveryScreen />}
        {activeView === 'ACCOUNT' && <AccountScreen />}
        {(activeView === 'REPORTS' || activeView === 'AUDIT_TRAIL') && <ReportsScreen />}
        {activeView === 'MASTER_DATA' && <MasterDataScreen />}
        
        {/* Role Protected Admin Screen: Only Admin can access */}
        {(activeView === 'ADMIN' || activeView === 'USERS_PERMISSIONS' || activeView === 'SETTINGS' || activeView === 'USERS') && (
          currentRole === 'ADMIN' ? (
            <AdminScreen />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-100 text-center">
              <div className="max-w-md bg-white border border-rose-200 rounded-2xl p-8 shadow-sm text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">Access Restricted</h2>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Administrative controls, user management, and system configuration are strictly reserved for the <strong>ADMIN</strong> role. As a <strong>MANAGER</strong>, you have access to counter operations, customer management, orders, and delivery.
                </p>
                <button
                  onClick={() => setActiveView('HOME')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition"
                >
                  Return to Counter Desk
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Global Modals & Workflow Windows */}
      <WhatsAppSimulator 
        isOpen={isWhatsAppSimulatorOpen} 
        onClose={() => setWhatsAppSimulatorOpen(false)} 
      />

      <CustomerPaymentPortal 
        isOpen={isCustomerPortalOpen} 
        onClose={() => setCustomerPortalOpen(false)} 
      />

      <GarmentTagPrintModal 
        isOpen={isQRTagPreviewModalOpen} 
        onClose={() => setQRTagPreviewModalOpen(false)} 
      />

      <ThermalReceiptModal 
        isOpen={isThermalReceiptModalOpen} 
        onClose={() => setThermalReceiptModalOpen(false)} 
      />

      <SignatureModal 
        isOpen={isSignatureModalOpen} 
        onClose={() => setSignatureModalOpen(false)} 
      />

      <PriceCorrectionModal 
        isOpen={isPriceCorrectionModalOpen} 
        onClose={() => setPriceCorrectionModalOpen(false)} 
      />

      <QRPickupScanModal 
        isOpen={isQRPickupScanModalOpen} 
        onClose={() => setQRPickupScanModalOpen(false)} 
      />

      {/* Live System Feedback Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
