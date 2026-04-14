import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'DardenMkt — UVA & Darden Student Marketplace'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#232D4B',
          position: 'relative',
        }}
      >
        {/* Subtle gradient blob */}
        <div style={{
          position: 'absolute',
          top: -100,
          left: -100,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(229,114,0,0.15) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -80,
          right: -80,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(229,114,0,0.10) 0%, transparent 70%)',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <span style={{ fontSize: 56, fontWeight: 800, color: '#ffffff', letterSpacing: '-1px' }}>Darden</span>
          <span style={{ fontSize: 56, fontWeight: 800, color: '#E57200', letterSpacing: '-1px' }}>Mkt</span>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 26,
          color: '#93C5FD',
          fontWeight: 500,
          marginBottom: 40,
          letterSpacing: '0.01em',
        }}>
          UVA & Darden Student Marketplace
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900 }}>
          {['🏠 Housing', '🏷️ For Sale', '💼 Jobs', '🚗 Rideshare', '🎟️ Events', '🤝 Teams'].map((label) => (
            <div key={label} style={{
              padding: '10px 22px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.15)',
              backgroundColor: 'rgba(255,255,255,0.07)',
              color: '#CBD5E1',
              fontSize: 18,
              fontWeight: 500,
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div style={{
          position: 'absolute',
          bottom: 36,
          fontSize: 18,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.05em',
        }}>
          dardenmkt.vercel.app · @virginia.edu only
        </div>
      </div>
    ),
    { ...size }
  )
}
