import { describe, expect, it } from 'vitest';
import { Tone } from '@glacier/react';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Callout } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

describe('Callout', () => {
  it('renders the title and body', () => {
    render(<Callout title="Heads up">Save your work before continuing.</Callout>);
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByText('Save your work before continuing.')).toBeInTheDocument();
  });

  it('exposes role alert for the danger tone', () => {
    render(
      <Callout tone={Tone.Danger} title="Stop">
        This action cannot be undone.
      </Callout>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('exposes role note for the note tone', () => {
    render(<Callout tone={Tone.Note}>A neutral aside.</Callout>);
    expect(screen.getByRole('note')).toBeInTheDocument();
  });

  it('renders a skeleton placeholder', () => {
    const { container } = render(<Callout skeleton />);
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Callout tone={Tone.Info} title="Note">
        A helpful note.
      </Callout>,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
