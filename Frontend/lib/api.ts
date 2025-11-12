// Frontend API Service Layer - Communicates with FastAPI Backend

import { env } from "./env";

const API_URL = env.API_URL;

// -----------------------------
// 🎤 INTERVIEW API
// -----------------------------

export interface Voice {
  id: string;
  name: string;
  style: string;
  gender: string;
  avatar: string;
}

export interface InterviewAnswer {
  session_id?: string;
  user_name: string;
  difficulty: string;
  voice_name: string;
  resume_data: string;
  current_question: string;
  user_answer?: string;
  audio_file?: File;
}

export interface InterviewResponse {
  status: string;
  session_id: string;
  next_question?: string;
  audio_base64?: string;
  audio_url?: string;
  message?: string;
}

/**
 * Get available interviewer voices/avatars
 */
export async function getVoices(): Promise<Voice[]> {
  try {
    const response = await fetch(`${API_URL}/api/interview/voices`);
    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error("Error fetching voices:", error);
    throw error;
  }
}

/**
 * Send answer to backend and get next question
 * Supports both text and audio answers
 */
export async function sendAnswer(payload: InterviewAnswer): Promise<InterviewResponse> {
  try {
    const formData = new FormData();
    
    if (payload.session_id) {
      formData.append("session_id", payload.session_id);
    }
    formData.append("user_name", payload.user_name);
    formData.append("difficulty", payload.difficulty);
    formData.append("voice_name", payload.voice_name);
    formData.append("resume_data", payload.resume_data);
    formData.append("current_question", payload.current_question);
    
    if (payload.user_answer) {
      formData.append("user_answer", payload.user_answer);
    }
    
    if (payload.audio_file) {
      formData.append("audio_file", payload.audio_file);
    }

    const response = await fetch(`${API_URL}/api/interview/answer`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending answer:", error);
    throw error;
  }
}

/**
 * Stop interview and generate final report
 */
export async function stopInterview(payload: {
  session_id: string;
  user_name: string;
  difficulty: string;
  role?: string;
}): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/api/interview/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error stopping interview:", error);
    throw error;
  }
}

// -----------------------------
// 📄 RESUME API
// -----------------------------

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

/**
 * Upload and parse resume
 */
export async function uploadResume(file: File): Promise<ResumeData> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/api/resume/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    
    if (result.status === "success") {
      return result.data;
    } else {
      throw new Error(result.message || "Failed to upload resume");
    }
  } catch (error) {
    console.error("Error uploading resume:", error);
    throw error;
  }
}

// -----------------------------
// 📊 REPORT API
// -----------------------------

export interface Evaluation {
  session_id: string;
  user_name: string;
  technical: number;
  communication: number;
  confidence: number;
  professionalism: number;
  per_question: Array<{
    question: string;
    technical_score: number;
    feedback: string;
  }>;
}

export interface Report {
  session_id: string;
  user_id: string;
  difficulty: string;
  feedback: {
    technical: string;
    communication: string;
    confidence: string;
    professionalism: string;
  };
  recommendations: {
    short_term: string[];
    long_term: string[];
  };
}

export interface Roadmap {
  session_id: string;
  user_name: string;
  focus_areas: string[];
  actions: string[];
  resources: string[];
}

export interface FullReport {
  status: string;
  session_id: string;
  evaluation: Evaluation;
  report: Report;
  roadmap: Roadmap;
  interview: any;
}

/**
 * Get report by session ID
 */
export async function getReport(sessionId: string): Promise<FullReport> {
  try {
    const response = await fetch(`${API_URL}/api/report/${sessionId}`);
    const data = await response.json();
    
    if (data.status === "success") {
      return data;
    } else {
      throw new Error(data.message || "Failed to fetch report");
    }
  } catch (error) {
    console.error("Error fetching report:", error);
    throw error;
  }
}

/**
 * Get all reports for a user
 */
export async function getUserReports(userName: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/api/reports/${userName}`);
    const data = await response.json();
    
    if (data.status === "success") {
      return data.reports || [];
    } else {
      throw new Error(data.message || "Failed to fetch user reports");
    }
  } catch (error) {
    console.error("Error fetching user reports:", error);
    throw error;
  }
}
