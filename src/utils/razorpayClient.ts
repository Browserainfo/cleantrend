// Razorpay Test Mode Client Utilities
// Never store or access the Razorpay Secret Key in frontend code.

export interface RazorpayOrderResponse {
  success: boolean;
  error?: string;
  keyId?: string;
  razorpayOrderId?: string;
  amount?: number; // in paise
  amountInRupees?: number;
  currency?: string;
  orderId?: string;
  orderNumber?: number;
  customer?: {
    name: string;
    mobile: string;
    email: string;
  };
  businessName?: string;
  logoUrl?: string;
}

export interface RazorpayVerifyResponse {
  success: boolean;
  message?: string;
  error?: string;
  order?: any;
  transaction?: any;
}

// Dynamically ensure Razorpay script is loaded in the browser
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// 1. Create a Razorpay TEST Order from backend using exact payable amount
export async function createRazorpayOrder(orderId: string): Promise<RazorpayOrderResponse> {
  try {
    const res = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId })
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error creating Razorpay order' };
  }
}

// 2. Verify Razorpay Payment Signature securely on the backend
export async function verifyRazorpayPayment(payload: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<RazorpayVerifyResponse> {
  try {
    const res = await fetch('/api/razorpay/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error verifying Razorpay payment' };
  }
}

// 3. Report payment cancellation or failure to backend
export async function reportRazorpayPaymentFailed(payload: {
  orderId: string;
  razorpayOrderId?: string;
  error?: any;
  paymentId?: string;
}): Promise<void> {
  try {
    await fetch('/api/razorpay/payment-failed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('Could not report Razorpay payment failure:', e);
  }
}

// 4. Request server to generate a test HMAC signature for sandbox testing
export async function requestServerTestSignature(payload: {
  orderId: string;
  razorpayOrderId: string;
}): Promise<{ success: boolean; razorpayPaymentId?: string; razorpaySignature?: string; error?: string }> {
  try {
    const res = await fetch('/api/razorpay/simulate-test-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Signature simulation error' };
  }
}

// 5. Unified Payment Launcher: Launches official Razorpay popup when external test key is present,
// or falls back smoothly to Razorpay Test Checkout Modal with full backend HMAC verification
export async function launchRazorpayPaymentFlow(params: {
  orderId: string;
  onOpenModal: (orderData: RazorpayOrderResponse) => void;
  onSuccess: (result: { order: any; transaction: any }) => void;
  onError: (errorMsg: string) => void;
  onDismiss?: () => void;
}): Promise<void> {
  const orderRes = await createRazorpayOrder(params.orderId);
  if (!orderRes.success || !orderRes.razorpayOrderId) {
    params.onError(orderRes.error || 'Failed to create payment order.');
    return;
  }

  const isRazorpayScriptReady = await loadRazorpayScript();
  const hasExternalRazorpayAccount = orderRes.keyId && 
    orderRes.keyId.startsWith('rzp_test_') && 
    !orderRes.keyId.includes('TrenderaTestKey') &&
    typeof window !== 'undefined' && 
    Boolean((window as any).Razorpay);

  if (isRazorpayScriptReady && hasExternalRazorpayAccount) {
    try {
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency || 'INR',
        name: orderRes.businessName || 'Trendera Dry Cleaning',
        description: `Order #${orderRes.orderNumber} Payment (Test Mode)`,
        image: orderRes.logoUrl || undefined,
        order_id: orderRes.razorpayOrderId.startsWith('order_test_') ? undefined : orderRes.razorpayOrderId,
        prefill: {
          name: orderRes.customer?.name,
          contact: orderRes.customer?.mobile,
          email: orderRes.customer?.email
        },
        theme: {
          color: '#0284c7'
        },
        handler: async function (response: any) {
          const verifyRes = await verifyRazorpayPayment({
            orderId: params.orderId,
            razorpayOrderId: response.razorpay_order_id || orderRes.razorpayOrderId!,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });
          if (verifyRes.success && verifyRes.order) {
            params.onSuccess({ order: verifyRes.order, transaction: verifyRes.transaction });
          } else {
            params.onError(verifyRes.error || 'Signature verification failed on backend.');
          }
        },
        modal: {
          ondismiss: function () {
            reportRazorpayPaymentFailed({
              orderId: params.orderId,
              razorpayOrderId: orderRes.razorpayOrderId,
              error: { description: 'Razorpay checkout popup closed by user.' }
            });
            if (params.onDismiss) params.onDismiss();
          }
        }
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', function (resp: any) {
        reportRazorpayPaymentFailed({
          orderId: params.orderId,
          razorpayOrderId: orderRes.razorpayOrderId,
          paymentId: resp.error?.metadata?.payment_id,
          error: resp.error
        });
        params.onError(resp.error?.description || 'Razorpay payment failed.');
      });
      rzpInstance.open();
      return;
    } catch (e: any) {
      console.warn('Official window.Razorpay open note, using Razorpay test checkout modal:', e);
    }
  }

  // Fallback to Razorpay Test Checkout Modal (with backend HMAC signature verification)
  params.onOpenModal(orderRes);
}
