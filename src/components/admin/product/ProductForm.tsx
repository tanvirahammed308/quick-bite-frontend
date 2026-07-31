// components/admin/products/ProductForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, productCategories, type ProductFormData } from "@/schemas/product.schema";
import { FaSpinner, FaTag, FaSave, FaTimes, FaUpload, FaMoneyBillWave, FaBox, FaImage } from "react-icons/fa";
import { MdCategory, MdDescription } from "react-icons/md";
import { IProduct } from "@/redux/features/product/product.types";
import { useEffect } from "react";

interface ProductFormProps {
  editingProduct: IProduct | null;
  imagePreview: string;
  imageFile: File | null;
  isSubmitting: boolean;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export default function ProductForm({
  editingProduct,
  imagePreview,
  imageFile,
  isSubmitting,
  onSubmit,
  onCancel,
  onImageChange,
  onRemoveImage
}: ProductFormProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "Pizza",
      stock: 0,
    }
  });

  useEffect(() => {
    if (editingProduct) {
      setValue("name", editingProduct.name);
      setValue("description", editingProduct.description);
      setValue("price", editingProduct.price);
      setValue("category", editingProduct.category);
      setValue("stock", editingProduct.stock);
    }
  }, [editingProduct, setValue]);

  useEffect(() => {
    if (!editingProduct) {
      reset();
    }
  }, [editingProduct, reset]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {editingProduct ? "Edit Product" : "Create New Product"}
        </h2>
        <p className="text-red-600 text-sm mt-1">
          {editingProduct ? "Update product information" : "Fill in the details to add a new product"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
            <FaTag className="text-red-600" /> Product Name *
          </label>
          <input
            type="text"
            {...register("name")}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter product name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
            <MdDescription className="text-red-600" /> Description *
          </label>
          <textarea
            {...register("description")}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter product description"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
              <FaMoneyBillWave className="text-red-600" /> Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                errors.price ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
              <MdCategory className="text-red-600" /> Category *
            </label>
            <select
              {...register("category")}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Category</option>
              {productCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
            <FaBox className="text-red-600" /> Stock Quantity *
          </label>
          <input
            type="number"
            {...register("stock", { valueAsNumber: true })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
              errors.stock ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="0"
          />
          {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
            <FaImage className="text-red-600" /> Product Image
          </label>
          <div className="border-2 border-dashed border-red-300 rounded-lg p-6 text-center hover:border-red-500 transition">
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg shadow-md" />
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <FaUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                <p className="text-gray-500">Click to upload product image</p>
                <p className="text-red-400 text-sm mt-1">PNG, JPG, GIF up to 5MB</p>
                <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
              </label>
            )}
          </div>
          {!editingProduct && !imagePreview && (
            <p className="text-sm text-red-500 mt-1">* Image is required for new products</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {isSubmitting ? "Saving..." : (editingProduct ? "Update Product" : "Create Product")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-red-300 rounded-lg font-semibold hover:bg-red-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}