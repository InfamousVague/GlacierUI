import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { Select } from '../src/index.ts';

const OPTIONS = [
  { value: 'mp4', label: 'MP4' },
  { value: 'mov', label: 'MOV' },
  { value: 'webm', label: 'WebM', disabled: true },
  { value: 'gif', label: 'GIF' },
];

function getTrigger() {
  return screen.getByRole('button', { name: 'Format' });
}

describe('Select', () => {
  it('shows the placeholder, opens on click, and selects on option click', () => {
    let latest: string | null = null;
    render(<Select aria-label="Format" options={OPTIONS} onValueChange={(v) => (latest = v)} />);
    expect(getTrigger()).toHaveTextContent('Select…');

    fireEvent.click(getTrigger());
    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: 'MOV' }));
    expect(latest).toBe('mov');
    expect(getTrigger()).toHaveTextContent('MOV');
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('respects defaultValue and marks the selected option', () => {
    render(<Select aria-label="Format" options={OPTIONS} defaultValue="gif" />);
    expect(getTrigger()).toHaveTextContent('GIF');
    fireEvent.click(getTrigger());
    expect(screen.getByRole('option', { name: 'GIF' })).toHaveAttribute('aria-selected', 'true');
  });

  it('supports full keyboard interaction', () => {
    render(<Select aria-label="Format" options={OPTIONS} />);
    const trigger = getTrigger();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const listbox = screen.getByRole('listbox');

    // starts on the first enabled option, skips the disabled one going down
    expect(listbox).toHaveAttribute('aria-activedescendant');
    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    fireEvent.keyDown(listbox, { key: 'ArrowDown' });
    fireEvent.keyDown(listbox, { key: 'Enter' });
    expect(getTrigger()).toHaveTextContent('GIF');

    // escape closes without changing the value
    fireEvent.click(getTrigger());
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    expect(getTrigger()).toHaveTextContent('GIF');
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not commit disabled options', () => {
    render(<Select aria-label="Format" options={OPTIONS} defaultValue="mp4" />);
    fireEvent.click(getTrigger());
    fireEvent.click(screen.getByRole('option', { name: 'WebM' }));
    expect(getTrigger()).toHaveTextContent('MP4');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('supports controlled usage', () => {
    const { rerender } = render(<Select aria-label="Format" options={OPTIONS} value="mp4" />);
    fireEvent.click(getTrigger());
    fireEvent.click(screen.getByRole('option', { name: 'MOV' }));
    expect(getTrigger()).toHaveTextContent('MP4');
    rerender(<Select aria-label="Format" options={OPTIONS} value="mov" />);
    expect(getTrigger()).toHaveTextContent('MOV');
  });

  it('submits via a hidden input when name is set', () => {
    const { container } = render(
      <Select aria-label="Format" name="format" options={OPTIONS} defaultValue="mp4" />,
    );
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toHaveAttribute('name', 'format');
    expect(hidden.value).toBe('mp4');
  });

  it('has no axe violations open or closed', async () => {
    const { container } = render(<Select aria-label="Format" options={OPTIONS} defaultValue="mp4" />);
    const rules = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };
    expect((await axe.run(container, { rules })).violations).toEqual([]);
    fireEvent.click(getTrigger());
    // the menu portals to document.body, so audit the whole document
    expect((await axe.run(document.body, { rules })).violations).toEqual([]);
  });
});
