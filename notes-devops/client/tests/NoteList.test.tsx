import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Note } from '../src/api';
import { NoteList } from '../src/components/NoteList';

const milk: Note = {
  id: '1',
  title: 'Milk',
  body: 'Two pints',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('NoteList', () => {
  it('shows a message when there are no notes', () => {
    render(<NoteList notes={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText(/No notes yet/)).toBeInTheDocument();
  });

  it('shows the title and body of each note', () => {
    render(<NoteList notes={[milk]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Milk' })).toBeInTheDocument();
    expect(screen.getByText('Two pints')).toBeInTheDocument();
  });

  it('passes the note to onEdit and onDelete', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<NoteList notes={[milk]} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: 'Edit Milk' }));
    await user.click(screen.getByRole('button', { name: 'Delete Milk' }));

    expect(onEdit).toHaveBeenCalledWith(milk);
    expect(onDelete).toHaveBeenCalledWith(milk);
  });
});
