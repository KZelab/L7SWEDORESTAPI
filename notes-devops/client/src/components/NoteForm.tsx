import { useState } from 'react';
import type { FormEvent } from 'react';
import type { NoteInput } from '../api';

interface NoteFormProps {
  initial?: NoteInput;
  submitLabel: string;
  onSubmit: (input: NoteInput) => Promise<void> | void;
  onCancel?: () => void;
}

export function NoteForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: NoteFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (title.trim().length === 0) {
      setError('Title is required');
      return;
    }
    setError('');
    await onSubmit({ title: title.trim(), body: body.trim() });
    // A form with no starting values is the create form, so clear it.
    if (!initial) {
      setTitle('');
      setBody('');
    }
  }

  return (
    <form className="note-form" onSubmit={handleSubmit} noValidate>
      <label>
        Title
        <input
          type="text"
          value={title}
          maxLength={100}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label>
        Body
        <textarea
          value={body}
          rows={3}
          maxLength={2000}
          onChange={(event) => setBody(event.target.value)}
        />
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="actions">
        <button type="submit">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
