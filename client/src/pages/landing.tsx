import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Mic, FileText, Sparkles, Clock, GraduationCap, CheckCircle, ClipboardList, Pause, Play, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// LOGO COMPONENT
// ============================================================================

function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Graduation Cap */}
      <g transform="translate(10, 10)">
        {/* Cap top */}
        <path
          d="M15 8 L25 12 L35 8 L25 4 Z"
          fill="currentColor"
        />
        {/* Cap body */}
        <path
          d="M18 12 L18 18 C18 20 20 22 25 22 C30 22 32 20 32 18 L32 12"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Tassel */}
        <line x1="35" y1="8" x2="37" y2="14" stroke="currentColor" strokeWidth="1" />
        <circle cx="37" cy="15" r="1.5" fill="currentColor" />
      </g>

      {/* TeachAssistAi Text */}
      <text x="55" y="32" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="700" fill="currentColor">
        TeachAssistAi
      </text>
    </svg>
  );
}

// ============================================================================
// MARKDOWN RENDERER COMPONENT
// ============================================================================

function MarkdownRenderer({ content }: { content: string }) {
  const renderLine = (line: string, index: number) => {
    // Handle bold text
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;

    while ((match = boldRegex.exec(line)) !== null) {
      // Add text before the bold
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      // Add bold text
      parts.push(<strong key={`bold-${index}-${match.index}`}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return parts.length > 0 ? parts : line;
  };

  const lines = content.split('\n');
  const elements: JSX.Element[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-4" />);
      continue;
    }

    // Bullet point
    if (line.trimStart().startsWith('- ')) {
      const indent = line.length - line.trimStart().length;
      const content = line.trimStart().substring(2);
      elements.push(
        <div key={i} className="flex gap-2" style={{ marginLeft: `${indent * 8}px` }}>
          <span className="text-teal-600 select-none">•</span>
          <span>{renderLine(content, i)}</span>
        </div>
      );
      continue;
    }

    // Numbered list
    const numberedMatch = line.trimStart().match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      const indent = line.length - line.trimStart().length;
      const number = numberedMatch[1];
      const content = numberedMatch[2];
      elements.push(
        <div key={i} className="flex gap-2" style={{ marginLeft: `${indent * 8}px` }}>
          <span className="text-teal-600 select-none">{number}.</span>
          <span>{renderLine(content, i)}</span>
        </div>
      );
      continue;
    }

    // Regular line
    elements.push(
      <div key={i}>{renderLine(line, i)}</div>
    );
  }

  return <div className="space-y-1">{elements}</div>;
}

// ============================================================================
// REPORT WRITING DEMO COMPONENT
// ============================================================================

const reportSpokenText = "anne marie has really good behaviour in class is social ah has a good friend group umm she has done well at numeracy especially skip counting but needs to pay more attention in class in english her reading and writig are improving with well formed letters and use of punctuation err her reading has also improved can etll um there has been more work done at home";

const reportPolishedText = `Anne Marie demonstrates consistently positive behaviour in the classroom, maintaining respectful interactions with her peers and contributing to a supportive learning environment. She has established a good social network and engages well with her classmates. In numeracy, she has shown particular strength in skip counting and continues to develop her mathematical skills.

Her English skills are progressing nicely, with noticeable improvements in reading and writing. Anne Marie is developing well-formed letter formation and demonstrates increasing understanding of punctuation use. Her reading comprehension has advanced, supported by additional practice at home. To further support her learning, Anne Marie would benefit from maintaining her focus during class activities and continuing the consistent home learning support that has been beneficial to her progress.

While Anne Marie demonstrates many positive attributes, there are opportunities to enhance her classroom engagement. Developing more consistent attention during lessons will help her maximise her learning potential and build upon the solid foundation she has already established across various learning areas.`;

const reportFillerWords = ['um', 'umm', 'ah', 'err', 'er', 'uh'];
const reportSpellingErrors = ['etll', 'writig'];
const reportCapitalizationErrors = ['anne', 'marie', 'english'];

function TransformationDemo({ globalPause = false }: { globalPause?: boolean }) {
  const [stage, setStage] = useState<'typing' | 'transforming' | 'polished'>('typing');
  const [displayedSpoken, setDisplayedSpoken] = useState('');
  const [displayedPolished, setDisplayedPolished] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);
  const [manualView, setManualView] = useState<'input' | 'output' | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle global pause
  useEffect(() => {
    if (globalPause) {
      setManualView('output');
      setIsAnimating(false);
    } else {
      setManualView(null);
      setIsAnimating(true);
    }
  }, [globalPause]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(reportPolishedText);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!isAnimating) return;

    if (stage === 'typing') {
      if (displayedSpoken.length < reportSpokenText.length) {
        const timer = setTimeout(() => {
          setDisplayedSpoken(reportSpokenText.slice(0, displayedSpoken.length + 1));
        }, 8);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setStage('transforming');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }

    if (stage === 'transforming') {
      const timer = setTimeout(() => {
        setStage('polished');
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (stage === 'polished') {
      if (displayedPolished.length < reportPolishedText.length) {
        const timer = setTimeout(() => {
          setDisplayedPolished(reportPolishedText.slice(0, displayedPolished.length + 1));
        }, 8);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setStage('typing');
          setDisplayedSpoken('');
          setDisplayedPolished('');
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [stage, displayedSpoken, displayedPolished, isAnimating]);

  const renderSpokenText = (text: string) => {
    const words = text.split(' ');
    let result: JSX.Element[] = [];

    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      if (!word) continue;

      const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
      const isFiller = reportFillerWords.includes(cleanWord);
      const isSpellingError = reportSpellingErrors.includes(cleanWord);
      const isCapitalizationError = reportCapitalizationErrors.includes(cleanWord);

      if (isFiller) {
        result.push(
          <motion.span
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded mx-0.5"
            title="Filler word"
          >
            {word}
          </motion.span>
        );
      } else if (isSpellingError || isCapitalizationError) {
        result.push(
          <motion.span
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline relative"
            title={isSpellingError ? "Spelling error" : "Capitalization error"}
          >
            <span className="relative">
              {word}
              <span className="absolute bottom-0 left-0 right-0 h-[2px]">
                <svg width="100%" height="2" viewBox="0 0 100 2" preserveAspectRatio="none">
                  <path d="M0,1 Q2.5,0 5,1 T10,1 T15,1 T20,1 T25,1 T30,1 T35,1 T40,1 T45,1 T50,1 T55,1 T60,1 T65,1 T70,1 T75,1 T80,1 T85,1 T90,1 T95,1 T100,1"
                        stroke="#ef4444"
                        strokeWidth="2"
                        fill="none"
                  />
                </svg>
              </span>
            </span>
          </motion.span>
        );
      } else {
        result.push(
          <span key={index}>{word}</span>
        );
      }

      if (index < words.length - 1) {
        result.push(' ' as any);
      }
    }

    return result;
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="inline-flex rounded-full bg-gray-100 p-1">
          <button
            onClick={() => {
              setManualView(manualView === 'input' ? null : 'input');
              setIsAnimating(false);
            }}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              manualView === 'input'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Input
          </button>
          <button
            onClick={() => {
              setManualView(manualView === 'output' ? null : 'output');
              setIsAnimating(false);
            }}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              manualView === 'output'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Output
          </button>
        </div>

        <button
          onClick={() => {
            setManualView(null);
            setIsAnimating(!isAnimating);
            if (!isAnimating) {
              setStage('typing');
              setDisplayedSpoken('');
              setDisplayedPolished('');
            }
          }}
          className="px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 text-sm transition-colors"
        >
          {isAnimating ? 'Pause' : 'Restart'}
        </button>
      </div>

      <div className="relative min-h-[450px]">
        <AnimatePresence mode="wait">
          {manualView === 'input' && (
            <motion.div
              key="manual-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Spoken Input</span>
                </div>
                <div className="text-gray-700 leading-relaxed">
                  {renderSpokenText(reportSpokenText)}
                </div>
              </div>
            </motion.div>
          )}

          {manualView === 'output' && (
            <motion.div
              key="manual-output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-6 border-2 border-teal-300 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span className="text-xs text-teal-700 uppercase tracking-wide">Polished Draft</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-teal-700 text-sm transition-colors shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {reportPolishedText}
                </div>
              </div>
            </motion.div>
          )}

          {!manualView && (stage === 'typing' || stage === 'transforming') && (
            <motion.div
              key="spoken"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Spoken Input</span>
                </div>
                <div className="text-gray-700 leading-relaxed">
                  {renderSpokenText(displayedSpoken)}
                  {stage === 'typing' && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-0.5 h-5 bg-gray-700 ml-1"
                    />
                  )}
                </div>
              </div>

              {stage === 'transforming' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-12 h-12 text-teal-600 mx-auto" />
                    </motion.div>
                    <p className="mt-4 text-teal-700">Transforming into polished draft...</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {!manualView && stage === 'polished' && (
            <motion.div
              key="polished"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-6 border-2 border-teal-300 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span className="text-xs text-teal-700 uppercase tracking-wide">Polished Draft</span>
                  </div>
                  {displayedPolished.length === reportPolishedText.length && (
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-teal-700 text-sm transition-colors shadow-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
                <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {displayedPolished}
                  {displayedPolished.length < reportPolishedText.length && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-0.5 h-5 bg-teal-700 ml-1"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// LESSON PLAN DEMO COMPONENT
// ============================================================================

const lessonSpokenText = "teaching narrative writing to grade 4 students umm they need to learn story structure clear beginning middle end mixed class ability err some struggle with organising ideas others are ready for more complex prompts want to use a mentor text and then guided writing practice of about 60 minutes and to include peer feedback";

const lessonPolishedText = `**LESSON BACKGROUND**
- Curriculum Area: English - Narrative Writing
- Year Level: Grade 4 (Stage 2)
- Content Strand: Creating Texts - Narrative Writing
- Duration: 60 minutes

**LEARNING OBJECTIVES**
- Understand the fundamental structure of narrative texts (beginning, middle, end)
- Develop skills in organising story ideas sequentially
- Create a cohesive narrative with clear plot progression
- Use peer feedback to improve writing

**SUCCESS CRITERIA**
Students will:
- Create a narrative with a clear beginning, middle, and end
- Include at least three distinct story events
- Use descriptive language to engage readers
- Provide constructive feedback to a peer
- Self-assess their narrative structure

**POTENTIAL MISCONCEPTIONS**
- Believing a story is just a series of random events
- Struggling to create logical plot progression
- Difficulty distinguishing between dialogue and narrative
- Thinking descriptive details are unnecessary

**LESSON STAGES:**

**1. REVIEW OF PREVIOUS LEARNING (10 minutes)**
- Whole-class brainstorm of story elements
- Display narrative structure diagram
  - Beginning: Character introduction, setting
  - Middle: Problem or challenge
  - End: Resolution and conclusion
- Quick discussion: "What makes a story interesting?"

**2. EXPLICIT TEACHING ('I DO') (15 minutes)**
- Introduce mentor text (age-appropriate picture book with clear narrative structure)
- Read text aloud, highlighting story structure
  - Point out how author introduces characters
  - Demonstrate narrative arc
- Think-aloud about story elements
  - "Notice how the character faces a problem here?"
  - "See how the ending resolves the initial challenge?"

**3. GUIDED PRACTICE ('WE DO') (15 minutes)**
- Collaborative story mapping activity
  - Use large shared template
  - Class helps fill in story structure elements
    - Who are the main characters?
    - What's the problem they face?
    - How might they solve it?
- Model story planning using graphic organiser
  - Beginning: Character and setting
  - Middle: Conflict/challenge
  - End: Resolution

**4. INDEPENDENT PRACTICE ('YOU DO') (15 minutes)**
**Differentiation Strategies:**
- Lower ability students:
  - Provide story starter templates
  - Use sentence starters
  - Offer visual story planning sheets
- Higher ability students:
  - More complex narrative prompts
  - Challenge to include multiple plot twists
  - Encourage advanced descriptive language

**Peer Feedback Activity:**
- Students write initial draft
- Pair-share with feedback partner
- Use structured feedback form:
  - "One thing I liked about your story..."
  - "One suggestion to make your story clearer..."

**5. LESSON CLOSURE (5 minutes)**
- Students share one learning from lesson
- Quick self-assessment of narrative structure
- Peer feedback reflection

**RESOURCES NEEDED**
- Mentor text
- Narrative structure diagram
- Graphic organisers
- Feedback forms
- Writing materials
- Interactive whiteboard

**ASSESSMENT STRATEGIES**
- Formative: Observe story planning
- Peer feedback forms
- Draft narratives
- Exit ticket reflection

**DIFFERENTIATION**
- Varied complexity of writing prompts
- Scaffolded support materials
- Flexible grouping
- Multiple entry points for learning

**BEHAVIOUR MANAGEMENT**
- Clear expectations for partner work
- Explicit instructions for feedback
- Movement between whole class and partner activities
- Positive reinforcement of collaborative skills`;

function LessonPlanDemo({ globalPause = false }: { globalPause?: boolean }) {
  const [stage, setStage] = useState<'typing' | 'transforming' | 'polished'>('typing');
  const [displayedSpoken, setDisplayedSpoken] = useState('');
  const [displayedPolished, setDisplayedPolished] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);
  const [manualView, setManualView] = useState<'input' | 'output' | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (globalPause) {
      setManualView('output');
      setIsAnimating(false);
    } else {
      setManualView(null);
      setIsAnimating(true);
    }
  }, [globalPause]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(lessonPolishedText);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!isAnimating) return;

    if (stage === 'typing') {
      if (displayedSpoken.length < lessonSpokenText.length) {
        const timer = setTimeout(() => {
          setDisplayedSpoken(lessonSpokenText.slice(0, displayedSpoken.length + 1));
        }, 8);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setStage('transforming');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }

    if (stage === 'transforming') {
      const timer = setTimeout(() => {
        setStage('polished');
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (stage === 'polished') {
      if (displayedPolished.length === 0) {
        setDisplayedPolished(lessonPolishedText);
      } else {
        const timer = setTimeout(() => {
          setStage('typing');
          setDisplayedSpoken('');
          setDisplayedPolished('');
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [stage, displayedSpoken, displayedPolished, isAnimating]);

  const renderSpokenText = (text: string) => {
    const words = text.split(' ');
    let result: JSX.Element[] = [];

    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      if (!word) continue;

      const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
      const isFiller = ['umm', 'um', 'err', 'ah', 'er', 'uh'].includes(cleanWord);

      if (isFiller) {
        result.push(
          <motion.span
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded mx-0.5"
            title="Filler word"
          >
            {word}
          </motion.span>
        );
      } else {
        result.push(
          <span key={index}>{word}</span>
        );
      }

      if (index < words.length - 1) {
        result.push(' ' as any);
      }
    }

    return result;
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="inline-flex rounded-full bg-gray-100 p-1">
          <button
            onClick={() => {
              setManualView(manualView === 'input' ? null : 'input');
              setIsAnimating(false);
            }}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              manualView === 'input'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Input
          </button>
          <button
            onClick={() => {
              setManualView(manualView === 'output' ? null : 'output');
              setIsAnimating(false);
            }}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              manualView === 'output'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Output
          </button>
        </div>

        <button
          onClick={() => {
            setManualView(null);
            setIsAnimating(!isAnimating);
            if (!isAnimating) {
              setStage('typing');
              setDisplayedSpoken('');
              setDisplayedPolished('');
            }
          }}
          className="px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 text-sm transition-colors"
        >
          {isAnimating ? 'Pause' : 'Restart'}
        </button>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {manualView === 'input' && (
            <motion.div
              key="manual-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Spoken Input</span>
                </div>
                <div className="text-gray-700 leading-relaxed">
                  {renderSpokenText(lessonSpokenText)}
                </div>
              </div>
            </motion.div>
          )}

          {manualView === 'output' && (
            <motion.div
              key="manual-output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-6 border-2 border-teal-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span className="text-xs text-teal-700 uppercase tracking-wide">Structured Lesson Plan</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-teal-700 text-sm transition-colors shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="text-gray-800 leading-relaxed">
                  <MarkdownRenderer content={lessonPolishedText} />
                </div>
              </div>
            </motion.div>
          )}

          {!manualView && (stage === 'typing' || stage === 'transforming') && (
            <motion.div
              key="spoken"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Spoken Input</span>
                </div>
                <div className="text-gray-700 leading-relaxed">
                  {renderSpokenText(displayedSpoken)}
                  {stage === 'typing' && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-0.5 h-5 bg-gray-700 ml-1"
                    />
                  )}
                </div>
              </div>

              {stage === 'transforming' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-12 h-12 text-teal-600 mx-auto" />
                    </motion.div>
                    <p className="mt-4 text-teal-700">Creating structured lesson plan...</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {!manualView && stage === 'polished' && (
            <motion.div
              key="polished"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-6 border-2 border-teal-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span className="text-xs text-teal-700 uppercase tracking-wide">Structured Lesson Plan</span>
                  </div>
                  {displayedPolished.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-teal-700 text-sm transition-colors shadow-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
                <div className="text-gray-800 leading-relaxed">
                  <MarkdownRenderer content={displayedPolished} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// LEARNING PLAN DEMO COMPONENT
// ============================================================================

const learningSpokenText = "anne-marie um is working around the expected level err and she's generally engaged ah but i'm noticing she needs extra support with inferencing and pulling out main ideas from non fiction um her writing is neat but she tends to keep things a bit short so i'll need to think about ways to help her extend ideas err in maths she's ok with basics but multi step problems and times tables slow her down ah she does well in group talk and likes sharing ideas um but sometimes gets a bit anxious if the task feels too big so i probly need to chunk things and build her confidence while focusing on reading strategies writing depth and timestable recall";

const learningPolishedText = `Based on the teacher's observations, I'll create a comprehensive learning plan for Anne-Marie:

**BASELINE ASSESSMENT**

**Student Profile: Anne-Marie**

**Strengths**
- Generally engaged in learning
- Strong in group discussions and idea sharing
- Neat handwriting
- Competent with basic mathematical concepts
- Good oral communication skills

**Areas Requiring Development**
- Inferencing skills in non-fiction reading
- Extracting main ideas from texts
- Writing depth and idea extension
- Multi-step problem-solving
- Times tables recall
- Managing task anxiety

**Learning Goals**
1. Improve reading comprehension, especially inferential understanding
2. Develop more extensive and detailed writing
3. Enhance mathematical problem-solving skills
4. Build confidence in tackling complex learning tasks
5. Improve times tables mastery

**LEARNING AREAS WITH INSTRUCTIONAL SEQUENCES**

**English**

Phase 1: Inferencing Foundations (6 weeks)
- What the teacher will do: Introduce explicit inferencing strategies, model text analysis, use graphic organisers
- What the student will do: Practice identifying implied meanings, complete inference worksheets
- Resources needed: Short non-fiction texts, inference graphic organisers, highlighters
- Progress check: Weekly inference quizzes
- Transition criteria: When student can consistently identify 3-4 implied meanings in a text

Phase 2: Main Idea Extraction (6 weeks)
- What the teacher will do: Teach text mapping, demonstrate main idea identification techniques
- What the student will do: Create main idea summaries, use colour-coding strategies
- Resources needed: Varied non-fiction texts, summary templates
- Progress check: Bi-weekly main idea assessment tasks
- Transition criteria: When student can accurately identify main ideas in 80% of texts

Phase 3: Writing Depth and Extension (8 weeks)
- What the teacher will do: Introduce sentence expansion techniques, provide writing scaffolds
- What the student will do: Practice elaborating on initial ideas, use descriptive language
- Resources needed: Writing prompt cards, sentence expansion templates
- Progress check: Weekly writing samples assessing idea development
- Transition criteria: When student consistently writes paragraphs with 3-4 supporting details

**Mathematics**

Phase 1: Times Tables Mastery (6 weeks)
- What the teacher will do: Use gamified learning, provide targeted practice, create low-stress recall activities
- What the student will do: Daily times tables practice, use online learning games
- Resources needed: Times tables charts, digital learning platforms, flashcards
- Progress check: Weekly times tables speed and accuracy assessments
- Transition criteria: When student can recall 7-8 times tables consistently

Phase 2: Multi-Step Problem Solving (8 weeks)
- What the teacher will do: Break down complex problems, teach step-by-step problem-solving strategies
- What the student will do: Practice problem decomposition, use visual problem-solving techniques
- Resources needed: Problem-solving worksheets, visual mapping tools
- Progress check: Fortnightly multi-step problem assessments
- Transition criteria: When student can consistently solve 3-4 step problems with 70% accuracy

**WHERE AND WHEN INSTRUCTION WILL TAKE PLACE**
- Targeted small group sessions
- Individualized support during regular class time
- Use of break-out learning spaces to reduce anxiety
- Alternating between whole class and individualised instruction

**HOW LEARNING OUTCOMES WILL BE RECORDED**
- Digital learning portfolio
- Formative assessment tracking sheet
- Bi-weekly progress discussions
- Visual progress graphs for student motivation

**FINAL ASSESSMENT CRITERIA**
- Demonstrated improvement in inferencing skills
- Ability to write extended, detailed paragraphs
- Consistent times tables recall (8-9 times tables)
- Increased confidence in tackling complex tasks
- Improved multi-step problem-solving skills

**SUPPORT STRATEGIES**
- Use of chunked tasks
- Frequent positive reinforcement
- Visual progress tracking
- Low-stress learning environment
- Gradual task complexity increase

This learning plan provides a structured, supportive approach to addressing Anne-Marie's specific learning needs while building her confidence and skills across key learning areas.`;

const learningFillerWords = ['um', 'err', 'ah', 'er', 'uh'];
const learningSpellingErrors = ['probly', 'timestable'];
const learningCapitalizationErrors = ['anne-marie', 'maths'];

function LearningPlanDemo({ globalPause = false }: { globalPause?: boolean }) {
  const [stage, setStage] = useState<'typing' | 'transforming' | 'polished'>('typing');
  const [displayedSpoken, setDisplayedSpoken] = useState('');
  const [displayedPolished, setDisplayedPolished] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);
  const [manualView, setManualView] = useState<'input' | 'output' | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (globalPause) {
      setManualView('output');
      setIsAnimating(false);
    } else {
      setManualView(null);
      setIsAnimating(true);
    }
  }, [globalPause]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(learningPolishedText);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!isAnimating) return;

    if (stage === 'typing') {
      if (displayedSpoken.length < learningSpokenText.length) {
        const timer = setTimeout(() => {
          setDisplayedSpoken(learningSpokenText.slice(0, displayedSpoken.length + 1));
        }, 8);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setStage('transforming');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }

    if (stage === 'transforming') {
      const timer = setTimeout(() => {
        setStage('polished');
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (stage === 'polished') {
      if (displayedPolished.length === 0) {
        setDisplayedPolished(learningPolishedText);
      } else {
        const timer = setTimeout(() => {
          setStage('typing');
          setDisplayedSpoken('');
          setDisplayedPolished('');
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [stage, displayedSpoken, displayedPolished, isAnimating]);

  const renderSpokenText = (text: string) => {
    const words = text.split(' ');
    let result: JSX.Element[] = [];

    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      if (!word) continue;

      const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
      const isFiller = learningFillerWords.includes(cleanWord);
      const isSpellingError = learningSpellingErrors.includes(cleanWord);
      const isCapitalizationError = learningCapitalizationErrors.includes(cleanWord);

      if (isFiller) {
        result.push(
          <motion.span
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded mx-0.5"
            title="Filler word"
          >
            {word}
          </motion.span>
        );
      } else if (isSpellingError || isCapitalizationError) {
        result.push(
          <motion.span
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline relative"
            title={isSpellingError ? "Spelling error" : "Capitalization error"}
          >
            <span className="relative">
              {word}
              <span className="absolute bottom-0 left-0 right-0 h-[2px]">
                <svg width="100%" height="2" viewBox="0 0 100 2" preserveAspectRatio="none">
                  <path d="M0,1 Q2.5,0 5,1 T10,1 T15,1 T20,1 T25,1 T30,1 T35,1 T40,1 T45,1 T50,1 T55,1 T60,1 T65,1 T70,1 T75,1 T80,1 T85,1 T90,1 T95,1 T100,1"
                        stroke="#ef4444"
                        strokeWidth="2"
                        fill="none"
                  />
                </svg>
              </span>
            </span>
          </motion.span>
        );
      } else {
        result.push(
          <span key={index}>{word}</span>
        );
      }

      if (index < words.length - 1) {
        result.push(' ' as any);
      }
    }

    return result;
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="inline-flex rounded-full bg-gray-100 p-1">
          <button
            onClick={() => {
              setManualView(manualView === 'input' ? null : 'input');
              setIsAnimating(false);
            }}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              manualView === 'input'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Input
          </button>
          <button
            onClick={() => {
              setManualView(manualView === 'output' ? null : 'output');
              setIsAnimating(false);
            }}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
              manualView === 'output'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Output
          </button>
        </div>

        <button
          onClick={() => {
            setManualView(null);
            setIsAnimating(!isAnimating);
            if (!isAnimating) {
              setStage('typing');
              setDisplayedSpoken('');
              setDisplayedPolished('');
            }
          }}
          className="px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 text-sm transition-colors"
        >
          {isAnimating ? 'Pause' : 'Restart'}
        </button>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {manualView === 'input' && (
            <motion.div
              key="manual-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Spoken Input</span>
                </div>
                <div className="text-gray-700 leading-relaxed">
                  {renderSpokenText(learningSpokenText)}
                </div>
              </div>
            </motion.div>
          )}

          {manualView === 'output' && (
            <motion.div
              key="manual-output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-6 border-2 border-teal-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span className="text-xs text-teal-700 uppercase tracking-wide">Comprehensive Learning Plan</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-teal-700 text-sm transition-colors shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="text-gray-800 leading-relaxed">
                  <MarkdownRenderer content={learningPolishedText} />
                </div>
              </div>
            </motion.div>
          )}

          {!manualView && (stage === 'typing' || stage === 'transforming') && (
            <motion.div
              key="spoken"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Spoken Input</span>
                </div>
                <div className="text-gray-700 leading-relaxed">
                  {renderSpokenText(displayedSpoken)}
                  {stage === 'typing' && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-0.5 h-5 bg-gray-700 ml-1"
                    />
                  )}
                </div>
              </div>

              {stage === 'transforming' && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-12 h-12 text-teal-600 mx-auto" />
                    </motion.div>
                    <p className="mt-4 text-teal-700">Generating comprehensive learning plan...</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {!manualView && stage === 'polished' && (
            <motion.div
              key="polished"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-6 border-2 border-teal-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span className="text-xs text-teal-700 uppercase tracking-wide">Comprehensive Learning Plan</span>
                  </div>
                  {displayedPolished.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-teal-700 text-sm transition-colors shadow-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
                <div className="text-gray-800 leading-relaxed">
                  <MarkdownRenderer content={displayedPolished} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN LANDING PAGE COMPONENT
// ============================================================================

export default function CompleteLandingPage() {
  const [globalPause, setGlobalPause] = useState(false);
  const [demosHidden, setDemosHidden] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b border-teal-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <img src="/logo-full.svg" alt="TeachAssist.ai" className="h-20" />
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                className="text-teal-700 hover:text-teal-800 hover:bg-teal-50"
                onClick={() => setLocation('/')}
              >
                Sign In
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => setLocation('/')}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-6 px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI-Powered Teaching Assistant
              </span>
            </div>
            <h1 className="mb-6 text-teal-900 text-5xl md:text-6xl lg:text-7xl leading-tight">
              The Assistant <br />
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Every Teacher Needs
              </span>
            </h1>
            <p className="mb-10 text-gray-600 max-w-2xl mx-auto text-lg md:text-xl">
              Save hours on report writing, lesson planning, and learning plan development.
              Simply speak naturally, and let our AI transform your thoughts into professional,
              well-structured documents.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg"
                onClick={() => setLocation('/')}
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Speaking
              </Button>
              <Button variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50 px-8 py-6 text-lg">
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="mb-4 text-teal-900 text-4xl md:text-5xl">Three Powerful Tools</h2>
            <p className="text-gray-600 text-lg md:text-xl">
              See how TeachAssistAi transforms your spoken thoughts into polished documents
            </p>
          </motion.div>

          {/* Global Pause and Hide Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            <Button
              onClick={() => setGlobalPause(!globalPause)}
              className={`px-6 py-3 rounded-full shadow-lg ${
                globalPause
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {globalPause ? (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Resume All Demos
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause All Demos
                </>
              )}
            </Button>
            <Button
              onClick={() => setDemosHidden(!demosHidden)}
              className={`px-6 py-3 rounded-full shadow-lg ${
                demosHidden
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {demosHidden ? (
                <>
                  <Eye className="w-5 h-5 mr-2" />
                  Show Demos
                </>
              ) : (
                <>
                  <EyeOff className="w-5 h-5 mr-2" />
                  Hide Demos
                </>
              )}
            </Button>
          </div>

          {!demosHidden && (
            <>
              {/* Report Writing Demo */}
              <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-teal-900 text-2xl">Report Writing</h3>
                <p className="text-gray-600">Transform casual notes into professional student reports</p>
              </div>
            </div>
            <Card className="p-8 shadow-xl border-teal-100">
              <TransformationDemo globalPause={globalPause} />
            </Card>
          </motion.div>

          {/* Lesson Planning Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-teal-900 text-2xl">Lesson Planning</h3>
                <p className="text-gray-600">Create structured lesson plans from your spoken ideas</p>
              </div>
            </div>
            <Card className="p-8 shadow-xl border-teal-100">
              <LessonPlanDemo globalPause={globalPause} />
            </Card>
          </motion.div>

          {/* Individual Learning Plans Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-teal-900 text-2xl">Individual Learning Plans</h3>
                <p className="text-gray-600">Develop comprehensive ILPs from your observations</p>
              </div>
            </div>
            <Card className="p-8 shadow-xl border-teal-100">
              <LearningPlanDemo globalPause={globalPause} />
            </Card>
          </motion.div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="mb-4 text-teal-900 text-4xl md:text-5xl">The Assistant Every Teacher Needs</h2>
            <p className="text-gray-600 text-lg">
              Powerful tools designed specifically for educators
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow border-teal-100">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="mb-3 text-teal-900 text-2xl">Report Writing</h3>
                <p className="text-gray-600 text-base">
                  Transform rough notes into comprehensive student reports with proper structure and professional language.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow border-teal-100">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="mb-3 text-teal-900 text-2xl">Lesson Planning</h3>
                <p className="text-gray-600 text-base">
                  Quickly create detailed lesson plans by speaking your ideas. Get structured, curriculum-aligned documents.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-shadow border-teal-100">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="mb-3 text-teal-900 text-2xl">Save Time</h3>
                <p className="text-gray-600 text-base">
                  Reduce administrative burden by up to 70%. Spend more time teaching and less time on paperwork.
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="mb-4 text-4xl md:text-5xl">How It Works</h2>
              <p className="text-teal-50 text-lg md:text-xl">
                Three simple steps to transform your workflow
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">1</span>
                </div>
                <h3 className="mb-3 text-2xl">Speak Naturally</h3>
                <p className="text-teal-50 text-base">
                  Share your thoughts about students, lessons, or plans in your own words
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">2</span>
                </div>
                <h3 className="mb-3 text-2xl">AI Processes</h3>
                <p className="text-teal-50 text-base">
                  Our AI removes filler words, improves grammar, and structures your content
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">3</span>
                </div>
                <h3 className="mb-3 text-2xl">Get Your Draft</h3>
                <p className="text-teal-50 text-base">
                  Receive a polished, professional document ready to use or customize
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="mb-4 text-teal-900 text-4xl md:text-5xl">Why Teachers Love TeachAssistAi</h2>
          </motion.div>

          <div className="space-y-4">
            {[
              'No more struggling to find the right words for reports',
              'Eliminate hours spent on administrative tasks',
              'Maintain consistent, professional tone across all documents',
              'Focus on what matters most - teaching and connecting with students',
              'Accessible anywhere, anytime - just speak and go'
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-5 bg-white rounded-lg border border-teal-100 hover:border-teal-300 transition-colors"
              >
                <CheckCircle className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-lg">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Card className="p-12 text-center bg-gradient-to-br from-teal-600 to-emerald-600 text-white border-0 shadow-2xl">
            <h2 className="mb-6 text-4xl md:text-5xl">Ready to Transform Your Workflow?</h2>
            <p className="mb-8 text-teal-50 text-lg md:text-xl">
              Join thousands of teachers who are saving time and improving their documentation
            </p>
            <Button
              className="bg-white text-teal-700 hover:bg-gray-50 px-8 py-6 text-lg"
              onClick={() => setLocation('/')}
            >
              <Mic className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <p className="mt-6 text-base text-teal-50">
              No credit card required • Free trial
            </p>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-teal-100 bg-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <img src="/logo-full.svg" alt="TeachAssist.ai" className="h-8" />
            <p className="text-sm text-gray-600">
              © 2025 TeachAssistAi. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-600 hover:text-teal-600">Privacy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-teal-600">Terms</a>
              <a href="#" className="text-sm text-gray-600 hover:text-teal-600">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
