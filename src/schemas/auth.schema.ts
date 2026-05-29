import { z } from "zod";


const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(50, "Password must be less than 50 characters")
  .refine((val) => /[a-z]/.test(val), "Must contain lowercase letter (a-z)")
  .refine((val) => /[A-Z]/.test(val), "Must contain uppercase letter (A-Z)")
  .refine((val) => /[0-9]/.test(val), "Must contain number (0-9)")
  .refine((val) => /[@$!%*?&]/.test(val), "Must contain special character (@$!%*?&)")
  .refine((val) => !val.includes(" "), "Password cannot contain spaces");

// Registration schema 
export const registerSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  
  
  email: z.email("Please enter a valid email address"),
  
  password: passwordSchema,
  
  confirmPassword: z.string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login schema
export const loginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterType = z.infer<typeof registerSchema>;
export type LoginType = z.infer<typeof loginSchema>;