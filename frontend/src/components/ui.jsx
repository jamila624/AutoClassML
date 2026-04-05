import React from 'react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Button({ className, variant = "default", size = "default", ...props }) {
  const variants = {
    default: "bg-brand-blue text-white hover:bg-blue-600 shadow-sm",
    outline: "border border-brand-gray bg-transparent hover:bg-brand-beige text-foreground",
    ghost: "bg-transparent hover:bg-brand-beige text-foreground",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }) {
  return (
    <div
      className={cn("rounded-xl border border-brand-gray bg-brand-white shadow-sm overflow-hidden", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6 bg-brand-beige/30", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("font-semibold leading-none tracking-tight text-xl text-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-brand-blue text-white",
    secondary: "bg-brand-beige text-foreground",
    outline: "border border-brand-gray text-foreground",
  };
  
  return (
    <div className={cn("inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none", variants[variant], className)} {...props} />
  );
}

export function Spinner({ size = 24, className }) {
  return <Loader2 size={size} className={cn("animate-spin text-brand-blue", className)} />;
}

export function Tooltip({ text, children }) {
  return (
    <div className="group relative flex items-center">
      {children}
      <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-foreground text-background text-xs rounded py-1 px-2 z-10 transition-opacity whitespace-normal max-w-xs shadow-lg">
        {text}
        <svg className="absolute text-foreground h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
      </div>
    </div>
  );
}
