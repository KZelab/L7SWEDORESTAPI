import { describe, expect, it } from 'vitest';
import { InMemoryNoteRepository } from '../../src/repositories/InMemoryNoteRepository';
import { createNoteRepository } from '../../src/repositories/repositoryFactory';

describe('createNoteRepository', () => {
  it('builds an in-memory repository for the memory store type', () => {
    expect(createNoteRepository('memory')).toBeInstanceOf(
      InMemoryNoteRepository,
    );
  });

  it('gives each caller its own repository', async () => {
    const first = createNoteRepository('memory');
    const second = createNoteRepository('memory');

    await first.create({ title: 'Milk', body: '' });

    expect(await second.findAll()).toEqual([]);
  });

  it('refuses a store type it does not know', () => {
    expect(() => createNoteRepository('postgres')).toThrow(
      'Unknown store type: postgres',
    );
  });
});
