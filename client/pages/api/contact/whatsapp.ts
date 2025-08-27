export async function callCustomerWhatsapp(phoneNumber: string, queueLetter: string, queueNumber: number) {
    try {
        const response = await fetch(`https://graph.facebook.com/v21.0/${process.env.WA_PHONE_NUMBER_ID}/messages`, {
            method: 'post',
            headers: {
                'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: "60162103033",
                type: 'template',
                template: {
                    name: 'hello_world',
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
                                // {
                                //     type:'text',
                                //     // parameter_name: '1',
                                //     text: "hello"
                                // },
                                // {
                                //     type:'text',
                                //     // parameter_name: '2',
                                //     text: "world"
                                // },
                                // {
                                //     type:'text',
                                //     // parameter_name: '3',
                                //     text: "here"
                                // }
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