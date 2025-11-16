import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/components/AppHeader";
import {
  Sparkles,
  FileText,
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
  FileCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AssistantType = "report" | "learning-plan" | "lesson-plan" | "writing-assessment";

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
  "writing-assessment": {
    current: "teachassist_assessment_current",
    history: "teachassist_assessment_history",
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
    outputTitle: "Polished Draft Commentary",
  },
  {
    id: "learning-plan",
    label: "Learning Plan Assistant",
    icon: <Target className="w-5 h-5" />,
    guidanceTitle: "Individual Learning Plan",
    guidanceText:
      "Provide information about the student's strengths, learning goals, and your approach to teaching across the eight learning areas: English, Mathematics, Sciences, Humanities/Social Sciences, The Arts, Languages, Health/PE, and ICT/Design Technology.",
    placeholder:
      "Example: Creating plan for Year 4 student, Sarah. Strong in creative arts and verbal skills. Needs support in mathematics, especially multiplication. Interested in animals and science experiments. Will use hands-on learning approach. Have access to library resources and online educational platforms. Learning mostly at home with weekly group activities.",
    buttonText: "Draft Learning Plan",
    generatingText: "Drafting Plan...",
    outputTitle: "Polished Draft Learning Plan",
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
    outputTitle: "Polished Draft Lesson Plan",
  },
  {
    id: "writing-assessment",
    label: "Assessment Assistant",
    icon: <FileCheck className="w-5 h-5" />,
    guidanceTitle: "Writing Assessment",
    guidanceText:
      "Upload a handwriting sample to assess against Australian Curriculum standards.",
    placeholder: "",
    buttonText: "Assess Writing",
    generatingText: "Analyzing Handwriting...",
    outputTitle: "Assessment Results",
  },
];

type RefinementOption =
  // Report options
  | "more-positive"
  | "less-positive"
  | "more-formal"
  | "less-formal"
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
  "more-formal": "rewrite this with more formal, traditional academic language",
  "less-formal": "rewrite this with a warmer, more conversational (but still professional) tone",
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
      "more-formal",
      "less-formal",
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
    "writing-assessment": [],
  };

// Button labels for each refinement option
const REFINEMENT_BUTTON_LABELS: Record<RefinementOption, string> = {
  // Report options
  "more-positive": "Make More Positive",
  "less-positive": "Make Less Positive",
  "more-formal": "Make More Formal",
  "less-formal": "Make Less Formal",
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

  // Assessment-specific state
  const [yearLevel, setYearLevel] = useState<string>("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { toast } = useToast();

  // Ref for output section to scroll to
  const outputSectionRef = useRef<HTMLDivElement>(null);

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

  const convertToHTML = (content: string): string => {
    // Convert **text** to <strong>text</strong>
    let html = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Split into lines for processing
    const lines = html.split('\n');
    const result: string[] = [];
    let inList = false;
    let inOrderedList = false;
    let listStack: string[] = [];
    let nestingLevel = 0;
    const MAX_NESTING = 2;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check if it's a numbered list (e.g., "1. ", "2. ")
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        const content = numberedMatch[2];

        if (!inOrderedList) {
          // Close any bullet list
          if (inList) {
            while (listStack.length > 0) {
              result.push(listStack.pop()!);
            }
            listStack = [];
            inList = false;
            nestingLevel = 0;
          }
          result.push('<ol>');
          inOrderedList = true;
        }

        result.push(`<li>${content}</li>`);
      }
      // Check if it's a bullet point
      else if (trimmed.startsWith('- ')) {
        // Calculate indent level (spaces before the dash)
        const indent = line.search(/\S/);
        const content = trimmed.substring(2);

        // Determine nesting level based on indent (0, 2, 4+ spaces)
        let targetLevel = 0;
        if (indent >= 4) {
          // More than 4 spaces - cap at level 2
          targetLevel = 2;
        } else if (indent >= 2) {
          targetLevel = 1;
        }

        // Enforce maximum nesting of 2 levels
        if (targetLevel > MAX_NESTING - 1) {
          targetLevel = MAX_NESTING - 1;
        }

        if (!inList) {
          // Close any numbered list
          if (inOrderedList) {
            result.push('</ol>');
            inOrderedList = false;
          }
          // Start new list
          result.push('<ul>');
          inList = true;
          nestingLevel = 0;
        }

        // Adjust nesting level
        while (nestingLevel > targetLevel) {
          result.push('</ul>');
          result.push('</li>');
          nestingLevel--;
          listStack.pop();
        }

        while (nestingLevel < targetLevel && nestingLevel < MAX_NESTING - 1) {
          // Need to go deeper
          if (nestingLevel === 0) {
            result.push('<li>');
          }
          result.push('<ul>');
          listStack.push('</ul></li>');
          nestingLevel++;
        }

        // Close previous item at this level if needed
        if (result[result.length - 1] === '</li>') {
          // Previous item was closed, continue
        } else if (nestingLevel > 0 && result[result.length - 1] !== '<ul>') {
          result.push('</li>');
        }

        result.push(`<li>${content}`);
        result.push('</li>');

      } else {
        // Close any open lists
        if (inList) {
          while (listStack.length > 0) {
            result.push(listStack.pop()!);
          }
          result.push('</ul>');
          listStack = [];
          inList = false;
          nestingLevel = 0;
        }
        if (inOrderedList) {
          result.push('</ol>');
          inOrderedList = false;
        }

        // Add paragraph or blank line
        if (trimmed === '') {
          result.push('<br>');
        } else {
          result.push(`<p>${line}</p>`);
        }
      }
    }

    // Close any remaining lists
    if (inList) {
      while (listStack.length > 0) {
        result.push(listStack.pop()!);
      }
      result.push('</ul>');
    }
    if (inOrderedList) {
      result.push('</ol>');
    }

    return result.join('');
  };

  const handleCopyToClipboard = async () => {
    if (!generatedOutput) return;

    try {
      // Convert content to HTML
      const htmlContent = convertToHTML(generatedOutput);

      // Create blobs for both HTML and plain text
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([generatedOutput], { type: 'text/plain' });

      // Write both formats to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob
        })
      ]);

      setIsCopied(true);

      toast({
        title: "Copied!",
        description: "Content copied to clipboard with formatting",
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

  // Get EXIF orientation from image
  const getOrientation = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const view = new DataView(e.target?.result as ArrayBuffer);
        if (view.getUint16(0, false) !== 0xFFD8) {
          resolve(1); // Not a JPEG
          return;
        }
        const length = view.byteLength;
        let offset = 2;
        while (offset < length) {
          if (view.getUint16(offset + 2, false) <= 8) {
            resolve(1);
            return;
          }
          const marker = view.getUint16(offset, false);
          offset += 2;
          if (marker === 0xFFE1) {
            if (view.getUint32(offset += 2, false) !== 0x45786966) {
              resolve(1);
              return;
            }
            const little = view.getUint16(offset += 6, false) === 0x4949;
            offset += view.getUint32(offset + 4, little);
            const tags = view.getUint16(offset, little);
            offset += 2;
            for (let i = 0; i < tags; i++) {
              if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                resolve(view.getUint16(offset + (i * 12) + 8, little));
                return;
              }
            }
          } else if ((marker & 0xFF00) !== 0xFF00) {
            break;
          } else {
            offset += view.getUint16(offset, false);
          }
        }
        resolve(1);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Image compression helper with auto-rotation
  const compressImage = async (file: File, maxSizeMB: number = 3): Promise<File> => {
    return new Promise(async (resolve, reject) => {
      // Get EXIF orientation
      const orientation = await getOrientation(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 2000; // Max width or height
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          // Set canvas size based on orientation
          if (orientation > 4 && orientation < 9) {
            canvas.width = height;
            canvas.height = width;
          } else {
            canvas.width = width;
            canvas.height = height;
          }

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Apply rotation based on EXIF orientation
          switch (orientation) {
            case 2:
              ctx.transform(-1, 0, 0, 1, width, 0);
              break;
            case 3:
              ctx.transform(-1, 0, 0, -1, width, height);
              break;
            case 4:
              ctx.transform(1, 0, 0, -1, 0, height);
              break;
            case 5:
              ctx.transform(0, 1, 1, 0, 0, 0);
              break;
            case 6:
              ctx.transform(0, 1, -1, 0, height, 0);
              break;
            case 7:
              ctx.transform(0, -1, -1, 0, height, width);
              break;
            case 8:
              ctx.transform(0, -1, 1, 0, 0, width);
              break;
            default:
              break;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Try different quality levels until file is under maxSizeMB
          const tryCompress = (quality: number) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'));
                  return;
                }

                const maxBytes = maxSizeMB * 1024 * 1024;

                if (blob.size <= maxBytes || quality <= 0.1) {
                  // Success or we've tried our best
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  });
                  resolve(compressedFile);
                } else {
                  // Try again with lower quality
                  tryCompress(quality - 0.1);
                }
              },
              'image/jpeg',
              quality
            );
          };

          tryCompress(0.9); // Start with 90% quality
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Assessment handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeMB = 1.5; // Reduced to 1.5MB for faster uploads
    const maxBytes = maxSizeMB * 1024 * 1024;

    let processedFile = file;

    // For PDFs, we can't compress them easily in browser
    if (file.type === 'application/pdf') {
      if (file.size > maxBytes) {
        toast({
          variant: "destructive",
          title: "PDF Too Large",
          description: `PDF size must be less than ${maxSizeMB}MB. Please compress the PDF externally or use an image instead.`,
        });
        e.target.value = '';
        return;
      }
    } else if (file.type.startsWith('image/')) {
      // Always compress images to ensure optimal size
      try {
        if (file.size > maxBytes) {
          toast({
            title: "Compressing Image",
            description: "Your image is being compressed...",
          });
        }

        processedFile = await compressImage(file, maxSizeMB);

        if (file.size > maxBytes) {
          toast({
            title: "Image Compressed",
            description: `Reduced from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`,
          });
        }
      } catch (error) {
        console.error('Compression error:', error);
        toast({
          variant: "destructive",
          title: "Compression Failed",
          description: "Could not compress the image. Please try a smaller file.",
        });
        e.target.value = '';
        return;
      }
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);

      // Store base64 data (remove the data:image/xxx;base64, prefix)
      const base64Data = result.split(',')[1];
      setImageData(base64Data);
      setImageType(processedFile.type);
    };
    reader.readAsDataURL(processedFile);
  };

  const handleAssessment = async () => {
    if (!yearLevel || !imageData) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a year level and upload an image.",
      });
      return;
    }

    setIsGenerating(true);

    // Scroll to output section
    setTimeout(() => {
      outputSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);

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

      // Format assessment results for display
      let formattedOutput = "";

      // Include transcription if available
      if (data.transcription) {
        formattedOutput += `**Transcription:**\n${data.transcription}\n\n---\n\n`;
      }

      if (data.assessments && data.assessments.length > 0) {
        formattedOutput += data.assessments
          .map((a: any) => {
            const emoji = a.percentage >= 75 ? '🟢' : a.percentage >= 50 ? '🟡' : '🔴';
            return `${emoji} **${a.criterion}** (${a.percentage}%)\n${a.evidence}`;
          })
          .join('\n\n');
      } else if (data.rawResponse) {
        formattedOutput = data.rawResponse;
      }

      setGeneratedOutput(formattedOutput);

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
      setIsGenerating(false);
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

    // Scroll to output section
    setTimeout(() => {
      outputSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);

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

      // Save conversation history (without system prompt - server manages that)
      const newConversationHistory = [
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

    // Scroll to output section
    setTimeout(() => {
      outputSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);

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
      {/* App Header with Navigation */}
      <AppHeader
        activeAssistant={activeTab}
        onAssistantChange={handleTabChange}
      />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8 pb-12">
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
              {activeTab === "writing-assessment" ? (
                // Assessment UI
                <>
                  {/* Year Level Selection */}
                  <div>
                    <label htmlFor="year-level" className="block text-sm font-medium text-foreground mb-3">
                      Year Level
                    </label>
                    <select
                      id="year-level"
                      value={yearLevel}
                      onChange={(e) => setYearLevel(e.target.value)}
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
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Upload or Capture Image
                    </label>

                    {/* Quick Tip */}
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
                            Take a photo with your camera or upload an existing image. Large images will be automatically compressed.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Hidden file inputs */}
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Input
                      id="camera-capture"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Upload buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('camera-capture')?.click()}
                        className="w-full border-2 border-teal-200 hover:border-teal-400 hover:bg-teal-50"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Take Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="w-full border-2 border-teal-200 hover:border-teal-400 hover:bg-teal-50"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload File
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supports images and PDFs (images auto-compress to 1.5MB)
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

                  {/* Assessment Button */}
                  <div className="flex gap-4 justify-center pt-4">
                    <Button
                      onClick={handleAssessment}
                      disabled={isGenerating || !yearLevel || !imageData}
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
                          <FileCheck className="w-5 h-5 mr-2" />
                          {currentConfig.buttonText}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                // Text-based assistants UI
                <>
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
                        className="px-8 py-6 bg-slate-100 hover:bg-slate-200 text-muted-foreground hover:text-foreground rounded-xl font-medium transition-all"
                      >
                        <X className="w-5 h-5 mr-2" />
                        Clear
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Output Display Area */}
        {(generatedOutput || isGenerating) && (
          <div ref={outputSectionRef}>
            <Card className="mt-10 bg-white shadow-lg rounded-2xl border border-border/50">
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
                <div className="bg-slate-50 rounded-xl p-6 relative min-h-[400px]">
                  {/* Previous/Empty Content Background */}
                  {generatedOutput && (
                    <>
                      <div className="flex justify-end sticky top-4 z-20 mb-2">
                        <Button
                          onClick={handleCopyToClipboard}
                          variant="outline"
                          size="sm"
                          className="bg-white shadow-md hover:shadow-lg transition-all"
                          disabled={isGenerating}
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
                        id="generated-content"
                        className="text-base text-foreground [&_p]:mb-2 [&_p]:mt-0 [&_p]:[line-height:1.4] [&_strong]:font-semibold [&_strong]:block [&_strong]:mt-3 [&_strong]:mb-1.5 [&_ul]:my-1 [&_ul]:pl-5 [&_ul]:list-disc [&_ol]:my-1 [&_ol]:pl-5 [&_ol]:list-decimal [&_li]:my-0.5 [&_li]:[line-height:1.4] [&_ul_ul]:my-0.5 [&_ul_ul]:pl-5 [&_ul_ul_ul]:hidden [&_br]:my-0.5"
                        dangerouslySetInnerHTML={{ __html: convertToHTML(generatedOutput) }}
                      />
                    </>
                  )}

                  {/* Transformation Animation Overlay */}
                  {isGenerating && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl"
                    >
                      <div className="pt-12 text-center">
                        {/* Rotating Sparkles Icon */}
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-12 h-12 text-teal-600 mx-auto" />
                        </motion.div>

                        {/* Transformation Text */}
                        <p className="mt-4 text-teal-700">
                          {currentConfig.generatingText}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>

            {/* Refinement Section - Only show for text-based assistants */}
            {activeTab !== "writing-assessment" && generatedOutput && (
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
            )}
          </div>
        )}

        {/* Empty State Placeholder */}
        {!generatedOutput && !isGenerating && (
          <div className="mt-10">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border-2 border-dashed border-border rounded-2xl p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-full shadow-sm">
                  <img
                    src="/logo-icon.svg"
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

        {/* History Panel */}
        {history.length > 0 && (
          <div className="mt-10">
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
                      className={`border transition-all duration-200 ${
                        isExpanded
                          ? "bg-white border-teal-300 shadow-md"
                          : "bg-slate-50 border-slate-200 hover:border-teal-200 hover:shadow-sm"
                      }`}
                    >
                      <div className="p-4">
                        {/* Header with timestamp and chevron - CLICKABLE */}
                        <div
                          className="flex items-center justify-between gap-2 mb-2 cursor-pointer hover:bg-slate-100 -mx-4 px-4 py-2 rounded-t-lg transition-colors"
                          onClick={() => toggleHistoryItem(index)}
                        >
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

                        {/* Collapsed: Preview - CLICKABLE */}
                        {!isExpanded && (
                          <p
                            className="text-sm text-foreground line-clamp-2 cursor-pointer"
                            onClick={() => toggleHistoryItem(index)}
                          >
                            {entry.content.substring(0, 80)}
                            {entry.content.length > 80 && "..."}
                          </p>
                        )}

                        {/* Expanded: Full content - SELECTABLE TEXT */}
                        {isExpanded && (
                          <div
                            className="mt-3 space-y-4 select-text"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Input Section */}
                            <div>
                              <p className="text-xs font-semibold text-teal-700 mb-2 uppercase tracking-wide">
                                Input:
                              </p>
                              <div className="text-sm text-foreground bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-text">
                                {entry.input}
                              </div>
                            </div>

                            {/* Generated Content Section */}
                            <div>
                              <p className="text-xs font-semibold text-teal-700 mb-2 uppercase tracking-wide">
                                Generated Content:
                              </p>
                              <div className="text-sm text-foreground bg-white p-4 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed cursor-text">
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
