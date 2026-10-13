import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryNoteRepository } from '../../src/repositories/InMemoryNoteRepository';

describe('InMemoryNoteRepository', () => {
  let repository: InMemoryNoteRepository;

  beforeEach(() => {
    repository = new InMemoryNoteRepository();
  });

  it('starts empty', async () => {
    expect(await repository.findAll()).toEqual([]);
  });

  it('creates a note with an id and timestamps', async () => {
    const note = await repository.create({ title: 'Milk', body: 'Two pints' });

    expect(note.id).toEqual(expect.any(String));
    expect(note.title).toBe('Milk');
    expect(note.body).toBe('Two pints');
    expect(note.createdAt).toBe(note.updatedAt);
  });

  it('finds a note by id', async () => {
    const created = await repository.create({ title: 'Milk', body: '' });

    expect(await repository.findById(created.id)).toEqual(created);
    expect(await repository.findById('missing')).toBeUndefined();
  });

  it('updates an existing note and keeps its id', async () => {
    const created = await repository.create({ title: 'Milk', body: '' });

    const updated = await repository.update(created.id, {
      title: 'Oat milk',
      body: 'One carton',
    });

    expect(updated?.id).toBe(created.id);
    expect(updated?.title).toBe('Oat milk');
    expect(await repository.findAll()).toHaveLength(1);
  });

  it('returns undefined when updating a note that does not exist', async () => {
    const updated = await repository.update('missing', {
      title: 'x',
      body: '',
    });

    expect(updated).toBeUndefined();
  });

  it('deletes a note and reports whether anything was removed', async () => {
    const created = await repository.create({ title: 'Milk', body: '' });

    expect(await repository.delete(created.id)).toBe(true);
    expect(await repository.delete(created.id)).toBe(false);
    expect(await repository.findAll()).toEqual([]);
  });
});
