export interface User {
    id: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}

export interface Meeting {
    id: number;
    user_id: string;
    title: string | null;
    transcript: string;
    summary: string | null;
    meeting_date: string | null;
    meeting_time: string | null;
    participants: string[];
    key_points: string[];
    created_at: Date;
    updated_at: Date;
}

export interface Task {
    id: number;
    user_id: string;
    meeting_id: number | null;
    title: string;
    description: string | null;
    deadline: Date | null;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    created_at: Date;
    updated_at: Date;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}