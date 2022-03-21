import app from 'app';
import { PORT, DB_CONFIG, DB_SYNC, NODE_ENV } from 'config/environments';
import { createConnection } from 'typeorm';

createConnection().then(() => {
  app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
});
