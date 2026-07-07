import type { ReactNode } from 'react';
import { Stack } from '../../layout/Stack.tsx';
import { Row } from '../../layout/Row.tsx';
import { Spacer } from '../../layout/Spacer.tsx';
import { Heading } from '../../atoms/Typography/Heading.tsx';
import { Text } from '../../atoms/Typography/Text.tsx';

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Actions pinned to the trailing edge, such as a primary button. */
  actions?: ReactNode;
  /** Optional breadcrumbs rendered above the title. */
  breadcrumbs?: ReactNode;
  className?: string;
}

/**
 * The title block for a page or a panel: optional breadcrumbs, a heading, a
 * description, and trailing actions that stay pinned to the edge. Built from
 * the layout primitives, so it wraps cleanly on narrow screens.
 */
export function PageHeader({ title, description, actions, breadcrumbs, className }: PageHeaderProps) {
  return (
    <Stack gap={4} className={className}>
      {breadcrumbs}
      <Row gap={4} align="start" wrap>
        <Stack gap={1}>
          <Heading level={1} visualLevel={2}>
            {title}
          </Heading>
          {description && <Text tone="muted">{description}</Text>}
        </Stack>
        {actions && (
          <>
            <Spacer />
            <Row gap={2} wrap>
              {actions}
            </Row>
          </>
        )}
      </Row>
    </Stack>
  );
}
