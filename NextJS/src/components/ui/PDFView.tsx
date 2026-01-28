"use client";
import { cn } from "@/lib/utils";
import { PDFViewer, DocumentProps } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { ReactElement, useState, useEffect } from "react";

const DynamicPDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false },
);

interface PDFViewProps {
  document: ReactElement<DocumentProps>;
  className?: string;
}

export default function PDFView({ document, className }: PDFViewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div
        className={`${className} bg-muted animate-pulse flex items-center justify-center rounded-lg`}
      >
        <p className="text-muted-foreground text-sm">
          Cargando visor de reporte...
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <DynamicPDFViewer className={cn(className)} showToolbar={true}>
        {document}
      </DynamicPDFViewer>
    </div>
  );
}
