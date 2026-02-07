import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(10)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message: 'Password must include upper, lower, number, and symbol',
  });

export const updatePasswordSchema = z.object({
  passwordCurrent: z.string().min(10).optional(),
  password: passwordSchema,
  passwordConfirm: passwordSchema,
}).refine((data) => data.password === data.passwordConfirm, {
  path: ['passwordConfirm'],
  message: 'Passwords do not match',
});

export type UpdatePasswordDto = z.infer<typeof updatePasswordSchema>;
