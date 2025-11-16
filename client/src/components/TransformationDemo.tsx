import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface TransformationDemoProps {
  globalPause: boolean;
}

const inputText = `Sophie is great in class really good behaviour want to highlight her strong English skills especially creative writing Math needs work struggles with addition but she tries really hard and never gives up could benefit from extra support sessions`;

const outputText = `Sophie demonstrates strong engagement and positive behaviour in class. Her English skills are notable, particularly in creative writing where she shows creativity and expression. Mathematics remains an area for continued focus, especially addition skills. Sophie approaches challenges with persistence and determination. Additional support sessions would benefit her mathematical development.`;

export function TransformationDemo({ globalPause }: TransformationDemoProps) {
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
        }, 30);
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
        }, 20);
      } else {
        timeoutId = setTimeout(() => {
          setDisplayInput('');
          setDisplayOutput('');
          setShowArrow(false);
          setPhase('input');
        }, 3000);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [displayInput, displayOutput, phase, globalPause]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Input */}
        <div className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
          <div className="text-sm font-medium text-gray-600 mb-3">Your Spoken Notes</div>
          <p className="text-gray-800 leading-relaxed">
            {displayInput}
            {phase === 'input' && <span className="inline-block w-0.5 h-5 bg-teal-600 ml-1 animate-pulse" />}
          </p>
        </div>

        {/* Arrow */}
        <div className="hidden md:flex justify-center">
          <AnimatePresence>
            {showArrow && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <ArrowRight className="w-8 h-8 text-teal-600" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Output */}
        <div className="bg-teal-50 rounded-lg p-6 min-h-[200px] md:col-start-2">
          <div className="text-sm font-medium text-teal-800 mb-3">Polished Report</div>
          <p className="text-gray-800 leading-relaxed">
            {displayOutput}
            {phase === 'output' && <span className="inline-block w-0.5 h-5 bg-teal-600 ml-1 animate-pulse" />}
          </p>
        </div>
      </div>
    </div>
  );
}
