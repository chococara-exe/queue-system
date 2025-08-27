// pages/api/test-email.ts
import { sendQueueEmail } from './contact/email';
import type { NextApiRequest, NextApiResponse } from 'next';

interface TestEmailResult {
    success: boolean;
    message?: string;
    result?: unknown;
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<TestEmailResult>
): Promise<void> {
    try {
        console.log('Testing email with environment variables:');
        console.log('MAILJET_API_KEY:', process.env.MAILJET_API_KEY ? 'Present' : 'Missing');
        console.log('MAILJET_API_SECRET:', process.env.MAILJET_API_SECRET ? 'Present' : 'Missing');  
        console.log('SENDER_EMAIL:', process.env.SENDER_EMAIL);

        const result = await sendQueueEmail(
            'yixinchong3010@gmail.com', // Send to yourself
            'Test User',
            'A',
            1
        );
        
        res.json({ 
            success: true, 
            message: 'Test email sent!',
            result 
        });
    } catch (error) {
        console.error('Test email failed:', error);
        res.status(500).json({ 
            success: false, 
            error: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)
        });
    }
}