import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import axe from 'axe-core';
import { Wizard, type WizardStep } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

function makeSteps(overrides: Partial<WizardStep>[] = []): WizardStep[] {
  const base: WizardStep[] = [
    { id: 'account', label: 'Account', content: <p>Account form</p> },
    { id: 'profile', label: 'Profile', content: <p>Profile form</p> },
    { id: 'review', label: 'Review', content: <p>Review summary</p> },
  ];
  return base.map((step, i) => ({ ...step, ...overrides[i] }));
}

const nextButton = () => screen.getByRole('button', { name: 'Next' });
const previousButton = () => screen.getByRole('button', { name: 'Previous' });

describe('Wizard', () => {
  it('renders the progress header and the first panel under the accessible name', () => {
    render(<Wizard aria-label="Signup" steps={makeSteps()} />);
    expect(screen.getByRole('region', { name: 'Signup' })).toBeInTheDocument();
    // the Steps header announces position as its own group
    expect(screen.getByRole('group', { name: 'Step 1 of 3' })).toBeInTheDocument();
    // the heading carries the hidden position text plus the label, and names the panel
    expect(screen.getByRole('heading', { level: 2, name: 'Step 1 of 3 Account' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Step 1 of 3 Account' })).toBeInTheDocument();
    expect(screen.getByText('Account form')).toBeInTheDocument();
    expect(previousButton()).toBeDisabled();
  });

  it('renders the step label at headingLevel 3 when asked', () => {
    render(<Wizard aria-label="Signup" steps={makeSteps()} headingLevel={3} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Step 1 of 3 Account' })).toBeInTheDocument();
  });

  it('advances on Next and fires onStepChange with the new index and onSave with the left one', () => {
    const onStepChange = vi.fn();
    const onSave = vi.fn();
    render(<Wizard aria-label="Signup" steps={makeSteps()} onStepChange={onStepChange} onSave={onSave} />);
    fireEvent.click(nextButton());
    expect(onSave).toHaveBeenCalledWith(0);
    expect(onStepChange).toHaveBeenCalledWith(1);
    expect(screen.getByText('Profile form')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Step 2 of 3 Profile' })).toBeInTheDocument();
  });

  it('blocks silently when validate returns false', () => {
    const onStepChange = vi.fn();
    const onSave = vi.fn();
    const steps = makeSteps([{ validate: () => false }]);
    render(<Wizard aria-label="Signup" steps={steps} onStepChange={onStepChange} onSave={onSave} />);
    fireEvent.click(nextButton());
    expect(onStepChange).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Account form')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('blocks and voices the message in the live region when validate returns a string', () => {
    const steps = makeSteps([{ validate: () => 'Fill in your email first' }]);
    render(<Wizard aria-label="Signup" steps={steps} />);
    fireEvent.click(nextButton());
    expect(screen.getByRole('status')).toHaveTextContent('Fill in your email first');
    expect(screen.getByText('Account form')).toBeInTheDocument();
  });

  it('disables the footer while an async gate settles, then advances on true', async () => {
    let resolve!: (value: boolean) => void;
    const steps = makeSteps([
      { validate: () => new Promise<boolean>((r) => { resolve = r; }) },
    ]);
    const onStepChange = vi.fn();
    render(<Wizard aria-label="Signup" steps={steps} onStepChange={onStepChange} />);
    fireEvent.click(nextButton());
    expect(nextButton()).toBeDisabled();
    expect(previousButton()).toBeDisabled();
    expect(onStepChange).not.toHaveBeenCalled();
    await act(async () => resolve(true));
    expect(onStepChange).toHaveBeenCalledWith(1);
    expect(screen.getByText('Profile form')).toBeInTheDocument();
    expect(nextButton()).not.toBeDisabled();
  });

  it('shows an async gate message and stays put on a resolved string', async () => {
    let resolve!: (value: string) => void;
    const steps = makeSteps([
      { validate: () => new Promise<string>((r) => { resolve = r; }) },
    ]);
    render(<Wizard aria-label="Signup" steps={steps} />);
    fireEvent.click(nextButton());
    expect(nextButton()).toBeDisabled();
    await act(async () => resolve('Still missing a field'));
    expect(screen.getByRole('status')).toHaveTextContent('Still missing a field');
    expect(screen.getByText('Account form')).toBeInTheDocument();
    expect(nextButton()).not.toBeDisabled();
  });

  it('re-enables the footer and blocks silently when an async gate rejects', async () => {
    let reject!: (reason: Error) => void;
    const steps = makeSteps([
      { validate: () => new Promise<boolean>((_, r) => { reject = r; }) },
    ]);
    render(<Wizard aria-label="Signup" steps={steps} />);
    fireEvent.click(nextButton());
    expect(nextButton()).toBeDisabled();
    await act(async () => reject(new Error('network down')));
    await waitFor(() => expect(nextButton()).not.toBeDisabled());
    expect(previousButton()).toBeDisabled(); // still the first step
    expect(screen.getByText('Account form')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('goes back on Previous without gating and clears any error', () => {
    const onStepChange = vi.fn();
    const steps = makeSteps([{}, { validate: () => 'Blocked forward, not backward' }]);
    render(
      <Wizard aria-label="Signup" steps={steps} defaultActiveStep={1} onStepChange={onStepChange} />,
    );
    fireEvent.click(nextButton()); // gate blocks and shows its message
    expect(screen.getByRole('status')).toHaveTextContent('Blocked forward, not backward');
    fireEvent.click(previousButton());
    expect(onStepChange).toHaveBeenCalledWith(0);
    expect(screen.getByRole('heading', { name: 'Step 1 of 3 Account' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('fires onComplete (not onStepChange) from the last step once its gate passes', () => {
    const onComplete = vi.fn();
    const onStepChange = vi.fn();
    const onSave = vi.fn();
    render(
      <Wizard
        aria-label="Signup"
        steps={makeSteps()}
        defaultActiveStep={2}
        onComplete={onComplete}
        onStepChange={onStepChange}
        onSave={onSave}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(onSave).toHaveBeenCalledWith(2);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it('respects a controlled activeStep: reports the change but never advances itself', () => {
    const onStepChange = vi.fn();
    const { rerender } = render(
      <Wizard aria-label="Signup" steps={makeSteps()} activeStep={0} onStepChange={onStepChange} />,
    );
    fireEvent.click(nextButton());
    expect(onStepChange).toHaveBeenCalledWith(1);
    // the parent did not apply the change, so the wizard stays on step one
    expect(screen.getByRole('heading', { name: 'Step 1 of 3 Account' })).toBeInTheDocument();
    rerender(
      <Wizard aria-label="Signup" steps={makeSteps()} activeStep={1} onStepChange={onStepChange} />,
    );
    expect(screen.getByRole('heading', { name: 'Step 2 of 3 Profile' })).toBeInTheDocument();
  });

  it('moves focus to the panel after navigation, but not on mount', () => {
    render(<Wizard aria-label="Signup" steps={makeSteps()} />);
    expect(document.activeElement).toBe(document.body);
    fireEvent.click(nextButton());
    expect(document.activeElement).toBe(screen.getByRole('group', { name: 'Step 2 of 3 Profile' }));
    fireEvent.click(previousButton());
    expect(document.activeElement).toBe(screen.getByRole('group', { name: 'Step 1 of 3 Account' }));
  });

  it('uses the localized kit labels by default and accepts overrides', () => {
    const first = render(<Wizard aria-label="Signup" steps={makeSteps()} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    first.rerender(<Wizard aria-label="Signup" steps={makeSteps()} nextLabel="Continue" />);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    first.unmount();

    const { rerender } = render(
      <Wizard aria-label="Signup" steps={makeSteps()} defaultActiveStep={2} />,
    );
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    rerender(
      <Wizard
        aria-label="Signup"
        steps={makeSteps()}
        defaultActiveStep={2}
        previousLabel="Go back"
        finishLabel="Submit application"
      />,
    );
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit application' })).toBeInTheDocument();
  });

  it('clamps an out-of-range index into the steps', () => {
    render(<Wizard aria-label="Signup" steps={makeSteps()} defaultActiveStep={99} />);
    expect(screen.getByRole('heading', { name: 'Step 3 of 3 Review' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('renders skeleton placeholders hidden from assistive tech', () => {
    const { container } = render(<Wizard aria-label="Signup" steps={makeSteps()} skeleton />);
    const host = container.firstElementChild as HTMLElement;
    expect(host).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(host.querySelectorAll('[data-skeleton]').length).toBeGreaterThan(0);
  });

  it('returns focus to Next after a blocking async gate re-enables the footer', async () => {
    let reject: (v: string) => void = () => {};
    const steps = makeSteps([{ validate: () => new Promise<boolean | string>((res) => { reject = res; }) }]);
    render(<Wizard aria-label="Setup" steps={steps} />);
    nextButton().focus();
    fireEvent.click(nextButton());
    // the disabled loading button evicts focus to the body in real browsers
    act(() => { (document.activeElement as HTMLElement).blur(); });
    await act(async () => { reject('Taken.'); });
    await waitFor(() => expect(nextButton()).not.toBeDisabled());
    expect(document.activeElement).toBe(nextButton());
  });

  it('judges "last" against the latest steps when the array shrinks during an async gate', async () => {
    let resolve: (v: boolean) => void = () => {};
    const onComplete = vi.fn();
    const onStepChange = vi.fn();
    const gated: WizardStep = { id: 'profile', label: 'Profile', content: <p>Profile form</p>, validate: () => new Promise<boolean | string>((res) => { resolve = res; }) };
    const three = [makeSteps()[0]!, gated, makeSteps()[2]!];
    const { rerender } = render(
      <Wizard aria-label="Setup" steps={three} defaultActiveStep={1} onComplete={onComplete} onStepChange={onStepChange} />,
    );
    fireEvent.click(nextButton().isConnected ? screen.getByRole('button', { name: /Next|Done/ }) : nextButton());
    // the wizard shrinks to two steps while the gate is pending: index 1 is now last
    rerender(<Wizard aria-label="Setup" steps={[three[0]!, gated]} defaultActiveStep={1} onComplete={onComplete} onStepChange={onStepChange} />);
    await act(async () => { resolve(true); });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onStepChange).not.toHaveBeenCalled();
  });

  it('bails on an async gate that settles after a controlled parent navigated away', async () => {
    let resolve: (v: boolean) => void = () => {};
    const onSave = vi.fn();
    const steps = makeSteps([{ validate: () => new Promise<boolean | string>((res) => { resolve = res; }) }]);
    const { rerender } = render(<Wizard aria-label="Setup" steps={steps} activeStep={0} onSave={onSave} />);
    fireEvent.click(nextButton());
    rerender(<Wizard aria-label="Setup" steps={steps} activeStep={2} onSave={onSave} />);
    await act(async () => { resolve(true); });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('clears a gate message when a controlled parent changes the step externally', () => {
    const steps = makeSteps([undefined, { validate: () => 'Add a display name.' }] as Partial<WizardStep>[]);
    const { rerender } = render(<Wizard aria-label="Setup" steps={steps} activeStep={1} />);
    fireEvent.click(nextButton());
    expect(screen.getByRole('status')).toHaveTextContent('Add a display name.');
    rerender(<Wizard aria-label="Setup" steps={steps} activeStep={0} />);
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('re-renders the live region node when the identical message blocks again', () => {
    const steps = makeSteps([{ validate: () => 'Enter a valid email.' }]);
    render(<Wizard aria-label="Setup" steps={steps} />);
    fireEvent.click(nextButton());
    const first = screen.getByRole('status').firstElementChild;
    fireEvent.click(nextButton());
    const second = screen.getByRole('status').firstElementChild;
    expect(second?.textContent).toBe('Enter a valid email.');
    expect(first === second).toBe(false);
  });

  it('marks the exiting panel content inert during the transition', () => {
    render(<Wizard aria-label="Setup" steps={makeSteps()} />);
    fireEvent.click(nextButton());
    const old = screen.queryByText('Account form');
    // popLayout may keep the outgoing panel mounted mid-exit; if so it must
    // be out of the a11y tree and tab order
    if (old) {
      expect(old.closest('[inert], [aria-hidden="true"]')).not.toBeNull();
    }
    expect(screen.getByText('Profile form').closest('[inert], [aria-hidden="true"]')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Wizard aria-label="Signup" steps={makeSteps()} />);
    const results = await axe.run(container, { rules: AXE_RULES });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations while showing a gate message', async () => {
    const steps = makeSteps([{ validate: () => 'Fill in your email first' }]);
    const { container } = render(<Wizard aria-label="Signup" steps={steps} />);
    fireEvent.click(nextButton());
    const results = await axe.run(container, { rules: AXE_RULES });
    expect(results.violations).toEqual([]);
  });
});
