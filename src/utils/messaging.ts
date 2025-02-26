import { Publisher, Subscriber, Request, Reply, Dealer, Router } from 'zeromq';

export interface MessagingError {
    error: any;
}

export class Pub {
    private publisher: Publisher;
    private channel: string;

    constructor(channel: string) {
        this.publisher = new Publisher();
        this.channel = channel;
    }

    async start() {
        this.publisher.bind(`ipc:///tmp/${this.channel}.ipc`);
    }

    async send(message: any) {
        if (this.publisher) this.publisher.send(['message', JSON.stringify(message)])
    }

    async end() {
        this.publisher.close();
    }
}

export class Sub {
    private subscriber: Subscriber;
    private channel: string;

    constructor(channel: string) {
        this.subscriber = new Subscriber();
        this.channel = channel;
    }

    async start() {
        this.subscriber.connect(`ipc:///tmp/${this.channel}.ipc`);
        this.subscriber.subscribe('message');
    }

    async on(callback: (message: any) => void) {
        for await (const [topic, message] of this.subscriber) {
            callback(JSON.parse(message.toString()));
        }
    }

    async end() {
        this.subscriber.close();
    }
}

export class Requester {
    private requester: Request;
    private channel: string;
    public started: boolean = false;

    constructor(channel: string) {
        this.requester = new Request({ immediate: true, linger: 0, receiveTimeout: 1000 });
        this.channel = channel;
    }

    async start() {
        await this.requester.connect(`ipc:///tmp/${this.channel}.ipc`);
        this.started = true;
    }

    async request(message: any): Promise<MessagingError | any> {
        try {
            await this.requester.send(JSON.stringify(message));
            const [result] = await this.requester.receive()
            return JSON.parse(result.toString());
        } catch (error) {
            return { error }
        }
    }

    async end() {
        this.requester.close();
    }

    async restart() {
        console.log('restarting requester...')
        await this.end();
        await this.start();
    }
}

export class DealerRequester {
    private dealer: Dealer;
    private channel: string;
    private pendingRequests: Map<string, (value: any | PromiseLike<any>) => void>;
    private requestTimings: Map<string, number>;

    constructor(channel: string) {
        this.dealer = new Dealer();
        this.dealer.routingId = String(Math.floor(Math.random() * 1000));
        this.channel = channel;
        this.pendingRequests = new Map();
        this.requestTimings = new Map();
    }


    async start() {
        await this.dealer.connect(`ipc:///tmp/${this.channel}.ipc`);
        console.log(`Dealer connected to ipc:///tmp/${this.channel}.ipc`);
    }

    async on(callback: (msg: any) => void) {
        try {
            for await (const [delimiter, msg] of this.dealer) {
                try {
                    const parsedMsg = JSON.parse(msg.toString());
                    const { requestId, reply } = parsedMsg;
                    if (requestId) {
                        const resolve = this.pendingRequests.get(requestId);
                        if (resolve) {
                            resolve(reply);
                            this.pendingRequests.delete(requestId);
                            const startTime = this.requestTimings.get(requestId);
                            if (startTime) {
                                const elapsedTime = Date.now() - startTime;
                                console.log(`Request ${requestId} took ${elapsedTime}ms`);
                                this.requestTimings.delete(requestId);
                            }
                        }
                    }
                    await callback(reply);
                } catch (parseError) {
                    console.error('Error parsing message:', parseError);
                }
            }
        } catch (error) {
            console.error('Error in dealer message handling:', error);
        }
    }

    async reconnect() {
        try {
            await this.dealer.connect(`ipc:///tmp/${this.channel}.ipc`);
            console.log(`Dealer reconnected to ipc:///tmp/${this.channel}.ipc`);
        } catch (error) {
            console.error('Error reconnecting:', error);
            throw error; // Rethrow to handle in send method
        }
    }

    /**
     * 
     * @param message 
     * @param timeout - time in milliseconds to wait for a response before timing out `default: 0` (fail immediately)
     * @param maxRetries - number of times to retry sending the message `default: 1`
     * @returns 
     */
    async send(message: any, timeout: number = 1000, maxRetries: number = 5): Promise<any> {
        const requestId = crypto.randomUUID();
        const messageWithRequestId = { message, requestId };
        const messageBody = JSON.stringify(messageWithRequestId);
        let attempts = 0;
        this.requestTimings.set(requestId, Date.now());
        const attemptSend = async () => {
            await this.dealer.send([this.dealer.routingId, ",", messageBody]);
            return new Promise((resolve, reject) => {
                this.pendingRequests.set(requestId, resolve);

                setTimeout(async () => {
                    if (this.pendingRequests.has(requestId)) {
                        this.pendingRequests.delete(requestId);
                        reject(new Error(`Request timed out (ID: ${requestId})`));
                    }
                }, timeout * (attempts + 1));
            });
        };

        while (attempts < maxRetries) {
            // TODO: this overlaps with the retrying in each of the system components... possibly need to refactor this or each components retry logic
            try {
                return await attemptSend();
            } catch (error) {
                attempts++;
                if (attempts < maxRetries) {
                    if(attempts === 1) continue
                    // console.error(`Send attempt ${attempts}, reconnect and resend...`);
                    // await this.reconnect();
                } else {
                    console.error(`Failed to send message after ${maxRetries} attempts`);
                    return null;
                }
            }
        }
    }

    async end() {
        await this.dealer.close();
        console.log('Dealer closed');
    }
}

export class RouterReplier {
    private router: Router;
    private channel: string;

    constructor(channel: string) {
        this.router = new Router();
        this.channel = channel;
    }

    async start() {
        await this.router.bind(`ipc:///tmp/${this.channel}.ipc`);
    }

    async on(callback: (message: any) => void) {
        try {
            for await (const parts of this.router) {
                // Validate message parts length
                if (parts.length !== 4) {
                    console.warn('Invalid message structure received, skipping...');
                    continue; // Skip to the next message
                }

                const [fn, id, delimiter, message] = parts;

                // Validate each part of the message
                if (!id || !delimiter || !message) {
                    console.warn('Invalid message parts received, skipping...');
                    continue; // Skip to the next message
                }

                // console.log('Router Received:', id.toString(), delimiter.toString(), message.toString());

                let requestId: string;
                let received: any;
                try {
                    const parsedMsg = JSON.parse(message.toString());
                    requestId = parsedMsg.requestId;
                    received = parsedMsg.message;
                } catch (error) {
                    console.error('Error parsing message, skipping...', error);
                    continue; // Skip to the next message if parsing fails
                }

                const reply = await callback(received);
                await this.router.send([id, delimiter, JSON.stringify({requestId, reply})]);
            }
        } catch (error) {
            console.error('router error', error);
        }
    }

    async end() {
        this.router.close();
    }

}

export class Replier {
    private replier: Reply;
    private channel: string;

    constructor(channel: string) {
        this.replier = new Reply();
        this.channel = channel;
    }

    async start() {
        await this.replier.bind(`ipc:///tmp/${this.channel}.ipc`);
    }

    async on(callback: (message: any) => void) {
        try {
            for await (const [message] of this.replier) {
                const parsedMsg = JSON.parse(message.toString())
                let reply = await callback(parsedMsg);
                this.replier.send(JSON.stringify(reply));
            }
        } catch (error) {
            console.error('replier error', error)
        }

    }

    async end() {
        this.replier.close();
    }
}