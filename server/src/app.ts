import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { petsRouter } from './routes/pets';
import { hospitalsRouter } from './routes/hospitals';
import { appointmentsRouter } from './routes/appointments';
import { vaccinationsRouter } from './routes/vaccinations';
import { recordsRouter } from './routes/records';
import { activityLogsRouter } from './routes/activityLogs';
import { usersRouter } from './routes/users';
import { notificationsRouter } from './routes/notifications';
import { userActivityRouter } from './routes/user-activity';

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
