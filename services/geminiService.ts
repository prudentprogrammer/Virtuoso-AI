import { GoogleGenAI } from "@google/genai";
import { GEMINI_MODEL } from "../constants";
import { AnalysisRequest, AnalysisResult } from "../types";
import { fileToBase64, getMimeType } from "./utils";

// Initialize Gemini Client
// API_KEY is expected to be available in the environment variables
const apiKey = process.env.API_KEY;
console.log('API Key present:', !!apiKey);
console.log('API Key prefix:', apiKey?.substring(0, 10));

if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const analyzePerformance = async (request: AnalysisRequest): Promise<AnalysisResult> => {
  try {
    if (!request.teacherMedia.file || !request.studentMedia.file) {
      throw new Error("Missing media files for analysis.");
    }

    const teacherBase64 = await fileToBase64(request.teacherMedia.file);
    const studentBase64 = await fileToBase64(request.studentMedia.file);

    const teacherPart = {
      inlineData: {
        mimeType: getMimeType(request.teacherMedia.file),
        data: teacherBase64
      }
    };

    const studentPart = {
      inlineData: {
        mimeType: getMimeType(request.studentMedia.file),
        data: studentBase64
      }
    };

    const promptText = `
      Act as a world-class music virtuoso and teacher (like a combination of the best conservatory professors).
      
      I am providing two inputs:
      1. THE TEACHER (Reference Performance).
      2. THE STUDENT (Practice Performance).
      
      Lesson Context: "${request.context}"
      
      Your task is to analyze the Student's performance against the Teacher's reference.
      Compare them based on:
      1. Rhythm & Timing (Is the student rushing or dragging? Are the rhythmic subdivisions accurate?)
      2. Pitch & Intonation (If applicable, is the student in tune?)
      3. Phrasing & Dynamics (Is the student matching the emotional contour and volume changes?)
      4. Technique (If video is provided, observe posture, hand shape, bow speed, stick control, etc.)
      
      Output Format:
      Please provide the response in valid Markdown.
      Use the following structure:
      
      ## 🎵 Executive Summary
      (A 2-sentence overview of how close the student is)
      
      ## ✅ Strengths
      (What did the student do well compared to the teacher?)
      
      ## ⚠️ Areas for Correction
      (Specific moments or techniques that deviated from the reference)
      
      ## 🎓 Coach's Action Plan
      (3 distinct, actionable exercises or mental cues to fix the issues)
      
      Tone: Encouraging but very precise and demanding of high quality.
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          { text: "Here is the Teacher Reference Clip:" },
          teacherPart,
          { text: "Here is the Student Practice Clip:" },
          studentPart,
          { text: promptText }
        ]
      },
      config: {
        temperature: 0.4, // Lower temperature for more analytical/precise feedback
      }
    });

    if (!response.text) {
      throw new Error("No analysis generated.");
    }

    return {
      markdown: response.text,
      timestamp: Date.now()
    };

  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    console.error("Error message:", error?.message);
    console.error("Error response:", error?.response);
    throw error;
  }
};
