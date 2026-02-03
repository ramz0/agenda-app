import { AssignmentStatus } from './assignment.model';

export type EventStatus = 'draft' | 'published' | 'cancelled';
export type EventType = 'personal' | 'team';

export interface EventParticipant {
  userId: string;
  userName?: string;
  userEmail?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity?: number;
  status: EventStatus;
  type: EventType;
  teamId?: string;
  teamName?: string;
  participants?: EventParticipant[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attendeeCount?: number;
  assignmentStatus?: AssignmentStatus;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity?: number;
  status?: EventStatus;
  type?: EventType;
  teamId?: string;
  participantIds?: string[];
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  capacity?: number;
  status?: EventStatus;
  type?: EventType;
  teamId?: string;
  participantIds?: string[];
}
