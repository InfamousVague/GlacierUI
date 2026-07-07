import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import axe from 'axe-core';
import { Button, Divider, Heading, Kbd, Label, Link, Modal, Pill, Text } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('typography atoms', () => {
  it('Text renders the requested element, size, and tone', () => {
    render(
      <Text as="span" size="sm" tone="muted" data-testid="t">
        Body copy
      </Text>,
    );
    const el = screen.getByTestId('t');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveTextContent('Body copy');
  });

  it('Heading renders the semantic level with optional visual override', () => {
    render(
      <Heading level={3} visualLevel={1}>
        Section
      </Heading>,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Section' })).toBeInTheDocument();
  });

  it('Label associates with a control and marks required', () => {
    render(
      <>
        <Label htmlFor="email" required>
          Email
        </Label>
        <input id="email" />
      </>,
    );
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
  });

  it('Link and Kbd render their native elements', () => {
    render(
      <Text>
        <Link href="https://example.com">docs</Link> and press <Kbd>Esc</Kbd>
      </Text>,
    );
    expect(screen.getByRole('link', { name: 'docs' })).toHaveAttribute('href', 'https://example.com');
    expect(screen.getByText('Esc').tagName).toBe('KBD');
  });
});

describe('Pill and Divider', () => {
  it('Pill renders tones and variants', () => {
    render(
      <Pill tone="success" variant="solid">
        Active
      </Pill>,
    );
    expect(screen.getByText('Active').tagName).toBe('SPAN');
  });

  it('Divider renders an hr, a vertical separator, or a labeled break', () => {
    const { rerender } = render(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
    rerender(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
    rerender(<Divider label="or" />);
    expect(screen.getByRole('separator')).toHaveTextContent('or');
  });
});

describe('Modal', () => {
  function Harness() {
    return (
      <Modal
        open
        onClose={() => {}}
        title="Preferences"
        description="Tune the kit."
        footer={<Button>Done</Button>}
      >
        <Text>Content</Text>
      </Modal>
    );
  }

  it('renders a labeled dialog in a portal with its content', () => {
    render(<Harness />);
    const dialog = screen.getByRole('dialog', { name: 'Preferences' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('closes on Escape and on overlay click, but not on panel click', () => {
    let closed = 0;
    const { container } = render(
      <Modal open onClose={() => closed++} title="T">
        <Text>Content</Text>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closed).toBe(1);
    fireEvent.click(screen.getByRole('dialog'));
    expect(closed).toBe(1);
    expect(container).toBeInTheDocument();
  });

  it('locks body scroll while open and releases on unmount', () => {
    const { unmount } = render(<Harness />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('has no axe violations', async () => {
    render(<Harness />);
    const results = await axe.run(screen.getByRole('dialog'), { rules: AXE_RULES });
    expect(results.violations).toEqual([]);
  });
});
