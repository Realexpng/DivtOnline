
export type Gender = 'male' | 'female';
export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  pib: string;
  login: string;
  email: string;
  phone: string;
  password?: string;
  gender: Gender;
  role: UserRole;
  avatarUrl?: string;
  sessionToken?: string;
}

export enum CertificateType {
  STUDY = 'STUDY',
  EDBO = 'EDBO'
}

export enum CertificateStatus {
  NEW = 'NEW',
  DONE = 'DONE'
}

export interface CertificateRequest {
  id: string;
  userId: string;
  userPib: string;
  userPhone: string; // Added phone field
  type: CertificateType;
  status: CertificateStatus;
  createdAt: number;
  fileUrl?: string; // For EDBO requests
  fileName?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface ChatSession {
  userId: string;
  userPib: string;
  messages: ChatMessage[];
  isActive: boolean;
  hasUnreadAdmin?: boolean;
  hasUnreadUser?: boolean;
}

export type Language = 'uk' | 'en';
