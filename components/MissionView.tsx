import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import Icon from './Icons';
import DiyaMascot from './DiyaMascot';
import { Mission } from '../data/missions';

interface MissionViewProps {
  mission: Mission;
  onBack: () => void;
  onComplete: (missionId: string) => void;
}

type LessonContent = {
  lesson: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

type LessonState = 'generating' | 'ready' | 'answered' | 'complete' | 'error';

const MissionView: React.FC<MissionViewProps> = ({ mission, onBack, onComplete }) => {
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [lessonImage, setLessonImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [lessonState, setLessonState] = useState<LessonState>('generating');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const generateLesson = async () => {
      setLessonState('generating');
      setIsImageLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const lessonPrompt = `Create a short, simple, engaging micro-lesson for a young learner (adjust for a general audience if the topic is complex) about "${mission.title}". The context is a futuristic AI learning app. The lesson should be no more than 3-4 sentences. After the lesson, create one multiple-choice question to check for understanding. The question must have exactly 4 options, one of which is correct. The topic is part of a larger theme: "${mission.narrative}". Your response must be in a JSON format.`;
        
        const textResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: lessonPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                lesson: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
              },
              required: ['lesson', 'question', 'options', 'correctAnswer']
            },
          },
        });
        
        let jsonString = textResponse.text.trim();
        if (jsonString.startsWith('```json')) {
            jsonString = jsonString.substring(7, jsonString.length - 3).trim();
        } else if (jsonString.startsWith('`')) {
            jsonString = jsonString.substring(1, jsonString.length - 1).trim();
        }

        const content: LessonContent = JSON.parse(jsonString);

        if(!content.options || content.options.length !== 4) {
             throw new Error("AI did not generate 4 valid options.");
        }
        
        setLessonContent(content);

        // Now, generate an image based on the lesson
        const imagePrompt = `A beautiful, vibrant, digital art illustration for a futuristic learning app. The theme is "${mission.title}". The scene should reflect: ${content.lesson}. Use bright, glowing, cosmic colors.`;
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: imagePrompt,
            config: {
                numberOfImages: 1,
                aspectRatio: '16:9'
            }
        });

        const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
        setLessonImage(`data:image/png;base64,${base64ImageBytes}`);
        setIsImageLoading(false);
        setLessonState('ready');

      } catch (error) {
        console.error("Failed to generate lesson:", error);
        setLessonState('error');
      }
    };
    generateLesson();
  }, [mission.id]);

  useEffect(() => {
      if(lessonState === 'complete') {
          const timer = setTimeout(() => {
              onBack();
          }, 3000);
          return () => clearTimeout(timer);
      }
  }, [lessonState, onBack]);

  const handleAnswer = (option: string) => {
    if (lessonState !== 'ready') return;
    setSelectedAnswer(option);
    setLessonState('answered');
    const correct = option === lessonContent?.correctAnswer;
    setIsCorrect(correct);
    if(correct) {
      setTimeout(() => {
        setLessonState('complete');
        onComplete(mission.id);
      }, 1500);
    }
  };


  const renderContent = () => {
    switch (lessonState) {
      case 'generating':
        return (
          <div className="text-center p-8">
            <DiyaMascot className="w-24 h-24 mx-auto" />
            <p className="text-yellow-300 animate-pulse mt-4 text-lg">Generating Mission Transmission...</p>
          </div>
        );
      case 'error':
        return (
          <div className="text-center p-8 text-red-400">
            <Icon name="analyze" className="w-16 h-16 mx-auto mb-4"/>
            <h3 className="text-xl font-bold">Transmission Glitch!</h3>
            <p>A cosmic ray interfered with our connection. Please return to the galaxy and try again.</p>
             <button onClick={onBack} className="mt-4 bg-yellow-400 text-black font-bold py-2 px-5 rounded-full text-sm">Return to Galaxy</button>
          </div>
        );
      case 'complete':
          return (
             <div className="text-center p-8 text-green-400">
                <Icon name="sparkle" className="w-16 h-16 mx-auto mb-4"/>
                <h3 className="text-2xl font-bold font-brand">Mission Complete!</h3>
                <p className="text-lg">Excellent work! Your knowledge grows. Returning to the galaxy...</p>
                <button onClick={onBack} className="mt-4 bg-yellow-400 text-black font-bold py-2 px-5 rounded-full text-sm">Return to Galaxy</button>
             </div>
          );
      case 'ready':
      case 'answered':
        if (!lessonContent) return null;
        return (
          <>
            <div className="w-full aspect-video bg-black/30 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
              {isImageLoading ? <DiyaMascot className="w-12 h-12" /> : <img src={lessonImage!} alt={mission.title} className="w-full h-full object-cover"/>}
            </div>
            <div className="prose prose-invert max-w-none text-slate-200">
              <p>{lessonContent.lesson}</p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">{lessonContent.question}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lessonContent.options.map(option => {
                  const isSelected = selectedAnswer === option;
                  let buttonClass = 'bg-black/30 border-white/20 hover:bg-white/20';
                  if (lessonState === 'answered' && isSelected) {
                    buttonClass = isCorrect ? 'bg-green-500/50 border-green-400' : 'bg-red-500/50 border-red-400';
                  }
                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      disabled={lessonState === 'answered'}
                      className={`p-4 rounded-lg text-left w-full transition-all duration-300 border-2 ${buttonClass}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {lessonState === 'answered' && !isCorrect && (
                 <div className="text-center mt-4">
                    <p className="text-red-400 animate-pulse">Not quite. That's a different cosmic echo.</p>
                    <button onClick={onBack} className="mt-2 text-yellow-300 underline font-semibold">Try again later</button>
                 </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="p-4 animate-fadeIn">
      {lessonState !== 'complete' && <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-slate-300 font-semibold mb-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        <Icon name="arrowLeft" className="w-5 h-5" />
        Return to Galaxy
      </button>}
      <div className="bg-black/20 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg">
        <h1 className="text-3xl font-bold font-brand text-yellow-300">{mission.title}</h1>
        <p className="text-lg text-slate-300 mt-1 mb-6">{mission.narrative}</p>
        {renderContent()}
      </div>
    </div>
  );
};

export default MissionView;