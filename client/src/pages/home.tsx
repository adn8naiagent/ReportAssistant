import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Eraser, FileText, Zap, BookOpen, Target, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AssistantType = "report" | "learning-plan" | "lesson-plan";

interface TabConfig {
  id: AssistantType;
  label: string;
  icon: React.ReactNode;
  guidanceTitle: string;
  guidanceText: string;
  placeholder: string;
  buttonText: string;
  generatingText: string;
  outputTitle: string;
}

const TAB_CONFIGS: TabConfig[] = [
  {
    id: "report",
    label: "Report Assistant",
    icon: <FileText className="w-5 h-5" />,
    guidanceTitle: "Student Report",
    guidanceText: "Enter student information including name, grade, subject, and performance details to generate a comprehensive school report.",
    placeholder: "Enter student information here...\n\nExample:\nName: Sarah Johnson\nGrade: 9\nSubject: English\nPerformance: Excellent writing skills, active class participation, shows creativity in assignments",
    buttonText: "Generate Report",
    generatingText: "Generating Report...",
    outputTitle: "Generated Report"
  },
  {
    id: "learning-plan",
    label: "Learning Plan Assistant",
    icon: <Target className="w-5 h-5" />,
    guidanceTitle: "Individualized Learning Plan",
    guidanceText: "Provide student details, current performance level, and learning challenges to create a customized learning plan.",
    placeholder: "Enter student and learning information here...\n\nExample:\nName: Michael Chen\nGrade: 7\nSubject: Mathematics\nCurrent Level: Struggling with fractions and decimals\nNeeds: Additional support with visual learning strategies",
    buttonText: "Generate Learning Plan",
    generatingText: "Generating Learning Plan...",
    outputTitle: "Generated Learning Plan"
  },
  {
    id: "lesson-plan",
    label: "Lesson Plan Assistant",
    icon: <GraduationCap className="w-5 h-5" />,
    guidanceTitle: "Detailed Lesson Plan",
    guidanceText: "Specify the subject, grade level, topic, and learning objectives to generate a comprehensive lesson plan.",
    placeholder: "Enter lesson details here...\n\nExample:\nSubject: Science\nGrade: 6\nTopic: Photosynthesis\nDuration: 45 minutes\nLearning Goals: Students will understand the process of photosynthesis and identify key components",
    buttonText: "Generate Lesson Plan",
    generatingText: "Generating Lesson Plan...",
    outputTitle: "Generated Lesson Plan"
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<AssistantType>("report");
  const [inputText, setInputText] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const currentConfig = TAB_CONFIGS.find(tab => tab.id === activeTab)!;

  const handleTabChange = (tabId: AssistantType) => {
    setActiveTab(tabId);
    setInputText("");
    setGeneratedOutput(null);
  };

  const generate = async () => {
    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter information to generate content.",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentInfo: inputText,
          type: activeTab
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate content");
      }

      const data = await response.json();
      setGeneratedOutput(data.report);

      toast({
        title: "Success",
        description: `Your ${currentConfig.label.toLowerCase()} is ready.`,
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error
          ? error.message
          : "An error occurred. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setInputText("");
    setGeneratedOutput(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40">
      {/* Professional Header */}
      <header className="bg-gradient-to-r from-teal-600 to-cyan-600 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-3">
            <img 
              src="/TeachAssist Logo.svg" 
              alt="TeachAssist.ai Logo" 
              className="w-10 h-10 brightness-0 invert"
            />
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
                TeachAssist.ai
              </h1>
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30 hover:bg-white/25 text-xs font-medium"
              >
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-4">
        <div className="flex justify-center">
          <div className="inline-flex bg-white rounded-xl shadow-md p-1.5 gap-1">
            {TAB_CONFIGS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 pb-12">
        <Card className="bg-white shadow-xl rounded-2xl border-0 overflow-hidden">
          <div className="p-10">
            {/* Guidance Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {currentConfig.guidanceTitle}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentConfig.guidanceText}
              </p>
            </div>

            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="input-text"
                  className="block text-sm font-medium text-foreground mb-3"
                >
                  Input Information
                </label>
                <Textarea
                  id="input-text"
                  data-testid="input-student-info"
                  placeholder={currentConfig.placeholder}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-56 text-base resize-none border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl p-5 transition-all"
                  aria-label="Input information"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center pt-4">
                <Button
                  data-testid="button-generate"
                  onClick={generate}
                  disabled={isGenerating}
                  size="lg"
                  className="px-8 py-6 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      {currentConfig.generatingText}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {currentConfig.buttonText}
                    </>
                  )}
                </Button>
                <Button
                  data-testid="button-clear"
                  onClick={handleClear}
                  variant="secondary"
                  size="lg"
                  className="px-8 py-6 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl font-medium transition-all"
                >
                  <Eraser className="w-5 h-5 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Output Display Area */}
        {generatedOutput && (
          <Card className="mt-10 bg-white shadow-lg rounded-2xl border border-border/50 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-3 pb-5 mb-6 border-b border-border">
                <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {currentConfig.icon}
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  {currentConfig.outputTitle}
                </h2>
              </div>
              <div
                data-testid="text-report-content"
                className="whitespace-pre-wrap text-base leading-relaxed text-foreground bg-slate-50 rounded-xl p-6"
              >
                {generatedOutput}
              </div>
            </div>
          </Card>
        )}

        {/* Empty State Placeholder */}
        {!generatedOutput && (
          <div className="mt-10">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border-2 border-dashed border-border rounded-2xl p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-full shadow-sm">
                  <div className="text-muted-foreground/60 w-8 h-8 flex items-center justify-center">
                    {currentConfig.icon}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground text-base">
                Your AI-generated content will appear here
              </p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Enter information above and click "{currentConfig.buttonText}" to begin
              </p>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground/70">
            Powered by advanced AI • Designed for educators
          </p>
        </div>
      </main>
    </div>
  );
}
