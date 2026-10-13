import { Router } from 'express';
import type { NoteRepository } from '../repositories/NoteRepository';
import { validateNoteInput } from '../validation';

// Each handler does three things only: read the request, call the
// repository, and choose a status code. The rules live elsewhere.
export function createNotesRouter(repository: NoteRepository): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.json(await repository.findAll());
  });

  router.post('/', async (req, res) => {
    const result = validateNoteInput(req.body);
    if (!result.ok) {
      res.status(400).json({ errors: result.errors });
      return;
    }
    const note = await repository.create(result.value);
    res.status(201).json(note);
  });

  router.put('/:id', async (req, res) => {
    const result = validateNoteInput(req.body);
    if (!result.ok) {
      res.status(400).json({ errors: result.errors });
      return;
    }
    const note = await repository.update(req.params.id, result.value);
    if (!note) {
      res.status(404).json({ errors: ['Note not found'] });
      return;
    }
    res.json(note);
  });

  router.delete('/:id', async (req, res) => {
    const deleted = await repository.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ errors: ['Note not found'] });
      return;
    }
    res.status(204).end();
  });

  return router;
}
