import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Image } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Image', () => {
  it('renders an img with its src and alt', () => {
    render(<Image src="/cover.jpg" alt="Dune cover" aspectRatio="2 / 3" />);
    const img = screen.getByAltText('Dune cover') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('/cover.jpg');
  });

  it('starts in the loading state and sets the frame aspect ratio', () => {
    const { container } = render(<Image src="/cover.jpg" alt="Cover" aspectRatio="2 / 3" />);
    const frame = container.firstElementChild as HTMLElement;
    expect(frame.getAttribute('data-status')).toBe('loading');
    expect(frame.getAttribute('style')).toContain('aspect-ratio');
  });

  it('marks the frame loaded once the image decodes', () => {
    const { container } = render(<Image src="/cover.jpg" alt="Cover" />);
    const frame = container.firstElementChild as HTMLElement;
    fireEvent.load(screen.getByAltText('Cover'));
    expect(frame.getAttribute('data-status')).toBe('loaded');
  });

  it('swaps in a fallback when the source fails', () => {
    const { container } = render(<Image src="/missing.jpg" alt="Missing" />);
    fireEvent.error(screen.getByAltText('Missing'));
    expect(screen.queryByAltText('Missing')).toBeNull();
    const frame = container.firstElementChild as HTMLElement;
    expect(frame.getAttribute('data-status')).toBe('error');
  });

  it('renders a custom fallback on error', () => {
    render(<Image src="/missing.jpg" alt="Missing" fallback={<span>No cover</span>} />);
    fireEvent.error(screen.getByAltText('Missing'));
    expect(screen.getByText('No cover')).toBeInTheDocument();
  });

  it('applies the radius class', () => {
    const { container } = render(<Image src="/cover.jpg" alt="Cover" radius="lg" />);
    const frame = container.firstElementChild as HTMLElement;
    expect(frame.className).toMatch(/radius-lg/);
  });

  it('renders a placeholder and no img when skeleton', () => {
    render(<Image src="/cover.jpg" alt="Cover" skeleton />);
    expect(screen.queryByAltText('Cover')).toBeNull();
  });

  it('has no axe violations', async () => {
    render(
      <div>
        <Image src="/cover.jpg" alt="Dune cover" aspectRatio="2 / 3" />
        <Image src="/decorative.jpg" alt="" aspectRatio={1} />
      </div>,
    );
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
