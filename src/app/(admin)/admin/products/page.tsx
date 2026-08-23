// app/admin/products/page.tsx (Main Page)
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct
} from "@/redux/features/product/product.slice";
import type { IProduct, ICreateProductData } from "@/redux/features/product/product.types";
import { type ProductFormData } from "@/schemas/product.schema";
import Swal from "sweetalert2";
import { FaSpinner, FaPlus, FaArrowLeft, FaBox } from "react-icons/fa";

// Components

import FiltersSidebar from "@/components/admin/product/FiltersSidebar";
import ProductCard from "@/components/admin/product/ProductCard";
import Pagination from "@/components/admin/product/Pagination";
import ProductForm from "@/components/admin/product/ProductForm";
import LivePreview from "@/components/admin/product/LivePreview";
import ProductDetailsModal from "@/components/admin/product/ProductDetailsModal";



const ITEMS_PER_PAGE = 6;

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAuthGuard(true);
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((state) => state.product);
  
  // State
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  

  // Fetch products
  useEffect(() => {
    if (user) {
      dispatch(getAllProducts());
    }
  }, [dispatch, user]);

  // Update pagination
  const filteredProducts = useMemo(() => {
  return products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });
}, [products, searchTerm, selectedCategory]);

const totalPages = Math.max(
  1,
  Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
);

  const getPaginatedProducts = () => {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  return filteredProducts.slice(startIndex, endIndex);
};

  const goToPage = (page: number) => {
  setCurrentPage(page);
};

  const resetForm = () => {
    setEditingProduct(null);
    setImagePreview("");
    setImageFile(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setSelectedProduct(null);
    setShowForm(true);
    setShowDetailsModal(false);
  };

  const handleOpenEdit = (product: IProduct) => {
    setEditingProduct(product);
    setImagePreview(product.image);
    setImageFile(null);
    setSelectedProduct(null);
    setShowForm(true);
    setShowDetailsModal(false);
  };

  const handleViewDetails = (product: IProduct) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
    setShowForm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({ icon: "error", title: "File Too Large", text: "Image must be less than 5MB" });
        return;
      }
      if (!file.type.startsWith("image/")) {
        Swal.fire({ icon: "error", title: "Invalid File", text: "Please select an image file" });
        return;
      }
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setImageFile(null);
  };

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
        Swal.fire({ icon: "success", title: "Updated!", text: "Product updated successfully", timer: 1500, showConfirmButton: false });
      } else {
        await dispatch(createProduct(productData)).unwrap();
        Swal.fire({ icon: "success", title: "Created!", text: "Product created successfully", timer: 1500, showConfirmButton: false });
      }
      
      resetForm();
      setShowForm(false);
      dispatch(getAllProducts());
    } catch (error: unknown) {
      Swal.fire({ icon: "error", title: "Error", text: (error as Error).message || "Something went wrong", confirmButtonColor: "#d33" });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        Swal.fire({ icon: "success", title: "Deleted!", text: "Product deleted successfully", timer: 1500, showConfirmButton: false });
        if (selectedProduct?._id === product._id) {
          setSelectedProduct(null);
          setShowDetailsModal(false);
        }
        dispatch(getAllProducts());
      } catch (error: unknown) {
        Swal.fire({ icon: "error", title: "Error", text: (error as Error).message || "Failed to delete product", confirmButtonColor: "#d33" });
      }
    }
  };

  
  const paginatedProducts = getPaginatedProducts();
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const watchedValues = { name: "", description: "", price: 0, category: "", stock: 0 };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-red-600 mx-auto mb-4" />
          <p className="text-red-800 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-red-700">Product Management</h1>
            <p className="text-red-600 mt-1">Manage your store inventory</p>
          </div>
          {!showForm && !showDetailsModal && (
            <button 
              onClick={handleOpenCreate} 
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <FaPlus className="text-white" /> 
              <span>Add New Product</span>
            </button>
          )}
          {(showForm || showDetailsModal) && (
            <button 
              onClick={() => { setShowForm(false); setShowDetailsModal(false); resetForm(); }} 
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all"
            >
              <FaArrowLeft /> Back to Products
            </button>
          )}
        </div>

        {!showForm && !showDetailsModal ? (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <FiltersSidebar
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              filteredProductsLength={filteredProducts.length}
              lowStockCount={lowStockCount}
              outOfStockCount={outOfStockCount}
              onSearchChange={setSearchTerm}
              onCategoryChange={setSelectedCategory}
            />

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No products found</p>
                  <button 
                    onClick={handleOpenCreate} 
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                        onView={handleViewDetails}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                  />
                  
                  <div className="text-center mt-4 text-sm text-red-600">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of{" "}
                    {filteredProducts.length} products
                  </div>
                </>
              )}
            </div>
          </div>
        ) : showForm ? (
          // Product Form with Live Preview
          <div className="grid lg:grid-cols-2 gap-8">
            <ProductForm
              editingProduct={editingProduct}
              imagePreview={imagePreview}
              imageFile={imageFile}
              isSubmitting={isSubmitting}
              onSubmit={onSubmit}
              onCancel={() => { setShowForm(false); resetForm(); }}
              onImageChange={handleImageChange}
              onRemoveImage={handleRemoveImage}
            />

            <LivePreview
              name={editingProduct?.name || ""}
              description={editingProduct?.description || ""}
              price={editingProduct?.price || 0}
              category={editingProduct?.category || ""}
              stock={editingProduct?.stock || 0}
              imagePreview={imagePreview}
            />
          </div>
        ) : showDetailsModal && selectedProduct && (
          // Product Details Modal
          <ProductDetailsModal
            product={selectedProduct}
            onClose={() => setShowDetailsModal(false)}
            onEdit={() => {
              setShowDetailsModal(false);
              handleOpenEdit(selectedProduct);
            }}
            onDelete={() => handleDelete(selectedProduct)}
          />
        )}
      </div>
    </div>
  );
}