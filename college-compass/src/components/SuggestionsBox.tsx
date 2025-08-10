'use client';

import React from 'react';

interface SuggestionsBoxProps {
  suggestions: string[];
  className?: string;
}

export default function SuggestionsBox({ suggestions, className = '' }: SuggestionsBoxProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-8 ${className}`}>
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-900">What to Improve</h3>
      </div>
      
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
              {index + 1}
            </div>
            <p className="text-gray-800 leading-relaxed">{suggestion}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-sm text-gray-700 text-center">
          💡 These suggestions are tailored to your specific profile and target universities. 
          Focus on the areas that will have the biggest impact on your applications.
        </p>
      </div>
    </div>
  );
} 