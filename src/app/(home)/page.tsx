"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { categoryKey, getCategories } from "@/api/category";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getFilteredProducts, ProductResponse } from "@/api/product";
import AddProductModal from "@/components/add-product-modal";
import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { checkOut, OrderCreateRequest } from "@/api/order";
import { toast } from "sonner";

interface OrderItem extends ProductResponse {
  quantity: number;
}

export default function POSSystem() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: [categoryKey],
    queryFn: async () => await getCategories(),
  });

  const { data: productData } = useQuery({
    queryKey: ["products", selectedCategory, searchTerm],
    queryFn: async () =>
      await getFilteredProducts({
        categoryId: selectedCategory === "all" ? undefined : selectedCategory,
        search: searchTerm || undefined,
      }),
  });

  const filteredProducts = productData?.data || [];

  const { mutate: orderCreateMutate } = useMutation<
    ApiSuccessResponse<boolean>,
    ApiErrorResponse,
    OrderCreateRequest
  >({
    mutationFn: async (params) => await checkOut(params),
    onSuccess: () => {
      toast.success("Tạo đơn hàng thành công!");
      clearOrder();
    },
    onError: (error) =>
      toast.error(error?.response?.data?.message || "Tạo đơn hàng thất bại!"),
  });

  const handleCheckout = () => {
    if (orderItems.length === 0) {
      toast.warning("Vui lòng thêm sản phẩm vào đơn hàng.");
      return;
    }

    const orderPayload: OrderCreateRequest = {
      items: orderItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    orderCreateMutate(orderPayload);
  };

  const addToOrder = (product: ProductResponse) => {
    setOrderItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromOrder = (productId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(productId);
      return;
    }
    setOrderItems((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearOrder = () => {
    setOrderItems([]);
  };

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VNĐ";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-56 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg sm:text-2xl font-bold">POS Bán Hàng</h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-2" />
                Thêm sản phẩm
              </Button>
              <Button
                onClick={clearOrder}
                className="bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm px-2 sm:px-4"
              >
                <Trash2 className="w-4 h-4 mr-1 sm:mr-2" />
                Xóa đơn
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-16 2xl:px-56 py-6">
        <div className="lg:flex lg:gap-6">
          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">
                Sản phẩm
              </h2>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Tất cả danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categoriesData?.data.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 mb-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-3">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                        <Image
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          width={150}
                          height={150}
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-xs mb-2">
                        {product.category.name}
                      </p>
                      <p className="text-red-500 font-semibold text-sm mb-3">
                        {formatPrice(product.price)}
                      </p>
                      <Button
                        onClick={() => addToOrder(product)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-sm"
                        size="sm"
                      >
                        Thêm
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Mobile Order Section - Shows below products on mobile, hidden on desktop */}
              <div className="lg:hidden mt-6">
                <div className="bg-white rounded-lg border shadow-sm p-4">
                  <MobileOrderSection
                    orderItems={orderItems}
                    totalAmount={totalAmount}
                    formatPrice={formatPrice}
                    updateQuantity={updateQuantity}
                    removeFromOrder={removeFromOrder}
                    handleCheckout={handleCheckout}
                  />
                </div>
              </div>
            </div>
          </main>

          {/* Desktop Sidebar - Hidden on mobile */}
          <aside className="hidden lg:block w-80 xl:w-96">
            <div className="bg-white rounded-lg border shadow-sm p-6 sticky top-24">
              <DesktopOrderSidebar
                orderItems={orderItems}
                totalAmount={totalAmount}
                formatPrice={formatPrice}
                updateQuantity={updateQuantity}
                removeFromOrder={removeFromOrder}
                clearOrder={clearOrder}
                handleCheckout={handleCheckout}
              />
            </div>
          </aside>
        </div>
      </div>
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

// Mobile Order Section Component
function MobileOrderSection({
  orderItems,
  totalAmount,
  formatPrice,
  updateQuantity,
  handleCheckout,
}: {
  orderItems: OrderItem[];
  totalAmount: number;
  formatPrice: (price: number) => string;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromOrder: (id: string) => void;
  handleCheckout: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>

      {orderItems.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          Chưa có sản phẩm trong đơn hàng
        </p>
      ) : (
        <div className="space-y-3">
          {orderItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.name}</h4>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8 p-0"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm font-medium min-w-[80px] text-right">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}

          <div className="border-t pt-3 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Tổng:</span>
              <span className="text-lg font-bold">
                {formatPrice(totalAmount)}
              </span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Thanh toán
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Desktop Order Sidebar Component
function DesktopOrderSidebar({
  orderItems,
  totalAmount,
  formatPrice,
  updateQuantity,
  removeFromOrder,
  handleCheckout,
}: {
  orderItems: OrderItem[];
  totalAmount: number;
  formatPrice: (price: number) => string;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromOrder: (id: string) => void;
  clearOrder: () => void;
  handleCheckout: () => void;
}) {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>

      {orderItems.length === 0 ? (
        <div className="text-center py-8">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có sản phẩm trong đơn hàng</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orderItems.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0">
                <Image
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-2">
                  {item.name}
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  {formatPrice(item.price)}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-7 w-7 p-0"
                    >
                      -
                    </Button>
                    <span className="w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-7 w-7 p-0"
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFromOrder(item.id)}
                    className="text-red-500 hover:text-red-700 h-7 w-7 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Tổng cộng:</span>
              <span className="text-red-500">{formatPrice(totalAmount)}</span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              Thanh toán
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
