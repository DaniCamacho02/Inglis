
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = typeof process !== "undefined" && process.env && process.env.API_KEY ? process.env.API_KEY : "";
const ai = new GoogleGenAI({ apiKey: apiKey });

const MODEL_FAST = "gemini-2.5-flash";
const MODEL_SMART = "gemini-2.5-flash"; 

const parseAIResponse = <T>(text: string, fallback: T): T => {
    if (!text) return fallback;
    try {
        let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
        const firstBrace = cleaned.indexOf('{');
        const firstBracket = cleaned.indexOf('[');
        let start = -1;
        let end = -1;

        if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
            start = firstBrace;
            end = cleaned.lastIndexOf('}');
        } else if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
            start = firstBracket;
            end = cleaned.lastIndexOf(']');
        }

        if (start !== -1 && end !== -1) {
            const jsonString = cleaned.substring(start, end + 1);
            return JSON.parse(jsonString);
        }
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Failed:", e);
        return fallback;
    }
};

export const GeminiService = {
  generateVocabulary: async (topic: string, mode: string = "Topic", level: string = "C1", language: string = "English") => {
    const prompt = `Generate exactly 40 advanced ${language} vocabulary items (words, idioms, or collocations) specifically for Level ${level}.
    Mode: ${mode}. Topic context: "${topic}". 
    Output JSON array: [{
        word, 
        translationES (Spanish translation), 
        definitionES (Definition in SPANISH/Castellano), 
        exampleEN (Sentence in ${language}), 
        synonyms (array of ${language} synonyms)
    }].`;

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
                translationES: { type: Type.STRING, description: "Translation in Spanish" },
                definitionES: { type: Type.STRING, description: "Definition in Spanish" },
                exampleEN: { type: Type.STRING },
                synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["word", "translationES", "definitionES", "exampleEN", "synonyms"]
            }
          }
        }
      });
      return parseAIResponse(response.text, []);
    } catch (error) {
      return [];
    }
  },
  
  generateSingleVocabCard: async (word: string, language: string = "English") => {
      const prompt = `Create a single vocabulary card for the word/phrase: "${word}" in ${language}.
      Output JSON strictly: {
          word, 
          translationES (Spanish translation), 
          definitionES (Definition in SPANISH/Castellano), 
          exampleEN (Sentence in ${language}), 
          synonyms (array of ${language} synonyms)
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
                          word: { type: Type.STRING },
                          translationES: { type: Type.STRING },
                          definitionES: { type: Type.STRING },
                          exampleEN: { type: Type.STRING },
                          synonyms: { type: Type.ARRAY, items: { type: Type.STRING } }
                      },
                      required: ["word", "translationES", "definitionES", "exampleEN", "synonyms"]
                  }
              }
          });
          return parseAIResponse(response.text, null);
      } catch (e) {
          return null;
      }
  },

  generateVocabQuiz: async (topic: string, level: string, language: string = "English") => {
      const prompt = `Create a 10-question Vocabulary Quiz in ${language}. Topic: ${topic}. Level: ${level}.
      Questions and Options MUST be in ${language}.
      Explanation MUST be in Spanish (Castellano) explaining why the answer is correct.
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
                              explanation: { type: Type.STRING }
                          },
                          required: ["id", "question", "options", "correctIndex", "explanation"]
                      }
                  }
              }
          });
          return parseAIResponse(response.text, []);
      } catch (error) {
          return [];
      }
  },

  generateGrammarInfographic: async (topic: string, level: string = "C1", language: string = "English") => {
      const prompt = `Create a Visual Grammar Blueprint/Cheat Sheet for: "${topic}" adapted for ${language} Level ${level}.
      Output JSON strictly.
      Content Language Rules:
      1. Title: ${language}
      2. Structure: ${language} (The formula)
      3. Examples: ${language}
      4. Definition: SPANISH (Explicación clara en castellano)
      5. UsageContext: SPANISH (Cuándo usarlo, en castellano)
      6. Tips: SPANISH (Consejos en castellano)
      7. CommonMistakes: SPANISH (Errores comunes explicados en castellano)
      8. NativeNuance: SPANISH (Matiz nativo explicado en castellano)
      9. Mnemonic: SPANISH (Regla mnemotécnica en castellano)
      10. VisualMetaphor: SPANISH (Descripción visual en castellano)`;

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
                        usageContext: { type: Type.STRING },
                        examples: { type: Type.ARRAY, items: { type: Type.STRING } },
                        tips: { type: Type.STRING },
                        commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
                        nativeNuance: { type: Type.STRING },
                        mnemonic: { type: Type.STRING },
                        visualMetaphor: { type: Type.STRING },
                        customSections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {title: {type: Type.STRING}, content: {type: Type.STRING}} } }
                    },
                    required: ["title", "definition", "structure", "usageContext", "examples", "tips", "commonMistakes", "nativeNuance", "mnemonic", "visualMetaphor"]
                }
            }
        });
        return parseAIResponse(response.text, null);
      } catch (e) {
          return null;
      }
  },

  expandGrammarChart: async (topic: string, query: string) => {
      const prompt = `User wants to expand a grammar chart about "${topic}". Query: "${query}". 
      Provide a concise academic explanation in SPANISH (Castellano), but use target language for examples.
      JSON Output: {title, content}.`;
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
                          content: { type: Type.STRING }
                      },
                      required: ["title", "content"]
                  }
              }
          });
          return parseAIResponse(response.text, null);
      } catch (e) {
          return null;
      }
  },

  generateQuiz: async (topic: string, count: number, level: string, language: string = "English") => {
    const prompt = `Create a multiple choice quiz in ${language}. Topic: "${topic}". Questions: ${count}. Level: ${level}. 
    Questions and Options MUST be in ${language}.
    Explanation MUST be in SPANISH (Castellano). 
    Output JSON array.`;
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
                            explanation: { type: Type.STRING }
                        },
                        required: ["id", "question", "options", "correctIndex", "explanation"]
                    }
                }
            }
        });
        return parseAIResponse(response.text, []);
    } catch (error) {
        return [];
    }
  },

  evaluateWriting: async (text: string, type: string, level: string = "C1", language: string = "English") => {
      const prompt = `Act as a ${language} examiner (Level ${level}). Evaluate this ${type}: "${text}".
      Return JSON: {score (0-20), feedback (in SPANISH), correctedText (in ${language})}.`;
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
          return parseAIResponse(response.text, { score: 0, feedback: "Error", correctedText: text });
      } catch (error) {
          throw error;
      }
  },

  chatWithTutor: async (message: string, history: any[], personaInstruction: string, language: string = "English") => {
    try {
        const fullInstruction = `${personaInstruction}. You are teaching the user ${language}. When user speaks in Spanish, explain in Spanish. When testing or giving examples, use ${language}.`;
        const chat = ai.chats.create({
            model: MODEL_FAST,
            history: history,
            config: { systemInstruction: fullInstruction }
        });
        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (e) {
        return "System error.";
    }
  },
  
  chatConversation: async (message: string, level: string, language: string = "English") => {
      const prompt = `You are a conversational partner for a student learning ${language} at level ${level}. 
      Keep your responses relatively short (1-2 sentences) to keep the flow natural. 
      Respond IN ${language} ONLY.
      Correct any major mistakes gently.
      The user says: "${message}"`;
      
      try {
          const result = await ai.models.generateContent({
              model: MODEL_FAST,
              contents: prompt
          });
          return result.text;
      } catch (e) {
          return "Connection interference.";
      }
  },

  generateStudyPlan: async (hours: number, focus: string) => {
      const prompt = `Weekly study plan. ${hours} hours/week. Focus: "${focus}". 
      Output JSON array of Days with Tasks.
      The 'description' of the tasks should be in SPANISH (Castellano) so the user understands exactly what to do.`;
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
                            day: { type: Type.STRING },
                            focus: { type: Type.STRING },
                            tasks: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        description: { type: Type.STRING },
                                        completed: { type: Type.BOOLEAN }
                                    }
                                }
                            }
                        },
                        required: ["day", "focus", "tasks"]
                    }
                }
            }
        });
        return parseAIResponse(response.text, []);
    } catch (e) {
        return [];
    }
  },

  generateComplexExam: async (topic: string, level: string = "C1", language: string = "English") => {
      const prompt = `Create a ${language} Exam Simulation (Level ${level}). Topic: "${topic}".
      Output JSON object with 5 sections: READING, CLOZE, WORD_FORMATION, MATCHING, TRANSFORMATION.
      
      CRITICAL LANGUAGE RULES:
      - Texts, Questions, Options, Gaps, and Sentences MUST be in ${language}.
      - Instructions should be in ${language} (standard exam format).
      - However, the 'explanation' field for every question MUST be in SPANISH (Castellano).`;

      try {
          const response = await ai.models.generateContent({
              model: MODEL_SMART,
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          id: { type: Type.STRING },
                          title: { type: Type.STRING },
                          sections: {
                              type: Type.ARRAY,
                              items: {
                                  type: Type.OBJECT,
                                  properties: {
                                      type: { type: Type.STRING, enum: ["READING", "CLOZE", "MATCHING", "TRANSFORMATION", "WORD_FORMATION"] },
                                      id: { type: Type.STRING },
                                      title: { type: Type.STRING },
                                      instruction: { type: Type.STRING },
                                      text: { type: Type.STRING },
                                      questions: { 
                                          type: Type.ARRAY, 
                                          items: {
                                              type: Type.OBJECT,
                                              properties: {
                                                  id: { type: Type.STRING },
                                                  question: { type: Type.STRING },
                                                  options: { type: Type.ARRAY, items: { type: Type.STRING }},
                                                  correctIndex: { type: Type.INTEGER },
                                                  explanation: { type: Type.STRING }
                                              }
                                          }
                                      },
                                      textWithGaps: { type: Type.STRING },
                                      gaps: {
                                          type: Type.ARRAY,
                                          items: {
                                              type: Type.OBJECT,
                                              properties: {
                                                  id: { type: Type.INTEGER },
                                                  answer: { type: Type.STRING }
                                              }
                                          }
                                      },
                                      items: {
                                          type: Type.ARRAY,
                                          items: {
                                              type: Type.OBJECT,
                                              properties: {
                                                  id: { type: Type.STRING },
                                                  sentence: { type: Type.STRING },
                                                  rootWord: { type: Type.STRING },
                                                  answer: { type: Type.STRING },
                                                  sentence1: { type: Type.STRING },
                                                  keyword: { type: Type.STRING },
                                                  sentence2: { type: Type.STRING },
                                                  left: { type: Type.STRING },
                                                  right: { type: Type.STRING } 
                                              }
                                          }
                                      },
                                      pairs: {
                                          type: Type.ARRAY,
                                          items: {
                                              type: Type.OBJECT,
                                              properties: {
                                                  id: { type: Type.STRING },
                                                  left: { type: Type.STRING },
                                                  right: { type: Type.STRING }
                                              }
                                          }
                                      }
                                  }
                              }
                          }
                      },
                      required: ["id", "title", "sections"]
                  }
              }
          });
          return parseAIResponse(response.text, null);
      } catch (error) {
          return null;
      }
  },

  translateText: async (text: string, targetLang: string, mode: 'TRANSLATE' | 'IMPROVE' = 'TRANSLATE') => {
      let prompt = "";
      
      // Dynamic Prompt Construction
      // targetLang can be "English", "Spanish", "French", "Italian", etc.
      // If user selected "TO_TARGET" in UI, 'targetLang' passed here is e.g. "French". Source is Spanish.
      // If user selected "TO_ES", 'targetLang' is "Spanish". Source is inferred from context or explicitly provided.
      
      const sourceLangContext = targetLang === 'Spanish' ? 'the foreign language (English/French/Italian)' : 'Spanish';
      
      if (mode === 'IMPROVE') {
          prompt = `Act as a professional Cambridge/C2 level linguistic editor for ${targetLang}. Rewrite the following text to be more formal, academic, and native-level appropriate. Maintain the original meaning. 
          
          Analyze the changes DEEPLY in SPANISH.
          
          Input: "${text}"
          Output JSON: {
              mainTranslation: string (The improved text in ${targetLang}),
              alternatives: string[] (3 other valid variations in ${targetLang}),
              nuance: string (A detailed, robust explanation IN SPANISH (CASTELLANO) about the style changes, tone improvements, grammatical choices, and why this version is better. Include specific examples.),
              keyVocabulary: string[] (List 4-5 items. Format strictly: 'Word - [Synonym] : Definition in SPANISH')
          }`;
      } else {
          prompt = `Translate the following text into ${targetLang}. Source language is ${sourceLangContext}.
          
          Input: "${text}"
          Output JSON: {
              mainTranslation: string (The translation in ${targetLang}),
              alternatives: string[] (3 distinct valid translations),
              nuance: string (A detailed explanation IN SPANISH (CASTELLANO) explaining the tone, context, why certain words were chosen, and any false friends or grammatical traps avoided. Provide synonyms in Spanish),
              keyVocabulary: string[] (List 4-5 interesting terms. Format strictly: 'Term - [Synonym] : Definition in SPANISH')
          }`;
      }

      try {
          const response = await ai.models.generateContent({
              model: MODEL_FAST,
              contents: prompt,
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          mainTranslation: { type: Type.STRING },
                          alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
                          nuance: { type: Type.STRING },
                          keyVocabulary: { type: Type.ARRAY, items: { type: Type.STRING } }
                      },
                      required: ["mainTranslation", "alternatives", "nuance", "keyVocabulary"]
                  }
              }
          });
          return parseAIResponse(response.text, null);
      } catch (e) {
          return null;
      }
  },

  generateContextQuiz: async (words: string[], count: number = 5) => {
      const prompt = `Create a 'Fill in the Gap' quiz using these specific words: ${JSON.stringify(words)}.
      Generate exactly ${count} sentences. Each sentence must have a blank '______' where one of the provided words fits perfectly.
      Output JSON array: [{ id, sentence, correctAnswer (must be one of the input words), options (array of 4 words from input) }].`;
      
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
                              sentence: { type: Type.STRING },
                              correctAnswer: { type: Type.STRING },
                              options: { type: Type.ARRAY, items: { type: Type.STRING } }
                          },
                          required: ["id", "sentence", "correctAnswer", "options"]
                      }
                  }
              }
          });
          return parseAIResponse(response.text, []);
      } catch (e) {
          return [];
      }
  },
  
  cleanJSON: (text: string): string => {
      return text.replace(/```json/gi, "").replace(/```/g, "").trim();
  }
};
