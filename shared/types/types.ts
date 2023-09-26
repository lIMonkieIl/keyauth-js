// Interfaces for various data structures

import EventEmitter from "events";
import TypedEmitter from "typed-emitter";

// App information
export interface App {
    name: string;
    ver: string;
    ownerid: string;
    // secret:string
}

// Information about a session
export interface Session {
    id: string;
    new: boolean;
    validated: boolean;
}

// Base response structure
export interface BaseResponse {
    success: boolean;
    message: string;
    time: number;
    nonce?: string;
}

// Response after initializing
export interface InitResponse extends BaseResponse {
    sessionid?: string;
    newSession?: boolean;
}

// Response after a login attempt
export interface LoginResponse extends BaseResponse {
    metaData?: any;
    info?: Info;
}

// Response after logging out
export interface LogoutResponse extends BaseResponse {}

// Configuration options
export interface ClientOptions {
    ratelimit?: { maxTokens: number; refillRate: number };
    convertTimes?: boolean;
    baseUrl?: string;
    logger?: Omit<Logger, "tag" | "name">;
}

// Logger configuration
export interface Logger {
    active?: boolean;
    level?: "error" | "warning" | "info" | "debug" | "dev";
    name?: string;
}

// Parameters for initializing a session
export interface InitParams extends App {
    type: EVENT_TYPE.INIT;
}

// Parameters for a login request
export interface LoginParams {
    type: EVENT_TYPE.LOG_IN;
    username: string;
    pass: string;
    sessionid: string;
    hwid?: string;
}

// Parameters for a logout request
export interface LogoutParams {
    type: EVENT_TYPE.LOG_OUT;
    sessionid: string;
}

// Information about a subscription
export interface Subscription {
    subscription: string;
    key: string | null;
    expiry: string | Date;
    timeleft: number;
    level: string;
}

// User information
export interface Info {
    username: string;
    subscriptions: Subscription[];
    ip: string;
    hwid: string | null;
    createdate: string | Date;
    lastlogin: string | Date;
}

// User information with optional metadata
export interface User extends Info {
    metaData?: any;
}

// Response after a registration attempt
export interface RegisterResponse extends BaseResponse {
    info?: Info;
    metaData?: any;
}

// Parameters for user registration
export interface RegisterParams {
    type: EVENT_TYPE.REGISTER;
    username: string;
    pass: string;
    key: string;
    sessionid: string;
    email?: string;
}

// Response after license verification
export interface LicenseResponse extends BaseResponse {
    metaData?: any;
    info?: Info;
}

// Parameters for license verification
export interface LicenseParams {
    type: EVENT_TYPE.LICENSE;
    key: string;
    sessionid: string;
    metaData?: any;
    email?: string;
}

// Response after changing a username
export interface ChangeUsernameResponse extends BaseResponse {}

// Parameters for changing a username
export interface ChangeUsernameParams {
    type: EVENT_TYPE.CHANGE_USERNAME;
    newUsername: string;
    sessionid: string;
}

// Response after banning a user
export interface BanResponse extends BaseResponse {}

// Application information
export interface AppInfo {
    numUsers: number;
    numOnlineUsers: number;
    numKeys: number;
    version: string;
    customerPanelLink: string;
}

// Parameters for fetching statistics
export interface FetchStatsParams {
    type: EVENT_TYPE.FETCH_STATS;
    sessionid: string;
}

// Response after fetching statistics
export interface FetchStatsResponse extends BaseResponse {
    appinfo: AppInfo;
}

// Parameters for banning a user
export interface BanParams {
    type: EVENT_TYPE.BAN;
    sessionid: string;
    reason: string;
}

// Response after checking blacklist
export interface CheckBlacklistResponse extends BaseResponse {}

// Parameters for checking blacklist
export interface CheckBlacklistParams {
    type: EVENT_TYPE.CHECK_BLACKLIST;
    sessionid: string;
    hwid: string;
}

// Response after a session check
export interface CheckResponse extends BaseResponse {}

// Parameters for a session check
export interface CheckParams {
    type: EVENT_TYPE.CHECK;
    sessionid: string;
}

// Response after fetching online users
export interface FetchOnlineUsersResponse extends BaseResponse {
    users: {
        credential: string;
    }[];
    count: number;
}

// Parameters for fetching online users
export interface FetchOnlineUsersParams {
    type: EVENT_TYPE.FETCH_ONLINE;
    sessionid: string;
}

// Response after a password reset request
export interface ForgotPasswordResponse extends BaseResponse {}

// Parameters for a password reset request
export interface ForgotPasswordParams {
    type: EVENT_TYPE.FORGOT_PASSWORD;
    email: string;
    sessionid: string;
    username: string;
}

// Response after a log request
export interface LogResponse extends BaseResponse {}

// Parameters for a log request
export interface LogParams {
    type: EVENT_TYPE.LOG;
    sessionid: string;
    pcuser: string;
    message: string;
}

// Response after an upgrade request
export interface UpgradeResponse extends BaseResponse {}

// Parameters for an upgrade request
export interface UpgradeParams {
    type: EVENT_TYPE.UPGRADE;
    sessionid: string;
    username: string;
    key: string;
}

// Response after a webhook request
export interface WebhookResponse extends BaseResponse {
    data: any;
}

// Parameters for a webhook request
export interface WebhookParams {
    type: EVENT_TYPE.WEBHOOK;
    sessionid: string;
    webid: string;
    body?: string;
    params?: string;
    conttype?: "application/json" | string | undefined;
}

// Response after a file download request
export interface DownloadResponse extends BaseResponse {
    contents: string;
}

// Parameters for a file download request
export interface DownloadParams {
    type: EVENT_TYPE.DOWNLOAD;
    sessionid: string;
    fileid: string;
}
export class KeyauthEventEmitter extends (EventEmitter as new () => TypedEmitter<EventMap>) {
    constructor() {
        super();
    }
}

// Enum defining various event types
export enum EVENT_TYPE {
    INIT = "init",
    LOG_IN = "login",
    LOG_OUT = "logout",
    REGISTER = "register",
    LICENSE = "license",
    FETCH_STATS = "fetchStats",
    BAN = "ban",
    CHANGE_USERNAME = "changeUsername",
    CHECK_BLACKLIST = "checkblacklist",
    CHECK = "check",
    DOWNLOAD = "file",
    FETCH_ONLINE = "fetchOnline",
    FORGOT_PASSWORD = "forgot",
    CHAT_GET = "chatget",
    GET_VAR = "getvar",
    LOG = "log",
    CHAT_SEND = "chatsend",
    SET_VAR = "setvar",
    UPGRADE = "upgrade",
    WEBHOOK = "webhook",
    VAR = "var",
    // Added custom types
    REQUEST = "request",
    RESPONSE = "response",
    METADATA = "metadata",
    ERROR = "error",
    SESSION = "session",
    INSTANCE = "instance",
    RATE_LIMIT = "ratelimit",
}
export type EventMap = {
    init: (data: InitResponse) => void;

    login: (data: LoginResponse) => void;

    logout: (data: LogoutResponse & { sessionId: string }) => void;

    register: (data: RegisterResponse) => void;

    license: (data: LicenseResponse) => void;

    fetchStats: (data: FetchStatsResponse) => void;

    ban: (data: BanResponse & { sessionId: string }) => void;

    changeUsername: (
        data: ChangeUsernameResponse & { newUsername: string },
    ) => void;

    checkblacklist: (data: CheckBlacklistResponse) => void;

    check: (data: CheckResponse) => void;

    file: (data: DownloadResponse) => void;

    fetchOnline: (data: FetchOnlineUsersResponse) => void;

    forgot: (data: ForgotPasswordResponse & { username: string }) => void;

    chatget: (data: GetChatResponse) => void;

    getvar: (data: GetUserVarResponse) => void;

    log: (data: LogResponse & { msg: string; pcUser: string }) => void;

    chatsend: (
        data: SendChatResponse & { sentMsg: string; author: String },
    ) => void;

    setvar: (data: SetUserVarResponse) => void;

    upgrade: (data: UpgradeResponse) => void;

    webhook: (data: WebhookResponse) => void;

    var: (data: VarResponse) => void;

    // Added custom types
    request: (data: RequestResponse<EVENT_TYPE> & { type: EVENT_TYPE }) => void;

    response: (data: EventMap[EVENT_TYPE] & { type: EVENT_TYPE }) => void;

    metadata: (
        data: BaseResponse & {
            metaData: any;
        },
    ) => void;

    error: (data: {
        success: false;
        message: string;
        errorCode: Error_Code;
        type: EVENT_TYPE;
    }) => void;
    instance: (data: BaseResponse) => void;

    session: (data: any) => void;
    ratelimit: (data: BaseResponse) => void;
};

type Error_Code =
    | "seesionKilled"
    | "noSessionID"
    | "notInitialized"
    | "notLoggedIn"
    | "unsupportedVarType"
    | "unknown"
    | "noChatChannel"
    | "invalidClientApi";

export enum ERROR_CODE {
    K_SK = "seesionKilled",
    K_NSID = "noSessionID",
    K_NI = "notInitialized",
    K_NLI = "notLoggedIn",
    K_UVT = "unsupportedVarType",
    K_U = "unknown",
    K_NCC = "noChatChannel",
    K_ICA = "invalidClientApi",
}

// };

// Enum defining various variable operations
export enum VAR {
    SET = "set",
    GLOBAL = "global",
    GET = "get",
}

export type varTypeOption = "get" | "set" | "global";

export interface VarResponse extends BaseResponse {
    varData?: string;
}

export interface Var {
    sessionId: string;
    type: varTypeOption;
    varId: string;
    varData?: string;
    skipResponse?: boolean;
    skipError?: boolean;
}

// Mapping for variable operations
export type VAR_MAP = {
    // VAR handler for SET event
    set: {
        response: BaseResponse;
        data: {
            varId: string;
            varData: string;
            sessionId: string;
        };
    };
    // VAR handler for GLOBAL event
    global: {
        response: BaseResponse;
        data: {
            varId: string;
            sessionId: string;
        };
    };
    // VAR handler for GET event
    get: {
        response: BaseResponse & { varData?: String };
        data: {
            varId: string;
            sessionId: string;
        };
    };
};

// Parameters for setting a variable
export interface SetVarParams {
    type: EVENT_TYPE.SET_VAR;
    var: string;
    data: string;
    sessionid: string;
}
export interface RequestResponse<EType extends EVENT_TYPE> {
    request: {
        url: string;
        params: Record<string, any>;
    };
    response: EventMap[EType];
}
// Response after setting a user variable
export interface SetUserVarResponse extends BaseResponse {
    nonce: string;
}

// Parameters for getting a variable
export interface GetVarParams {
    type: EVENT_TYPE.GET_VAR;
    var: string;
    sessionid: string;
}

// Response after getting a user variable
export interface GetUserVarResponse extends BaseResponse {
    response: string;
    nonce: string;
}

// Parameters for accessing a variable
export interface VarParams {
    type: EVENT_TYPE.VAR;
    varid: string;
    sessionid: string;
}

// Response after accessing a variable
export interface VarResponse extends BaseResponse {
    nonce: string;
}

// Parameters for a webhook request
export interface Webhook {
    webId: string;
    sessionId: string;
    params?: string;
    body?: string;
    contType?: string | undefined;
}

// Parameters for a file download request
export interface Download {
    fileId: string;
    sessionId: string;
}

// Parameters for an upgrade request
export interface Upgrade {
    username: string;
    key: string;
    sessionId: string;
}

// Parameters for a log request
export interface Log {
    pcUser: string;
    msg: string;
    sessionId: string;
}

// Parameters for a password reset request
export interface ForgotPassword {
    username: string;
    email: string;
    sessionId: string;
}

// Parameters for changing a username
export interface ChangeUsername {
    newUsername: string;
    sessionId: string;
}

// Parameters for banning a user
export interface Ban {
    reason: string;
    sessionId: string;
    passedMeta: Record<string, any>;
}

// Parameters for a login request
export interface Login {
    username: string;
    password: string;
    hwid?: string;

    sessionId: string;
}

// Parameters for a logout request
export interface Logout {
    sessionId: string;
}

// Parameters for a license verification request
export interface License {
    license: string;
    sessionId: string;
}

// Parameters for user registration
export interface Register<D extends Record<string, any>> {
    username: string;
    password: string;
    key: string;
    sessionId: string;
    email?: string;

    metaData?: D;
}

// Parameters for fetching statistics
export interface FetchStats {
    sessionId: string;
}

// Parameters for checking blacklist
export interface CheckBlacklist {
    hwid: string;
    sessionId: string;
}

// Parameters for fetching online users
export interface FetchOnlineUsers {
    sessionId: string;
}

// Parameters for a general check
export interface Check {
    sessionId: string;
    skipResponse: boolean;
}

// Parameters for setting a variable
export interface setVar {
    varId: string;
    varData: string;
    sessionId: string;
}

// Enum defining various metadata operations
export enum MetaDataType {
    SET = "set",
    GET = "get",
}

export type METADATA = "get" | "set";

// Mapping for metadata operations
export interface MetaDataResponse<D extends Record<string, any>>
    extends BaseResponse {
    metaData?: D;
    nonce?: string;
}

export type MetaData<D extends Record<string, any>> = {
    type: METADATA;
    sessionId: string;
    data?: D;
    skipResponse?: boolean;
    skipError?: boolean;
};
// Params needed for making a request
export interface MakeRequestParams extends Record<string, any> {
    type: EVENT_TYPE;
}
// Parameters for making a request
export interface MakeRequest {
    params: MakeRequestParams;
    skipResponse?: boolean;
    skipError?: boolean;
}
export interface SendChat {
    channel: string;
    message: string;
    username: string;
    sessionId: string;
}
export interface SendChatResponse extends BaseResponse {}
export interface SendChatParams {
    type: EVENT_TYPE.CHAT_SEND;
    channel: string;
    message: string;
    sessionid: string;
}
export interface GetChat {
    channel: string;
    sessionId: string;
}
export interface Message {
    author: string;
    message: string;
    timestamp: string;
}
export interface GetChatResponse extends BaseResponse {
    messages: Message[];
}
export interface GetChatParams {
    type: EVENT_TYPE.CHAT_GET;
    channel: string;
    sessionid: string;
}
