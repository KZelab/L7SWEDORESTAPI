import { randomUUID } from 'node:crypto';
import type { Note, NoteInput, NoteRepository } from './NoteRepository';

export class InMemoryNoteRepository implements NoteRepository {
  private readonly notes = new Map<string, Note>();

  async findAll(): Promise<Note[]> {
    return [...this.notes.values()];
  }

  async findById(id: string): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async create(input: NoteInput): Promise<Note> {
    const now = new Date().toISOString();
    const note: Note = {
      id: randomUUID(),
      title: input.title,
      body: input.body,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.set(note.id, note);
    return note;
  }

  async update(id: string, input: NoteInput): Promise<Note | undefined> {
    const existing = this.notes.get(id);
    if (!existing) {
      return undefined;
    }
    const updated: Note = {
      ...existing,
      title: input.title,
      body: input.body,
      updatedAt: new Date().toISOString(),
    };
    this.notes.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.notes.delete(id);
  }
}
