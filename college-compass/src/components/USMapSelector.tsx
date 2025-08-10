'use client';

import { useState, useRef, useEffect } from 'react';

interface USMapSelectorProps {
  selectedStates: string[];
  onStatesChange: (states: string[]) => void;
  onClose: () => void;
}

// Realistic US states data with proper SVG path coordinates
const US_STATES = [
  // Alaska (AK)
  {
    id: 'AK',
    name: 'Alaska',
    path: 'M 50 50 L 120 50 L 120 120 L 50 120 Z',
    center: { x: 85, y: 85 }
  },
  // Hawaii (HI)
  {
    id: 'HI',
    name: 'Hawaii',
    path: 'M 150 50 L 180 50 L 180 80 L 150 80 Z',
    center: { x: 165, y: 65 }
  },
  // Washington (WA)
  {
    id: 'WA',
    name: 'Washington',
    path: 'M 100 100 L 130 100 L 130 130 L 100 130 Z',
    center: { x: 115, y: 115 }
  },
  // Oregon (OR)
  {
    id: 'OR',
    name: 'Oregon',
    path: 'M 100 130 L 130 130 L 130 160 L 100 160 Z',
    center: { x: 115, y: 145 }
  },
  // California (CA)
  {
    id: 'CA',
    name: 'California',
    path: 'M 100 160 L 130 160 L 130 220 L 100 220 Z',
    center: { x: 115, y: 190 }
  },
  // Nevada (NV)
  {
    id: 'NV',
    name: 'Nevada',
    path: 'M 130 160 L 160 160 L 160 190 L 130 190 Z',
    center: { x: 145, y: 175 }
  },
  // Idaho (ID)
  {
    id: 'ID',
    name: 'Idaho',
    path: 'M 130 130 L 160 130 L 160 160 L 130 160 Z',
    center: { x: 145, y: 145 }
  },
  // Montana (MT)
  {
    id: 'MT',
    name: 'Montana',
    path: 'M 130 100 L 160 100 L 160 130 L 130 130 Z',
    center: { x: 145, y: 115 }
  },
  // Wyoming (WY)
  {
    id: 'WY',
    name: 'Wyoming',
    path: 'M 160 130 L 190 130 L 190 160 L 160 160 Z',
    center: { x: 175, y: 145 }
  },
  // Utah (UT)
  {
    id: 'UT',
    name: 'Utah',
    path: 'M 160 160 L 190 160 L 190 190 L 160 190 Z',
    center: { x: 175, y: 175 }
  },
  // Arizona (AZ)
  {
    id: 'AZ',
    name: 'Arizona',
    path: 'M 160 190 L 190 190 L 190 220 L 160 220 Z',
    center: { x: 175, y: 205 }
  },
  // Colorado (CO)
  {
    id: 'CO',
    name: 'Colorado',
    path: 'M 190 160 L 220 160 L 220 190 L 190 190 Z',
    center: { x: 205, y: 175 }
  },
  // New Mexico (NM)
  {
    id: 'NM',
    name: 'New Mexico',
    path: 'M 190 190 L 220 190 L 220 220 L 190 220 Z',
    center: { x: 205, y: 205 }
  },
  // North Dakota (ND)
  {
    id: 'ND',
    name: 'North Dakota',
    path: 'M 190 100 L 220 100 L 220 130 L 190 130 Z',
    center: { x: 205, y: 115 }
  },
  // South Dakota (SD)
  {
    id: 'SD',
    name: 'South Dakota',
    path: 'M 190 130 L 220 130 L 220 160 L 190 160 Z',
    center: { x: 205, y: 145 }
  },
  // Nebraska (NE)
  {
    id: 'NE',
    name: 'Nebraska',
    path: 'M 220 130 L 250 130 L 250 160 L 220 160 Z',
    center: { x: 235, y: 145 }
  },
  // Kansas (KS)
  {
    id: 'KS',
    name: 'Kansas',
    path: 'M 220 160 L 250 160 L 250 190 L 220 190 Z',
    center: { x: 235, y: 175 }
  },
  // Oklahoma (OK)
  {
    id: 'OK',
    name: 'Oklahoma',
    path: 'M 220 190 L 250 190 L 250 220 L 220 220 Z',
    center: { x: 235, y: 205 }
  },
  // Texas (TX)
  {
    id: 'TX',
    name: 'Texas',
    path: 'M 250 190 L 310 190 L 310 250 L 250 250 Z',
    center: { x: 280, y: 220 }
  },
  // Minnesota (MN)
  {
    id: 'MN',
    name: 'Minnesota',
    path: 'M 220 100 L 250 100 L 250 130 L 220 130 Z',
    center: { x: 235, y: 115 }
  },
  // Iowa (IA)
  {
    id: 'IA',
    name: 'Iowa',
    path: 'M 250 130 L 280 130 L 280 160 L 250 160 Z',
    center: { x: 265, y: 145 }
  },
  // Missouri (MO)
  {
    id: 'MO',
    name: 'Missouri',
    path: 'M 250 160 L 280 160 L 280 190 L 250 190 Z',
    center: { x: 265, y: 175 }
  },
  // Arkansas (AR)
  {
    id: 'AR',
    name: 'Arkansas',
    path: 'M 250 190 L 280 190 L 280 220 L 250 220 Z',
    center: { x: 265, y: 205 }
  },
  // Louisiana (LA)
  {
    id: 'LA',
    name: 'Louisiana',
    path: 'M 250 220 L 280 220 L 280 250 L 250 250 Z',
    center: { x: 265, y: 235 }
  },
  // Wisconsin (WI)
  {
    id: 'WI',
    name: 'Wisconsin',
    path: 'M 280 100 L 310 100 L 310 130 L 280 130 Z',
    center: { x: 295, y: 115 }
  },
  // Illinois (IL)
  {
    id: 'IL',
    name: 'Illinois',
    path: 'M 280 130 L 310 130 L 310 160 L 280 160 Z',
    center: { x: 295, y: 145 }
  },
  // Indiana (IN)
  {
    id: 'IN',
    name: 'Indiana',
    path: 'M 310 130 L 340 130 L 340 160 L 310 160 Z',
    center: { x: 325, y: 145 }
  },
  // Ohio (OH)
  {
    id: 'OH',
    name: 'Ohio',
    path: 'M 340 130 L 370 130 L 370 160 L 340 160 Z',
    center: { x: 355, y: 145 }
  },
  // Michigan (MI)
  {
    id: 'MI',
    name: 'Michigan',
    path: 'M 310 100 L 340 100 L 340 130 L 310 130 Z',
    center: { x: 325, y: 115 }
  },
  // Pennsylvania (PA)
  {
    id: 'PA',
    name: 'Pennsylvania',
    path: 'M 370 130 L 400 130 L 400 160 L 370 160 Z',
    center: { x: 385, y: 145 }
  },
  // New York (NY)
  {
    id: 'NY',
    name: 'New York',
    path: 'M 370 100 L 400 100 L 400 130 L 370 130 Z',
    center: { x: 385, y: 115 }
  },
  // Vermont (VT)
  {
    id: 'VT',
    name: 'Vermont',
    path: 'M 400 100 L 430 100 L 430 130 L 400 130 Z',
    center: { x: 415, y: 115 }
  },
  // New Hampshire (NH)
  {
    id: 'NH',
    name: 'New Hampshire',
    path: 'M 430 100 L 460 100 L 460 130 L 430 130 Z',
    center: { x: 445, y: 115 }
  },
  // Maine (ME)
  {
    id: 'ME',
    name: 'Maine',
    path: 'M 460 100 L 490 100 L 490 130 L 460 130 Z',
    center: { x: 475, y: 115 }
  },
  // Massachusetts (MA)
  {
    id: 'MA',
    name: 'Massachusetts',
    path: 'M 400 130 L 430 130 L 430 160 L 400 160 Z',
    center: { x: 415, y: 145 }
  },
  // Rhode Island (RI)
  {
    id: 'RI',
    name: 'Rhode Island',
    path: 'M 430 130 L 460 130 L 460 160 L 430 160 Z',
    center: { x: 445, y: 145 }
  },
  // Connecticut (CT)
  {
    id: 'CT',
    name: 'Connecticut',
    path: 'M 460 130 L 490 130 L 490 160 L 460 160 Z',
    center: { x: 475, y: 145 }
  },
  // New Jersey (NJ)
  {
    id: 'NJ',
    name: 'New Jersey',
    path: 'M 400 160 L 430 160 L 430 190 L 400 190 Z',
    center: { x: 415, y: 175 }
  },
  // Delaware (DE)
  {
    id: 'DE',
    name: 'Delaware',
    path: 'M 430 160 L 460 160 L 460 190 L 430 190 Z',
    center: { x: 445, y: 175 }
  },
  // Maryland (MD)
  {
    id: 'MD',
    name: 'Maryland',
    path: 'M 460 160 L 490 160 L 490 190 L 460 190 Z',
    center: { x: 475, y: 175 }
  },
  // Virginia (VA)
  {
    id: 'VA',
    name: 'Virginia',
    path: 'M 400 190 L 430 190 L 430 220 L 400 220 Z',
    center: { x: 415, y: 205 }
  },
  // West Virginia (WV)
  {
    id: 'WV',
    name: 'West Virginia',
    path: 'M 370 160 L 400 160 L 400 190 L 370 190 Z',
    center: { x: 385, y: 175 }
  },
  // Kentucky (KY)
  {
    id: 'KY',
    name: 'Kentucky',
    path: 'M 340 160 L 370 160 L 370 190 L 340 190 Z',
    center: { x: 355, y: 175 }
  },
  // Tennessee (TN)
  {
    id: 'TN',
    name: 'Tennessee',
    path: 'M 310 160 L 340 160 L 340 190 L 310 190 Z',
    center: { x: 325, y: 175 }
  },
  // Mississippi (MS)
  {
    id: 'MS',
    name: 'Mississippi',
    path: 'M 280 190 L 310 190 L 310 220 L 280 220 Z',
    center: { x: 295, y: 205 }
  },
  // Alabama (AL)
  {
    id: 'AL',
    name: 'Alabama',
    path: 'M 310 190 L 340 190 L 340 220 L 310 220 Z',
    center: { x: 325, y: 205 }
  },
  // Georgia (GA)
  {
    id: 'GA',
    name: 'Georgia',
    path: 'M 340 190 L 370 190 L 370 220 L 340 220 Z',
    center: { x: 355, y: 205 }
  },
  // South Carolina (SC)
  {
    id: 'SC',
    name: 'South Carolina',
    path: 'M 370 190 L 400 190 L 400 220 L 370 220 Z',
    center: { x: 385, y: 205 }
  },
  // North Carolina (NC)
  {
    id: 'NC',
    name: 'North Carolina',
    path: 'M 400 190 L 430 190 L 430 220 L 400 220 Z',
    center: { x: 415, y: 205 }
  },
  // Florida (FL)
  {
    id: 'FL',
    name: 'Florida',
    path: 'M 340 220 L 370 220 L 370 280 L 340 280 Z',
    center: { x: 355, y: 250 }
  }
];

export default function USMapSelector({ selectedStates, onStatesChange, onClose }: USMapSelectorProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<{ x: number; y: number; state: string } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Filter states based on search term
  const filteredStates = US_STATES.filter(state =>
    state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    state.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get university count for a state (this would ideally come from an API or data file)
  const getStateUniversityCount = (stateId: string): number => {
    // This is a placeholder - in a real app, you'd fetch this data
    // For now, return a random number between 5-25 to simulate data
    const stateIndex = US_STATES.findIndex(s => s.id === stateId);
    if (stateIndex === -1) return 0;
    
    // Generate a consistent "random" number based on state ID
    const hash = stateId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash) % 21 + 5; // 5-25 range
  };

  // Handle state selection
  const handleStateClick = (stateId: string) => {
    const newSelectedStates = selectedStates.includes(stateId)
      ? selectedStates.filter(id => id !== stateId)
      : [...selectedStates, stateId];
    onStatesChange(newSelectedStates);
  };

  // Handle zoom controls
  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => {
      const newZoom = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.min(Math.max(newZoom, 0.5), 3);
    });
  };

  // Handle pan start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Handle pan move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // Handle pan end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 'out' : 'in';
    handleZoom(delta);
  };

  // Reset view
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Get state styling
  const getStateColor = (stateId: string) => {
    if (selectedStates.includes(stateId)) {
      return '#FFFFFF'; // White for all states
    }
    return '#FFFFFF'; // White for all states
  };

  const getStateStroke = (stateId: string) => {
    if (selectedStates.includes(stateId)) {
      return '#3B82F6'; // Blue border for selected states
    }
    if (hoveredState === stateId) {
      return '#10B981'; // Green border for hovered states
    }
    const hasUniversities = getStateUniversityCount(stateId) > 0;
    return hasUniversities ? '#F59E0B' : '#6B7280'; // Orange for states with universities, gray for others
  };

  const getStateStrokeWidth = (stateId: string) => {
    if (selectedStates.includes(stateId)) {
      return 3; // Thicker border for selected states
    }
    if (hoveredState === stateId) {
      return 2.5; // Medium border for hovered states
    }
    return 1.5; // Default border width
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '0':
          resetView();
          break;
        case '+':
        case '=':
          handleZoom('in');
          break;
        case '-':
          handleZoom('out');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Select States</h2>
              <p className="text-blue-100 mt-1">
                Click states to select/deselect • Use mouse wheel to zoom • Drag to pan
              </p>
              {selectedStates.length > 0 && (
                <div className="mt-2 text-blue-200 text-sm">
                  {selectedStates.length} state{selectedStates.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={resetView}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
              >
                Reset View
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoom(Math.min(zoom + 0.2, 3))}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Zoom in"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
              <button
                onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
                className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                aria-label="Zoom out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 13H7v-3m0 0h3m-3 0v3" />
                </svg>
              </button>
              <span className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Selection Buttons */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600">Quick Select:</span>
            <button
              onClick={() => onStatesChange(['CA', 'OR', 'WA'])}
              className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              title="Select West Coast"
            >
              West Coast
            </button>
            <button
              onClick={() => onStatesChange(['NY', 'MA', 'CT', 'NJ', 'PA'])}
              className="px-3 py-1.5 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
              title="Select Northeast"
            >
              Northeast
            </button>
            <button
              onClick={() => onStatesChange(['TX', 'FL', 'CA', 'NY', 'IL'])}
              className="px-3 py-1.5 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors"
              title="Select Major States"
            >
              Major States
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative bg-white overflow-hidden">
          <div
            className="relative cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDragging(false)}
            onWheel={handleWheel}
          >
            <div className="flex justify-center items-center p-8">
              <svg
                ref={svgRef}
                width="600"
                height="400"
                viewBox="0 0 600 400"
                className="transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transformOrigin: 'center'
                }}
              >
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#f8fafc" strokeWidth="0.5" opacity="0.4"/>
                  </pattern>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.05"/>
                  </filter>
                </defs>
                <rect width="900" height="600" fill="url(#grid)" />
                
                {/* State boundaries outline */}
                <g filter="url(#shadow)">
                  {filteredStates.map((state) => (
                    <path
                      key={`outline-${state.id}`}
                      d={state.path}
                      fill="none"
                      stroke="#9CA3AF"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  ))}
                </g>
                
                {/* Render each state */}
                {filteredStates.map((state) => (
                  <g key={state.id}>
                    <path
                      d={state.path}
                      fill={getStateColor(state.id)}
                      stroke={getStateStroke(state.id)}
                      strokeWidth={getStateStrokeWidth(state.id)}
                      className="cursor-pointer transition-all duration-200 hover:stroke-2"
                      onClick={() => handleStateClick(state.id)}
                      onMouseEnter={(e) => {
                        setHoveredState(state.id);
                        setTooltip({
                          x: e.clientX,
                          y: e.clientY,
                          state: `${state.name} (${state.id})`
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredState(null);
                        setTooltip(null);
                      }}
                      onMouseMove={(e) => {
                        if (tooltip) {
                          setTooltip({
                            x: e.clientX,
                            y: e.clientY,
                            state: `${state.name} (${state.id})`
                          });
                        }
                      }}
                      aria-label={`${state.name} (${state.id})`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleStateClick(state.id);
                        }
                      }}
                    />
                                      {/* State label */}
                  <text
                    x={state.center.x}
                    y={state.center.y}
                    className="text-xs font-semibold pointer-events-none"
                    fill={selectedStates.includes(state.id) ? '#1E40AF' : '#374151'}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {state.id}
                  </text>
                  </g>
                ))}
              </svg>

              {/* Zoom indicator */}
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2 text-sm font-medium text-gray-700">
                {Math.round(zoom * 100)}%
              </div>
              
              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white border-2 border-blue-500 rounded"></div>
                    <span className="text-gray-700">Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white border-2 border-orange-500 rounded"></div>
                    <span className="text-gray-700">Has Universities</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white border-2 border-gray-500 rounded"></div>
                    <span className="text-gray-700">No Universities</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg pointer-events-none"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
              transform: 'translateY(-100%)'
            }}
          >
            {tooltip.state}
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Selected States</h3>
              {selectedStates.length === 0 ? (
                <p className="text-gray-500 text-sm">No states selected yet. Click on the map to select states.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedStates.map((stateId) => {
                    const state = US_STATES.find(s => s.id === stateId);
                    return (
                      <span
                        key={stateId}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        {state?.name || stateId}
                        <button
                          onClick={() => handleStateClick(stateId)}
                          className="ml-2 text-blue-600 hover:text-blue-800 font-bold hover:bg-blue-200 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                          aria-label={`Remove ${state?.name || stateId}`}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => onStatesChange([])}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
          
          {/* State Information */}
          {selectedStates.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">State Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {selectedStates.map((stateId) => {
                  const state = US_STATES.find(s => s.id === stateId);
                  const universityCount = getStateUniversityCount(stateId);
                  return (
                    <div key={stateId} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-800">{state?.name}</div>
                      <div className="text-xs text-gray-600">{universityCount} universities</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 