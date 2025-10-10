"use client";

import { Footer } from "@/components/layout/footer";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();

  return (
    <>
      {children}
      {!path.startsWith("/admin") && <Footer />}

      <Toaster position="top-right" duration={2500} />
    </>
  );
}
