export interface Subscription {
    subscription: string;
    expiry: string;
}

export interface Info {
    username: string;
    subscriptions: Subscription[];
    ip: string;
    hwid: string | null;
    createdate: string;
    lastlogin: string;
}
