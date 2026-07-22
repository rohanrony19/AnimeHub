function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-14 h-14 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default LoadingSpinner;