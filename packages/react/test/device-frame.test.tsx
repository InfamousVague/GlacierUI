import { describe, expect, it } from 'vitest';
import { Size } from '@glacier/react';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { DeviceFrame } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('DeviceFrame', () => {
  it('renders a labelled group with its children in the screen', () => {
    render(
      <DeviceFrame aria-label="App preview">
        <p>Hello preview</p>
      </DeviceFrame>,
    );
    const group = screen.getByRole('group', { name: 'App preview' });
    expect(group).toBeInTheDocument();
    expect(screen.getByText('Hello preview')).toBeInTheDocument();
  });

  it('applies the preset width for a size', () => {
    render(
      <DeviceFrame aria-label="Small">
        <span>child</span>
      </DeviceFrame>,
    );
    const group = screen.getByRole('group', { name: 'Small' });
    expect(group.style.getPropertyValue('--device-frame-width')).toBe('17rem'); // md default
  });

  it('lets an explicit numeric width override the size, as px', () => {
    render(
      <DeviceFrame aria-label="Custom" size={Size.Small} width={320}>
        <span>child</span>
      </DeviceFrame>,
    );
    const group = screen.getByRole('group', { name: 'Custom' });
    expect(group.style.getPropertyValue('--device-frame-width')).toBe('320px');
  });

  it('exposes the aspect ratio as a custom property', () => {
    render(
      <DeviceFrame aria-label="Wide" aspect="3 / 4">
        <span>child</span>
      </DeviceFrame>,
    );
    const group = screen.getByRole('group', { name: 'Wide' });
    expect(group.style.getPropertyValue('--device-frame-aspect')).toBe('3 / 4');
  });

  it('marks the bezel and buttons decorative and hides the notch on request', () => {
    const { container } = render(
      <DeviceFrame aria-label="Slab" hideNotch>
        <span>child</span>
      </DeviceFrame>,
    );
    // Every decorative chrome node is hidden from assistive tech.
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
    // No notch: only the screen content remains as a non-hidden descendant of the group.
    const group = screen.getByRole('group', { name: 'Slab' });
    expect(group.querySelectorAll(':scope > [aria-hidden="true"]').length).toBe(5); // bezel + 4 buttons
  });

  it('has no axe violations', async () => {
    render(
      <DeviceFrame aria-label="App preview">
        <div>
          <h2>Home</h2>
          <p>Preview content</p>
        </div>
      </DeviceFrame>,
    );
    await screen.findByRole('group', { name: 'App preview' });
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
