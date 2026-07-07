import { Avatar, Row } from '@perfect/react';
import { Example, PropsTable } from '../docs-ui.tsx';

export function AvatarPage() {
  return (
    <>
      <h1>Avatar</h1>
      <p className="lede">
        A compact representation of a person or entity. Shows an image when one is available and
        falls back to initials, so a row of people never collapses into empty squares.
      </p>

      <h2>Examples</h2>

      <Example
        title="Image and initials"
        description={
          <>
            Pass <code>src</code> for a photo. Without one, Avatar derives initials from{' '}
            <code>name</code>, using up to two words on a tinted disc. If the image fails to load it
            falls back to those same initials automatically.
          </>
        }
        code={`import { Avatar } from '@perfect/react';

<Avatar src="/ada.jpg" name="Ada Lovelace" />
<Avatar name="Ada Lovelace" />
<Avatar name="Grace Hopper" />`}
      >
        <Row gap={4} wrap>
          <Avatar name="Ada Lovelace" />
          <Avatar name="Grace Hopper" />
          <Avatar name="Katherine Johnson" />
        </Row>
      </Example>

      <Example
        title="Sizes"
        description={
          <>
            Four sizes from <code>sm</code> to <code>xl</code>. <code>md</code> is the default and
            suits inline lists; use <code>sm</code> in dense rows and <code>lg</code> or{' '}
            <code>xl</code> for profile headers.
          </>
        }
        code={`<Avatar size="sm" name="Ada Lovelace" />
<Avatar size="md" name="Ada Lovelace" />
<Avatar size="lg" name="Ada Lovelace" />
<Avatar size="xl" name="Ada Lovelace" />`}
      >
        <Row gap={4} wrap>
          <Avatar size="sm" name="Ada Lovelace" />
          <Avatar size="md" name="Ada Lovelace" />
          <Avatar size="lg" name="Ada Lovelace" />
          <Avatar size="xl" name="Ada Lovelace" />
        </Row>
      </Example>

      <Example
        title="Shape"
        description={
          <>
            <code>circle</code> is the default. Use <code>rounded</code> for entities like teams,
            projects, or organizations, where a soft square reads less like a person.
          </>
        }
        code={`<Avatar shape="circle" name="Ada Lovelace" />
<Avatar shape="rounded" name="Perfect Team" />`}
      >
        <Row gap={4} wrap>
          <Avatar shape="circle" name="Ada Lovelace" />
          <Avatar shape="rounded" name="Perfect Team" />
        </Row>
      </Example>

      <Example
        title="Placeholder"
        description={
          <>
            With neither <code>src</code> nor <code>name</code>, Avatar renders a neutral disc. It is
            marked decorative, so screen readers skip it rather than announcing an empty image.
          </>
        }
        code={`<Avatar />
<Avatar shape="rounded" />`}
      >
        <Row gap={4} wrap>
          <Avatar />
          <Avatar shape="rounded" />
        </Row>
      </Example>

      <Example
        title="Skeleton"
        description={
          <>
            <code>skeleton</code> renders a shimmer placeholder with the avatar's exact diameter and
            shape, sized per <code>size</code>, so a loading list holds its layout.
          </>
        }
        code={`<Avatar skeleton size="sm" />
<Avatar skeleton />
<Avatar skeleton size="lg" />
<Avatar skeleton shape="rounded" size="lg" />`}
      >
        <Row gap={4} wrap>
          <Avatar skeleton size="sm" />
          <Avatar skeleton />
          <Avatar skeleton size="lg" />
          <Avatar skeleton shape="rounded" size="lg" />
        </Row>
      </Example>

      <h2>Props</h2>
      <PropsTable
        props={[
          {
            name: 'src',
            type: 'string',
            description: 'Image URL. Falls back to initials if absent or if it fails to load.',
          },
          {
            name: 'alt',
            type: 'string',
            description: 'Alternative text for the image. Defaults to name, then an empty string.',
          },
          {
            name: 'name',
            type: 'string',
            description: 'Full name used to derive initials and label the fallback.',
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg' | 'xl'",
            default: "'md'",
            description: 'Diameter of the avatar.',
          },
          {
            name: 'shape',
            type: "'circle' | 'rounded'",
            default: "'circle'",
            description: 'Full circle or a soft square. All other native span props are forwarded.',
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: "Renders a placeholder with the component's exact geometry.",
          },
        ]}
      />

      <h2>Accessibility</h2>
      <ul>
        <li>
          When an image renders, it carries <code>alt</code> text, falling back to{' '}
          <code>name</code> and then an empty string, so a decorative avatar next to a visible name
          is not announced twice.
        </li>
        <li>
          The initials fallback is labeled with <code>name</code> so it reads as the person rather
          than two stray letters. The neutral placeholder, having no name, is marked decorative.
        </li>
      </ul>

      <h2>Usage</h2>
      <ul>
        <li>
          Always pass <code>name</code>, even alongside <code>src</code>. It supplies the fallback
          initials and the accessible label if the image fails.
        </li>
        <li>
          Reserve <code>rounded</code> for non-person entities. Keep people on the default{' '}
          <code>circle</code> so avatars stay scannable in a shared list.
        </li>
        <li>
          Pair with the person's name in adjacent <code>Text</code> rather than relying on the
          avatar alone to identify someone.
        </li>
      </ul>
    </>
  );
}
