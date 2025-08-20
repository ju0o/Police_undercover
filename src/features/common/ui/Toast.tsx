import { useEffect, useState } from 'react';

export function Toast({ message, show, onClose }: { message: string; show: boolean; onClose: () => void }) {
  const [visible, setVisible] = useState(show);
  useEffect(() => {
    setVisible(show);
    if (show) {
      const t = setTimeout(() => onClose(), 2200);
      return () => clearTimeout(t);
    }
  }, [show, onClose]);
  if (!visible) return null;
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#111627', color: 'white', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 14px', borderRadius: 10, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>{message}</div>
  );
}



