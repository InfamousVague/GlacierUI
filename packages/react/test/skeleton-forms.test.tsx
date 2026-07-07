import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Field, Input, Select } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
];

describe('form skeleton states', () => {
  it('Input skeleton replaces the textbox with a full-width placeholder at the control height', () => {
    const { container } = render(<Input skeleton size="lg" />);
    expect(screen.queryByRole('textbox')).toBeNull();
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('100%');
    expect(skeleton.style.height).toBe('var(--perfect-control-height-lg)');
    expect(skeleton.style.borderRadius).toBe('var(--perfect-radius-lg)');
  });

  it('Field skeleton swaps the label and hint for text lines around its children', () => {
    const { container } = render(
      <Field skeleton label="Email" hint="Used for receipts.">
        <Input skeleton />
      </Field>,
    );
    expect(screen.queryByText('Email')).toBeNull();
    expect(container.querySelector('label')).toBeNull();
    const skeletons = container.querySelectorAll<HTMLElement>('[data-skeleton]');
    // label line + the nested Input skeleton + hint line
    expect(skeletons).toHaveLength(3);
    expect(skeletons[0]?.style.width).toBe('5rem');
    expect(skeletons[2]?.style.width).toBe('9rem');
  });

  it('Field skeleton omits the label and hint lines when those props are unset', () => {
    const { container } = render(
      <Field skeleton>
        <Input skeleton />
      </Field>,
    );
    expect(container.querySelectorAll('[data-skeleton]')).toHaveLength(1);
  });

  it('Select skeleton replaces the trigger with a silent placeholder', () => {
    const { container } = render(<Select skeleton options={OPTIONS} size="sm" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('listbox')).toBeNull();
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('11rem');
    expect(skeleton.style.height).toBe('var(--perfect-control-height-sm)');
    expect(skeleton.style.borderRadius).toBe('var(--perfect-radius-lg)');
  });

  it('Select skeleton stretches with fullWidth', () => {
    const { container } = render(<Select skeleton fullWidth options={OPTIONS} />);
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('100%');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Input skeleton />
        <Field skeleton label="Email" hint="Used for receipts.">
          <Input skeleton />
        </Field>
        <Select skeleton options={OPTIONS} />
      </>,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
