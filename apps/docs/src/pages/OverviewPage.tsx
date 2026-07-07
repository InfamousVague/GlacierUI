import { Button, Card } from '@perfect/react';

export function OverviewPage() {
  return (
    <>
      <h1>Perfect</h1>
      <p className="lede">
        A token-first React kit. Every margin, padding, and control height comes from one shared
        scale, so components always line up.
      </p>

      <h2>Principles</h2>
      <div className="stack">
        <Card>
          <strong>One spacing scale.</strong>
          <p>
            All spatial values come from <code>--perfect-space-*</code>, all control heights from{' '}
            <code>--perfect-control-height-*</code>. Elements that sit next to each other share
            the same tokens, so they stay aligned.
          </p>
        </Card>
        <Card>
          <strong>Semantic color, OKLCH underneath.</strong>
          <p>
            Components only consume aliases like <code>--perfect-surface</code> and{' '}
            <code>--perfect-accent-solid</code>. The 12-step OKLCH ramps underneath swap between
            light and dark, and components never need to know.
          </p>
        </Card>
        <Card>
          <strong>Motion comes from enums.</strong>
          <p>
            Micro-animations are picked from enums like <code>Motion.ScaleIn</code>,{' '}
            <code>Speed.Fast</code>, and <code>Ease.Spring</code>, backed by framer-motion and the
            same duration and easing tokens the CSS uses.
          </p>
        </Card>
      </div>

      <h2>Packages</h2>
      <ul>
        <li>
          <code>@perfect/tokens</code>: token source of truth in TypeScript, plus the generated{' '}
          <code>tokens.css</code>
        </li>
        <li>
          <code>@perfect/motion</code>: Motion, Speed, and Ease enums with framer-motion presets
        </li>
        <li>
          <code>@perfect/react</code>: components, styled with CSS Modules over semantic tokens
        </li>
        <li>
          <code>@perfect/icons</code>: reserved for the icon set
        </li>
      </ul>

      <h2>Try it</h2>
      <div className="row">
        <Button onClick={() => (window.location.hash = '#/button')}>Browse components</Button>
        <Button variant="outline" onClick={() => (window.location.hash = '#/colors')}>
          See the tokens
        </Button>
      </div>
    </>
  );
}
