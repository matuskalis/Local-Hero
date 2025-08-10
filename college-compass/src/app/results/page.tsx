'use client';

import { useState, useEffect } from 'react';
import UniversityCard from '@/components/UniversityCard';
import SuggestionsBox from '@/components/SuggestionsBox';
import { AssessmentForm, AssessmentResult } from '@/types';

export default function ResultsPage() {
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedFormData = localStorage.getItem('assessmentForm');
    if (!storedFormData) {
      setError('No assessment data found. Please complete the assessment form first.');
      setIsLoading(false);
      return;
    }

    try {
      const parsedFormData = JSON.parse(storedFormData);
      evaluateAssessment(parsedFormData);
    } catch {
      setError('Error loading assessment data. Please try again.');
      setIsLoading(false);
    }
  }, []);

  const evaluateAssessment = async (formData: AssessmentForm) => {
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate assessment');
      }

      const assessmentResults = await response.json();
      setResults(assessmentResults);
    } catch (error) {
      console.error('Error evaluating assessment:', error);
      setError('Failed to evaluate your assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDFReport = () => {
    // TODO: Implement PDF generation
    alert('PDF download feature coming soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Analyzing your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">College Compass</span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/form" className="text-blue-600 hover:text-blue-700 font-medium">
                ← New Assessment
              </a>
              <button
                onClick={downloadPDFReport}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                📄 Download Report
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Results Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Assessment Results</h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Based on your academic profile, here&apos;s how you stack up against top US universities
            and personalized recommendations for improvement.
          </p>
        </div>

        {/* Overall Strength Score */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overall Strength Score</h2>
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4">
            <span className="text-3xl font-bold text-white">{results.overallStrengthScore}</span>
          </div>
          <p className="text-lg text-gray-700">out of 100</p>
          <p className="text-sm text-gray-600 mt-2">
            This score represents your overall competitiveness for college admissions
          </p>
        </div>

        {/* AI Evaluation Summary */}
        {results.aiEvaluation.evaluation && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">AI Assessment Summary</h2>
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <p className="text-gray-800 text-lg leading-relaxed">{results.aiEvaluation.evaluation}</p>
            </div>
          </div>
        )}

        {/* University Results */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">University Analysis</h2>
          <div className="grid gap-6">
            {results.universities.map((result, index) => (
              <UniversityCard key={index} result={result} />
            ))}
          </div>
        </div>

        {/* Improvement Suggestions */}
        <SuggestionsBox 
          suggestions={results.aiEvaluation.suggestions} 
          className="mb-12"
        />

        {/* Action Buttons */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/form"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              📝 Take New Assessment
            </a>
            <button
              onClick={downloadPDFReport}
              className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-xl text-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              📄 Download Full Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 