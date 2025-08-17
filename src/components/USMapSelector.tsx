'use client';

import { useState } from 'react';

interface USMapSelectorProps {
  selectedStates: string[];
  onStatesChange: (states: string[]) => void;
  onClose: () => void;
}

// US states data with SVG path coordinates
const US_STATES = [
  { id: 'AL', name: 'Alabama', path: 'M 600 400 L 620 400 L 620 420 L 600 420 Z' },
  { id: 'AK', name: 'Alaska', path: 'M 50 100 L 150 100 L 150 200 L 50 200 Z' },
  { id: 'AZ', name: 'Arizona', path: 'M 200 350 L 250 350 L 250 420 L 200 420 Z' },
  { id: 'AR', name: 'Arkansas', path: 'M 550 380 L 600 380 L 600 420 L 550 420 Z' },
  { id: 'CA', name: 'California', path: 'M 100 300 L 200 300 L 200 420 L 100 420 Z' },
  { id: 'CO', name: 'Colorado', path: 'M 300 300 L 350 300 L 350 380 L 300 380 Z' },
  { id: 'CT', name: 'Connecticut', path: 'M 800 250 L 820 250 L 820 270 L 800 270 Z' },
  { id: 'DE', name: 'Delaware', path: 'M 780 280 L 800 280 L 800 300 L 780 300 Z' },
  { id: 'FL', name: 'Florida', path: 'M 700 450 L 750 450 L 750 500 L 700 500 Z' },
  { id: 'GA', name: 'Georgia', path: 'M 650 400 L 700 400 L 700 450 L 650 450 Z' },
  { id: 'HI', name: 'Hawaii', path: 'M 50 450 L 100 450 L 100 500 L 50 500 Z' },
  { id: 'ID', name: 'Idaho', path: 'M 200 250 L 250 250 L 250 300 L 200 300 Z' },
  { id: 'IL', name: 'Illinois', path: 'M 600 300 L 650 300 L 650 350 L 600 350 Z' },
  { id: 'IN', name: 'Indiana', path: 'M 650 300 L 700 300 L 700 350 L 650 350 Z' },
  { id: 'IA', name: 'Iowa', path: 'M 550 250 L 600 250 L 600 300 L 550 300 Z' },
  { id: 'KS', name: 'Kansas', path: 'M 450 300 L 500 300 L 500 350 L 450 350 Z' },
  { id: 'KY', name: 'Kentucky', path: 'M 650 350 L 700 350 L 700 380 L 650 380 Z' },
  { id: 'LA', name: 'Louisiana', path: 'M 550 420 L 600 420 L 600 450 L 550 450 Z' },
  { id: 'ME', name: 'Maine', path: 'M 800 200 L 850 200 L 850 250 L 800 250 Z' },
  { id: 'MD', name: 'Maryland', path: 'M 750 280 L 800 280 L 800 320 L 750 320 Z' },
  { id: 'MA', name: 'Massachusetts', path: 'M 800 250 L 850 250 L 850 280 L 800 280 Z' },
  { id: 'MI', name: 'Michigan', path: 'M 650 200 L 700 200 L 700 300 L 650 300 Z' },
  { id: 'MN', name: 'Minnesota', path: 'M 550 200 L 600 200 L 600 250 L 550 250 Z' },
  { id: 'MS', name: 'Mississippi', path: 'M 600 420 L 650 420 L 650 450 L 600 450 Z' },
  { id: 'MO', name: 'Missouri', path: 'M 550 350 L 600 350 L 600 380 L 550 380 Z' },
  { id: 'MT', name: 'Montana', path: 'M 250 200 L 300 200 L 300 250 L 250 250 Z' },
  { id: 'NE', name: 'Nebraska', path: 'M 400 250 L 450 250 L 450 300 L 400 300 Z' },
  { id: 'NV', name: 'Nevada', path: 'M 200 300 L 250 300 L 250 350 L 200 350 Z' },
  { id: 'NH', name: 'New Hampshire', path: 'M 800 230 L 850 230 L 850 250 L 800 250 Z' },
  { id: 'NJ', name: 'New Jersey', path: 'M 780 270 L 800 270 L 800 290 L 780 290 Z' },
  { id: 'NM', name: 'New Mexico', path: 'M 300 350 L 350 350 L 350 420 L 300 420 Z' },
  { id: 'NY', name: 'New York', path: 'M 750 250 L 800 250 L 800 300 L 750 300 Z' },
  { id: 'NC', name: 'North Carolina', path: 'M 700 350 L 750 350 L 750 400 L 700 400 Z' },
  { id: 'ND', name: 'North Dakota', path: 'M 450 200 L 500 200 L 500 250 L 450 250 Z' },
  { id: 'OH', name: 'Ohio', path: 'M 700 300 L 750 300 L 750 350 L 700 350 Z' },
  { id: 'OK', name: 'Oklahoma', path: 'M 450 350 L 500 350 L 500 380 L 450 380 Z' },
  { id: 'OR', name: 'Oregon', path: 'M 150 250 L 200 250 L 200 300 L 150 300 Z' },
  { id: 'PA', name: 'Pennsylvania', path: 'M 750 280 L 800 280 L 800 320 L 750 320 Z' },
  { id: 'RI', name: 'Rhode Island', path: 'M 800 260 L 810 260 L 810 270 L 800 270 Z' },
  { id: 'SC', name: 'South Carolina', path: 'M 700 400 L 750 400 L 750 420 L 700 420 Z' },
  { id: 'SD', name: 'South Dakota', path: 'M 450 250 L 500 250 L 500 300 L 450 300 Z' },
  { id: 'TN', name: 'Tennessee', path: 'M 650 380 L 700 380 L 700 400 L 650 400 Z' },
  { id: 'TX', name: 'Texas', path: 'M 450 380 L 550 380 L 550 450 L 450 450 Z' },
  { id: 'UT', name: 'Utah', path: 'M 250 300 L 300 300 L 300 350 L 250 350 Z' },
  { id: 'VT', name: 'Vermont', path: 'M 800 220 L 850 220 L 850 250 L 800 250 Z' },
  { id: 'VA', name: 'Virginia', path: 'M 750 320 L 800 320 L 800 350 L 750 350 Z' },
  { id: 'WA', name: 'Washington', path: 'M 150 200 L 200 200 L 200 250 L 150 250 Z' },
  { id: 'WV', name: 'West Virginia', path: 'M 700 320 L 750 320 L 750 350 L 700 350 Z' },
  { id: 'WI', name: 'Wisconsin', path: 'M 600 200 L 650 200 L 650 250 L 600 250 Z' },
  { id: 'WY', name: 'Wyoming', path: 'M 300 250 L 350 250 L 350 300 L 300 300 Z' }
];

export default function USMapSelector({ selectedStates, onStatesChange, onClose }: USMapSelectorProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const handleStateClick = (stateId: string) => {
    const newSelectedStates = selectedStates.includes(stateId)
      ? selectedStates.filter(id => id !== stateId)
      : [...selectedStates, stateId];
    onStatesChange(newSelectedStates);
  };

  const getStateColor = (stateId: string) => {
    if (selectedStates.includes(stateId)) {
      return '#3B82F6'; // Blue for selected states
    }
    if (hoveredState === stateId) {
      return '#E5E7EB'; // Light gray for hovered states
    }
    return '#F3F4F6'; // Default light gray
  };

  const getStateStroke = (stateId: string) => {
    if (selectedStates.includes(stateId)) {
      return '#1D4ED8'; // Darker blue border for selected states
    }
    return '#D1D5DB'; // Default border
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Select States</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-blue-100 mt-2">
            Click on states to select/deselect them. Selected states will be highlighted in blue.
          </p>
        </div>

        {/* Map Container */}
        <div className="p-6 overflow-auto max-h-[60vh]">
          <div className="flex justify-center">
            <svg
              width="900"
              height="600"
              viewBox="0 0 900 600"
              className="border border-gray-200 rounded-lg bg-gray-50"
            >
              {/* Render each state */}
              {US_STATES.map((state) => (
                <g key={state.id}>
                  <path
                    d={state.path}
                    fill={getStateColor(state.id)}
                    stroke={getStateStroke(state.id)}
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:stroke-2"
                    onClick={() => handleStateClick(state.id)}
                    onMouseEnter={() => setHoveredState(state.id)}
                    onMouseLeave={() => setHoveredState(null)}
                  />
                  {/* State label */}
                  <text
                    x={parseInt(state.path.split(' ')[1]) + 10}
                    y={parseInt(state.path.split(' ')[2]) + 15}
                    className="text-xs font-medium pointer-events-none"
                    fill={selectedStates.includes(state.id) ? '#1E40AF' : '#6B7280'}
                  >
                    {state.id}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Footer with selected states and actions */}
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700">Selected States:</span>
            {selectedStates.length === 0 ? (
              <span className="text-sm text-gray-500 italic">None selected</span>
            ) : (
              selectedStates.map((stateId) => (
                <span
                  key={stateId}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {stateId}
                  <button
                    onClick={() => handleStateClick(stateId)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={() => onStatesChange([])}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear All
            </button>
            <div className="space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 