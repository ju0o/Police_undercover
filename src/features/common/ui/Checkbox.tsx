import { forwardRef, type InputHTMLAttributes } from 'react';
import styles from '@/features/common/styles/ui.module.css';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label?: string };

export const Checkbox = forwardRef<HTMLInputElement, Props>(({ label, ...props }, ref) => {
  return (
    <label className={styles.checkboxRow}>
      <input ref={ref} type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
});



