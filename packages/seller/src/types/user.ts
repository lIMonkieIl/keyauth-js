import { BaseResponse } from "./client";
import { Expiry } from "./license";

export interface Subscription {
    subscription: string;
    key: string;
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

export interface CreateUser {
    username: string;
    subName?: string;
    expiry?: Expiry;
    password?: string;
}

export interface CreateUserResponse extends BaseResponse {}

export interface CreateUserParams {
    type: "adduser";
    user: string;
    sub: string;
    expiry: string;
    pass?: string;
}

export interface DeleteExistingUser {
    username: string;
}

export interface DeleteExistingUserResponse extends BaseResponse {}

export interface DeleteExistingUserParams {
    type: "deluser";
    user: string;
}

export interface DeleteExpiredUserResponse extends BaseResponse {}

export interface DeleteExpiredUserParams {
    type: "delexpusers";
}

export interface ResetUserHWID {
    username: string;
}

export interface ResetUserHWIDResponse extends BaseResponse {}

export interface ResetUserHWIDParams {
    type: "resetuser";
    user: string;
}

export interface SetUsersVar {
    username: string;
    varName: string;
    varData: string;
    readonly?: boolean;
}

export interface SetUsersVarResponse extends BaseResponse {}

export interface SetUsersVarParams {
    type: "setvar";
    user: string;
    var: string;
    data: string;
    readonly: "0" | "1";
}

export interface GetUsersVar {
    username: string;
    varName: string;
}

export interface GetUsersVarResponse extends BaseResponse {
    response: string;
}

export interface GetUsersVarParams {
    type: "getvar";
    user: string;
    var: string;
}

export interface DeleteUsersVar {
    username: string;
    varName: string;
}

export interface DeleteUsersVarResponse extends BaseResponse {}

export interface DeleteUsersVarParams {
    type: "deluservar";
    user: string;
    var: string;
}

export interface BanUser {
    username: string;
    reason: string;
}

export interface BanUserResponse extends BaseResponse {}

export interface BanUserParams {
    type: "banuser";
    user: string;
    reason: string;
}

export interface UnbanUser {
    username: string;
}

export interface UnbanUserResponse extends BaseResponse {}

export interface UnbanUserParams {
    type: "unbanuser";
    user: string;
}

export interface DeleteUsersVarWithName {
    varName: string;
}

export interface DeleteUsersVarWithNameResponse extends BaseResponse {}

export interface DeleteUsersVarWithNameParams {
    type: "massUserVarDelete";
    name: string;
}

export interface DeleteUsersSub {
    username: string;
    subName: string;
}

export interface DeleteUsersSubResponse extends BaseResponse {}

export interface DeleteUsersSubParams {
    type: "delsub";
    user: string;
    sub: string;
}

export interface DeleteAllUsersResponse extends BaseResponse {}

export interface DeleteAllUsersParams {
    type: "delallusers";
}

export interface SubtractUsersSub {
    username: string;
    subName: string;
    seconds: number;
}

export interface SubtractUsersSubResponse extends BaseResponse {}

export interface SubtractUsersSubParams {
    type: "subtract";
    user: string;
    sub: string;
    seconds: string;
}

export interface ResetAllUsersHWIDResponse extends BaseResponse {}

export interface ResetAllUsersHWIDParams {
    type: "resetalluser";
}

export interface VerifyUserExists {
    username: string;
}

export interface VerifyUserExistsResponse extends BaseResponse {}

export interface VerifyUserExistsParams {
    type: "verifyuser";
    user: string;
}

export interface AddHWIDToUser {
    username: string;
    hwid: string;
}

export interface AddHWIDToUserResponse extends BaseResponse {}

export interface AddHWIDToUserParams {
    type: "addhwiduser";
    user: string;
    hwid: string;
}

export interface FetchAllUsersResponse extends BaseResponse {
    users: {
        id: number;
        username: string;
        email: string;
        password: string;
        app: string;
        owner: string;
        createDate: Date;
        lastLogin: Date;
        banned: string;
        ip: string;
        cooldown: string;
    }[];
}

export interface FetchAllUsersResponseParams {
    type: "fetchallusers";
}

export interface ResetUserPassword {
    username: string;
}

export interface ResetUserPasswordResponse extends BaseResponse {}

export interface ResetUserPasswordParams {
    type: "resetpw";
    user: string;
}

export interface ChangeUsersEmail {
    username: string;
    email: string;
}

export interface ChangeUsersEmailResponse extends BaseResponse {}

export interface ChangeUsersEmailParams {
    type: "editemail";
    user: string;
    email: string;
}

export interface FetchAllUsersVarsResponse extends BaseResponse {
    vars: { name: string; data: string; user: string }[];
}

export interface FetchAllUsersVarsParams {
    type: "fetchalluservars";
}

export interface RetrieveUserData {
    username: string;
}

export interface RetrieveUserDataResponse extends BaseResponse {
    data: {
        username: string;
        subscriptions: Subscription[];
        uservars: { name: string; data: string }[];
        ip: string;
        hwid: string;
        createDate: Date;
        lastlogin: Date;
        cooldown: string;
        password: string;
        token: string;
        banned: string;
    };
}

export interface RetrieveUserDataParams {
    type: "userdata";
    user: string;
}

export interface FetchAllUsersUsersnamesResponse extends BaseResponse {
    usernames: { username: string }[];
}

export interface FetchAllUsersUsersnamesParams {
    type: "fetchallusernames";
}

export interface CountSubscriptions {
    subName: string;
}

export interface CountSubscriptionsResponse extends BaseResponse {
    count: number;
}

export interface CountSubscriptionsParams {
    type: "countsubs";
    name: string;
}

export interface UserCoolDown {
    username: string;
    cooldown: number;
}

export interface UserCoolDownResponse extends BaseResponse {}

export interface UserCoolDownParams {
    type: "setcooldown";
    user: string;
    cooldown: string;
}

export interface ExtendUsersSub {
    username: string;
    subName: string;
    expiry: Expiry;
    activeOnly: boolean;
}

export interface ExtendUsersSubResponse extends BaseResponse {}

export interface ExtendUsersSubParams {
    type: "extend";
    user: string;
    sub: String;
    expiry: string;
    activeOnly: "0" | "1";
}

export interface UserService {
    /**
     * Anything to do with the user deleting can be found here
     */
    delete: {
        /**
         * Delete an existing user.
         *
         * @see https://keyauth.readme.io/reference/delete-existing-user
         *
         * @param {DeleteExistingUser} `data` - All the params needed to delete a user
         * @param {DeleteExistingUser['username']} `data.username` - The username of the user to delete.
         * @returns {Promise<DeleteExistingUserResponse>} {@link DeleteExistingUserResponse} - The promise response from deleting a user
         */
        existing: (
            data: DeleteExistingUser,
        ) => Promise<DeleteExistingUserResponse>;

        /**
         * Delete all expired users.
         *
         * @see https://keyauth.readme.io/reference/delete-expired-users
         *
         * @returns {Promise<DeleteExpiredUserResponse>} {@link DeleteExpiredUserResponse} - The promise response from deleting all expired users
         */
        expired: () => Promise<DeleteExpiredUserResponse>;
    };

    /**
     * Anything to do with users HWID
     */
    hwid: {
        /**
         * Reset a users HWID.
         *
         * @see https://keyauth.readme.io/reference/reset-users-hwid
         *
         * @param {ResetUserHWID} `data` - All the params needed to reset a users hwid
         * @param {ResetUserHWID['username']} `data.username` - The username of the user you are resetting HWID for.
         * @returns {Promise<ResetUserHWIDResponse>} {@link ResetUserHWIDResponse} - The promise response from reseting the users HWID
         */
        reset: (data: ResetUserHWID) => Promise<ResetUserHWIDResponse>;

        /**
         * Reset all users HWID.
         *
         * @see https://keyauth.readme.io/reference/reset-all-users-hwid
         *
         * @returns {Promise<ResetAllUsersHWIDResponse>} {@link ResetAllUsersHWIDResponse} - The promise response from reseting all users HWIDs
         */
        resetAll: () => Promise<ResetAllUsersHWIDResponse>;

        /**
         * Add a HWID to a user.
         *
         * @see https://keyauth.readme.io/reference/add-hwid-to-user
         *
         * @param {AddHWIDToUser} `data` - All the params needed to add a hwid to a user
         * @param {AddHWIDToUser['username']} `data.username` - The username of the user your are add to hwid to
         * @param {AddHWIDToUser['hwid']} `data.hwid` - The hwid to add to the user
         * @returns {Promise<AddHWIDToUserResponse>} {@link AddHWIDToUserResponse} - The promise response from adding a hwid to a user
         */
        add: (data: AddHWIDToUser) => Promise<AddHWIDToUserResponse>;
    };
    /**
     * You can set or get a users variable
     */
    var: {
        /**
         * Set a users variable.
         *
         * @see https://keyauth.readme.io/reference/set-users-variable
         *
         * @param {SetUsersVar} `data` - All the params needed to set a users var
         * @param {SetUsersVar['username']} `data.username` - The username of the user you would like to set the var for.
         * @param {SetUsersVar['varName']} `data.varName` - The var name you would like to set
         * @param {SetUsersVar['varData']} `data.varData` - The var data you would like to set
         * @param {SetUsersVar['readonly']} [data.readonly] - [Default `false`] Whether user var can be changed from program
         * @returns {Promise<SetUsersVarResponse>} {@link SetUsersVarResponse} - The promise response from setting a users var
         */
        set: (data: SetUsersVar) => Promise<SetUsersVarResponse>;
        /**
         * Get a users variable data.
         *
         * @see https://keyauth.readme.io/reference/get-user-variable-data
         *
         * @param {GetUsersVar} `data` - All the params needed to get a users var
         * @param {GetUsersVar['username']} `data.username` - The username of the user you would like to get the var for.
         * @param {GetUsersVar['varName']} `data.varName` - The var name you would like to get
         * @returns {Promise<GetUsersVarResponse>} {@link GetUsersVarResponse} - The promise response from getting a users var
         */
        get: (data: GetUsersVar) => Promise<GetUsersVarResponse>;
        /**
         * Get all users variable data.
         *
         * @see https://keyauth.readme.io/reference/fetch-all-users-variables
         *
         * @returns {Promise<FetchAllUsersVarsResponse>} {@link FetchAllUsersVarsResponse} - The promise response from getting all users vars data
         */
        getAll: () => Promise<FetchAllUsersVarsResponse>;

        /**
         * Anything to do with deleting users vars
         */
        delete: {
            /**
             * Delete a users variable data.
             *
             * @see https://keyauth.readme.io/reference/delete-user-variable
             *
             * @param {DeleteUsersVar} `data` - All the params needed to delete a users var
             * @param {DeleteUsersVar['username']} `data.username` - The username of the user you would like to delete the var for.
             * @param {DeleteUsersVar['varName']} `data.varName` - The var name you would like to delete
             * @returns {Promise<DeleteUsersVarResponse>} {@link DeleteUsersVarResponse} - The promise response from deleting a users var
             */
            single: (data: DeleteUsersVar) => Promise<DeleteUsersVarResponse>;

            /**
             * Delete a var by name from all users.
             *
             * This will remove a var by name from all your users so
             * for example if you have a discord var for all users
             * you could delete this from all users in one go
             *
             * @see https://keyauth.readme.io/reference/delete-all-user-variables-with-name
             *
             * @param {DeleteUsersVarWithName} `data` - All the params needed to delete a var from all users
             * @param {DeleteUsersVarWithName['varName']} `data.varName` - The var name you would like to delete from all users
             * @returns {Promise<DeleteUsersVarWithNameResponse>} {@link DeleteUsersVarWithNameResponse} - The promise response from deleting a var from all users
             */
            byName: (
                data: DeleteUsersVarWithName,
            ) => Promise<DeleteUsersVarWithNameResponse>;
        };
    };

    /**
     * Anyhing to do with users subscriptions
     */
    subscription: {
        /**
         * Delete a users subscription.
         *
         * @see https://keyauth.readme.io/reference/delete-users-subscriptions
         *
         * @param {DeleteUsersSub} `data` - All the params needed to delete a users sub
         * @param {DeleteUsersSub['username']} `data.username` - The username of the user you would like to remove the subscription from.
         * @param {DeleteUsersSub['subName']} `data.subName` - The name of the subscription you would like to remove
         * @returns {Promise<DeleteUsersSubResponse>} {@link DeleteUsersSubResponse} - The promise response from deleting a users subscription
         */
        delete: (data: DeleteUsersSub) => Promise<DeleteUsersSubResponse>;

        /**
         * Take away time from a users subscription.
         *
         * @see https://keyauth.readme.io/reference/subtract-from-user-subscription
         *
         * @param {SubtractUsersSub} `data` - All the params needed to subtract time from user subscription
         * @param {SubtractUsersSub['username']} `data.username` - The username of the user you would like to subtract time from.
         * @param {SubtractUsersSub['subName']} `data.subName` - The name of the subscription
         * @param {SubtractUsersSub['seconds']} `data.seconds` - The amount of time to remove in seconds
         * @returns {Promise<SubtractUsersSubResponse>} {@link SubtractUsersSubResponse} - The promise response from subtracting from a users subscription
         */
        subtract: (data: SubtractUsersSub) => Promise<SubtractUsersSubResponse>;
        /**
         * Count how many users have this subscription.
         *
         * @see https://keyauth.readme.io/reference/count-subscriptions
         *
         * @param {CountSubscriptions} `data` - All the params needed to check how many users have this sub
         * @param {CountSubscriptions['subName']} `data.subName` - The name of the subscription
         * @returns {Promise<CountSubscriptionsResponse>} {@link CountSubscriptionsResponse} - The promise response from counting sub
         */
        count: (
            data: CountSubscriptions,
        ) => Promise<CountSubscriptionsResponse>;

        /**
         * Extend a users subscription.
         *
         * @see https://keyauth.readme.io/reference/extend-users
         *
         * @param {ExtendUsersSub} `data` - All the params needed to extend a users sub
         * @param {ExtendUsersSub['username']} `data.username` - The username of the user to extend
         * @param {ExtendUsersSub['subName']} `data.subName` - The name of the subscription
         * @param {ExtendUsersSub['expiry']} `data.expiry` - The expiry for the sub
         * @param {ExtendUsersSub['activeOnly']} [data.activeOnly] - [Default `false`] Only extend user with active subscription that matches exact subscription you're extending.
         * @returns {Promise<ExtendUsersSubResponse>} {@link ExtendUsersSubResponse} - The promise response from extending sub
         */
        extend: (data: ExtendUsersSub) => Promise<ExtendUsersSubResponse>;
    };
    /**
     * Create a new user.
     *
     * @see https://keyauth.readme.io/reference/create-new-user
     *
     * @param {CreateUser} `data` - All the params needed to create a new user
     * @param {CreateUser['username']} `data.username` - The username of the new user.
     * @param {CreateUser['subscription']} [data.subscription] - [Default `default`] The subscription level to apply to the user
     * @param {CreateUser['expiry']} [data.expiry] - [Default `1 Day`] The amount of expiry time to apply to the new user
     * @param {CreateUser['password']} [data.password] - [Default `null`] The password to set for the user, if left blank the user can set this on first login
     * @returns {Promise<CreateUserResponse>} {@link CreateUserResponse} - The promise response from creating a new user
     */
    create: (data: CreateUser) => Promise<CreateUserResponse>;
    /**
     * Ban a user.
     *
     * @see https://keyauth.readme.io/reference/ban-user
     *
     * @param {BanUser} `data` - All the params needed to ban a user
     * @param {BanUser['username']} `data.username` - The username of the user to ban.
     * @param {BanUser['reason']} data.reason - The reason for banning the user
     * @returns {Promise<BanUserResponse>} {@link BanUserResponse} - The promise response from banning a user
     */
    ban: (data: BanUser) => Promise<BanUserResponse>;
    /**
     * Unban a user.
     *
     * @see https://keyauth.readme.io/reference/unban-user
     *
     * @param {UnbanUser} `data` - All the params needed to unban a user
     * @param {UnbanUser['username']} `data.username` - The username of the user to unban.
     * @returns {Promise<UnbanUserResponse>} {@link UnbanUserResponse} - The promise response from unbanning a user
     */
    unban: (data: UnbanUser) => Promise<UnbanUserResponse>;
    /**
     * Delete all your current users.
     *
     * @see https://keyauth.readme.io/reference/delete-all-users
     *
     * @returns {Promise<DeleteUsersSubResponse>} {@link DeleteUsersSubResponse} - The promise response from deleteing all users
     */
    deleteAll: () => Promise<DeleteAllUsersResponse>;

    /**
     * Verify a user exists by username.
     *
     * @see https://keyauth.readme.io/reference/verify-user-exists
     *
     * @param {VerifyUserExists} `data` - All the params needed to verify a user
     * @param {VerifyUserExists['username']} `data.username` - The username of the user you would like to verify.
     * @returns {Promise<VerifyUserExistsResponse>} {@link VerifyUserExistsResponse} - The promise response from verifying a user
     */
    exists: (data: VerifyUserExists) => Promise<VerifyUserExistsResponse>;

    /**
     * Fetch all users.
     *
     * @see https://keyauth.readme.io/reference/fetch-all-users
     *
     * @returns {Promise<FetchAllUsersResponse>} {@link FetchAllUsersResponse} - The promise response from fetching all users
     */
    all: () => Promise<FetchAllUsersResponse>;

    /**
     * Reset a users password
     *
     * This will set the users password to null and on login will set there new one.
     *
     * @see https://keyauth.readme.io/reference/change-users-password
     *
     * @param {ResetUserPassword} `data` - All the params needed to reset a users password
     * @param {ResetUserPassword['username']} `data.username` - The username of the user you would like to reset the password for.
     * @returns {Promise<ResetUserPasswordResponse>} {@link ResetUserPasswordResponse} - The promise response from resetting a users password
     */
    resetPassword: (
        data: ResetUserPassword,
    ) => Promise<ResetUserPasswordResponse>;

    /**
     * Change a users email
     *
     * @see https://keyauth.readme.io/reference/change-users-email
     *
     * @param {ChangeUsersEmail} `data` - All the params needed to change a users email
     * @param {ChangeUsersEmail['username']} `data.username` - The username of the user you would like to change the email for.
     * @returns {Promise<ChangeUsersEmailResponse>} {@link ChangeUsersEmailResponse} - The promise response from changing a users email
     */
    changeEmail: (data: ChangeUsersEmail) => Promise<ChangeUsersEmailResponse>;

    /**
     * Retrieve all users data
     *
     * @see https://keyauth.readme.io/reference/retrieve-user-data
     *
     * @param {RetrieveUserData} `data` - All the params needed to retrieve all users data
     * @param {RetrieveUserData['username']} `data.username` - The username of the user you would like to retrieve data from
     * @returns {Promise<RetrieveUserDataResponse>} {@link RetrieveUserDataResponse} - The promise response from retrieve users data
     */
    data: (data: RetrieveUserData) => Promise<RetrieveUserDataResponse>;

    /**
     * Fetch all users usernames.
     *
     * @see https://keyauth.readme.io/reference/fetch-all-usernames
     *
     * @returns {Promise<FetchAllUsersUsersnamesResponse>} {@link FetchAllUsersUsersnamesResponse} - The promise response from fetching all users usernames
     */
    allUsernames: () => Promise<FetchAllUsersUsersnamesResponse>;

    /**
     * Set a users cooldown
     *
     * @see https://keyauth.readme.io/reference/set-users-cooldown
     *
     * @param {UserCoolDown} `data` - All the params needed to set a users cooldown
     * @param {UserCoolDown['username']} `data.username` - The username of the user you would like to set the cooldown for
     * @param {UserCoolDown['cooldown']} `data.cooldown` - The cooldown to apply to this user
     * @returns {Promise<UserCoolDownResponse>} {@link RetrieveUserDataResponse} - The promise response from setting a user cooldown
     */
    cooldown: (data: UserCoolDown) => Promise<UserCoolDownResponse>;
}
