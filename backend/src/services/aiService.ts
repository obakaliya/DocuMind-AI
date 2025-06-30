import fetch from 'node-fetch';
import { AnalysisResult } from '../types';

const ANALYSIS_PROMPT = `Analyze this legal document and provide a structured response with:

1. SUMMARY (2-3 sentences)
2. KEY PARTIES (names and roles)
3. IMPORTANT DATES (deadlines, effective dates, expiration)
4. FINANCIAL TERMS (amounts, payment schedules, penalties)
5. KEY OBLIGATIONS (what each party must do)
6. RISKS (potential legal or business risks)
7. TERMINATION CONDITIONS (how the agreement can end)

Document text: [DOCUMENT_CONTENT]

Format your response as JSON with these exact keys: summary, parties, dates, financial_terms, obligations, risks, termination_conditions

For parties, use this structure: [{"name": "string", "role": "string", "type": "individual|company|organization"}]
For dates, use this structure: [{"type": "string", "date": "YYYY-MM-DD", "description": "string", "importance": "low|medium|high"}]
For financial_terms, use this structure: [{"type": "payment|penalty|fee|amount", "amount": number, "currency": "string", "description": "string", "due_date": "YYYY-MM-DD"}]
For obligations, use this structure: [{"party": "string", "obligation": "string", "deadline": "YYYY-MM-DD", "priority": "low|medium|high"}]
For risks, use this structure: [{"type": "string", "description": "string", "severity": "low|medium|high", "recommendation": "string"}]

Respond only with valid JSON, no additional text.`;

export const analyzeDocument = async (documentText: string): Promise<AnalysisResult> => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const prompt = ANALYSIS_PROMPT.replace('[DOCUMENT_CONTENT]', documentText);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }

    // Try to parse the JSON response
    try {
      // Clean the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : text;
      
      const analysis = JSON.parse(jsonString);
      
      // Validate and structure the response
      return {
        summary: analysis.summary || 'No summary available',
        parties: analysis.parties || [],
        dates: analysis.dates || [],
        financial_terms: analysis.financial_terms || [],
        obligations: analysis.obligations || [],
        risks: analysis.risks || [],
        termination_conditions: analysis.termination_conditions || []
      };
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', text);
      throw new Error('Invalid AI response format');
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('Failed to analyze document');
  }
};

export const calculateConfidenceScore = (analysis: AnalysisResult): number => {
  let score = 0;
  let totalChecks = 0;

  // Check if we have a summary
  if (analysis.summary && analysis.summary.length > 10) {
    score += 0.2;
  }
  totalChecks++;

  // Check if we have parties
  if (analysis.parties && analysis.parties.length > 0) {
    score += 0.2;
  }
  totalChecks++;

  // Check if we have dates
  if (analysis.dates && analysis.dates.length > 0) {
    score += 0.2;
  }
  totalChecks++;

  // Check if we have financial terms
  if (analysis.financial_terms && analysis.financial_terms.length > 0) {
    score += 0.2;
  }
  totalChecks++;

  // Check if we have risks
  if (analysis.risks && analysis.risks.length > 0) {
    score += 0.2;
  }
  totalChecks++;

  return Math.round((score / totalChecks) * 100) / 100;
}; 