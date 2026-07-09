import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Accordion, Heading } from '../src/index.ts';

describe('Accordion', () => {
  const items = [
    { id: 'one', title: 'Overview', content: <div>Details</div> },
    { id: 'two', title: 'Specs', content: <div>More details</div>, disabled: true },
  ];

  it('toggles panels open and closed', () => {
    render(<Accordion items={items} />);
    expect(screen.queryByText('Details')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Overview' }));
    expect(screen.getByText('Details')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Overview' }));
    expect(screen.queryByText('Details')).toBeNull();
  });

  it('opens the default item initially', () => {
    render(<Accordion items={items} defaultOpen="one" />);
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('supports allowMultiple to keep multiple panels open', () => {
    render(<Accordion items={items} allowMultiple defaultOpen="one" />);
    fireEvent.click(screen.getByRole('button', { name: 'Specs' }));
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.queryByText('More details')).not.toBeInTheDocument();
  });

  it('does not toggle a disabled item', () => {
    render(<Accordion items={items} />);
    fireEvent.click(screen.getByRole('button', { name: 'Specs' }));
    expect(screen.queryByText('More details')).toBeNull();
  });

  it('renders title content without added heading margin when using Heading inside', () => {
    render(
      <Accordion
        items={[
          {
            id: 'one',
            title: <Heading level={5} noMargin>Overview</Heading>,
            content: <div>Details</div>,
          },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { level: 5, name: 'Overview' })).toBeInTheDocument();
  });
});
