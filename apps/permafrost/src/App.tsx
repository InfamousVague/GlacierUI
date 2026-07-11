import { ArrowDownUp, Cpu, Database, Gauge, MemoryStick, Moon, Snowflake, Sun } from '@glacier/icons';
import {
  AppShell,
  HapticsProvider,
  IconButton,
  Pill,
  Sidebar,
  SidebarItem,
  SidebarSection,
} from '@glacier/react';
import { useState } from 'react';
import { ScrubberBar } from './components/ScrubberBar.tsx';
import type { ResourceKey } from './components/ProcessTable.tsx';
import { TelemetryProvider, useTelemetry } from './core/telemetry.tsx';
import { Overview } from './views/Overview.tsx';
import { Resource } from './views/Resource.tsx';

type View = 'overview' | ResourceKey;

const NAV: { id: View; label: string; icon: typeof Gauge }[] = [
  { id: 'overview', label: 'Overview', icon: Gauge },
  { id: 'cpu', label: 'CPU', icon: Cpu },
  { id: 'memory', label: 'Memory', icon: MemoryStick },
  { id: 'disk', label: 'Disk', icon: Database },
  { id: 'network', label: 'Network', icon: ArrowDownUp },
];

function Header() {
  const { sensor, current, live } = useTelemetry();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const frozen = current.processes.filter((p) => p.state === 'frozen').length;

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
  };

  return (
    <>
      <span className="pfBrand">
        <Snowflake size={16} aria-hidden /> Permafrost
      </span>
      <span className="pfHeaderEnd">
        {frozen > 0 && (
          <Pill size="sm" tone="info" icon={<Snowflake size={11} />}>
            {frozen} frozen
          </Pill>
        )}
        {!live && (
          <Pill size="sm" tone="warning">
            viewing history
          </Pill>
        )}
        <span className="pfDim" style={{ fontSize: 'var(--glacier-font-size-xs)' }}>
          {sensor.machine.hostname} · {sensor.machine.cores} cores
        </span>
        <IconButton variant="ghost" size="sm" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </IconButton>
      </span>
    </>
  );
}

function Frame() {
  const [view, setView] = useState<View>('overview');

  return (
    <AppShell
      sidebarLabel="Monitor navigation"
      sidebarWidth="13rem"
      header={<Header />}
      sidebar={
        <Sidebar>
          <SidebarSection title="Monitor">
            {NAV.map(({ id, label, icon: Icon }) => (
              <SidebarItem key={id} icon={<Icon size={15} />} active={view === id} onClick={() => setView(id)}>
                {label}
              </SidebarItem>
            ))}
          </SidebarSection>
        </Sidebar>
      }
    >
      <div className="pfColumn">
        <main className="pfView">{view === 'overview' ? <Overview /> : <Resource resource={view} />}</main>
        <ScrubberBar />
      </div>
    </AppShell>
  );
}

export function App() {
  return (
    <HapticsProvider>
      <TelemetryProvider>
        <Frame />
      </TelemetryProvider>
    </HapticsProvider>
  );
}
