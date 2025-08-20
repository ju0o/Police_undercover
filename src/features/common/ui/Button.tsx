import { type ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' };

export function Button({ variant = 'primary', ...props }: Props) {
  const style =
    variant === 'primary'
      ? {
          background: 'linear-gradient(180deg, var(--primary), var(--primary-600))',
          color: 'white',
          border: 0,
          borderRadius: 10,
          padding: '10px 14px',
          boxShadow: '0 6px 18px rgba(79, 70, 229, 0.35)',
        }
      : {
          background: 'transparent',
          color: 'var(--text)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10,
          padding: '10px 14px',
        };
  return <button {...props} style={{ ...style, ...(props.style ?? {}) }} />;
}


