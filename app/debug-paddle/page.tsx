'use client';

import { useEffect, useState } from 'react';

export default function PaddleTestPage() {
  const [paddleStatus, setPaddleStatus] = useState('loading');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, msg]);
  };

  useEffect(() => {
    addLog('🔍 Testing Paddle integration...');

    // Check if Paddle is available
    if (typeof window !== 'undefined' && window.Paddle) {
      addLog('✅ Paddle object found');
      
      try {
        // Test initialization
        window.Paddle.Environment.set('sandbox');
        addLog('✅ Environment set to sandbox');

        window.Paddle.Initialize({
          token: 'test_14360885662003008ab180a517a',
          eventCallback: (data: any) => {
            addLog(`📡 Event: ${data.name}`);
          },
        });

        addLog('✅ Paddle initialized successfully');
        setPaddleStatus('ready');
      } catch (err: any) {
        addLog(`❌ Error: ${err.message}`);
        setPaddleStatus('error');
      }
    } else {
      addLog('❌ Paddle object not found');
      setPaddleStatus('not-loaded');
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08090d',
      padding: '40px 24px',
      color: '#dde1e9',
      fontFamily: 'monospace',
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '24px', color: '#fff' }}>
        Paddle Debug Test
      </h1>
      
      <div style={{
        background: '#12151f',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#fff' }}>
          Status: {paddleStatus}
        </h2>
        
        <div style={{ fontSize: '13px', color: '#8b95a5' }}>
          <p>Check browser console for detailed logs</p>
        </div>
      </div>

      <div style={{
        background: '#0e1018',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        padding: '16px',
        maxHeight: '400px',
        overflowY: 'auto',
      }}>
        <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#5a6373' }}>
          Logs:
        </h3>
        {logs.map((log, i) => (
          <div key={i} style={{
            fontSize: '12px',
            padding: '4px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            color: log.includes('❌') ? '#f87171' : log.includes('✅') ? '#10b981' : '#8b95a5',
          }}>
            {log}
          </div>
        ))}
      </div>

      {paddleStatus === 'ready' && (
        <button
          onClick={() => {
            if (window.Paddle) {
              window.Paddle.Checkout.open({
                items: [{ priceId: 'pro_01kmwpr7w296ntm3ks05d7n93g', quantity: 1 }],
                checkout: {
                  settings: {
                    displayMode: 'overlay',
                    theme: 'dark',
                  },
                },
              });
            }
          }}
          style={{
            marginTop: '24px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '600',
          }}
        >
          Test Checkout (Starter Plan)
        </button>
      )}
    </div>
  );
}
