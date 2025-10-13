interface SparkIconProps {
  className?: string;
  fill?: string;
}

export default function SparkIcon({ className = "h-6 w-6", fill = "currentColor" }: SparkIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none"
      className={className}
    >
      <path 
        d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" 
        fill={fill}
        stroke={fill}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
