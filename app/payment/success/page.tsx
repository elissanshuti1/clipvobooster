"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [attemptedTamper, setAttemptedTamper] = useState(false);

  // Anti-tamper: Monitor for console access and dev tools
  useEffect(() => {
    let tamperDetected = false;
    
    // Detect dev tools by checking window dimensions
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      if (widthThreshold || heightThreshold) {
        tamperDetected = true;
      }
    };

    // Detect debugger
    const detectDebugger = () => {
      const start = Date.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = Date.now();
      if (end - start > 100) {
        tamperDetected = true;
      }
    };

    // Monitor for element removal attempts
    const originalRemoveChild = ChildNode.prototype.removeChild;
    ChildNode.prototype.removeChild = function<T extends Node>(this: ChildNode, child: T): T {
      if (this === document.getElementById('security-check')) {
        tamperDetected = true;
        setAttemptedTamper(true);
      }
      return originalRemoveChild.call(this, child);
    };

    // Monitor for style changes that hide elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement;
          if (target.id === 'security-check' || target.classList.contains('payment-verify')) {
            tamperDetected = true;
            setAttemptedTamper(true);
          }
        }
      });
    });

    const securityEl = document.getElementById('security-check');
    if (securityEl) {
      observer.observe(securityEl, { attributes: true });
    }

    // Periodic checks
    const interval = setInterval(() => {
      checkDevTools();
      detectDebugger();
      
      // Check if security element is hidden
      const secEl = document.getElementById('security-check');
      if (!secEl || secEl.style.display === 'none' || secEl.style.visibility === 'hidden' || secEl.style.opacity === '0') {
        tamperDetected = true;
        setAttemptedTamper(true);
      }
    }, 500);

    // Cleanup
    return () => {
      clearInterval(interval);
      observer.disconnect();
      ChildNode.prototype.removeChild = originalRemoveChild;
      
      if (tamperDetected) {
        console.warn('Tampering detected. Session will be invalidated.');
      }
    };
  }, []);

  // Verify payment on mount
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const checkoutId = searchParams.get('checkout_id');
        const plan = searchParams.get('plan');

        if (!checkoutId || !plan) {
          setError('Invalid payment information');
          setIsVerifying(false);
          return;
        }

        // Verify with backend
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutId, plan })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        if (data.verified) {
          setIsValid(true);
          setPlanInfo(data.subscription);
        } else {
          setError('Payment verification failed');
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setError(err.message || 'Failed to verify payment');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  // Handle redirect to dashboard
  const handleContinue = useCallback(() => {
    if (isValid) {
      router.push('/dashboard/overview');
    }
  }, [isValid, router]);

  // Auto-redirect after successful verification
  useEffect(() => {
    if (isValid) {
      const timer = setTimeout(() => {
        router.push('/dashboard/overview');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isValid, router]);

  if (attemptedTamper) {
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
          border: '1px solid #f87171',
          borderRadius: 16,
          padding: 40,
          maxWidth: 500,
          textAlign: 'center'
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(248, 113, 113, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f87171', marginBottom: 12 }}>
            Security Alert
          </h1>
          <p style={{ fontSize: 14, color: '#8b95a5', lineHeight: 1.6 }}>
            Suspicious activity detected. Your session has been invalidated for security reasons.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              marginTop: 24,
              padding: '12px 24px',
              background: '#f87171',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <>
        <div id="security-check" className="payment-verify" style={{ display: 'none' }} />
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
      </>
    );
  }

  if (error) {
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
          border: '1px solid #f87171',
          borderRadius: 16,
          padding: 40,
          maxWidth: 500,
          textAlign: 'center'
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(248, 113, 113, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f87171', marginBottom: 12 }}>
            Payment Failed
          </h1>
          <p style={{ fontSize: 14, color: '#8b95a5', lineHeight: 1.6, marginBottom: 24 }}>
            {error}
          </p>
          <button
            onClick={() => router.push('/pricing')}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isValid && planInfo) {
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
            Welcome to {planInfo.planName}
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
              {planInfo.planName}
            </div>
            <div style={{ fontSize: 14, color: '#10b981' }}>
              {planInfo.interval === 'one-time' ? 'Lifetime Access' : `$${planInfo.price}/${planInfo.interval}`}
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#8b95a5', marginBottom: 24 }}>
            Redirecting to dashboard...
          </p>
          <button
            onClick={handleContinue}
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

  return null;
}
