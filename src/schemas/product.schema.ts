// // src/schemas/product.schema.ts
// import { z } from "zod";

// // Product validation schema
// export const productSchema = z.object({
//   name: z.string()
//     .min(2, "Name must be at least 2 characters")
//     .max(100, "Name must be less than 100 characters")
//     .trim(),
  
//   description: z.string()
//     .min(10, "Description must be at least 10 characters")
//     .max(500, "Description must be less than 500 characters")
//     .trim(),
  
//   price: z.number()
//     .min(0, "Price must be a positive number")
//     .max(999999, "Price must be less than 999999"),
  
//   category: z.string()
//     .min(1, "Please select a category"),
  
//   stock: z.number()
//     .int("Stock must be a whole number")
//     .min(0, "Stock must be a positive number")
//     .max(99999, "Stock must be less than 99999"),
  
//   image: z.any().optional(),
// });

// // Product categories enum
// export const productCategories = [
//   "Pizza",
//   "Burger", 
//   "Biryani",
//   "Pasta",
//   "Dessert",
//   "Beverage",
  
// ] as const;

// export type ProductCategory = typeof productCategories[number];

// // Product types
// export type ProductFormData = z.infer<typeof productSchema>;

// // Update product schema (all fields optional)
// export const updateProductSchema = productSchema.partial();

// export type UpdateProductFormData = z.infer<typeof updateProductSchema>;

// // Product filter schema
// export const productFilterSchema = z.object({
//   search: z.string().optional(),
//   category: z.enum(productCategories).optional(),
//   minPrice: z.number().min(0).optional(),
//   maxPrice: z.number().min(0).optional(),
//   inStock: z.boolean().optional(),
//   sortBy: z.enum(["name", "price", "createdAt", "stock"]).optional(),
//   sortOrder: z.enum(["asc", "desc"]).optional(),
//   page: z.number().int().min(1).default(1),
//   limit: z.number().int().min(1).max(100).default(10),
// });

// export type ProductFilterData = z.infer<typeof productFilterSchema>;

import { z } from "zod";

export const productCategories = [
  "Pizza",
  "Burger",
  "Biryani",
  "Pasta",
  "Dessert",
  "Beverage",
] as const;

export const productSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),

  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .trim(),

  price: z.number()
    .min(0, "Price must be a positive number")
    .max(999999, "Price must be less than 999999"),

  category: z.enum(productCategories),

  stock: z.number()
    .int("Stock must be a whole number")
    .min(0, "Stock must be a positive number")
    .max(99999, "Stock must be less than 99999"),

  image: z.any().optional(),
});


export type ProductCategory = typeof productCategories[number];

export type ProductFormData = z.infer<typeof productSchema>;

export const updateProductSchema = productSchema.partial();

export type UpdateProductFormData = z.infer<typeof updateProductSchema>;