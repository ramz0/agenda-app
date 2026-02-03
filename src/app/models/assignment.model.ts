export type AssignmentStatus = 'pending' | 'approved' | 'rejected';

export interface EventAssignment {
  id: string;
  eventId: string;
  userId: string;
  status: AssignmentStatus;
  assignedAt: string;
  respondedAt?: string;
}

export interface EventAssignmentWithDetails extends EventAssignment {
  userName: string;
  userEmail: string;
  eventTitle: string;
  eventDate: string;
}

export interface RespondAssignmentRequest {
  status: 'approved' | 'rejected';
}

export interface PendingCountResponse {
  count: number;
}
