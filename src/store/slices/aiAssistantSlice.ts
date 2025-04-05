// src/store/slices/aiAssistantSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AIAssistantService from '../../api/services/ai-assistant.service';
import { enqueueSnackbar } from 'notistack';
import { 
  AIAssistantStatus, 
  TaskRecommendations, 
  FailedGenerationAnalysis,
  RegenerateCodeRequest,
  RegenerateCodeResponse,
  CodeFeedbackRequest,
  AIAssistantState
} from '../../types/code-generation.types';
import CodeGenerationService from '../../api/services/code-generation.service';

// // Интерфейс для статуса AI-ассистента
// interface AIAssistantStatus {
//   running: boolean;
//   queue: {
//     statuses: {
//       pending: number;
//       processing: number;
//       completed: number;
//       failed: number;
//     };
//     types: {
//       decompose: number;
//       generate_code: number;
//       commit_code: number;
//     };
//   };
//   tokenUsage: {
//     usage: any;
//     limits: any;
//     estimatedCost: any;
//   };
// }

// // Интерфейс для состояния
// interface AIAssistantState {
//   status: AIAssistantStatus | null;
//   performanceReport: any | null;
//   recommendations: any | null;
//   isLoading: boolean;
//   error: string | null;
// }

// Начальное состояние
const initialState: AIAssistantState = {
  status: null,
  performanceReport: null,
  recommendations: null,
  isLoading: false,
  error: null
};

// Асинхронные действия
export const fetchAIStatus = createAsyncThunk(
  'aiAssistant/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const status = await AIAssistantService.getStatus();
      return status;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при получении статуса AI-ассистента');
    }
  }
);

export const analyzeTask = createAsyncThunk(
  'aiAssistant/analyzeTask',
  async ({ projectId, taskId }: { projectId: number; taskId: number }, { rejectWithValue }) => {
    try {
      const result = await AIAssistantService.analyzeTask(projectId, taskId);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при анализе задачи');
    }
  }
);

export const getPerformanceReport = createAsyncThunk(
  'aiAssistant/getPerformanceReport',
  async ({ projectId, timeframe }: { projectId?: number; timeframe?: string }, { rejectWithValue }) => {
    try {
      const report = await AIAssistantService.getPerformanceReport(projectId, timeframe || 'week');
      return report;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при получении отчета о производительности');
    }
  }
);

export const analyzeFailedGeneration = createAsyncThunk(
  'aiAssistant/analyzeFailedGeneration',
  async ({ projectId, generationId }: { projectId: number; generationId: number }, { rejectWithValue }) => {
    try {
      const result = await CodeGenerationService.analyzeFailedGeneration(projectId, generationId);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при анализе неудачной генерации');
    }
  }
);

export const regenerateCode = createAsyncThunk(
  'aiAssistant/regenerateCode',
  async (params: RegenerateCodeRequest, { rejectWithValue }) => {
    try {
      const result = await CodeGenerationService.regenerateCode(params.generationId, params.taskId, params.feedback || '');
      enqueueSnackbar('Код успешно регенерирован', { variant: 'success' });
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при регенерации кода');
    }
  }
);

export const generateTests = createAsyncThunk(
  'aiAssistant/generateTests',
  async (generationId: number, { rejectWithValue }) => {
    try {
      const result = await CodeGenerationService.generateTests(generationId);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при генерации тестов');
    }
  }
);

export const sendFeedback = createAsyncThunk(
  'aiAssistant/sendFeedback',
  async (params: CodeFeedbackRequest, { rejectWithValue }) => {
    try {
      const result = await CodeGenerationService.sendFeedback(params);
      enqueueSnackbar('Обратная связь успешно отправлена', { variant: 'success' });
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при отправке обратной связи');
    }
  }
);


export const createPullRequest = createAsyncThunk(
  'aiAssistant/createPullRequest',
  async (params: { generationIds: number[]; title: string; description: string; branch: string }, { rejectWithValue }) => {
    try {
      const result = await CodeGenerationService.createPullRequest(params.generationIds, {
        title: params.title,
        description: params.description,
        branch: params.branch
      });
      enqueueSnackbar('Pull request успешно создан', { variant: 'success' });
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка при создании pull request');
    }
  }
);

// Создаем slice
const aiAssistantSlice = createSlice({
  name: 'aiAssistant',
  initialState,
  reducers: {
    clearRecommendations(state) {
      state.recommendations = null;
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Обработка получения статуса AI
    builder.addCase(fetchAIStatus.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAIStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      state.status = action.payload;
    });
    builder.addCase(fetchAIStatus.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Обработка анализа задачи
    builder.addCase(analyzeTask.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(analyzeTask.fulfilled, (state, action) => {
      state.isLoading = false;
      state.recommendations = action.payload;
    });
    builder.addCase(analyzeTask.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Обработка получения отчета о производительности
    builder.addCase(getPerformanceReport.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getPerformanceReport.fulfilled, (state, action) => {
      state.isLoading = false;
      state.performanceReport = action.payload;
    });
    builder.addCase(getPerformanceReport.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    builder.addCase(generateTests.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(generateTests.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(generateTests.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Обработка анализа неудачной генерации
    builder.addCase(analyzeFailedGeneration.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(analyzeFailedGeneration.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(analyzeFailedGeneration.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Обработка регенерации кода
    builder.addCase(regenerateCode.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(regenerateCode.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(regenerateCode.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Обработка отправки обратной связи
    builder.addCase(sendFeedback.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(sendFeedback.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(sendFeedback.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Обработка создания pull request
    builder.addCase(createPullRequest.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createPullRequest.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(createPullRequest.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
  }
});

// Экспортируем actions и reducer
export const { clearRecommendations, clearError } = aiAssistantSlice.actions;
export default aiAssistantSlice.reducer;