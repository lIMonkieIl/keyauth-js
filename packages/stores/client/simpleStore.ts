// Import necessary modules and types
import type { ClientApi } from "@keyauthjs/client";
import type {
    FetchOnlineUsersResponse,
    Session,
    User,
    BaseResponse,
    AppInfo,
} from "types";
import { EVENT_TYPE } from "types";

/**
 * Represents a store that manages various data related to the application.
 *
 */
export default class SimpleStore {
    /**
     * Creates a new instance of SimpleStore.
     * @param {ClientApi} clientApi - The client API used to interact with the server.
     */
    constructor(clientApi: ClientApi) {
        this.startListeners(clientApi);
    }
    /**
     * Start event listeners for various events from the client API.
     * @private
     * @param {ClientApi} clientApi - The client API instance.
     */
    private startListeners(clientApi: ClientApi) {
        clientApi.on(EVENT_TYPE.INIT, ({ sessionid, newSession }) => {
            this._initialized = true;
            this._session = {
                id: sessionid ?? "",
                new: newSession ?? true,
                validated: false,
            };
        });
        clientApi.on(EVENT_TYPE.LOG_IN, ({ info, metaData }) => {
            this._user = {
                ...info!,
                metaData,
            };
            if (this._session)
                this._session = { ...this._session, validated: true };
        });
        clientApi.on(EVENT_TYPE.FETCH_STATS, ({ appinfo }) => {
            this._appInfo = appinfo;
        });
        clientApi.on(EVENT_TYPE.RESPONSE, (data) => {
            this._response = data as unknown as BaseResponse &
                Record<string, any>;
        });
        clientApi.on(EVENT_TYPE.LOG_OUT, () => {
            this._user = undefined;
            if (this._session)
                this._session = {
                    ...this._session,
                    validated: false,
                };
        });
        clientApi.on(EVENT_TYPE.BAN, () => {
            this._user = undefined;
        });
        clientApi.on(EVENT_TYPE.UPGRADE, () => {
            this._user = undefined;
        });
        clientApi.on(EVENT_TYPE.CHANGE_USERNAME, ({ newUsername }) => {
            if (!this._user) return;
            this._user = { ...this._user, username: newUsername };
        });
        clientApi.on(EVENT_TYPE.METADATA, ({ metaData }) => {
            if (!this._user) return;
            this._user = { ...this._user, metaData };
        });
        clientApi.on(EVENT_TYPE.FETCH_ONLINE, ({ users }) => {
            // const originalData = response.users;
            // const transformedData = originalData.map((user) => ({
            //     username: user.credential,
            // }));
            this._onlineUsers = users;
        });
    }
    private _onlineUsers: FetchOnlineUsersResponse["users"] = [];
    private _initialized: boolean = false;
    /**
     * The current session data.
     * @private
     * @type {Session | undefined}
     */
    private _session: Session | undefined = undefined;

    private _response: (BaseResponse & Record<string, any>) | undefined;
    public get response() {
        if (this._response && this._response.info !== undefined) {
            this._response.metaData = this._user?.metaData;
        }
        return this._response;
    }
    /**
     * Get the list of online users.
     * @type {FetchOnlineUsersResponse["users"]}
     */
    get onlineUsers(): FetchOnlineUsersResponse["users"] {
        return this._onlineUsers;
    }
    /**
     * Information about the application.
     * @private
     * @type {AppInfo | undefined}
     */
    private _appInfo: AppInfo | undefined = undefined;
    /**
     * Get the current session data.
     * @returns {Session | undefined} The current session data, if available.
     */
    /**
     * Get the current session data.
     * @returns {Session | undefined} The current session data, if available.
     */
    get session(): Session | undefined {
        return this._session;
    }
    /**
     * Check whether the store has been initialized.
     * @type {boolean}
     */
    get initialized(): boolean {
        return this._initialized;
    }

    /**
     * Additional information.
     * @private
     * @type {User<D> | undefined}
     */
    private _user: User | undefined = undefined;
    /**
     * Get additional information about the user.
     * @returns {User<D> | undefined} Additional information, if available.
     */
    get user(): User | undefined {
        return this._user;
    }

    /**
     * Get information about the application.
     * @returns {AppInfo | undefined} Information about the application, if available.
     */
    get appInfo(): AppInfo | undefined {
        return this._appInfo;
    }
}
