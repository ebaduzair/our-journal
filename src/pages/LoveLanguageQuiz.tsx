import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loveLanguageQuestions, loveLanguageInfo } from '@/data/loveLanguageQuiz';
import type { LoveLanguage, LoveLanguageResult } from '@/types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

type QuizState = 'select-person' | 'quiz' | 'results';

const languageColors: Record<LoveLanguage, string> = {
  words: 'hsl(var(--primary))',
  acts: 'hsl(var(--coral))',
  gifts: 'hsl(var(--gold))',
  time: '#8b5cf6',
  touch: '#ec4899',
};

const LoveLanguageQuiz = () => {
  const [results, setResults] = useLocalStorage<LoveLanguageResult[]>('love-language-results', []);
  const [quizState, setQuizState] = useState<QuizState>('select-person');
  const [currentPerson, setCurrentPerson] = useState<'me' | 'partner'>('me');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<LoveLanguage, number>>({
    words: 0,
    acts: 0,
    gifts: 0,
    time: 0,
    touch: 0,
  });

  const myResult = results.find(r => r.person === 'me');
  const partnerResult = results.find(r => r.person === 'partner');

  const startQuiz = (person: 'me' | 'partner') => {
    setCurrentPerson(person);
    setCurrentQuestion(0);
    setScores({ words: 0, acts: 0, gifts: 0, time: 0, touch: 0 });
    setQuizState('quiz');
  };

  const handleAnswer = (language: LoveLanguage) => {
    const newScores = { ...scores, [language]: scores[language] + 1 };
    setScores(newScores);

    if (currentQuestion < loveLanguageQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz complete - calculate result
      const primaryLanguage = (Object.entries(newScores) as [LoveLanguage, number][])
        .sort((a, b) => b[1] - a[1])[0][0];

      const newResult: LoveLanguageResult = {
        person: currentPerson,
        scores: newScores,
        primaryLanguage,
        completedAt: new Date(),
      };

      // Update or add result
      const existingIndex = results.findIndex(r => r.person === currentPerson);
      if (existingIndex >= 0) {
        const updated = [...results];
        updated[existingIndex] = newResult;
        setResults(updated);
      } else {
        setResults([...results, newResult]);
      }

      setQuizState('results');
    }
  };

  const getChartData = (result: LoveLanguageResult) => {
    return Object.entries(result.scores).map(([key, value]) => ({
      name: loveLanguageInfo[key as LoveLanguage].emoji,
      fullName: loveLanguageInfo[key as LoveLanguage].name,
      value,
      language: key as LoveLanguage,
    })).sort((a, b) => b.value - a.value);
  };

  const question = loveLanguageQuestions[currentQuestion];
  const currentResult = results.find(r => r.person === currentPerson);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-romantic text-2xl font-semibold text-gradient">Love Language Quiz</h1>
            <p className="text-sm text-muted-foreground">Discover how you give and receive love</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          {quizState === 'select-person' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Existing Results */}
              {(myResult || partnerResult) && (
                <div className="space-y-4">
                  <h3 className="font-medium text-muted-foreground">Your Results</h3>
                  
                  {myResult && (
                    <Card className="border-primary/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>My Love Language</span>
                          <span className="text-2xl">{loveLanguageInfo[myResult.primaryLanguage].emoji}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-romantic text-lg text-primary mb-3">
                          {loveLanguageInfo[myResult.primaryLanguage].name}
                        </p>
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getChartData(myResult)} layout="vertical">
                              <XAxis type="number" hide />
                              <YAxis type="category" dataKey="name" width={30} />
                              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {getChartData(myResult).map((entry) => (
                                  <Cell key={entry.language} fill={languageColors[entry.language]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {partnerResult && (
                    <Card className="border-coral/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>Partner's Love Language</span>
                          <span className="text-2xl">{loveLanguageInfo[partnerResult.primaryLanguage].emoji}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-romantic text-lg text-coral mb-3">
                          {loveLanguageInfo[partnerResult.primaryLanguage].name}
                        </p>
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getChartData(partnerResult)} layout="vertical">
                              <XAxis type="number" hide />
                              <YAxis type="category" dataKey="name" width={30} />
                              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {getChartData(partnerResult).map((entry) => (
                                  <Cell key={entry.language} fill={languageColors[entry.language]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Take Quiz Cards */}
              <div className="space-y-3">
                <h3 className="font-medium text-muted-foreground">
                  {myResult || partnerResult ? 'Retake Quiz' : 'Take the Quiz'}
                </h3>
                
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow border-primary/30"
                  onClick={() => startQuiz('me')}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full gradient-romantic flex items-center justify-center">
                      <Heart className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Take Quiz for Me</h4>
                      <p className="text-sm text-muted-foreground">Discover your love language</p>
                    </div>
                    {myResult && <RotateCcw className="w-4 h-4 text-muted-foreground" />}
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow border-coral/30"
                  onClick={() => startQuiz('partner')}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-coral/20 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-coral" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Take Quiz for Partner</h4>
                      <p className="text-sm text-muted-foreground">Help them discover theirs</p>
                    </div>
                    {partnerResult && <RotateCcw className="w-4 h-4 text-muted-foreground" />}
                  </CardContent>
                </Card>
              </div>

              {/* Info about love languages */}
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">The 5 Love Languages</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    {(Object.entries(loveLanguageInfo) as [LoveLanguage, typeof loveLanguageInfo.words][]).map(([key, info]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span>{info.emoji}</span>
                        <span className="text-muted-foreground">{info.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {quizState === 'quiz' && question && (
            <motion.div
              key={`question-${currentQuestion}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Question {currentQuestion + 1} of {loveLanguageQuestions.length}</span>
                  <span>{currentPerson === 'me' ? 'For Me' : 'For Partner'}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full gradient-romantic"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestion + 1) / loveLanguageQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <Card className="border-primary/30">
                <CardContent className="p-6">
                  <p className="font-romantic text-xl text-center mb-6">
                    {question.question}
                  </p>

                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full py-6 h-auto text-left justify-start"
                      onClick={() => handleAnswer(question.optionA.language)}
                    >
                      <span className="text-xl mr-3">A</span>
                      <span className="flex-1">{question.optionA.text}</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full py-6 h-auto text-left justify-start"
                      onClick={() => handleAnswer(question.optionB.language)}
                    >
                      <span className="text-xl mr-3">B</span>
                      <span className="flex-1">{question.optionB.text}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Button
                variant="ghost"
                onClick={() => setQuizState('select-person')}
                className="w-full"
              >
                Cancel Quiz
              </Button>
            </motion.div>
          )}

          {quizState === 'results' && currentResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Result Hero */}
              <Card className="overflow-hidden">
                <div className="gradient-romantic p-6 text-center text-primary-foreground">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-6xl mb-3"
                  >
                    {loveLanguageInfo[currentResult.primaryLanguage].emoji}
                  </motion.div>
                  <h2 className="font-romantic text-2xl mb-1">
                    {currentPerson === 'me' ? 'Your' : "Partner's"} Love Language
                  </h2>
                  <p className="text-xl font-semibold">
                    {loveLanguageInfo[currentResult.primaryLanguage].name}
                  </p>
                </div>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-center">
                    {loveLanguageInfo[currentResult.primaryLanguage].description}
                  </p>
                </CardContent>
              </Card>

              {/* Score Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">All Languages Ranked</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartData(currentResult)} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={30} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {getChartData(currentResult).map((entry) => (
                            <Cell key={entry.language} fill={languageColors[entry.language]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    {getChartData(currentResult).map((entry) => (
                      <div key={entry.language} className="flex items-center gap-2">
                        <span>{entry.name}</span>
                        <span className="text-muted-foreground">{entry.fullName}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-gold/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>💡</span>
                    How to Show Love
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {loveLanguageInfo[currentResult.primaryLanguage].tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Heart className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Button
                onClick={() => setQuizState('select-person')}
                className="w-full gradient-romantic text-primary-foreground"
              >
                Back to Results
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoveLanguageQuiz;
