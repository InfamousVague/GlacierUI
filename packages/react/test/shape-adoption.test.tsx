import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { cardSpec, navBarSpec, statTileSpec } from '@glacier/spec';
import { Card, NavBar, NavBarItem, StatTile } from '../src/index.ts';

// region is a page-level landmark concern; these surfaces are tested alone.
const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const icon = <svg aria-hidden="true" />;

/** Direct-child decorative spans: the shape layer is one of them. */
const layers = (el: Element) => el.querySelectorAll(':scope > span[aria-hidden="true"]').length;

/** The engine renders the layer as the host's first child. */
const firstChildIsLayer = (el: Element) => {
  const first = el.firstElementChild;
  return first?.tagName === 'SPAN' && first.getAttribute('aria-hidden') === 'true';
};

describe('shape adoption: Card', () => {
  it('renders byte-identically with the default shape, bare or explicit', () => {
    const bare = render(<Card>Body</Card>).container.innerHTML;
    const explicit = render(
      <Card shape={cardSpec.defaults!.shape as never} variant={cardSpec.defaults!.variant as never}>
        Body
      </Card>,
    ).container.innerHTML;
    expect(explicit).toBe(bare);
    // no shape means no layer and no attribute at all
    expect(bare).not.toMatch(/data-shape/);
  });

  it('emits one shape layer and the data-shape attribute for a shaped card', () => {
    render(
      <Card shape="slant" data-testid="c">
        <p>Body</p>
      </Card>,
    );
    const el = screen.getByTestId('c');
    expect(el.getAttribute('data-shape')).toBe('slant');
    expect(layers(el)).toBe(1);
    expect(firstChildIsLayer(el)).toBe(true);
    // the layer is decorative: no content, no pointer target of its own
    expect(el.firstElementChild!.textContent).toBe('');
  });

  it('covers every shape in the spec vocabulary', () => {
    for (const shape of cardSpec.props.find((p) => p.name === 'shape')!.values!) {
      const { container, unmount } = render(<Card shape={shape as never}>Body</Card>);
      const el = container.firstElementChild!;
      expect(el.getAttribute('data-shape')).toBe(shape === 'rect' ? null : shape);
      unmount();
    }
  });

  it('adds the wash class for the gradient variant and keeps it off the default', () => {
    const { container: wash } = render(<Card variant="wash">Body</Card>);
    expect(wash.firstElementChild!.className).toMatch(/wash/);
    const { container: solid } = render(<Card>Body</Card>);
    expect(solid.firstElementChild!.className).not.toMatch(/wash/);
  });

  it('shapes the skeleton so the placeholder keeps the live geometry', () => {
    const { container } = render(<Card skeleton shape="notch" />);
    const el = container.firstElementChild!;
    expect(el.getAttribute('data-shape')).toBe('notch');
    expect(firstChildIsLayer(el)).toBe(true);
  });

  it('keeps a shaped card free of axe violations', async () => {
    const { container } = render(
      <Card shape="edge" variant="wash">
        <p>Body</p>
      </Card>,
    );
    const results = await axe.run(container, { rules: AXE_RULES });
    expect(results.violations).toEqual([]);
  });
});

describe('shape adoption: StatTile', () => {
  it('renders byte-identically with the default shape, bare or explicit', () => {
    const bare = render(<StatTile value="12,480" label="Total users" />).container.innerHTML;
    const explicit = render(
      <StatTile
        value="12,480"
        label="Total users"
        shape={statTileSpec.defaults!.shape as never}
        edgeAccent={statTileSpec.defaults!.edgeAccent as never}
      />,
    ).container.innerHTML;
    expect(explicit).toBe(bare);
    expect(bare).not.toMatch(/data-shape|data-edge-accent/);
  });

  it('emits the layer and the attribute for a shaped tile', () => {
    render(<StatTile value="7" label="Streak" shape="notch" data-testid="t" />);
    const el = screen.getByTestId('t');
    expect(el.getAttribute('data-shape')).toBe('notch');
    expect(firstChildIsLayer(el)).toBe(true);
  });

  it('carries the accent leading edge on its own, without a shape', () => {
    render(<StatTile value="7" label="Streak" edgeAccent data-testid="t" />);
    const el = screen.getByTestId('t');
    // the stripe needs a layer to ride on, so the engine marks the host shaped
    // at the rect silhouette and the tile republishes its paint onto the plate;
    // the tile also flags itself for the inline padding the stripe costs
    expect(el.getAttribute('data-shape')).toBe('rect');
    expect(el.getAttribute('data-edge-accent')).toBe('true');
    expect(firstChildIsLayer(el)).toBe(true);
  });

  it('shapes the skeleton so the placeholder keeps the live geometry', () => {
    render(<StatTile skeleton value="7" label="Streak" shape="slant" data-testid="t" />);
    const el = screen.getByTestId('t');
    expect(el.getAttribute('data-shape')).toBe('slant');
    expect(firstChildIsLayer(el)).toBe(true);
  });
});

describe('shape adoption: NavBar', () => {
  const bar = (props: Record<string, unknown>) => (
    <NavBar aria-label="Primary" {...props}>
      <NavBarItem icon={icon} label="Home" active />
      <NavBarItem icon={icon} label="Library" badge={3} />
    </NavBar>
  );

  it('renders byte-identically with the default shape, bare or explicit', () => {
    const bare = render(bar({})).container.innerHTML;
    const explicit = render(
      bar({
        shape: navBarSpec.defaults!.shape,
        edgeAccent: navBarSpec.defaults!.edgeAccent,
        sweep: navBarSpec.defaults!.sweep,
      }),
    ).container.innerHTML;
    expect(explicit).toBe(bare);
    expect(bare).not.toMatch(/data-shape/);
  });

  it('threads the bar-level shape to every item plate', () => {
    const { container } = render(bar({ shape: 'slant' }));
    const items = container.querySelectorAll('button');
    expect(items.length).toBe(2);
    for (const item of items) {
      expect(item.getAttribute('data-shape')).toBe('slant');
      expect(firstChildIsLayer(item)).toBe(true);
    }
    // the bar itself is not a plate: only its items are
    expect(container.querySelector('nav')!.getAttribute('data-shape')).toBeNull();
  });

  it('threads the accent edge and sweep opt-ins, and adds exactly one layer', () => {
    const plain = render(bar({})).container.querySelectorAll('button')[1]!;
    const plainSpans = layers(plain);
    const { container } = render(bar({ shape: 'notch', edgeAccent: true, sweep: true }));
    const item = container.querySelectorAll('button')[1]!;
    expect(item.getAttribute('data-edge-accent')).toBe('true');
    expect(layers(item)).toBe(plainSpans + 1);
  });

  it('keeps the sliding active pill inside a shaped plate', () => {
    const { container } = render(bar({ shape: 'slant' }));
    const active = container.querySelector('button[aria-current="page"]')!;
    // layer first, then the indicator pill, then the content
    expect(firstChildIsLayer(active)).toBe(true);
    expect(layers(active)).toBe(3); // layer + indicator + icon
  });

  it('leaves an item used outside a NavBar unshaped', () => {
    render(<NavBarItem icon={icon} label="Home" data-testid="i" />);
    const el = screen.getByTestId('i');
    expect(el.getAttribute('data-shape')).toBeNull();
  });

  it('renders the shaped bar under dir=rtl without violations', async () => {
    const { container } = render(
      <div dir="rtl">{bar({ shape: 'edge', edgeAccent: true, sweep: true })}</div>,
    );
    for (const item of container.querySelectorAll('button')) {
      expect(item.getAttribute('data-shape')).toBe('edge');
    }
    const results = await axe.run(container, { rules: AXE_RULES });
    expect(results.violations).toEqual([]);
  });
});
