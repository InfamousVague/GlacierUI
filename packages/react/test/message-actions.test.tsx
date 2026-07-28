import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
// Direct file paths: these components are not exported from @glacier/react yet.
import { MessageActions, type MessageActionItem } from '../src/molecules/MessageActions/MessageActions.tsx';
import { ContextMenu } from '../src/organisms/Menu/Menu.tsx';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const action = (id: string, label: string, onSelect?: () => void): MessageActionItem => ({
  id,
  label,
  icon: <svg aria-hidden="true" />,
  onSelect,
});

const three = [action('react', 'React'), action('reply', 'Reply'), action('thread', 'Reply in thread')];

describe('MessageActions — the cluster', () => {
  it('is one labelled toolbar, not a loose run of buttons', () => {
    render(<MessageActions actions={three} />);
    const bar = screen.getByRole('toolbar', { name: 'Message actions' });
    expect(bar).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('sorts the reserved actions into the shared order whatever order they arrive in', () => {
    render(<MessageActions actions={[action('thread', 'Reply in thread'), action('react', 'React'), action('reply', 'Reply')]} />);
    expect(screen.getAllByRole('button').map((b) => b.getAttribute('data-action'))).toEqual([
      'react',
      'reply',
      'thread',
    ]);
  });

  it('runs the action it is told to', () => {
    const onSelect = vi.fn();
    render(<MessageActions actions={[action('reply', 'Reply', onSelect)]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reply' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe('MessageActions — the keyboard', () => {
  it('costs one tab stop, and the arrows move within it', () => {
    render(<MessageActions actions={three} />);
    const bar = screen.getByRole('toolbar');
    const buttons = screen.getAllByRole('button');
    // one stop for the cluster: fifty messages would otherwise be 200 presses
    expect(buttons.map((b) => b.tabIndex)).toEqual([0, -1, -1]);

    fireEvent.keyDown(bar, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(buttons[1]);
    fireEvent.keyDown(bar, { key: 'End' });
    expect(document.activeElement).toBe(buttons[2]);
    fireEvent.keyDown(bar, { key: 'Home' });
    expect(document.activeElement).toBe(buttons[0]);
    // wraps rather than dead-ending
    fireEvent.keyDown(bar, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(buttons[2]);
  });

  it('lets Enter through so the focused action stays runnable', () => {
    render(<MessageActions actions={three} />);
    expect(fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'Enter' })).toBe(true);
  });

  it('IS REACHABLE WITHOUT A MOUSE: hidden at rest still means rendered, focusable, and announced', () => {
    render(<MessageActions actions={three} />);
    const bar = screen.getByRole('toolbar');
    // The failure this component exists to prevent: `display:none`,
    // `visibility:hidden`, or the `hidden` attribute would each take the cluster
    // out of the tab order AND out of the accessibility tree, so a hover-only
    // reply button would not exist for anyone without a pointer.
    expect(bar).toHaveAttribute('data-reveal', 'hover');
    expect(bar).not.toHaveAttribute('hidden');
    expect(bar).not.toHaveAttribute('aria-hidden');
    expect(bar.style.display).not.toBe('none');
    expect(bar.style.visibility).not.toBe('hidden');

    // ...and it is genuinely focusable, which is what reveals it (:focus-within)
    const first = screen.getAllByRole('button')[0] as HTMLElement;
    first.focus();
    expect(document.activeElement).toBe(first);
    expect(bar.contains(document.activeElement)).toBe(true);
  });

  it('lets a host drive the reveal from its own row hover or long press', () => {
    const { rerender } = render(<MessageActions actions={three} visible={false} />);
    expect(screen.getByRole('toolbar')).toHaveAttribute('data-visible', 'false');
    rerender(<MessageActions actions={three} visible />);
    expect(screen.getByRole('toolbar')).toHaveAttribute('data-visible', 'true');
  });

  it('can be told to stay out entirely', () => {
    render(<MessageActions actions={three} reveal="always" />);
    expect(screen.getByRole('toolbar')).toHaveAttribute('data-reveal', 'always');
  });
});

describe('MessageActions — the overflow', () => {
  const five = [...three, action('copy', 'Copy text'), action('delete', 'Delete')];

  it('grows no overflow control when everything fits', () => {
    render(<MessageActions actions={three} inlineCap={3} />);
    expect(screen.queryByRole('button', { name: 'More actions' })).toBeNull();
  });

  it('gives one inline slot back to the more control and folds the rest into a menu', () => {
    render(<MessageActions actions={five} inlineCap={3} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((b) => b.getAttribute('data-action'))).toEqual(['react', 'reply', 'more']);

    fireEvent.click(screen.getByRole('button', { name: 'More actions' }));
    // every action is still reachable, from a pointer and from the keyboard
    expect(screen.getByRole('menuitem', { name: 'Reply in thread' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Copy text' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
  });

  it('keeps the more control inside the one tab stop', () => {
    render(<MessageActions actions={five} inlineCap={3} />);
    expect(screen.getAllByRole('button').map((b) => b.tabIndex)).toEqual([0, -1, -1]);
  });
});

describe('MessageActions — the touch path', () => {
  it('renders the SAME actions as menu rows, so a long press cannot offer a different set', () => {
    const onSelect = vi.fn();
    render(
      <ContextMenu content={<MessageActions layout="menu" actions={[...three, action('copy', 'Copy text', onSelect)]} />}>
        <p>A message</p>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText('A message'));

    const rows = screen.getAllByRole('menuitem').map((r) => r.textContent);
    expect(rows).toEqual(['React', 'Reply', 'Reply in thread', 'Copy text']);

    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy text' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when it has nothing to offer', () => {
    const { container } = render(<MessageActions actions={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('MessageActions — a11y', () => {
  it('takes translated labels', () => {
    render(
      <MessageActions
        actions={[...three, action('copy', 'Copier')]}
        inlineCap={3}
        labels={{ toolbar: 'Actions du message', more: 'Plus d’actions' }}
      />,
    );
    expect(screen.getByRole('toolbar', { name: 'Actions du message' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Plus d’actions' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<MessageActions actions={[...three, action('copy', 'Copy text')]} inlineCap={3} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
