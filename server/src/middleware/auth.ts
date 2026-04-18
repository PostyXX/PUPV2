import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  role: 'user' | 'hospital' | 'admin';
}

export function requireAuth(roles?: AuthUser['role'][]){
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if(!header) return res.status(401).json({ error: 'Unauthorized' });
    const token = header.replace('Bearer ', '');
    try{
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret') as AuthUser;
      (req as any).user = payload;
      if(roles && roles.length && !roles.includes(payload.role)){
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    }catch(err){
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}
