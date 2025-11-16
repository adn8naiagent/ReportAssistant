import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { systemPrompts, model } from "../config/prompts";
import { writingAssessmentModel, writingAssessmentStandards, writingAssessmentSystemPrompt } from "../config/assessment";
import adminRoutes from "./routes/admin";
import { nanoid } from "nanoid";
import { trackEvent } from "./utils/tracking";
import { prisma } from "./db";

// Map frontend type names to config prompt keys
const TYPE_TO_PROMPT_KEY: Record<string, string> = {
  report: "report",
  "learning-plan": "learningPlan",
  "lesson-plan": "lessonPlan",
};

type AssistantType = "report" | "learning-plan" | "lesson-plan";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Register admin routes
  console.log('✓ Registering admin routes at /api/admin');
  app.use('/api/admin', adminRoutes);

  // Generate content using OpenRouter API
  app.post("/api/generate-report", async (req, res) => {
    const startTime = Date.now();
    const sessionId = req.sessionId || null;
    const userId = (req.user as any)?.id || null;

    try {
      const {
        studentInfo,
        type = "report",
        conversationHistory = [],
      } = req.body;

      // Validate type parameter
      if (!["report", "learning-plan", "lesson-plan"].includes(type)) {
        return res.status(400).json({
          error:
            "Invalid type parameter. Must be 'report', 'learning-plan', or 'lesson-plan'",
        });
      }

      // Check if API key is configured
      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({
          error: "OpenRouter API key is not configured",
        });
      }

      // Get the appropriate system prompt (always from config/prompts.ts)
      const promptKey = TYPE_TO_PROMPT_KEY[type as AssistantType];
      const systemPrompt =
        systemPrompts[promptKey as keyof typeof systemPrompts];

      // Build messages array
      let messages: Message[];

      if (conversationHistory.length > 0) {
        // Refinement: prepend system prompt to conversation history
        messages = [
          {
            role: "system",
            content: systemPrompt,
          },
          ...conversationHistory,
        ];
      } else {
        // Initial generation
        if (
          !studentInfo ||
          typeof studentInfo !== "string" ||
          !studentInfo.trim()
        ) {
          return res.status(400).json({
            error: "Input information is required",
          });
        }

        messages = [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: studentInfo,
          },
        ];
      }

      // Call OpenRouter API
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model || "anthropic/claude-3.5-haiku",
            messages: messages,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenRouter API error:", errorData);

        // Log failed usage
        const responseTimeMs = Date.now() - startTime;
        await prisma.usageLog.create({
          data: {
            id: nanoid(),
            userId: userId,
            sessionId: sessionId || null,
            requestType: conversationHistory.length > 0 ? 'refine' : 'generate',
            assistantType: type,
            tokensInput: 0,
            tokensOutput: 0,
            costUsd: 0,
            responseTimeMs,
            model: model || 'anthropic/claude-3.5-haiku',
            wasSuccessful: false,
            errorMessage: errorData?.error?.message || 'API request failed',
            createdAt: new Date(),
          },
        }).catch((logError) => {
          console.error('❌ Failed to log failed usage:', logError);
        });

        return res.status(response.status).json({
          error: "Failed to generate report from AI service",
          details: errorData,
        });
      }

      const data = await response.json();
      const generatedReport = data.choices?.[0]?.message?.content;

      if (!generatedReport) {
        // Log failed usage
        const responseTimeMs = Date.now() - startTime;
        await prisma.usageLog.create({
          data: {
            id: nanoid(),
            userId: userId,
            sessionId: sessionId || null,
            requestType: conversationHistory.length > 0 ? 'refine' : 'generate',
            assistantType: type,
            tokensInput: 0,
            tokensOutput: 0,
            costUsd: 0,
            responseTimeMs,
            model: model || 'anthropic/claude-3.5-haiku',
            wasSuccessful: false,
            errorMessage: 'No report generated from AI service',
            createdAt: new Date(),
          },
        }).catch((logError) => {
          console.error('❌ Failed to log failed usage:', logError);
        });

        return res.status(500).json({
          error: "No report generated from AI service",
        });
      }

      // Track successful usage
      const tokensInput = data.usage?.prompt_tokens || 0;
      const tokensOutput = data.usage?.completion_tokens || 0;
      const costUsd = (tokensInput * 0.25 / 1000000) + (tokensOutput * 1.25 / 1000000);
      const responseTimeMs = Date.now() - startTime;
      const requestType = conversationHistory.length > 0 ? 'refine' : 'generate';

      try {
        await prisma.usageLog.create({
          data: {
            id: nanoid(),
            userId: userId,
            sessionId: sessionId || null,
            requestType,
            assistantType: type,
            tokensInput,
            tokensOutput,
            costUsd,
            responseTimeMs,
            model: model || 'anthropic/claude-3.5-haiku',
            wasSuccessful: true,
            createdAt: new Date(),
          },
        });

        // Only track event if sessionId exists
        if (sessionId) {
          await trackEvent({
            sessionId: sessionId,
            userId: userId,
            eventType: requestType === 'refine' ? 'content_refined' : 'content_generated',
            eventCategory: 'ai_generation',
            eventLabel: type,
            metadata: { tokensUsed: tokensInput + tokensOutput, cost: costUsd },
          });
        }

        console.log(`✅ Usage logged: ${requestType} ${type} - ${tokensInput + tokensOutput} tokens, $${costUsd.toFixed(6)}`);
      } catch (logError) {
        console.error('❌ Failed to log usage:', logError);
        // Don't fail the request if logging fails
      }

      res.json({ report: generatedReport });
    } catch (error) {
      console.error("Error generating report:", error);

      // Log failed usage
      const responseTimeMs = Date.now() - startTime;
      await prisma.usageLog.create({
        data: {
          id: nanoid(),
          userId: userId,
          sessionId: sessionId || null,
          requestType: req.body.conversationHistory?.length > 0 ? 'refine' : 'generate',
          assistantType: req.body.type || 'report',
          tokensInput: 0,
          tokensOutput: 0,
          costUsd: 0,
          responseTimeMs,
          model: model || 'anthropic/claude-3.5-haiku',
          wasSuccessful: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          createdAt: new Date(),
        },
      }).catch((dbError) => {
        console.error("Failed to log error to database:", dbError);
      });

      res.status(500).json({
        error: "An error occurred while generating the report",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Writing Assessment endpoint
  app.post("/api/assess-writing", async (req, res) => {
    const startTime = Date.now();
    const sessionId = req.sessionId || null;
    const userId = (req.user as any)?.id || null;

    try {
      const { yearLevel, imageData, imageType } = req.body;

      if (!yearLevel || !imageData) {
        return res.status(400).json({ error: 'Year level and image required' });
      }

      const standards = writingAssessmentStandards[yearLevel];
      if (!standards || standards.criteria.length === 0) {
        return res.status(400).json({ error: `No criteria defined for ${yearLevel}` });
      }

      const criteriaText = standards.criteria[0];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: writingAssessmentModel,
          messages: [
            {
              role: 'system',
              content: writingAssessmentSystemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${imageType};base64,${imageData}`
                  }
                },
                {
                  type: 'text',
                  text: `Analyze the handwriting photograph above against this ${yearLevel} achievement standard:\n\n${criteriaText}`
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenRouter API error:', errorData);

        // Log failed usage
        const responseTimeMs = Date.now() - startTime;
        await prisma.usageLog.create({
          data: {
            id: nanoid(),
            userId: userId,
            sessionId: sessionId || null,
            requestType: 'assess',
            assistantType: 'writing-assessment',
            tokensInput: 0,
            tokensOutput: 0,
            costUsd: 0,
            responseTimeMs,
            model: writingAssessmentModel,
            wasSuccessful: false,
            errorMessage: errorData?.error?.message || 'API request failed',
            createdAt: new Date(),
          },
        }).catch((logError) => {
          console.error('❌ Failed to log failed usage:', logError);
        });

        return res.status(response.status).json({
          error: 'Failed to assess writing from AI service',
          details: errorData,
        });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        // Log failed usage
        const responseTimeMs = Date.now() - startTime;
        await prisma.usageLog.create({
          data: {
            id: nanoid(),
            userId: userId,
            sessionId: sessionId || null,
            requestType: 'assess',
            assistantType: 'writing-assessment',
            tokensInput: 0,
            tokensOutput: 0,
            costUsd: 0,
            responseTimeMs,
            model: writingAssessmentModel,
            wasSuccessful: false,
            errorMessage: 'No assessment generated from AI service',
            createdAt: new Date(),
          },
        }).catch((logError) => {
          console.error('❌ Failed to log failed usage:', logError);
        });

        return res.status(500).json({
          error: 'No assessment generated from AI service',
        });
      }

      let assessmentData;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        assessmentData = JSON.parse(jsonMatch ? jsonMatch[0] : content);
      } catch (e) {
        assessmentData = { assessments: [], rawResponse: content };
      }

      // Track successful usage
      const tokensInput = data.usage?.prompt_tokens || 0;
      const tokensOutput = data.usage?.completion_tokens || 0;
      const costUsd = (tokensInput * 0.25 / 1000000) + (tokensOutput * 1.25 / 1000000);
      const responseTimeMs = Date.now() - startTime;

      try {
        await prisma.usageLog.create({
          data: {
            id: nanoid(),
            userId: userId,
            sessionId: sessionId || null,
            requestType: 'assess',
            assistantType: 'writing-assessment',
            tokensInput,
            tokensOutput,
            costUsd,
            responseTimeMs,
            model: writingAssessmentModel,
            wasSuccessful: true,
            createdAt: new Date(),
          },
        });

        // Only track event if sessionId exists
        if (sessionId) {
          await trackEvent({
            sessionId: sessionId,
            userId: userId,
            eventType: 'assessment_generated',
            eventCategory: 'ai_assessment',
            eventLabel: 'writing-assessment',
            metadata: { tokensUsed: tokensInput + tokensOutput, cost: costUsd, yearLevel },
          });
        }

        console.log(`✅ Usage logged: assess writing-assessment - ${tokensInput + tokensOutput} tokens, $${costUsd.toFixed(6)}`);
      } catch (logError) {
        console.error('❌ Failed to log usage:', logError);
        // Don't fail the request if logging fails
      }

      res.json(assessmentData);
    } catch (error) {
      console.error('Assessment error:', error);

      // Log failed usage
      const responseTimeMs = Date.now() - startTime;
      await prisma.usageLog.create({
        data: {
          id: nanoid(),
          userId: userId,
          sessionId: sessionId || null,
          requestType: 'assess',
          assistantType: 'writing-assessment',
          tokensInput: 0,
          tokensOutput: 0,
          costUsd: 0,
          responseTimeMs,
          model: writingAssessmentModel,
          wasSuccessful: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          createdAt: new Date(),
        },
      }).catch((dbError) => {
        console.error("Failed to log error to database:", dbError);
      });

      res.status(500).json({
        error: 'Assessment failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
