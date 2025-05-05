import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const StatisticsSection: React.FC = () => {
  const { data: frequencyData, isLoading: loadingFrequency } = useQuery({
    queryKey: ["/api/analytics/frequency"],
  });

  const { data: categoryData, isLoading: loadingCategories } = useQuery({
    queryKey: ["/api/analytics/categories"],
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card className="shadow-sm overflow-hidden border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Learning Frequency</h3>
          {loadingFrequency ? (
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500">Loading chart data...</p>
            </div>
          ) : frequencyData && frequencyData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequencyData}>
                  <XAxis 
                    dataKey="week" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value} entries`, 'Count']}
                    labelFormatter={(label) => `Week of ${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p>No frequency data available yet</p>
                <p className="text-sm mt-1">Start adding entries to see your learning patterns</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm overflow-hidden border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
          {loadingCategories ? (
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500">Loading chart data...</p>
            </div>
          ) : categoryData && categoryData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="category"
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || `hsl(var(--chart-${(index % 5) + 1}))`} 
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value: any) => [`${value} entries`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center text-gray-500">
                <p>No category data available yet</p>
                <p className="text-sm mt-1">Start categorizing your entries to see distribution</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsSection;
