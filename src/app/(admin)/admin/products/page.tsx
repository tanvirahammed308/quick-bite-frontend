// app/admin/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct
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
  FaClipboardList,
  FaImage,
  FaSearch,
  FaFilter,
  FaChartLine,
  FaArrowLeft,
  FaArrowRight,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight
} from "react-icons/fa";
import { MdCategory, MdDescription } from "react-icons/md";

const ITEMS_PER_PAGE = 6; // Always 6 items per page

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "Pizza",
      stock: 0,
    }
  });

  const watchedValues = watch();

  // Fetch products on load
  useEffect(() => {
    if (user) {
      dispatch(getAllProducts());
    }
  }, [dispatch, user]);

  // Update total pages when products change
  useEffect(() => {
    const filtered = getFilteredProducts();
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [products, searchTerm, selectedCategory]);

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

  // Get filtered products
  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  // Get paginated products
  const getPaginatedProducts = () => {
    const filtered = getFilteredProducts();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPrevPage = () => goToPage(currentPage - 1);

  // Get page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Open create form
  const handleOpenCreate = () => {
    resetForm();
    setEditingProduct(null);
    setSelectedProduct(null);
    setShowForm(true);
    setShowDetailsModal(false);
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
    setShowDetailsModal(false);
  };

  // View product details in modal
  const handleViewDetails = (product: IProduct) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
    setShowForm(false);
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Image must be less than 5MB",
        });
        return;
      }
      
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
      
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error || "Something went wrong",
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
          setShowDetailsModal(false);
        }
        dispatch(getAllProducts());
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error || "Failed to delete product",
          confirmButtonColor: "#d33",
        });
      }
    }
  };

  const filteredProducts = getFilteredProducts();
  const paginatedProducts = getPaginatedProducts();
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Product Management
            </h1>
            <p className="text-gray-500 mt-1">Manage your store inventory</p>
          </div>
          {!showForm && !showDetailsModal && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <FaPlus />
              Add New Product
            </button>
          )}
          {(showForm || showDetailsModal) && (
            <button
              onClick={() => {
                setShowForm(false);
                setShowDetailsModal(false);
                resetForm();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all"
            >
              <FaArrowLeft />
              Back to Products
            </button>
          )}
        </div>

        {!showForm && !showDetailsModal ? (
          // Product List View
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaFilter className="text-blue-600" />
                  Filters
                </h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {productCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaChartLine className="text-green-500" />
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
                      <span className="font-semibold text-orange-600">{lowStockCount}</span>
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
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No products found</p>
                  <button
                    onClick={handleOpenCreate}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedProducts.map((product) => (
                      <div
                        key={product._id}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="p-2 bg-white/90 hover:bg-white rounded-full text-green-600 transition"
                              title="Edit"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-2 bg-white/90 hover:bg-white rounded-full text-red-600 transition"
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                          {product.stock === 0 && (
                            <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              Out of Stock
                            </div>
                          )}
                          {product.stock > 0 && product.stock < 10 && (
                            <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                              Low Stock: {product.stock}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">{product.name}</h3>
                              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600 ml-2 flex-shrink-0">
                              {product.category}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-3 border-t">
                            <div>
                              <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                              <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                            </div>
                            <button
                              onClick={() => handleViewDetails(product)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              <FaEye size={14} />
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Section */}
                  {totalPages > 1 && (
                    <div className="mt-8">
                      <div className="flex justify-center items-center gap-2 flex-wrap">
                        {/* First Page Button */}
                        <button
                          onClick={goToFirstPage}
                          disabled={currentPage === 1}
                          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <FaAngleDoubleLeft className="text-gray-600" />
                          <span className="hidden sm:inline">First</span>
                        </button>
                        
                        {/* Previous Page Button */}
                        <button
                          onClick={goToPrevPage}
                          disabled={currentPage === 1}
                          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <FaChevronLeft className="text-gray-600" />
                          <span className="hidden sm:inline">Prev</span>
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex gap-1">
                          {getPageNumbers().map((page) => (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={`min-w-[40px] h-10 px-3 py-2 rounded-lg font-medium transition ${
                                currentPage === page
                                  ? "bg-blue-600 text-white shadow-md"
                                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        
                        {/* Next Page Button */}
                        <button
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <FaChevronRight className="text-gray-600" />
                        </button>
                        
                        {/* Last Page Button */}
                        <button
                          onClick={goToLastPage}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <span className="hidden sm:inline">Last</span>
                          <FaAngleDoubleRight className="text-gray-600" />
                        </button>
                      </div>
                      
                      {/* Pagination Info */}
                      <div className="text-center mt-4 text-sm text-gray-500">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : showForm ? (
          // Product Form View
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingProduct ? "Edit Product" : "Create New Product"}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {editingProduct ? "Update product information" : "Fill in the details to add a new product"}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
                    <FaTag className="text-blue-500" />
                    Product Name *
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
                    <MdDescription className="text-blue-500" />
                    Description *
                  </label>
                  <textarea
                    {...register("description")}
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter product description"
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
                      <FaMoneyBillWave className="text-green-500" />
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("price", { valueAsNumber: true })}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        errors.price ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="0.00"
                    />
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
                      <MdCategory className="text-purple-500" />
                      Category *
                    </label>
                    <select
                      {...register("category")}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
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
                    <FaBox className="text-orange-500" />
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    {...register("stock", { valueAsNumber: true })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors.stock ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0"
                  />
                  {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1 flex items-center gap-2">
                    <FaImage className="text-pink-500" />
                    Product Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg shadow-md" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("");
                            setImageFile(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <FaUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                        <p className="text-gray-500">Click to upload product image</p>
                        <p className="text-gray-400 text-sm mt-1">PNG, JPG, GIF up to 5MB</p>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
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
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {isSubmitting ? "Saving..." : (editingProduct ? "Update Product" : "Create Product")}
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
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaEye className="text-blue-600" />
                  Live Preview
                </h2>
                <p className="text-gray-500 text-sm">See how your product will appear</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4">
                <div className="relative h-48 rounded-xl overflow-hidden bg-gray-100 mb-4">
                  {imagePreview ? (
                    <img src={imagePreview} alt={watchedValues.name || "Preview"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <FaImage className="text-5xl" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{watchedValues.name || "Product Name"}</h3>
                    {watchedValues.category && (
                      <span className="inline-block mt-1 text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        {watchedValues.category}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{watchedValues.description || "Product description will appear here"}</p>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold text-blue-600">${watchedValues.price.toLocaleString()}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        watchedValues.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {watchedValues.stock > 0 ? `In Stock (${watchedValues.stock})` : "Out of Stock"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : showDetailsModal && selectedProduct && (
          // Product Details Modal View
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-6">
              <div>
                <div className="relative h-96 rounded-xl overflow-hidden bg-gray-100">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <span className="text-sm text-blue-600 font-medium mb-2 inline-block">{selectedProduct.category}</span>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedProduct.name}</h2>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-500 text-sm" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">(0 reviews)</span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-blue-600">${selectedProduct.price}</span>
                  {selectedProduct.stock > 0 ? (
                    <span className="ml-3 text-sm text-green-600">In Stock ({selectedProduct.stock} items)</span>
                  ) : (
                    <span className="ml-3 text-sm text-red-600">Out of Stock</span>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Product ID:</span>
                    <span className="font-mono text-sm">{selectedProduct._id}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Category:</span>
                    <span>{selectedProduct.category}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Stock Status:</span>
                    <span className={selectedProduct.stock > 0 ? "text-green-600" : "text-red-600"}>
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} items available` : "Out of Stock"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Added on:</span>
                    <span>{new Date(selectedProduct.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleOpenEdit(selectedProduct)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <FaEdit />
                    Edit Product
                  </button>
                  <button
                    onClick={() => handleDelete(selectedProduct)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2"
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}