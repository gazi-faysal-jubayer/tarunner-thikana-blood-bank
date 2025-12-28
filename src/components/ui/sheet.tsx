"use client";

import React, { PropsWithChildren, ReactElement, cloneElement } from "react";

type SheetProps = PropsWithChildren<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>;

export function Sheet({ open = false, onOpenChange, children }: SheetProps) {
  return <div data-sheet-open={open}>{children}</div>;
}

export function SheetTrigger({ children, asChild }: { children: ReactElement; asChild?: boolean }) {
  return cloneElement(children, {
    onClick: (e: any) => {
      if (children.props.onClick) children.props.onClick(e);
    },
  });
}

export function SheetContent({ children, side = "right", className = "" }: any) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={"fixed inset-y-0 right-0 z-50 w-full sm:max-w-[450px] bg-white shadow-lg overflow-auto " + className}
      style={{ transform: "translateZ(0)" }}
    >
      {children}
    </div>
  );
}

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border-b">{children}</div>;
}

export function SheetTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h3 className={"text-lg font-semibold " + className}>{children}</h3>;
}

export default Sheet;
