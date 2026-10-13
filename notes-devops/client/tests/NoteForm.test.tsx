import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NoteForm } from '../src/components/NoteForm';

describe('NoteForm', () => {
  it('submits the trimmed title and body', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<NoteForm submitLabel="Add note" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Title'), '  Milk ');
    await user.type(screen.getByLabelText('Body'), 'Two pints');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(onSubmit).toHaveBeenCalledWith({ title: 'Milk', body: 'Two pints' });
  });

  it('clears the fields after a new note is submitted', async () => {
    const user = userEvent.setup();
    render(<NoteForm submitLabel="Add note" onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText('Title'), 'Milk');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(screen.getByLabelText('Title')).toHaveValue('');
  });

  it('shows an error and does not submit when the title is empty', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<NoteForm submitLabel="Add note" onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('starts with the values of the note being edited', () => {
    render(
      <NoteForm
        initial={{ title: 'Milk', body: 'Two pints' }}
        submitLabel="Save changes"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Title')).toHaveValue('Milk');
    expect(screen.getByLabelText('Body')).toHaveValue('Two pints');
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <NoteForm
        initial={{ title: 'Milk', body: '' }}
        submitLabel="Save changes"
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
