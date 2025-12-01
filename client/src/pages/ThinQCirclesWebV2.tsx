import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Users, ChevronRight } from "lucide-react";

interface Circle {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  memberCount?: number;
  isOwner?: boolean;
}

export default function ThinQCirclesWebV2() {
  const { data: circlesData, isLoading } = useQuery<{ circles: Circle[] }>({
    queryKey: ["/api/thinq-circles"],
  });

  const circles = circlesData?.circles || [];
  const totalMembers = circles.reduce((acc, c) => acc + (c.memberCount || 0), 0);
  const ownedCount = circles.filter(c => c.isOwner).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-black mb-1">ThinQ Circles</h1>
            <p className="text-sm text-gray-500">Collaborate with your community</p>
          </div>
          <button className="w-11 h-11 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-6 py-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{circles.length}</p>
          <p className="text-xs text-gray-600 mt-1">Circles</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{totalMembers}</p>
          <p className="text-xs text-gray-600 mt-1">Members</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{ownedCount}</p>
          <p className="text-xs text-gray-600 mt-1">You Own</p>
        </div>
      </div>

      {/* Circles List */}
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : circles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
            </svg>
            <h3 className="text-lg font-bold text-black mb-2">No Circles Yet</h3>
            <p className="text-gray-500 mb-4">Create your first circle to collaborate!</p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600">
              Create Circle
            </button>
          </div>
        ) : (
          circles.map((circle) => (
            <div key={circle.id} className="px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-blue-500">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-black">{circle.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Created {new Date(circle.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                {circle.isOwner && (
                  <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-1 rounded flex-shrink-0">
                    Owner
                  </span>
                )}
              </div>

              {circle.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{circle.description}</p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{circle.memberCount || 0} members</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
