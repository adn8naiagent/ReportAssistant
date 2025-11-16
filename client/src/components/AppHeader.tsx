import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { FileText, Target, GraduationCap, FileCheck, Zap, Settings, Info } from "lucide-react";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type AssistantType = 'report' | 'learning-plan' | 'lesson-plan' | 'writing-assessment';

interface AppHeaderProps {
  activeAssistant?: AssistantType;
  onAssistantChange?: (assistant: AssistantType) => void;
  showTabs?: boolean;
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

export function AppHeader({
  activeAssistant = 'report',
  onAssistantChange = () => {},
  showTabs = true
}: AppHeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="bg-teal-600 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        {/* Logo and Settings Row */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo-full.svg"
              alt="TeachAssist.ai"
              className="h-12 brightness-0 invert"
            />
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs font-medium"
            >
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>

          {/* Settings Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setLocation("/settings/about")}
                className="hover:bg-teal-50 hover:text-teal-700 focus:bg-teal-50 focus:text-teal-700 cursor-pointer"
              >
                <Info className="w-4 h-4 mr-2" />
                About
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tab Navigation - Only show if showTabs is true */}
        {showTabs && (
          <div className="flex gap-1 border-b border-teal-500">
            {ASSISTANT_CONFIGS.map((assistant) => {
              const Icon = assistant.icon;
              const isActive = activeAssistant === assistant.id;

              return (
                <button
                  key={assistant.id}
                  onClick={() => onAssistantChange(assistant.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all whitespace-nowrap border-b-2
                    ${
                      isActive
                        ? "bg-white/10 text-white border-white"
                        : "text-teal-100 hover:text-white hover:bg-white/5 border-transparent"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{assistant.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
