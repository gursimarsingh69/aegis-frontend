export default function Profile() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 28,
      textAlign: 'center',
    }}>
      <img
        src="/thumbs_up.png"
        alt="Site in development"
        style={{
          width: 'clamp(160px, 30vw, 260px)',
          filter: 'drop-shadow(0 8px 32px rgba(250,200,0,0.25))',
          animation: 'bounceFace 2.2s ease-in-out infinite',
        }}
      />

      <div>
        <h1 style={{
          fontSize: 'clamp(22px, 4vw, 36px)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 10,
        }}>
          Site in Development
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14, maxWidth: 320 }}>
          The Profile &amp; Settings page is coming soon. Stay tuned — great things are on the way! 👷‍♂️
        </p>
      </div>

      <style>{`
        @keyframes bounceFace {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50%       { transform: translateY(-14px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}
