import app from './app';
import { disconnect } from './utils/redis';

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});

async function terminate() {
  try {
    await disconnect();
  } catch (err) {
    console.error(err);
  }
  
  server.close(() => {
    console.log('Closed server');
    process.exit(0);
  });
}

process.on('SIGTERM', terminate);
process.on('SIGINT', terminate);
