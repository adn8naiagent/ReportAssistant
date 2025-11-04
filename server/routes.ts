import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// System prompts for different assistant types
const SYSTEM_PROMPTS = {
  "report": `You are an assistant helping teachers write school reports. Format your response in these sections: Academic Performance, Behavior and Social Skills, Areas for Improvement, Recommendations. Write in a professional, supportive tone suitable for official school reports.`,

  "learning-plan": `You are an assistant helping teachers create individualized learning plans. Format your response in these sections: Current Level Assessment, Learning Goals, Strategies and Interventions, Resources Needed, Success Criteria. Be specific and actionable.`,

  "lesson-plan": `You are an assistant helping teachers create detailed lesson plans. Format your response in these sections: Lesson Objectives, Materials Needed, Introduction/Hook, Main Activities, Assessment Methods, Differentiation Strategies. Be detailed and classroom-ready.`
};

type AssistantType = "report" | "learning-plan" | "lesson-plan";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate content using OpenRouter API
  app.post("/api/generate-report", async (req, res) => {
    try {
      const { studentInfo, type = "report" } = req.body;

      if (!studentInfo || typeof studentInfo !== "string" || !studentInfo.trim()) {
        return res.status(400).json({
          error: "Input information is required"
        });
      }

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
      const systemPrompt = SYSTEM_PROMPTS[type as AssistantType];

      // Call OpenRouter API
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: studentInfo
            }
          ]
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
