interface SparkIconProps {
  className?: string;
  fill?: string;
}

export default function SparkIcon({ className = "h-6 w-6", fill = "currentColor" }: SparkIconProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 200 200" 
      fill="none"
      className={className}
    >
      <path 
        d="M100 30L117.5 80.8654L171.747 80.8654L127.635 112.135L145.534 163L100 132.5L54.4658 163L72.3654 112.135L28.2531 80.8654H82.5L100 30Z" 
        fill={fill}
      />
    </svg>
  );
}
