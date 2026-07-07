import type { ReactNode } from 'react';
import { cx } from '../../internal/cx.ts';
import { Center } from '../../layout/Center.tsx';
import { Stack } from '../../layout/Stack.tsx';
import { Heading } from '../../atoms/Typography/Heading.tsx';
import { Text } from '../../atoms/Typography/Text.tsx';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** A primary action, such as a Button. */
  action?: ReactNode;
  className?: string;
}

/**
 * The bone for an empty or zero-data view: a centered icon, title,
 * description, and an optional action. Use it wherever a list, table, or
 * search has nothing to show.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <Center padding={8} className={className}>
      <Stack gap={4} align="center" maxWidth="sm" className={styles.text}>
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        <Stack gap={1} align="center">
          <Heading level={3} visualLevel={4}>
            {title}
          </Heading>
          {description && <Text tone="muted">{description}</Text>}
        </Stack>
        {action}
      </Stack>
    </Center>
  );
}
