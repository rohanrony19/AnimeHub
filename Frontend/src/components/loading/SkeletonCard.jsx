function SkeletonCard() {
  return (
    <div className="w-[220px] flex-shrink-0 rounded-3xl overflow-hidden bg-slate-800 animate-pulse">
      <div className="w-full h-[260px] bg-slate-700"></div>

      <div className="p-3">
        <div className="h-[56px] bg-slate-700 rounded"></div>

        <div className="h-5 w-2/3 bg-slate-700 rounded mt-2"></div>
      </div>
    </div>
  );
}

export default SkeletonCard;