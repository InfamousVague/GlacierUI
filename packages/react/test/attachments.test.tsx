import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import axe from 'axe-core';
import type { ChatAttachment } from '@glacier/logic';
// TODO(integration): switch to '@glacier/react' once these are exported.
import { ImageAttachment } from '../src/molecules/Attachments/ImageAttachment.tsx';
import { ImageGrid } from '../src/molecules/Attachments/ImageGrid.tsx';
import { VideoAttachment } from '../src/molecules/Attachments/VideoAttachment.tsx';
import { FileAttachment } from '../src/molecules/Attachments/FileAttachment.tsx';
import { VoiceNote } from '../src/molecules/Attachments/VoiceNote.tsx';
import { LinkPreviewCard } from '../src/molecules/Attachments/LinkPreviewCard.tsx';

const photo = (over: Partial<ChatAttachment> = {}): ChatAttachment => ({
  id: 'a1',
  url: 'https://cdn.test/photo.jpg',
  mimeType: 'image/jpeg',
  fileName: 'IMG_0042.jpg',
  width: 1600,
  height: 1200,
  ...over,
});

const album = (count: number): ChatAttachment[] =>
  Array.from({ length: count }, (_, i) => photo({ id: `a${i}`, fileName: `photo-${i}.jpg` }));

describe('ImageAttachment', () => {
  it('reserves the box from the intrinsic size before the image loads', () => {
    const { container } = render(<ImageAttachment attachment={photo()} />);
    const frame = container.firstElementChild as HTMLElement;
    // 4:3, and present on the empty frame — this is what stops the arriving
    // photo from shoving the transcript down
    expect(frame.style.aspectRatio).toBe(String(4 / 3));
  });

  it('clamps a very tall photo and says so', () => {
    const { container } = render(<ImageAttachment attachment={photo({ width: 1080, height: 1920 })} />);
    const frame = container.firstElementChild as HTMLElement;
    expect(Number(frame.style.aspectRatio)).toBeCloseTo(2 / 3);
    expect(frame.dataset.clamped).toBe('true');
  });

  it('announces the sender\'s alt text, then the file name, then the kind', () => {
    const { rerender } = render(<ImageAttachment attachment={photo()} alt="Ana on the ferry" />);
    expect(screen.getByAltText('Ana on the ferry')).toBeTruthy();

    rerender(<ImageAttachment attachment={photo()} />);
    expect(screen.getByAltText('IMG_0042.jpg')).toBeTruthy();

    // an attachment IS the message, so it can never announce nothing
    rerender(<ImageAttachment attachment={photo({ fileName: undefined })} />);
    expect(screen.getByAltText('Photo')).toBeTruthy();
  });

  it('becomes one labelled button when it can be opened, and does not announce twice', () => {
    const onOpen = vi.fn();
    render(<ImageAttachment attachment={photo()} alt="Ana on the ferry" onOpen={onOpen} />);
    const button = screen.getByRole('button', { name: 'Open Ana on the ferry' });
    fireEvent.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
    // the button carries the name, so the image inside is decorative
    expect(within(button).getByRole('presentation', { hidden: true })).toBeTruthy();
  });

  it('shows a placeholder instead of the shimmer while it loads', () => {
    const { container } = render(
      <ImageAttachment attachment={photo()} loading placeholder={<span data-testid="blur" />} />,
    );
    expect(screen.getByTestId('blur')).toBeTruthy();
    // the placeholder layer is decoration; it must not be read out
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('drops its own ratio in fill mode, since the tile owns the box', () => {
    const { container } = render(<ImageAttachment fill attachment={photo()} />);
    expect((container.firstElementChild as HTMLElement).style.aspectRatio).toBe('');
  });
});

describe('ImageGrid', () => {
  it('names the album so it is not read as loose images', () => {
    render(<ImageGrid images={album(4)} />);
    expect(screen.getByRole('group', { name: '4 photos' })).toBeTruthy();
  });

  it('tiles two, three, and four the way the shared layout says', () => {
    for (const [count, rows] of [[2, 1], [3, 2], [4, 2]] as const) {
      const { container, unmount } = render(<ImageGrid images={album(count)} />);
      expect(container.querySelectorAll('img')).toHaveLength(count);
      const grid = container.firstElementChild as HTMLElement;
      expect(grid.children).toHaveLength(rows);
      unmount();
    }
  });

  it('collapses a large album onto the last tile and announces the count', () => {
    render(<ImageGrid images={album(9)} onOpen={() => undefined} />);
    // four tiles, the last one standing in for the other five
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Open 5 more photos' })).toBeTruthy();
    expect(screen.getByText('+5')).toBeTruthy();
  });

  it('hands back the attachment and its index', () => {
    const onOpen = vi.fn();
    const images = album(3);
    render(<ImageGrid images={images} onOpen={onOpen} />);
    fireEvent.click(screen.getAllByRole('button')[1] as HTMLElement);
    expect(onOpen).toHaveBeenCalledWith(images[1], 1);
  });

  it('renders nothing for an empty album rather than an empty box', () => {
    const { container } = render(<ImageGrid images={[]} />);
    expect(container.firstElementChild).toBeNull();
  });
});

describe('VideoAttachment', () => {
  const clip = photo({ mimeType: 'video/mp4', fileName: 'clip.mp4', durationMs: 84_000 });

  it('is one button naming what will play and how long it runs', () => {
    render(<VideoAttachment attachment={clip} poster="https://cdn.test/p.jpg" />);
    expect(screen.getByRole('button', { name: 'Play clip.mp4, 1:24' })).toBeTruthy();
  });

  it('shows the running time and keeps it out of the accessibility tree', () => {
    render(<VideoAttachment attachment={clip} />);
    const badge = screen.getByText('1:24');
    // the button's name already carries it; announcing it twice is noise
    expect(badge.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('calls onPlay, and leaves playback to the app', () => {
    const onPlay = vi.fn();
    render(<VideoAttachment attachment={clip} onPlay={onPlay} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it('fills a missing poster with a slate rather than a hole', () => {
    const { container } = render(<VideoAttachment attachment={clip} />);
    expect(container.querySelector('img')).toBeNull();
    // the box is still reserved at the video's own ratio
    expect((container.firstElementChild as HTMLElement).style.aspectRatio).toBe(String(4 / 3));
  });
});

describe('FileAttachment', () => {
  const doc = (over: Partial<ChatAttachment> = {}): ChatAttachment => ({
    id: 'f1',
    fileName: 'Q3-final-revised-budget-v7.pdf',
    mimeType: 'application/pdf',
    byteSize: 1_200_000,
    ...over,
  });

  it('truncates in the middle, so the extension survives', () => {
    render(<FileAttachment attachment={doc()} />);
    // the two runs together are the whole name, and the pinned tail holds the
    // extension — an end-truncated name would have lost it
    const name = screen.getByTitle('Q3-final-revised-budget-v7.pdf');
    expect(name.textContent).toBe('Q3-final-revised-budget-v7.pdf');
    expect((name.lastElementChild as HTMLElement).textContent).toContain('.pdf');
  });

  it('spells the size the way a file listing does', () => {
    render(<FileAttachment attachment={doc()} />);
    expect(screen.getByText('1.2 MB')).toBeTruthy();
  });

  it('names the file in its download action', () => {
    const onDownload = vi.fn();
    render(<FileAttachment attachment={doc()} onDownload={onDownload} />);
    const button = screen.getByRole('button', { name: 'Download Q3-final-revised-budget-v7.pdf' });
    fireEvent.click(button);
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('renders a real link when given an href, so Save As survives', () => {
    render(<FileAttachment attachment={doc()} href="https://cdn.test/q3.pdf" />);
    const link = screen.getByRole('link', { name: /Download/ });
    expect(link).toHaveAttribute('download', 'Q3-final-revised-budget-v7.pdf');
  });

  it('reports a running transfer through the bar, and its percentage once', () => {
    render(<FileAttachment attachment={doc()} progress={0.435} onCancel={() => undefined} />);
    const bar = screen.getByRole('progressbar', { name: /Download/ });
    expect(bar).toHaveAttribute('aria-valuenow', '44');
    // the visible readout repeats the bar, so it is decoration
    expect(screen.getByText('44%').closest('[aria-hidden="true"]')).not.toBeNull();
    // and the size line has given up its row rather than adding one
    expect(screen.queryByText('1.2 MB')).toBeNull();
  });

  it('swaps download for cancel while a transfer is running', () => {
    const onCancel = vi.fn();
    render(<FileAttachment attachment={doc()} progress={0.2} onDownload={() => undefined} onCancel={onCancel} />);
    expect(screen.queryByRole('button', { name: /Download/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Cancel/ }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('sweeps rather than filling when the total is unknown', () => {
    render(<FileAttachment attachment={doc()} indeterminate />);
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('names a file with no name at all', () => {
    render(<FileAttachment attachment={{ id: 'f2' }} onDownload={() => undefined} />);
    expect(screen.getByRole('button', { name: 'Download File' })).toBeTruthy();
  });
});

describe('VoiceNote', () => {
  it('groups the two controls as one voice message', () => {
    render(<VoiceNote duration={84} />);
    expect(screen.getByRole('group', { name: 'Voice message' })).toBeTruthy();
  });

  it('reuses the SeekBar, which is what speaks the position', () => {
    render(<VoiceNote duration={84} value={20} />);
    const bar = screen.getByRole('slider', { name: 'Seek' });
    expect(bar).toHaveAttribute('aria-valuemax', '84');
    expect(bar).toHaveAttribute('aria-valuetext', '0:20');
  });

  it('shows the length at rest and the position once it is running', () => {
    const { rerender } = render(<VoiceNote duration={84} />);
    expect(screen.getByText('1:24')).toBeTruthy();
    rerender(<VoiceNote duration={84} value={20} playing />);
    expect(screen.getByText('0:20')).toBeTruthy();
  });

  it('keeps the readout out of the accessibility tree', () => {
    render(<VoiceNote duration={84} />);
    expect(screen.getByText('1:24').closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('toggles play through one button whose label changes', () => {
    const onPlayingChange = vi.fn();
    render(<VoiceNote duration={84} onPlayingChange={onPlayingChange} />);
    const button = screen.getByRole('button', { name: 'Play' });
    fireEvent.click(button);
    expect(onPlayingChange).toHaveBeenCalledWith(true);
    // the same button, now labelled Pause — focus survives the toggle
    expect(screen.getByRole('button', { name: 'Pause' })).toBe(button);
  });

  it('blocks the control and the bar while disabled', () => {
    render(<VoiceNote duration={84} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('slider')).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('LinkPreviewCard', () => {
  it('is one link named by its title and its publisher', () => {
    render(
      <LinkPreviewCard
        url="https://www.example.com/posts/1"
        title="A very good post"
        description="About things."
        image="https://cdn.test/og.png"
      />,
    );
    const link = screen.getByRole('link', { name: 'A very good post, example.com' });
    expect(link).toHaveAttribute('href', 'https://www.example.com/posts/1');
    // one destination, one tab stop
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('drops to the compact layout with no image, rather than leaving a hole', () => {
    const { container } = render(<LinkPreviewCard url="https://example.com/x" title="No picture" />);
    expect(container.querySelector('img')).toBeNull();
    expect((container.firstElementChild as HTMLElement).dataset.layout).toBe('compact');
    // the domain is never dropped: it is the reader's check on the title
    expect(screen.getByText('example.com')).toBeTruthy();
  });

  it('leaves the og image decorative, since the title already names the page', () => {
    render(<LinkPreviewCard url="https://example.com" title="Named" image="https://cdn.test/og.png" />);
    expect(screen.getByRole('presentation', { hidden: true })).toBeTruthy();
  });

  it('falls back to naming the card a link when there is no title', () => {
    render(<LinkPreviewCard url="https://example.com/x" />);
    expect(screen.getByRole('link', { name: 'Link, example.com' })).toBeTruthy();
  });
});

describe('accessibility', () => {
  it('has no axe violations across the whole set', async () => {
    const { container } = render(
      <div>
        <ImageAttachment attachment={photo()} alt="Ana on the ferry" onOpen={() => undefined} />
        <ImageGrid images={album(5)} onOpen={() => undefined} />
        <VideoAttachment
          attachment={photo({ fileName: 'clip.mp4', durationMs: 84_000 })}
          poster="https://cdn.test/p.jpg"
          onPlay={() => undefined}
        />
        <FileAttachment
          attachment={{ id: 'f1', fileName: 'report.pdf', mimeType: 'application/pdf', byteSize: 1200 }}
          onDownload={() => undefined}
        />
        <VoiceNote duration={84} />
        <LinkPreviewCard url="https://example.com/x" title="A post" description="About." image="https://cdn.test/og.png" />
      </div>,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
