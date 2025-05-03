import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

// Frontend-specific schema that extends registerSchema
export const registerFormSchema = registerSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  mfaEnabled: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type User = z.infer<typeof userSchema>; 