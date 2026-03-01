export default function StatusPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8">System Status</h1>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
            <span className="font-semibold text-green-800">API</span>
            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">
              Operational
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
            <span className="font-semibold text-green-800">Voice Gateway</span>
            <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">
              Operational
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <span className="font-semibold text-yellow-800">AI Engine</span>
            <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm">
              Degraded Performance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
