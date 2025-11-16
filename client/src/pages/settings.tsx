import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shield, Info, Lightbulb, Cog, AlertTriangle } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

export default function Settings() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40">
      {/* App Header without tabs */}
      <AppHeader showTabs={false} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <Button
            variant="outline"
            size="default"
            onClick={() => setLocation("/")}
            className="mb-6 border-2 border-teal-600 text-teal-700 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Button>
          <h1 className="text-3xl font-bold text-teal-900">About TeachAssistAI</h1>
          <p className="text-gray-600 mt-2">Privacy, purpose, and usage information</p>
        </div>

        <div className="space-y-8">
          {/* Purpose Section */}
          <Card className="p-8 bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Info className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-teal-900">Designed to assist teachers</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="text-base leading-relaxed">
                This tool is designed to assist educators, not replace professional judgment. TeachAssistAI helps you:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Transform rough observations and notes into polished drafts</li>
                <li>Structure informal thoughts into professional documentation</li>
                <li>Refine language while maintaining your teaching voice</li>
                <li>Save time on formatting and initial drafting</li>
              </ul>

              <p className="text-base leading-relaxed font-medium text-teal-900 mt-4">
                Always review and revise the generated content before use. The AI assists with structure and phrasing, but your expertise, knowledge of your students, and professional judgment remain essential.
              </p>
            </div>
          </Card>

          {/* How to Use Section */}
          <Card className="p-8 bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-teal-900">How to Use TeachAssistAI</h2>
            </div>

            <div className="space-y-6 text-gray-700">
              {/* Input Your Notes */}
              <div>
                <h3 className="text-lg font-semibold text-teal-800 mb-3">Input Your Notes</h3>
                <p className="text-base leading-relaxed mb-3">
                  Type your rough notes directly, or use voice dictation:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Windows:</strong> Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Windows + H</kbd> to activate dictation
                  </li>
                  <li>
                    <strong>Mac:</strong> Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">Fn</kbd> twice or enable dictation in System Preferences
                  </li>
                </ul>
              </div>

              {/* Generate and Refine */}
              <div>
                <h3 className="text-lg font-semibold text-teal-800 mb-3">Generate and Refine</h3>
                <p className="text-base leading-relaxed mb-3">
                  Click "Generate" to create a draft. Use the refinement buttons for common adjustments, or enter custom refinement requests such as:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>"Make this sound more like how I naturally write"</li>
                  <li>"Use simpler language"</li>
                  <li>"Add more specific examples"</li>
                  <li>"Make the tone more encouraging"</li>
                </ul>
              </div>

              {/* Copy and Edit */}
              <div>
                <h3 className="text-lg font-semibold text-teal-800 mb-3">Copy and Edit</h3>
                <p className="text-base leading-relaxed">
                  Use the copy button to transfer content to your working document, then edit and finalize based on your professional judgment and specific context.
                </p>
              </div>
            </div>
          </Card>

          {/* How It Works Section */}
          <Card className="p-8 bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Cog className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-teal-900">How It Works</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="text-base leading-relaxed">
                TeachAssistAI uses trained AI language models configured to support Australian educators. The system:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Follows Department of Education standards for learning plans and lesson planning</li>
                <li>Uses Australian English spelling and conventions</li>
                <li>Generates polished drafts based on your rough input</li>
                <li>Maintains professional tone and structure</li>
              </ul>

              <p className="text-base leading-relaxed font-medium text-teal-900 mt-4">
                The AI provides suggestions and structure—you provide the expertise, context, and final judgment.
              </p>
            </div>
          </Card>

          {/* Best Practices Section */}
          <Card className="p-8 bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-teal-900">Best Practices</h2>
            </div>

            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Use descriptive notes and observations as input</li>
              <li>Review all generated content before using it</li>
              <li>Customize outputs to match your voice and style</li>
              <li>Avoid entering sensitive or identifying information</li>
              <li>Use refinement options to iterate toward your desired result</li>
              <li>Use the "Clear History" button in the app to remove your saved generation history if using a shared device</li>
            </ul>
          </Card>

          {/* Privacy Section */}
          <Card className="p-8 bg-white shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-teal-900">Your Privacy First</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p className="text-base leading-relaxed">
                <strong>Your data stays with you.</strong> TeachAssistAI does not store any of your inputs, outputs, or teaching content on our servers. When you create drafts, your notes and the generated content exist only in your current session.
              </p>

              <p className="text-base leading-relaxed">
                The conversation history you see is saved locally in your browser using temporary storage. This history:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Stays on your computer</li>
                <li>Does not sync across browsers or devices</li>
                <li>Can be cleared at any time</li>
                <li>Is not accessible to TeachAssistAI or any third party</li>
              </ul>

              <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 mb-2">Important:</p>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p>
                        While TeachAssistAI does not store any of your information, your inputs are shared and processed by AI models which may use the content for training.
                      </p>
                      <p>
                        Do not enter confidential information, sensitive student data, or personally identifying details. You should always follow your school's data protection policies.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                To learn more, see our{" "}
                <span className="text-teal-600 font-medium cursor-not-allowed">
                  privacy policy
                </span>
                .
              </p>
            </div>
          </Card>

          {/* Back Button */}
          <div className="flex justify-center pt-4 pb-8">
            <Button
              onClick={() => setLocation("/")}
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white px-10 py-6 font-medium shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to App
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
