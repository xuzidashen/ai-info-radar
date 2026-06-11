import type { ReactNode } from "react";

type AppContainerProps = {
  children: ReactNode;
  className?: string;
  size?: "md" | "lg" | "xl";
};

const sizeClasses: Record<NonNullable<AppContainerProps["size"]>, string> = {
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[92rem]"
};

export function AppContainer({ children, className = "", size = "lg" }: AppContainerProps) {
  return <div className={`mx-auto w-full ${sizeClasses[size]} space-y-7 ${className}`}>{children}</div>;
}
