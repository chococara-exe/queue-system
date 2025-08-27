export interface CustomerData {
    _id?: string;
    name: string;
    queue: {
        letter: string;
        value: number;
    };
    contact_type: string;
    contact: string;
    adults: number;
    children: number;
    babies: number;
    babychair: number;
    status: 'waiting' | 'completed' | 'absent';
    timestamp?: Date;
}