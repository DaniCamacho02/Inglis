import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_FAST = "gemini-2.5-flash";
const MODEL_SMART = "gemini-2.5-flash"; 

export const GeminiService = {
  generateVocabulary: async (topic: string, mode: string = "Topic") => {
    const prompt = `Generate 20 High-Level English vocabulary items for Cambridge C1/C2.
    Mode: ${mode} (e.g. Idioms, Collocations, Standard Vocab).
    Topic context: "${topic}". 
    Provide the output strictly as a JSON array of objects.
    Each object must have:
    - word (string)
    - definitionES (string, concise definition in Spanish)
    - exampleEN (string, example sentence in English)
    - synonyms (array of strings, 2 synonyms)
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                definitionES: { type: Type.STRING },
                exampleEN: { type: Type.STRING },
                synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["word", "definitionES", "exampleEN", "synonyms"]
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("GenAI Vocab Error:", error);
      return [];
    }
  },

  generateVocabQuiz: async (topic: string, difficulty: string) => {
      const prompt = `Create a 10-question Vocabulary Quiz. 
      Topic: ${topic}. 
      Difficulty: ${difficulty} (Standard C1 vs Nightmare C2).
      If Nightmare, use very obscure words or tricky false friends.
      Return strictly JSON array.`;
  
      try {
          const response = await ai.models.generateContent({
              model: MODEL_FAST,
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.ARRAY,
                      items: {
                          type: Type.OBJECT,
                          properties: {
                              id: { type: Type.STRING },
                              question: { type: Type.STRING },
                              options: { type: Type.ARRAY, items: { type: Type.STRING } },
                              correctIndex: { type: Type.INTEGER },
                              explanation: { type: Type.STRING, description: "Short explanation in Spanish" }
                          },
                          required: ["id", "question", "options", "correctIndex", "explanation"]
                      }
                  }
              }
          });
          return JSON.parse(response.text || "[]");
      } catch (error) {
          return [];
      }
  },

  generateGrammarInfographic: async (topic: string) => {
      const prompt = `Create a COMPLETE C1/C2 English Grammar Cheat Sheet for: "${topic}".
      It must be rich in detail, suitable for a professional infographic.
      Return JSON strictly:
      {
        "title": "The specific grammar topic name",
        "definition": "A clear, professional definition in Spanish.",
        "structure": "The grammatical formula",
        "examples": ["Example 1", "Example 2", "Example 3"],
        "tips": "A crucial pro-tip.",
        "commonMistakes": ["A common error students make with this structure", "Another error"],
        "nativeNuance": "A subtle detail that makes you sound like a native speaker (Spanish explanation)"
      }`;

      try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        definition: { type: Type.STRING },
                        structure: { type: Type.STRING },
                        examples: { type: Type.ARRAY, items: { type: Type.STRING } },
                        tips: { type: Type.STRING },
                        commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
                        nativeNuance: { type: Type.STRING }
                    },
                    required: ["title", "definition", "structure", "examples", "tips", "commonMistakes", "nativeNuance"]
                }
            }
        });
        return JSON.parse(response.text || "{}");
      } catch (e) {
          return null;
      }
  },

  generateQuiz: async (topic: string) => {
    const prompt = `Create a 5-question multiple choice quiz for C1 Advanced English regarding: "${topic}".
    Focus on tricky structures.
    Return strictly JSON.`;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctIndex: { type: Type.INTEGER },
                            explanation: { type: Type.STRING, description: "Short explanation in Spanish" }
                        },
                        required: ["id", "question", "options", "correctIndex", "explanation"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error("GenAI Quiz Error", error);
        return [];
    }
  },

  evaluateWriting: async (text: string, type: string) => {
      const prompt = `Act as a strict Cambridge C1 Advanced examiner. Evaluate this ${type}:
      "${text}"
      
      Return a JSON object with:
      - score (number 0-20)
      - feedback (string, in Spanish, constructive criticism and strengths)
      - correctedText (string, the fully corrected version in native-level English)
      `;

      try {
          const response = await ai.models.generateContent({
              model: MODEL_SMART,
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          score: { type: Type.NUMBER },
                          feedback: { type: Type.STRING },
                          correctedText: { type: Type.STRING }
                      },
                      required: ["score", "feedback", "correctedText"]
                  }
              }
          });
          return JSON.parse(response.text || "{}");
      } catch (error) {
          console.error("GenAI Writing Error", error);
          throw error;
      }
  },

  chatWithTutor: async (message: string, history: {role: string, parts: {text: string}[]}[]) => {
    try {
        const chat = ai.chats.create({
            model: MODEL_FAST,
            history: history,
            config: {
                // Deadpool Persona Instruction
                systemInstruction: "You are 'Pool-E', a sarcastic, funny, 4th-wall breaking AI tutor who thinks he is Deadpool. You help the user prepare for Cambridge C1. You speak in Spanish but use English for examples. You are chaotic but extremely knowledgeable about grammar. Make references to chimichangas, lazy writers, and breaking the code. Be helpful, but snarky."
            }
        });

        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (e) {
        console.error("Chat error", e);
        return "My healing factor is down... I mean, server error. Try again.";
    }
  },

  generateStudyPlan: async (hours: number, focus: string) => {
      const prompt = `Create a weekly study plan (Markdown format) for a student preparing for Cambridge C1. They have ${hours} hours/week and want to focus on "${focus}". Include daily tasks. Language: Spanish.`;
      try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: prompt
        });
        return response.text;
      } catch (e) {
          return "Error generating plan.";
      }
  }
};