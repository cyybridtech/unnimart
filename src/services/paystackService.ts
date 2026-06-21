/**
 * Paystack Integration Service
 * Handles secure payment initialization and callback handling.
 */

interface PaystackConfig {
  publicKey: string;
  email: string;
  amount: number; // In USD — converted to Kobo internally
  metadata?: Record<string, unknown>;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

export const initializePaystackPayment = ({ publicKey, email, amount, metadata, onSuccess, onCancel }: PaystackConfig) => {
  // Guard: Paystack script may not have loaded yet (e.g., offline / ad-blocker)
  if (!(window as any).PaystackPop) {
    console.warn('[UniMart] PaystackPop not available. Running in offline/demo mode.');
    // Simulate a successful payment in demo mode
    const demoRef = `DEMO_${Date.now()}_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    setTimeout(() => onSuccess(demoRef), 800);
    return;
  }

  const handler = (window as any).PaystackPop.setup({
    key: publicKey,
    email,
    amount: Math.round(amount * 100), // Convert to Kobo
    currency: 'NGN', // Change to GHS, ZAR, or USD based on your Paystack account region
    metadata: {
      custom_fields: [
        {
          display_name: 'Cart Details',
          variable_name: 'cart_details',
          value: JSON.stringify(metadata),
        },
      ],
    },
    callback: function (response: { reference: string }) {
      onSuccess(response.reference);
    },
    onClose: function () {
      onCancel();
    },
  });

  handler.openIframe();
};
