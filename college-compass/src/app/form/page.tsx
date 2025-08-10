'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FormInput from '@/components/FormInput';
import USMapSelector from '@/components/USMapSelector';
import { AssessmentForm } from '@/types';

const extracurricularOptions = [
  'Leadership roles',
  'Volunteering hours',
  'Personal projects / startups',
  'Awards / competitions',
  'Sports / athletics',
  'Arts / music',
  'Research experience',
  'Internships',
  'Clubs / organizations'
];

export default function FormPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AssessmentForm>({
    gpa: 0,
    sat: 0,
    act: undefined,
    major: '',
    location: [],
    budget: undefined,
    extracurriculars: [],
    extracurricularDetails: '',
    essay: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapSelector, setShowMapSelector] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // GPA validation
    if (formData.gpa < 0 || formData.gpa > 4) {
      newErrors.gpa = 'GPA must be between 0.0 and 4.0';
    }

    // SAT validation (only if not "Don't have")
    if (formData.sat !== -1 && (formData.sat < 400 || formData.sat > 1600)) {
      newErrors.sat = 'SAT score must be between 400 and 1600';
    }

    // Major validation
    if (!formData.major.trim()) {
      newErrors.major = 'Intended major is required';
    }

    // Essay validation
    if (!formData.essay.trim()) {
      newErrors.essay = 'Personal statement is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: keyof AssessmentForm, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Store form data in localStorage
      localStorage.setItem('assessmentForm', JSON.stringify(formData));
      
      // Navigate to results page
      router.push('/results');
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

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
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Academic Assessment</h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Tell us about your academic profile, extracurricular activities, and goals.
            We&apos;ll analyze your chances and provide personalized recommendations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Academic Scores Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Academic Scores</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <FormInput
                label="GPA (0.0 - 4.0)"
                name="gpa"
                type="number"
                value={formData.gpa}
                onChange={(value) => handleInputChange('gpa', value)}
                required
                min={0}
                max={4}
                step={0.01}
                placeholder="3.85"
                error={errors.gpa}
              />
              
              <FormInput
                label="SAT Score (400 - 1600)"
                name="sat"
                type="select"
                value={formData.sat}
                onChange={(value) => handleInputChange('sat', value)}
                required
                options={['Don\'t have', '400', '500', '600', '700', '800', '900', '1000', '1100', '1200', '1300', '1400', '1500', '1600']}
                error={errors.sat}
              />

              <FormInput
                label="ACT Score (1 - 36)"
                name="act"
                type="select"
                value={formData.act}
                onChange={(value) => handleInputChange('act', value)}
                options={['Don\'t have', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36']}
              />
            </div>
          </div>

          {/* Academic Preferences Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Academic Preferences</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <FormInput
                label="Intended Major"
                name="major"
                type="text"
                value={formData.major}
                onChange={(value) => handleInputChange('major', value)}
                required
                placeholder="Computer Science"
                error={errors.major}
              />

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Location Preference (States)
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowMapSelector(true)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-left hover:bg-gray-50 transition-colors"
                  >
                    {formData.location && formData.location.length > 0 ? (
                      <span className="text-gray-900">
                        {formData.location.join(', ')}
                      </span>
                    ) : (
                      <span className="text-gray-500">Click to select states</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMapSelector(true)}
                    className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </button>
                </div>
                {formData.location && formData.location.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.location.map((state) => (
                      <span
                        key={state}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {state}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              location: prev.location?.filter(s => s !== state) || []
                            }));
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <FormInput
                label="Annual Tuition Budget (USD)"
                name="budget"
                type="number"
                value={formData.budget}
                onChange={(value) => handleInputChange('budget', value)}
                min={0}
                step={1000}
                placeholder="50000"
              />
            </div>
          </div>

          {/* Extracurricular Activities Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Extracurricular Activities</h2>
            
            {/* Checkboxes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select activities that apply:
              </label>
              <div className="grid md:grid-cols-3 gap-3">
                {extracurricularOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.extracurriculars.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            extracurriculars: [...prev.extracurriculars, option]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            extracurriculars: prev.extracurriculars.filter(item => item !== option)
                          }));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Free text description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your extracurricular activities in detail:
              </label>
              <textarea
                value={formData.extracurricularDetails}
                onChange={(e) => handleInputChange('extracurricularDetails', e.target.value)}
                placeholder="Tell us about your leadership roles, projects, achievements, time commitments, and impact. Be specific about what you accomplished and how it shaped you."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
              />
              <p className="text-sm text-gray-600 mt-2">
                This helps our AI provide more personalized recommendations.
              </p>
            </div>
          </div>

          {/* Personal Statement Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Personal Statement</h2>
            <FormInput
              label="Short Essay / Personal Statement"
              name="essay"
              type="textarea"
              value={formData.essay}
              onChange={(value) => handleInputChange('essay', value)}
              required
              placeholder="Tell us about your academic interests, career goals, and what makes you unique. What drives your passion for your intended major?"
              error={errors.essay}
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Analyzing...' : 'Get My Assessment'}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </button>
          </div>
        </form>
      </main>

      {/* US Map Selector Modal */}
      {showMapSelector && (
        <USMapSelector
          selectedStates={formData.location || []}
          onStatesChange={(states) => {
            setFormData(prev => ({ ...prev, location: states }));
          }}
          onClose={() => setShowMapSelector(false)}
        />
      )}
    </div>
  );
} 