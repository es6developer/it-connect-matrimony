import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

const SkeletonCircle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("animate-pulse rounded-full bg-muted", className)}
    {...props}
  />
));
SkeletonCircle.displayName = "SkeletonCircle";

const SkeletonText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { lines?: number }
>(({ className, lines = 3, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "animate-pulse rounded-md bg-muted",
          i === lines - 1 ? "w-3/4" : "w-full",
          "h-4"
        )}
      />
    ))}
  </div>
));
SkeletonText.displayName = "SkeletonText";

const SkeletonCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-xl border p-4 space-y-3", className)}
    {...props}
  >
    <Skeleton className="h-48 w-full rounded-lg" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-10 w-full rounded-lg" />
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

export { Skeleton, SkeletonCircle, SkeletonText, SkeletonCard };
