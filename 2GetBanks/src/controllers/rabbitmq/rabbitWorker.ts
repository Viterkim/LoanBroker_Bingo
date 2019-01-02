import { resolve } from "dns";

var amqp = require('amqplib/callback_api');

interface rabbitMessage {
    content: Buffer;
}

export function getFromRabbit(queueName: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const connectURL = "amqp://dbdolphin.viter.dk:5672";
        const password = "mingade";
        amqp.connect(connectURL, function (err: Error, conn: any) {
            if (err) {
                reject(err);
            }
            if(conn){
                conn.createChannel(function (err: Error, ch: any) {
                    if (err) {
                        console.log(err);
                        reject(err);
                        return;
                    }
                    setInterval(() => {
                        ch.assertQueue(queueName, { durable: false });
                    ch.prefetch(1);
                    //console.log(`Waiting for data from ${queueName}`);
                    ch.consume(queueName, (message: rabbitMessage) => {
                        //TODO: Update rabbitMessage to actual object, content might be a buffer
                        resolve(message.content.toString('utf8'));
                        ch.ack(message);
                    }, {noAck: false});
                }, 500);
                    
                });
            }
        })
    })
}

export function sendToRabbit(message: string, queueName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const connectURL = "amqp://dbdolphin.viter.dk:5672";
        amqp.connect(connectURL, function (err: Error, conn: any) {
            if (err) {
                reject(err);
                return;
            }
            conn.createChannel(function (err: Error, ch: any) {
                if (err) {
                    console.log(err);
                    reject(err);
                    return;
                }
                console.log(`[rabbitPublisher.sendToRabbit] Sending to ${queueName} the data: ${message}`)
                ch.assertQueue(queueName, { durable: false });
                ch.sendToQueue(queueName, Buffer.from(message));
                resolve(true);
            });
        });
    })
}
