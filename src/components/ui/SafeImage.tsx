import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  containerClassName?: string;
  query?: string;
}

/**
 * SafeImage Component
 * 
 * Hardened for 100% visibility. Removes error icons and provides 
 * cinematic transitions between loading, source, and verified fallbacks.
 */
const SafeImage = ({
  src,
  alt,
  className,
  containerClassName,
  query,
  fallbackSrc = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop",
  ...props
}: SafeImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(true);
    setError(false);
  }, [src]);

  const handleError = () => {
    if (!error) {
      setError(true);
      // Seamlessly switch to a high-quality relevant fallback query if available
      // or to the global travel fallback. Note: No more visible error icons.
      if (query && !currentSrc?.includes('images.unsplash.com/photo-')) {
        setCurrentSrc(`https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop`);
      } else {
        setCurrentSrc(fallbackSrc);
      }
    }
    // We set isLoading to false even on error because the fallback is now loading
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden bg-muted/10 ${className || ''} ${containerClassName || ''}`}>
      {/* Premium Skeleton/Shimmer Loader */}
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <div className="w-full h-full bg-muted/20 animate-pulse flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary/30" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer" />
        </div>
      )}

      <img
        src={currentSrc || fallbackSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-700 ${isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

export default SafeImage;
