'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [piConnected, setPiConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handlePiConnection = () => {
    if (piConnected) {
      setPiConnected(false);
      return;
    }
    
    setConnecting(true);
    setTimeout(() => {
      setPiConnected(true);
      setConnecting(false);
    }, 2000);
  };

  return (
    <div style={{
      fontFamily: "'Cairo', 'Tajawal', sans-serif",
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      paddingBottom: '100px',
      direction: 'rtl'
    }}>
      
      {/* Status Bar */}
      <div style={{
        background: '#ffffff',
        padding: '8px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: '600',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span>📶</span>
          <span>📡</span>
          <span>🔋</span>
        </div>
        <div>12:00</div>
      </div>

      {/* Header */}
      <div style={{
        background: '#ffffff',
        padding: '20px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '10px 0'
        }}>
          الملف الشخصي
        </h1>
      </div>

      {/* Main Container */}
      <div style={{ padding: '20px', maxWidth: '480px', margin: '0 auto' }}>
        
        {/* Profile Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '28px',
          padding: '30px 25px',
          marginBottom: '25px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            opacity: 0.1
          }} />
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '25px',
            position: 'relative',
            zIndex: 1
          }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                color: 'white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
                border: '4px solid white'
              }}>
                👤
              </div>
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '28px',
                height: '28px',
                background: '#00ff41',
                borderRadius: '50%',
                border: '3px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'white'
              }}>
                ✓
              </div>
            </div>

            {/* User Info */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '5px' }}>
                مستخدم Maharaat
              </h2>
              <p style={{ fontSize: '14px', color: '#636e72', marginBottom: '8px' }}>
                user@maharaat.app
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: 'linear-gradient(135deg, rgba(0,255,65,0.1), rgba(0,217,255,0.1))',
                borderRadius: '50px',
                fontSize: '13px',
                color: '#00ff41',
                fontWeight: 600
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  background: '#00ff41',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }} />
                متصل الآن
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px',
            marginTop: '20px'
          }}>
            {[
              { number: '12', label: 'دورة' },
              { number: '48', label: 'ساعة تعلم' },
              { number: '5', label: 'شهادة' }
            ].map((stat, index) => (
              <div key={index} style={{
                textAlign: 'center',
                padding: '15px 10px',
                background: '#f8f9fa',
                borderRadius: '20px',
                transition: 'transform 0.3s ease'
              }}>
                <div style={{
                  fontSize: '26px',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '5px'
                }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: '12px', color: '#636e72', fontWeight: 600 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.2); }
            }
          `}</style>
        </div>

        {/* Pi Account Section */}
        <div style={{
          background: '#ffffff',
          borderRadius: '28px',
          padding: '25px',
          marginBottom: '25px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            fontSize: '150px',
            fontWeight: 900,
            color: '#bc13fe',
            opacity: 0.05
          }}>
            π
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px'
              }}>π</span>
              Pi Account
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: piConnected 
              ? 'linear-gradient(135deg, rgba(0,255,65,0.1), rgba(0,217,255,0.1))'
              : 'linear-gradient(135deg, rgba(255,107,107,0.1), rgba(255,159,67,0.1))',
            borderRadius: '12px',
            fontSize: '14px',
            color: piConnected ? '#00ff41' : '#ff6b6b',
            fontWeight: 600,
            marginBottom: '20px',
            border: `1px dashed ${piConnected ? 'rgba(0,255,65,0.3)' : 'rgba(255,107,107,0.3)'}`
          }}>
            {piConnected ? '✅' : '⚠️'}
            <span>{piConnected ? 'الحالة: حساب Pi متصل ✓' : 'الحالة: حساب Pi غير متصل بعد'}</span>
          </div>

          <button
            onClick={handlePiConnection}
            disabled={connecting}
            style={{
              width: '100%',
              padding: '16px',
              background: piConnected 
                ? 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: connecting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(102,126,234,0.4)',
              fontFamily: 'inherit',
              opacity: connecting ? 0.7 : 1
            }}
          >
            {connecting ? (
              <>⏳ جاري الربط...</>
            ) : piConnected ? (
              <>🔗 فصل الحساب</>
            ) : (
              <>🔗 ربط حساب Pi</>
            )}
          </button>
        </div>

        {/* Menu Sections */}
        {[
          {
            icon: '🎓',
            title: 'دوراتي',
            subtitle: 'إدارة ومتابعة دوراتك التعليمية',
            color: 'rgba(102,126,234,0.15)',
            iconColor: '#667eea'
          },
          {
            icon: '🔍',
            title: 'استكشف الدورات',
            subtitle: 'اكتشف دورات جديدة ومثيرة',
            color: 'rgba(0,217,255,0.15)',
            iconColor: '#00d9ff'
          }
        ].map((item, index) => (
          <div key={index} style={{
            background: '#ffffff',
            borderRadius: '28px',
            padding: '20px',
            marginBottom: '25px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              padding: '18px 15px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '3px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '13px', color: '#636e72' }}>
                  {item.subtitle}
                </div>
              </div>
              <span style={{ color: '#b2bec3', fontSize: '18px' }}>←</span>
            </div>
          </div>
        ))}

        {/* Settings Menu */}
        <div style={{
          background: '#ffffff',
          borderRadius: '28px',
          padding: '20px',
          marginBottom: '25px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
        }}>
          {[
            { icon: '⚙️', title: 'الإعدادات', subtitle: 'تخصيص تجربتك', color: 'rgba(240,147,251,0.15)', iconColor: '#f5576c' },
            { icon: '❓', title: 'المساعدة والدعم', subtitle: 'نحن هنا لمساعدتك', color: 'rgba(255,193,7,0.15)', iconColor: '#ffc107' },
            { icon: '🚪', title: 'تسجيل الخروج', subtitle: 'خروج من الحساب', color: 'rgba(255,107,107,0.15)', iconColor: '#ff6b6b' }
          ].map((item, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              padding: '18px 15px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: index < 2 ? '8px' : '0'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '3px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '13px', color: '#636e72' }}>
                  {item.subtitle}
                </div>
              </div>
              <span style={{ color: '#b2bec3', fontSize: '18px' }}>←</span>
            </div>
          ))}
        </div>

      </div>

      {/* Browser Bar */}
      <div style={{
        position: 'fixed',
        bottom: '85px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#ffffff',
        padding: '12px 25px',
        borderRadius: '50px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        zIndex: 998,
        width: 'calc(100% - 40px)',
        maxWidth: '450px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>M</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#636e72' }}>
          🔒 maharaat-app.vercel.app
        </div>
        <span style={{ color: '#636e72', fontSize: '20px', cursor: 'pointer' }}>🔄</span>
      </div>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#ffffff',
        padding: '12px 20px 20px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 999,
        borderTopLeftRadius: '25px',
        borderTopRightRadius: '25px'
      }}>
        {[
          { icon: '🏠', label: 'الرئيسية', active: false },
          { icon: '➕', label: 'إنشاء دورة', active: false },
          { icon: '👤', label: 'الملف الشخصي', active: true }
        ].map((item, index) => (
          <a
            key={index}
            href="#"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
              textDecoration: 'none',
              color: item.active ? 'white' : '#b2bec3',
              transition: 'all 0.3s ease',
              padding: '8px 16px',
              borderRadius: '12px',
              background: item.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
              boxShadow: item.active ? '0 4px 15px rgba(102,126,234,0.4)' : 'none',
              transform: item.active ? 'translateY(-5px)' : 'none'
            }}
          >
            <span style={{ fontSize: '24px' }}>{item.icon}</span>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>{item.label}</span>
          </a>
        ))}
      </nav>

    </div>
  );
}
