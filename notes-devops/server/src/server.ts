import { createApp } from './app';
import { config } from './config';
import { createNoteRepository } from './repositories/repositoryFactory';

const repository = createNoteRepository(config.storeType);
const app = createApp(repository, config.publicDir);

app.listen(config.port, () => {
  console.log(`Notes API listening on port ${config.port}`);
});
