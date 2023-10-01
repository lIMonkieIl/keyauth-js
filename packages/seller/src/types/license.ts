// Interfaces for various data structures

import { BaseResponse } from "./client";
import { Info } from "./user";

export interface CreateLicense
    extends Omit<
        CreateLicenseParams,
        "type" | "level" | "amount" | "character" | "format" | "expiry"
    > {
    /**
     * [Default `1`] The subscription level to apply to the generated license(s)
     */
    level?: number;
    /**
     * [Max `50`] [Default `1`] The amount of licenses to generate
     */
    amount?: number;
    /**
     * [Default `1 Day`] The amount of time to apply to the generated license(s)
     *
     * You can use {@link EXPIRY} as a helper or just input your custom expiry
     */
    expiry?: Expiry;
    /**
     * [Default `1`] This is to tell the api to generate the license as lowercase and uppercase or all lowercase or all uppercase
     *
     * [Uppercase & Lowercase `1`]
     *
     * [Upperscase `2`]
     *
     * [Lowercase `3`]
     *
     * You can use {@link CHARACTER} as a helper
     */
    character?: Character;
}

/**
 * Some helper suggestions for expiry or just set a custom one
 */
export type Expiry =
    | "0.0069"
    | "0.0104"
    | "0.021"
    | "0.042"
    | "0.125"
    | "0.208"
    | "0.417"
    | "0.5"
    | "1"
    | "2"
    | "3"
    | "5"
    | "7"
    | "14"
    | "30"
    | "60"
    | "90"
    | "180"
    | "365"
    | "99999"
    | (string & {});

/**
 * Some helper suggestions for expiry in enum or just set a custom one
 */
export enum EXPIRY {
    LIFETIME = "99999",
    ONE_YEAR = "365",
    SIX_MONTHS = "180",
    THREE_MONTHS = "90",
    TWO_MONTHS = "60",
    ONE_MONTH = "30",
    TWO_WEEKS = "14",
    SEVEN_DAYS = "7",
    FIVE_DAYS = "5",
    THREE_DAYS = "3",
    TWO_DAYS = "2",
    ONE_DAY = "1",
    TWELVE_HOURS = "0.5",
    TEN_HOURS = "0.416666667",
    FIVE_HOURS = "0.208333335",
    THREE_HOURS = "0.125",
    ONE_HOUR = "0.0416666667",
    THIRTY_MINUTES = "0.0208333334",
    FIFTEEN_MINUTES = "0.0104166667",
    TEN_MINUTES = "0.0069444445",
}

/**
 * The character option that can be set as a enum
 */
export enum CHARACTER {
    RANDOM = "1",
    UPPERCASE = "2",
    LOWERCASE = "3",
}

/**
 * The character option that can be set
 */
export type Character = "1" | "2" | "3";

/**
 * Some example masks that can be used or just set a custom one
 */
export type Mask =
    | "****-***-****"
    | "****-****-****"
    | "***-***-***"
    | "************"
    | "******-******"
    | (string & {});

/**
 * Some example masks as an enum that can be used or just set a custom one
 */
export enum MASK {
    DEFAULT = "****-***-****",
    FOURS = "****-****-****",
    THREES = "***-***-***",
    ALL = "************",
    SPLIT = "******-******",
}

export interface Key {
    id: number;
    key: string;
    note: string;
    expires: string;
    status: string;
    level: number;
    genBy: string;
    genDate: string;
    usedOn: string;
    usedBy: string;
    app: string;
    banned: string;
}

/**
 * All the params needed to create license key(s)
 */
export interface CreateLicenseParams {
    /**
     * The type needed for the request will always be `add`, its there as a representation
     */
    type: "add";
    /**
     * The format needed for the request will always be `JSON`, its there as a representation
     */
    format: "JSON";
    expiry: Expiry;
    /**
     * [Default `****-***-****`] The license mask to use when genarating the license example of default "Fg2F-6Sf-56Gd"
     *
     * You can use {@link MASK} as a helper or just input your custom mask
     */
    mask?: Mask;
    level: string;
    amount: string;
    /**
     * [Default `KeyAuthJS`] Can set to the username of one of your resellers or the program you are sending the request from
     */
    owner?: "KeyAuthJS" | (string & {});
    character: Character;
    /**
     * [Default `Generated via KeyAuthJS/Seller client`] The note you would like to assign to a license
     */
    note?: "Generated via KeyAuthJS/Seller client" | (string & {});
}
/**
 * The response from creating license(s), it will always return keys and array even if a single key is created.
 */
export interface CreateLicenseResponse extends BaseResponse {
    /**
     * The generated license keys
     */
    keys: string[];
}

export interface VerifyLicense {
    license: string;
}

export interface VerifyLicenseResponse extends BaseResponse {}

export interface VerifyLicenseParams {
    type: "verify";
    key: string;
}

export interface CreateUserFromLicense {
    username: string;
    password: string;
    license: string;
}

export interface CreateUserFromLicenseResponse extends BaseResponse {
    info?: Info;
}

export interface CreateUserFromLicenseParams {
    type: "activate";
    user: string;
    pass: string;
    key: string;
}

export interface DeleteLicense {
    license: string;
    deleteUserToo?: boolean;
}

export interface DeleteLicenseResponse extends BaseResponse {}

export interface DeleteLicenseParams {
    type: "del";
    key: string;
    userToo: "0" | "1";
}

export interface DeleteMultipleLicense {
    licenses: string[];
    deleteUserToo?: boolean;
}

export interface DeleteMultipleLicenseResponse extends BaseResponse {}

export interface DeleteMultipleLicenseParams {
    type: "delmultiple";
    key: string;
    userToo: "0" | "1";
}
export interface DeleteUnusedLicenseResponse extends BaseResponse {}

export interface DeleteUnusedLicenseParams {
    type: "delunused";
}

export interface DeleteUsedLicenseResponse extends BaseResponse {}

export interface DeleteUsedLicenseParams {
    type: "delused";
}
export interface DeleteAllLicenseResponse extends BaseResponse {}

export interface DeleteAllLicenseParams {
    type: "delalllicenses";
}
export interface License {
    create: (data?: CreateLicense) => Promise<CreateLicenseResponse>;
    verify: (data: VerifyLicense) => Promise<VerifyLicenseResponse>;
    createUser: (
        data: CreateUserFromLicense,
    ) => Promise<CreateUserFromLicenseResponse>;
    delete: {
        single: (data: DeleteLicense) => Promise<DeleteLicenseResponse>;
        multiple: (
            data: DeleteMultipleLicense,
        ) => Promise<DeleteMultipleLicenseResponse>;
        unused: () => Promise<DeleteUnusedLicenseResponse>;
        used: () => Promise<DeleteUsedLicenseResponse>;
        all: () => Promise<DeleteAllLicenseResponse>;
    };
}
