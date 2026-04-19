import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../lib/prisma';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthUser {
  id: string;
  role: 'user' | 'hospital' | 'admin';
  supabase_uid: string;
}

export function requireAuth(roles?: AuthUser['role'][]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Unauthorized' });
    const token = header.replace('Bearer ', '');

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Invalid token' });

    const dbUser = await prisma.user.findUnique({ where: { supabase_uid: user.id } });
    if (!dbUser) return res.status(401).json({ error: 'User not registered' });

    if (roles && roles.length && !roles.includes(dbUser.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    (req as any).user = { id: dbUser.id, role: dbUser.role, supabase_uid: user.id };
    next();
  };
}
