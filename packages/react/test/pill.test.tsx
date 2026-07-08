import { describe, expect, it, vi } from 'vitest';
import { Tone } from '@glacier/react';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Pill } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Pill icon and remove', () => {
  it('renders a leading icon hidden from assistive tech', () => {
    const { container } = render(<Pill icon={<svg data-testid="glyph" />}>Fiction</Pill>);
    expect(screen.getByTestId('glyph')).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('renders a labeled remove button that fires onRemove', () => {
    const onRemove = vi.fn();
    render(<Pill onRemove={onRemove}>Fiction</Pill>);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('omits the remove button when onRemove is not set', () => {
    render(<Pill>Fiction</Pill>);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('keeps a bare pill as a plain labeled span', () => {
    const { container } = render(<Pill>Fiction</Pill>);
    const pill = container.firstElementChild as HTMLElement;
    expect(pill.tagName).toBe('SPAN');
    expect(pill).toHaveTextContent('Fiction');
    expect(pill.querySelector('button')).toBeNull();
  });

  it('has no axe violations with an icon and a remove button', async () => {
    render(
      <div>
        <Pill icon={<svg />} tone={Tone.Accent}>
          Fiction
        </Pill>
        <Pill tone={Tone.Danger} onRemove={() => {}}>
          Overdue
        </Pill>
      </div>,
    );
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
