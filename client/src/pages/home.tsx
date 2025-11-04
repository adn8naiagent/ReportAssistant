import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Eraser, FileText, Zap, BookOpen, Target, GraduationCap, RefreshCw, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AssistantType = "report" | "learning-plan" | "lesson-plan";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

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
    guidanceText: "Share your rough notes about the student - we'll turn them into polished report commentary.",
    placeholder: "Example: Sophie is great in class, really good behaviour. Want to highlight her strong English skills, especially creative writing. Math needs work - struggles with addition but she tries really hard and never gives up. Could benefit from extra support sessions.",
    buttonText: "Draft Report Commentary",
    generatingText: "Drafting Report...",
    outputTitle: "Generated Report"
  },
  {
    id: "learning-plan",
    label: "Learning Plan Assistant",
    icon: <Target className="w-5 h-5" />,
    guidanceTitle: "Individualized Learning Plan",
    guidanceText: "Share your observations and ideas about the student - we'll create a structured learning plan.",
    placeholder: "Example: Year 3 student, reading below grade level. Enjoys hands-on activities. Struggles with phonics but loves storytelling. Need to build confidence and target letter-sound relationships.",
    buttonText: "Draft Learning Plan",
    generatingText: "Drafting Plan...",
    outputTitle: "Generated Learning Plan"
  },
  {
    id: "lesson-plan",
    label: "Lesson Plan Assistant",
    icon: <GraduationCap className="w-5 h-5" />,
    guidanceTitle: "Detailed Lesson Plan",
    guidanceText: "Describe your lesson idea in your own words - we'll format it into a complete lesson plan.",
    placeholder: "Example: Teaching photosynthesis to Year 5. Want hands-on experiment with plants. Students have mixed abilities. Need something engaging that covers curriculum outcomes but keeps everyone involved.",
    buttonText: "Draft Lesson Plan",
    generatingText: "Drafting Lesson...",
    outputTitle: "Generated Lesson Plan"
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<AssistantType>("report");
  const [inputText, setInputText] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [customRefinement, setCustomRefinement] = useState("");
  const { toast } = useToast();

  const currentConfig = TAB_CONFIGS.find(tab => tab.id === activeTab)!;

  const handleTabChange = (tabId: AssistantType) => {
    setActiveTab(tabId);
    setInputText("");
    setGeneratedOutput(null);
    setConversationHistory([]);
    setCustomRefinement("");
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
      const generatedText = data.report;
      setGeneratedOutput(generatedText);

      // Save conversation history
      const promptKey = activeTab === "report" ? "report" : activeTab === "learning-plan" ? "learningPlan" : "lessonPlan";
      const systemPrompts: Record<string, string> = {
        report: "You will receive rough, unstructured notes from a teacher. These may include dictated thoughts with poor formatting or punctuation. Your job is to interpret their intent and create a polished, professional report commentary. Format your response in these sections: Academic Performance, Behavior and Social Skills, Areas for Improvement, Recommendations. Write in a professional, supportive tone suitable for official school reports. Be specific but constructive.",
        learningPlan: "You will receive rough, unstructured notes from a teacher. These may include dictated thoughts with poor formatting or punctuation. Your job is to interpret their intent and create a polished, professional learning plan. Format your response in these sections: Current Level Assessment, Learning Goals, Strategies and Interventions, Resources Needed, Success Criteria. Be specific and actionable.",
        lessonPlan: "You will receive rough, unstructured notes from a teacher. These may include dictated thoughts with poor formatting or punctuation. Your job is to interpret their intent and create a polished, professional lesson plan. Format your response in these sections: Lesson Objectives, Materials Needed, Introduction/Hook, Main Activities, Assessment Methods, Differentiation Strategies. Be detailed and classroom-ready."
      };

      setConversationHistory([
        { role: "system" as const, content: systemPrompts[promptKey] },
        { role: "user" as const, content: inputText },
        { role: "assistant" as const, content: generatedText }
      ]);

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

  const refine = async (instruction: string) => {
    if (!instruction.trim()) {
      toast({
        variant: "destructive",
        title: "Instruction Required",
        description: "Please provide refinement instructions.",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Add refinement instruction to conversation history
      const updatedHistory: Message[] = [
        ...conversationHistory,
        { role: "user" as const, content: instruction }
      ];

      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: activeTab,
          conversationHistory: updatedHistory
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to refine content");
      }

      const data = await response.json();
      const refinedText = data.report;
      setGeneratedOutput(refinedText);

      // Update conversation history with the new response
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant" as const, content: refinedText }
      ]);

      // Clear custom refinement input
      setCustomRefinement("");

      toast({
        title: "Refined Successfully",
        description: "Your content has been updated.",
      });
    } catch (error) {
      console.error("Error refining content:", error);
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

  const handleQuickRefine = (instruction: string) => {
    refine(instruction);
  };

  const handleCustomRefine = () => {
    if (customRefinement.trim()) {
      refine(customRefinement);
    }
  };

  const handleStartOver = () => {
    setInputText("");
    setGeneratedOutput(null);
    setConversationHistory([]);
    setCustomRefinement("");
  };

  const handleClear = () => {
    setInputText("");
    setGeneratedOutput(null);
    setConversationHistory([]);
    setCustomRefinement("");
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
              className="w-20 h-20 brightness-0 invert"
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
                {activeTab === "report" ? "Student Report Commentary" : currentConfig.guidanceTitle}
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

                {/* Dictation Tip */}
                <div className="mb-3 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200/60 rounded-xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-teal-900 mb-1">
                        Quick Tip
                      </p>
                      <p className="text-xs text-teal-700 leading-relaxed">
                        Use Windows+H to dictate your rough thoughts - no need to worry about formatting, punctuation, or structure. Just speak naturally, or type your rough notes, and we'll polish it for you.
                      </p>
                    </div>
                  </div>
                </div>

                <Textarea
                  id="input-text"
                  data-testid="input-student-info"
                  placeholder={currentConfig.placeholder}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-64 text-base resize-none border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl p-5 transition-all"
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
          <>
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

            {/* Refinement Section */}
            <Card className="mt-6 bg-white shadow-md rounded-2xl border border-border/50 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-semibold text-foreground">Refine Your Content</h3>
                </div>

                {/* Quick Refinement Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    onClick={() => handleQuickRefine("Please rewrite the above with a more positive, encouraging tone.")}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Make More Positive
                  </Button>
                  <Button
                    onClick={() => handleQuickRefine("Please add more specific details and examples to the above.")}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Make More Specific
                  </Button>
                  <Button
                    onClick={() => handleQuickRefine("Please rewrite the above to focus more on the student's strengths and achievements.")}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Focus on Strengths
                  </Button>
                  <Button
                    onClick={() => handleQuickRefine("Please rewrite the above to focus more on areas for growth and development.")}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Focus on Growth Areas
                  </Button>
                  <Button
                    onClick={() => handleQuickRefine("Please make the above more concise while keeping the key points.")}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Shorten
                  </Button>
                  <Button
                    onClick={() => handleQuickRefine("Please expand the above with more detail and elaboration.")}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Add More Detail
                  </Button>
                </div>

                {/* Custom Refinement Input */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <label className="text-xs font-medium text-foreground">
                    Custom Refinement Instructions
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter your custom refinement instructions..."
                      value={customRefinement}
                      onChange={(e) => setCustomRefinement(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isGenerating) {
                          handleCustomRefine();
                        }
                      }}
                      disabled={isGenerating}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleCustomRefine}
                      disabled={isGenerating || !customRefinement.trim()}
                      variant="default"
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Refining...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Refine
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Start Over Button */}
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    onClick={handleStartOver}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Start Over
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Empty State Placeholder */}
        {!generatedOutput && (
          <div className="mt-10">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border-2 border-dashed border-border rounded-2xl p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-full shadow-sm">
                  <img
                    src="/TeachAssist Logo.svg"
                    alt="TeachAssist.ai"
                    className="w-12 h-12 opacity-40"
                  />
                </div>
              </div>
              <p className="text-muted-foreground text-base">
                Your polished draft will appear here
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
            Powered by AI • Designed for educators
          </p>
        </div>
      </main>
    </div>
  );
}
