# Notes: user stories and story map

## Story map

The top row is the journey a user takes, left to right. Stories sit under the
activity they belong to. Everything above the release line is needed before
the product is worth showing to anybody.

| Capture       | Review        | Maintain       | Operate         |
| ------------- | ------------- | -------------- | --------------- |
| Create a note | List my notes | Edit a note    | Health endpoint |
|               |               | Delete a note  |                 |
| **Release 1** | **Release 1** | **Release 1**  | **Release 1**   |
|               | Search notes  | Pin a note     |                 |

## Stories

### 1. Create a note

As a user, I can create a note with a title and body, so that I do not have
to remember it.

Acceptance criteria:

- Given the form is empty, when I enter a title and press Add note, then the
  note appears in the list.
- Given the title is empty, when I press Add note, then I am told a title is
  required and nothing is saved.
- A title longer than 100 characters is refused.

### 2. List my notes

As a user, I can see a list of my notes, so that I can find what I wrote.

Acceptance criteria:

- Given notes exist, when I open the page, then every note's title and body
  is shown.
- Given no notes exist, when I open the page, then I am told there are none yet.

### 3. Edit a note

As a user, I can edit a note, so that I can correct or extend it.

Acceptance criteria:

- Given a note exists, when I choose Edit, change the title and save, then the
  list shows the new title and not the old one.
- Given I am editing, when I choose Cancel, then the note is unchanged.

### 4. Delete a note

As a user, I can delete a note, so that the list only holds what I still need.

Acceptance criteria:

- Given a note exists, when I choose Delete, then it is no longer in the list.

### 5. Health endpoint

As an operator, I can call a health endpoint, so that I can tell whether the
service is alive and which version is running.

Acceptance criteria:

- `GET /api/health` returns status 200 with `status` equal to `ok`.
- The response includes the version of the running build.
