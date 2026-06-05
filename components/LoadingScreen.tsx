export default function LoadingScreen() {
  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #fff8f2 0%, #ffffff 60%)',
      gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid #f07c20', borderTopColor: 'transparent',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ color: '#9e9e9e', fontSize: 14 }}>데이터 불러오는 중...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
