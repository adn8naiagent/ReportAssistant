import { Badge } from "./ui/badge";
import { FileText, Target, GraduationCap, FileCheck, Zap } from "lucide-react";

type AssistantType = 'report' | 'learning-plan' | 'lesson-plan' | 'writing-assessment';

interface AppHeaderProps {
  activeAssistant: AssistantType;
  onAssistantChange: (assistant: AssistantType) => void;
}

const ASSISTANT_CONFIGS = [
  {
    id: 'report' as AssistantType,
    label: 'Report Assistant',
    icon: FileText,
  },
  {
    id: 'learning-plan' as AssistantType,
    label: 'Learning Plan',
    icon: Target,
  },
  {
    id: 'lesson-plan' as AssistantType,
    label: 'Lesson Plan',
    icon: GraduationCap,
  },
  {
    id: 'writing-assessment' as AssistantType,
    label: 'Assessment',
    icon: FileCheck,
  },
];

export function AppHeader({ activeAssistant, onAssistantChange }: AppHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Logo and Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.svg"
              alt="TeachAssist.ai Logo"
              className="w-10 h-10"
            />
            <div className="flex items-center gap-3">
              <h1
                className="text-2xl font-bold text-gray-900 tracking-tight"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                TeachAssist.ai
              </h1>
              <Badge
                variant="secondary"
                className="bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-100 text-xs font-medium"
              >
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {ASSISTANT_CONFIGS.map((assistant) => {
            const Icon = assistant.icon;
            const isActive = activeAssistant === assistant.id;

            return (
              <button
                key={assistant.id}
                onClick={() => onAssistantChange(assistant.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap
                  ${
                    isActive
                      ? "bg-teal-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{assistant.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
