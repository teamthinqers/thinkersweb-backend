import { useQuery, useMutation } from "@tanstack/react-query";
import { Lightbulb, MessageCircle, Share2, Loader2, Plus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface Thought {
  id: number;
  heading: string;
  summary: string;
  user?: { id: number; fullName: string };
  createdAt: string;
  sparksCount?: number;
  perspectivesCount?: number;
}

export default function SocialWebV2() {
  const { data: thoughtsData, isLoading } = useQuery<{ thoughts: Thought[] }>({
    queryKey: ["/api/thoughts"],
  });

  const thoughts = thoughtsData?.thoughts || [];
  const totalSparks = thoughts.reduce((acc, t) => acc + (t.sparksCount || 0), 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-black mb-1">Social Reflections</h1>
            <p className="text-sm text-gray-500">Share your insights with the community</p>
          </div>
          <button className="w-11 h-11 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-6 py-4 bg-gray-50 flex justify-around">
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-500">{thoughts.length}</p>
          <p className="text-xs text-gray-600 mt-1">Thoughts</p>
        </div>
        <div className="w-px bg-gray-300"></div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-500">{totalSparks}</p>
          <p className="text-xs text-gray-600 mt-1">Sparks</p>
        </div>
        <div className="w-px bg-gray-300"></div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-500">{thoughts.length * 2}</p>
          <p className="text-xs text-gray-600 mt-1">Views</p>
        </div>
      </div>

      {/* Feed */}
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : thoughts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Lightbulb className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-black mb-2">No Thoughts Yet</h3>
            <p className="text-gray-500">Be the first to share your insights!</p>
          </div>
        ) : (
          thoughts.map((thought) => (
            <div key={thought.id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
              {/* Author */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-orange-600">
                    {thought.user?.fullName.charAt(0) || '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-black">{thought.user?.fullName || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(thought.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="mb-3">
                <h3 className="font-bold text-sm text-black mb-2">{thought.heading}</h3>
                <p className="text-sm text-gray-700 line-clamp-3">{thought.summary}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 text-xs">
                <button className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors">
                  <Lightbulb className="w-4 h-4" />
                  <span>{thought.sparksCount || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{thought.perspectivesCount || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
