import { useQuery } from "@tanstack/react-query";
import { Flame, Lightbulb, Loader2 } from "lucide-react";

interface Dot {
  id: number;
  summary: string;
  anchor?: string;
  pulse?: string;
  createdAt: string;
}

interface Wheel {
  id: number;
  heading: string;
  goals?: string;
  createdAt: string;
}

interface Stats {
  totalDots: number;
  totalWheels: number;
  totalChakras: number;
  sparks: number;
}

export default function MyNeuraWebV2() {
  const { data: statsData, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/user/stats"],
  });

  const { data: dotsData } = useQuery<{ dots: Dot[] }>({
    queryKey: ["/api/dots"],
  });

  const { data: wheelsData } = useQuery<{ wheels: Wheel[] }>({
    queryKey: ["/api/wheels"],
  });

  const stats = statsData || { totalDots: 0, totalWheels: 0, totalChakras: 0, sparks: 0 };
  const dots = dotsData?.dots || [];
  const wheels = wheelsData?.wheels || [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Welcome back!</p>
            <h1 className="text-3xl font-bold text-black">MyNeura</h1>
          </div>
          <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl">
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="font-bold text-lg text-orange-500">{stats.sparks}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-6">
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-amber-500 text-center">
          <Lightbulb className="w-5 h-5 text-amber-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500 mb-2">Dots</p>
          <p className="text-2xl font-bold">{stats.totalDots}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500 text-center">
          <div className="w-5 h-5 mx-auto mb-2 text-purple-500">⟳</div>
          <p className="text-xs text-gray-500 mb-2">Wheels</p>
          <p className="text-2xl font-bold">{stats.totalWheels}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-pink-500 text-center">
          <div className="w-5 h-5 mx-auto mb-2 text-pink-500">◐</div>
          <p className="text-xs text-gray-500 mb-2">Chakras</p>
          <p className="text-2xl font-bold">{stats.totalChakras}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500 text-center">
          <span className="text-2xl">⭐</span>
          <p className="text-xs text-gray-500 mb-2 mt-1">This Month</p>
          <p className="text-2xl font-bold">{stats.totalDots}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 py-4">
        <h2 className="text-base font-bold mb-3">Your Neural Journey</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Cognitive Growth</span>
            <span className="font-bold text-amber-500">{Math.round((stats.totalDots / 100) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((stats.totalDots / 100) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">Keep capturing your insights!</p>
        </div>
      </div>

      {/* Recent Dots */}
      {dots.length > 0 && (
        <div className="px-6 py-6 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold">Latest Dots</h2>
            <a href="#" className="text-xs text-amber-500 font-semibold">See All</a>
          </div>
          <div className="space-y-3">
            {dots.slice(0, 3).map((dot) => (
              <div key={dot.id} className="bg-yellow-50 rounded-lg p-3 border-l-4 border-amber-500">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-gray-500">
                    {new Date(dot.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm font-semibold text-black mb-2">{dot.summary}</p>
                {dot.anchor && <p className="text-xs text-orange-600 mb-1">📌 {dot.anchor}</p>}
                {dot.pulse && <p className="text-xs text-purple-600">💫 {dot.pulse}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Wheels */}
      {wheels.length > 0 && (
        <div className="px-6 py-6 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold">Active Wheels</h2>
            <a href="#" className="text-xs text-purple-500 font-semibold">See All</a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {wheels.slice(0, 2).map((wheel) => (
              <div key={wheel.id} className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <div className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold w-fit mb-2">⟳ Active</div>
                <p className="text-sm font-bold text-purple-700 mb-1">{wheel.heading}</p>
                {wheel.goals && <p className="text-xs text-gray-600 mb-2">{wheel.goals}</p>}
                <p className="text-xs text-gray-400">
                  {new Date(wheel.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {dots.length === 0 && wheels.length === 0 && !statsLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Lightbulb className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-black mb-2">No Thoughts Yet</h3>
          <p className="text-gray-500">Start capturing your insights to see them here</p>
        </div>
      )}

      {statsLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      )}
    </div>
  );
}
