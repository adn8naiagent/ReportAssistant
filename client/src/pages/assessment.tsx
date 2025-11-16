import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileCheck,
  Upload,
  Sparkles,
  Zap,
  Copy,
  Check,
  ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

type YearLevel = "Foundation" | "Year1" | "Year2" | "Year3" | "Year4" | "Year5" | "Year6";

interface Assessment {
  criterion: string;
  percentage: number;
  evidence: string;
}

interface AssessmentData {
  assessments?: Assessment[];
  rawResponse?: string;
}

export default function AssessmentPage() {
  const [yearLevel, setYearLevel] = useState<YearLevel | "">("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentData | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (3MB = 3145728 bytes)
    if (file.size > 3145728) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "File size must be less than 3MB. Please choose a smaller file or compress the image.",
      });
      e.target.value = '';
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);

      // Store base64 data (remove the data:image/xxx;base64, prefix)
      const base64Data = result.split(',')[1];
      setImageData(base64Data);
      setImageType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleAssess = async () => {
    if (!yearLevel || !imageData) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a year level and upload an image.",
      });
      return;
    }

    setIsAssessing(true);
    setAssessmentResults(null);

    try {
      const response = await fetch('/api/assess-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          yearLevel,
          imageData,
          imageType
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to assess writing");
      }

      const data = await response.json();
      setAssessmentResults(data);

      toast({
        title: "Assessment Complete",
        description: "Your handwriting sample has been analyzed.",
      });
    } catch (error) {
      console.error('Assessment error:', error);
      toast({
        variant: "destructive",
        title: "Assessment Failed",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
      });
    } finally {
      setIsAssessing(false);
    }
  };

  const handleCopy = async () => {
    if (!assessmentResults?.assessments) return;

    const text = assessmentResults.assessments
      .map(a => `${a.criterion}: ${a.percentage}%\n${a.evidence}`)
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      toast({
        title: "Copied!",
        description: "Assessment results copied to clipboard",
      });

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Failed to copy content to clipboard",
      });
    }
  };

  const getColorClass = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-50 border-green-500';
    if (percentage >= 50) return 'bg-amber-50 border-amber-500';
    return 'bg-red-50 border-red-500';
  };

  const getColorEmoji = (percentage: number) => {
    if (percentage >= 75) return '🟢';
    if (percentage >= 50) return '🟡';
    return '🔴';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40">
      {/* Professional Header */}
      <header className="bg-gradient-to-r from-teal-600 to-cyan-600 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center justify-center gap-3 flex-1">
              <img
                src="/logo-icon.svg"
                alt="TeachAssist.ai Logo"
                className="w-20 h-20 brightness-0 invert"
              />
              <div className="flex items-center gap-3">
                <h1
                  className="text-2xl font-bold text-white tracking-tight"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Writing Assessment
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
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <Card className="bg-white shadow-xl rounded-2xl border-0 overflow-hidden">
          <div className="p-10">
            {/* Guidance Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Handwriting Analysis
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload a handwriting sample to assess against Australian Curriculum standards.
              </p>
            </div>

            {/* Input Section */}
            <div className="space-y-6">
              {/* Year Level Selection */}
              <div>
                <label htmlFor="year-level" className="block text-sm font-medium text-foreground mb-3">
                  Year Level
                </label>
                <select
                  id="year-level"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value as YearLevel)}
                  className="w-full px-4 py-3 border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl transition-all text-base"
                >
                  <option value="">Select year level...</option>
                  <option value="Foundation">Foundation</option>
                  <option value="Year1">Year 1</option>
                  <option value="Year2">Year 2</option>
                  <option value="Year3">Year 3</option>
                  <option value="Year4">Year 4</option>
                  <option value="Year5">Year 5</option>
                  <option value="Year6">Year 6</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label htmlFor="image-upload" className="block text-sm font-medium text-foreground mb-3">
                  Upload Image or PDF
                </label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*,application/pdf"
                  capture="environment"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum file size: 3MB. For best results, ensure clear, well-lit photos.
                </p>
              </div>

              {/* Image Preview */}
              {previewUrl && (
                <div className="mt-4 p-4 border-2 border-dashed border-border rounded-xl">
                  <p className="text-sm font-medium text-foreground mb-3">Preview:</p>
                  <img
                    src={previewUrl}
                    alt="Uploaded handwriting sample"
                    className="max-w-full max-h-96 mx-auto rounded-lg"
                  />
                </div>
              )}

              {/* Assess Button */}
              <div className="flex gap-4 justify-center pt-4">
                <Button
                  onClick={handleAssess}
                  disabled={isAssessing || !yearLevel || !imageData}
                  size="lg"
                  className="px-8 py-6 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
                >
                  {isAssessing ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing Handwriting...
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-5 h-5 mr-2" />
                      Assess Writing
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Assessment Results */}
        {assessmentResults && (
          <Card className="mt-10 bg-white shadow-lg rounded-2xl border border-border/50">
            <div className="p-8">
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Assessment Results
                  </h2>
                </div>
                {assessmentResults.assessments && assessmentResults.assessments.length > 0 && (
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="bg-white shadow-md hover:shadow-lg transition-all"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Results
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Handwriting Sample */}
                <div className="md:sticky md:top-4 md:self-start">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Handwriting Sample</h4>
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Handwriting sample"
                      className="w-full border border-border rounded-lg"
                    />
                  )}
                </div>

                {/* Criteria Results */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-4">Criteria Assessment</h4>
                  <div className="space-y-4">
                    {assessmentResults.assessments && assessmentResults.assessments.length > 0 ? (
                      assessmentResults.assessments.map((assessment, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border-l-4 ${getColorClass(assessment.percentage)}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getColorEmoji(assessment.percentage)}</span>
                              <strong className="text-sm font-semibold">{assessment.criterion}</strong>
                            </div>
                            <span className="text-lg font-bold">{assessment.percentage}%</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed ml-7">
                            {assessment.evidence}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <pre className="text-sm text-foreground whitespace-pre-wrap">
                          {assessmentResults.rawResponse || "No assessment data available"}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!assessmentResults && !isAssessing && (
          <div className="mt-10">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border-2 border-dashed border-border rounded-2xl p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-full shadow-sm">
                  <Upload className="w-12 h-12 text-muted-foreground opacity-40" />
                </div>
              </div>
              <p className="text-muted-foreground text-base">
                Your assessment results will appear here
              </p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Select a year level and upload a handwriting sample to begin
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
