import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        blood:
          "border-transparent bg-blood-600 text-white hover:bg-blood-700",
        critical:
          "border-transparent bg-urgency-critical text-white animate-pulse",
        urgent:
          "border-transparent bg-urgency-urgent text-white",
        normal:
          "border-transparent bg-urgency-normal text-white",
        "A+": "border-transparent bg-red-600 text-white",
        "A-": "border-transparent bg-red-500 text-white",
        "B+": "border-transparent bg-blue-600 text-white",
        "B-": "border-transparent bg-blue-500 text-white",
        "AB+": "border-transparent bg-purple-600 text-white",
        "AB-": "border-transparent bg-purple-500 text-white",
        "O+": "border-transparent bg-green-600 text-white",
        "O-": "border-transparent bg-green-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };


