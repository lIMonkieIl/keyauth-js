import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { BaseResponse, RequestResponse } from "./client";
import {
    CreateLicenseResponse,
    CreateUserFromLicenseResponse,
    DeleteAllLicenseResponse,
    DeleteLicenseResponse,
    DeleteMultipleLicenseResponse,
    DeleteUnusedLicenseResponse,
    DeleteUsedLicenseResponse,
    VerifyLicenseResponse,
} from "./license";

/**
 * All the event types
 */
export type EventType =
    | "add"
    | "verify"
    | "activate"
    | "delalllicenses"
    | "del"
    | "delmultiple"
    | "delunused"
    | "delused"
    // Added custom types
    | "ratelimit"
    | "instance"
    | "request"
    | "response"
    | "error";

/**
 * All the event types in an enum
 */
export enum EVENT_TYPE {
    CREATE_LICENSE = "add",
    CREATE_USER_FROM_LICENSE = "activate",
    DELETE_LICENSE = "del",
    DELETE_ALL_LICENSE = "delalllicenses",
    DELETE_MULTIPLE_LICENSE = "delmultiple",
    DELETE_UNUSED_LICENSE = "delunused",
    VERIFY_LICENSE = "verify",
    DELETE_USED_LICENSE = "delused",
    // Added custom types
    INSTANCE = "instance",
    REQUEST = "request",
    RESPONSE = "response",
    ERROR = "error",
    RATE_LIMIT = "ratelimit",
}
export class KeyauthSellerEventEmitter extends (EventEmitter as new () => TypedEmitter<EventMap>) {
    constructor() {
        super();
    }
}

export type EventMap = {
    add: (data: CreateLicenseResponse) => void;

    // Added custom types
    request: (data: RequestResponse<EventType> & { type: EventType }) => void;

    response: (data: EventMap[EventType] & { type: EventType }) => void;

    error: (data: {
        success: false;
        message: string;
        errorCode: string;
        type: EventType;
    }) => void;
    instance: (data: BaseResponse) => void;
    ratelimit: (data: BaseResponse) => void;
    verify: (data: VerifyLicenseResponse) => void;
    activate: (data: CreateUserFromLicenseResponse) => void;
    del: (data: DeleteLicenseResponse) => void;
    delmultiple: (data: DeleteMultipleLicenseResponse) => void;
    delunused: (data: DeleteUnusedLicenseResponse) => void;
    delused: (data: DeleteUsedLicenseResponse) => void;
    delalllicenses: (data: DeleteAllLicenseResponse) => void;
};
