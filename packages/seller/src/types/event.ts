import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import { BaseResponse, RequestResponse } from "./client";
import {
    AddTimeToUnusedLicenseResponse,
    BanLicenseResponse,
    CreateLicenseResponse,
    CreateUserFromLicenseResponse,
    DeleteAllLicenseResponse,
    DeleteLicenseResponse,
    DeleteMultipleLicenseResponse,
    DeleteUnusedLicenseResponse,
    DeleteUsedLicenseResponse,
    FetchAllLicenseResponse,
    GetLicenseInfoResponse,
    RetrieveLicenseFromUserResponse,
    SetLicenseNoteResponse,
    UnbanLicenseResponse,
    VerifyLicenseResponse,
} from "./license";
import {
    CreateUser,
    DeleteExistingUserResponse,
    DeleteExpiredUserResponse,
    ResetUserHWIDResponse,
    GetUsersVarResponse,
    SetUsersVarResponse,
    BanUserResponse,
    UnbanUser,
    UnbanUserResponse,
    DeleteUsersVarWithNameResponse,
    DeleteUsersSubResponse,
    DeleteAllUsersResponse,
    ResetAllUsersHWIDResponse,
    VerifyUserExistsResponse,
    AddHWIDToUserResponse,
    ResetUserPasswordResponse,
    ChangeUsersEmailResponse,
    FetchAllUsersVarsResponse,
    RetrieveUserDataResponse,
    FetchAllUsersUsersnamesResponse,
    CountSubscriptionsResponse,
    UserCoolDownResponse,
    ExtendUsersSubResponse,
    DeleteUsersVarResponse,
} from "./user";

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
    | "fetchallkeys"
    | "addtime"
    | "ban"
    | "unban"
    | "getkey"
    | "setnote"
    | "info"
    | "adduser"
    | "deluser"
    | "delexpusers"
    | "resetuser"
    | "getvar"
    | "setvar"
    | "banuser"
    | "unbanuser"
    | "massUserVarDelete"
    | "delsub"
    | "delallusers"
    | "resetalluser"
    | "verifyuser"
    | "addhwiduser"
    | "resetpw"
    | "editemail"
    | "fetchalluservars"
    | "userdata"
    | "fetchallusernames"
    | "setcooldown"
    | "extend"
    | "deluservar"
    | "subtract"
    | "countsubs"
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
    FETCH_ALL_LICENSE = "fetchallkeys",
    ADD_TIME_TO_UNUSED = "addtime",
    BAN_LICENSE = "ban",
    UNBAN_LICENSE = "unban",
    GET_LICENSE = "getkey",
    SET_LICENSE_NOTE = "setnote",
    GET_LICENSE_INFO = "info",
    CREATE_USER = "adduser",
    DELETE_EXISTING_USER = "deluser",
    DELETE_EXPIRED_USERS = "delexpusers",
    RESET_USER_HWID = "resetuser",
    SET_USER_VAR = "setvar",
    GET_USER_VAR = "getvar",
    BAN_USER = "banuser",
    UNBAN_USER = "unbanuser",
    DELETE_USER_VAR_BY_NAME = "massUserVarDelete",
    DELETE_USER_SUB = "delsub",
    DELETE_ALL_USERS = "delallusers",
    RESET_ALL_USERS_HWID = "resetalluser",
    VERIFY_USER_EXISTS = "verifyuser",
    ADD_USER_HWID = "addhwiduser",
    RESET_USER_PASSWORD = "resetpw",
    CHANGE_USER_EMAIL = "editemail",
    FETCH_ALL_USER_VARS = "fetchalluservars",
    RETRIEVE_USER_DATA = "userdata",
    GET_ALL_USERS_USERNAMES = "fetchallusernames",
    SET_USER_COOLDOWN = "setcooldown",
    EXTEND_USERS_SUB = "extend",
    DELETE_USER_VAR = "deluservar",
    SUBTRACT_USER_SUB = "subtract",
    COUNT_SUBS = "countsubs",
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
    fetchallkeys: (data: FetchAllLicenseResponse) => void;
    addtime: (data: AddTimeToUnusedLicenseResponse) => void;
    ban: (data: BanLicenseResponse) => void;
    unban: (data: UnbanLicenseResponse) => void;
    getkey: (data: RetrieveLicenseFromUserResponse) => void;
    setnote: (data: SetLicenseNoteResponse) => void;
    info: (data: GetLicenseInfoResponse) => void;
    adduser: (data: CreateUser) => void;
    deluser: (data: DeleteExistingUserResponse) => void;
    delexpusers: (data: DeleteExpiredUserResponse) => void;
    resetuser: (data: ResetUserHWIDResponse) => void;
    setvar: (data: SetUsersVarResponse) => void;
    getvar: (data: GetUsersVarResponse) => void;
    banuser: (data: BanUserResponse) => void;
    unbanuser: (data: UnbanUserResponse) => void;
    massUserVarDelete: (data: DeleteUsersVarWithNameResponse) => void;
    delsub: (data: DeleteUsersSubResponse) => void;
    delallusers: (data: DeleteAllUsersResponse) => void;
    resetalluser: (data: ResetAllUsersHWIDResponse) => void;
    verifyuser: (data: VerifyUserExistsResponse) => void;
    addhwiduser: (data: AddHWIDToUserResponse) => void;
    resetpw: (data: ResetUserPasswordResponse) => void;
    editemail: (data: ChangeUsersEmailResponse) => void;
    fetchalluservars: (data: FetchAllUsersVarsResponse) => void;
    userdata: (data: RetrieveUserDataResponse) => void;
    fetchallusernames: (data: FetchAllUsersUsersnamesResponse) => void;
    countsubs: (data: CountSubscriptionsResponse) => void;
    setcooldown: (data: UserCoolDownResponse) => void;
    extend: (data: ExtendUsersSubResponse) => void;
    deluservar: (data: DeleteUsersVarResponse) => void;
    subtract: (data: DeleteUsersSubResponse) => void;
};
