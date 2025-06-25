"use client";

import type React from "react";

import { useState } from "react";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryKey, getCategories } from "@/api/category";
import { ApiErrorResponse, ApiSuccessResponse } from "@/lib/http";
import { createProduct, ProductResponse } from "@/api/product";
import { toast } from "sonner";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductData {
  Name: string;
  Price: string;
  CategoryId: string;
  ImageUrl: File | null;
}

export default function AddProductModal({
  isOpen,
  onClose,
}: AddProductModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ProductData>({
    Name: "",
    Price: "",
    CategoryId: "",
    ImageUrl: null,
  });

  const { data: categoriesData } = useQuery({
    queryKey: [categoryKey],
    queryFn: async () => await getCategories(),
  });

  const { mutate: productCreateMutate, isPending: productCreateIsLoading } =
    useMutation<
      ApiSuccessResponse<ProductResponse>,
      ApiErrorResponse,
      FormData
    >({
      mutationFn: async (params) => await createProduct(params),
      onSuccess: () => {
        toast.success("Thêm sản phẩm thành công!");
        queryClient.invalidateQueries({ queryKey: ["products"] }); // Nếu bạn có danh sách sản phẩm
        onClose();
        setFormData({ Name: "", Price: "", CategoryId: "", ImageUrl: null });
      },
      onError: (error) =>
        toast.error(error?.response?.data?.message || "Lỗi khi thêm sản phẩm"),
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();
    form.append("Name", formData.Name);
    form.append("Price", formData.Price);
    form.append("CategoryId", formData.CategoryId);
    if (formData.ImageUrl) form.append("ImageUrl", formData.ImageUrl);

    productCreateMutate(form);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, image: file }));
  };

  console.log(handleFileChange);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-none flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Thêm sản phẩm mới
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label
              htmlFor="productName"
              className="text-sm font-medium text-gray-700"
            >
              Tên sản phẩm
            </Label>
            <Input
              id="productName"
              type="text"
              placeholder="Nhập tên sản phẩm"
              value={formData.Name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, Name: e.target.value }))
              }
              className="w-full"
              required
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label
              htmlFor="productPrice"
              className="text-sm font-medium text-gray-700"
            >
              Giá (VND)
            </Label>
            <Input
              id="productPrice"
              type="text"
              placeholder="Nhập giá sản phẩm"
              value={formData.Price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, Price: e.target.value }))
              }
              className="w-full"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label
              htmlFor="productCategory"
              className="text-sm font-medium text-gray-700"
            >
              Danh mục
            </Label>
            <Select
              value={formData.CategoryId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, CategoryId: value }))
              }
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categoriesData?.data?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label
              htmlFor="productImage"
              className="text-sm font-medium text-gray-700"
            >
              Hình ảnh
            </Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="productImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => {
                  // This would typically open camera functionality
                  console.log("Open camera");
                }}
              >
                <Camera className="w-4 h-4 mr-1" />
                Chụp ảnh
              </Button>
            </div>
            {formData.ImageUrl && (
              <p className="text-sm text-gray-600">
                Đã chọn: {formData.ImageUrl.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={productCreateIsLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 mt-4"
          >
            {productCreateIsLoading ? "Đang xử lý..." : "Thêm sản phẩm"}
          </Button>
        </form>
      </div>
    </div>
  );
}
