import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { Spotlight } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

function renderStep(overrides: Partial<React.ComponentProps<typeof Spotlight>> = {}) {
  const target = document.createElement('button');
  target.textContent = 'Target';
  document.body.appendChild(target);
  const targetRef = createRef<HTMLElement>();
  // point the ref at the detached-but-mounted node
  (targetRef as { current: HTMLElement | null }).current = target;
  const onClose = overrides.onClose ?? vi.fn();
  const utils = render(
    <Spotlight
      open
      targetRef={targetRef}
      title="Your dashboard"
      description="Everything lives here."
      step={1}
      total={3}
      onClose={onClose}
      {...overrides}
    />,
  );
  return { ...utils, onClose, target };
}

describe('Spotlight', () => {
  it('renders a labelled, described modal dialog when open', () => {
    renderStep();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Your dashboard');
    expect(dialog).toHaveAccessibleDescription('Everything lives here.');
  });

  it('renders nothing when closed', () => {
    renderStep({ open: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the step count', () => {
    renderStep({ step: 2, total: 4 });
    expect(screen.getByLabelText('Step 2 of 4')).toHaveTextContent('2 / 4');
  });

  it('calls onNext and onBack from the controls', () => {
    const onNext = vi.fn();
    const onBack = vi.fn();
    renderStep({ onNext, onBack });
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('omits Back and Next when their handlers are absent', () => {
    renderStep();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
  });

  it('labels the final Next as Done', () => {
    renderStep({ step: 3, total: 3, onNext: vi.fn() });
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('dismisses from the close button and Escape', () => {
    const onClose = vi.fn();
    renderStep({ onClose });
    fireEvent.click(screen.getByRole('button', { name: 'Close tour' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('has no axe violations when open', async () => {
    renderStep({ onNext: vi.fn(), onBack: vi.fn() });
    await screen.findByRole('dialog');
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
