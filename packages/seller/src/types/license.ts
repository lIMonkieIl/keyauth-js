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
export interface FetchAllLicenseResponse extends BaseResponse {
    keys: Key[];
}

export interface FetchAllLicenseParams {
    type: "fetchallkeys";
}

export interface AddTimeToUnusedLicense {
    time: Expiry;
}

export interface AddTimeToUnusedLicenseResponse extends BaseResponse {}

export interface AddTimeToUnusedLicenseParams {
    type: "addtime";
    time: string;
}

export interface BanLicense {
    license: string;
    reason: string;
    banUserToo?: boolean;
}

export interface BanLicenseResponse extends BaseResponse {}

export interface BanLicenseParams {
    type: "ban";
    key: string;
    reason: string;
    userToo: "0" | "1";
}

export interface UnbanLicense {
    license: string;
}

export interface UnbanLicenseResponse extends BaseResponse {}

export interface UnbanLicenseParams {
    type: "unban";
    key: string;
}

export interface RetrieveLicenseFromUser {
    username: string;
}

export interface RetrieveLicenseFromUserResponse extends BaseResponse {
    key: string;
}

export interface RetrieveLicenseFromUserParams {
    type: "getkey";
    user: string;
}

export interface SetLicenseNote {
    license: string;
    note: string;
}

export interface SetLicenseNoteResponse extends BaseResponse {}

export interface SetLicenseNoteParams {
    type: "setnote";
    key: string;
    note: string;
}

export interface GetLicenseInfo {
    license: string;
}

export interface GetLicenseInfoResponse extends BaseResponse {
    duration: string;
    hwid: string;
    note: string;
    status: string;
    level: number;
    createdBy: string;
    usedBy: string;
    usedOn: string;
    creationDate: string;
}

export interface GetLicenseInfoParams {
    type: "info";
    key: string;
}

export interface LicenseService {
    /**
     * Create a single license or multiple.
     *
     * @see https://keyauth.readme.io/reference/create-licenses
     *
     * @param {CreateLicense} `data` - All the params needed to create license key(s)
     * @param {CreateLicense['amount']} [data.amount] - [Max `50`] [Default `1`] The amount of licenses to generate.
     * @param {CreateLicense['character']} [data.character] - [Default `1`] This is to tell the api to generate the license as lowercase and uppercase or all lowercase or all uppercase.
     * @param {CreateLicense['expiry']} [data.expiry] - [Default `1 Day`] The amount of time to apply to the generated license(s)
     * @param {CreateLicense['level']} [data.level] - [Default `1`] The subscription level to apply to the generated license(s)
     * @param {CreateLicense['mask']} [data.mask] - [Default `****-***-****`] The license mask to use when genarating the license example of default "Fg2F-6Sf-56Gd".
     * @param {CreateLicense['owner']} [data.owner] - [Default `KeyAuthJS`] Can set to the username of one of your resellers or the program you are sending the request from
     * @param {CreateLicense['note']} [data.note] - [Default `Generated via KeyAuthJS/Seller client`] The note you would like to assign to a license
     * @returns {Promise<CreateLicenseResponse>} {@link CreateLicenseResponse} - The promise response from creating a license(s)
     */
    create: (data?: CreateLicense) => Promise<CreateLicenseResponse>;
    /**
     * Verify a license exists
     *
     * @see https://keyauth.readme.io/reference/verify-license-exists
     *
     * @param {VerifyLicense} `data` - All the params needed to verify a license key
     * @param {VerifyLicense['license']} `data.license` - The license key that you would like to verify
     * @returns {Promise<VerifyLicenseResponse>} {@link VerifyLicenseResponse} - The promise response from verify license
     */
    verify: (data: VerifyLicense) => Promise<VerifyLicenseResponse>;
    /**
     * Create a user from a license key
     *
     * @see https://keyauth.readme.io/reference/use-license-to-create-a-user
     *
     * @param {CreateUserFromLicense} `data` - All the params needed to create a user from license key
     * @param {CreateUserFromLicense['license']} `data.license` - The license key that you would like to suer to create the user
     * @param {CreateUserFromLicense['username']} `data.username` - The username of the new user you would like to create
     * @param {CreateUserFromLicense['password']} `data.password` - The password of the new user you would like tos create
     * @returns {Promise<CreateUserFromLicenseResponse>} {@link CreateUserFromLicenseResponse} - The promise response from create user from license
     */
    createUser: (
        data: CreateUserFromLicense,
    ) => Promise<CreateUserFromLicenseResponse>;
    /**
     * Here you will find anything to do with license deleting
     */
    delete: {
        /**
         * Delete a single license key
         *
         * @see https://keyauth.readme.io/reference/delete-license
         *
         * @param {DeleteLicense} `data` - All the params needed to delete a license key
         * @param {DeleteLicense['license']} `data.license` - The license key that you would like to delete
         * @param {DeleteLicense['deleteUserToo']} [data.deleteUserToo] - [Default `false`] If to delete the user attached to that key also
         * @returns {Promise<DeleteLicenseResponse>} {@link DeleteLicenseResponse} - The promise response from delete license
         */
        single: (data: DeleteLicense) => Promise<DeleteLicenseResponse>;
        /**
         * Delete multiple license keys
         *
         * @see https://keyauth.readme.io/reference/delete-multiple-licenses
         *
         * @param {DeleteMultipleLicense} `data` - All the params needed to delete multiple license keys
         * @param {DeleteMultipleLicense['licenses']} `data.licenses` - All the license keys that you would like to delete
         * @param {DeleteMultipleLicense['deleteUserToo']} [data.deleteUserToo] - [Default `false`] If to delete the user attached to the keys also
         * @returns {Promise<DeleteMultipleLicenseResponse>} {@link DeleteMultipleLicenseResponse} - The promise response from delete multiple licenses
         */
        multiple: (
            data: DeleteMultipleLicense,
        ) => Promise<DeleteMultipleLicenseResponse>;
        /**
         * Delete all unused license keys
         *
         * @see https://keyauth.readme.io/reference/delete-unused-licenses
         *
         * @returns {Promise<DeleteUnusedLicenseResponse>} {@link DeleteUnusedLicenseResponse} - The promise response from delete unused licenses
         */
        unused: () => Promise<DeleteUnusedLicenseResponse>;
        /**
         * Delete all used license keys
         *
         * @see https://keyauth.readme.io/reference/delete-used-licenses
         *
         * @returns {Promise<DeleteUsedLicenseResponse>} {@link DeleteUsedLicenseResponse} - The promise response from delete used licenses
         */
        used: () => Promise<DeleteUsedLicenseResponse>;
        /**
         * Delete all license keys
         *
         * @see https://keyauth.readme.io/reference/delete-all-licenses
         *
         * @returns {Promise<DeleteAllLicenseResponse>} {@link DeleteAllLicenseResponse} - The promise response from delete all licenses
         */
        all: () => Promise<DeleteAllLicenseResponse>;
    };
    /**
     * Fetch all license keys
     *
     * @see https://keyauth.readme.io/reference/fetch-all-licenses
     *
     * @returns {Promise<FetchAllLicenseResponse>} {@link FetchAllLicenseResponse} - The promise response from fetching all license keys
     */
    fetchAll: () => Promise<FetchAllLicenseResponse>;

    /**
     * Add time to all unused license keys
     *
     * @see https://keyauth.readme.io/reference/add-time-to-unused-licenses
     *
     * @param {AddTimeToUnusedLicense} `data` - All the params needed to add time to all unused license keys
     * @param {AddTimeToUnusedLicense['time']} `data.time` - The Time to add to all unused license keys
     * @returns {Promise<AddTimeToUnusedLicenseResponse>} {@link AddTimeToUnusedLicenseResponse} - The promise response from adding time to all unused license keys
     */
    addTime: (
        data: AddTimeToUnusedLicense,
    ) => Promise<AddTimeToUnusedLicenseResponse>;

    /**
     * Ban a license key
     *
     * @see https://keyauth.readme.io/reference/ban-license
     *
     * @param {BanLicense} `data` - All the params needed to ban a license key
     * @param {BanLicense['license']} `data.license` - The license key you would like to ban
     * @param {BanLicense['reason']} `data.reason` - The reason for banning the user
     * @param {BanLicense['banUserToo']} [data.banUserToo] - [Default `false`] If to ban the user attached to the license
     * @returns {Promise<BanLicenseResponse>} {@link BanLicenseResponse} - The promise response from banning a license key
     */
    ban: (data: BanLicense) => Promise<BanLicenseResponse>;

    /**
     * Unban a license key
     *
     * @see https://keyauth.readme.io/reference/unban-license
     *
     * @param {UnbanLicense} `data` - All the params needed to unban a license key
     * @param {UnbanLicense['license']} `data.license` - The license key you would like to unban
     * @returns {Promise<UnbanLicenseResponse>} {@link UnbanLicenseResponse} - The promise response from unbanning a license key
     */
    unban: (data: UnbanLicense) => Promise<UnbanLicenseResponse>;

    /**
     * Retrieve a license from a user
     *
     * @see https://keyauth.readme.io/reference/retrieve-license-from-user
     *
     * @param {RetrieveLicenseFromUser} `data` - All the params needed to retrieve a license from a user
     * @param {RetrieveLicenseFromUser['username']} `data.username` - The username of the user
     * @returns {Promise<RetrieveLicenseFromUserResponse>} {@link RetrieveLicenseFromUserResponse} - The promise response from fetching a license key from a user
     */
    retrieve: (
        data: RetrieveLicenseFromUser,
    ) => Promise<RetrieveLicenseFromUserResponse>;

    /**
     * Set the note for a license key
     *
     * @see https://keyauth.readme.io/reference/set-note
     *
     * @param {SetLicenseNote} `data` - All the params needed to set a note for a license key
     * @param {SetLicenseNote['license']} `data.license` - The license key to set the note for
     * @param {SetLicenseNote['note']} `data.note` - The note you would like to set
     * @returns {Promise<SetLicenseNoteResponse>} {@link SetLicenseNoteResponse} - The promise response from setting a note to a license
     */
    setNote: (data: SetLicenseNote) => Promise<SetLicenseNoteResponse>;

    /**
     * Get the info attached to the license key
     *
     * @see https://keyauth.readme.io/reference/get-info
     *
     * @param {GetLicenseInfo} `data` - All the params needed to get the license key info
     * @param {GetLicenseInfo['license']} `data.license` - The license key you would like the info for
     * @returns {Promise<GetLicenseInfoResponse>} {@link GetLicenseInfoResponse} - The promise response from getting the license info
     */
    getInfo: (data: GetLicenseInfo) => Promise<GetLicenseInfoResponse>;
}
