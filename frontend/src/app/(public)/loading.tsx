export default function Loading() {
  return (
    <div className="container p-8">
      <div className="flex flex-col items-center mb-12 animate-pulse">
        <div className="w-20 h-20 bg-slate-200 rounded-3xl mb-6"></div>
        <div className="w-64 h-12 bg-slate-200 rounded-xl mb-4"></div>
        <div className="w-40 h-4 bg-slate-100 rounded-full"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-panel p-8 h-[280px] bg-white/50 border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between">
              <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
              <div className="w-16 h-6 bg-slate-100 rounded-full"></div>
            </div>
            <div className="w-3/4 h-8 bg-slate-200 rounded-lg"></div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-slate-50 rounded"></div>
              <div className="w-full h-4 bg-slate-50 rounded"></div>
              <div className="w-1/2 h-4 bg-slate-50 rounded"></div>
            </div>
            <div className="mt-auto w-1/3 h-6 bg-slate-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
