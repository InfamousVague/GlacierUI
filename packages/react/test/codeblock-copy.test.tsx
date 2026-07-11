import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CodeBlock } from '../src/index.ts';

type MutableNavigator = { clipboard?: { writeText: (text: string) => Promise<void> } };

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
}

describe('CodeBlock copy and rendering branches', () => {
  afterEach(() => {
    delete (navigator as MutableNavigator).clipboard;
    delete (document as { execCommand?: unknown }).execCommand;
    vi.restoreAllMocks();
  });

  it('copies through the async clipboard and flips the label to Copied', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    stubClipboard(writeText);
    render(<CodeBlock code="npm run gen" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent(/copied/i));
    expect(writeText).toHaveBeenCalledWith('npm run gen');
  });

  it('falls back to a hidden textarea when the clipboard API is missing', async () => {
    const execCommand = vi.fn(() => true);
    (document as { execCommand?: unknown }).execCommand = execCommand;
    render(<CodeBlock code="fallback text" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent(/copied/i));
    expect(execCommand).toHaveBeenCalledWith('copy');
    // the scratch textarea is removed again
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('falls back to the textarea path when the clipboard write rejects', async () => {
    stubClipboard(() => Promise.reject(new Error('denied')));
    const execCommand = vi.fn(() => true);
    (document as { execCommand?: unknown }).execCommand = execCommand;
    render(<CodeBlock code="rejected" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(execCommand).toHaveBeenCalledWith('copy'));
  });

  it('renders a line-number gutter with one span per line', () => {
    const { container } = render(<CodeBlock code={'one\ntwo\nthree'} lineNumbers showCopy={false} />);
    const lines = container.querySelectorAll('.line');
    expect(lines.length).toBe(3);
    expect(lines[0]!.textContent).toBe('one\n');
    expect(lines[2]!.textContent).toBe('three');
  });

  it('renders app-supplied highlighted markup instead of the plain fallback', () => {
    const { container } = render(
      <CodeBlock code="const x = 1;">
        <pre data-testid="highlighted">
          <code>const x = 1;</code>
        </pre>
      </CodeBlock>,
    );
    expect(screen.getByTestId('highlighted')).toBeInTheDocument();
    // the sample stays LTR even inside RTL pages
    expect(screen.getByTestId('highlighted').parentElement).toHaveAttribute('dir', 'ltr');
    expect(container.querySelector('pre[dir="ltr"] > code')).toBeNull();
  });

  it('drops the header entirely when there is nothing to put in it', () => {
    render(<CodeBlock code="quiet" showCopy={false} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByText('quiet')).toBeInTheDocument();
  });
});
