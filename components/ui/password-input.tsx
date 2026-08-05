"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends React.ComponentProps<"input"> {
  wrapperClassName?: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, wrapperClassName, id, name, placeholder, required, defaultValue, value, onChange, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className={cn("relative flex items-center w-full", wrapperClassName)}>
        <input
          {...props}
          ref={ref}
          id={id}
          name={name}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          disabled={disabled}
          type={showPassword ? "text" : "password"}
          className={cn(
            "h-12 w-full min-w-0 rounded-md border border-white/10 bg-white/5 px-3 py-1 pr-11 text-base shadow-sm transition-all duration-200 ease-out outline-none selection:bg-accent selection:text-white placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "hover:border-white/20 hover:bg-white/10",
            "focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
            className
          )}
        />
        <motion.button
          type="button"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((prev) => !prev)}
          whileTap={{ scale: 0.95 }}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-white/5 transition-colors duration-200 outline-none focus-visible:ring-1 focus-visible:ring-accent/50 cursor-pointer select-none"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ rotate: showPassword ? -8 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Eye Shape */}
            <motion.path
              d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
              animate={{ opacity: showPassword ? 0.55 : 1 }}
              transition={{ duration: 0.2 }}
            />
            {/* Eye Pupil */}
            <motion.circle
              cx="12"
              cy="12"
              r="3"
              animate={{
                scale: showPassword ? 0.85 : 1,
                opacity: showPassword ? 0.55 : 1,
              }}
              transition={{ duration: 0.2 }}
            />
            {/* Animated Slash Line */}
            <motion.line
              x1="4"
              y1="4"
              x2="20"
              y2="20"
              initial={false}
              animate={{
                pathLength: showPassword ? 1 : 0,
                opacity: showPassword ? 1 : 0,
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            />
          </motion.svg>
        </motion.button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
