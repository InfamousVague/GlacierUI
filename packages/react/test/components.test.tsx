import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { Button, Checkbox, Field, Input, Radio, Switch } from '../src/index.ts';

async function expectNoAxeViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      // No design-system page context in unit tests
      region: { enabled: false },
      'page-has-heading-one': { enabled: false },
    },
  });
  expect(results.violations).toEqual([]);
}

describe('Button', () => {
  it('renders, clicks, and blocks interaction while loading', () => {
    let clicks = 0;
    const { rerender } = render(<Button onClick={() => clicks++}>Save</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(clicks).toBe(1);

    rerender(
      <Button loading onClick={() => clicks++}>
        Save
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(clicks).toBe(1);
  });

  it('has no axe violations', async () => {
    const { container } = render(<Button>Save</Button>);
    await expectNoAxeViolations(container);
  });
});

describe('Field + Input', () => {
  it('wires label, hint, and error to the input', async () => {
    const { rerender } = render(
      <Field label="Email" hint="We never share it.">
        <Input placeholder="you@example.com" />
      </Field>,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAccessibleDescription('We never share it.');

    rerender(
      <Field label="Email" error="Required.">
        <Input placeholder="you@example.com" />
      </Field>,
    );
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    // AnimatePresence swaps hint -> error, so the alert mounts after the exit
    expect(await screen.findByRole('alert')).toHaveTextContent('Required.');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Field label="Email" hint="We never share it.">
        <Input />
      </Field>,
    );
    await expectNoAxeViolations(container);
  });
});

describe('selection controls', () => {
  it('Checkbox toggles uncontrolled state', () => {
    render(<Checkbox label="Enable" />);
    const box = screen.getByRole('checkbox', { name: 'Enable' });
    expect(box).not.toBeChecked();
    fireEvent.click(box);
    expect(box).toBeChecked();
  });

  it('Switch reports changes via onCheckedChange', () => {
    let latest: boolean | null = null;
    render(<Switch label="Wi-Fi" onCheckedChange={(v) => (latest = v)} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Wi-Fi' }));
    expect(latest).toBe(true);
  });

  it('defaults each native input to the selection haptic kind', () => {
    render(
      <>
        <Checkbox label="Enable" />
        <Switch label="Wi-Fi" />
        <Radio label="Pick" />
      </>,
    );
    expect(screen.getByRole('checkbox', { name: 'Enable' })).toHaveAttribute('data-haptic', 'selection');
    expect(screen.getByRole('switch', { name: 'Wi-Fi' })).toHaveAttribute('data-haptic', 'selection');
    expect(screen.getByRole('radio', { name: 'Pick' })).toHaveAttribute('data-haptic', 'selection');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Checkbox label="Enable" />
        <Switch label="Wi-Fi" />
      </>,
    );
    await expectNoAxeViolations(container);
  });
});
