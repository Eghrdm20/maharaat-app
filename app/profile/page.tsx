'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [piConnected, setPiConnected] = useState(false);

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#f5f7fa',
      minHeight: '100vh',
      paddingBottom: '120px',
    }}>
      
      {/* Header */}
      <div style={{
        padding: '20px',
        textAlign: 'center',
        background: 'white',
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#1a1a1a',
          margin: '10px 0'
        }}>
          Profile
        </h1>
      </div>

      {/* Main Container */}
      <div style={{ padding: '0 16px' }}>
        
        {/* Pi Account Card - محسن */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '28px 24px',
          marginBottom: '16px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.04)'
        }}>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '8px',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>π</span>
            Pi Account
          </h2>
          
          <p style={{
            fontSize: '15px',
            color: piConnected ? '#00b894' : '#636e72',
            marginBottom: '20px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: piConnected ? '#00b894' : '#fdcb6e',
              display: 'inline-block'
            }}/>
            Status: {piConnected ? 'Pi account connected ✓' : 'Pi account not connected yet'}
          </p>

          <button
            onClick={() => setPiConnected(!piConnected)}
            style={{
              width: '100%',
              padding: '14px',
              background: piConnected 
                ? 'linear-gradient(135deg, #00b894, #00cec9)'
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: piConnected 
                ? '0 4px 15px rgba(0,184,148,0.3)'
                : '0 4px 15px rgba(102,126,234,0.3)',
              fontFamily: 'inherit'
            }}
          >
            {piConnected ? '✓ Disconnect Pi' : 'ربط حساب Pi'}
          </button>
        </div>

        {/* My Courses Button - محسن */}
        <button style={{
          width: '100%',
          padding: '20px 24px',
          background: 'white',
          border: '1px solid rgba(0,0,0,0.04)',
          borderRadius: '20px',
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: '600',
          color: '#1a1a1a',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'inherit'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(102,126,234,0.15)';
          e.currentTarget.style.borderColor = 'rgba(102,126,234,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
        }}
        >
          <span>📚 My Courses</span>
          <span style={{ color: '#b2bec3', fontSize: '20px' }}>←</span>
        </button>

        {/* Browse Courses Button - محسن */}
        <button style={{
          width: '100%',
          padding: '20px 24px',
          background: 'white',
          border: '1px solid rgba(0,0,0,0.04)',
          borderRadius: '20px',
          marginBottom: '12px',
          fontSize: '18px',
          fontWeight: '600',
          color: '#1a1a1a',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'inherit'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,217,255,0.15)';
          e.currentTarget.style.borderColor = 'rgba(0,217,255,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
        }}
        >
          <span>🔍 Browse Courses</span>
          <span style={{ color: '#b2bec3', fontSize: '20px' }}>←</span>
        </button>

      </div>

      {/* Bottom Navigation - محسن */}
      <nav style={{
        position: 'fixed',
        bottom: '60px',
        left: '0',
        right: '0',
        background: 'white',
        padding: '12px 20px 16px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTop: '1px solid rgba(0,0,0,0.05)'
      }}>
        {[
          { label: 'Home', icon: '🏠', active: false },
          { label: 'Create Course', icon: '➕', active: false },
          { label: 'Profile', icon: '👤', active: true }
        ].map((item, idx) => (
          <button
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: item.active 
                ? 'linear-gradient(135deg, #2d3436, #1a1a1a)' 
                : 'transparent',
              color: item.active ? 'white' : '#b2bec3',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'inherit',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: item.active ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
              transform: item.active ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Browser Bar - محسن */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'white',
        padding: '10px 20px',
        borderRadius: '50px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: 'calc(100% - 40px)',
        maxWidth: '450px',
        border: '1px solid rgba(0,0,0,0.04)'
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '12px'
        }}>M</div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#636e72'
        }}>
          🔒 maharaat-app.vercel.app
        </div>
        <span style={{ 
          color: '#636e72', 
          fontSize: '18px', 
          cursor: 'pointer',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(180deg)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg)'}
        >🔄</span>
      </div>

    </div>
  );
}
