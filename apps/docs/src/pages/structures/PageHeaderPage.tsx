import {
  Box,
  Breadcrumbs,
  Button,
  Heading,
  Pill,
  Size,
  StatusDot,
  Text,
  TextTone,
  Variant,
  useT,
} from '@glacier/react';
import { Example, PropsTable, prose } from '../../docs-ui.tsx';
import { ComponentBlueprint } from '../../Blueprint.tsx';
import { m } from '../../i18n.ts';

export function PageHeaderPage() {
  const t = useT();
  const CRUMBS = [
    { label: t(m.pageheaderAcme), href: '#' },
    { label: t(m.pageheaderPlatform), href: '#' },
    { label: t(m.pageheaderDeployments) },
  ];
  return (
    <>
      <Heading level={1}>{t(m.phName)}</Heading>
      <Text size={Size.Large} tone={TextTone.Muted} className="lede">
        {prose(t(m.phLede))}
      </Text>

      <Heading level={2}>{t(m.secAnatomy)}</Heading>
      <Text tone={TextTone.Muted}>{t(m.anatomyIntro)}</Text>
      <ComponentBlueprint specId="page-header" />

      <Heading level={2}>{t(m.secExamples)}</Heading>

      <Example
        title={t(m.phEx1Title)}
        description={t(m.phEx1Desc)}
        component="PageHeader"
        render={(K) => (
          <Box width="full" border radius="lg" paddingX={6}>
            <K.PageHeader
              breadcrumbs={<Breadcrumbs items={CRUMBS} />}
              title={t(m.pageheaderDeployments)}
              headingLevel={2}
              description={t(m.phDemoDesc)}
              meta={
                <>
                  <Pill tone="success" size={Size.Small}>{t(m.pageheaderHealthy)}</Pill>
                  <Pill size={Size.Small}>{t(m.pageheaderX12Environments)}</Pill>
                  <StatusDot tone="success" label={t(m.pageheaderAllSystemsLive)} />
                </>
              }
              actions={
                <>
                  <Button variant={Variant.Ghost}>{t(m.pageheaderExport)}</Button>
                  <Button>{t(m.pageheaderNewDeployment)}</Button>
                </>
              }
              secondaryActions={[
                { id: 'settings', label: t(m.pageheaderPipelineSettings) },
                { id: 'archive', label: t(m.pageheaderArchiveProject) },
                { id: 'delete', label: t(m.pageheaderDeleteProject), disabled: true },
              ]}
            />
          </Box>
        )}
        code={`<PageHeader
  breadcrumbs={
    <Breadcrumbs
      items={[
        { label: 'Acme', href: '#' },
        { label: 'Platform', href: '#' },
        { label: 'Deployments' },
      ]}
    />
  }
  title="Deployments"
  headingLevel={2}
  description="Everything the platform team has shipped to production, newest first."
  meta={
    <>
      <Pill tone="success" size={Size.Small}>Healthy</Pill>
      <Pill size={Size.Small}>12 environments</Pill>
      <StatusDot tone="success" label="All systems live" />
    </>
  }
  actions={
    <>
      <Button variant={Variant.Ghost}>Export</Button>
      <Button>New deployment</Button>
    </>
  }
  secondaryActions={[
    { id: 'settings', label: 'Pipeline settings' },
    { id: 'archive', label: 'Archive project' },
    { id: 'delete', label: 'Delete project', disabled: true },
  ]}
/>`}
      />

      <Example
        title={t(m.phEx2Title)}
        description={t(m.phEx2Desc)}
        component="PageHeader"
        render={(K) => (
          <Box width="full" border radius="lg" paddingX={6}>
            <K.PageHeader
              density="compact"
              headingLevel={2}
              title={t(m.pageheaderEnvironmentVariables)}
              meta={<Pill size={Size.Small}>{t(m.pageheaderX48Keys)}</Pill>}
              actions={<Button variant={Variant.Soft}>{t(m.pageheaderAddVariable)}</Button>}
              secondaryActions={[
                { id: 'import', label: t(m.pageheaderImportEnv) },
                { id: 'export', label: t(m.pageheaderExportAsJson) },
              ]}
            />
          </Box>
        )}
        code={`<PageHeader
  density="compact"
  headingLevel={2}
  title="Environment variables"
  meta={<Pill size={Size.Small}>48 keys</Pill>}
  actions={<Button variant={Variant.Soft}>Add variable</Button>}
  secondaryActions={[
    { id: 'import', label: 'Import .env' },
    { id: 'export', label: 'Export as JSON' },
  ]}
/>`}
      />

      <Example
        title={t(m.phEx3Title)}
        description={t(m.phEx3Desc)}
        component="PageHeader"
        render={(K) => (
          <Box width="full" border radius="lg" paddingX={6}>
            <K.PageHeader title={t(m.pageheaderBilling)} headingLevel={2} actions={<Button>{t(m.pageheaderUpgradePlan)}</Button>} />
          </Box>
        )}
        code={`<PageHeader title="Billing" headingLevel={2} actions={<Button>Upgrade plan</Button>} />`}
      />

      <Example
        title={t(m.exSkeleton)}
        description={t(m.phEx4Desc)}
        component="PageHeader"
        render={(K) => (
          <Box width="full" border radius="lg" paddingX={6}>
            <K.PageHeader
              skeleton
              title={t(m.pageheaderDeployments)}
              description={t(m.pageheaderLoading)}
              breadcrumbs={<Breadcrumbs items={CRUMBS} />}
              meta={<Pill size={Size.Small}>{t(m.pageheaderMeta)}</Pill>}
              actions={<Button>{t(m.pageheaderAction)}</Button>}
            />
          </Box>
        )}
        code={`<PageHeader
  skeleton
  title="Deployments"
  description="Loading"
  breadcrumbs={<Breadcrumbs items={crumbs} />}
  meta={<Pill size={Size.Small}>meta</Pill>}
  actions={<Button>Action</Button>}
/>`}
      />

      <Heading level={2}>{t(m.secProps)}</Heading>
      <PropsTable
        props={[
          { name: 'title', type: 'ReactNode', description: t(m.phPropTitle) },
          { name: 'description', type: 'ReactNode', description: t(m.phPropDescription) },
          { name: 'breadcrumbs', type: 'ReactNode', description: t(m.phPropBreadcrumbs) },
          { name: 'meta', type: 'ReactNode', description: t(m.phPropMeta) },
          { name: 'actions', type: 'ReactNode', description: t(m.phPropActions) },
          { name: 'secondaryActions', type: 'PageHeaderAction[]', description: t(m.phPropSecondaryActions) },
          { name: 'headingLevel', type: '1 | 2', default: '1', description: t(m.phPropHeadingLevel) },
          { name: 'density', type: "'comfortable' | 'compact'", default: "'comfortable'", description: t(m.phPropDensity) },
          { name: 'skeleton', type: 'boolean', default: 'false', description: t(m.phPropSkeleton) },
        ]}
      />

      <Heading level={2}>{t(m.secAccessibility)}</Heading>
      <ul>
        <li>{prose(t(m.phA11y1))}</li>
        <li>{prose(t(m.phA11y2))}</li>
        <li>{prose(t(m.phA11y3))}</li>
        <li>{prose(t(m.phA11y4))}</li>
        <li>{prose(t(m.phA11y5))}</li>
      </ul>

      <Heading level={2}>{t(m.secUsage)}</Heading>
      <ul>
        <li>{prose(t(m.phUse1))}</li>
        <li>{prose(t(m.phUse2))}</li>
        <li>{prose(t(m.phUse3))}</li>
        <li>{prose(t(m.phUse4))}</li>
      </ul>
    </>
  );
}
