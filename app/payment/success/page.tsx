"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [planName, setPlanName] = useState("Premium");
  const [isVerified, setIsVerified] = useState(false);

  // Effect 1: Verify payment and extract plan info
  useEffect(() => {
    const status = searchParams.get('status');
    const subscriptionId = searchParams.get('subscription_id');
    const email = searchParams.get('email');
    const checkoutId = searchParams.get('checkout_id');
    const plan = searchParams.get('plan');

    const planNames: Record<string, string> = {
      'starter': 'Starter',
      'professional': 'Professional',
      'lifetime': 'Lifetime',
      'Premium': 'Premium'
    };

    const isPaymentSuccessful =
      (status === 'active' && subscriptionId) ||
      (status === 'success' && checkoutId) ||
      (status === 'success');

    if (isPaymentSuccessful) {
      if (plan && planNames[plan]) {
        setPlanName(planNames[plan]);
      } else if (subscriptionId) {
        fetch('/api/payment/subscription')
          .then(res => {
            if (res.ok) return res.json();
            throw new Error('Not authenticated');
          })
          .then(data => {
            if (data.subscription?.planName) {
              setPlanName(data.subscription.planName);
            }
          })
          .catch(() => {});
      }

      document.cookie = 'has_subscription=true; path=/; max-age=2592000';
      setIsVerified(true);
      setIsLoading(false);
    } else {
      setTimeout(() => {
        router.push('/pricing?error=payment_not_verified');
      }, 1000);
    }
  }, [searchParams, router]);

  // Effect 2: Auto-redirect after verification (MUST be before conditional return)
  useEffect(() => {
    if (isVerified) {
      // Wait and check if subscription is saved before redirecting
      const checkSubscription = async () => {
        console.log('🔄 Payment Success: Checking if subscription is saved...');
        
        // Try up to 5 times with 1 second delay
        for (let i = 0; i < 5; i++) {
          try {
            const res = await fetch('/api/payment/subscription');
            if (res.ok) {
              const data = await res.json();
              if (data.hasSubscription) {
                console.log('✅ Payment Success: Subscription confirmed!');
                setTimeout(() => {
                  router.push('/dashboard/overview');
                }, 500);
                return;
              }
            }
          } catch (err) {
            console.log('⚠️ Payment Success: Subscription not ready yet, retrying...');
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // If still no subscription after 5 tries, redirect anyway
        console.log('⚠️ Payment Success: Redirecting to dashboard without confirmed subscription');
        setTimeout(() => {
          router.push('/dashboard/overview');
        }, 500);
      };
      
      checkSubscription();
    }
  }, [router, isVerified]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#08090d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 50,
            height: 50,
            border: '4px solid rgba(255,255,255,0.1)',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }} />
          <p style={{ color: '#8b95a5', fontSize: 14 }}>Verifying your payment...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08090d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    }}>
      <div style={{
        background: '#12151f',
        border: '1px solid #10b981',
        borderRadius: 16,
        padding: 48,
        maxWidth: 500,
        textAlign: 'center'
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
          Payment Successful!
        </h1>
        <p style={{ fontSize: 16, color: '#10b981', fontWeight: 600, marginBottom: 24 }}>
          Welcome to {planName}
        </p>
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24
        }}>
          <div style={{ fontSize: 13, color: '#8b95a5', marginBottom: 8 }}>Your Plan</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
            {planName}
          </div>
          <div style={{ fontSize: 14, color: '#10b981' }}>
            Active
          </div>
        </div>
        <p style={{ fontSize: 13, color: '#8b95a5', marginBottom: 24 }}>
          Redirecting to dashboard...
        </p>
        <button
          onClick={() => router.push('/dashboard/overview')}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8
          }}
        >
          Continue to Dashboard
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: '#08090d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 50,
            height: 50,
            border: '4px solid rgba(255,255,255,0.1)',
            borderTop: '4px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }} />
          <p style={{ color: '#8b95a5', fontSize: 14 }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    }>
      <PaymentVerificationContent />
    </Suspense>
  );
}
