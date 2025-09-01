import { CustomerData } from "./customer";

export interface QueueData {
    queue: string;
    value: number;
    customer?: CustomerData | null;
    nextCustomer?: CustomerData | null;
}