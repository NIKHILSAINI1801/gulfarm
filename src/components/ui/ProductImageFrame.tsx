import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ProductImageFrameProps {
  src?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  angleType?: string;
  aspectClass?: string;
}

export function ProductImageFrame({
  src,
  alt,
  className = '',
  imgClassName = '',
  angleType,
  aspectClass = 'aspect-[4/5]',
}: ProductImageFrameProps) {
  const [failed, setFailed] = useState(false);

  const angleTransform =
    angleType === 'closeup'
      ? 'scale-125 object-[50%_28%]'
      : angleType === 'fabric'
        ? 'scale-150 object-[50%_62%]'
        : 'object-cover object-top';

  return (
    <div
      className={`relative overflow-hidden bg-[#151519] ${aspectClass} ${className}`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className={`h-full w-full transition-transform duration-300 ease-out ${angleTransform} ${imgClassName}`}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1E1B18] via-[#121216] to-[#5A0F1F]/50 p-6 text-center">
          <Sparkles className="mb-2 h-6 w-6 text-[#C9A24B]" aria-hidden="true" />
          <span className="font-serif text-sm font-semibold text-[#F7F1E6]">{alt}</span>
          <span className="mt-1 text-xs text-[#C9A24B]">MAGESTIC THREADs</span>
        </div>
      )}
    </div>
  );
}
