import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface LessonPlanDemoProps {
  globalPause: boolean;
}

const inputText = `Teaching narrative writing to Year 5 need to cover story structure beginning middle end mixed ability class some struggle with organizing ideas want to use mentor text then guided writing practice have 60 minutes need peer feedback component`;

const outputText = `**LESSON BACKGROUND**
Year 5 narrative writing lesson focusing on story structure

**LEARNING OBJECTIVES**
- Understand three-part story structure
- Apply beginning-middle-end framework to writing

**LESSON STAGES**

**1. EXPLICIT TEACHING (15 minutes)**
- Read mentor text aloud
- Identify story structure elements
- Model story mapping on board

**2. GUIDED PRACTICE (20 minutes)**
- Class creates collaborative story outline
- Teacher scaffolds idea organization
- Visual story map template provided

**3. INDEPENDENT PRACTICE (20 minutes)**
- Students draft own narrative beginning
- Differentiated support for varying abilities
- Teacher circulates for individual guidance

**4. PEER FEEDBACK (5 minutes)**
- Partner sharing of story beginnings
- Guided feedback questions provided`;

export function LessonPlanDemo({ globalPause }: LessonPlanDemoProps) {
  const [displayInput, setDisplayInput] = useState('');
  const [displayOutput, setDisplayOutput] = useState('');
  const [showArrow, setShowArrow] = useState(false);
  const [phase, setPhase] = useState<'input' | 'transform' | 'output'>('input');

  useEffect(() => {
    if (globalPause) return;

    let timeoutId: NodeJS.Timeout;

    if (phase === 'input') {
      if (displayInput.length < inputText.length) {
        timeoutId = setTimeout(() => {
          setDisplayInput(inputText.slice(0, displayInput.length + 1));
        }, 25);
      } else {
        timeoutId = setTimeout(() => {
          setShowArrow(true);
          setPhase('transform');
        }, 500);
      }
    } else if (phase === 'transform') {
      timeoutId = setTimeout(() => {
        setPhase('output');
      }, 1000);
    } else if (phase === 'output') {
      if (displayOutput.length < outputText.length) {
        timeoutId = setTimeout(() => {
          setDisplayOutput(outputText.slice(0, displayOutput.length + 1));
        }, 15);
      } else {
        timeoutId = setTimeout(() => {
          setDisplayInput('');
          setDisplayOutput('');
          setShowArrow(false);
          setPhase('input');
        }, 4000);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayInput, displayOutput, phase, globalPause]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Input */}
        <div className="bg-gray-50 rounded-lg p-6 min-h-[300px]">
          <div className="text-sm font-medium text-gray-600 mb-3">Your Ideas</div>
          <p className="text-gray-800 leading-relaxed">
            {displayInput}
            {phase === 'input' && <span className="inline-block w-0.5 h-5 bg-teal-600 ml-1 animate-pulse" />}
          </p>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex justify-center items-center">
          {showArrow && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ArrowRight className="w-8 h-8 text-teal-600" />
            </motion.div>
          )}
        </div>

        {/* Output */}
        <div className="bg-teal-50 rounded-lg p-6 min-h-[300px] md:col-start-2">
          <div className="text-sm font-medium text-teal-800 mb-3">Structured Lesson Plan</div>
          <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
            {displayOutput}
            {phase === 'output' && <span className="inline-block w-0.5 h-5 bg-teal-600 ml-1 animate-pulse" />}
          </div>
        </div>
      </div>
    </div>
  );
}
