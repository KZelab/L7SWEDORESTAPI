import { InMemoryNoteRepository } from './InMemoryNoteRepository';
import type { NoteRepository } from './NoteRepository';

// The only place in the back end that names a concrete repository class.
export function createNoteRepository(storeType: string): NoteRepository {
  switch (storeType) {
    case 'memory':
      return new InMemoryNoteRepository();
    default:
      throw new Error(`Unknown store type: ${storeType}`);
  }
}
