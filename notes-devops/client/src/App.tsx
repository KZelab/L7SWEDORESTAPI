import { useEffect, useState } from 'react';
import { createNote, deleteNote, listNotes, updateNote } from './api';
import type { Note, NoteInput } from './api';
import { NoteForm } from './components/NoteForm';
import { NoteList } from './components/NoteList';

export function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editing, setEditing] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listNotes()
      .then(setNotes)
      .catch((problem: Error) => setError(problem.message))
      .finally(() => setLoading(false));
  }, []);

  // Runs an API call and shows its error message if it fails.
  async function attempt(action: () => Promise<void>) {
    try {
      setError('');
      await action();
    } catch (problem) {
      setError((problem as Error).message);
    }
  }

  function handleCreate(input: NoteInput) {
    return attempt(async () => {
      const created = await createNote(input);
      setNotes((current) => [...current, created]);
    });
  }

  function handleUpdate(input: NoteInput) {
    return attempt(async () => {
      if (!editing) return;
      const updated = await updateNote(editing.id, input);
      setNotes((current) =>
        current.map((note) => (note.id === updated.id ? updated : note)),
      );
      setEditing(null);
    });
  }

  function handleDelete(target: Note) {
    return attempt(async () => {
      await deleteNote(target.id);
      setNotes((current) => current.filter((note) => note.id !== target.id));
      if (editing?.id === target.id) {
        setEditing(null);
      }
    });
  }

  return (
    <main>
      <h1>Notes</h1>

      <section aria-labelledby="form-heading">
        <h2 id="form-heading">{editing ? 'Edit note' : 'Add a note'}</h2>
        {editing ? (
          <NoteForm
            key={editing.id}
            initial={{ title: editing.title, body: editing.body }}
            submitLabel="Save changes"
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <NoteForm key="new" submitLabel="Add note" onSubmit={handleCreate} />
        )}
      </section>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <section aria-labelledby="list-heading">
        <h2 id="list-heading">Your notes</h2>
        {loading ? (
          <p>Loading notes...</p>
        ) : (
          <NoteList notes={notes} onEdit={setEditing} onDelete={handleDelete} />
        )}
      </section>
    </main>
  );
}
