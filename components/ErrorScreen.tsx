export default function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <span style={{ fontSize: 32 }}>⚠</span>
      <span style={{ color: '#6b6b6b', fontSize: 15 }}>데이터를 불러오지 못했습니다.</span>
      <button
        onClick={onRetry}
        style={{ padding: '8px 20px', borderRadius: 9999, border: '1px solid #f07c20', background: 'none', color: '#f07c20', cursor: 'pointer', fontSize: 14 }}
      >
        다시 시도
      </button>
    </div>
  );
}
