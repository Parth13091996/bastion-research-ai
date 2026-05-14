import axiosInstance from "./axios";
import { endpoints } from "./endpoints";

export type QnaStatus = "pending" | "answered";

export type QnaQuestion = {
  id: string;
  question: string;
  status: QnaStatus;
  answer: string;
  author: string;
  user_id?: string | null;
  answered_by?: string | null;
  created_at: string;
  updated_at?: string | null;
  answered_at?: string | null;
};

export async function getQnaQuestions(params?: {
  status?: "all" | QnaStatus;
  search?: string;
}) {
  const { data } = await axiosInstance.get<QnaQuestion[]>(endpoints.qna.base, {
    params,
  });
  return data;
}

export async function submitQnaQuestion(question: string) {
  const { data } = await axiosInstance.post<QnaQuestion>(endpoints.qna.base, {
    question,
  });
  return data;
}

export async function getAdminQnaQuestions(params?: {
  status?: "all" | QnaStatus;
  search?: string;
}) {
  const { data } = await axiosInstance.get<QnaQuestion[]>(
    endpoints.qna.admin.base,
    { params }
  );
  return data;
}

export async function answerQnaQuestion(id: string, answer: string) {
  const { data } = await axiosInstance.put<QnaQuestion>(
    endpoints.qna.admin.answer(id),
    { answer }
  );
  return data;
}

export async function clearQnaAnswer(id: string) {
  const { data } = await axiosInstance.delete<QnaQuestion>(
    endpoints.qna.admin.answer(id)
  );
  return data;
}

export async function deleteQnaQuestion(id: string) {
  const { data } = await axiosInstance.delete<{ message: string }>(
    endpoints.qna.admin.byId(id)
  );
  return data;
}
