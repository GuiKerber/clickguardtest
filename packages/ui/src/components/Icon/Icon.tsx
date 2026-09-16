import type { SVGProps } from 'react';
import { icons, type IconName } from './icons';
import './Icon.css';

export type { IconName };

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: 'sm' | 'md' | 'lg';
  /** Rotates continuously. Pair with an accessible busy state on the parent. */
  spin?: boolean;
  /**
   * Leave undefined for decorative icons — they are hidden from assistive tech.
   * Pass a label only when the icon is the sole carrier of meaning.
   */
  label?: string;
}

export function Icon({ name, size = 'md', spin, label, className, ...rest }: IconProps) {
  const classes = ['cg-icon', `cg-icon--${size}`, spin && 'cg-icon--spin', className]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      viewBox="0 0 24 24"
      className={classes}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: icons[name] }}
      {...rest}
    />
  );
}
