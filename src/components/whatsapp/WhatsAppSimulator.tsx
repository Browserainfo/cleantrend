import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Paperclip, 
  Smile, 
  Mic, 
  Send, 
  CheckCheck, 
  Phone, 
  Video, 
  MoreVertical, 
  ExternalLink, 
  X,
  MessageSquare,
  Sparkles,
  Bot,
  Mail,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  User,
  ShoppingBag,
  MapPin,
  Share2,
  QrCode,
  Download
} from 'lucide-react';
import { WhatsAppTriggerType } from '../../types';
import { extractReceiptQueryFromUrlString, findOrderFromReceiptQuery } from '../../utils/portalUrlUtils';

export const WhatsAppSimulator: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { 
    whatsAppMessages, 
    emailMessages,
    orders, 
    customers,
    businessSettings,
    sendWhatsAppNotification, 
    sendEmailNotification,
    setActiveOrderId,
    setCustomerPortalOpen,
    openPublicPortal,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'WHATSAPP' | 'EMAIL' | 'LOGS'>('WHATSAPP');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [selectedEmailId, setSelectedEmailId] = useState<string>('');

  if (!isOpen) return null;

  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0] || {
    id: 'cust-temp',
    name: 'Customer',
    mobile: '9999999999',
    email: '',
    custCode: 'CUST-01',
    address: '',
    placeOfSupply: 'Chandigarh'
  };

  const customerOrders = orders.filter(o => o.customerId === currentCustomer.id);
  const activeOrder = customerOrders[0] || orders[0];

  // Filter WhatsApp messages for this customer
  const filteredWhatsApp = whatsAppMessages.filter(m => 
    m.toPhone.includes(currentCustomer.mobile) || 
    currentCustomer.mobile.includes(m.toPhone) ||
    m.toName.toLowerCase().includes(currentCustomer.name.toLowerCase())
  );

  // Filter Email messages for this customer
  const filteredEmails = emailMessages.filter(m => 
    (currentCustomer.email && m.toEmail.toLowerCase() === currentCustomer.email.toLowerCase()) ||
    m.toName.toLowerCase().includes(currentCustomer.name.toLowerCase()) ||
    (activeOrder && m.orderNumber === activeOrder.orderNumber)
  );

  const activeEmailMessage = emailMessages.find(m => m.id === selectedEmailId) || filteredEmails[0] || emailMessages[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const messageToSend = typedMessage.trim();

    // 1. Keep existing CRM message-saving behavior
    if (activeOrder) {
      sendWhatsAppNotification('ORDER_UPDATED', activeOrder.id, messageToSend);
    }

    // 2. Format customer's mobile number
    const cleanDigits = (currentCustomer.mobile || '').replace(/\D/g, '');
    const normalizedPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;

    // 3. Open WhatsApp in new tab and show toast
    if (normalizedPhone) {
      const waUrl = `https://api.whatsapp.com/send?phone=${normalizedPhone}&text=${encodeURIComponent(messageToSend)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      showToast(`Opening WhatsApp for ${currentCustomer.name} (+${normalizedPhone})...`, 'success');
    } else {
      showToast('Customer mobile number is missing or invalid.', 'error');
    }

    // 4. Clear input field
    setTypedMessage('');
  };

  const handleOpenReceiptFromChat = (url?: string) => {
    const extracted = url ? extractReceiptQueryFromUrlString(url) : null;
    const found = extracted ? findOrderFromReceiptQuery(extracted, orders) : (activeOrder || null);
    
    if (found) {
      setActiveOrderId(found.id);
      openPublicPortal(extracted || found.id);
    } else {
      openPublicPortal(extracted || 'NOT_FOUND');
    }
    onClose();
    showToast('Opening customer invoice & payment portal...', 'info');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-[#111b21] rounded-xl shadow-2xl max-w-5xl w-full h-[88vh] border border-[#222e35] overflow-hidden flex flex-col">
        {/* Window Top Titlebar & Navigation Tabs */}
        <div className="bg-[#202c33] px-4 py-2.5 text-slate-300 text-xs flex flex-wrap items-center justify-between border-b border-[#222e35] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
            </div>
            <span className="font-bold text-white tracking-wide flex items-center gap-1.5 text-sm">
              <Bot className="w-4 h-4 text-emerald-400" />
              Customer & Order Notification Center
            </span>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-[#111b21] p-0.5 rounded-lg border border-[#2a3942]">
            <button
              onClick={() => setActiveTab('WHATSAPP')}
              className={`px-3 py-1 rounded-md font-semibold text-xs flex items-center gap-1.5 transition ${
                activeTab === 'WHATSAPP' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Chat ({filteredWhatsApp.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('EMAIL')}
              className={`px-3 py-1 rounded-md font-semibold text-xs flex items-center gap-1.5 transition ${
                activeTab === 'EMAIL' 
                  ? 'bg-sky-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Confirmations ({emailMessages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('LOGS')}
              className={`px-3 py-1 rounded-md font-semibold text-xs flex items-center gap-1.5 transition ${
                activeTab === 'LOGS' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dispatch Logs</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-[#2a3942] transition"
              title="Close Notification Center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customer Quick Selector Ribbon */}
        <div className="bg-[#182229] px-4 py-2 border-b border-[#222e35] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-semibold">Active Customer:</span>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="bg-[#202c33] text-white border border-[#2a3942] rounded px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.mobile}) {c.placeOfSupply ? `– ${c.placeOfSupply}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>
              <strong className="text-slate-200">Mobile:</strong> {currentCustomer.mobile}
            </span>
            <span>
              <strong className="text-slate-200">Email:</strong> {currentCustomer.email || <span className="text-amber-400 italic">None (Email skipped)</span>}
            </span>
            <span>
              <strong className="text-slate-200">Place of Supply:</strong> {currentCustomer.placeOfSupply || 'Not set'}
            </span>
          </div>
        </div>

        {/* TAB 1: WHATSAPP SIMULATION */}
        {activeTab === 'WHATSAPP' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Customer Contacts List */}
            <div className="w-72 bg-[#111b21] border-r border-[#222e35] flex flex-col hidden md:flex">
              <div className="p-2.5 bg-[#202c33] flex items-center justify-between text-xs font-semibold text-slate-200">
                <span>Recent Conversations</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Live Dispatch
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]">
                {customers.map((cust) => {
                  const isSelected = cust.id === selectedCustomerId;
                  const custMessages = whatsAppMessages.filter(m => m.toPhone.includes(cust.mobile) || cust.mobile.includes(m.toPhone));
                  const latestMsg = custMessages[0];

                  return (
                    <div
                      key={cust.id}
                      onClick={() => setSelectedCustomerId(cust.id)}
                      className={`p-3 flex items-center gap-3 cursor-pointer transition ${
                        isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-xs text-white shrink-0">
                        {cust.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CU'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200 text-xs truncate">{cust.name}</span>
                          <span className="text-[10px] text-slate-400">{cust.placeOfSupply ? cust.placeOfSupply.slice(0, 10) : ''}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="truncate">
                            {latestMsg ? latestMsg.messageText.slice(0, 35) + '...' : `Customer Mobile: ${cust.mobile}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 1-Click Trigger Simulation Panel */}
              <div className="p-3 bg-[#202c33] border-t border-[#222e35] space-y-1.5">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Trigger Automated Template</span>
                  <span className="text-emerald-400">Dynamic Data</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <button
                    onClick={() => activeOrder && sendWhatsAppNotification('ORDER_CREATED', activeOrder.id)}
                    className="p-1.5 bg-[#111b21] hover:bg-[#2a3942] text-slate-200 rounded font-medium text-left border border-slate-700 hover:border-emerald-500 transition"
                  >
                    WA-001: Order Created
                  </button>
                  <button
                    onClick={() => activeOrder && sendWhatsAppNotification('PICKUP_SCHEDULED', activeOrder.id)}
                    className="p-1.5 bg-[#111b21] hover:bg-[#2a3942] text-slate-200 rounded font-medium text-left border border-slate-700 hover:border-emerald-500 transition"
                  >
                    WA-002: Pickup Slot
                  </button>
                  <button
                    onClick={() => activeOrder && sendWhatsAppNotification('ORDER_READY', activeOrder.id)}
                    className="p-1.5 bg-[#111b21] hover:bg-[#2a3942] text-slate-200 rounded font-medium text-left border border-slate-700 hover:border-emerald-500 transition"
                  >
                    WA-005: Order Ready
                  </button>
                  <button
                    onClick={() => activeOrder && sendWhatsAppNotification('PAYMENT_RECEIVED', activeOrder.id)}
                    className="p-1.5 bg-[#111b21] hover:bg-[#2a3942] text-slate-200 rounded font-medium text-left border border-slate-700 hover:border-emerald-500 transition"
                  >
                    WA-003: Payment Done
                  </button>
                </div>
              </div>
            </div>

            {/* Right Chat Thread Canvas */}
            <div className="flex-1 bg-[#0b141a] flex flex-col">
              {/* Chat Top Header */}
              <div className="bg-[#202c33] p-3 flex items-center justify-between border-b border-[#222e35]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-xs text-white">
                    {currentCustomer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CU'}
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                      <span>{currentCustomer.name}</span>
                      {currentCustomer.placeOfSupply && (
                        <span className="bg-sky-950 text-sky-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-sky-800">
                          {currentCustomer.placeOfSupply}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                      <span>+91 {currentCustomer.mobile}</span>
                      <span>• Verified WhatsApp Channel</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  {/* Direct WhatsApp Web Button */}
                  <button
                    onClick={() => {
                      const cleanDigits = (currentCustomer.mobile || '').replace(/\D/g, '');
                      const normalized = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
                      const latestMsg = filteredWhatsApp[0]?.messageText || `Hello ${currentCustomer.name}, thank you for choosing ${businessSettings.businessName}!`;
                      window.open(`https://api.whatsapp.com/send?phone=${normalized}&text=${encodeURIComponent(latestMsg)}`, '_blank', 'noopener,noreferrer');
                      showToast(`Opening WhatsApp Web for ${currentCustomer.name} (+${normalized})...`, 'success');
                    }}
                    className="px-2.5 py-1 bg-[#25D366] hover:bg-[#1ebd59] text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                    title="Open chat directly in WhatsApp Web / App"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Open WhatsApp Web</span>
                  </button>

                  <button className="hover:text-white p-1 cursor-pointer"><Phone className="w-4 h-4" /></button>
                  <button className="hover:text-white p-1 cursor-pointer"><Video className="w-4 h-4" /></button>
                  <button className="hover:text-white p-1 cursor-pointer"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </div>

              {/* Chat Messages Canvas with WhatsApp Wallpaper & Bubbles */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
                {/* Date separator */}
                <div className="text-center">
                  <span className="bg-[#182229] text-slate-400 text-[10px] px-3 py-1 rounded-md shadow-xs uppercase tracking-wider font-semibold">
                    Today's Automated Notifications
                  </span>
                </div>

                {filteredWhatsApp.length === 0 && (
                  <div className="p-8 text-center text-slate-400 space-y-2 bg-[#182229]/60 rounded-lg border border-[#222e35] max-w-md mx-auto my-6">
                    <MessageSquare className="w-8 h-8 mx-auto text-slate-500" />
                    <p className="font-semibold text-slate-200">No WhatsApp messages dispatched yet for {currentCustomer.name}.</p>
                    <p className="text-xs text-slate-400">
                      Create an order or click any trigger button in the left panel to test notification delivery!
                    </p>
                  </div>
                )}

                {filteredWhatsApp.map((msg) => (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-md sm:max-w-lg bg-[#005c4b] text-slate-100 p-3.5 rounded-lg shadow-md text-xs relative space-y-2 border border-[#00705a]/50">
                      {/* Message Body with white-space */}
                      <div className="whitespace-pre-line font-sans leading-relaxed text-[12.5px]">
                        {(() => {
                          const urlRegex = /(https?:\/\/[^\s]+)/g;
                          const parts = msg.messageText.split(urlRegex);
                          return parts.map((part, index) => {
                            if (part.match(/^https?:\/\//)) {
                              const url = part.trim();
                              return (
                                <div key={index} className="my-2 p-2.5 bg-[#025142] rounded-lg border border-[#046a57] shadow-inner space-y-1">
                                  <div className="text-[10px] text-emerald-300 font-bold uppercase flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-300" />
                                    <span>Self-Service Receipt & Payment Portal</span>
                                  </div>
                                  <div className="flex items-center gap-2 pt-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenReceiptFromChat(url)}
                                      className="text-sky-300 hover:text-sky-100 underline font-mono text-[11px] break-all text-left flex items-center gap-1 font-semibold cursor-pointer"
                                      title="Open Invoice Directly"
                                    >
                                      <span>{url}</span>
                                      <ExternalLink className="w-3 h-3 shrink-0" />
                                    </button>
                                  </div>
                                </div>
                              );
                            }
                            return <span key={index}>{part}</span>;
                          });
                        })()}
                      </div>

                      {/* Attached Payment QR / Scanner Image (Single communication delivery) */}
                      {(msg.mediaUrl || msg.qrImageUrl) && (
                        <div className="my-2 p-2.5 bg-[#025142] rounded-lg border border-[#046a57] shadow-inner space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-200">
                            <span className="flex items-center gap-1.5">
                              <QrCode className="w-3.5 h-3.5 text-emerald-300" />
                              Payment Scanner
                            </span>
                            <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded font-mono font-semibold">
                              Scan to Pay
                            </span>
                          </div>

                          <div className="bg-white rounded-lg p-2 flex flex-col items-center justify-center shadow-xs border border-emerald-900/30">
                            <img
                              src={msg.mediaUrl || msg.qrImageUrl}
                              alt="Payment Scanner QR Code"
                              className="w-52 max-w-full rounded object-contain cursor-pointer hover:scale-[1.01] transition shadow-xs"
                              onClick={() => window.open(msg.mediaUrl || msg.qrImageUrl, '_blank')}
                              title="Click to view full payment scanner"
                            />
                            <div className="mt-1.5 text-center">
                              <p className="text-[11px] font-bold text-slate-900 tracking-wide">
                                {businessSettings.upiPayeeName || 'PRITPAL SINGH'}
                              </p>
                              <p className="text-[10px] font-mono font-semibold text-slate-600">
                                UPI ID: {businessSettings.upiId || '9041590866@hdfc'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-0.5 text-[10.5px] text-emerald-100">
                            <span className="truncate">Scan with GPay, PhonePe, Paytm, or BHIM</span>
                            <a
                              href={msg.mediaUrl || msg.qrImageUrl}
                              download={`Payment-QR-Order-${msg.orderNumber || 'trendera'}.png`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-medium flex items-center gap-1 shrink-0 transition"
                            >
                              <Download className="w-3 h-3" />
                              <span>Save / Scan</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Bubble Footer: Timestamp + Status Double Tick + Open in WhatsApp Action */}
                      <div className="flex items-center justify-between gap-1.5 text-[10px] text-emerald-200/80 pt-1 border-t border-[#00705a]/30">
                        <button
                          type="button"
                          onClick={() => {
                            const cleanDigits = (msg.toPhone || currentCustomer.mobile || '').replace(/\D/g, '');
                            const normalized = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
                            window.open(`https://api.whatsapp.com/send?phone=${normalized}&text=${encodeURIComponent(msg.messageText)}`, '_blank', 'noopener,noreferrer');
                            showToast(`Opening WhatsApp chat with +${normalized}...`, 'success');
                          }}
                          className="text-emerald-300 hover:text-white flex items-center gap-1 font-semibold underline underline-offset-2 cursor-pointer"
                        >
                          <Share2 className="w-2.5 h-2.5" />
                          <span>Send via WhatsApp</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <span>{msg.timestamp}</span>
                          {msg.status === 'FAILED' ? (
                            <span className="text-rose-300 flex items-center gap-1 font-semibold">
                              <AlertCircle className="w-3 h-3 text-rose-300" /> Failed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-sky-300">
                              <CheckCheck className="w-3.5 h-3.5 text-sky-300" /> Delivered
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="bg-[#202c33] p-2.5 flex items-center gap-2 border-t border-[#222e35]">
                <button type="button" className="text-slate-400 hover:text-slate-200 p-1">
                  <Smile className="w-5 h-5" />
                </button>
                <button type="button" className="text-slate-400 hover:text-slate-200 p-1">
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder={`Send custom notification to ${currentCustomer.name}...`}
                  className="flex-1 bg-[#2a3942] text-slate-100 text-xs px-4 py-2.5 rounded-lg outline-none placeholder-slate-400 focus:ring-1 focus:ring-emerald-500"
                />

                {typedMessage.trim() ? (
                  <button type="submit" className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition">
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button type="button" className="text-slate-400 hover:text-slate-200 p-1">
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: EMAIL ORDER CONFIRMATION PREVIEW */}
        {activeTab === 'EMAIL' && (
          <div className="flex-1 flex overflow-hidden bg-slate-900">
            {/* Left Email Inbox List */}
            <div className="w-72 bg-[#182229] border-r border-[#222e35] flex flex-col">
              <div className="p-3 bg-[#202c33] flex items-center justify-between text-xs font-semibold text-slate-200">
                <span>Dispatched Emails ({emailMessages.length})</span>
                <button
                  onClick={() => activeOrder && sendEmailNotification(activeOrder.id)}
                  className="text-[10px] bg-sky-600 hover:bg-sky-500 text-white px-2 py-0.5 rounded font-bold transition"
                >
                  + Re-send
                </button>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]">
                {emailMessages.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No emails dispatched yet. Create an order for a customer with an email address to view real-time confirmations.
                  </div>
                )}

                {emailMessages.map((em) => {
                  const isSelected = em.id === (activeEmailMessage?.id || '');
                  return (
                    <div
                      key={em.id}
                      onClick={() => setSelectedEmailId(em.id)}
                      className={`p-3 cursor-pointer transition text-xs ${
                        isSelected ? 'bg-[#2a3942] border-l-2 border-sky-400' : 'hover:bg-[#202c33]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-200 font-semibold mb-1">
                        <span className="truncate">{em.toName}</span>
                        <span className="text-[10px] text-slate-400">{em.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-sky-400 font-mono truncate mb-1">
                        {em.toEmail}
                      </div>
                      <div className="text-[11px] text-slate-300 font-medium truncate">
                        {em.subject}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Rendered Email View Canvas */}
            <div className="flex-1 bg-slate-100 flex flex-col overflow-y-auto p-4 sm:p-6 text-slate-800">
              {activeEmailMessage ? (
                <div className="max-w-2xl mx-auto w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                  {/* Email Meta Header */}
                  <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold uppercase">Subject:</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-300">
                        {activeEmailMessage.status}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{activeEmailMessage.subject}</h2>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600">
                      <div><strong className="text-slate-700">To:</strong> {activeEmailMessage.toName} &lt;{activeEmailMessage.toEmail}&gt;</div>
                      <div className="text-right"><strong className="text-slate-700">Dispatched:</strong> {activeEmailMessage.timestamp}</div>
                    </div>
                  </div>

                  {/* Rendered HTML Email Body */}
                  <div 
                    className="p-6 overflow-x-auto font-sans"
                    dangerouslySetInnerHTML={{ __html: activeEmailMessage.bodyHtml }}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8 text-slate-500">
                  <div>
                    <Mail className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                    <p className="font-semibold text-base text-slate-700">Select an email to view rendered confirmation</p>
                    <p className="text-xs text-slate-500">Orders created with customer email addresses generate full HTML invoice confirmations.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DISPATCH LOGS & PROVIDER AUDITS */}
        {activeTab === 'LOGS' && (
          <div className="flex-1 bg-[#0b141a] p-4 overflow-y-auto text-xs space-y-3">
            <div className="bg-[#182229] p-3 rounded-lg border border-[#222e35] flex items-center justify-between text-slate-200">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Automated Notification Engine Status</span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> WhatsApp API: Active
                </span>
                <span className="flex items-center gap-1 text-sky-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Email SMTP: Active
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Non-blocking Guard: Enabled
                </span>
              </div>
            </div>

            {/* Event Timeline Table */}
            <div className="bg-[#111b21] rounded-lg border border-[#222e35] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#202c33] text-slate-300 font-bold border-b border-[#2a3942]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Order #</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Message / Subject Preview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222e35] text-slate-300">
                  {/* WhatsApp entries */}
                  {whatsAppMessages.map((wa) => (
                    <tr key={wa.id} className="hover:bg-[#182229]">
                      <td className="p-3 font-mono text-slate-400">{wa.timestamp}</td>
                      <td className="p-3">
                        <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold text-[10px] border border-emerald-800">
                          WHATSAPP
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-200">
                        {wa.toName} ({wa.toPhone})
                      </td>
                      <td className="p-3 font-mono font-bold text-sky-400">#{wa.orderNumber}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          wa.status === 'FAILED' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {wa.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 truncate max-w-xs">{wa.messageText}</td>
                    </tr>
                  ))}

                  {/* Email entries */}
                  {emailMessages.map((em) => (
                    <tr key={em.id} className="hover:bg-[#182229]">
                      <td className="p-3 font-mono text-slate-400">{em.timestamp}</td>
                      <td className="p-3">
                        <span className="bg-sky-950 text-sky-400 px-2 py-0.5 rounded font-bold text-[10px] border border-sky-800">
                          EMAIL
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-200">
                        {em.toName} ({em.toEmail})
                      </td>
                      <td className="p-3 font-mono font-bold text-sky-400">#{em.orderNumber}</td>
                      <td className="p-3">
                        <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-800">
                          {em.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 truncate max-w-xs">{em.subject}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
