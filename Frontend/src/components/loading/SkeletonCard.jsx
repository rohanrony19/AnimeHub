function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-2xl bg-slate-800"></div>

      <div className="mt-4 h-5 bg-slate-800 rounded"></div>

      <div className="mt-2 h-4 w-2/3 bg-slate-800 rounded"></div>
    </div>
  );
}

export default SkeletonCard;