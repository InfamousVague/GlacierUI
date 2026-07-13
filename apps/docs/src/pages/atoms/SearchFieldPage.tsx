import { Box, Kbd, SearchField, Stack, Heading, Text, Size, TextTone, useT } from '@glacier/react';
import { useState } from 'react';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { m } from '../../i18n.ts';

export function SearchFieldPage() {
  const t = useT();
  const [query, setQuery] = useState('');

  return (
    <>
      <Heading level={1}>{t(m.sfName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {t(m.sfLede)}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.sfAnatomyIntro)}</Text>
      <ComponentBlueprint specId="search-field" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.exBasic)}
        description={t(m.sfEx1Desc)}
        component="SearchField"
        render={(K) => (
          <Box style={{ width: '22rem' }}>
            <K.SearchField aria-label={t(m.searchfieldSearch)} />
          </Box>
        )}
        code={`import { SearchField } from '@glacier/react';

<SearchField aria-label="Search" />`}
      />

      <Example
        title={t(m.sfEx2Title)}
        description={t(m.sfEx2Desc)}
        code={`const [query, setQuery] = useState('');

<SearchField aria-label="Search" value={query} onValueChange={setQuery} />`}
      >
        <Box style={{ width: '22rem' }}>
          <SearchField aria-label={t(m.searchfieldSearch)} value={query} onValueChange={setQuery} />
        </Box>
      </Example>

      <Example
        title={t(m.sfEx3Title)}
        description={t(m.sfEx3Desc)}
        component="SearchField"
        render={(K) => (
          <Box style={{ width: '22rem' }}>
            <K.SearchField aria-label={t(m.searchfieldSearch)} shortcut={<Kbd>/</Kbd>} />
          </Box>
        )}
        code={`<SearchField aria-label="Search" shortcut={<Kbd>/</Kbd>} />`}
      />

      <Example
        title={t(m.secSizes)}
        description={t(m.sfEx4Desc)}
        component="SearchField"
        render={(K) => (
          <Stack gap={4} style={{ width: '22rem' }}>
            <K.SearchField aria-label={t(m.searchfieldSmall)} size={Size.Small} />
            <K.SearchField aria-label={t(m.searchfieldMedium)} size={Size.Medium} />
            <K.SearchField aria-label={t(m.searchfieldLarge)} size={Size.Large} />
          </Stack>
        )}
        code={`<SearchField aria-label="Small" size={Size.Small} />
<SearchField aria-label="Medium" size={Size.Medium} />
<SearchField aria-label="Large" size={Size.Large} />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.sfEx5Desc)}
        component="SearchField"
        render={(K) => (
          <Stack gap={4} style={{ width: '22rem' }}>
            <K.SearchField skeleton />
            <K.SearchField aria-label={t(m.searchfieldSearch)} />
          </Stack>
        )}
        code={`<SearchField skeleton />
<SearchField aria-label="Search" />`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'value', type: 'string', description: t(m.sfPropValue) },
          {
            name: 'defaultValue',
            type: 'string',
            default: "''",
            description: t(m.sfPropDefaultValue),
          },
          {
            name: 'onValueChange',
            type: '(value: string) => void',
            description: t(m.sfPropOnValueChange),
          },
          {
            name: 'placeholder',
            type: 'string',
            default: "'Search'",
            description: t(m.sfPropPlaceholder),
          },
          {
            name: 'size',
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: t(m.sfPropSize),
          },
          {
            name: 'shortcut',
            type: 'ReactNode',
            description: t(m.sfPropShortcut),
          },
          {
            name: 'skeleton',
            type: 'boolean',
            default: 'false',
            description: t(m.sfPropSkeleton),
          },
          {
            name: 'aria-label',
            type: 'string',
            description: t(m.sfPropAriaLabel),
          },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.sfA11y1))}</li>
        <li>{prose(t(m.sfA11y2))}</li>
        <li>{t(m.sfA11y3)}</li>
        <li>{prose(t(m.sfA11y4))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{t(m.sfUse1)}</li>
        <li>{t(m.sfUse2)}</li>
        <li>{t(m.sfUse3)}</li>
      </ul>
    </>
  );
}
