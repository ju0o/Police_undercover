import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from '@/features/common/styles/ui.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  requiredMark?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, requiredMark, ...props }, ref) => {
    return (
      <div className={styles.fieldRow}>
        {label && (
          <label className={styles.label}>
            {label}
            {requiredMark ? ' *' : ''}
          </label>
        )}
        <input ref={ref} className={styles.input} {...props} />
        {hint && !error && <small className={styles.label}>{hint}</small>}
        {error && <small style={{ color: 'var(--danger)' }}>{error}</small>}
      </div>
    );
  },
);



