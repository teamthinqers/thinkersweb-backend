import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },

        "ping-fast": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(3)", opacity: "0" },
        },
        "spark-appear": {
          "0%": { opacity: "0" },
          "5%": { opacity: "0.8" },
          "15%": { opacity: "0.4" },
          "25%": { opacity: "0" },
          "100%": { opacity: "0" }
        },
        "spark-flash": {
          "0%": { opacity: "0" },
          "5%": { opacity: "1" },
          "10%": { opacity: "0" },
          "100%": { opacity: "0" }
        },
        "pulse-slow": {
          "0%, 100%": {
            opacity: "0.8",
          },
          "50%": {
            opacity: "0.4",
          }
        },
        "orbit": {
          "0%": {
            transform: "translateX(6px) translateY(0px)",
          },
          "25%": {
            transform: "translateX(4px) translateY(4px)",
          },
          "50%": {
            transform: "translateX(0px) translateY(6px)",
          },
          "75%": {
            transform: "translateX(-4px) translateY(4px)",
          },
          "100%": {
            transform: "translateX(-6px) translateY(0px)",
          }
        },
        "dash-slow": {
          to: {
            strokeDashoffset: "-10"
          }
        },
        typing: {
          "0%": {
            width: "0%",
            borderColor: "transparent",
          },
          "5%": {
            borderColor: "hsl(var(--primary))",
          },
          "50%": {
            width: "100%",
          },
          "95%": {
            borderColor: "hsl(var(--primary))",
          },
          "100%": {
            borderColor: "transparent",
          }
        },
        gradient: {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          }
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          }
        },
        "float-slow": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-6px)",
          }
        },
        pulsate: {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.7",
          }
        },
        sparkling: {
          "0%": {
            transform: "scale(1)",
            opacity: "0.8",
          },
          "50%": {
            transform: "scale(1.2)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "0.8",
          }
        },
        "ping-slow": {
          "0%": {
            transform: "scale(1)",
            opacity: "1",
          },
          "75%, 100%": {
            transform: "scale(1.2)",
            opacity: "0",
          }
        },
        "ping-slower": {
          "0%": {
            transform: "scale(1)",
            opacity: "0.8",
          },
          "75%, 100%": {
            transform: "scale(1.3)",
            opacity: "0",
          }
        },
        bounce: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-5px)",
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "typing": "typing 4s steps(40) infinite",
        "gradient": "gradient 6s ease infinite",
        "float": "float 4s ease-in-out infinite",
        "float-slow": "float-slow 5s ease-in-out infinite",
        "float-delay": "float 3s ease-in-out 1s infinite",
        "float-delay-slow": "float-slow 4s ease-in-out 0.5s infinite",
        "pulsate": "pulsate 2s ease-in-out infinite",
        "sparkling": "sparkling 2s ease-in-out infinite",
        "sparkling-delayed": "sparkling 2s ease-in-out 0.7s infinite",
        "ping-slow": "ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "ping-slower": "ping-slower 4s cubic-bezier(0, 0, 0.2, 1) infinite",
        "btn-bounce": "bounce 0.5s ease-in-out",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "dash-slow": "dash-slow 15s linear infinite",
        "orbit": "orbit 4s ease-in-out infinite",
        "spark-appear": "spark-appear 1.5s ease-in-out infinite",
        "spark-flash": "spark-flash 2s ease-in-out infinite"
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
