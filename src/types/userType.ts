

import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export {userSchema}