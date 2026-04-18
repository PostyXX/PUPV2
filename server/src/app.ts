import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth.js';
import { petsRouter } from './routes/pets.js';
import { hospitalsRouter } from './routes/hospitals.js';
import { appointmentsRouter } from './routes/appointments.js';
import { vaccinationsRouter } from './routes/vaccinations.js';
import { recordsRouter } from './routes/records.js';
import { activityLogsRouter } from './routes/activityLogs.js';
import { usersRouter } from './routes/users.js';
import { notificationsRouter } from './routes/notifications.js';
import { userActivityRouter } from './routes/user-activity.js';

dotenv.config();

const app = express();

// Configure security headers with Helmet
// - ใช้ค่า default ของ Helmet
// - อนุญาตโหลดรูปจาก Unsplash
// - อนุญาตสคริปต์ analytics ของ Cloudflare Insights
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "img-src": [
          "'self'",
          'data:',
          'https://images.unsplash.com',
          'https://*.unsplash.com',
        ],
        "script-src": [
          "'self'",
          'https://static.cloudflareinsights.com',
        ],
      },
    },
  })
);
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.options('*', cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/pets', petsRouter);
app.use('/hospitals', hospitalsRouter);
app.use('/appointments', appointmentsRouter);
app.use('/vaccinations', vaccinationsRouter);
app.use('/medical-records', recordsRouter);
app.use('/activity-logs', activityLogsRouter);
app.use('/notifications', notificationsRouter);
app.use('/user-activity', userActivityRouter);

export default app;
