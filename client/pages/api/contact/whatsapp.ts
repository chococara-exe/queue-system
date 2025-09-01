import { NextApiRequest, NextApiResponse } from 'next';
import { callCustomerWhatsapp } from '../../../lib/whatsapp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { phoneNumber, queueLetter, queueNumber } = req.body;
        
        // Validate input
        if (!phoneNumber || !queueLetter || !queueNumber) {
            return res.status(400).json({ 
                error: 'Missing required fields: phoneNumber, queueLetter, queueNumber' 
            });
        }

        console.log(`Testing WhatsApp to ${phoneNumber} for queue ${queueLetter}${queueNumber}`);
        
        const result = await callCustomerWhatsapp(phoneNumber, "Yi Xin", queueLetter, queueNumber);
        
        res.status(200).json({ 
            success: true, 
            message: 'WhatsApp sent successfully',
            phoneNumber,
            queueInfo: `${queueLetter}${queueNumber}`,
            result 
        });
    } catch (error) {
        console.error('Test WhatsApp error:', error);
        res.status(500).json({ 
            error: 'Failed to send WhatsApp message',
            details: error instanceof Error ? error.message : String(error),
            phoneNumber: req.body?.phoneNumber,
            queueInfo: req.body ? `${req.body.queueLetter}${req.body.queueNumber}` : null
        });
    }
}
