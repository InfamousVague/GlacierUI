import { describe, expect, it } from 'vitest';
import { Size } from '@glacier/react';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Box, Center, Container, Grid, Row, Spacer, Stack } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Stack', () => {
  it('maps a scalar gap to the space token at the base tier', () => {
    render(
      <Stack gap={6} data-testid="s">
        <div>a</div>
        <div>b</div>
      </Stack>,
    );
    const el = screen.getByTestId('s');
    expect(el.style.getPropertyValue('--pl-gap-base')).toBe('var(--glacier-space-6)');
  });

  it('emits per-breakpoint variables for a responsive gap', () => {
    render(<Stack gap={{ base: 2, md: 6 }} data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el.style.getPropertyValue('--pl-gap-base')).toBe('var(--glacier-space-2)');
    expect(el.style.getPropertyValue('--pl-gap-md')).toBe('var(--glacier-space-6)');
    expect(el.style.getPropertyValue('--pl-gap-sm')).toBe('');
  });

  it('sets alignment and surface data attributes from tokens', () => {
    render(<Stack align="center" background="surfaceRaised" radius="lg" elevation={2} data-testid="s" />);
    const el = screen.getByTestId('s');
    expect(el.getAttribute('data-align')).toBe('center');
    expect(el.getAttribute('data-bg')).toBe('surfaceRaised');
    expect(el.getAttribute('data-radius')).toBe('lg');
    expect(el.getAttribute('data-elevation')).toBe('2');
  });
});

describe('Box padding', () => {
  it('resolves padding to all four edge variables', () => {
    render(<Box padding={4} data-testid="b" />);
    const el = screen.getByTestId('b');
    expect(el.style.getPropertyValue('--pl-pt-base')).toBe('var(--glacier-space-4)');
    expect(el.style.getPropertyValue('--pl-pr-base')).toBe('var(--glacier-space-4)');
    expect(el.style.getPropertyValue('--pl-pb-base')).toBe('var(--glacier-space-4)');
    expect(el.style.getPropertyValue('--pl-pl-base')).toBe('var(--glacier-space-4)');
  });

  it('lets a more specific padding prop win per edge', () => {
    render(<Box padding={2} paddingX={8} data-testid="b" />);
    const el = screen.getByTestId('b');
    expect(el.style.getPropertyValue('--pl-pl-base')).toBe('var(--glacier-space-8)');
    expect(el.style.getPropertyValue('--pl-pr-base')).toBe('var(--glacier-space-8)');
    expect(el.style.getPropertyValue('--pl-pt-base')).toBe('var(--glacier-space-2)');
  });

  it('renders a custom element via as', () => {
    render(<Box as="section" data-testid="b" />);
    expect(screen.getByTestId('b').tagName).toBe('SECTION');
  });
});

describe('Grid', () => {
  it('sets a fixed column count', () => {
    render(<Grid columns={3} data-testid="g" />);
    const el = screen.getByTestId('g');
    expect(el.style.getPropertyValue('--pl-cols-base')).toBe('3');
    expect(el.hasAttribute('data-autofit')).toBe(false);
  });

  it('switches to auto-fit with a minChildWidth', () => {
    render(<Grid minChildWidth="12rem" data-testid="g" />);
    const el = screen.getByTestId('g');
    expect(el.hasAttribute('data-autofit')).toBe(true);
    expect(el.style.getPropertyValue('--pl-min')).toBe('12rem');
  });

  it('takes responsive column counts', () => {
    render(<Grid columns={{ base: 1, lg: 4 }} data-testid="g" />);
    const el = screen.getByTestId('g');
    expect(el.style.getPropertyValue('--pl-cols-base')).toBe('1');
    expect(el.style.getPropertyValue('--pl-cols-lg')).toBe('4');
  });
});

describe('Container, Row, Center, Spacer', () => {
  it('Container caps width to a container token and centers', () => {
    render(<Container size={Size.Medium} data-testid="c">x</Container>);
    const el = screen.getByTestId('c');
    expect(el.getAttribute('data-maxw')).toBe('md');
    // default responsive gutters when none are given
    expect(el.style.getPropertyValue('--pl-pl-base')).toBe('var(--glacier-space-4)');
  });

  it('Row wraps when asked', () => {
    render(<Row wrap data-testid="r" />);
    expect(screen.getByTestId('r').hasAttribute('data-wrap')).toBe(true);
  });

  it('Spacer is decorative', () => {
    const { container } = render(<Spacer />);
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Container>
        <Stack gap={4}>
          <Row justify="between">
            <span>Title</span>
            <Spacer />
          </Row>
          <Grid minChildWidth="10rem">
            <Box padding={4} background="surface" radius="lg">
              a
            </Box>
          </Grid>
          <Center height="auto">centered</Center>
        </Stack>
      </Container>,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
