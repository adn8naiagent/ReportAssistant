import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { systemPrompts, model } from "../config/prompts";

// Map frontend type names to config prompt keys
const TYPE_TO_PROMPT_KEY: Record<string, string> = {
  "report": "report",
  "learning-plan": "learningPlan",
  "lesson-plan": "lessonPlan"
};

type AssistantType = "report" | "learning-plan" | "lesson-plan";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate content using OpenRouter API
  app.post("/api/generate-report", async (req, res) => {
    try {
      const { studentInfo, type = "report", conversationHistory = [] } = req.body;

      // Validate type parameter
      if (!["report", "learning-plan", "lesson-plan"].includes(type)) {
        return res.status(400).json({
          error: "Invalid type parameter. Must be 'report', 'learning-plan', or 'lesson-plan'"
        });
      }

      // Check if API key is configured
      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({
          error: "OpenRouter API key is not configured"
        });
      }

      // Get the appropriate system prompt
      const promptKey = TYPE_TO_PROMPT_KEY[type as AssistantType];
      const systemPrompt = systemPrompts[promptKey as keyof typeof systemPrompts];

      // Build messages array
      let messages: Message[];

      if (conversationHistory.length > 0) {
        // Use conversation history for refinement
        messages = conversationHistory;
      } else {
        // Initial generation
        if (!studentInfo || typeof studentInfo !== "string" || !studentInfo.trim()) {
          return res.status(400).json({
            error: "Input information is required"
          });
        }

        messages = [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: studentInfo
          }
        ];
      }

      // Call OpenRouter API
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || "anthropic/claude-3.5-haiku",
          messages: messages
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenRouter API error:", errorData);
        return res.status(response.status).json({
          error: "Failed to generate report from AI service",
          details: errorData
        });
      }

      const data = await response.json();
      const generatedReport = data.choices?.[0]?.message?.content;

      if (!generatedReport) {
        return res.status(500).json({
          error: "No report generated from AI service"
        });
      }

      res.json({ report: generatedReport });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({
        error: "An error occurred while generating the report",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
