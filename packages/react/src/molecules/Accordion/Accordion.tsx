import { useMemo, useState, type ComponentProps, type ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import styles from './Accordion.module.css';

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps extends Omit<ComponentProps<'div'>, 'children'> {
  items: AccordionItem[];
  defaultOpen?: string | string[];
  allowMultiple?: boolean;
}

function normalizeOpenIds(defaultOpen?: string | string[]) {
  if (Array.isArray(defaultOpen)) return defaultOpen;
  return defaultOpen ? [defaultOpen] : [];
}

export function Accordion({ items, defaultOpen, allowMultiple = false, className, ...rest }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(() => normalizeOpenIds(defaultOpen));
  const safeItems = useMemo(() => items ?? [], [items]);

  const toggle = (id: string) => {
    setOpenIds((current) => {
      const isOpen = current.includes(id);
      if (allowMultiple) {
        return isOpen ? current.filter((value) => value !== id) : [...current, id];
      }
      return isOpen ? [] : [id];
    });
  };

  return (
    <div className={cx(styles.root, className)} {...rest}>
      {safeItems.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <section key={item.id} className={styles.item}>
            <h3 className={styles.header}>
              <button type="button" className={styles.trigger} aria-expanded={isOpen} onClick={() => toggle(item.id)} disabled={item.disabled}>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.chevron} aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
            </h3>
            {isOpen && <div className={styles.content}>{item.content}</div>}
          </section>
        );
      })}
    </div>
  );
}
