"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Lock, Shield, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface PaymentFormProps {
  clientSecret: string;
  quizId: string;
  onSuccess: (quizId: string) => void;
  onCancel: () => void;
}

function CheckoutForm({
  clientSecret,
  quizId,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);

  // Setup Apple Pay / Google Pay
  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: 'GB',
      currency: 'gbp',
      total: {
        label: 'Boot Fitting Comparison',
        amount: 299, // £2.99 in pence
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check if Apple Pay / Google Pay is available
    // This works on:
    // - Apple Pay: Safari on iOS/macOS with Apple Pay enabled
    // - Google Pay: Chrome, Edge, Opera on Android/Desktop with Google Pay enabled
    pr.canMakePayment().then(result => {
      if (result) {
        setPaymentRequest(pr);
        console.log('Digital wallet available:', result.applePay ? 'Apple Pay' : result.googlePay ? 'Google Pay' : 'Digital wallet');
      }
    }).catch(error => {
      console.error('Error checking payment request availability:', error);
    });

    // Handle payment method from Apple Pay / Google Pay
    pr.on('paymentmethod', async (ev) => {
      setIsProcessing(true);
      setError(null);

      try {
        const { error: confirmError } = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            payment_method: ev.paymentMethod.id,
            return_url: `${window.location.origin}/results?sessionId=${quizId}&payment=success`,
          },
          redirect: "if_required",
        });

        if (confirmError) {
          ev.complete('fail');
          setError(confirmError.message || "Payment failed");
          setIsProcessing(false);
        } else {
          ev.complete('success');
          toast.success("Payment successful! Generating your breakdown...");
          onSuccess(quizId);
        }
      } catch (err: any) {
        ev.complete('fail');
        setError(err.message || "An unexpected error occurred");
        setIsProcessing(false);
      }
    });
  }, [stripe, clientSecret, quizId, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "Payment form error");
        setIsProcessing(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/results?sessionId=${quizId}&payment=success`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
        setIsProcessing(false);
      } else {
        toast.success("Payment successful! Generating your breakdown...");
        onSuccess(quizId);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Apple Pay / Google Pay Button */}
      {paymentRequest && (
        <div className="space-y-3">
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: {
                paymentRequestButton: {
                  type: 'default', // Shows "Pay with Apple Pay" or "Pay with Google Pay"
                  theme: 'dark', // Dark theme to match the UI
                  height: '48px',
                },
              },
            }}
          />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F5E4D0]/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#2B2D30] text-[#F4F4F4]/60">Or pay with card</span>
            </div>
          </div>
        </div>
      )}

      {/* Card Payment Form */}
      <div className="space-y-4">
        <PaymentElement
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
            wallets: {
              applePay: 'never', // Hide Apple Pay here since we show it above with PaymentRequestButton
              googlePay: 'never', // Hide Google Pay here since we show it above with PaymentRequestButton
            },
          }}
        />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-[4px] text-red-400"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 border-[#F5E4D0]/20 text-[#F4F4F4] hover:bg-[#F5E4D0]/10 hover:border-[#F5E4D0]/40"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-[#F5E4D0] text-[#2B2D30] hover:bg-[#E8D4B8] font-bold"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Pay £2.99
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function PaymentForm({
  clientSecret,
  quizId,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="border-[#F5E4D0]/20 bg-[#2B2D30]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#F5E4D0]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="border-[#F5E4D0]/20 bg-[#2B2D30] shadow-2xl">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-[#F4F4F4]">
              Secure Checkout
            </CardTitle>
            <div className="flex items-center gap-2 text-[#F5E4D0]">
              <Lock className="w-5 h-5" />
              <span className="text-sm font-semibold">SSL Secured</span>
            </div>
          </div>
          
          {/* Total */}
          <div className="bg-[#F5E4D0]/5 border border-[#F5E4D0]/20 rounded-[4px] p-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-[#F4F4F4]">Total</span>
              <span className="text-2xl font-bold text-[#F5E4D0]">£2.99</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Form */}
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "night",
                variables: {
                  colorPrimary: "#F5E4D0",
                  colorBackground: "#2B2D30",
                  colorText: "#F4F4F4",
                  colorDanger: "#ef4444",
                  fontFamily: "system-ui, sans-serif",
                  borderRadius: "4px",
                },
                rules: {
                  ".Input": {
                    backgroundColor: "#040404",
                    border: "1px solid rgba(245, 228, 208, 0.2)",
                    color: "#F4F4F4",
                  },
                  ".Input:focus": {
                    border: "1px solid rgba(245, 228, 208, 0.4)",
                    boxShadow: "0 0 0 1px rgba(245, 228, 208, 0.2)",
                  },
                  ".Label": {
                    color: "#F4F4F4",
                    fontWeight: "500",
                  },
                  ".Tab": {
                    backgroundColor: "#2B2D30",
                    border: "1px solid rgba(245, 228, 208, 0.2)",
                    color: "#F4F4F4",
                  },
                  ".Tab:hover": {
                    backgroundColor: "rgba(245, 228, 208, 0.05)",
                    border: "1px solid rgba(245, 228, 208, 0.3)",
                  },
                  ".Tab--selected": {
                    backgroundColor: "rgba(245, 228, 208, 0.1)",
                    border: "1px solid #F5E4D0",
                    color: "#F5E4D0",
                  },
                },
              },
            }}
          >
            <CheckoutForm
              clientSecret={clientSecret}
              quizId={quizId}
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          </Elements>

          {/* Trust Badges */}
          <div className="pt-4 border-t border-[#F5E4D0]/20">
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-[#F4F4F4]/70">
                <Shield className="w-5 h-5 text-[#F5E4D0]" />
                <span className="text-xs font-medium">256-bit SSL</span>
              </div>
              <div className="flex items-center gap-2 text-[#F4F4F4]/70">
                <CreditCard className="w-5 h-5 text-[#F5E4D0]" />
                <span className="text-xs font-medium">Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-[#F4F4F4]/70">
                <Lock className="w-5 h-5 text-[#F5E4D0]" />
                <span className="text-xs font-medium">PCI Compliant</span>
              </div>
            </div>
            <p className="text-center text-xs text-[#F4F4F4]/50 mt-3">
              Powered by Stripe • Your payment information is encrypted and secure
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
