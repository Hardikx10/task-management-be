import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: { id: string };
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;
