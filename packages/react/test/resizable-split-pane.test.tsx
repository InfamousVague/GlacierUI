import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { ResizableSplitPane } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('ResizableSplitPane', () => {
  it('renders two panes and a separator with value semantics', () => {
    render(
      <ResizableSplitPane aria-label="Resize" defaultRatio={0.4}>
        <div>Start</div>
        <div>End</div>
      </ResizableSplitPane>,
    );
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
    const divider = screen.getByRole('separator', { name: 'Resize' });
    expect(divider).toHaveAttribute('aria-orientation', 'vertical');
    expect(divider).toHaveAttribute('aria-valuenow', '40');
    expect(divider).toHaveAttribute('aria-valuemin', '10');
    expect(divider).toHaveAttribute('aria-valuemax', '90');
  });

  it('reports horizontal orientation for a vertical split', () => {
    render(
      <ResizableSplitPane orientation="vertical" aria-label="Resize">
        <div>Top</div>
        <div>Bottom</div>
      </ResizableSplitPane>,
    );
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('nudges the ratio with the arrow keys and calls onRatioChange', () => {
    const onRatioChange = vi.fn();
    render(
      <ResizableSplitPane aria-label="Resize" defaultRatio={0.5} step={0.1} onRatioChange={onRatioChange}>
        <div>Start</div>
        <div>End</div>
      </ResizableSplitPane>,
    );
    const divider = screen.getByRole('separator');
    fireEvent.keyDown(divider, { key: 'ArrowRight' });
    expect(divider).toHaveAttribute('aria-valuenow', '60');
    expect(onRatioChange).toHaveBeenLastCalledWith(0.6);
    fireEvent.keyDown(divider, { key: 'ArrowLeft' });
    expect(divider).toHaveAttribute('aria-valuenow', '50');
  });

  it('clamps to min and max on Home and End', () => {
    render(
      <ResizableSplitPane aria-label="Resize" min={0.2} max={0.7} defaultRatio={0.5}>
        <div>Start</div>
        <div>End</div>
      </ResizableSplitPane>,
    );
    const divider = screen.getByRole('separator');
    fireEvent.keyDown(divider, { key: 'End' });
    expect(divider).toHaveAttribute('aria-valuenow', '70');
    fireEvent.keyDown(divider, { key: 'Home' });
    expect(divider).toHaveAttribute('aria-valuenow', '20');
    // arrows past the clamp stay clamped
    fireEvent.keyDown(divider, { key: 'ArrowLeft' });
    expect(divider).toHaveAttribute('aria-valuenow', '20');
  });

  it('resets to resetRatio on double-click', () => {
    const onRatioChange = vi.fn();
    render(
      <ResizableSplitPane aria-label="Resize" defaultRatio={0.5} resetRatio={0.3} onRatioChange={onRatioChange}>
        <div>Start</div>
        <div>End</div>
      </ResizableSplitPane>,
    );
    const divider = screen.getByRole('separator');
    fireEvent.keyDown(divider, { key: 'ArrowRight' });
    fireEvent.doubleClick(divider);
    expect(divider).toHaveAttribute('aria-valuenow', '30');
    expect(onRatioChange).toHaveBeenLastCalledWith(0.3);
  });

  it('respects a controlled ratio and does not self-update', () => {
    const onRatioChange = vi.fn();
    render(
      <ResizableSplitPane aria-label="Resize" ratio={0.5} onRatioChange={onRatioChange}>
        <div>Start</div>
        <div>End</div>
      </ResizableSplitPane>,
    );
    const divider = screen.getByRole('separator');
    fireEvent.keyDown(divider, { key: 'ArrowRight' });
    // stays at the controlled value until the parent re-renders it
    expect(divider).toHaveAttribute('aria-valuenow', '50');
    expect(onRatioChange).toHaveBeenCalledWith(0.52);
  });

  it('has no axe violations', async () => {
    render(
      <ResizableSplitPane aria-label="Resize panes" defaultRatio={0.4}>
        <div>Start</div>
        <div>End</div>
      </ResizableSplitPane>,
    );
    await screen.findByRole('separator');
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
