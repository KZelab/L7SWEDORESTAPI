import type { NoteInput } from './repositories/NoteRepository';

export const MAX_TITLE_LENGTH = 100;
export const MAX_BODY_LENGTH = 2000;

export type ValidationResult =
  { ok: true; value: NoteInput } | { ok: false; errors: string[] };

export function validateNoteInput(payload: unknown): ValidationResult {
  const errors: string[] = [];
  const data = (payload ?? {}) as Record<string, unknown>;

  const title = typeof data.title === 'string' ? data.title.trim() : '';
  if (title.length === 0) {
    errors.push('Title is required');
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.push(`Title must be ${MAX_TITLE_LENGTH} characters or fewer`);
  }

  let body = '';
  if (data.body !== undefined) {
    if (typeof data.body !== 'string') {
      errors.push('Body must be text');
    } else if (data.body.length > MAX_BODY_LENGTH) {
      errors.push(`Body must be ${MAX_BODY_LENGTH} characters or fewer`);
    } else {
      body = data.body.trim();
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: { title, body } };
}
