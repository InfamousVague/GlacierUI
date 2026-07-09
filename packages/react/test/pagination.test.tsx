import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pagination } from '../src/index.ts';

describe('Pagination', () => {
  it('renders a compact range for very large page counts', () => {
    render(<Pagination page={5000} total={100000} pageSize={10} boundaryCount={2} siblingCount={1} onPageChange={() => {}} />);

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4999' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5000' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5001' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '9999' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '10000' })).toBeInTheDocument();
    expect(screen.getAllByText('…')).toHaveLength(2);
  });
});
