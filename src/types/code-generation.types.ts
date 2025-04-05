// src/types/code-generation.types.ts

export interface AIAssistantStatus {
    running: boolean;
    queue: {
      statuses: {
        pending: number;
        processing: number;
        completed: number;
        failed: number;
      };
      types: {
        decompose: number;
        generate_code: number;
        commit_code: number;
      };
    };
    tokenUsage: {
      usage: {
        daily: {
          date: string;
          promptTokens: number;
          completionTokens: number;
          total: number;
        };
        models: {
          [key: string]: {
            promptTokens: number;
            completionTokens: number;
            total: number;
            requests: number;
          };
        };
      };
      limits: {
        daily: number;
        hourly: number;
        perRequest: number;
      };
      estimatedCost: {
        byModel: {
          [key: string]: {
            promptCost: string;
            completionCost: string;
            totalCost: string;
          };
        };
        total: string;
      };
    };
  }
  
  export interface TaskRecommendations {
    taskId: number;
    recommendations: string;
  }
  
  export interface FailedGenerationAnalysis {
    generationId: number;
    filePath: string;
    analysis: string;
  }
  
  export interface RegenerateCodeRequest {
    generationId: number;
    taskId: number;
    feedback?: string;
  }
  
  export interface RegenerateCodeResponse {
    success: boolean;
    taskId: number;
    generationId: number;
    filePath: string;
    code: string;
    language: string;
    summary: string;
  }
  
  export interface CodeFeedbackRequest {
    projectId: number;
    generationId: number;
    feedbackText: string;
    rating: number;
  }
  
  export interface AIAssistantState {
    status: AIAssistantStatus | null;
    performanceReport: any | null;
    recommendations: TaskRecommendations | null;
    isLoading: boolean;
    error: string | null;
  }