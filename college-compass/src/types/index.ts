export interface University {
  name: string;
  state: string;
  avg_gpa: number;
  avg_sat: number;
  acceptance_rate: number;
  tuition: number;
  preferred_majors: string[];
  extracurricular_importance: 'high' | 'medium' | 'low';
}

export interface AssessmentForm {
  gpa: number;
  sat: number;
  act?: number;
  major: string;
  location?: string[];
  budget?: number;
  extracurriculars: string[];
  extracurricularDetails: string;
  essay: string;
}

export interface UniversityResult {
  university: University;
  basicProbability: number;
  aiVerdict: 'Likely Admit' | 'Possible Admit' | 'Unlikely Admit';
  strengthScore: number;
}

export interface AIEvaluation {
  evaluation: string;
  strengthScore: number;
  universityVerdicts: {
    [universityName: string]: 'Likely Admit' | 'Possible Admit' | 'Unlikely Admit';
  };
  suggestions: string[];
}

export interface AssessmentResult {
  universities: UniversityResult[];
  aiEvaluation: AIEvaluation;
  overallStrengthScore: number;
} 