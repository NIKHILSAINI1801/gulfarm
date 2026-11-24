export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Loading wholesale catalogue"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-[6px] border border-[#C9A24B]/15 bg-[#121216]"
        >
          <div className="aspect-[4/5] animate-pulse bg-[#1B1B21]" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-20 animate-pulse rounded bg-[#1F1F26]" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-[#25252D]" />
            <div className="h-3 w-28 animate-pulse rounded bg-[#1F1F26]" />
            <div className="h-10 w-full animate-pulse rounded-full bg-[#1F1F26]" />
          </div>
        </div>
      ))}
    </div>
  );
}
