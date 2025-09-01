export async function joinQueueWhatsapp(phoneNumber: string, queueLetter: string, queueValue: number) {
    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
            method: 'post',
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: 'template',
                template: {
                    name: 'queue_join',
                    language: {
                        code: 'en_US'
                    },
                    components: [
                        // {
                        //     type: 'header',
                        //     parameters: [
                        //         {
                        //             type: 'text',
                        //             parameter_name: 'company_name',
                        //             text: '10 GRAM Sdn Bhd'
                        //         }
                        //     ]
                        // },
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type:'text',
                                    text: queueLetter
                                },
                                {
                                    type:'text',
                                    text: queueValue
                                }
                            ]
                        }
                    ]
                }
            })
        })
        console.log(response)
        console.log(process.env.WHATSAPP_API_KEY)

        const result = await response.json();

        if (!response.ok) {
            throw new Error(`WhatsApp API error: ${JSON.stringify(result)}`)
        }

        return result;
    }

    catch(e) {
        console.error(e)
        throw e;
    }
}

export async function callCustomerWhatsapp(phoneNumber: string, name: string, queueLetter: string, queueValue: number) {
    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
            method: 'post',
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: 'template',
                template: {
                    name: 'call_customer',
                    language: {
                        code: 'en_US'
                    },
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type:'text',
                                    text: name
                                },
                                {
                                    type:'text',
                                    text: queueLetter
                                },
                                {
                                    type:'text',
                                    text: queueValue
                                }
                            ]
                        }
                    ]
                }
            })
        })
        console.log(response)
        console.log(process.env.WHATSAPP_API_KEY)

        const result = await response.json();

        if (!response.ok) {
            throw new Error(`WhatsApp API error: ${JSON.stringify(result)}`)
        }

        return result;
    }

    catch(e) {
        console.error(e)
        throw e;
    }
}