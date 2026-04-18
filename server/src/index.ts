import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`PUP API running on http://127.0.0.1:${PORT}`);
  });
}

export default app;
