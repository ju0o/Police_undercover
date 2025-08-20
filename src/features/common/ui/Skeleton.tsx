export function Skeleton({ height = 14, width = '100%', radius = 8, style: customStyle }: { height?: number; width?: number | string; radius?: number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: radius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
        backgroundSize: '200% 100%',
        animation: 'zk-skeleton 1.2s ease-in-out infinite',
        ...customStyle,
      }}
    />
  );
}

// Global keyframes (can live in index.css, but inlined via CSSStyleSheet is not trivial here)
const style = document.createElement('style');
style.innerHTML = `@keyframes zk-skeleton { 0%{background-position: 200% 0} 100%{background-position: -200% 0}}`;
if (typeof document !== 'undefined') {
  document.head.appendChild(style);
}



