import { Nunito_Sans } from "next/font/google";
import "@/styles/globals.css";
import { Provider } from "@/components/provider";
import { Toaster } from "sonner";

const font = Nunito_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className} bg-[#F0F0F0]`}>
        <Provider>{children}</Provider>
        <Toaster
          closeButton
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
}
