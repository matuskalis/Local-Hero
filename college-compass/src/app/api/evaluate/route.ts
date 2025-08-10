import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AssessmentForm, University, UniversityResult, AIEvaluation, AssessmentResult } from '@/types';

// Initialize OpenAI client (only when needed)
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({ apiKey });
}

// Load universities data
async function loadUniversities(): Promise<University[]> {
  try {
    const universitiesData = await import('@/../../public/universities.json');
    return universitiesData.default as University[];
  } catch (error) {
    console.error('Error loading universities:', error);
    return [];
  }
}

// Calculate basic probability for a university
function calculateBasicProbability(
  userGPA: number,
  userSAT: number,
  university: University
): number {
  // GPA factor (40% weight)
  const gpaDiff = userGPA - university.avg_gpa;
  const gpaScore = Math.max(0, Math.min(100, 50 + (gpaDiff * 20)));

  // SAT factor (40% weight)
  const satDiff = userSAT - university.avg_sat;
  const satScore = Math.max(0, Math.min(100, 50 + (satDiff * 0.05)));

  // Acceptance rate factor (20% weight)
  const acceptanceScore = Math.max(0, 100 - university.acceptance_rate);

  // Calculate weighted score
  const weightedScore = (gpaScore * 0.4) + (satScore * 0.4) + (acceptanceScore * 0.2);

  return Math.round(weightedScore);
}

// Generate algorithmic suggestions based on user profile
function generateAlgorithmicSuggestions(
  userGPA: number,
  userSAT: number,
  extracurriculars: string[]
): string[] {
  const suggestions: string[] = [];

  // GPA-based suggestions
  if (userGPA < 3.5) {
    suggestions.push('Focus on improving your GPA through better study habits and academic support');
  } else if (userGPA < 3.8) {
    suggestions.push('Consider taking advanced courses to boost your GPA further');
  }

  // SAT-based suggestions
  if (userSAT < 1200) {
    suggestions.push('Invest in SAT preparation to improve your score');
  } else if (userSAT < 1400) {
    suggestions.push('Consider retaking the SAT to reach your target score');
  }

  // Extracurricular-based suggestions
  if (extracurriculars.length < 3) {
    suggestions.push('Expand your extracurricular involvement to show well-roundedness');
  }
  if (!extracurriculars.includes('Leadership roles')) {
    suggestions.push('Seek leadership positions in clubs or organizations');
  }
  if (!extracurriculars.includes('Volunteering hours')) {
    suggestions.push('Add community service to demonstrate social responsibility');
  }

  return suggestions;
}

// Get AI evaluation from OpenAI
async function getAIEvaluation(
  formData: AssessmentForm,
  universities: University[]
): Promise<AIEvaluation> {
  try {
    const openai = getOpenAIClient();
    
    // Filter out tests marked as "Don't have"
    const hasSAT = formData.sat !== -1;
    const hasACT = formData.act !== -1;
    
    const prompt = `You are a US university admissions officer with extensive experience evaluating college applications.

Student Profile:
- GPA: ${formData.gpa}/4.0
- SAT: ${hasSAT ? formData.sat : 'Not provided'}
- ACT: ${hasACT ? formData.act : 'Not provided'}
- Intended Major: ${formData.major}
- Location Preference: ${formData.location && formData.location.length > 0 ? formData.location.join(', ') : 'Any'}
- Budget: ${formData.budget ? `$${formData.budget.toLocaleString()}` : 'Any'}
- Extracurricular Activities: ${formData.extracurriculars.join(', ')}
- Extracurricular Details: ${formData.extracurricularDetails}
- Personal Statement: ${formData.essay}

Universities to evaluate: ${universities.map(u => u.name).join(', ')}

Please provide:
1. A brief overall evaluation of the student's profile
2. A strength score (1-100) based on academic performance, extracurriculars, and essay quality
3. For each university, provide a verdict: "Likely Admit", "Possible Admit", or "Unlikely Admit"
4. Specific, actionable suggestions for improvement in this format:
   - "Increase SAT score by X points to improve chances at [University]"
   - "Add [specific activity] to strengthen your profile"
   - "Focus on [specific area] to become more competitive"

Format your response as JSON:
{
  "evaluation": "brief overall assessment",
  "strengthScore": number,
  "universityVerdicts": {
    "University Name": "verdict"
  },
  "suggestions": ["specific improvement suggestions"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    try {
      const parsed = JSON.parse(response);
      return {
        evaluation: parsed.evaluation || 'AI evaluation completed',
        strengthScore: parsed.strengthScore || 70,
        universityVerdicts: parsed.universityVerdicts || {},
        suggestions: parsed.suggestions || ['Focus on improving academic performance and extracurricular involvement']
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return {
        evaluation: 'AI evaluation completed with fallback response',
        strengthScore: 70,
        universityVerdicts: {},
        suggestions: ['Focus on improving academic performance and extracurricular involvement']
      };
    }
  } catch (error) {
    console.error('Error getting AI evaluation:', error);
    // Fallback evaluation
    return {
      evaluation: 'AI evaluation unavailable - using algorithmic assessment',
      strengthScore: 70,
      universityVerdicts: {},
      suggestions: generateAlgorithmicSuggestions(formData.gpa, formData.sat, formData.extracurriculars)
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData: AssessmentForm = await request.json();

    // Load universities
    const universities = await loadUniversities();
    if (universities.length === 0) {
      return NextResponse.json(
        { error: 'Failed to load universities data' },
        { status: 500 }
      );
    }

    // Filter universities based on preferences
    let filteredUniversities = universities;

    // Filter by location if specified
    if (formData.location && formData.location.length > 0) {
      filteredUniversities = filteredUniversities.filter(u => 
        formData.location!.some(loc => 
          u.state.toLowerCase() === loc.toLowerCase()
        )
      );
    }

    // Filter by budget if specified
    if (formData.budget) {
      filteredUniversities = filteredUniversities.filter(u => 
        u.tuition <= formData.budget!
      );
    }

    // If no universities match filters, use all universities
    if (filteredUniversities.length === 0) {
      filteredUniversities = universities;
    }

    // Calculate basic probabilities
    const basicResults: UniversityResult[] = filteredUniversities.map(university => {
      // Handle "Don't have" cases
      const satScore = formData.sat === -1 ? 0 : formData.sat;
      
      const basicProbability = calculateBasicProbability(formData.gpa, satScore, university);
      
      return {
        university,
        basicProbability,
        aiVerdict: 'Possible Admit' as const, // Will be updated by AI
        strengthScore: 0 // Will be updated by AI
      };
    });

    // Sort by basic probability
    basicResults.sort((a, b) => b.basicProbability - a.basicProbability);

    // Get AI evaluation
    const aiEvaluation = await getAIEvaluation(formData, filteredUniversities);

    // Combine basic results with AI evaluation
    const finalResults: UniversityResult[] = basicResults.map(result => ({
      ...result,
      aiVerdict: aiEvaluation.universityVerdicts[result.university.name] || 'Possible Admit',
      strengthScore: aiEvaluation.strengthScore
    }));

    // Calculate overall strength score
    const overallStrengthScore = Math.round(
      finalResults.reduce((sum, result) => sum + result.strengthScore, 0) / finalResults.length
    );

    const assessmentResult: AssessmentResult = {
      universities: finalResults,
      aiEvaluation,
      overallStrengthScore
    };

    return NextResponse.json(assessmentResult);
  } catch (error) {
    console.error('Error in evaluation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 