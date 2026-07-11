import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Field, Fieldset, FormSection, Input } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Fieldset', () => {
  it('renders a native fieldset named by its legend', () => {
    render(
      <Fieldset legend="Shipping address">
        <input aria-label="City" />
      </Fieldset>,
    );
    const group = screen.getByRole('group', { name: 'Shipping address' });
    expect(group.tagName).toBe('FIELDSET');
    expect(group.querySelector('legend')).toHaveTextContent('Shipping address');
  });

  it('wires the description to the fieldset through aria-describedby', () => {
    render(
      <Fieldset legend="Shipping" description="Where the order goes.">
        <input aria-label="City" />
      </Fieldset>,
    );
    const group = screen.getByRole('group', { name: 'Shipping' });
    const descId = group.getAttribute('aria-describedby');
    expect(descId).toBeTruthy();
    expect(document.getElementById(descId!)).toHaveTextContent('Where the order goes.');
    expect(group).toHaveAccessibleDescription('Where the order goes.');
  });

  it('merges a consumer aria-describedby with the description id', () => {
    render(
      <>
        <p id="outer-note">Outer note.</p>
        <Fieldset legend="Shipping" description="Where the order goes." aria-describedby="outer-note">
          <input aria-label="City" />
        </Fieldset>
      </>,
    );
    const ids = screen.getByRole('group', { name: 'Shipping' }).getAttribute('aria-describedby')!.split(' ');
    expect(ids).toContain('outer-note');
    expect(ids).toHaveLength(2);
  });

  it('cascades native disabled to every nested control', () => {
    render(
      <Fieldset legend="Shipping" disabled>
        <Field label="City">
          <Input />
        </Field>
        <input aria-label="Zip" />
        <button type="button">Save</button>
      </Fieldset>,
    );
    expect(screen.getByRole('group', { name: 'Shipping' })).toBeDisabled();
    expect(screen.getByLabelText('City')).toBeDisabled();
    expect(screen.getByLabelText('Zip')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('leaves controls enabled when not disabled', () => {
    render(
      <Fieldset legend="Shipping">
        <input aria-label="Zip" />
      </Fieldset>,
    );
    expect(screen.getByLabelText('Zip')).toBeEnabled();
  });

  it('renders the actions slot outside the legend', () => {
    render(
      <Fieldset legend="Shipping" actions={<button type="button">Reset</button>}>
        <input aria-label="City" />
      </Fieldset>,
    );
    const action = screen.getByRole('button', { name: 'Reset' });
    expect(action).toBeInTheDocument();
    expect(action.closest('legend')).toBeNull();
    // the group name stays clean of the action label
    expect(screen.getByRole('group', { name: 'Shipping' })).toBeInTheDocument();
  });

  it('renders skeleton placeholders instead of the legend and description', () => {
    const { container } = render(
      <Fieldset skeleton legend="Shipping" description="Where the order goes.">
        <input aria-label="City" />
      </Fieldset>,
    );
    expect(container.querySelectorAll('[data-skeleton]').length).toBe(2);
    expect(screen.queryByText('Shipping')).not.toBeInTheDocument();
    expect(screen.queryByText('Where the order goes.')).not.toBeInTheDocument();
  });

  it('forwards rest props to the fieldset element', () => {
    render(
      <Fieldset legend="Shipping" data-testid="probe">
        <input aria-label="City" />
      </Fieldset>,
    );
    expect(screen.getByTestId('probe').tagName).toBe('FIELDSET');
  });

  it('has no axe violations', async () => {
    render(
      <Fieldset bordered legend="Shipping" description="Where the order goes." actions={<button type="button">Reset</button>}>
        <Field label="City">
          <Input />
        </Field>
      </Fieldset>,
    );
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('FormSection', () => {
  it('labels the section with its title through aria-labelledby', () => {
    render(
      <FormSection title="Profile">
        <input aria-label="Name" />
      </FormSection>,
    );
    const section = screen.getByRole('region', { name: 'Profile' });
    expect(section.tagName).toBe('SECTION');
    const titleId = section.getAttribute('aria-labelledby')!;
    expect(document.getElementById(titleId)).toHaveTextContent('Profile');
  });

  it('renders the title as a heading of the given level', () => {
    render(
      <FormSection title="Profile" level={2}>
        <input aria-label="Name" />
      </FormSection>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Profile' })).toBeInTheDocument();
  });

  it('defaults the title to a level 3 heading', () => {
    render(
      <FormSection title="Profile">
        <input aria-label="Name" />
      </FormSection>,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Profile' })).toBeInTheDocument();
  });

  it('renders description and actions on the title row', () => {
    render(
      <FormSection title="Profile" description="How you appear." actions={<button type="button">Reset</button>}>
        <input aria-label="Name" />
      </FormSection>,
    );
    expect(screen.getByText('How you appear.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  it('draws a divider above the section when divider is set', () => {
    const { container } = render(
      <FormSection divider title="Profile">
        <input aria-label="Name" />
      </FormSection>,
    );
    const section = container.querySelector('section')!;
    expect(section.firstElementChild!.tagName).toBe('HR');
  });

  it('renders skeleton placeholders without a labelled region', () => {
    const { container } = render(
      <FormSection skeleton title="Profile" description="How you appear.">
        <input aria-label="Name" />
      </FormSection>,
    );
    expect(container.querySelectorAll('[data-skeleton]').length).toBe(2);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  it('forwards rest props to the section element', () => {
    render(
      <FormSection title="Profile" data-testid="probe">
        <input aria-label="Name" />
      </FormSection>,
    );
    expect(screen.getByTestId('probe').tagName).toBe('SECTION');
  });

  it('has no axe violations, including a Fieldset inside', async () => {
    render(
      <FormSection title="Notifications" description="What we send." actions={<button type="button">Reset</button>}>
        <Fieldset legend="Email">
          <Field label="Address">
            <Input />
          </Field>
        </Fieldset>
      </FormSection>,
    );
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
