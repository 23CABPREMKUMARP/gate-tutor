"use client"

import { useUserStore } from '@/store/userStore'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
)

export default function AnalyticsDashboard() {
  const { profile } = useUserStore()

  if (profile.history.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
        <p className="text-gray-500">Attempt some quizzes to see your analytics!</p>
      </div>
    )
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { min: 0, max: 100 },
    },
    maintainAspectRatio: false,
  }

  const data = {
    labels: profile.history.map((h) => h.date),
    datasets: [
      {
        fill: true,
        label: 'Accuracy %',
        data: profile.history.map((h) => h.accuracy),
        borderColor: '#FF6B00',
        backgroundColor: 'rgba(255, 107, 0, 0.1)',
        tension: 0.4,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50/50 backdrop-blur-sm">
          <p className="text-gray-500 text-sm font-medium mb-1">Overall Accuracy</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900">{profile.overallAccuracy}%</p>
            <span className="text-green-500 text-sm font-bold pb-1">↑ 4%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50/50">
          <p className="text-gray-500 text-sm font-medium mb-1">Topics Mastered</p>
          <p className="text-4xl font-black text-gray-900">{profile.topicsMastered}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-primary/20 relative overflow-hidden">
          <p className="text-primary/80 text-sm font-bold mb-1 uppercase tracking-wider">Current Streak</p>
          <p className="text-4xl font-black text-primary">{profile.streak} Days</p>
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 blur-[2px]">🔥</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50">
          <h3 className="font-bold text-gray-800 mb-6">Learning Progression</h3>
          <div className="h-64 w-full">
            <Line options={options} data={data} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 flex flex-col">
          <h3 className="font-bold text-gray-800 mb-4">AI Diagnostics</h3>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Weak Areas Detected</p>
              <div className="flex flex-wrap gap-2">
                {profile.weakAreas.map((area, i) => (
                  <span key={i} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                    {area}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mt-auto pt-6 border-t border-gray-100">
              <p className="text-xs text-primary uppercase tracking-wider font-bold mb-2">Recommended Next</p>
              <p className="text-lg font-bold text-gray-800">{profile.recommendedTopic}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
