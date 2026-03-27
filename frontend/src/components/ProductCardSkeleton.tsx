export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-pulse">
      <div className="h-48 sm:h-56 bg-gray-200" />
      <div className="p-3 sm:p-4 flex flex-col flex-grow space-y-3">
        <div className="h-3.5 bg-gray-200 rounded-full w-4/5" />
        <div className="h-3 bg-gray-100 rounded-full w-3/5" />
        <div className="mt-auto pt-2 border-t border-gray-50 flex items-end justify-between">
          <div className="space-y-1">
            <div className="h-2.5 bg-gray-100 rounded-full w-12" />
            <div className="h-5 bg-gray-200 rounded-full w-16" />
          </div>
          <div className="w-9 h-9 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
