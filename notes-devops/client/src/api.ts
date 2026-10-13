export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  title: string;
  body: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!response.ok) {
    const problem = await response.json().catch(() => ({}));
    const errors: string[] = problem.errors ?? [];
    throw new Error(errors.join('. ') || `Request failed (${response.status})`);
  }

  // A 204 response has no body to parse.
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export function listNotes(): Promise<Note[]> {
  return request<Note[]>('/api/notes');
}

export function createNote(input: NoteInput): Promise<Note> {
  return request<Note>('/api/notes', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateNote(id: string, input: NoteInput): Promise<Note> {
  return request<Note>(`/api/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteNote(id: string): Promise<void> {
  return request<void>(`/api/notes/${id}`, { method: 'DELETE' });
}
