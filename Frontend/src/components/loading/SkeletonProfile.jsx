function SkeletonProfile() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="w-32 h-32 rounded-full bg-slate-800 mx-auto"></div>

      <div className="h-8 w-48 bg-slate-800 rounded mx-auto"></div>

      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-800 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
}

export default SkeletonProfile;