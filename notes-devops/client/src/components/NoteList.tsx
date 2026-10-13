import type { Note } from '../api';

interface NoteListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NoteList({ notes, onEdit, onDelete }: NoteListProps) {
  if (notes.length === 0) {
    return <p className="empty">No notes yet. Add your first one above.</p>;
  }

  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id} className="note">
          <h3>{note.title}</h3>
          {note.body && <p>{note.body}</p>}
          <div className="actions">
            <button
              type="button"
              className="secondary"
              aria-label={`Edit ${note.title}`}
              onClick={() => onEdit(note)}
            >
              Edit
            </button>
            <button
              type="button"
              className="danger"
              aria-label={`Delete ${note.title}`}
              onClick={() => onDelete(note)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
