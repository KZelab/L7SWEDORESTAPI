import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../src/api';
import type { Note } from '../src/api';
import { App } from '../src/App';

// Replace the real API module, so these tests never touch the network.
vi.mock('../src/api');

function makeNote(id: string, title: string, body = ''): Note {
  const now = '2026-01-01T00:00:00.000Z';
  return { id, title, body, createdAt: now, updatedAt: now };
}

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.listNotes).mockResolvedValue([]);
  });

  it('loads and shows the existing notes', async () => {
    vi.mocked(api.listNotes).mockResolvedValue([makeNote('1', 'Milk')]);

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'Milk' }),
    ).toBeInTheDocument();
  });

  it('adds a new note to the list', async () => {
    const user = userEvent.setup();
    vi.mocked(api.createNote).mockResolvedValue(makeNote('2', 'Bread'));
    render(<App />);
    await screen.findByText(/No notes yet/);

    await user.type(screen.getByLabelText('Title'), 'Bread');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(api.createNote).toHaveBeenCalledWith({ title: 'Bread', body: '' });
    expect(
      await screen.findByRole('heading', { name: 'Bread' }),
    ).toBeInTheDocument();
  });

  it('edits a note', async () => {
    const user = userEvent.setup();
    vi.mocked(api.listNotes).mockResolvedValue([makeNote('1', 'Milk')]);
    vi.mocked(api.updateNote).mockResolvedValue(makeNote('1', 'Oat milk'));
    render(<App />);

    await user.click(await screen.findByRole('button', { name: 'Edit Milk' }));
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Oat milk');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(api.updateNote).toHaveBeenCalledWith('1', {
      title: 'Oat milk',
      body: '',
    });
    expect(
      await screen.findByRole('heading', { name: 'Oat milk' }),
    ).toBeInTheDocument();
  });

  it('removes a deleted note from the list', async () => {
    const user = userEvent.setup();
    vi.mocked(api.listNotes).mockResolvedValue([makeNote('1', 'Milk')]);
    vi.mocked(api.deleteNote).mockResolvedValue();
    render(<App />);

    await user.click(
      await screen.findByRole('button', { name: 'Delete Milk' }),
    );

    expect(api.deleteNote).toHaveBeenCalledWith('1');
    expect(await screen.findByText(/No notes yet/)).toBeInTheDocument();
  });

  it('shows an error when the notes cannot be loaded', async () => {
    vi.mocked(api.listNotes).mockRejectedValue(new Error('Server is down'));

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Server is down',
    );
  });
});
