"use client";

import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRouter } from "next/navigation";
import React from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0, // 0 means never refetch
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export const Provider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider navigate={router.push}>{children}</HeroUIProvider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-right" />
    </QueryClientProvider>
  );
};
