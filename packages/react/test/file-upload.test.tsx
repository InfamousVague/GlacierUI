import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Field, FileUpload } from '../src/index.ts';

const AXE_RULES = { region: { enabled: false }, 'page-has-heading-one': { enabled: false } };

function makeFile(name: string, type = 'text/plain', size = 8): File {
  return new File(['x'.repeat(size)], name, { type });
}

function getInput(): HTMLInputElement {
  return screen.getByLabelText('Attachments') as HTMLInputElement;
}

function getZone(container: HTMLElement): HTMLElement {
  return container.querySelector('label') as HTMLElement;
}

describe('FileUpload', () => {
  it('opens files picked through the native input into the list', () => {
    const onFilesChange = vi.fn();
    render(<FileUpload aria-label="Attachments" multiple onFilesChange={onFilesChange} />);

    fireEvent.change(getInput(), { target: { files: [makeFile('notes.txt'), makeFile('report.pdf', 'application/pdf')] } });

    expect(onFilesChange).toHaveBeenCalledWith([expect.any(File), expect.any(File)]);
    expect(screen.getByText('notes.txt')).toBeInTheDocument();
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Selected files' })).toBeInTheDocument();
  });

  it('adds dropped files and tracks the dragging visual state', () => {
    const onFilesChange = vi.fn();
    const { container } = render(<FileUpload aria-label="Attachments" multiple onFilesChange={onFilesChange} />);
    const zone = getZone(container);

    fireEvent.dragEnter(zone, { dataTransfer: { types: ['Files'], files: [] } });
    expect(zone).toHaveAttribute('data-dragging');

    fireEvent.drop(zone, { dataTransfer: { types: ['Files'], files: [makeFile('photo.png', 'image/png')] } });
    expect(zone).not.toHaveAttribute('data-dragging');
    expect(onFilesChange).toHaveBeenCalledWith([expect.any(File)]);
    expect(screen.getByText('photo.png')).toBeInTheDocument();
  });

  it('clears the dragging state when the drag leaves without dropping', () => {
    const { container } = render(<FileUpload aria-label="Attachments" />);
    const zone = getZone(container);

    fireEvent.dragEnter(zone, { dataTransfer: { types: ['Files'], files: [] } });
    expect(zone).toHaveAttribute('data-dragging');
    fireEvent.dragLeave(zone);
    expect(zone).not.toHaveAttribute('data-dragging');
  });

  it('rejects on type, size, and count without listing the files', () => {
    const onReject = vi.fn();
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileUpload
        aria-label="Attachments"
        multiple
        accept=".png,image/*"
        maxSize={10}
        maxFiles={2}
        onReject={onReject}
        onFilesChange={onFilesChange}
      />,
    );

    const wrongType = makeFile('notes.txt', 'text/plain');
    const tooBig = makeFile('huge.png', 'image/png', 50);
    const ok1 = makeFile('a.png', 'image/png');
    const ok2 = makeFile('b.png', 'image/png');
    const overCount = makeFile('c.png', 'image/png');
    fireEvent.drop(getZone(container), {
      dataTransfer: { types: ['Files'], files: [wrongType, tooBig, ok1, ok2, overCount] },
    });

    expect(onReject).toHaveBeenCalledWith([
      { file: wrongType, reason: 'type' },
      { file: tooBig, reason: 'size' },
      { file: overCount, reason: 'count' },
    ]);
    expect(onFilesChange).toHaveBeenCalledWith([ok1, ok2]);
    expect(screen.queryByText('notes.txt')).toBeNull();
    expect(screen.queryByText('huge.png')).toBeNull();
    expect(screen.queryByText('c.png')).toBeNull();
    // the count summary reflects the accepted files against the cap
    expect(screen.getByText('2 of 2 files')).toBeInTheDocument();
  });

  it('replaces the selection instead of appending when not multiple', () => {
    const onFilesChange = vi.fn();
    const { container } = render(<FileUpload aria-label="Attachments" onFilesChange={onFilesChange} />);
    const zone = getZone(container);

    fireEvent.drop(zone, { dataTransfer: { types: ['Files'], files: [makeFile('first.txt')] } });
    fireEvent.drop(zone, { dataTransfer: { types: ['Files'], files: [makeFile('second.txt')] } });

    expect(onFilesChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'second.txt' })]);
    expect(screen.queryByText('first.txt')).toBeNull();
    expect(screen.getByText('second.txt')).toBeInTheDocument();
  });

  it('removes a file through its remove button and fires onFilesChange', () => {
    const onFilesChange = vi.fn();
    render(
      <FileUpload
        aria-label="Attachments"
        multiple
        defaultValue={[makeFile('keep.txt'), makeFile('drop.txt')]}
        onFilesChange={onFilesChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove drop.txt' }));

    expect(onFilesChange).toHaveBeenCalledWith([expect.objectContaining({ name: 'keep.txt' })]);
    expect(screen.queryByText('drop.txt')).toBeNull();
    expect(screen.getByText('keep.txt')).toBeInTheDocument();
  });

  it('supports controlled value: the list follows the prop, not internal state', () => {
    const onFilesChange = vi.fn();
    const { container, rerender } = render(
      <FileUpload aria-label="Attachments" multiple value={[]} onFilesChange={onFilesChange} />,
    );

    fireEvent.drop(getZone(container), { dataTransfer: { types: ['Files'], files: [makeFile('new.txt')] } });
    // controlled: the parent was told, but the list does not change on its own
    expect(onFilesChange).toHaveBeenCalledWith([expect.objectContaining({ name: 'new.txt' })]);
    expect(screen.queryByText('new.txt')).toBeNull();

    rerender(<FileUpload aria-label="Attachments" multiple value={[makeFile('accepted.txt')]} onFilesChange={onFilesChange} />);
    expect(screen.getByText('accepted.txt')).toBeInTheDocument();
  });

  it('blocks drops and dragging feedback when disabled', () => {
    const onFilesChange = vi.fn();
    const { container } = render(<FileUpload aria-label="Attachments" disabled onFilesChange={onFilesChange} />);
    const zone = getZone(container);

    expect(getInput()).toBeDisabled();
    fireEvent.dragEnter(zone, { dataTransfer: { types: ['Files'], files: [] } });
    expect(zone).not.toHaveAttribute('data-dragging');
    fireEvent.drop(zone, { dataTransfer: { types: ['Files'], files: [makeFile('nope.txt')] } });
    expect(onFilesChange).not.toHaveBeenCalled();
    expect(screen.queryByText('nope.txt')).toBeNull();
  });

  it('carries name, accept, and multiple on the real input for form participation', () => {
    render(<FileUpload aria-label="Attachments" name="attachments" accept="image/*" multiple />);
    const input = getInput();
    expect(input).toHaveAttribute('name', 'attachments');
    expect(input).toHaveAttribute('accept', 'image/*');
    expect(input).toHaveAttribute('multiple');
    expect(input).toHaveAttribute('type', 'file');
  });

  it('reads id, describedBy, and invalid from a surrounding Field', () => {
    render(
      <Field label="Attachments" error="At least one file is required">
        <FileUpload />
      </Field>,
    );
    const input = screen.getByLabelText('Attachments');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
    expect(screen.getByText('At least one file is required')).toBeInTheDocument();
  });

  it('overrides the localized label and hint and shows the count summary', () => {
    render(<FileUpload aria-label="Attachments" label="Drop CSV exports" hint="Up to 5 MB each" maxFiles={4} />);
    expect(screen.getByText('Drop CSV exports')).toBeInTheDocument();
    expect(screen.getByText('Up to 5 MB each')).toBeInTheDocument();
    expect(screen.getByText('0 of 4 files')).toBeInTheDocument();
  });

  it('formats file sizes into locale-aware units', () => {
    render(<FileUpload aria-label="Attachments" multiple defaultValue={[makeFile('big.bin', 'application/octet-stream', 2500)]} />);
    expect(screen.getByText('2.5 kB')).toBeInTheDocument();
  });

  it('renders a skeleton placeholder with the zone geometry', () => {
    const { container } = render(<FileUpload aria-label="Attachments" skeleton />);
    expect(container.querySelector('input[type="file"]')).toBeNull();
    const skeleton = container.querySelector('[data-skeleton]') as HTMLElement;
    expect(skeleton.style.width).toBe('100%');
    expect(skeleton.style.borderRadius).toBe('var(--glacier-radius-lg)');
  });

  it('forwards rest props such as data-testid to the root', () => {
    render(<FileUpload aria-label="Attachments" data-testid="upload" />);
    expect(screen.getByTestId('upload')).toBeInTheDocument();
  });

  it('has no axe violations with files listed', async () => {
    render(<FileUpload aria-label="Attachments" multiple maxFiles={3} defaultValue={[makeFile('doc.pdf', 'application/pdf')]} />);
    expect((await axe.run(document.body, { rules: AXE_RULES })).violations).toEqual([]);
  });
});
