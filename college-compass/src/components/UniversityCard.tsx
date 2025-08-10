'use client';

import React from 'react';
import { UniversityResult } from '@/types';

interface UniversityCardProps {
  result: UniversityResult;
}

export default function UniversityCard({ result }: UniversityCardProps) {
  const { university, basicProbability, aiVerdict } = result;
  
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Likely Admit':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Possible Admit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Unlikely Admit':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-green-600';
    if (probability >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {university.name}
          </h3>
          <p className="text-gray-600">{university.state}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getVerdictColor(aiVerdict)}`}>
          {aiVerdict}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Acceptance Rate</p>
          <p className="font-semibold text-gray-900">{university.acceptance_rate}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Tuition</p>
          <p className="font-semibold text-gray-900">{formatCurrency(university.tuition)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Avg GPA</p>
          <p className="font-semibold text-gray-900">{university.avg_gpa}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Avg SAT</p>
          <p className="font-semibold text-gray-900">{university.avg_sat}</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Your Probability</span>
          <span className={`text-lg font-bold ${getProbabilityColor(basicProbability)}`}>
            {basicProbability.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              basicProbability >= 70 ? 'bg-green-500' : 
              basicProbability >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(basicProbability, 100)}%` }}
          />
        </div>
      </div>

      {university.preferred_majors.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-500 mb-2">Preferred Majors</p>
          <div className="flex flex-wrap gap-2">
            {university.preferred_majors.slice(0, 3).map((major) => (
              <span
                key={major}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
              >
                {major}
              </span>
            ))}
            {university.preferred_majors.length > 3 && (
              <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md">
                +{university.preferred_majors.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 