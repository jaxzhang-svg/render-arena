import { cn } from "@/lib/utils";

export function BrandLoader({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer Glow/Ring Effect */}
      <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75 duration-1000" />
      <div className="absolute inset-[-4px] animate-pulse rounded-full bg-primary/10 blur-sm" />
      
      {/* Logo SVG */}
      <svg
        viewBox="0 0 28 17.3049"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-8 w-auto text-primary"
      >
        <path
          d="M10.6951 0V6.60971L0 17.3049H10.6951V10.6948L17.3055 17.3049H28L10.6951 0Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
