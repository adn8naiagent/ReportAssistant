import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  FileText,
  Zap,
  Target,
  GraduationCap,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Clock,
  History as HistoryIcon,
  Copy,
  Check,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AssistantType = "report" | "learning-plan" | "lesson-plan";

// LocalStorage keys
const STORAGE_KEYS = {
  report: {
    current: "teachassist_report_current",
    history: "teachassist_report_history",
  },
  "learning-plan": {
    current: "teachassist_learningplan_current",
    history: "teachassist_learningplan_history",
  },
  "lesson-plan": {
    current: "teachassist_lessonplan_current",
    history: "teachassist_lessonplan_history",
  },
} as const;

interface HistoryEntry {
  timestamp: string;
  content: string;
  input: string;
}

interface SavedTabData {
  inputText: string;
  generatedOutput: string;
  conversationHistory: Message[];
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// LocalStorage helper functions
const saveToLocalStorage = (key: string, data: unknown): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("LocalStorage save error:", error);
    return false;
  }
};

const loadFromLocalStorage = <T,>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("LocalStorage load error:", error);
    return null;
  }
};

const clearLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("LocalStorage clear error:", error);
  }
};

const saveTabData = (tabType: AssistantType, data: SavedTabData): boolean => {
  return saveToLocalStorage(STORAGE_KEYS[tabType].current, data);
};

const loadTabData = (tabType: AssistantType): SavedTabData | null => {
  return loadFromLocalStorage<SavedTabData>(STORAGE_KEYS[tabType].current);
};

const addToHistory = (tabType: AssistantType, entry: HistoryEntry): boolean => {
  const historyKey = STORAGE_KEYS[tabType].history;
  const history = loadFromLocalStorage<HistoryEntry[]>(historyKey) || [];

  // Add new entry at the beginning
  history.unshift(entry);

  // Limit to 10 most recent entries
  const trimmedHistory = history.slice(0, 10);

  return saveToLocalStorage(historyKey, trimmedHistory);
};

const loadHistory = (tabType: AssistantType): HistoryEntry[] => {
  return (
    loadFromLocalStorage<HistoryEntry[]>(STORAGE_KEYS[tabType].history) || []
  );
};

const clearTabHistory = (tabType: AssistantType): void => {
  clearLocalStorage(STORAGE_KEYS[tabType].history);
};

const formatTimestamp = (): string => {
  const now = new Date();
  return now.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

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
    guidanceText:
      "Share your rough notes about the student - we'll turn them into polished report commentary.",
    placeholder:
      "Example: Sophie is great in class, really good behaviour. Want to highlight her strong English skills, especially creative writing. Math needs work - struggles with addition but she tries really hard and never gives up. Could benefit from extra support sessions.",
    buttonText: "Draft Report Commentary",
    generatingText: "Drafting Report...",
    outputTitle: "Generated Report",
  },
  {
    id: "learning-plan",
    label: "Learning Plan Assistant",
    icon: <Target className="w-5 h-5" />,
    guidanceTitle: "Individualised Learning Plan",
    guidanceText:
      "Provide information about the student's strengths, learning goals, and your approach to teaching across the eight learning areas: English, Mathematics, Sciences, Humanities/Social Sciences, The Arts, Languages, Health/PE, and ICT/Design Technology.",
    placeholder:
      "Example: Creating plan for Year 4 student, Sarah. Strong in creative arts and verbal skills. Needs support in mathematics, especially multiplication. Interested in animals and science experiments. Will use hands-on learning approach. Have access to library resources and online educational platforms. Learning mostly at home with weekly group activities.",
    buttonText: "Draft Learning Plan",
    generatingText: "Drafting Plan...",
    outputTitle: "Generated Learning Plan",
  },
  {
    id: "lesson-plan",
    label: "Lesson Plan Assistant",
    icon: <GraduationCap className="w-5 h-5" />,
    guidanceTitle: "Detailed Lesson Plan",
    guidanceText:
      "Describe your lesson topic, year level, learning objectives, and any specific activities or approaches you want to include. Mention student ability levels and available resources.",
    placeholder:
      "Example: Teaching narrative writing to Year 5. Students need to learn story structure with clear beginning, middle, and end. Mixed ability class - some struggle with organizing ideas, others ready for more complex plots. Want to use a mentor text and then guided writing practice. Have 60 minutes. Need to include peer feedback component.",
    buttonText: "Draft Lesson Plan",
    generatingText: "Drafting Lesson...",
    outputTitle: "Generated Lesson Plan",
  },
];

type RefinementOption =
  // Report options
  | "more-positive"
  | "less-positive"
  | "more-specific"
  | "focus-strengths"
  | "focus-growth"
  | "shorten"
  | "add-detail"
  // Learning Plan options
  | "add-activities"
  | "include-resources"
  | "make-concise"
  | "make-practical"
  // Lesson Plan options
  | "add-differentiation"
  | "include-assessment"
  | "expand-activities"
  | "add-scaffolding";

const REFINEMENT_OPTIONS: Record<RefinementOption, string> = {
  // Report options
  "more-positive": "make the tone more positive and encouraging",
  "less-positive": "make the tone more direct and honest about concerns",
  "more-specific": "add more specific details and examples",
  "focus-strengths": "emphasise strengths and achievements",
  "focus-growth": "focus more on areas for development",
  shorten: "make this more concise",
  "add-detail": "expand with more detail",
  // Learning Plan options
  "add-activities": "include more specific learning activities for each area",
  "include-resources": "add more specific resources and materials",
  "make-concise": "make this more concise",
  "make-practical": "make this more practical and actionable",
  // Lesson Plan options
  "add-differentiation":
    "include more differentiation strategies for different ability levels",
  "include-assessment": "add more assessment methods and success criteria",
  "expand-activities":
    "provide more detailed activities and teaching strategies",
  "add-scaffolding": "include more scaffolding and instructional supports",
};

// Define which refinement options are available for each assistant type
const ASSISTANT_REFINEMENT_OPTIONS: Record<AssistantType, RefinementOption[]> =
  {
    report: [
      "more-positive",
      "less-positive",
      "more-specific",
      "focus-strengths",
      "focus-growth",
      "shorten",
      "add-detail",
    ],
    "learning-plan": [
      "add-detail",
      "make-concise",
      "add-activities",
      "include-resources",
      "more-specific",
      "make-practical",
    ],
    "lesson-plan": [
      "add-detail",
      "make-concise",
      "add-differentiation",
      "include-assessment",
      "expand-activities",
      "add-scaffolding",
    ],
  };

// Button labels for each refinement option
const REFINEMENT_BUTTON_LABELS: Record<RefinementOption, string> = {
  // Report options
  "more-positive": "Make More Positive",
  "less-positive": "Make Less Positive",
  "more-specific": "Make More Specific",
  "focus-strengths": "Focus on Strengths",
  "focus-growth": "Focus on Growth Areas",
  shorten: "Shorten",
  "add-detail": "Add More Detail",
  // Learning Plan options
  "add-activities": "Add More Activities",
  "include-resources": "Include More Resources",
  "make-concise": "Make More Concise",
  "make-practical": "Make More Practical",
  // Lesson Plan options
  "add-differentiation": "Add Differentiation Strategies",
  "include-assessment": "Include More Assessment",
  "expand-activities": "Expand Activities",
  "add-scaffolding": "Add More Scaffolding",
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<AssistantType>("report");
  const [inputText, setInputText] = useState("");
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [customRefinement, setCustomRefinement] = useState("");
  const [selectedRefinements, setSelectedRefinements] = useState<
    Set<RefinementOption>
  >(new Set());
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<Set<number>>(
    new Set()
  );
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const currentConfig = TAB_CONFIGS.find((tab) => tab.id === activeTab)!;

  // Load initial data on mount
  useEffect(() => {
    // Load data for current tab
    const savedData = loadTabData(activeTab);
    if (savedData) {
      setInputText(savedData.inputText);
      setGeneratedOutput(savedData.generatedOutput);
      setConversationHistory(savedData.conversationHistory);
    }

    // Load history for current tab
    const tabHistory = loadHistory(activeTab);
    setHistory(tabHistory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  const handleTabChange = (tabId: AssistantType) => {
    // Save current tab data before switching
    if (generatedOutput) {
      saveTabData(activeTab, {
        inputText,
        generatedOutput,
        conversationHistory,
      });
    }

    // Switch to new tab
    setActiveTab(tabId);

    // Load saved data for new tab
    const savedData = loadTabData(tabId);
    if (savedData) {
      setInputText(savedData.inputText);
      setGeneratedOutput(savedData.generatedOutput);
      setConversationHistory(savedData.conversationHistory);
    } else {
      // Clear if no saved data
      setInputText("");
      setGeneratedOutput(null);
      setConversationHistory([]);
    }

    // Load history for new tab
    const tabHistory = loadHistory(tabId);
    setHistory(tabHistory);

    // Reset refinement UI
    setCustomRefinement("");
    setSelectedRefinements(new Set());
    setIsHistoryPanelOpen(false);
    setExpandedHistoryItems(new Set());
  };

  const toggleRefinement = (option: RefinementOption) => {
    setSelectedRefinements((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(option)) {
        newSet.delete(option);
      } else {
        newSet.add(option);
      }
      return newSet;
    });
  };

  const toggleHistoryItem = (index: number) => {
    setExpandedHistoryItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleCopyToClipboard = async () => {
    if (!generatedOutput) return;

    try {
      await navigator.clipboard.writeText(generatedOutput);
      setIsCopied(true);

      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });

      // Reset after 2 seconds
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
          type: activeTab,
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
      const promptKey =
        activeTab === "report"
          ? "report"
          : activeTab === "learning-plan"
            ? "learningPlan"
            : "lessonPlan";
      const systemPrompts: Record<string, string> = {
        report: `You will receive rough, unstructured notes from a teacher about a student. These may include dictated thoughts with poor formatting or punctuation. Your job is to transform these notes into polished, professional school report commentary.

FORMAT: Write in natural paragraph form - NO bullet points, NO numbered lists, NO section headers, NO bold formatting. This should read as flowing prose that a teacher would type into a single text box in a report card system.

STRUCTURE: Write 2-3 paragraphs that naturally cover:
- Academic achievement and progress in relevant subject areas
- Behaviour, engagement, participation, and social skills
- Areas for continued development or growth
- Recommendations or strategies for ongoing support

Weave these elements together naturally rather than treating them as separate sections.

LENGTH: Target 150-200 words total. Be concise and focused.

TONE & STYLE:
- Formal and professional throughout
- Use precise educational language
- Be constructive and supportive, never negative
- Focus on growth mindset and potential
- Write in third person
- Maintain consistent past or present tense

LANGUAGE GUIDELINES:
- Use phrases like 'demonstrates', 'exhibits', 'has developed', 'continues to progress', 'would benefit from'
- For challenges, frame positively: 'an area for continued focus', 'opportunities to strengthen', 'would be supported by'
- Avoid casual language or contractions
- Use specific examples when provided in the notes

EXAMPLE STYLE (note the paragraph format with no structural elements):
'[Student] has demonstrated strong progress in literacy this term, with notable development in reading comprehension and creative writing. Their mathematical understanding continues to grow, particularly in problem-solving tasks. In the classroom, [Student] is an engaged and cooperative learner who contributes positively to group activities and maintains respectful relationships with peers. To further support their learning, continued practice with times tables at home would be beneficial, along with regular independent reading. [Student] is encouraged to continue their consistent effort and positive approach to learning challenges.'

Create commentary that flows naturally and could be directly copied into a school report card.

FORMATTING RULES FOR WORD COMPATIBILITY:
- Use blank lines to separate major sections
- For lists, use single dash '- ' for main points
- For sub-points, use '  - ' (two spaces then dash)
- For nested sub-points, use '    - ' (four spaces then dash)
- NEVER use asterisks (*) or HTML bullets (•)
- This plain text formatting must copy-paste cleanly into Microsoft Word

Example formatting:
Section Title:
- Main point here
  - Sub-point with detail
  - Another sub-point
    - Nested detail if needed

CRITICAL REFINEMENT INSTRUCTIONS:
When you receive a refinement request in the conversation history, carefully analyse what the teacher is asking you to change:

- If the request targets a SPECIFIC SECTION (e.g., 'make the mathematics section more detailed', 'improve the guided practice activities', 'rewrite the behaviour paragraph'), ONLY update that specific section. Return all other sections EXACTLY as they were in the previous response, word-for-word.

- If the request is GENERAL (e.g., 'make it more positive', 'add more detail throughout', 'make it shorter'), then apply the change across the entire document.

- If uncertain whether the request is specific or general, err on the side of being specific - only change what is explicitly mentioned.

- When making selective updates, copy the unchanged sections verbatim from your previous response to ensure consistency.

Examples of SPECIFIC requests (update only that section):
- 'Make the English section more detailed'
- 'Change the independent practice to include more differentiation'
- 'Rewrite the recommendations paragraph to be more actionable'
- 'Update the learning objectives to be more specific'

Examples of GENERAL requests (update entire document):
- 'Make this more positive overall'
- 'Add more specific examples throughout'
- 'Make it shorter'
- 'Use simpler language'

This selective approach ensures teachers don't lose approved content when making targeted refinements.`,
        learningPlan: `You will receive rough, unstructured notes from a teacher about creating an individualised learning plan. These may include dictated thoughts with poor formatting or punctuation. Your job is to create a structured, comprehensive learning plan based on the Victorian Government learning plan template.

STRUCTURE your response with these sections:

**CHILD'S STRENGTHS AND LEARNING GOALS**
Describe the child's current strengths and specific learning goals for the year.

**LEARNING AREAS**
Address each of the following eight learning areas with specific subject matter, learning activities, skills to develop, and resources needed:

1. English
2. Mathematics
3. Sciences (including Physics, Chemistry, Biology)
4. Humanities and Social Sciences (including History, Geography, Economics, Business, Civics and Citizenship)
5. The Arts
6. Languages
7. Health and Physical Education
8. Information and Communication Technology and Design and Technology

For each learning area, outline:
- Subject matter to be covered
- Learning activities to achieve goals
- Skills the child will develop
- Approach/methodology
- Resources and materials needed

**WHERE AND WHEN INSTRUCTION WILL TAKE PLACE**
Describe the learning environment and schedule.

**HOW LEARNING OUTCOMES WILL BE RECORDED**
Explain the method for tracking progress.

TONE: Professional, detailed, and practical. This is an official educational document.

If the teacher's notes don't cover all areas, indicate which sections need additional information.

FORMATTING RULES FOR WORD COMPATIBILITY:
- Use blank lines to separate major sections
- For lists, use single dash '- ' for main points
- For sub-points, use '  - ' (two spaces then dash)
- For nested sub-points, use '    - ' (four spaces then dash)
- NEVER use asterisks (*) or HTML bullets (•)
- This plain text formatting must copy-paste cleanly into Microsoft Word

Example formatting:
Section Title:
- Main point here
  - Sub-point with detail
  - Another sub-point
    - Nested detail if needed

CRITICAL REFINEMENT INSTRUCTIONS:
When you receive a refinement request in the conversation history, carefully analyse what the teacher is asking you to change:

- If the request targets a SPECIFIC SECTION (e.g., 'make the mathematics section more detailed', 'improve the guided practice activities', 'rewrite the behaviour paragraph'), ONLY update that specific section. Return all other sections EXACTLY as they were in the previous response, word-for-word.

- If the request is GENERAL (e.g., 'make it more positive', 'add more detail throughout', 'make it shorter'), then apply the change across the entire document.

- If uncertain whether the request is specific or general, err on the side of being specific - only change what is explicitly mentioned.

- When making selective updates, copy the unchanged sections verbatim from your previous response to ensure consistency.

Examples of SPECIFIC requests (update only that section):
- 'Make the English section more detailed'
- 'Change the independent practice to include more differentiation'
- 'Rewrite the recommendations paragraph to be more actionable'
- 'Update the learning objectives to be more specific'

Examples of GENERAL requests (update entire document):
- 'Make this more positive overall'
- 'Add more specific examples throughout'
- 'Make it shorter'
- 'Use simpler language'

This selective approach ensures teachers don't lose approved content when making targeted refinements.`,
        lessonPlan: `You will receive rough, unstructured notes from a teacher about a lesson they want to create. These may include dictated thoughts with poor formatting or punctuation. Your job is to create a detailed, classroom-ready lesson plan following NSW Department of Education structure.

STRUCTURE your response with these sections:

**LESSON BACKGROUND**
- Where this lesson fits in the curriculum/teaching programme
- Year level/stage

**LEARNING OBJECTIVES**
- What students will know/understand/be able to do by the end
- Why this learning matters

**SUCCESS CRITERIA**
- How students will demonstrate mastery
- What they will produce

**POTENTIAL MISCONCEPTIONS**
- Common student misconceptions to address

**LESSON STAGES:**

1. **Review of Previous Learning**
   - Activate prior knowledge
   - Check prerequisite skills

2. **Explicit Teaching ('I do')**
   - Communicate learning objectives to students
   - Break content into sequential steps
   - Model the learning with clear explanations

3. **Guided Practice ('We do')**
   - Worked examples
   - Scaffolds and instructional supports
   - Teacher-led practice with class

4. **Independent Practice ('You do')**
   - Student tasks
   - Differentiation strategies
   - Monitoring and formative assessment

5. **Lesson Closure**
   - Review key learning
   - Student reflection/summary
   - Check for understanding

For each stage, include:
- Specific tasks and activities
- How you'll monitor student learning
- Resources needed

TONE: Professional, detailed, and actionable. This should be ready for immediate classroom use.

DETAIL LEVEL: Be specific enough that another teacher could deliver this lesson successfully.

FORMATTING RULES FOR WORD COMPATIBILITY:
- Use blank lines to separate major sections
- For lists, use single dash '- ' for main points
- For sub-points, use '  - ' (two spaces then dash)
- For nested sub-points, use '    - ' (four spaces then dash)
- NEVER use asterisks (*) or HTML bullets (•)
- This plain text formatting must copy-paste cleanly into Microsoft Word

Example formatting:
Section Title:
- Main point here
  - Sub-point with detail
  - Another sub-point
    - Nested detail if needed

CRITICAL REFINEMENT INSTRUCTIONS:
When you receive a refinement request in the conversation history, carefully analyse what the teacher is asking you to change:

- If the request targets a SPECIFIC SECTION (e.g., 'make the mathematics section more detailed', 'improve the guided practice activities', 'rewrite the behaviour paragraph'), ONLY update that specific section. Return all other sections EXACTLY as they were in the previous response, word-for-word.

- If the request is GENERAL (e.g., 'make it more positive', 'add more detail throughout', 'make it shorter'), then apply the change across the entire document.

- If uncertain whether the request is specific or general, err on the side of being specific - only change what is explicitly mentioned.

- When making selective updates, copy the unchanged sections verbatim from your previous response to ensure consistency.

Examples of SPECIFIC requests (update only that section):
- 'Make the English section more detailed'
- 'Change the independent practice to include more differentiation'
- 'Rewrite the recommendations paragraph to be more actionable'
- 'Update the learning objectives to be more specific'

Examples of GENERAL requests (update entire document):
- 'Make this more positive overall'
- 'Add more specific examples throughout'
- 'Make it shorter'
- 'Use simpler language'

This selective approach ensures teachers don't lose approved content when making targeted refinements.`,
      };

      const newConversationHistory = [
        { role: "system" as const, content: systemPrompts[promptKey] },
        { role: "user" as const, content: inputText },
        { role: "assistant" as const, content: generatedText },
      ];

      setConversationHistory(newConversationHistory);

      // Save to localStorage
      const savedSuccessfully = saveTabData(activeTab, {
        inputText,
        generatedOutput: generatedText,
        conversationHistory: newConversationHistory,
      });

      // Add to history
      const historyAdded = addToHistory(activeTab, {
        timestamp: formatTimestamp(),
        content: generatedText,
        input: inputText,
      });

      // Update history state
      const updatedHistory = loadHistory(activeTab);
      setHistory(updatedHistory);

      // Show warning if localStorage failed
      if (!savedSuccessfully || !historyAdded) {
        toast({
          variant: "destructive",
          title: "Storage Warning",
          description:
            "Content generated but may not be saved due to storage limits.",
        });
      } else {
        toast({
          title: "Success",
          description: `Your ${currentConfig.label.toLowerCase()} is ready.`,
        });
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchedRefinement = async () => {
    // Build combined refinement instruction
    const refinementInstructions: string[] = [];

    // Add selected button refinements
    selectedRefinements.forEach((option) => {
      refinementInstructions.push(REFINEMENT_OPTIONS[option]);
    });

    // Add custom refinement if provided
    if (customRefinement.trim()) {
      refinementInstructions.push(customRefinement.trim());
    }

    // Check if we have any instructions
    if (refinementInstructions.length === 0) {
      toast({
        variant: "destructive",
        title: "No Refinements Selected",
        description:
          "Please select at least one refinement option or enter custom instructions.",
      });
      return;
    }

    // Build the combined prompt
    let combinedPrompt = "Please refine the above with the following changes: ";
    if (refinementInstructions.length === 1) {
      combinedPrompt += refinementInstructions[0] + ".";
    } else {
      const lastInstruction = refinementInstructions.pop();
      combinedPrompt +=
        refinementInstructions.join(", ") + ", and " + lastInstruction + ".";
    }

    setIsGenerating(true);

    try {
      // Add refinement instruction to conversation history
      const updatedHistory: Message[] = [
        ...conversationHistory,
        { role: "user" as const, content: combinedPrompt },
      ];

      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: activeTab,
          conversationHistory: updatedHistory,
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
      const newConversationHistory = [
        ...updatedHistory,
        { role: "assistant" as const, content: refinedText },
      ];

      setConversationHistory(newConversationHistory);

      // Save updated data to localStorage
      saveTabData(activeTab, {
        inputText,
        generatedOutput: refinedText,
        conversationHistory: newConversationHistory,
      });

      // Clear selections and custom refinement input
      setSelectedRefinements(new Set());
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
        description:
          error instanceof Error
            ? error.message
            : "An error occurred. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    // Clear UI state
    setInputText("");
    setGeneratedOutput(null);
    setConversationHistory([]);
    setCustomRefinement("");
    setSelectedRefinements(new Set());

    // Clear localStorage for current tab (but keep history)
    clearLocalStorage(STORAGE_KEYS[activeTab].current);
  };

  const handleClearHistory = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all history? This cannot be undone."
    );

    if (confirmed) {
      clearTabHistory(activeTab);
      setHistory([]);
      setIsHistoryPanelOpen(false);
      setExpandedHistoryItems(new Set());

      toast({
        title: "History Cleared",
        description: "All generation history has been cleared.",
      });
    }
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
              <h1
                className="text-2xl font-bold text-white tracking-tight"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
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
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all relative
                  ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
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
                {activeTab === "report"
                  ? "Student Report Commentary"
                  : currentConfig.guidanceTitle}
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
                        Use Windows+H to dictate your rough thoughts - no need
                        to worry about formatting, punctuation, or structure.
                        Just speak naturally and we&apos;ll polish it for you.
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
                {(inputText.trim() || generatedOutput) && (
                  <Button
                    data-testid="button-clear"
                    onClick={handleClear}
                    variant="ghost"
                    size="lg"
                    className="px-8 py-6 text-muted-foreground hover:text-foreground rounded-xl font-medium transition-all"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Output Display Area */}
        {generatedOutput && (
          <>
            <Card className="mt-10 bg-white shadow-lg rounded-2xl border border-border/50 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between gap-3 pb-5 mb-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
                      <div className="w-5 h-5 flex items-center justify-center">
                        {currentConfig.icon}
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {currentConfig.outputTitle}
                    </h2>
                  </div>
                  <Button
                    onClick={handleCopyToClipboard}
                    variant="outline"
                    size="sm"
                    className="sticky top-4 z-10 bg-white shadow-md hover:shadow-lg transition-all"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
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
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Refine Your Content
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Select options and click Refine to update
                </p>

                {/* Quick Refinement Buttons - Context-Specific */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {ASSISTANT_REFINEMENT_OPTIONS[activeTab].map((option) => (
                    <Button
                      key={option}
                      onClick={() => toggleRefinement(option)}
                      disabled={isGenerating}
                      variant={
                        selectedRefinements.has(option) ? "default" : "outline"
                      }
                      size="sm"
                      className={`text-xs ${selectedRefinements.has(option) ? "bg-teal-600 hover:bg-teal-700" : ""}`}
                    >
                      {REFINEMENT_BUTTON_LABELS[option]}
                    </Button>
                  ))}
                </div>

                {/* Custom Refinement Input */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <label className="text-xs font-medium text-foreground">
                    Custom Refinement Instructions
                  </label>
                  <Input
                    placeholder="Enter your custom refinement instructions..."
                    value={customRefinement}
                    onChange={(e) => setCustomRefinement(e.target.value)}
                    disabled={isGenerating}
                    className="w-full"
                  />
                </div>

                {/* Refine Button */}
                <div className="mt-4">
                  <Button
                    onClick={handleBatchedRefinement}
                    disabled={
                      isGenerating ||
                      (selectedRefinements.size === 0 &&
                        !customRefinement.trim())
                    }
                    variant="default"
                    size="lg"
                    className="w-full bg-teal-600 hover:bg-teal-700 font-medium"
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
            </Card>

            {/* History Panel */}
            {history.length > 0 && (
              <div className="mt-6">
                <Button
                  onClick={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
                  variant="outline"
                  size="default"
                  className="w-full border-2 border-slate-300 hover:border-teal-500 hover:bg-teal-50 transition-all shadow-sm hover:shadow-md"
                >
                  <HistoryIcon className="w-4 h-4 mr-2" />
                  <span className="font-medium">
                    View History ({history.length})
                  </span>
                  {isHistoryPanelOpen ? (
                    <ChevronDown className="w-4 h-4 ml-auto" />
                  ) : (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Button>

                {isHistoryPanelOpen && (
                  <div className="mt-3 space-y-3">
                    {history.map((entry, index) => {
                      const isExpanded = expandedHistoryItems.has(index);
                      return (
                        <Card
                          key={index}
                          className={`border transition-all duration-200 cursor-pointer ${
                            isExpanded
                              ? "bg-white border-teal-300 shadow-md"
                              : "bg-slate-50 border-slate-200 hover:border-teal-200 hover:shadow-sm"
                          }`}
                          onClick={() => toggleHistoryItem(index)}
                        >
                          <div className="p-4">
                            {/* Header with timestamp and chevron */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="font-medium">
                                  {entry.timestamp}
                                </span>
                              </div>
                              <div
                                className={`transition-transform duration-200 ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                              >
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </div>

                            {/* Collapsed: Preview */}
                            {!isExpanded && (
                              <p className="text-sm text-foreground line-clamp-2">
                                {entry.content.substring(0, 80)}
                                {entry.content.length > 80 && "..."}
                              </p>
                            )}

                            {/* Expanded: Full content */}
                            {isExpanded && (
                              <div className="mt-3 space-y-4">
                                {/* Input Section */}
                                <div>
                                  <p className="text-xs font-semibold text-teal-700 mb-2 uppercase tracking-wide">
                                    Input:
                                  </p>
                                  <div className="text-sm text-foreground bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    {entry.input}
                                  </div>
                                </div>

                                {/* Generated Content Section */}
                                <div>
                                  <p className="text-xs font-semibold text-teal-700 mb-2 uppercase tracking-wide">
                                    Generated Content:
                                  </p>
                                  <div className="text-sm text-foreground bg-white p-4 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed">
                                    {entry.content}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}

                    {/* Clear History Button */}
                    <div className="pt-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClearHistory();
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-400"
                      >
                        Clear History
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
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
                Enter information above and click &quot;
                {currentConfig.buttonText}&quot; to begin
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
