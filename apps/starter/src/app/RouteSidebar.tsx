import { useState, type ReactNode } from 'react';
import { Sidebar, SidebarItem, SidebarSection } from '@glacier/react';
import { Activity, FileText, Folder, Info, Layers, LayoutGrid, ScrollText, Snowflake, Tag } from '@glacier/icons';
import { useT, type MessageKey } from './i18n.ts';
import type { Route } from './router.ts';

const APP_NAME = 'Glacier Starter';

interface Item {
  key: MessageKey;
  icon: ReactNode;
}

/**
 * The contextual sidebar content for each route. The rail switches the route;
 * this panel shows the mock navigation for the selected section, the way Libre
 * or VS Code swap the sidebar per activity. Wire real items in per section.
 */
const CONTEXT: Record<Route, { titleKey: MessageKey; items: Item[] }> = {
  dashboard: {
    titleKey: 'sbDashViews',
    items: [
      { key: 'sbDashOverview', icon: <LayoutGrid size={17} /> },
      { key: 'sbDashReports', icon: <FileText size={17} /> },
      { key: 'sbDashActivity', icon: <Activity size={17} /> },
    ],
  },
  library: {
    titleKey: 'sbLibBrowse',
    items: [
      { key: 'sbLibAll', icon: <Layers size={17} /> },
      { key: 'sbLibCollections', icon: <Folder size={17} /> },
      { key: 'sbLibTags', icon: <Tag size={17} /> },
    ],
  },
  about: {
    titleKey: 'sbAboutSections',
    items: [
      { key: 'sbAboutOverview', icon: <Info size={17} /> },
      { key: 'sbAboutReleaseNotes', icon: <ScrollText size={17} /> },
    ],
  },
};

/**
 * Remounted per route (keyed on the route in App.tsx), so the selected sub-item
 * resets to the first entry when the section changes.
 */
export function RouteSidebar({ route, desktop }: { route: Route; desktop: boolean }) {
  const t = useT();
  const ctx = CONTEXT[route];
  const [selected, setSelected] = useState(0);

  return (
    <Sidebar
      header={
        // The brand doubles as a window drag handle under Tauri.
        <div className="brand" data-tauri-drag-region={desktop ? '' : undefined}>
          <span className="brandMark">
            <Snowflake size={17} />
          </span>
          {APP_NAME}
        </div>
      }
    >
      <SidebarSection title={t(ctx.titleKey)}>
        {ctx.items.map((item, i) => (
          <SidebarItem
            key={item.key}
            icon={item.icon}
            active={i === selected}
            onClick={() => setSelected(i)}
          >
            {t(item.key)}
          </SidebarItem>
        ))}
      </SidebarSection>
    </Sidebar>
  );
}
