import { CustomerData } from "./customer";

// export interface QueueData {
//     queue: string;
//     value: number;
//     customer?: CustomerData | null;
//     nextCustomer?: CustomerData | null;
// }

export interface QueueData {
  letter: string;
  currentNumber: number;
  totalNumber: number;
  customer: any;
  nextCustomer: any;
}