import type { ReactNode } from 'react';
import { Stack } from '../../layout/Stack.tsx';
import { Grid } from '../../layout/Grid.tsx';
import { Row } from '../../layout/Row.tsx';
import { Divider } from '../../atoms/Divider/Divider.tsx';
import { Text } from '../../atoms/Typography/Text.tsx';

export interface FooterProps {
  /** Bottom bar content, such as a copyright line and social links. */
  bottom?: ReactNode;
  className?: string;
  /** The link columns. */
  children?: ReactNode;
}

/**
 * A page footer: a responsive grid of link columns over an optional bottom
 * bar. The columns auto-fit, so the footer reflows without breakpoints.
 */
export function Footer({ bottom, className, children }: FooterProps) {
  return (
    <Stack as="footer" gap={6} paddingY={8} className={className}>
      {children && (
        <Grid minChildWidth="12rem" gap={6}>
          {children}
        </Grid>
      )}
      {bottom && (
        <Stack gap={5}>
          <Divider />
          <Row gap={4} wrap>
            {bottom}
          </Row>
        </Stack>
      )}
    </Stack>
  );
}

export interface FooterColumnProps {
  title?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/** A titled column of links inside a Footer. */
export function FooterColumn({ title, className, children }: FooterColumnProps) {
  return (
    <Stack gap={3} className={className}>
      {title && (
        <Text as="span" size="sm" weight="semibold">
          {title}
        </Text>
      )}
      <Stack gap={2}>{children}</Stack>
    </Stack>
  );
}
