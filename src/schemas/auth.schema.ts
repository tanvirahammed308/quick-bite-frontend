
import { z } from "zod";


const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Registration schema with strong password validation
export const registerSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  
  email: z.string()
    .email("Please enter a valid email address"),
  
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password must be less than 50 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[@$!%*?&]/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
    .refine((val) => !val.includes(" "), "Password cannot contain spaces"),
  
  confirmPassword: z.string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login schema 
export const loginSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address"),
  
  password: z.string()
    .min(1, "Password is required"),
});

// Types
export type RegisterType = z.infer<typeof registerSchema>;
export type LoginType = z.infer<typeof loginSchema>;