import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface LearningPlanDemoProps {
  globalPause: boolean;
}

const inputText = `Creating plan for Year 4 student Sarah strong in creative arts and verbal skills needs support in mathematics especially multiplication interested in animals and science experiments will use hands-on learning approach have access to library resources and online educational platforms learning mostly at home with weekly group activities`;

const outputText = `**BASELINE ASSESSMENT**
Sarah demonstrates strong creative and verbal abilities. Mathematics, particularly multiplication, requires focused development.

**MATHEMATICS - MULTIPLICATION MASTERY**

Phase 1: Concrete Understanding (3 weeks)
- Teacher will: Model multiplication with physical objects
- Student will: Build arrays with counters and blocks
- Resources: Manipulatives, animal-themed math cards
- Progress check: Creates 5 different arrays correctly
- Transition: When Sarah consistently represents 2-5 times tables with objects

Phase 2: Visual Representation (3 weeks)
- Teacher will: Demonstrate skip counting and number lines
- Student will: Draw arrays and complete skip counting
- Resources: Number line posters, grid paper
- Progress check: Completes visual problems independently
- Transition: When Sarah accurately draws 5 multiplication scenarios

Phase 3: Abstract Practice (4 weeks)
- Teacher will: Introduce times table patterns and strategies
- Student will: Practice mental multiplication, timed exercises
- Resources: Online math games, flashcards
- Progress check: Recall 2-10 times tables in 2 minutes

**ASSESSMENT CRITERIA**
- Demonstrates fluency with times tables 2-10
- Applies multiplication to solve word problems
- Explains multiplication strategies verbally`;

export function LearningPlanDemo({ globalPause }: LearningPlanDemoProps) {
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
        }, 20);
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
        }, 12);
      } else {
        timeoutId = setTimeout(() => {
          setDisplayInput('');
          setDisplayOutput('');
          setShowArrow(false);
          setPhase('input');
        }, 5000);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayInput, displayOutput, phase, globalPause]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Input */}
        <div className="bg-gray-50 rounded-lg p-6 min-h-[400px]">
          <div className="text-sm font-medium text-gray-600 mb-3">Your Observations</div>
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
        <div className="bg-teal-50 rounded-lg p-6 min-h-[400px] md:col-start-2 overflow-auto max-h-[500px]">
          <div className="text-sm font-medium text-teal-800 mb-3">Comprehensive Learning Plan</div>
          <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
            {displayOutput}
            {phase === 'output' && <span className="inline-block w-0.5 h-5 bg-teal-600 ml-1 animate-pulse" />}
          </div>
        </div>
      </div>
    </div>
  );
}
