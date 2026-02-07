import { z } from 'zod';
import { Role } from '../../common/enums';

const passwordSchema = z
  .string()
  .min(10)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: 'Password must include upper, lower, number, and symbol',
  });

export const registerSchema = z.object({
  name: z.string().min(1),
  surname: z.string().min(1),
  email: z.string().email(),
  rzaNumber: z.string().min(1),
  role: z.nativeEnum(Role).optional(),
  password: passwordSchema,
});

export type RegisterDto = z.infer<typeof registerSchema>;
