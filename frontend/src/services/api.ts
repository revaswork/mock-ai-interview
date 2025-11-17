import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ResumeData {
  filename: string;
  skills: string[];
  sections: {
    experience?: string;
    education?: string;
    projects?: string;
    skills?: string;
  };
  raw_text: string;
  uploaded_at: string;
}

export interface InterviewResponse {
  status: string;
  session_id: string;
  next_question?: string;
  audio_base64?: string;
  audio_url?: string;
  video_url?: string;
  message?: string;
}

export interface EvaluationData {
  technical: number;
  communication: number;
  confidence: number;
  professionalism: number;
  per_question: Array<{
    question: string;
    answer: string;
    score: number;
    feedback: string;
  }>;
}

export interface RoadmapData {
  focus_areas: string[];
  actions: string[];
  resources: Array<{
    title: string;
    url: string;
    type: string;
  }>;
}

export interface StopInterviewResponse {
  status: string;
  evaluation: EvaluationData;
  report: any;
  roadmap: RoadmapData;
  farewell_audio_base64?: string;
  farewell_audio_url?: string;
}

export const apiService = {
  // Upload resume
  uploadResume: async (file: File): Promise<ResumeData> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  },

  // Get presenter info (single D-ID presenter)
  getVoices: async () => {
    const response = await api.get('/api/interview/voices');
    return response.data;
  },

  // Start or continue interview
  sendAnswer: async (params: {
    session_id?: string;
    user_name: string;
    difficulty: string;
    voice_name?: string;  // Optional - backend uses default D-ID presenter
    resume_data: string;
    current_question: string;
    user_answer?: string;
    audio_file?: File;
  }): Promise<InterviewResponse> => {
    const formData = new FormData();
    
    if (params.session_id) formData.append('session_id', params.session_id);
    formData.append('user_name', params.user_name);
    formData.append('difficulty', params.difficulty);
    if (params.voice_name) formData.append('voice_name', params.voice_name);
    formData.append('resume_data', params.resume_data);
    formData.append('current_question', params.current_question);
    
    if (params.user_answer) {
      formData.append('user_answer', params.user_answer);
    }
    
    if (params.audio_file) {
      formData.append('audio_file', params.audio_file);
    }
    
    const response = await api.post('/api/interview/answer', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Stop interview and get results
  stopInterview: async (params: {
    session_id: string;
    user_name: string;
    difficulty: string;
    role?: string;
  }): Promise<StopInterviewResponse> => {
    const response = await api.post('/api/interview/stop', params);
    return response.data;
  },
};

export default api;
