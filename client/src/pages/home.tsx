import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Eraser, FileText, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [studentInfo, setStudentInfo] = useState("");
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Placeholder function for future LLM integration
  const generateReport = async () => {
    if (!studentInfo.trim()) {
      toast({
        variant: "destructive",
        title: "Input Required",
        description: "Please enter student information to generate a report.",
      });
      return;
    }

    setIsGenerating(true);

    // TODO: LLM Integration will go here
    // This is where we'll connect to an LLM API (OpenAI, Anthropic, etc.)
    // to generate actual school reports based on the student information
    // For now, this is just a placeholder implementation
    console.log("🚀 LLM Integration Point:");
    console.log("Input:", studentInfo);
    console.log("Next step: Connect to LLM API to generate report");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Placeholder report for demonstration
    const placeholderReport = `STUDENT REPORT PREVIEW
Generated on: ${new Date().toLocaleString()}

[This is where the AI-generated report will appear]

Student Information Received:
${studentInfo}

---
Next Steps:
• Integrate LLM API (OpenAI GPT-4, Anthropic Claude, etc.)
• Define report structure and formatting
• Add report templates and customization options
• Implement error handling and validation
• Add export/download functionality`;

    setGeneratedReport(placeholderReport);
    setIsGenerating(false);

    toast({
      title: "Report Generated",
      description: "Your professional student report is ready!",
    });
  };

  const handleClear = () => {
    setStudentInfo("");
    setGeneratedReport(null);
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
              className="w-10 h-10"
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

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Card className="bg-white shadow-xl rounded-2xl border-0 overflow-hidden">
          <div className="p-10">
            {/* Subtitle */}
            <div className="text-center mb-10">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Create professional student reports powered by AI
              </p>
              <p className="text-sm text-muted-foreground/80 mt-2">
                Enter student details below and let AI generate a comprehensive report
              </p>
            </div>

            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <label 
                  htmlFor="student-info" 
                  className="block text-sm font-medium text-foreground mb-3"
                >
                  Student Information
                </label>
                <Textarea
                  id="student-info"
                  data-testid="input-student-info"
                  placeholder="Enter student information here...&#10;&#10;Example:&#10;Name: Sarah Johnson&#10;Grade: 9&#10;Subject: English&#10;Performance: Excellent writing skills, active class participation, shows creativity in assignments"
                  value={studentInfo}
                  onChange={(e) => setStudentInfo(e.target.value)}
                  className="min-h-56 text-base resize-none border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl p-5 transition-all"
                  aria-label="Student information input"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center pt-4">
                <Button
                  data-testid="button-generate"
                  onClick={generateReport}
                  disabled={isGenerating}
                  size="lg"
                  className="px-8 py-6 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Report
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

        {/* Report Display Area */}
        {generatedReport && (
          <Card className="mt-10 bg-white shadow-lg rounded-2xl border border-border/50 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-3 pb-5 mb-6 border-b border-border">
                <div className="bg-teal-50 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-teal-600" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  Generated Report
                </h2>
              </div>
              <div
                data-testid="text-report-content"
                className="whitespace-pre-wrap text-base leading-relaxed text-foreground bg-slate-50 rounded-xl p-6"
              >
                {generatedReport}
              </div>
            </div>
          </Card>
        )}

        {/* Empty State Placeholder */}
        {!generatedReport && (
          <div className="mt-10">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border-2 border-dashed border-border rounded-2xl p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-full shadow-sm">
                  <FileText className="w-8 h-8 text-muted-foreground/60" />
                </div>
              </div>
              <p className="text-muted-foreground text-base">
                Your AI-generated report will appear here
              </p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Enter student information above and click "Generate Report" to begin
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
