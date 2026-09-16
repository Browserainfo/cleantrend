import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  Order, 
  Customer, 
  BusinessSettings, 
  WhatsAppMessage, 
  EmailMessage, 
  AuditLogEntry, 
  PriceCorrectionRequest, 
  OrderGarmentItem, 
  PaymentTransaction,
  WhatsAppTriggerType,
  PressingMethod,
  DEFAULT_PRESSING_METHOD
} from '../types';
import { normalizeIndianPhoneNumber } from '../utils/phoneUtils';
import { 
  initialBusinessSettings, 
  initialUsers, 
  initialCustomers, 
  initialOrders, 
  initialWhatsAppMessages, 
  initialAuditLogs,
  garmentCatalog,
  serviceDefinitions
} from '../data/initialData';
import {
  dispatchOrderNotifications,
  buildOrderWhatsAppMessage,
  buildOrderEmailConfirmation,
  resolveAbsoluteQrUrl
} from '../services/notificationService';
import { generateOrderUpiQr } from '../utils/upiQrUtils';
import {
  detectPortalRequest,
  findOrderFromReceiptQuery,
  buildPublicReceiptUrl
} from '../utils/portalUrlUtils';
import { getBusinessPrefix } from '../utils/pieceTagUtils';
import {
  loginApi,
  fetchCurrentUserApi,
  logoutApi,
  fetchUsersApi,
  createManagerApi,
  updateManagerApi,
  resetPasswordApi,
  toggleUserActiveApi,
  getAuthHeaders,
} from '../services/authService';

interface AppContextType {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  currentUser: User | null;
  currentRole: UserRole;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  addUser: (userData: {
    name: string;
    username: string;
    email?: string;
    mobile?: string;
    password: string;
    assignedStore?: string;
  }) => Promise<{ success: boolean; message?: string; user?: User }>;
  updateUserStatus: (userId: string, isActive: boolean) => Promise<{ success: boolean; message?: string }>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  refreshUsers: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  businessSettings: BusinessSettings;
  updateBusinessSettings: (newSettings: Partial<BusinessSettings>) => { success: boolean; message: string };
  orders: Order[];
  customers: Customer[];
  users: User[];
  whatsAppMessages: WhatsAppMessage[];
  emailMessages: EmailMessage[];
  auditLogs: AuditLogEntry[];
  priceCorrectionRequests: PriceCorrectionRequest[];
  activeView: string;
  setActiveView: (view: string) => void;
  activeOrderId: string;
  setActiveOrderId: (id: string) => void;
  activeCustomerId: string;
  setActiveCustomerId: (id: string) => void;
  selectedOrder: Order | undefined;
  
  // Anti-fraud & Order actions
  createOrder: (orderData: Partial<Order>) => { success: boolean; orderId?: string; order?: Order; error?: string; message?: string };
  updateOrderPrice: (orderId: string, barcode: string, newPrice: number, reason: string) => { success: boolean; error?: string };
  updateOrderDiscount: (orderId: string, discountPercent: number, reason: string) => { success: boolean; error?: string };
  submitPriceCorrectionRequest: (orderId: string, garmentName: string, currentPrice: number, proposedPrice: number, reason: string) => { success: boolean; error?: string };
  requestPriceCorrection: (orderId: string, barcodeOrName: string, proposedPrice: number, reason: string) => { success: boolean; error?: string };
  reviewPriceCorrectionRequest: (requestId: string, approved: boolean, adminNotes?: string) => void;
  reviewPriceCorrection: (requestId: string, approved: boolean, adminNotes?: string) => void;
  
  // Delivery & Workshop operations
  updateGarmentStatus: (orderId: string, barcode: string, status: OrderGarmentItem['status']) => void;
  updateGarmentPressingMethod: (orderId: string, barcode: string, pressingMethod: PressingMethod) => void;
  updateGarmentDetails: (orderId: string, barcode: string, updates: Partial<OrderGarmentItem>) => void;
  recordPayment: (orderId: string, amount: number, method: PaymentTransaction['paymentMethod'], channel: PaymentTransaction['channel'], referenceId?: string, differenceAction?: 'WAIVE' | 'CARRY_FORWARD', differenceAmount?: number) => { success: boolean };
  completeDelivery: (orderId: string, deliveredBarcodes: string[], signatureData?: string, paymentAmount?: number, paymentMethod?: PaymentTransaction['paymentMethod'], differenceAction?: 'WAIVE' | 'CARRY_FORWARD', differenceAmount?: number) => { success: boolean; order?: Order };
  recordGarmentReturn: (orderId: string, barcode: string, reason: string) => void;
  resendPaymentLink: (orderId: string) => void;
  updateCustomerAdjustmentBalance: (customerId: string, deltaOrNew: number, isDelta?: boolean) => void;
  
  // Notifications
  sendWhatsAppNotification: (type: WhatsAppTriggerType, orderId: string, customMessage?: string) => void;
  sendEmailNotification: (orderId: string) => void;
  sendManualSMS: (phone: string, text: string) => void;
  sendManualEmail: (email: string, subject: string, body?: string) => void;

  // UI Modals
  isWhatsAppSimulatorOpen: boolean;
  setWhatsAppSimulatorOpen: (open: boolean) => void;
  isThermalReceiptModalOpen: boolean;
  setThermalReceiptModalOpen: (open: boolean) => void;
  isQRTagPreviewModalOpen: boolean;
  setQRTagPreviewModalOpen: (open: boolean) => void;
  isCustomerPortalOpen: boolean;
  setCustomerPortalOpen: (open: boolean) => void;
  isPublicPortalMode: boolean;
  setIsPublicPortalMode: (open: boolean) => void;
  publicPortalQuery: string | null;
  setPublicPortalQuery: (query: string | null) => void;
  openPublicPortal: (receiptOrOrderId?: string) => void;
  exitPublicPortal: () => void;
  isPriceCorrectionModalOpen: boolean;
  setPriceCorrectionModalOpen: (open: boolean) => void;
  isSignatureModalOpen: boolean;
  setSignatureModalOpen: (open: boolean) => void;
  isQRPickupScanModalOpen: boolean;
  setQRPickupScanModalOpen: (open: boolean) => void;
  qrPickupInitialQuery: string;
  setQrPickupInitialQuery: (query: string) => void;
  openQRPickupModal: (query?: string) => void;
  lookupOrderByQR: (query: string) => { found: boolean; order?: Order; garment?: OrderGarmentItem; message?: string; isAlreadyDelivered?: boolean };
  
  // Customer management
  addCustomer: (cust: Partial<Customer>) => Customer;
  updateCustomer: (id: string, cust: Partial<Customer>) => Customer | null;
  updateOrder: (orderId: string, orderData: Partial<Order>) => { success: boolean; order?: Order; error?: string };
  cancelOrder: (orderId: string, reason?: string) => { success: boolean; order?: Order; error?: string };
  deleteOrder: (orderId: string, reason?: string) => { success: boolean; error?: string };
  
  // Helpers
  toastMessage: { text: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  hideToast: () => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication & session state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cleanera_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('cleanera_user') && !!localStorage.getItem('trendera_auth_token');
  });
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true);

  // Derive currentRole safely with manager default if unauthenticated
  const currentRole: UserRole = currentUser?.role || 'MANAGER';
  const authUserName = currentUser?.name || 'Staff';
  const authUsername = currentUser?.username || 'staff';
  const authUserRole = currentRole;

  // Load from localStorage or seed

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('cleanera_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.receiptFooterMessage || parsed.receiptFooterMessage.includes('ALL Garments Inspected Carefully') || parsed.receiptFooterMessage.length < 100) {
          parsed.receiptFooterMessage = initialBusinessSettings.receiptFooterMessage;
        }
        // Upgrade legacy Cleanera or DC02
        if (!parsed.branchCode || parsed.branchCode === 'DC02') {
          parsed.branchCode = 'TE02';
        }
        if (parsed.businessName && parsed.businessName.includes('Cleanera')) {
          parsed.businessName = 'Trendera Dry Cleaning CRM';
          parsed.displayName = 'Trendera Dry Cleaning - Noida';
          parsed.legalName = 'Trendera Services Private Limited';
          parsed.email = 'support@trendera.com';
          parsed.website = 'https://trendera.com';
        }
        return { ...initialBusinessSettings, ...parsed };
      } catch (e) {
        return initialBusinessSettings;
      }
    }
    return initialBusinessSettings;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cleanera_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((o: Order) => ({
          ...o,
          branchCode: o.branchCode === 'DC02' ? 'TE02' : (o.branchCode || 'TE02'),
          receiptUrl: o.receiptUrl
            ?.replace('qdc5.quickdrycleaning.com/PaymentLinkTesting/InvoiceDetails.aspx', 'cleanera.app/portal/invoice')
            ?.replace(/Reciept=DC02-/g, 'Reciept=TE02-') || o.receiptUrl
        }));
      } catch (e) {
        return initialOrders;
      }
    }
    return initialOrders;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('cleanera_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('cleanera_all_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((u: User) => ({
          ...u,
          email: u.email?.replace('quickdrycleaning.com', 'trendera.com') || u.email
        }));
      } catch (e) {
        return initialUsers;
      }
    }
    return initialUsers;
  });

  const [whatsAppMessages, setWhatsAppMessages] = useState<WhatsAppMessage[]>(() => {
    const saved = localStorage.getItem('cleanera_wa_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: WhatsAppMessage) => ({
          ...m,
          toName: m.toName?.replace(' QDC', '') || m.toName,
          messageText: m.messageText
            ?.replace(/qdc5\.quickdrycleaning\.com\/PaymentLinkTesting\/InvoiceDetails\.aspx/g, 'cleanera.app/portal/invoice')
            ?.replace(/QDC Demo/g, 'Trendera Dry Cleaning CRM')
            ?.replace(/Quickdrycleaning Software/g, 'Trendera Dry Cleaning CRM')
            ?.replace(/Cleanera/g, 'Trendera')
            ?.replace(/Reciept=DC02-/g, 'Reciept=TE02-') || m.messageText,
          receiptUrl: m.receiptUrl
            ?.replace('qdc5.quickdrycleaning.com/PaymentLinkTesting/InvoiceDetails.aspx', 'cleanera.app/portal/invoice')
            ?.replace(/Reciept=DC02-/g, 'Reciept=TE02-') || m.receiptUrl
        }));
      } catch (e) {
        return initialWhatsAppMessages;
      }
    }
    return initialWhatsAppMessages;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('cleanera_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [emailMessages, setEmailMessages] = useState<EmailMessage[]>(() => {
    const saved = localStorage.getItem('cleanera_email_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved email messages', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cleanera_email_messages', JSON.stringify(emailMessages));
  }, [emailMessages]);

  const [priceCorrectionRequests, setPriceCorrectionRequests] = useState<PriceCorrectionRequest[]>(() => {
    const saved = localStorage.getItem('cleanera_price_requests');
    return saved ? JSON.parse(saved) : [];
  });

  // Check backend session on application boot
  useEffect(() => {
    fetchCurrentUserApi()
      .then(res => {
        if (res.success && res.user) {
          setCurrentUser(res.user);
          setIsAuthenticated(true);
          localStorage.setItem('cleanera_user', JSON.stringify(res.user));
          if (res.user.role === 'ADMIN') {
            fetchUsersApi().then(uRes => {
              if (uRes.success && uRes.users) {
                setUsers(uRes.users);
              }
            }).catch(() => {});
          }
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('cleanera_user');
        }
      })
      .catch(() => {
        setCurrentUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsAuthenticating(false);
      });
  }, []);

  // Background synchronize orders with backend server database when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('/api/orders', {
      headers: getAuthHeaders(),
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          setOrders(prev => {
            const map = new Map<string, Order>();
            data.orders.forEach((o: Order) => map.set(o.id, o));
            prev.forEach(o => {
              if (!map.has(o.id)) map.set(o.id, o);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(err => {
        // Silent fallback
      });
  }, [isAuthenticated]);

  const [activeView, setActiveView] = useState<string>('HOME'); // Default to HOME screen for operational counter staff landing
  const [activeOrderId, setActiveOrderId] = useState<string>('ord-4');
  const [activeCustomerId, setActiveCustomerId] = useState<string>(() => {
    return initialCustomers[0]?.id || 'cust-1';
  });

  // Modals state
  const [isWhatsAppSimulatorOpen, setWhatsAppSimulatorOpen] = useState<boolean>(false);
  const [isThermalReceiptModalOpen, setThermalReceiptModalOpen] = useState<boolean>(false);
  const [isQRTagPreviewModalOpen, setQRTagPreviewModalOpen] = useState<boolean>(false);
  const [isCustomerPortalOpen, setCustomerPortalOpen] = useState<boolean>(false);
  const [isPriceCorrectionModalOpen, setPriceCorrectionModalOpen] = useState<boolean>(false);
  const [isSignatureModalOpen, setSignatureModalOpen] = useState<boolean>(false);
  const [isQRPickupScanModalOpen, setQRPickupScanModalOpen] = useState<boolean>(false);
  const [qrPickupInitialQuery, setQrPickupInitialQuery] = useState<string>('');

  // Public customer invoice portal mode (triggered by URL query or direct invoice link)
  const [isPublicPortalMode, setIsPublicPortalMode] = useState<boolean>(() => {
    return detectPortalRequest().isPortalRequest;
  });
  const [publicPortalQuery, setPublicPortalQuery] = useState<string | null>(() => {
    return detectPortalRequest().queryParam;
  });

  const openPublicPortal = (receiptOrOrderId?: string) => {
    if (receiptOrOrderId) {
      setPublicPortalQuery(receiptOrOrderId);
      const found = findOrderFromReceiptQuery(receiptOrOrderId, orders);
      if (found) {
        setActiveOrderId(found.id);
      }
    }
    setIsPublicPortalMode(true);
  };

  const exitPublicPortal = () => {
    setIsPublicPortalMode(false);
    setPublicPortalQuery(null);
    if (typeof window !== 'undefined' && window.history) {
      const cleanPath = window.location.pathname.includes('/portal') || window.location.pathname.includes('/PaymentLink') ? '/' : window.location.pathname;
      window.history.pushState(null, '', cleanPath);
    }
  };

  const openQRPickupModal = (query: string = '') => {
    setQrPickupInitialQuery(query);
    setQRPickupScanModalOpen(true);
  };

  const lookupOrderByQR = (query: string): { found: boolean; order?: Order; garment?: OrderGarmentItem; message?: string; isAlreadyDelivered?: boolean } => {
    if (!query || !query.trim()) {
      return { found: false, message: 'Please enter or scan a barcode/QR code.' };
    }
    const cleanQuery = query.trim().toLowerCase();

    // 1. Direct barcode match in items (e.g. "4-1-2", "4-2-2", "2-1-2")
    for (const ord of orders) {
      const matchedItem = ord.items.find(item => 
        item.barcode.toLowerCase() === cleanQuery || 
        item.barcode.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanQuery.replace(/[^a-z0-9]/g, '')
      );
      if (matchedItem) {
        return {
          found: true,
          order: ord,
          garment: matchedItem,
          isAlreadyDelivered: ord.status === 'DELIVERED',
          message: ord.status === 'DELIVERED' 
            ? `Garment ${matchedItem.barcode} belongs to Order #${ord.orderNumber}, which was already picked up.`
            : `Found Garment ${matchedItem.garmentName} (${matchedItem.barcode}) in Order #${ord.orderNumber}.`
        };
      }
    }

    // 2. Order Number / ID match (e.g. "4", "ord-4", "#4", "2", "ord-2")
    const numOnly = cleanQuery.replace(/[^0-9]/g, '');
    const matchedByNumber = orders.find(ord => 
      ord.id.toLowerCase() === cleanQuery ||
      ord.orderNumber.toString() === cleanQuery ||
      ord.orderNumber.toString() === numOnly ||
      ord.branchCode.toLowerCase() + '-' + ord.orderNumber === cleanQuery
    );
    if (matchedByNumber) {
      return {
        found: true,
        order: matchedByNumber,
        isAlreadyDelivered: matchedByNumber.status === 'DELIVERED',
        message: matchedByNumber.status === 'DELIVERED'
          ? `Order #${matchedByNumber.orderNumber} was already picked up on ${matchedByNumber.pickedUpAt || matchedByNumber.pickupDate || 'earlier date'}.`
          : `Found Order #${matchedByNumber.orderNumber} for ${matchedByNumber.customerName}.`
      };
    }

    // 3. Customer mobile or code or invoice URL
    const matchedByCustOrUrl = orders.find(ord =>
      ord.customerMobile.includes(cleanQuery) ||
      ord.customerName.toLowerCase().includes(cleanQuery) ||
      (ord.receiptUrl && ord.receiptUrl.toLowerCase().includes(cleanQuery))
    );
    if (matchedByCustOrUrl) {
      return {
        found: true,
        order: matchedByCustOrUrl,
        isAlreadyDelivered: matchedByCustOrUrl.status === 'DELIVERED',
        message: matchedByCustOrUrl.status === 'DELIVERED'
          ? `Order #${matchedByCustOrUrl.orderNumber} (${matchedByCustOrUrl.customerName}) was already picked up.`
          : `Found Order #${matchedByCustOrUrl.orderNumber} for customer ${matchedByCustOrUrl.customerName}.`
      };
    }

    return { found: false, message: `No order or garment found matching scanned QR code "${query}".` };
  };

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const hideToast = () => {
    setToastMessage(null);
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cleanera_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cleanera_settings', JSON.stringify(businessSettings));
    // Update document title dynamically using the active business name
    const bName = businessSettings.businessName || businessSettings.displayName || 'Dry Cleaning CRM';
    document.title = `${bName}${businessSettings.branchName ? ` (${businessSettings.branchName})` : ''}`;
  }, [businessSettings]);

  useEffect(() => {
    localStorage.setItem('cleanera_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cleanera_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('cleanera_all_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cleanera_wa_messages', JSON.stringify(whatsAppMessages));
  }, [whatsAppMessages]);

  useEffect(() => {
    localStorage.setItem('cleanera_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('cleanera_price_requests', JSON.stringify(priceCorrectionRequests));
  }, [priceCorrectionRequests]);

  const switchRole = (role: UserRole) => {
    showToast(`Role is authenticated via credentials. To switch to ${role}, please sign in with an authorized account.`, 'info');
  };

  const login = async (username: string, password: string) => {
    const res = await loginApi(username, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsAuthenticated(true);
      localStorage.setItem('cleanera_user', JSON.stringify(res.user));
      showToast(`Welcome back, ${res.user.name} (${res.user.role})!`, 'success');
      if (res.user.role === 'ADMIN') {
        const uRes = await fetchUsersApi();
        if (uRes.success && uRes.users) {
          setUsers(uRes.users);
        }
      }
      return { success: true };
    }
    return { success: false, error: res.error || 'Authentication failed. Please verify credentials.' };
  };

  const logout = async () => {
    await logoutApi();
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('cleanera_user');
    setActiveView('HOME');
    showToast('Logged out securely.', 'info');
  };

  const addUser = async (userData: {
    name: string;
    username: string;
    email?: string;
    mobile?: string;
    password: string;
    assignedStore?: string;
  }) => {
    if (currentRole !== 'ADMIN') {
      showToast('SECURITY: Only Admin can create manager accounts.', 'error');
      return { success: false, message: 'Forbidden' };
    }
    const res = await createManagerApi(userData);
    if (res.success && res.user) {
      setUsers(prev => [...prev.filter(u => u.id !== res.user!.id), res.user!]);
      addAuditLog({
        action: 'CREATE_USER',
        changedBy: `${currentUser?.name || 'Admin'} (${currentUser?.username || 'admin'})`,
        userRole: 'ADMIN',
        fieldName: 'User Management',
        previousValue: 'None',
        newValue: `${res.user.name} (${res.user.username})`,
        reason: 'Admin provisioned new manager account'
      });
      showToast(`Manager account "${res.user.name}" created successfully.`, 'success');
      return { success: true, user: res.user };
    }
    showToast(res.error || 'Failed to create manager account.', 'error');
    return { success: false, message: res.error };
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    if (currentRole !== 'ADMIN') {
      showToast('SECURITY: Only Admin can modify account statuses.', 'error');
      return { success: false, message: 'Forbidden' };
    }
    const res = await toggleUserActiveApi(userId);
    if (res.success && res.user) {
      setUsers(prev => prev.map(u => u.id === userId ? res.user! : u));
      addAuditLog({
        action: 'UPDATE_USER_STATUS',
        changedBy: `${currentUser?.name || 'Admin'} (${currentUser?.username || 'admin'})`,
        userRole: 'ADMIN',
        fieldName: 'Account Active Status',
        previousValue: isActive ? 'Active' : 'Inactive',
        newValue: res.user.active !== false ? 'Active' : 'Inactive',
        reason: `Admin toggled user ${res.user.username} active status`
      });
      showToast(`Account status updated to ${res.user.active !== false ? 'Active' : 'Deactivated'}.`, 'success');
      return { success: true };
    }
    showToast(res.error || 'Failed to update user status.', 'error');
    return { success: false, message: res.error };
  };

  const resetUserPassword = async (userId: string, newPassword: string) => {
    if (currentRole !== 'ADMIN') {
      showToast('SECURITY: Only Admin can reset credentials.', 'error');
      return { success: false, message: 'Forbidden' };
    }
    const res = await resetPasswordApi(userId, newPassword);
    if (res.success) {
      addAuditLog({
        action: 'RESET_PASSWORD',
        changedBy: `${currentUser?.name || 'Admin'} (${currentUser?.username || 'admin'})`,
        userRole: 'ADMIN',
        fieldName: 'User Password',
        previousValue: 'Protected',
        newValue: 'Updated Hash',
        reason: `Admin reset password for user ID ${userId}`
      });
      showToast('Password reset successfully.', 'success');
      return { success: true, message: res.message };
    }
    showToast(res.error || 'Failed to reset password.', 'error');
    return { success: false, message: res.error };
  };

  const refreshUsers = async () => {
    if (currentRole === 'ADMIN') {
      const res = await fetchUsersApi();
      if (res.success && res.users) {
        setUsers(res.users);
      }
    }
  };

  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date();
    const formatted = `${now.getDate().toString().padStart(2, '0')} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()} ${now.toLocaleTimeString()}`;
    const newLog: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: formatted
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const selectedOrder = orders.find(o => o.id === activeOrderId) || orders[0];

  // STRICT ADMIN RBAC FOR SETTINGS
  const updateBusinessSettings = (newSettings: Partial<BusinessSettings>) => {
    if (currentRole !== 'ADMIN') {
      showToast('SECURITY RESTRICTION: Only Admin can modify Business Branding and Settings.', 'error');
      return { success: false, message: '403 Forbidden: Insufficient permissions.' };
    }

    const name = (newSettings.businessName || (newSettings as any).storeName || newSettings.displayName || businessSettings.businessName || '').trim();

    const updated: BusinessSettings = {
      ...businessSettings,
      ...newSettings,
      businessName: name || businessSettings.businessName,
      displayName: (newSettings.displayName || name || businessSettings.displayName || '').trim(),
      legalName: (newSettings.legalName || name || businessSettings.legalName || '').trim()
    };
    
    setBusinessSettings(updated);

    // Persist to server backend
    fetch('/api/settings', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updated)
    }).catch(err => console.warn('Failed to sync settings to server', err));
    
    addAuditLog({
      action: 'UPDATE_SETTINGS',
      changedBy: `${currentUser?.name || 'Admin'} (${currentUser?.username || 'admin'})`,
      userRole: currentRole,
      fieldName: 'Business Settings & Branding',
      previousValue: businessSettings.businessName,
      newValue: updated.businessName,
      reason: 'Admin updated business identity, logo, or messaging parameters'
    });

    showToast(`Business settings saved. Business Name: "${updated.businessName}"`, 'success');
    return { success: true, message: 'Settings saved successfully.' };
  };

  // SEND WHATSAPP NOTIFICATION
  const sendWhatsAppNotification = async (type: WhatsAppTriggerType, orderId: string, customMessage?: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const cust = customers.find(c => c.id === order.customerId) || {
      id: order.customerId,
      name: order.customerName,
      mobile: order.customerMobile,
      email: '',
      address: order.customerAddress,
      area: '',
      placeOfSupply: order.customerPlaceOfSupply,
      gstNumber: '',
      outstandingAmount: 0,
      pendingOrdersCount: 0,
      totalOrdersCount: 0,
      lastVisit: '',
      createdAt: ''
    } as Customer;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const effectiveReceiptUrl = order.receiptUrl || buildPublicReceiptUrl(order, businessSettings);

    const hasQrConfigured = Boolean(
      businessSettings?.paymentQrUrl?.trim() || businessSettings?.upiId?.trim()
    );
    const shouldIncludeQr = businessSettings?.includeQrInWhatsApp !== false && hasQrConfigured && (type === 'ORDER_CREATED' || type === 'ORDER_READY');

    let resolvedQr: string | undefined = undefined;
    let absoluteQr: string | undefined = undefined;

    if (shouldIncludeQr) {
      try {
        const upiResult = await generateOrderUpiQr(order, businessSettings);
        resolvedQr = upiResult.qrDataUrl;
        absoluteQr = resolveAbsoluteQrUrl(
          `/api/payment-qr?orderId=${order.id}&amount=${upiResult.amount}&orderNumber=${order.orderNumber}`,
          businessSettings
        );
      } catch (qrErr) {
        console.error('[AppContext] Error generating dynamic UPI QR:', qrErr);
        resolvedQr = businessSettings.paymentQrUrl || '/payment-qr.jpg';
        absoluteQr = resolveAbsoluteQrUrl(resolvedQr, businessSettings);
      }
    }

    let msgText = '';

    switch (type) {
      case 'ORDER_CREATED':
        msgText = buildOrderWhatsAppMessage(order, cust, businessSettings, absoluteQr);
        break;
      case 'PICKUP_SCHEDULED':
        msgText = `Dear ${order.customerName},\nYour pick up request with ${businessSettings.businessName} for Date: ${order.pickupDate || 'Today'} and Time: ${order.pickupTimeSlot || '4:30 PM – 6:00 PM'} has been placed successfully.\n${effectiveReceiptUrl}`;
        break;
      case 'ORDER_READY':
        msgText = `Dear ${order.customerName},\nYour order #${order.orderNumber} (${order.totalPieces} garments) is now CLEAN & READY for delivery or pickup at ${businessSettings.branchName}.\nBalance Due: ₹${order.balanceDue.toLocaleString('en-IN')}\nReceipt & Pay Online:\n${effectiveReceiptUrl}\nThank you!`;
        break;
      case 'PAYMENT_RECEIVED':
        msgText = `Dear ${order.customerName},\nPayment of ₹${order.netAmount - order.balanceDue > 0 ? (order.netAmount - order.balanceDue).toLocaleString('en-IN') : order.netAmount.toLocaleString('en-IN')} for your Order #${order.orderNumber} has been received with Thanks!\nCurrent Balance Due: ₹${order.balanceDue.toLocaleString('en-IN')}\nReceipt:\n${effectiveReceiptUrl}`;
        break;
      case 'ORDER_DELIVERED_FEEDBACK':
        msgText = `Order Feedback: Hi ${order.customerName}, We have successfully delivered your Order #${order.orderNumber} (Qty: ${order.totalPieces} Pcs).\nHow was our service? Please share your valuable rating.\nThank you for choosing ${businessSettings.businessName}!`;
        break;
      case 'ORDER_UPDATED':
        msgText = `Hi ${order.customerName},\nYour Order #${order.orderNumber} has been inspected and updated by our store manager.\nNew Amount: ₹${order.netAmount.toLocaleString('en-IN')}\nReceipt:\n${effectiveReceiptUrl}\nThanks!`;
        break;
    }

    if (customMessage) {
      msgText = customMessage;
    }

    const newMsg: WhatsAppMessage = {
      id: `wa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      toName: order.customerName,
      toPhone: order.customerMobile,
      triggerType: type,
      messageText: msgText,
      receiptUrl: effectiveReceiptUrl,
      mediaUrl: resolvedQr,
      mediaType: resolvedQr ? 'IMAGE' : undefined,
      qrImageUrl: absoluteQr || resolvedQr,
      orderNumber: order.orderNumber,
      timestamp: timeStr,
      status: 'SENT',
      isOutbound: true
    };

    setWhatsAppMessages(prev => [newMsg, ...prev]);
    showToast(`WhatsApp ${type} automated notification dispatched to ${order.customerMobile}!`, 'success');
  };

  const sendEmailNotification = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const cust = customers.find(c => c.id === order.customerId) || {
      id: order.customerId,
      name: order.customerName,
      email: '',
      mobile: order.customerMobile,
      placeOfSupply: order.customerPlaceOfSupply
    } as Customer;

    if (!cust.email) {
      showToast('Customer has no email address provided. Skipped sending email.', 'info');
      return;
    }

    const { subject, bodyHtml, bodyText } = buildOrderEmailConfirmation(order, cust, businessSettings);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const emailMsg: EmailMessage = {
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      toName: order.customerName,
      toEmail: cust.email,
      orderNumber: order.orderNumber,
      subject,
      bodyHtml,
      bodyText,
      timestamp: timeStr,
      status: 'SENT',
      isOutbound: true
    };

    setEmailMessages(prev => [emailMsg, ...prev]);
    showToast(`Order confirmation email dispatched to ${cust.email}!`, 'success');
  };

  const resendPaymentLink = (orderId: string) => {
    sendWhatsAppNotification('ORDER_CREATED', orderId);
    showToast('Payment link resent to customer WhatsApp!', 'success');
  };

  const sendManualSMS = (phone: string, text: string) => {
    showToast(`SMS dispatched to ${phone}: "${text.slice(0, 30)}..."`, 'info');
  };

  const sendManualEmail = (email: string, subject: string, body?: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const emailMsg: EmailMessage = {
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      toName: 'Customer',
      toEmail: email,
      orderNumber: 0,
      subject,
      bodyHtml: `<p>${body || subject}</p>`,
      bodyText: body || subject,
      timestamp: timeStr,
      status: 'SENT',
      isOutbound: true
    };
    setEmailMessages(prev => [emailMsg, ...prev]);
    showToast(`Email dispatched to ${email}: [${subject}]`, 'info');
  };

  // ORDER CREATION - FULL OPERATIONAL ACCESS (ADMIN & MANAGER)
  const createOrder = (orderData: Partial<Order>) => {
    const nextOrderNo = Math.max(...orders.map(o => o.orderNumber), 0) + 1;
    const effectivePrefix = getBusinessPrefix(businessSettings);
    const branchCode = effectivePrefix || businessSettings.branchCode || 'TE02';
    const orderSeries = `*${nextOrderNo}-2*`;
    const custId = orderData.customerId || 'cust-62';
    const cust = customers.find(c => c.id === custId) || customers[0];

    const totalPcs = orderData.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 1;
    const gross = orderData.grossAmount || 0;
    const discount = orderData.discountAmount || 0;
    const appliedAdj = Number((orderData as any).appliedAdjustment || orderData.adjustmentApplied || 0);
    const rawTotal = Math.max(0, gross - discount + appliedAdj);
    const roundedTotal = orderData.netAmount !== undefined ? orderData.netAmount : Math.round(rawTotal);
    const roundOff = orderData.roundOff !== undefined ? orderData.roundOff : Number((roundedTotal - rawTotal).toFixed(2));
    const advance = orderData.advancePaid || 0;

    const diffAction = (orderData as any).differenceAction as 'WAIVE' | 'CARRY_FORWARD' | undefined;
    const diffAmount = Number((orderData as any).differenceAmount || 0);

    let balance = Math.max(0, roundedTotal - advance);
    if (diffAction === 'WAIVE' || diffAction === 'CARRY_FORWARD') {
      balance = 0; // Settled difference
    }

    const chosenMethod = (orderData as any).advancePaymentMethod || (orderData as any).paymentMethod || 'CASH';

    const receiptUrl = buildPublicReceiptUrl({
      ...orderData,
      orderNumber: nextOrderNo,
      branchCode: branchCode,
      netAmount: roundedTotal,
      customerId: cust.id
    } as Order, businessSettings);

    // Prepare items with barcodes
    const formattedItems: OrderGarmentItem[] = (orderData.items || []).map((item, idx) => ({
      ...item,
      id: item.id || `item-${nextOrderNo}-${idx + 1}`,
      garmentSequence: idx + 1,
      barcode: `${nextOrderNo}-${idx + 1}-2`,
      status: 'RECEIVED',
      quantity: item.quantity || 1,
      basePrice: item.basePrice || 100,
      subServices: item.subServices || [],
      totalItemPrice: item.totalItemPrice || 100,
      remarks: item.remarks || [],
      pressingMethod: item.pressingMethod || DEFAULT_PRESSING_METHOD,
      category: item.category || 'MEN'
    }));

    const newOrder: Order = {
      id: `ord-${nextOrderNo}`,
      orderNumber: nextOrderNo,
      branchCode: branchCode,
      orderSeries: orderSeries,
      orderType: orderData.orderType || 'PER_PIECES',
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      customerAddress: cust.address,
      customerPlaceOfSupply: cust.placeOfSupply || orderData.customerPlaceOfSupply || '',
      items: formattedItems,
      totalPieces: totalPcs,
      totalWeightKg: orderData.totalWeightKg || 0,
      deliveryCharge: orderData.deliveryCharge || 0,
      hasDeliveryCharge: orderData.hasDeliveryCharge || false,
      isPickAndDrop: orderData.isPickAndDrop || false,
      pickAndDropType: orderData.pickAndDropType || 'COUNTER_WALKIN',
      grossAmount: gross,
      discountAmount: discount,
      discountPercent: orderData.discountPercent || 0,
      discountReason: orderData.discountReason,
      surchargeAmount: orderData.surchargeAmount || 0,
      surchargeType: orderData.surchargeType || 'NONE',
      taxRatePercent: 0,
      taxAmount: 0,
      roundOff: roundOff,
      netAmount: roundedTotal,
      advancePaid: advance,
      balanceDue: balance,
      adjustmentApplied: appliedAdj > 0 ? appliedAdj : undefined,
      differenceAction: diffAction,
      differenceAmount: (diffAction && diffAmount > 0) ? diffAmount : undefined,
      payments: advance > 0 ? [{
        id: `pay-${nextOrderNo}-adv`,
        orderId: `ord-${nextOrderNo}`,
        amount: advance,
        paymentMethod: chosenMethod,
        channel: 'COUNTER',
        timestamp: new Date().toISOString(),
        collectedBy: authUserName
      }] : [],
      status: 'RECEIVED',
      orderDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString(),
      dueDate: orderData.dueDate || new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      workshopNotes: orderData.workshopNotes,
      deliveryNotes: orderData.deliveryNotes,
      receiptUrl: receiptUrl,
      createdAt: new Date().toISOString(),
      createdBy: authUsername
    };

    // 1. Save order to state and select it
    setOrders(prev => [newOrder, ...prev]);
    setActiveOrderId(newOrder.id);

    // 2. Update customer stats
    setCustomers(prev => prev.map(c => {
      if (c.id !== cust.id) return c;
      let newAdj = c.adjustmentBalance || 0;
      if (appliedAdj > 0) {
        newAdj = Math.max(0, Number((newAdj - appliedAdj).toFixed(2)));
      }
      if (diffAction === 'CARRY_FORWARD' && diffAmount > 0) {
        newAdj = Number((newAdj + diffAmount).toFixed(2));
      }
      return {
        ...c,
        outstandingAmount: c.outstandingAmount + balance,
        adjustmentBalance: newAdj,
        pendingOrdersCount: c.pendingOrdersCount + 1,
        totalOrdersCount: c.totalOrdersCount + 1,
        lastVisit: '0 Day ago'
      };
    }));

    // 3. Audit log entry
    addAuditLog({
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      action: 'CREATE_ORDER',
      changedBy: `${authUserName} (${authUsername})`,
      userRole: authUserRole,
      fieldName: 'New Order Booking',
      previousValue: 'None',
      newValue: `Net: ₹${roundedTotal}, Items: ${totalPcs}${appliedAdj > 0 ? `, Prev Adj Applied: ₹${appliedAdj}` : ''}${diffAction ? `, Diff Action: ${diffAction} (₹${diffAmount})` : ''}`,
      reason: `${authUserRole === 'ADMIN' ? 'Admin' : 'Manager'} booked new dry cleaning order`
    });

    if (appliedAdj > 0) {
      addAuditLog({
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        action: 'ADJUSTMENT_DEDUCTED',
        changedBy: `${authUserName} (${authUsername})`,
        userRole: authUserRole,
        fieldName: 'Customer Adjustment Balance',
        previousValue: `₹${cust.adjustmentBalance || 0}`,
        newValue: `Deducted ₹${appliedAdj}. Remaining: ₹${Math.max(0, (cust.adjustmentBalance || 0) - appliedAdj)}`,
        reason: `Applied ₹${appliedAdj} adjustment to Order #${nextOrderNo}`
      });
    }

    // 4. Safely dispatch WhatsApp and Email notifications (Non-blocking: notification failure never breaks order creation)
    try {
      dispatchOrderNotifications(newOrder, cust, businessSettings).then(dispatchResult => {
        // WhatsApp Message handling
        if (dispatchResult.whatsAppResult.message) {
          setWhatsAppMessages(prev => [dispatchResult.whatsAppResult.message!, ...prev]);
        }
        if (dispatchResult.whatsAppResult.error) {
          addAuditLog({
            orderId: newOrder.id,
            orderNumber: newOrder.orderNumber,
            action: 'WHATSAPP_NOTIFICATION_FAILED',
            changedBy: 'System Notification Service',
            userRole: authUserRole,
            fieldName: 'WhatsApp Delivery',
            newValue: 'FAILED',
            reason: dispatchResult.whatsAppResult.error
          });
        }

        // Email Message handling
        if (dispatchResult.emailResult.message && !dispatchResult.emailResult.skipped) {
          setEmailMessages(prev => [dispatchResult.emailResult.message!, ...prev]);
        }
        if (dispatchResult.emailResult.error) {
          addAuditLog({
            orderId: newOrder.id,
            orderNumber: newOrder.orderNumber,
            action: 'EMAIL_NOTIFICATION_FAILED',
            changedBy: 'System Notification Service',
            userRole: authUserRole,
            fieldName: 'Email Confirmation',
            newValue: 'FAILED',
            reason: dispatchResult.emailResult.error
          });
        }
      }).catch(err => {
        console.warn('Asynchronous notification handling error:', err);
      });
    } catch (notifErr) {
      console.warn('Safe notification dispatch encountered an error:', notifErr);
    }

    // 5. Sync newly created order to backend server database
    fetch('/api/orders', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(newOrder)
    }).catch(err => {
      console.warn('Server sync note:', err);
    });

    const emailStatusNote = cust.email ? ` & Email sent to ${cust.email}` : ' (Email skipped: not provided)';
    return { 
      success: true, 
      orderId: newOrder.id, 
      order: newOrder,
      message: `Order #${nextOrderNo} created successfully! WhatsApp notification sent to ${cust.mobile}${emailStatusNote}.` 
    };
  };

  // STRICT ANTI-FRAUD PRICE INTEGRITY
  const updateOrderPrice = (orderId: string, barcode: string, newPrice: number, reason: string) => {
    if (currentRole !== 'ADMIN') {
      const errMsg = 'ANTI-FRAUD PROTECTION: Manager cannot modify order prices under any circumstance. Please submit a Price Correction Request for Admin approval.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }

    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const item = order.items.find(i => i.barcode === barcode);
    if (!item) return { success: false, error: 'Garment not found' };

    const oldPrice = item.basePrice;
    
    // Recalculate order totals
    const updatedItems = order.items.map(i => {
      if (i.barcode === barcode) {
        const subSum = i.subServices.reduce((acc, s) => acc + s.price, 0);
        return {
          ...i,
          basePrice: newPrice,
          totalItemPrice: newPrice + subSum
        };
      }
      return i;
    });

    const newGross = updatedItems.reduce((acc, i) => acc + (i.totalItemPrice * i.quantity), 0);
    const rawTotal = Math.max(0, newGross - order.discountAmount);
    const roundedNet = Math.round(rawTotal);
    const roundOff = Number((roundedNet - rawTotal).toFixed(2));
    const paidSum = order.payments.reduce((acc, p) => acc + p.amount, 0) + order.advancePaid;
    const newBal = Math.max(0, roundedNet - paidSum);

    const updatedOrder: Order = {
      ...order,
      items: updatedItems,
      grossAmount: newGross,
      taxAmount: 0,
      roundOff: roundOff,
      netAmount: roundedNet,
      balanceDue: newBal,
      updatedAt: new Date().toISOString(),
      updatedBy: authUsername
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));

    addAuditLog({
      orderId: order.id,
      orderNumber: order.orderNumber,
      action: 'PRICE_MODIFICATION',
      changedBy: `${authUserName} (${authUsername})`,
      userRole: authUserRole,
      fieldName: `${item.garmentName} Price (${barcode})`,
      previousValue: `Rs. ${oldPrice}`,
      newValue: `Rs. ${newPrice}`,
      reason: reason || 'Admin verified master rate correction'
    });

    showToast(`Price updated for ${item.garmentName}: Rs. ${oldPrice} -> Rs. ${newPrice}. Audit logged.`, 'success');
    return { success: true };
  };

  // STRICT ANTI-FRAUD DISCOUNT CONTROL
  const updateOrderDiscount = (orderId: string, discountPercent: number, reason: string) => {
    if (currentRole !== 'ADMIN') {
      const errMsg = 'SECURITY RESTRICTION: Manager cannot grant or alter discounts. Only Admin has discount authority.';
      showToast(errMsg, 'error');
      return { success: false, error: errMsg };
    }

    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const oldDiscount = order.discountAmount;
    const newDiscountAmt = Number(((order.grossAmount * discountPercent) / 100).toFixed(2));
    const rawTotal = Math.max(0, order.grossAmount - newDiscountAmt);
    const roundedNet = Math.round(rawTotal);
    const roundOff = Number((roundedNet - rawTotal).toFixed(2));
    const paidSum = order.payments.reduce((acc, p) => acc + p.amount, 0) + order.advancePaid;
    const newBal = Math.max(0, roundedNet - paidSum);

    const updatedOrder: Order = {
      ...order,
      discountPercent: discountPercent,
      discountAmount: newDiscountAmt,
      discountReason: reason,
      taxAmount: 0,
      roundOff: roundOff,
      netAmount: roundedNet,
      balanceDue: newBal,
      updatedAt: new Date().toISOString(),
      updatedBy: authUsername
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));

    addAuditLog({
      orderId: order.id,
      orderNumber: order.orderNumber,
      action: 'DISCOUNT_APPLIED',
      changedBy: `${authUserName} (${authUsername})`,
      userRole: authUserRole,
      fieldName: 'Order Discount',
      previousValue: `Rs. ${oldDiscount} (${order.discountPercent}%)`,
      newValue: `Rs. ${newDiscountAmt} (${discountPercent}%)`,
      reason: reason || 'Admin promotional waiver'
    });

    showToast(`Discount of ${discountPercent}% (Rs. ${newDiscountAmt}) applied by Admin.`, 'success');
    return { success: true };
  };

  // MANAGER PRICE FLAG / CORRECTION REQUEST
  const submitPriceCorrectionRequest = (orderId: string, garmentName: string, currentPrice: number, proposedPrice: number, reason: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const item = order.items.find(i => i.garmentName.toLowerCase() === garmentName.toLowerCase() || i.barcode === garmentName) || order.items[0];

    const req: PriceCorrectionRequest = {
      id: `req-${Date.now()}`,
      orderId,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      garmentBarcode: item?.barcode || '',
      garmentName: item?.garmentName || garmentName,
      requestedBy: `${authUserName} (${currentRole})`,
      requestedByName: authUserName,
      requestedAt: new Date().toLocaleString(),
      currentPrice: currentPrice || item?.totalItemPrice || item?.unitPrice || 0,
      originalPrice: item?.totalItemPrice || currentPrice || 0,
      proposedPrice,
      reason,
      status: 'PENDING'
    };

    setPriceCorrectionRequests(prev => [req, ...prev]);
    showToast(`Price discrepancy flagged for Admin review. Owner will be notified.`, 'info');
    return { success: true };
  };

  const requestPriceCorrection = (orderId: string, barcodeOrName: string, proposedPrice: number, reason: string) => {
    const order = orders.find(o => o.id === orderId);
    const item = order?.items.find(i => i.barcode === barcodeOrName || i.garmentName.toLowerCase() === barcodeOrName.toLowerCase()) || order?.items[0];
    const currentPrice = item ? item.totalItemPrice : 0;
    const garmentName = item ? item.garmentName : barcodeOrName;
    return submitPriceCorrectionRequest(orderId, garmentName, currentPrice, proposedPrice, reason);
  };

  // ADMIN REVIEW PRICE CORRECTION
  const reviewPriceCorrectionRequest = (requestId: string, approved: boolean, adminNotes?: string) => {
    if (currentRole !== 'ADMIN') {
      showToast('Only Admin can review and approve price corrections.', 'error');
      return;
    }

    const req = priceCorrectionRequests.find(r => r.id === requestId);
    if (!req) return;

    if (approved) {
      const order = orders.find(o => o.id === req.orderId);
      const targetItem = order?.items.find(i => 
        (req.garmentBarcode && i.barcode === req.garmentBarcode) ||
        i.garmentName.toLowerCase().includes(req.garmentName.toLowerCase()) || 
        req.garmentName.toLowerCase().includes(i.garmentName.toLowerCase())
      );
      if (order && targetItem) {
        updateOrderPrice(order.id, targetItem.barcode, req.proposedPrice, `Approved request from ${req.requestedBy}: ${req.reason}`);
      }
    }

    setPriceCorrectionRequests(prev => prev.map(r => r.id === requestId ? {
      ...r,
      status: approved ? 'APPROVED' : 'REJECTED',
      reviewedBy: authUserName,
      reviewedAt: new Date().toLocaleString(),
      adminNotes
    } : r));

    showToast(`Price Correction Request #${requestId} was ${approved ? 'APPROVED' : 'REJECTED'} by Admin.`, approved ? 'success' : 'warning');
  };

  const reviewPriceCorrection = (requestId: string, approved: boolean, adminNotes?: string) => {
    reviewPriceCorrectionRequest(requestId, approved, adminNotes);
  };

  // GARMENT STATUS UPDATE
  const updateGarmentStatus = (orderId: string, barcode: string, status: OrderGarmentItem['status']) => {
    const now = new Date();
    const formatted = `${now.getDate().toString().padStart(2, '0')}-${now.toLocaleString('default', { month: 'short' })}-${now.getFullYear().toString().slice(-2)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;

      const updatedItems = o.items.map(item => {
        if (item.barcode === barcode) {
          return {
            ...item,
            status,
            readyOn: status === 'READY' ? formatted : item.readyOn,
            readyBy: status === 'READY' ? authUsername : item.readyBy,
            deliveredOn: status === 'DELIVERED' ? formatted : item.deliveredOn,
            deliveredBy: status === 'DELIVERED' ? authUsername : item.deliveredBy
          };
        }
        return item;
      });

      const allReady = updatedItems.every(i => i.status === 'READY');
      const allDelivered = updatedItems.every(i => i.status === 'DELIVERED');
      const anyDelivered = updatedItems.some(i => i.status === 'DELIVERED');

      let newStatus = o.status;
      if (allDelivered) newStatus = 'DELIVERED';
      else if (anyDelivered) newStatus = 'PARTIALLY_DELIVERED';
      else if (allReady) newStatus = 'READY';

      return {
        ...o,
        items: updatedItems,
        status: newStatus
      };
    }));

    // If marked ready, trigger WhatsApp WA-005
    if (status === 'READY') {
      sendWhatsAppNotification('ORDER_READY', orderId);
    }
  };

  // RECORD PAYMENT
  const recordPayment = (
    orderId: string, 
    amount: number, 
    method: PaymentTransaction['paymentMethod'], 
    channel: PaymentTransaction['channel'], 
    referenceId?: string,
    differenceAction?: 'WAIVE' | 'CARRY_FORWARD',
    differenceAmount?: number
  ) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false };

    const newPayment: PaymentTransaction = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      orderId,
      amount,
      paymentMethod: method,
      channel,
      referenceId: referenceId || `TXN-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      collectedBy: channel === 'ONLINE_PORTAL' ? 'Payment Gateway' : authUserName
    };

    let newBalance = Math.max(0, order.balanceDue - amount);
    if (differenceAction === 'WAIVE' || differenceAction === 'CARRY_FORWARD') {
      newBalance = 0; // Mark order settled
    }
    const newStatus = newBalance <= 0 && order.status === 'DELIVERED' ? 'DELIVERED' : order.status;

    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      balanceDue: newBalance,
      status: newStatus,
      differenceAction: differenceAction || o.differenceAction,
      differenceAmount: differenceAction ? differenceAmount : o.differenceAmount,
      payments: [...o.payments, newPayment]
    } : o));

    // Update customer outstanding and adjustment balance
    setCustomers(prev => prev.map(c => {
      if (c.id !== order.customerId) return c;
      const currentAdj = c.adjustmentBalance || 0;
      const newAdj = (differenceAction === 'CARRY_FORWARD' && differenceAmount)
        ? Number((currentAdj + differenceAmount).toFixed(2))
        : currentAdj;
      return {
        ...c,
        outstandingAmount: (differenceAction || newBalance === 0) ? 0 : Math.max(0, c.outstandingAmount - amount),
        adjustmentBalance: newAdj
      };
    }));

    if (differenceAction === 'WAIVE') {
      addAuditLog({
        orderId: order.id,
        orderNumber: order.orderNumber,
        action: 'PAYMENT_DIFFERENCE_WAIVED',
        changedBy: channel === 'ONLINE_PORTAL' ? 'Customer Portal' : `${authUserName} (${authUserRole})`,
        userRole: authUserRole,
        fieldName: 'Difference Resolution',
        previousValue: `Bal: Rs. ${order.balanceDue}`,
        newValue: `Paid: Rs. ${amount}, Waived: Rs. ${differenceAmount?.toFixed(2)}`,
        reason: `Payment difference of Rs. ${differenceAmount?.toFixed(2)} waived by staff. Order settled.`
      });
      showToast(`Payment of Rs. ${amount.toFixed(2)} recorded. Rs. ${differenceAmount?.toFixed(2)} waived & order settled!`, 'success');
    } else if (differenceAction === 'CARRY_FORWARD') {
      addAuditLog({
        orderId: order.id,
        orderNumber: order.orderNumber,
        action: 'PAYMENT_DIFFERENCE_CARRIED_FORWARD',
        changedBy: channel === 'ONLINE_PORTAL' ? 'Customer Portal' : `${authUserName} (${authUserRole})`,
        userRole: authUserRole,
        fieldName: 'Customer Adjustment Balance',
        previousValue: `Bal: Rs. ${order.balanceDue}`,
        newValue: `Paid: Rs. ${amount}, Carried Forward: Rs. ${differenceAmount?.toFixed(2)}`,
        reason: `Rs. ${differenceAmount?.toFixed(2)} saved to customer adjustment balance for next order. Order settled.`
      });
      showToast(`Payment of Rs. ${amount.toFixed(2)} recorded. Rs. ${differenceAmount?.toFixed(2)} carried forward to customer balance!`, 'success');
    } else {
      addAuditLog({
        orderId: order.id,
        orderNumber: order.orderNumber,
        action: 'PAYMENT_COLLECTION',
        changedBy: channel === 'ONLINE_PORTAL' ? 'Customer Self-Service Portal' : `${authUserName} (${authUserRole})`,
        userRole: authUserRole,
        fieldName: `Payment (${method})`,
        previousValue: `Bal: Rs. ${order.balanceDue}`,
        newValue: `Paid: Rs. ${amount}, New Bal: Rs. ${newBalance}`,
        reason: `Settlement via ${method} (${channel})`
      });
      showToast(`Payment of Rs. ${amount.toFixed(2)} recorded via ${method}! WhatsApp confirmation dispatched.`, 'success');
    }

    // Sync payment to backend server database
    fetch(`/api/orders/${encodeURIComponent(orderId)}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        paymentMethod: method
      })
    }).catch(err => {
      console.warn('Server payment sync note:', err);
    });

    // Auto WhatsApp WA-003 Payment Received
    setTimeout(() => {
      sendWhatsAppNotification('PAYMENT_RECEIVED', orderId);
    }, 300);

    return { success: true };
  };

  // COMPLETE DELIVERY & HANDOVER
  const completeDelivery = (
    orderId: string, 
    deliveredBarcodes: string[], 
    signatureData?: string, 
    paymentAmount?: number, 
    paymentMethod: PaymentTransaction['paymentMethod'] = 'CASH',
    differenceAction?: 'WAIVE' | 'CARRY_FORWARD',
    differenceAmount?: number
  ) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false };

    const now = new Date();
    const formatted = `${now.getDate().toString().padStart(2, '0')}-${now.toLocaleString('default', { month: 'short' })}-${now.getFullYear().toString().slice(-2)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    let newPayments = [...order.payments];
    let newBal = order.balanceDue;

    if (paymentAmount && paymentAmount > 0) {
      const newPay: PaymentTransaction = {
        id: `pay-${Date.now()}`,
        orderId,
        amount: paymentAmount,
        paymentMethod,
        channel: 'COUNTER',
        timestamp: new Date().toISOString(),
        collectedBy: authUserName
      };
      newPayments.push(newPay);
      newBal = Math.max(0, order.balanceDue - paymentAmount);
    }

    if (differenceAction === 'WAIVE' || differenceAction === 'CARRY_FORWARD') {
      newBal = 0; // Mark order settled
    }

    const updatedItems = order.items.map(item => {
      if (deliveredBarcodes.includes(item.barcode)) {
        return {
          ...item,
          status: 'DELIVERED' as const,
          deliveredOn: formatted,
          deliveredBy: authUsername
        };
      }
      return item;
    });

    const allDelivered = updatedItems.every(i => i.status === 'DELIVERED');
    const orderStatus = allDelivered ? 'DELIVERED' : 'PARTIALLY_DELIVERED';

    const updatedOrder: Order = {
      ...order,
      items: updatedItems,
      payments: newPayments,
      balanceDue: newBal,
      status: orderStatus,
      differenceAction: differenceAction || order.differenceAction,
      differenceAmount: differenceAction ? differenceAmount : order.differenceAmount,
      pickedUpAt: formatted,
      pickedUpBy: `${authUserName} (${authUserRole})`,
      pickupDate: formatted.split(' ')[0],
      customerSignature: signatureData || order.customerSignature
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));

    // Update customer stats and adjustment balance
    setCustomers(prev => prev.map(c => {
      if (c.id !== order.customerId) return c;
      const currentAdj = c.adjustmentBalance || 0;
      const newAdj = (differenceAction === 'CARRY_FORWARD' && differenceAmount)
        ? Number((currentAdj + differenceAmount).toFixed(2))
        : currentAdj;
      return {
        ...c,
        outstandingAmount: (differenceAction || newBal === 0) ? 0 : Math.max(0, c.outstandingAmount - (paymentAmount || 0)),
        adjustmentBalance: newAdj,
        pendingOrdersCount: allDelivered ? Math.max(0, c.pendingOrdersCount - 1) : c.pendingOrdersCount,
        lastVisit: '0 Day ago'
      };
    }));

    if (differenceAction === 'WAIVE') {
      addAuditLog({
        orderId: order.id,
        orderNumber: order.orderNumber,
        action: 'PAYMENT_DIFFERENCE_WAIVED',
        changedBy: `${authUserName} (${authUserRole})`,
        userRole: authUserRole,
        fieldName: 'Delivery Payment Settlement',
        previousValue: `Due: Rs. ${order.balanceDue.toFixed(2)}`,
        newValue: `Collected: Rs. ${paymentAmount || 0}, Waived: Rs. ${differenceAmount?.toFixed(2)}`,
        reason: `Payment difference of Rs. ${differenceAmount?.toFixed(2)} waived by staff. Order marked settled.`
      });
      showToast(`Collected Rs. ${paymentAmount || 0}. Difference of Rs. ${differenceAmount?.toFixed(2)} waived & order settled!`, 'success');
    } else if (differenceAction === 'CARRY_FORWARD') {
      addAuditLog({
        orderId: order.id,
        orderNumber: order.orderNumber,
        action: 'PAYMENT_DIFFERENCE_CARRIED_FORWARD',
        changedBy: `${authUserName} (${authUserRole})`,
        userRole: authUserRole,
        fieldName: 'Customer Adjustment Balance',
        previousValue: `Due: Rs. ${order.balanceDue.toFixed(2)}`,
        newValue: `Collected: Rs. ${paymentAmount || 0}, Carried Forward: Rs. ${differenceAmount?.toFixed(2)}`,
        reason: `Rs. ${differenceAmount?.toFixed(2)} saved to customer adjustment balance for next order. Order marked settled.`
      });
      showToast(`Collected Rs. ${paymentAmount || 0}. Rs. ${differenceAmount?.toFixed(2)} saved to customer adjustment balance!`, 'success');
    } else {
      addAuditLog({
        orderId: order.id,
        orderNumber: order.orderNumber,
        action: 'DELIVERY_COMPLETED',
        changedBy: `${authUserName} (${authUserRole})`,
        userRole: authUserRole,
        fieldName: 'Garment Handover & QR Pickup',
        previousValue: `${order.items.filter(i => i.status === 'DELIVERED').length} delivered`,
        newValue: `${deliveredBarcodes.length} garments handed over to customer`,
        reason: signatureData ? 'Customer signature verified on glass' : 'Direct counter handover'
      });
      showToast(`Delivered ${deliveredBarcodes.length} garments! Order #${order.orderNumber} status updated to ${orderStatus}.`, 'success');
    }

    // Auto WhatsApp WA-004 Feedback request if completed
    setTimeout(() => {
      sendWhatsAppNotification('ORDER_DELIVERED_FEEDBACK', orderId);
    }, 500);

    return { success: true, order: updatedOrder };
  };

  const updateCustomerAdjustmentBalance = (customerId: string, deltaOrNew: number, isDelta: boolean = false) => {
    setCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      const current = c.adjustmentBalance || 0;
      const updated = isDelta ? Math.max(0, current + deltaOrNew) : Math.max(0, deltaOrNew);
      return {
        ...c,
        adjustmentBalance: Number(updated.toFixed(2))
      };
    }));
  };

  // UPDATE GARMENT PRESSING METHOD
  const updateGarmentPressingMethod = (orderId: string, barcode: string, pressingMethod: PressingMethod) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.orderNumber.toString() === orderId) {
        const updatedItems = order.items.map(item => {
          if (item.barcode === barcode) {
            return { ...item, pressingMethod };
          }
          return item;
        });
        return { ...order, items: updatedItems };
      }
      return order;
    }));

    addAuditLog({
      orderId: orderId,
      orderNumber: parseInt(orderId.replace(/\D/g, '')) || 0,
      action: 'STATUS_UPDATE',
      changedBy: `${authUserName} (${authUserRole})`,
      userRole: authUserRole,
      fieldName: `Pressing Method (${barcode})`,
      previousValue: 'Previous',
      newValue: pressingMethod,
      reason: `Updated pressing method to ${pressingMethod}`
    });

    showToast(`Updated garment ${barcode} pressing method to ${pressingMethod}.`, 'success');
  };

  // UPDATE GARMENT DETAILS
  const updateGarmentDetails = (orderId: string, barcode: string, updates: Partial<OrderGarmentItem>) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId || order.orderNumber.toString() === orderId) {
        const updatedItems = order.items.map(item => {
          if (item.barcode === barcode) {
            return { ...item, ...updates };
          }
          return item;
        });
        return { ...order, items: updatedItems };
      }
      return order;
    }));
  };

  // GARMENT RETURN
  const recordGarmentReturn = (orderId: string, barcode: string, reason: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const item = order.items.find(i => i.barcode === barcode);
    if (!item) return;

    const now = new Date().toLocaleDateString();

    const updatedItems = order.items.map(i => i.barcode === barcode ? {
      ...i,
      status: 'RETURNED' as const,
      returnedOn: now,
      returnReason: reason
    } : i);

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, items: updatedItems } : o));

    addAuditLog({
      orderId: order.id,
      orderNumber: order.orderNumber,
      action: 'GARMENT_RETURN',
      changedBy: `${authUserName} (${authUserRole})`,
      userRole: authUserRole,
      fieldName: `Return: ${item.garmentName} (${barcode})`,
      previousValue: item.status,
      newValue: 'RETURNED',
      reason: reason || 'Customer reported stain / re-cleaning requested'
    });

    showToast(`Garment ${barcode} marked as RETURNED. Re-clean workflow initiated.`, 'warning');
  };

  const addCustomer = (custData: Partial<Customer>) => {
    const nextCode = `Cust${customers.length + 65}`;
    const rawMobile = custData.mobile || '9999999999';
    const normalizedMobile = normalizeIndianPhoneNumber(rawMobile);
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      custCode: nextCode,
      name: custData.name || 'New Customer',
      mobile: normalizedMobile,
      email: custData.email || '',
      address: custData.address || '',
      area: custData.area || 'Noida',
      placeOfSupply: custData.placeOfSupply?.trim() || '',
      gstNumber: custData.gstNumber || '',
      outstandingAmount: 0,
      pendingOrdersCount: 0,
      totalOrdersCount: 0,
      lastVisit: '0 Day ago',
      notes: custData.notes || '',
      createdAt: new Date().toISOString()
    };

    setCustomers(prev => [newCust, ...prev]);
    showToast(`Customer ${newCust.name} (${newCust.mobile}) created successfully.`, 'success');
    return newCust;
  };

  const updateCustomer = (id: string, custData: Partial<Customer>): Customer | null => {
    const cust = customers.find(c => c.id === id);
    if (!cust) return null;

    const normalizedMobile = custData.mobile ? normalizeIndianPhoneNumber(custData.mobile) : cust.mobile;
    const updatedCust: Customer = {
      ...cust,
      name: custData.name !== undefined ? custData.name : cust.name,
      mobile: normalizedMobile,
      email: custData.email !== undefined ? custData.email : cust.email,
      address: custData.address !== undefined ? custData.address : cust.address,
      area: custData.area !== undefined ? custData.area : cust.area,
      placeOfSupply: custData.placeOfSupply !== undefined ? custData.placeOfSupply : cust.placeOfSupply,
      gstNumber: custData.gstNumber !== undefined ? custData.gstNumber : cust.gstNumber,
      notes: custData.notes !== undefined ? custData.notes : cust.notes,
    };

    setCustomers(prev => prev.map(c => c.id === id ? updatedCust : c));

    // Update customer info across associated orders
    setOrders(prev => prev.map(o => o.customerId === id ? {
      ...o,
      customerName: updatedCust.name,
      customerMobile: updatedCust.mobile,
      customerAddress: updatedCust.address,
      customerPlaceOfSupply: updatedCust.placeOfSupply
    } : o));

    addAuditLog({
      orderId: 'CUSTOMER-UPDATE',
      orderNumber: 0,
      action: 'CUSTOMER_UPDATE',
      changedBy: `${authUserName} (${authUserRole})`,
      userRole: authUserRole,
      fieldName: `Customer Profile (${updatedCust.custCode})`,
      previousValue: `${cust.name} (${cust.mobile})`,
      newValue: `${updatedCust.name} (${updatedCust.mobile})`,
      reason: 'Customer information updated'
    });

    fetch('/api/customers', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updatedCust)
    }).catch(err => console.warn('Customer update sync note:', err));

    showToast(`Customer ${updatedCust.name} updated successfully.`, 'success');
    return updatedCust;
  };

  const updateOrder = (orderId: string, orderData: Partial<Order>) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const updatedOrder: Order = {
      ...order,
      ...orderData,
      updatedAt: new Date().toISOString(),
      updatedBy: `${authUserName} (${authUserRole})`
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));

    addAuditLog({
      orderId: order.id,
      orderNumber: order.orderNumber,
      action: 'ORDER_UPDATE',
      changedBy: `${authUserName} (${authUserRole})`,
      userRole: authUserRole,
      fieldName: 'Order Details',
      previousValue: `Net: ₹${order.netAmount}, Status: ${order.status}`,
      newValue: `Net: ₹${updatedOrder.netAmount}, Status: ${updatedOrder.status}`,
      reason: `${authUserRole === 'ADMIN' ? 'Admin' : 'Manager'} updated order details`
    });

    fetch('/api/orders', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updatedOrder)
    }).catch(err => console.warn('Server order update sync note:', err));

    showToast(`Order #${order.orderNumber} updated successfully.`, 'success');
    return { success: true, order: updatedOrder };
  };

  const cancelOrder = (orderId: string, reason: string = 'Staff cancelled order') => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const updatedOrder: Order = {
      ...order,
      status: 'CANCELLED',
      updatedAt: new Date().toISOString(),
      updatedBy: `${authUserName} (${authUserRole})`
    };

    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));

    if (order.balanceDue > 0 && order.status !== 'CANCELLED') {
      setCustomers(prev => prev.map(c => {
        if (c.id !== order.customerId) return c;
        return {
          ...c,
          outstandingAmount: Math.max(0, (c.outstandingAmount || 0) - order.balanceDue),
          pendingOrdersCount: Math.max(0, (c.pendingOrdersCount || 0) - 1)
        };
      }));
    }

    addAuditLog({
      orderId: order.id,
      orderNumber: order.orderNumber,
      action: 'ORDER_CANCEL',
      changedBy: `${authUserName} (${authUserRole})`,
      userRole: authUserRole,
      fieldName: 'status',
      previousValue: order.status,
      newValue: 'CANCELLED',
      reason
    });

    fetch('/api/orders', {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updatedOrder)
    }).catch(err => console.warn('Order cancel sync note:', err));

    showToast(`Order #${order.orderNumber} has been cancelled.`, 'info');
    return { success: true, order: updatedOrder };
  };

  const deleteOrder = (orderId: string, reason: string = 'Staff deleted order') => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'Order not found' };

    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (activeOrderId === orderId) {
      setActiveOrderId('');
    }

    if (order.balanceDue > 0 && order.status !== 'CANCELLED') {
      setCustomers(prev => prev.map(c => {
        if (c.id !== order.customerId) return c;
        return {
          ...c,
          outstandingAmount: Math.max(0, (c.outstandingAmount || 0) - order.balanceDue),
          pendingOrdersCount: Math.max(0, (c.pendingOrdersCount || 0) - 1),
          totalOrdersCount: Math.max(0, (c.totalOrdersCount || 1) - 1)
        };
      }));
    }

    addAuditLog({
      orderId: order.id,
      orderNumber: order.orderNumber,
      action: 'ORDER_DELETE',
      changedBy: `${authUserName} (${authUserRole})`,
      userRole: authUserRole,
      fieldName: 'order',
      previousValue: `Order #${order.orderNumber}`,
      newValue: 'DELETED',
      reason
    });

    fetch(`/api/orders/${order.id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    }).catch(err => console.warn('Order delete sync note:', err));

    showToast(`Order #${order.orderNumber} deleted permanently.`, 'warning');
    return { success: true };
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setBusinessSettings(initialBusinessSettings);
    setCurrentUser(initialUsers[0]);
    setOrders(initialOrders);
    setCustomers(initialCustomers);
    setUsers(initialUsers);
    setWhatsAppMessages(initialWhatsAppMessages);
    setEmailMessages([]);
    setAuditLogs(initialAuditLogs);
    setPriceCorrectionRequests([]);
    setActiveOrderId('ord-4');
    showToast('Reset all database records and settings to default factory values.', 'info');
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      isAuthenticating,
      currentUser,
      currentRole,
      login,
      logout,
      addUser,
      updateUserStatus,
      resetUserPassword,
      refreshUsers,
      switchRole,
      businessSettings,
      updateBusinessSettings,
      orders,
      customers,
      users,
      whatsAppMessages,
      emailMessages,
      auditLogs,
      priceCorrectionRequests,
      activeView,
      setActiveView,
      activeOrderId,
      setActiveOrderId,
      activeCustomerId,
      setActiveCustomerId,
      selectedOrder,
      createOrder,
      updateOrderPrice,
      updateOrderDiscount,
      submitPriceCorrectionRequest,
      requestPriceCorrection,
      reviewPriceCorrectionRequest,
      reviewPriceCorrection,
      updateGarmentStatus,
      updateGarmentPressingMethod,
      updateGarmentDetails,
      recordPayment,
      completeDelivery,
      recordGarmentReturn,
      resendPaymentLink,
      updateCustomerAdjustmentBalance,
      sendWhatsAppNotification,
      sendEmailNotification,
      sendManualSMS,
      sendManualEmail,
      isWhatsAppSimulatorOpen,
      setWhatsAppSimulatorOpen,
      isThermalReceiptModalOpen,
      setThermalReceiptModalOpen,
      isQRTagPreviewModalOpen,
      setQRTagPreviewModalOpen,
      isCustomerPortalOpen,
      setCustomerPortalOpen,
      isPublicPortalMode,
      setIsPublicPortalMode,
      publicPortalQuery,
      setPublicPortalQuery,
      openPublicPortal,
      exitPublicPortal,
      isPriceCorrectionModalOpen,
      setPriceCorrectionModalOpen,
      isSignatureModalOpen,
      setSignatureModalOpen,
      isQRPickupScanModalOpen,
      setQRPickupScanModalOpen,
      qrPickupInitialQuery,
      setQrPickupInitialQuery,
      openQRPickupModal,
      lookupOrderByQR,
      addCustomer,
      updateCustomer,
      updateOrder,
      cancelOrder,
      deleteOrder,
      toastMessage,
      showToast,
      hideToast,
      resetToDefaults
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
