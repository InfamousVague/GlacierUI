import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { shapes } from '@glacier/spec';
import { Button, Card, Pill, StatTile, fx, staggerVars } from '@glacier/react';

/**
 * The shape engine: one aria-hidden layer under the content carries every
 * gamified silhouette, and a plain rectangle asks for nothing at all.
 *
 * The first describe block is the load-bearing one. `shape="rect"` is the kit's
 * default everywhere, and the whole additive-vocabulary promise rests on it
 * rendering byte-identical DOM to a component that never heard of shapes - no
 * class, no data attribute, no extra element.
 */

const layerOf = (root: HTMLElement) => root.querySelector('[aria-hidden="true"][class*="layer"]');

describe('rect is byte-identical to no shape at all', () => {
  it('Button: bare, explicit rect, and rect with both accents off all agree', () => {
    const bare = render(<Button>Go</Button>).container.innerHTML;
    const explicit = render(<Button shape="rect">Go</Button>).container.innerHTML;
    const spelledOut = render(
      <Button shape="rect" edgeAccent={false} sweep={false}>
        Go
      </Button>,
    ).container.innerHTML;
    expect(explicit).toBe(bare);
    expect(spelledOut).toBe(bare);
  });

  it('Pill: bare and explicit rect agree', () => {
    const bare = render(<Pill>Tag</Pill>).container.innerHTML;
    const explicit = render(<Pill shape="rect">Tag</Pill>).container.innerHTML;
    expect(explicit).toBe(bare);
  });

  it('emits no layer, no data-shape and no host class', () => {
    const { container } = render(<Button shape="rect">Go</Button>);
    const button = container.querySelector('button')!;
    expect(button.hasAttribute('data-shape')).toBe(false);
    expect(button.className).not.toMatch(/host/);
    expect(layerOf(container)).toBeNull();
    expect(button.childNodes).toHaveLength(1); // the label text, nothing else
  });
});

describe('the shape layer', () => {
  const gamified = shapes.filter((shape) => shape !== 'rect');

  it.each(gamified)('shape="%s" marks the host and renders exactly one layer', (shape) => {
    const { container } = render(<Button shape={shape}>Go</Button>);
    const button = container.querySelector('button')!;
    expect(button).toHaveAttribute('data-shape', shape);
    expect(button.className).toMatch(/host/);

    const layers = container.querySelectorAll('[aria-hidden="true"][class*="layer"]');
    expect(layers).toHaveLength(1);
    // the layer paints under the content, so it is the host's first child
    expect(button.firstElementChild).toBe(layers[0]);
    expect(layers[0]!.className).toMatch(new RegExp(shape));
  });

  it('the layer never takes part in the accessible tree or in hit testing', () => {
    const { container } = render(<Button shape="notch">Go</Button>);
    const layer = layerOf(container)!;
    expect(layer).toHaveAttribute('aria-hidden', 'true');
    expect(layer.tagName).toBe('SPAN');
    expect(layer.textContent).toBe('');
  });

  it('Pill takes the shape too', () => {
    const { container } = render(<Pill shape="slant">Tag</Pill>);
    const pill = container.querySelector('span')!;
    expect(pill).toHaveAttribute('data-shape', 'slant');
    expect(layerOf(container)).not.toBeNull();
  });

  it('a rect host still gets a layer once an accent is asked for', () => {
    const { container } = render(
      <Button edgeAccent sweep>
        Go
      </Button>,
    );
    const button = container.querySelector('button')!;
    // the attribute is present and reads rect: the paint hand-off is on, the
    // silhouette is not
    expect(button).toHaveAttribute('data-shape', 'rect');
    const layer = layerOf(container)!;
    expect(layer.className).toMatch(/edgeAccent/);
    expect(layer.className).toMatch(/sweep/);
  });

  it('the accents are independent opt-ins', () => {
    const accentOnly = render(<Button shape="slant" edgeAccent />);
    expect(layerOf(accentOnly.container)!.className).toMatch(/edgeAccent/);
    expect(layerOf(accentOnly.container)!.className).not.toMatch(/sweep/);

    const sweepOnly = render(<Button shape="slant" sweep />);
    expect(layerOf(sweepOnly.container)!.className).not.toMatch(/edgeAccent/);
    expect(layerOf(sweepOnly.container)!.className).toMatch(/sweep/);
  });

  it('mirroring is the stylesheet’s job, so RTL changes no markup', () => {
    const ltr = render(
      <div dir="ltr">
        <Button shape="notch" edgeAccent sweep>
          Go
        </Button>
      </div>,
    ).container.innerHTML;
    const rtl = render(
      <div dir="rtl">
        <Button shape="notch" edgeAccent sweep>
          Go
        </Button>
      </div>,
    ).container.innerHTML;
    expect(rtl.replace(' dir="rtl"', '')).toBe(ltr.replace(' dir="ltr"', ''));
  });

  it('leaves the host free to keep its own props', () => {
    const { container } = render(
      <Button shape="edge" className="mine" disabled>
        Go
      </Button>,
    );
    const button = container.querySelector('button')!;
    expect(button.className).toMatch(/mine/);
    expect(button).toBeDisabled();
    expect(layerOf(container)).not.toBeNull();
  });
});

describe('light-animation utilities', () => {
  it('exposes a class for each animation', () => {
    for (const name of ['riseIn', 'shimmer', 'glowPulse'] as const) {
      expect(fx[name]).toBeTypeOf('string');
      expect(fx[name]).toMatch(new RegExp(name));
    }
  });

  it('staggerVars carries the index as the stagger custom property', () => {
    expect(staggerVars(0)).toEqual({ '--glacier-stagger-i': 0 });
    expect(staggerVars(4)).toEqual({ '--glacier-stagger-i': 4 });
  });

  it('applies as a plain className and inline style', () => {
    const { container } = render(
      <ul>
        {['a', 'b', 'c'].map((item, i) => (
          <li key={item} className={fx.riseIn} style={staggerVars(i)}>
            {item}
          </li>
        ))}
      </ul>,
    );
    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(3);
    expect(items[2]!.getAttribute('style')).toContain('--glacier-stagger-i: 2');
    expect(items[2]!.className).toMatch(/riseIn/);
  });
});

/**
 * The lift gate. The hover depth, the widening accent edge and the sweep are
 * affordances: they belong to a surface that actually responds to a pointer.
 * Before this attribute existed every shaped host got them, so a static card
 * lit up and lifted under the cursor. The CSS keys off `data-shape-lift`; this
 * suite holds the components to the right answer.
 */
describe('the lift gate', () => {
  it('a shaped Button always lifts', () => {
    const { container } = render(<Button shape="slant">Go</Button>);
    expect(container.querySelector('button')).toHaveAttribute('data-shape-lift');
  });

  it('a shaped Pill never lifts: it is not a target', () => {
    const { container } = render(<Pill shape="slant">Tag</Pill>);
    expect(container.querySelector('span')!.hasAttribute('data-shape-lift')).toBe(false);
  });

  it('a shaped StatTile never lifts', () => {
    const { container } = render(<StatTile shape="notch" value="7" label="Decks" />);
    expect(container.firstElementChild!.hasAttribute('data-shape-lift')).toBe(false);
  });

  it('a shaped Card lifts only when it is interactive', () => {
    const still = render(<Card shape="notch">Body</Card>).container.firstElementChild!;
    expect(still.hasAttribute('data-shape-lift')).toBe(false);

    const clickable = render(
      <Card shape="notch" interactive>
        Body
      </Card>,
    ).container.firstElementChild!;
    expect(clickable).toHaveAttribute('data-shape-lift');
  });

  it('the attribute never appears on an unshaped host', () => {
    const { container } = render(<Button>Go</Button>);
    expect(container.querySelector('button')!.hasAttribute('data-shape-lift')).toBe(false);
  });
});
