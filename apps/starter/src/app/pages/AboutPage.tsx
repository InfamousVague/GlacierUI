import { useState } from 'react';
import { Button, Callout, Field, Heading, Input, Pill, Row, Size, Text, TextTone } from '@glacier/react';
import { greet, isTauri } from '../tauri.ts';

export function AboutPage() {
  const [name, setName] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const runningInTauri = isTauri();

  async function invokeGreet() {
    setPending(true);
    try {
      setReply(await greet(name));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="page">
      <div>
        <Row align="center" gap={3} wrap>
          <Heading level={1}>About</Heading>
          <Pill tone={runningInTauri ? 'success' : 'neutral'} size={Size.Small}>
            {runningInTauri ? 'Running under Tauri' : 'Running in the browser'}
          </Pill>
        </Row>
        <Text tone={TextTone.Muted} className="pageLede">
          A blank-canvas desktop app skeleton: sidebar navigation, a window title bar, settings,
          modals, and toasts, all composed from Glacier UI. Delete these pages and build your own.
        </Text>
      </div>

      <Callout tone="info" title="Talk to the backend">
        This calls a Rust <code>#[tauri::command]</code> named <code>greet</code>. With the full
        Tauri backend it runs the real command; in the browser or the web-shell scaffold it falls
        back to a friendly stub, so the demo always works.
      </Callout>

      <div style={{ maxWidth: '28rem', display: 'grid', gap: 'var(--glacier-space-3)' }}>
        <Field label="Your name">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ada"
            onKeyDown={(event) => {
              if (event.key === 'Enter') void invokeGreet();
            }}
          />
        </Field>
        <Row>
          <Button onClick={() => void invokeGreet()} loading={pending}>
            Invoke greet
          </Button>
        </Row>
        {reply !== null && (
          <Callout tone="success" title="Reply">
            {reply}
          </Callout>
        )}
      </div>
    </div>
  );
}
