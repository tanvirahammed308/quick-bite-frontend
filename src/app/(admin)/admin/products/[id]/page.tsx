// app/admin/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/redux/features/product/product.slice";
import type { IProduct, ICreateProductData } from "@/redux/features/product/product.types";
import { productSchema, productCategories, type ProductFormData } from "@/schemas/product.schema";
import Swal from "sweetalert2";
import {
  FaSpinner,
  FaEdit,
  FaTrash,
  FaPlus,
  FaTimes,
  FaUpload,
  FaSave,
  FaEye,
  FaBox,
  FaTag,
  FaMoneyBillWave,
  FaImage,
  FaSearch,
  FaFilter,
  FaChartLine,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { MdCategory, MdDescription } from "react-icons/md";

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAuthGuard(true);
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.product);

  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "Pizza",
      stock: 0,
    },
  });

  const watchedValues = watch();

  // Fetch products on load
  useEffect(() => {
    if (user) {
      dispatch(getAllProducts());
    }
  }, [dispatch, user]);

  // Reset form
  const resetForm = () => {
    reset({
      name: "",
      description: "",
      price: 0,
      category: "Pizza",
      stock: 0,
    });
    setImagePreview("");
    setImageFile(null);
    setEditingProduct(null);
  };

  // Open create form
  const handleOpenCreate = () => {
    resetForm();
    setEditingProduct(null);
    setSelectedProduct(null);
    setShowForm(true);
  };

  // Open edit product
  const handleOpenEdit = (product: IProduct) => {
    setEditingProduct(product);
    setValue("name", product.name);
    setValue("description", product.description);
    setValue("price", product.price);
    setValue("category", product.category);
    setValue("stock", product.stock);
    setImagePreview(product.image);
    setImageFile(null);
    setSelectedProduct(null);
    setShowForm(true);
  };

  // Select product to view details
  const handleSelectProduct = (product: IProduct) => {
    setSelectedProduct(product);
    setShowForm(false);
    resetForm();
    setEditingProduct(null);
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Image must be less than 5MB",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Invalid File",
          text: "Please select an image file",
        });
        return;
      }

      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  // Handle form submit
  const onSubmit = async (data: ProductFormData) => {
    // Validation
    if (!data.name?.trim()) {
      Swal.fire({ icon: "error", title: "Error", text: "Product name is required" });
      return;
    }

    if (!data.description?.trim()) {
      Swal.fire({ icon: "error", title: "Error", text: "Product description is required" });
      return;
    }

    if (!data.price || data.price <= 0) {
      Swal.fire({ icon: "error", title: "Error", text: "Valid price is required" });
      return;
    }

    if (!data.category) {
      Swal.fire({ icon: "error", title: "Error", text: "Please select a category" });
      return;
    }

    if (data.stock === undefined || data.stock < 0) {
      Swal.fire({ icon: "error", title: "Error", text: "Valid stock quantity is required" });
      return;
    }

    if (!editingProduct && !imageFile) {
      Swal.fire({ icon: "error", title: "Error", text: "Please select a product image" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API
      const productData: ICreateProductData = {
        name: data.name.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        category: data.category,
        stock: Number(data.stock),
        image: imageFile || undefined,
      };

      if (editingProduct) {
        await dispatch(updateProduct({ id: editingProduct._id, data: productData })).unwrap();

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Product updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await dispatch(createProduct(productData)).unwrap();

        Swal.fire({
          icon: "success",
          title: "Created!",
          text: "Product created successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      resetForm();
      setShowForm(false);
      dispatch(getAllProducts());
    } catch (error) {
      console.error("Product save error:", error);
      const message = typeof error === "string" ? error : "Something went wrong";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete product
  const handleDelete = async (product: IProduct) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: `Are you sure you want to delete "${product.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteProduct(product._id)).unwrap();
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Product deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        if (selectedProduct?._id === product._id) {
          setSelectedProduct(null);
        }
        dispatch(getAllProducts());
      } catch (error) {
        console.error("Delete product error:", error);
        const message = typeof error === "string" ? error : "Failed to delete product";
        Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get low stock count
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-red-600">Product Management</h1>
            <p className="text-gray-500 mt-1">Manage your store inventory</p>
          </div>
          {!showForm && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <FaPlus />
              Add New Product
            </button>
          )}
          {showForm && (
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all"
            >
              <FaArrowLeft />
              Back to Products
            </button>
          )}
        </div>

        {!showForm ? (
          // Product List View
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaFilter className="text-red-600" />
                  Filters
                </h2>

                {/* Search */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">All Categories</option>
                    {productCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stats */}
                <div className="pt-4 border-t border-red-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaChartLine className="text-red-600" />
                    Statistics
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Products:</span>
                      <span className="font-semibold text-gray-800">{filteredProducts.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Categories:</span>
                      <span className="font-semibold text-gray-800">{productCategories.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Low Stock (&lt;10):</span>
                      <span className="font-semibold text-red-600">{lowStockCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Out of Stock:</span>
                      <span className="font-semibold text-red-600">{outOfStockCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-12 text-center">
                  <FaBox className="text-6xl text-red-200 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No products found</p>
                  <button
                    onClick={handleOpenCreate}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(product);
                            }}
                            className="p-2 bg-white/90 hover:bg-white rounded-full text-red-600 transition"
                            title="Edit"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product);
                            }}
                            className="p-2 bg-white/90 hover:bg-white rounded-full text-red-600 transition"
                            title="Delete"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                        {product.stock === 0 && (
                          <div className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                            Out of Stock
                          </div>
                        )}
                        {product.stock > 0 && product.stock < 10 && (
                          <div className="absolute bottom-2 left-2 bg-red-400 text-white text-xs px-2 py-1 rounded-full">
                            Low Stock: {product.stock}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                              {product.description}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 bg-red-50 rounded-full text-red-700 ml-2 flex-shrink-0">
                            {product.category}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-red-100">
                          <div>
                            <span className="text-2xl font-bold text-red-600">₹{product.price}</span>
                            <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectProduct(product);
                            }}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            View Details <FaArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Product Form View
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingProduct ? "Edit Product" : "Create New Product"}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {editingProduct
                    ? "Update product information"
                    : "Fill in the details to add a new product"}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Product Name */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
                    <FaTag className="text-red-500" />
                    Product Name *
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
                    <MdDescription className="text-red-500" />
                    Description *
                  </label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter product description"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Price and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
                      <FaMoneyBillWave className="text-red-500" />
                      Price (₹) *
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
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
                      <MdCategory className="text-red-500" />
                      Category *
                    </label>
                    <select
                      {...register("category")}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                        errors.category ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Category</option>
                      {productCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
                    <FaBox className="text-red-500" />
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    {...register("stock", { valueAsNumber: true })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                      errors.stock ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0"
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
                  )}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
                    <FaImage className="text-red-500" />
                    Product Image
                  </label>
                  <div className="border-2 border-dashed border-red-200 rounded-lg p-6 text-center hover:border-red-500 transition">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={300}
                          height={192}
                          className="max-h-48 w-auto rounded-lg shadow-md object-cover"
                          unoptimized={imagePreview.startsWith("blob:")}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setImageFile(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <FaUpload className="mx-auto text-4xl text-red-300 mb-2" />
                        <p className="text-gray-500">Click to upload product image</p>
                        <p className="text-gray-400 text-sm mt-1">PNG, JPG, GIF up to 5MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {!editingProduct && !imagePreview && (
                    <p className="text-sm text-red-500 mt-1">* Image is required for new products</p>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {isSubmitting ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaEye className="text-red-600" />
                  Live Preview
                </h2>
                <p className="text-gray-500 text-sm">See how your product will appear</p>
              </div>

              <div className="bg-white rounded-xl border border-red-100 p-4">
                <div className="relative h-48 rounded-xl overflow-hidden bg-red-50 mb-4">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt={watchedValues.name || "Preview"}
                      fill
                      className="object-cover"
                      unoptimized={imagePreview.startsWith("blob:")}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-red-200">
                      <FaImage className="text-5xl" />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {watchedValues.name || "Product Name"}
                    </h3>
                    {watchedValues.category && (
                      <span className="inline-block mt-1 text-xs px-2 py-1 bg-red-50 rounded-full text-red-700">
                        {watchedValues.category}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm">
                    {watchedValues.description || "Product description will appear here"}
                  </p>

                  <div className="pt-3 border-t border-red-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-red-600">
                          ₹{watchedValues.price.toLocaleString()}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          watchedValues.stock > 0
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {watchedValues.stock > 0 ? `In Stock (${watchedValues.stock})` : "Out of Stock"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 bg-red-50 rounded-xl p-4">
                <h4 className="font-semibold text-red-800 mb-2">Inventory Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-600">Total Products:</span>
                    <span className="font-semibold">{products.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Categories:</span>
                    <span className="font-semibold">{productCategories.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Low Stock (&lt;10):</span>
                    <span className="font-semibold">{lowStockCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Out of Stock:</span>
                    <span className="font-semibold">{outOfStockCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}