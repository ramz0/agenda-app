import { AssignmentStatus } from './assignment.model';

export type EventStatus = 'draft' | 'published' | 'cancelled';
export type EventType = 'personal' | 'team';
export type ParticipantRole = 'speaker' | 'attendee' | 'participant';

export interface EventParticipant {
  userId: string;
  userName?: string;
  userEmail?: string;
  role: ParticipantRole;
}

export interface ParticipantInput {
  userId: string;
  role: ParticipantRole;
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
  participantCount?: number;
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
  participants?: ParticipantInput[];
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
  participants?: ParticipantInput[];
}
