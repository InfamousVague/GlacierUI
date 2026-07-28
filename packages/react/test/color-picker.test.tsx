import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { ColorPicker } from '../src/index.ts';

const setup = (props: Partial<React.ComponentProps<typeof ColorPicker>> = {}) => {
  const onValueChange = vi.fn();
  render(<ColorPicker onValueChange={onValueChange} {...props} />);
  return { onValueChange };
};

const slider = (name: string) => screen.getByLabelText(name) as HTMLInputElement;
const hexField = () => screen.getByLabelText('Hex value') as HTMLInputElement;

describe('ColorPicker', () => {
  it('offers a slider per channel', () => {
    setup();
    for (const label of ['Lightness', 'Chroma', 'Hue']) {
      expect(screen.getByText(label)).toBeTruthy();
    }
    expect(screen.getAllByRole('slider')).toHaveLength(3);
  });

  it('adds an opacity slider only when asked', () => {
    setup({ alpha: true });
    expect(screen.getAllByRole('slider')).toHaveLength(4);
  });

  it('uses real range inputs, so the channels are keyboard-operable', () => {
    // A 2D gradient canvas would be drag-only, and unusable without sight.
    setup();
    for (const s of screen.getAllByRole('slider')) expect((s as HTMLInputElement).type).toBe('range');
  });

  it('shows the current colour as text as well as a swatch', () => {
    // Colour is never the only channel of information.
    setup({ defaultValue: '#3b82f6' });
    expect(screen.getAllByText('#3b82f6').length).toBeGreaterThan(0);
  });

  it('reports a change when a channel moves', () => {
    const { onValueChange } = setup({ defaultValue: 'oklch(0.5 0.1 200)' });
    fireEvent.change(screen.getAllByRole('slider')[0]!, { target: { value: '0.8' } });
    expect(onValueChange).toHaveBeenCalledWith(expect.stringContaining('oklch(0.8'));
  });

  it('reports hex when asked to', () => {
    const { onValueChange } = setup({ defaultValue: '#3b82f6', format: 'hex' });
    fireEvent.change(screen.getAllByRole('slider')[2]!, { target: { value: '120' } });
    expect(onValueChange.mock.calls[0]![0]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('accepts a hex default and shows it on the sliders', () => {
    setup({ defaultValue: '#ff0000' });
    // Pure red is a high-chroma, warm hue; the sliders should reflect that
    // rather than sitting at zero.
    expect(Number(screen.getAllByRole('slider')[1]!.getAttribute('value'))).toBeGreaterThan(0.1);
  });

  it('commits a typed hex once it parses', () => {
    const { onValueChange } = setup({ format: 'hex' });
    fireEvent.change(hexField(), { target: { value: '#00ff00' } });
    expect(onValueChange).toHaveBeenCalledWith('#00ff00');
  });

  it('does not commit a half-typed hex', () => {
    // Otherwise the colour lurches to something wrong on every keystroke.
    const { onValueChange } = setup();
    fireEvent.change(hexField(), { target: { value: '#00f' } });
    onValueChange.mockClear();
    fireEvent.change(hexField(), { target: { value: '#00ff0' } });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keeps the half-typed text in the field while it is being typed', () => {
    setup();
    fireEvent.change(hexField(), { target: { value: '#00ff0' } });
    expect(hexField().value).toBe('#00ff0');
  });

  it('names the channel as well as the number for a screen reader', () => {
    setup({ defaultValue: 'oklch(0.5 0.1 200)' });
    expect(slider('Lightness').getAttribute('aria-valuetext')).toBe('Lightness 50%');
  });

  it('says so when a colour is outside sRGB', () => {
    // Rather than silently showing the clamped colour as though it were the one
    // asked for.
    setup({ defaultValue: 'oklch(0.95 0.35 140)' });
    expect(screen.getByText('Outside sRGB')).toBeTruthy();
  });

  it('stays quiet for a displayable colour', () => {
    setup({ defaultValue: '#3b82f6' });
    expect(screen.queryByText('Outside sRGB')).toBeNull();
  });

  it('renders presets, each carrying its colour as a name', () => {
    // A row of unlabelled swatches is a row of unlabelled buttons.
    setup({ presets: ['#ff0000', '#00ff00'] });
    expect(screen.getByLabelText('#ff0000')).toBeTruthy();
    expect(screen.getByLabelText('#00ff00')).toBeTruthy();
  });

  it('applies a preset on press', () => {
    const { onValueChange } = setup({ presets: ['#ff0000'], format: 'hex' });
    fireEvent.click(screen.getByLabelText('#ff0000'));
    expect(onValueChange).toHaveBeenCalledWith('#ff0000');
  });

  it('marks the preset matching the current colour', () => {
    setup({ defaultValue: '#ff0000', presets: ['#ff0000', '#00ff00'] });
    expect(screen.getByLabelText('#ff0000').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByLabelText('#00ff00').getAttribute('aria-pressed')).toBe('false');
  });

  it('falls back to the default rather than blanking on an unparseable value', () => {
    setup({ value: 'not a colour' });
    expect(screen.getAllByRole('slider')).toHaveLength(3);
  });

  it('honours a controlled value', () => {
    const { onValueChange } = setup({ value: '#3b82f6' });
    fireEvent.change(screen.getAllByRole('slider')[0]!, { target: { value: '0.9' } });
    // Reports, but does not move itself.
    expect(onValueChange).toHaveBeenCalled();
    expect(screen.getAllByText('#3b82f6').length).toBeGreaterThan(0);
  });

  it('freezes when disabled', () => {
    setup({ disabled: true, presets: ['#ff0000'] });
    for (const s of screen.getAllByRole('slider')) expect((s as HTMLInputElement).disabled).toBe(true);
    expect(hexField().disabled).toBe(true);
    expect((screen.getByLabelText('#ff0000') as HTMLButtonElement).disabled).toBe(true);
  });

  it('keeps its geometry while loading', () => {
    render(<ColorPicker skeleton />);
    expect(screen.queryAllByRole('slider')).toHaveLength(0);
  });

  it('has no axe violations', async () => {
    const { container } = render(<ColorPicker defaultValue="#3b82f6" presets={['#ff0000']} aria-label="Brand colour" />);
    const results = await axe.run(container, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
