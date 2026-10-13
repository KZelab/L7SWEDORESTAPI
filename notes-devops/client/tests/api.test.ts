import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNote, deleteNote, listNotes, updateNote } from '../src/api';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('api', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('lists notes with a GET request', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, [{ id: '1' }]));

    const notes = await listNotes();

    expect(fetchMock).toHaveBeenCalledWith('/api/notes', expect.anything());
    expect(notes).toEqual([{ id: '1' }]);
  });

  it('creates a note with a POST request carrying JSON', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { id: '1', title: 'Milk' }));

    await createNote({ title: 'Milk', body: '' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/notes',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Milk', body: '' }),
      }),
    );
  });

  it('updates a note with a PUT request to its id', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { id: '1' }));

    await updateNote('1', { title: 'Oat milk', body: '' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/notes/1',
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('deletes a note and copes with an empty 204 response', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(deleteNote('1')).resolves.toBeUndefined();
  });

  it('throws the error messages sent by the server', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(400, { errors: ['Title is required'] }),
    );

    await expect(createNote({ title: '', body: '' })).rejects.toThrow(
      'Title is required',
    );
  });

  it('throws a generic message when the error has no JSON body', async () => {
    fetchMock.mockResolvedValue(new Response('Bad gateway', { status: 502 }));

    await expect(listNotes()).rejects.toThrow('Request failed (502)');
  });
});
