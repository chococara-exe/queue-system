/**
 *
 * Run:
 *
 */

import { NextApiRequest, NextApiResponse } from "next";
// import Client from 'node-mailjet';

// const mailjet = new Client({
//     apiKey: process.env.MAILJET_API_KEY!,
//     apiSecret: process.env.MAILJET_API_SECRET!
// })

const Mailjet = require('node-mailjet')

// const mailjet = Mailjet.apiConnect(
//   process.env.MAILJET_API_KEY,
//   process.env.MAILJET_API_SECRET,
//   {
//     config: {},
//     options: {}
//   }
// )

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_API_SECRET
})

interface MailjetResponse {
    body: any;
}

interface MailjetError {
    statusCode: number;
    message?: string;
}

export async function joinQueueEmail(
    recipientEmail: string,
    recipientName: string,
    queueLetter: string,
    queueValue: number
): Promise<any> {
    try {
        const request = await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
            From: {
                Email: process.env.SENDER_EMAIL,
                Name: '10 Pots Restaurant',
            },
            To: [
                {
                Email: recipientEmail,
                Name: recipientName,
                },
            ],
            TemplateID: 7264745,
            TemplateLanguage: true,
			Variables: {
                    "queue_letter": queueLetter,
                    "queue_value": queueValue,
                    "name": recipientName
                }
            }
        ],
        })

        const result = await request as MailjetResponse;
        return result.body;
    } catch (err) {
        const error = err as MailjetError;
        console.error(`Email send error:`, error);
        throw new Error(`Failed to send email: ${error.statusCode}`);
    }
}

export async function callCustomerEmail(
    recipientEmail: string,
    recipientName: string,
    queueLetter: string,
    queueValue: number
): Promise<any> {
    try {
        const request = mailjet
        .post('send', { version: 'v3.1' })
        .request({
        Messages: [
            {
            From: {
                Email: process.env.SENDER_EMAIL,
                Name: 'noreply@10potsrestaurant',
            },
            To: [
                {
                Email: recipientEmail,
                Name: recipientName,
                },
            ],
            TemplateID: 7263291,
            TemplateLanguage: true,
			Variables: {
                    "queue_letter": queueLetter,
                    "queue_value": queueValue,
                    "name": recipientName
                }
            },
        ],
        })

        const result = await request as MailjetResponse;
        return result.body;
    } catch (err) {
        const error = err as MailjetError;
        console.error(`Email send error:`, error);
        throw new Error(`Failed to send email: ${error.statusCode}`);
    }
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({message: "Method not allowed"});
    }

    const {recipientEmail, recipientName, queueLetter, queueValue} = req.body;

    try {
        const result = await joinQueueEmail(recipientEmail, recipientName, queueLetter, queueValue);
        res.status(200).json({message: "Email sent successfully", result: result})
    } catch (error) {
        console.error("API email error:", error);
        res.status(500).json({message: "Failed to send email"})
    }
}