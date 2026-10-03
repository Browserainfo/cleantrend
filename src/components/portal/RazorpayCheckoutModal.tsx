import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Lock, 
  ShieldCheck, 
  X, 
  Loader2,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  RazorpayOrderResponse, 
  verifyRazorpayPayment, 
  reportRazorpayPaymentFailed,
  requestServerTestSignature 
} from '../../utils/razorpayClient';

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  orderData: RazorpayOrderResponse | null;
  onClose: () => void;
  onSuccess: (result: { order: any; transaction: any }) => void;
  onFailure?: (errorMsg: string) => void;
}

export const RazorpayCheckoutModal: React.FC<RazorpayCheckoutModalProps> = ({
  isOpen,
  orderData,
  onClose,
  onSuccess,
  onFailure
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET'>('UPI');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [verificationState, setVerificationState] = useState<'IDLE' | 'VERIFYING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('');

  if (!isOpen || !orderData) return null;

  const payableAmount = orderData.amountInRupees !== undefined 
    ? orderData.amountInRupees 
    : (orderData.amount ? orderData.amount / 100 : 0);

  // Handle successful test payment simulation with real backend HMAC signature verification
  const handleTestPaymentSuccess = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setVerificationState('VERIFYING');
    setStatusMessage('Generating Razorpay test payment response & requesting backend HMAC signature...');

    try {
      if (!orderData.orderId || !orderData.razorpayOrderId) {
        throw new Error('Missing order reference details.');
      }

      // 1. Get test cryptographic signature signed by server's Razorpay Secret Key
      const sigRes = await requestServerTestSignature({
        orderId: orderData.orderId,
        razorpayOrderId: orderData.razorpayOrderId
      });

      if (!sigRes.success || !sigRes.razorpayPaymentId || !sigRes.razorpaySignature) {
        throw new Error(sigRes.error || 'Failed to generate test signature from server.');
      }

      setStatusMessage('Submitting payment ID & cryptographic signature to backend for verification...');

      // 2. Execute strict backend verification
      const verifyRes = await verifyRazorpayPayment({
        orderId: orderData.orderId,
        razorpayOrderId: orderData.razorpayOrderId,
        razorpayPaymentId: sigRes.razorpayPaymentId,
        razorpaySignature: sigRes.razorpaySignature
      });

      if (verifyRes.success && verifyRes.order) {
        setVerificationState('SUCCESS');
        setStatusMessage('Payment verified successfully! Order marked as PAID in CRM database.');
        setTimeout(() => {
          onSuccess({ order: verifyRes.order, transaction: verifyRes.transaction });
          onClose();
        }, 1200);
      } else {
        setVerificationState('FAILED');
        setStatusMessage(verifyRes.error || 'Server rejected payment signature.');
        if (onFailure) onFailure(verifyRes.error || 'Signature verification failed.');
      }
    } catch (err: any) {
      console.error('Razorpay test checkout error:', err);
      setVerificationState('FAILED');
      setStatusMessage(err.message || 'Payment processing failed.');
      if (onFailure) onFailure(err.message || 'Payment processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle test payment failure
  const handleTestPaymentFailure = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setVerificationState('FAILED');
    const failureReason = 'User simulated payment failure (Customer cancelled / Insufficient test funds).';
    setStatusMessage(failureReason);

    try {
      if (orderData.orderId && orderData.razorpayOrderId) {
        await reportRazorpayPaymentFailed({
          orderId: orderData.orderId,
          razorpayOrderId: orderData.razorpayOrderId,
          error: { description: failureReason }
        });
      }
    } finally {
      setIsProcessing(false);
      if (onFailure) onFailure(failureReason);
    }
  };

  // Handle user dismissal
  const handleDismiss = async () => {
    if (orderData.orderId && orderData.razorpayOrderId && verificationState !== 'SUCCESS') {
      await reportRazorpayPaymentFailed({
        orderId: orderData.orderId,
        razorpayOrderId: orderData.razorpayOrderId,
        error: { description: 'Razorpay checkout popup closed by user.' }
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header branded like Razorpay */}
        <div className="bg-[#0c2340] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide">Razorpay</span>
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  TEST MODE
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate max-w-[200px]">
                {orderData.businessName || 'Trendera Dry Cleaning'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            disabled={isProcessing}
            className="text-slate-400 hover:text-white transition p-1 cursor-pointer disabled:opacity-50"
            title="Close Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Info & Amount Banner */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-200 px-5 py-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Order #{orderData.orderNumber || orderData.orderId}
            </span>
            <div className="text-xs text-slate-700 font-medium">
              {orderData.customer?.name} ({orderData.customer?.mobile})
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">Amount Due</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-slate-900">
              ₹{payableAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Razorpay Test Environment Info Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Razorpay Sandbox Mode:</strong> Real money will NOT be charged. Secret credentials stay strictly on the backend.
          </span>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Method Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Select Payment Method:</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('UPI')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  selectedMethod === 'UPI'
                    ? 'border-sky-600 bg-sky-50 text-sky-950 font-bold shadow-xs ring-1 ring-sky-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Smartphone className="w-4 h-4 text-sky-600" />
                <span className="text-[11px]">UPI</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('CARD')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  selectedMethod === 'CARD'
                    ? 'border-sky-600 bg-sky-50 text-sky-950 font-bold shadow-xs ring-1 ring-sky-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px]">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('NET_BANKING')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  selectedMethod === 'NET_BANKING'
                    ? 'border-sky-600 bg-sky-50 text-sky-950 font-bold shadow-xs ring-1 ring-sky-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="text-[11px]">NetBank</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod('WALLET')}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  selectedMethod === 'WALLET'
                    ? 'border-sky-600 bg-sky-50 text-sky-950 font-bold shadow-xs ring-1 ring-sky-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Wallet className="w-4 h-4 text-purple-600" />
                <span className="text-[11px]">Wallet</span>
              </button>
            </div>
          </div>

          {/* Method Details Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-600">
            {selectedMethod === 'UPI' && (
              <div>
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>Test UPI ID / Apps</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">Auto-approved in Test</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Google Pay, PhonePe, Paytm, or BHIM. In Test Mode, selecting Success will simulate instant bank approval.
                </p>
              </div>
            )}
            {selectedMethod === 'CARD' && (
              <div>
                <div className="font-semibold text-slate-800 flex items-center justify-between">
                  <span>Razorpay Test Card</span>
                  <span className="font-mono text-[10px] text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded font-bold">4111 •••• •••• 1111</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Standard Razorpay Visa/Mastercard test card credentials with simulated 3D Secure OTP verification.
                </p>
              </div>
            )}
            {selectedMethod === 'NET_BANKING' && (
              <div>
                <div className="font-semibold text-slate-800">Test Retail & Corporate Banks</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  HDFC, ICICI, SBI, Axis, Kotak simulated test net banking gateways.
                </p>
              </div>
            )}
            {selectedMethod === 'WALLET' && (
              <div>
                <div className="font-semibold text-slate-800">Test Wallets</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Paytm Wallet, PhonePe Wallet, Amazon Pay test balance simulation.
                </p>
              </div>
            )}
          </div>

          {/* Verification Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              verificationState === 'SUCCESS'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : verificationState === 'FAILED'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-sky-50 border-sky-300 text-sky-900'
            }`}>
              {verificationState === 'VERIFYING' && (
                <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0 mt-0.5" />
              )}
              {verificationState === 'SUCCESS' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              {verificationState === 'FAILED' && (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              {verificationState === 'IDLE' && (
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{statusMessage}</span>
            </div>
          )}

          {/* Test Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              id="rzp-test-pay-success-btn"
              onClick={handleTestPaymentSuccess}
              disabled={isProcessing || verificationState === 'SUCCESS'}
              className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 active:scale-99 text-white font-extrabold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying with Backend...</span>
                </>
              ) : verificationState === 'SUCCESS' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Payment Verified & Paid!</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{payableAmount.toFixed(2)} (Simulate Success)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                id="rzp-test-pay-fail-btn"
                onClick={handleTestPaymentFailure}
                disabled={isProcessing || verificationState === 'SUCCESS'}
                className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Test how CRM handles failed or declined payment (order remains Unpaid)"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Simulate Failure</span>
              </button>

              <button
                type="button"
                id="rzp-test-pay-cancel-btn"
                onClick={handleDismiss}
                disabled={isProcessing}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <span>Cancel / Dismiss</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit HMAC SHA256 Signature Verification</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            Key: {orderData.keyId ? `${orderData.keyId.substring(0, 12)}...` : 'rzp_test'}
          </span>
        </div>
      </div>
    </div>
  );
};
