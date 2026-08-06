// CART BUTTON
//       {showCart && cartItemCount > 0 && (
//         <button
//           onClick={() => setShowCartSidebar(true)}
//           className="fixed bottom-6 right-6 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition flex items-center gap-2 z-40"
//         >
//           <FiShoppingCart size={20} />
//           <span className="bg-white text-red-600 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
//             {cartItemCount}
//           </span>
//         </button>
//       )}

//       {/* CART SIDEBAR */}
//       {showCartSidebar && (
//         <>
//           <div
//             className="fixed inset-0 bg-black/50 z-50"
//             onClick={() => setShowCartSidebar(false)}
//           />

//           <div className="fixed right-0 top-0 w-full sm:w-96 h-full bg-white shadow-2xl z-50 flex flex-col">
//             {/* Header */}
//             <div className="p-4 border-b flex justify-between items-center bg-red-600 text-white rounded-tl-2xl">
//               <h2 className="text-xl font-bold flex items-center gap-2">
//                 <FiShoppingCart />
//                 Your Cart ({cartItemCount})
//               </h2>
//               <button
//                 onClick={() => setShowCartSidebar(false)}
//                 className="p-1 hover:bg-white/20 rounded-lg transition"
//               >
//                 <FiX size={24} />
//               </button>
//             </div>

//             {/* Cart Items */}
//             <div className="flex-1 overflow-y-auto p-4 space-y-3">
//               {!cart || cart.items.length === 0 ? (
//                 <div className="text-center py-12">
//                   <div className="text-6xl mb-4">🛒</div>
//                   <p className="text-gray-500">Your cart is empty</p>
//                   <button
//                     onClick={() => setShowCartSidebar(false)}
//                     className="mt-4 text-red-600 hover:underline"
//                   >
//                     Continue Shopping
//                   </button>
//                 </div>
//               ) : (
//                 cart.items.map((item: ICartItem) => (
//                   <div key={item.product} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
//                     <img
//                       src={item.image}
//                       alt={item.name}
//                       className="w-16 h-16 rounded-lg object-cover"
//                     />
//                     <div className="flex-1">
//                       <h4 className="font-semibold text-gray-800">{item.name}</h4>
//                       <p className="text-red-600 font-bold text-sm">
//                         ${item.price.toFixed(2)}
//                       </p>
//                       <div className="flex items-center gap-3 mt-1">
//                         <button
//                           onClick={() => handleUpdateCartQuantity(item.product, item.quantity - 1)}
//                           disabled={updatingItems[item.product]}
//                           className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
//                         >
//                           <FaMinus size={10} />
//                         </button>
//                         <span className="text-sm font-medium">
//                           {updatingItems[item.product] ? (
//                             <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
//                           ) : (
//                             item.quantity
//                           )}
//                         </span>
//                         <button
//                           onClick={() => handleUpdateCartQuantity(item.product, item.quantity + 1)}
//                           disabled={updatingItems[item.product]}
//                           className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
//                         >
//                           <FaPlus size={10} />
//                         </button>
//                         <button
//                           onClick={() => handleRemoveFromCart(item.product)}
//                           className="text-red-500 text-xs hover:underline ml-auto"
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>

//             {/* Footer */}
//             {cart && cart.items.length > 0 && (
//               <div className="p-4 border-t bg-gray-50">
//                 <div className="flex justify-between mb-3">
//                   <span className="font-semibold">Subtotal:</span>
//                   <span className="font-bold text-red-600">${cartTotal.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between text-sm text-gray-500 mb-4">
//                   <span>Delivery Fee:</span>
//                   <span>Free</span>
//                 </div>
//                 <button
//                   onClick={() => router.push("/checkout")}
//                   className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
//                 >
//                   Proceed to Checkout
//                 </button>
//                 <button
//                   onClick={handleClearCart}
//                   className="w-full mt-2 text-red-600 text-sm hover:underline"
//                 >
//                   Clear Cart
//                 </button>
//               </div>
//             )}
//           </div>
//         </>
//       )}