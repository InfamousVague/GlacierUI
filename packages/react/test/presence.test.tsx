import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
// Direct file paths: these components are not registered in the kit's index yet.
import { PresenceDot } from '../src/atoms/display/PresenceDot/PresenceDot.tsx';
import { AvatarGroup } from '../src/molecules/AvatarGroup/AvatarGroup.tsx';
import { ReadReceiptStack } from '../src/molecules/AvatarGroup/ReadReceiptStack.tsx';
import { MemberRow } from '../src/molecules/MemberRow/MemberRow.tsx';
import { List } from '../src/index.ts';
import {
  clampOverlap,
  fillTemplate,
  memberRoleTone,
  presenceDotSize,
  presenceLabel,
  presenceShape,
  presenceStatuses,
  splitStack,
  stackDepth,
  stackLabel,
  type PresenceStatus,
} from '@glacier/logic';
import { validateSpec, auditStrictness } from '../../spec/src/schema.ts';
import { presenceDotSpec } from '../../spec/src/components/presence-dot.ts';
import { avatarGroupSpec, readReceiptStackSpec } from '../../spec/src/components/avatar-group.ts';
import { memberRowSpec } from '../../spec/src/components/member-row.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

const ROSTER = [
  { name: 'Ada Lovelace' },
  { name: 'Grace Hopper' },
  { name: 'Katherine Johnson' },
  { name: 'Radia Perlman' },
  { name: 'Barbara Liskov' },
];

describe('presence commons', () => {
  it('gives every status its own shape, so presence is never colour-only', () => {
    const shapes = presenceStatuses.map(presenceShape);
    expect(new Set(shapes).size).toBe(presenceStatuses.length);
  });

  it('names every status', () => {
    for (const status of presenceStatuses) expect(presenceLabel(status).length).toBeGreaterThan(0);
    expect(presenceLabel('busy', { busy: 'Ne pas déranger' })).toBe('Ne pas déranger');
  });

  it('steps the dot with the avatar it is pinned to', () => {
    expect(presenceDotSize('sm')).toBe('sm');
    expect(presenceDotSize('md')).toBe('sm');
    expect(presenceDotSize('lg')).toBe('md');
    expect(presenceDotSize('xl')).toBe('md');
  });

  it('splits a roster under, at, and over the cap', () => {
    expect(splitStack(ROSTER.slice(0, 2), 4)).toEqual({ shown: ROSTER.slice(0, 2), overflow: 0 });
    // exactly at the cap shows every face and counts nothing
    expect(splitStack(ROSTER.slice(0, 4), 4)).toEqual({ shown: ROSTER.slice(0, 4), overflow: 0 });
    expect(splitStack(ROSTER, 4)).toEqual({ shown: ROSTER.slice(0, 4), overflow: 1 });
    // a nonsense cap still leaves something to anchor the count to
    expect(splitStack(ROSTER, 0).shown).toHaveLength(1);
  });

  it('paints the stack from whichever end the caller asked for', () => {
    expect(stackDepth(0, 3, 'first-on-top')).toBeGreaterThan(stackDepth(2, 3, 'first-on-top'));
    expect(stackDepth(0, 3, 'last-on-top')).toBeLessThan(stackDepth(2, 3, 'last-on-top'));
  });

  it('keeps the overlap inside the range where faces still read', () => {
    expect(clampOverlap(0.4)).toBe(0.4);
    expect(clampOverlap(9)).toBe(0.66);
    expect(clampOverlap(-1)).toBe(0);
    expect(clampOverlap(Number.NaN)).toBe(0.32);
  });

  it('builds one comma list rather than a hardcoded English conjunction', () => {
    expect(stackLabel(['Ada', 'Grace'], 0)).toBe('Ada, Grace');
    expect(stackLabel(['Ada', ''], 2)).toBe('Ada, 2 more');
    expect(fillTemplate('Read by {names}', { names: 'Ada' })).toBe('Read by Ada');
    // an unknown placeholder is left alone rather than blanked
    expect(fillTemplate('{a} {b}', { a: '1' })).toBe('1 {b}');
  });

  it('agrees on the tone a role takes, and rests neutral on anything else', () => {
    expect(memberRoleTone('Owner')).toBe('accent');
    expect(memberRoleTone(' moderator ')).toBe('info');
    expect(memberRoleTone('Guest')).toBe('warning');
    expect(memberRoleTone('Wizard')).toBe('neutral');
  });
});

describe('presence specs', () => {
  const specs = [presenceDotSpec, avatarGroupSpec, readReceiptStackSpec, memberRowSpec];

  it('are structurally valid', () => {
    for (const spec of specs) expect(validateSpec(spec)).toEqual([]);
  });

  it('bind every paint the strictness audit asks for', () => {
    for (const spec of specs) expect(auditStrictness(spec).missing).toEqual([]);
  });

  it('paints one tone per presence status', () => {
    expect((presenceDotSpec.tones ?? []).map((tone) => tone.name)).toEqual([...presenceStatuses]);
  });
});

describe('PresenceDot', () => {
  it('names the status by default, so the dot is never colour-only', () => {
    render(<PresenceDot status="busy" />);
    expect(screen.getByRole('img', { name: 'Do not disturb' })).toBeInTheDocument();
  });

  it('draws a different shape for every status', () => {
    const shapes = presenceStatuses.map((status: PresenceStatus) => {
      const { container, unmount } = render(<PresenceDot status={status} />);
      const dot = container.querySelector('[data-shape]') as HTMLElement;
      const shape = dot.dataset.shape;
      unmount();
      return shape;
    });
    expect(new Set(shapes).size).toBe(presenceStatuses.length);
  });

  it('takes a label override and a translated catalog', () => {
    const { rerender } = render(<PresenceDot status="online" label="Available" />);
    expect(screen.getByRole('img', { name: 'Available' })).toBeInTheDocument();
    rerender(<PresenceDot status="online" labels={{ online: 'En ligne' }} />);
    expect(screen.getByRole('img', { name: 'En ligne' })).toBeInTheDocument();
  });

  it('goes silent only when the caller says the row already speaks', () => {
    const { container } = render(<PresenceDot status="away" decorative />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('[aria-hidden="true"][data-status="away"]')).not.toBeNull();
  });

  it('wraps in a halo when pinned to an avatar', () => {
    const { container } = render(<PresenceDot status="online" ring />);
    const dot = container.querySelector('[data-status]') as HTMLElement;
    // the halo is a pad behind the dot, not an outline on it
    expect(dot.parentElement).not.toBe(container);
    expect(dot.parentElement?.style.padding).toContain('calc(');
  });

  it('renders a skeleton placeholder with no announcement', () => {
    const { container } = render(<PresenceDot status="online" skeleton />);
    expect(container.querySelector('[data-skeleton]')).not.toBeNull();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<PresenceDot status="away" />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('AvatarGroup', () => {
  it('shows every face when the roster is under the cap', () => {
    const { container } = render(<AvatarGroup avatars={ROSTER.slice(0, 2)} />);
    expect(container.querySelectorAll('[data-stack-slot]')).toHaveLength(2);
    expect(container.querySelector('[data-stack-slot="overflow"]')).toBeNull();
  });

  it('shows every face at exactly the cap, and counts nothing', () => {
    const { container } = render(<AvatarGroup avatars={ROSTER.slice(0, 4)} max={4} />);
    expect(container.querySelectorAll('[data-stack-slot]')).toHaveLength(4);
    expect(container.querySelector('[data-stack-slot="overflow"]')).toBeNull();
  });

  it('caps the faces and counts the rest', () => {
    const { container } = render(<AvatarGroup avatars={ROSTER} max={3} />);
    expect(container.querySelectorAll('[data-stack-slot]')).toHaveLength(4);
    expect(container.querySelector('[data-stack-slot="overflow"]')?.textContent).toBe('+2');
  });

  it('names the group after the people it shows and the count it does not', () => {
    render(<AvatarGroup avatars={ROSTER} max={2} />);
    expect(
      screen.getByRole('group', { name: 'Ada Lovelace, Grace Hopper, 3 more' }),
    ).toBeInTheDocument();
  });

  it('takes a translated count template and a label override', () => {
    const { rerender } = render(<AvatarGroup avatars={ROSTER} max={2} labels={{ more: '+{n} autres' }} />);
    expect(screen.getByRole('group', { name: 'Ada Lovelace, Grace Hopper, +3 autres' })).toBeInTheDocument();
    rerender(<AvatarGroup avatars={ROSTER} label="Project team" />);
    expect(screen.getByRole('group', { name: 'Project team' })).toBeInTheDocument();
  });

  it('pulls each avatar back by a fraction of the diameter, never the first', () => {
    const { container } = render(<AvatarGroup avatars={ROSTER.slice(0, 3)} overlap={0.4} />);
    const slots = [...container.querySelectorAll<HTMLElement>('[data-stack-slot]')];
    expect(slots[0]?.style.marginInlineStart).toBe('');
    // the pull is derived from the avatar spec's own diameter token
    expect(slots[1]?.style.marginInlineStart).toBe('calc(var(--glacier-size-2xl) * -0.4)');
  });

  it('paints from whichever end the caller asked for', () => {
    const depth = (direction: 'first-on-top' | 'last-on-top') => {
      const { container, unmount } = render(<AvatarGroup avatars={ROSTER.slice(0, 3)} direction={direction} />);
      const slots = [...container.querySelectorAll<HTMLElement>('[data-stack-slot]')];
      const order = slots.map((slot) => Number(slot.style.zIndex));
      unmount();
      return order;
    };
    expect(depth('first-on-top')).toEqual([3, 2, 1]);
    expect(depth('last-on-top')).toEqual([1, 2, 3]);
  });

  it('loads as placeholders holding the exact stack geometry', () => {
    const { container } = render(<AvatarGroup avatars={ROSTER} max={3} skeleton />);
    expect(container.querySelectorAll('[data-stack-slot]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-skeleton]').length).toBe(4);
    // a placeholder is not a roster yet
    expect(screen.queryByRole('group')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<AvatarGroup avatars={ROSTER} max={3} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('ReadReceiptStack', () => {
  it('is the stack at its read-receipt preset, not a second stack', () => {
    const { container } = render(<ReadReceiptStack readers={ROSTER} />);
    // three faces plus the count, the preset's cap
    expect(container.querySelectorAll('[data-stack-slot]')).toHaveLength(4);
    expect(container.querySelector('[data-stack-slot="overflow"]')?.textContent).toBe('+2');
    // the smallest avatar step
    const slots = [...container.querySelectorAll<HTMLElement>('[data-stack-slot]')];
    expect(slots[1]?.style.marginInlineStart).toBe('calc(var(--glacier-size-xl) * -0.46)');
  });

  it('says what the row means, since a bare stack under a bubble is ambiguous', () => {
    render(<ReadReceiptStack readers={ROSTER.slice(0, 2)} />);
    expect(screen.getByRole('group', { name: 'Read by Ada Lovelace, Grace Hopper' })).toBeInTheDocument();
  });

  it('takes translated templates', () => {
    render(<ReadReceiptStack readers={ROSTER} labels={{ readBy: 'Lu par {names}', more: '{n} de plus' }} />);
    expect(
      screen.getByRole('group', { name: 'Lu par Ada Lovelace, Grace Hopper, Katherine Johnson, 2 de plus' }),
    ).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<ReadReceiptStack readers={ROSTER} />);
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});

describe('MemberRow', () => {
  const row = (extra: Record<string, unknown> = {}) =>
    render(
      <List aria-label="Members">
        <MemberRow name="Ada Lovelace" secondary="@ada" status="busy" {...extra} />
      </List>,
    );

  it('renders the person, their second line, and their presence', () => {
    const { container } = row();
    expect(screen.getByText('@ada')).toBeInTheDocument();
    expect(container.querySelector('[data-status="busy"]')).not.toBeNull();
  });

  it('puts the presence in the row’s accessible name, not only in its colour', () => {
    row({ onClick: () => undefined });
    expect(screen.getByRole('button', { name: /^Ada Lovelace, Do not disturb/ })).toBeInTheDocument();
  });

  it('keeps the dot itself silent, because a leading slot is hidden from assistive tech', () => {
    const { container } = row();
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.querySelector('[data-status="busy"]')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws no dot at all when the presence is unknown', () => {
    const { container } = render(
      <List>
        <MemberRow name="Ada Lovelace" />
      </List>,
    );
    expect(container.querySelector('[data-status]')).toBeNull();
  });

  it('renders the role as a pill whose tone comes from the shared table', () => {
    row({ role: 'Owner' });
    expect(screen.getByText('Owner')).toBeInTheDocument();
  });

  it('takes a trailing actions slot', () => {
    const onClick = vi.fn();
    render(
      <List>
        <MemberRow name="Ada Lovelace" role="Guest" actions={<button onClick={onClick}>Remove</button>} />
      </List>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('activates as a row when given a handler', () => {
    const onClick = vi.fn();
    row({ onClick });
    fireEvent.click(screen.getByRole('button', { name: /^Ada Lovelace, Do not disturb/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('takes translated presence names', () => {
    row({ onClick: () => undefined, labels: { busy: 'Ne pas déranger' } });
    expect(screen.getByRole('button', { name: /^Ada Lovelace, Ne pas déranger/ })).toBeInTheDocument();
  });

  it('loads as a placeholder holding the row’s layout', () => {
    const { container } = row({ skeleton: true });
    expect(container.querySelectorAll('[data-skeleton]').length).toBeGreaterThan(1);
    expect(container.querySelector('[data-status]')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <List aria-label="Members">
        <MemberRow name="Ada Lovelace" secondary="@ada" status="online" role="Owner" onClick={() => undefined} />
        <MemberRow name="Grace Hopper" status="away" href="#grace" />
      </List>,
    );
    expect((await axe.run(container, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
