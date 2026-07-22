function SkeletonHero() {
  return (
    <div className="relative min-h-screen bg-slate-900 animate-pulse">
      <div className="absolute left-20 bottom-28 space-y-6">
        <div className="w-96 h-14 bg-slate-700 rounded"></div>

        <div className="w-64 h-6 bg-slate-700 rounded"></div>

        <div className="w-[600px] h-28 bg-slate-700 rounded"></div>

        <div className="flex gap-4">
          <div className="w-40 h-14 bg-slate-700 rounded-xl"></div>

          <div className="w-40 h-14 bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonHero;