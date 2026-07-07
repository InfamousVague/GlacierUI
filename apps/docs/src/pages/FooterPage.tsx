import { Footer, FooterColumn, Link, Row, Text } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function FooterPage() {
  return (
    <>
      <h1>Footer</h1>
      <p className="lede">
        A page footer: a responsive grid of link columns over an optional bottom bar. The columns
        auto-fit, so the footer reflows to the width available without any breakpoints.
      </p>

      <h2>Examples</h2>

      <Example
        title="Columns and a bottom bar"
        description={
          <>
            Group related links into a <code>FooterColumn</code> with a title, then use the{' '}
            <code>bottom</code> slot for a copyright line and a short row of legal links. Everything
            below sits over a <code>Divider</code>.
          </>
        }
        code={`import { Footer, FooterColumn, Link, Row, Text } from '@perfect/react';

<Footer
  bottom={
    <>
      <Text size="sm" tone="muted">© 2026 Perfect, Inc.</Text>
      <Row gap={4} wrap>
        <Link href="#">Privacy</Link>
        <Link href="#">Terms</Link>
        <Link href="#">Cookies</Link>
      </Row>
    </>
  }
>
  <FooterColumn title="Product">
    <Link href="#">Overview</Link>
    <Link href="#">Components</Link>
    <Link href="#">Tokens</Link>
    <Link href="#">Changelog</Link>
  </FooterColumn>
  <FooterColumn title="Resources">
    <Link href="#">Documentation</Link>
    <Link href="#">Guides</Link>
    <Link href="#">Examples</Link>
  </FooterColumn>
  <FooterColumn title="Company">
    <Link href="#">About</Link>
    <Link href="#">Careers</Link>
    <Link href="#">Contact</Link>
  </FooterColumn>
  <FooterColumn title="Social">
    <Link href="#">GitHub</Link>
    <Link href="#">Mastodon</Link>
    <Link href="#">RSS</Link>
  </FooterColumn>
</Footer>`}
      >
        <div style={{ width: '100%' }}>
          <Footer
            bottom={
              <>
                <Text size="sm" tone="muted">
                  © 2026 Perfect, Inc.
                </Text>
                <Row gap={4} wrap>
                  <Link href="#">Privacy</Link>
                  <Link href="#">Terms</Link>
                  <Link href="#">Cookies</Link>
                </Row>
              </>
            }
          >
            <FooterColumn title="Product">
              <Link href="#">Overview</Link>
              <Link href="#">Components</Link>
              <Link href="#">Tokens</Link>
              <Link href="#">Changelog</Link>
            </FooterColumn>
            <FooterColumn title="Resources">
              <Link href="#">Documentation</Link>
              <Link href="#">Guides</Link>
              <Link href="#">Examples</Link>
            </FooterColumn>
            <FooterColumn title="Company">
              <Link href="#">About</Link>
              <Link href="#">Careers</Link>
              <Link href="#">Contact</Link>
            </FooterColumn>
            <FooterColumn title="Social">
              <Link href="#">GitHub</Link>
              <Link href="#">Mastodon</Link>
              <Link href="#">RSS</Link>
            </FooterColumn>
          </Footer>
        </div>
      </Example>

      <Example
        title="Three columns"
        description="Pass as many columns as you like. The auto-fit grid packs them into as many tracks as fit, so three columns read as one balanced band on a wide screen and stack on a narrow one."
        code={`<Footer>
  <FooterColumn title="Learn">
    <Link href="#">Getting started</Link>
    <Link href="#">Layout primitives</Link>
    <Link href="#">Theming</Link>
  </FooterColumn>
  <FooterColumn title="Reference">
    <Link href="#">Components</Link>
    <Link href="#">Tokens</Link>
  </FooterColumn>
  <FooterColumn title="Community">
    <Link href="#">Discussions</Link>
    <Link href="#">Issues</Link>
  </FooterColumn>
</Footer>`}
      >
        <div style={{ width: '100%' }}>
          <Footer>
            <FooterColumn title="Learn">
              <Link href="#">Getting started</Link>
              <Link href="#">Layout primitives</Link>
              <Link href="#">Theming</Link>
            </FooterColumn>
            <FooterColumn title="Reference">
              <Link href="#">Components</Link>
              <Link href="#">Tokens</Link>
            </FooterColumn>
            <FooterColumn title="Community">
              <Link href="#">Discussions</Link>
              <Link href="#">Issues</Link>
            </FooterColumn>
          </Footer>
        </div>
      </Example>

      <Example
        title="Bottom bar only"
        description={
          <>
            Omit the columns and pass only the <code>bottom</code> slot for a minimal footer: a
            single line with a copyright and a few links, over one hairline.
          </>
        }
        code={`<Footer
  bottom={
    <>
      <Text size="sm" tone="muted">© 2026 Perfect, Inc.</Text>
      <Row gap={4} wrap>
        <Link href="#">Privacy</Link>
        <Link href="#">Terms</Link>
        <Link href="#">Status</Link>
      </Row>
    </>
  }
/>`}
      >
        <div style={{ width: '100%' }}>
          <Footer
            bottom={
              <>
                <Text size="sm" tone="muted">
                  © 2026 Perfect, Inc.
                </Text>
                <Row gap={4} wrap>
                  <Link href="#">Privacy</Link>
                  <Link href="#">Terms</Link>
                  <Link href="#">Status</Link>
                </Row>
              </>
            }
          />
        </div>
      </Example>

      <h2>Props</h2>

      <h3>Footer</h3>
      <PropsTable
        props={[
          {
            name: 'bottom',
            type: 'ReactNode',
            description:
              'Bottom bar content, such as a copyright line and social links. Renders in a wrapping Row over a Divider.',
          },
          {
            name: 'children',
            type: 'ReactNode',
            description:
              'The link columns, typically FooterColumn elements. They lay out in an auto-fit grid.',
          },
          {
            name: 'className',
            type: 'string',
            description: 'Applied to the footer element.',
          },
        ]}
      />

      <h3>FooterColumn</h3>
      <PropsTable
        props={[
          {
            name: 'title',
            type: 'ReactNode',
            description: 'Column heading shown above the links as small semibold text.',
          },
          {
            name: 'children',
            type: 'ReactNode',
            description: 'The column contents, typically Link elements stacked vertically.',
          },
          {
            name: 'className',
            type: 'string',
            description: 'Applied to the column element.',
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          <code>Footer</code> renders a native <code>footer</code> element, which carries the
          contentinfo landmark when it is a direct child of the page body.
        </li>
        <li>
          Each column title is plain text, not a heading, so it does not add entries to the document
          outline. Give the region a heading yourself if the outline needs one.
        </li>
        <li>
          The links are real <code>Link</code> anchors, so they are focusable and keyboard operable
          with no extra work.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>
          The columns auto-fit and reflow on their own. There are no breakpoints to set: give it
          three or six columns and the grid packs as many per row as fit the width.
        </li>
        <li>
          Keep each column to one clear theme, such as Product or Company, and lead with the title
          so scanning is fast.
        </li>
        <li>
          Use the <code>bottom</code> slot for the copyright line and legal or social links. It
          wraps on narrow screens, so a long row of links stays readable.
        </li>
        <li>
          For a compact page, pass only <code>bottom</code> and skip the columns to get a single
          bar.
        </li>
      </ul>
    </>
  );
}
