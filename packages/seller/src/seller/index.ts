import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import Logger from "../utils/logger";
import { BASE_URL, HEADERS } from "../utils/constants";
import {
    CHARACTER,
    CreateLicenseParams,
    CreateLicenseResponse,
    CreateUserFromLicenseParams,
    DeleteLicenseParams,
    EVENT_TYPE,
    EXPIRY,
    EventMap,
    KeyauthSellerEventEmitter,
    MASK,
    MakeRequest,
    Seller,
    SellerOptions,
    VerifyLicenseParams,
    DeleteMultipleLicenseParams,
    DeleteUnusedLicenseParams,
    DeleteUsedLicenseParams,
    DeleteAllLicenseParams,
    FetchAllLicenseParams,
    Key,
    AddTimeToUnusedLicenseParams,
    BanLicenseParams,
    UnbanLicenseParams,
    RetrieveLicenseFromUserParams,
    SetLicenseNoteParams,
    GetLicenseInfoParams,
    GetLicenseInfoResponse,
    LicenseService,
    CreateUserParams,
    DeleteExistingUserParams,
    UserService,
    DeleteExpiredUserParams,
    ResetUserHWIDParams,
    SetUsersVarParams,
    GetUsersVarParams,
    ResetAllUsersHWIDParams,
    AddHWIDToUserParams,
    FetchAllUsersVarsParams,
    DeleteUsersVarParams,
    DeleteUsersVarWithNameParams,
    DeleteUsersSubParams,
    SubtractUsersSubParams,
    CountSubscriptionsParams,
    ExtendUsersSubParams,
} from "../types";
import { RateLimiter } from "../utils/rateLimiter";

/**
 * KeyAuth Seller API Wrapper
 *
 * This class provides a TypeScript wrapper for the KeyAuth.cc API.
 *
 * It allows you to interact with various API endpoints for user management and more.
 */
export default class Api {
    // ------------------------------------------
    // Private properties
    // ------------------------------------------

    /**
     * Axios instance for making HTTP requests.
     * @private
     */
    private _axiosInstance: AxiosInstance;

    /**
     * Logger for debugging and logging.
     * @private
     */
    private _logger: Logger;

    /**
     * The sellerkey needed to interact with the seller api from https://keyauth.readme.io/reference/create-licenses
     * @private
     */
    private _sellerKey: string;

    /**
     * EventEmitter for handling events.
     * @private
     */
    private _eventEmitter: KeyauthSellerEventEmitter;

    /**
     * Rate limiter for API requests.
     * @private
     */
    private _rateLimiter: RateLimiter;

    /**
     * KeyAuth Seller API Wrapper
     *
     * This class provides a TypeScript wrapper for the KeyAuth.cc API.
     *
     * It allows you to interact with various API endpoints for user management and more.
     *
     * Constructor for the SellerApi class.
     * @param {Seller} `seller` - All the details needed from https://keyauth.cc/app/?page=seller-settings
     * @param {Seller['sellerKey']} `seller.sellerkey` - The sellerkey needed to interact with the seller api from https://keyauth.readme.io/reference/create-licenses
     *
     * @param {SellerOptions} [options] - All the options for the seller client these are all optional
     * @param {SellerOptions['baseUrl']} `options.baseUrl` - [Default `https://keyauth.win/api/seller`] This can be changed for if you are self hosting.
     * @param {SellerOptions['logger']} `options.logger` - [Default `inactive`] All the logger options
     */
    constructor(seller: Seller, options?: SellerOptions) {
        //TODO Finish constructure

        // Initialize rate limiter with default or provided options
        this._rateLimiter = new RateLimiter(
            options?.ratelimit ?? { maxTokens: 10, refillRate: 5000 },
        );
        // Initialize event emitter
        const eventEmitter = new KeyauthSellerEventEmitter();
        this._eventEmitter = eventEmitter;

        // Store the sellerkey to be used later
        this._sellerKey = seller.sellerKey;

        // Initialize logger with provided options or empty object
        this._logger = new Logger({
            ...options?.logger,
            name: "Keyauth Seller API",
        });

        // Log custom base URL usage if provided
        if (options?.baseUrl) {
            this._logger.info(EVENT_TYPE.INSTANCE, "Using custom base url");
        }
        // Create Axios instance with base URL and headers
        this._axiosInstance = axios.create({
            baseURL: options?.baseUrl ?? BASE_URL,
            headers: HEADERS,
        });

        // Log Axios instance creation
        this._logger.debug(EVENT_TYPE.INSTANCE, "Keyauth instance created.");
    }
    /**
     * Makes a request to the Keyauth API with the provided parameters.
     *
     * @param {MakerRequest} options - The parameters for the API request.
     * @returns {Promise<ApiResponse>} A promise that resolves to the API response.
     * @throws {AxiosError} If there is an issue with the Axios HTTP request.
     * @private
     */
    private async _makeRequest({
        params,
        skipError,
        skipResponse,
    }: MakeRequest): Promise<any> {
        // Capture the start time to measure request duration
        const startTime = Date.now();
        this._logger.debug(
            EVENT_TYPE.REQUEST,
            "Making a request to keyauth API.",
        );
        try {
            // Check if the rate limiter has hit its rate limit
            if (this._rateLimiter.hasHitRateLimit()) {
                this._eventEmitter.emit(EVENT_TYPE.RESPONSE, {
                    type: EVENT_TYPE.RATE_LIMIT,
                    success: false,
                    message: `Client Api rate limit hit please wait ${this._rateLimiter.getTimeUntilCanMakeRequestString()}`,
                    time: startTime - Date.now(),
                } as any);
                this._logger.debug(
                    EVENT_TYPE.REQUEST,
                    `Rate limit hit please wait ${this._rateLimiter.getTimeUntilCanMakeRequestString()}`,
                );

                // Wait until it's possible to make a request again
                await this._rateLimiter.waitUntilCanMakeRequest();

                // Retry the request after the rate limit is reset
                return this._makeRequest({ params, skipResponse, skipError });
            }
            // Perform the Axios HTTP request to the Keyauth API
            const response = await this._axiosInstance.request({
                params: {
                    ...params,
                    sellerkey: this._sellerKey,
                },
                validateStatus: (status) =>
                    status === 200 ||
                    status === 302 ||
                    status === 403 ||
                    status === 404 ||
                    status === 406,
            });
            // Calculate the time taken for the request
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Log any errors to the error event emitter
            if (!skipError) {
                this._ErrorHandler(response, params.type);
            }

            // Emit an event for the API response (if not skipped)
            if (!skipResponse) {
                this._eventEmitter.emit(EVENT_TYPE.RESPONSE, {
                    ...response.data,
                    ...params,
                    time: responseTime,
                });
            }
            // Emit an event for the API request and return the response
            this._eventEmitter.emit(EVENT_TYPE.REQUEST, {
                type: params.type,
                request: {
                    url: this._axiosInstance.defaults.baseURL!,
                    params,
                },
                response: {
                    ...response.data,
                    time: responseTime,
                },
            });
            // Return the respones
            return {
                ...response.data,
                time: responseTime,
            };
        } catch (error) {
            if (error instanceof AxiosError) {
                // Handle Axios HTTP request errors
                this._logger.error("Error", error.message);
            } else {
                // Handle other types of errors
                this._logger.error("Error", `${(error as any).message}`);
            }
            // TODO Add more specific error handling if needed
        }
    }

    /**
     * This will log any errors to the logger and event emitter
     *
     * @param {AxiosResponse<any, any>} data - the respone from the axios call
     */
    private _ErrorHandler(
        data: AxiosResponse<any, any>,
        type: MakeRequest["params"]["type"],
    ) {
        // Return is successful as no need to log it
        if (data.data.success === true) return;
        this._eventEmitter.emit(EVENT_TYPE.ERROR, {
            ...data.data,
            errorCode: "Unknown",
            type,
        });
        this._logger.error("Error", data.data);
    }

    /**
     * Register an event listener for a specific event type.
     *
     * @template E - The type of the event.
     * @param {E} event - The event type to listen for.
     * @param {EventMap[E]} callback - The callback function to execute when the event occurs.
     */
    public on<E extends keyof EventMap>(event: E, callback: EventMap[E]) {
        this._eventEmitter.on(event, callback);
    }

    /**
     * Register a one-time event listener for a specific event type.
     * The listener will be automatically removed after it's been called once.
     *
     * @template E - The type of the event.
     * @param {E} event - The event type to listen for.
     * @param {EventMap[E]} callback - The callback function to execute when the event occurs.
     */
    public once<E extends keyof EventMap>(event: E, callback: EventMap[E]) {
        this._eventEmitter.once(event, callback);
    }
    /**
     * Anything to do with the licenses can be found here
     */
    public license: LicenseService = {
        create: async (data) => {
            // Log the create license process
            this._logger.debug(EVENT_TYPE.CREATE_LICENSE, `Creating license.`);

            // Prepare the create license parameters
            const createParams: CreateLicenseParams = {
                type: "add",
                format: "JSON",
                expiry: data?.expiry ?? EXPIRY.ONE_DAY,
                mask: data?.mask ?? MASK.DEFAULT,
                level: data?.level ? data.level.toString() : "1",
                amount: data?.amount ? data.amount.toString() : "1",
                owner: data?.owner ?? "KeyAuthJS",
                character: data?.character ?? CHARACTER.RANDOM,
                note: data?.note ?? "Generated via KeyAuthJS/Seller client",
            };

            // Log the create license request
            this._logger.debug(
                EVENT_TYPE.CREATE_LICENSE,
                `Sending create license request.`,
            );
            // Send the create license request and wait for the response
            const response = await this._makeRequest({
                params: { ...createParams },
            });
            const buildResponse: CreateLicenseResponse = {
                message: response.message,
                success: response.success,
                keys: response.keys ?? [response.key],
                time: response.time,
            };
            // log the response to the event emitter
            this._eventEmitter.emit(EVENT_TYPE.CREATE_LICENSE, {
                ...buildResponse,
            });
            // Log that the create license request is complete and return the response
            this._logger.debug(
                EVENT_TYPE.CREATE_LICENSE,
                "create license complete. Returning response.",
            );
            // return the response
            return buildResponse;
        },
        verify: async ({ license }) => {
            // Log the verify license process
            this._logger.debug(
                EVENT_TYPE.VERIFY_LICENSE,
                `Verifying a license exists.`,
            );

            // Prepare the verify license parameters
            const verifyLicense: VerifyLicenseParams = {
                type: "verify",
                key: license,
            };

            // Log the verify license request
            this._logger.debug(
                EVENT_TYPE.VERIFY_LICENSE,
                `Sending verify license request.`,
            );
            // Send the verify license request and wait for the response
            const response = await this._makeRequest({
                params: { ...verifyLicense },
            });
            // log the response to the event emitter
            this._eventEmitter.emit(EVENT_TYPE.VERIFY_LICENSE, {
                ...response,
            });
            // Log that the verify license request is complete and return the response
            this._logger.debug(
                EVENT_TYPE.VERIFY_LICENSE,
                "Verify license complete. Returning response.",
            );
            // return the response
            return response;
        },

        createUser: async ({ license, password, username }) => {
            // Log the create user from license process
            this._logger.debug(
                EVENT_TYPE.CREATE_USER_FROM_LICENSE,
                `Creating user from license.`,
            );

            // Prepare the create user from license parameters
            const createUserFromLicense: CreateUserFromLicenseParams = {
                type: "activate",
                key: license,
                pass: password,
                user: username,
            };

            // Log the create user from license request
            this._logger.debug(
                EVENT_TYPE.CREATE_USER_FROM_LICENSE,
                `Sending create user from license request.`,
            );
            // Send the create user from license request and wait for the response
            const response = await this._makeRequest({
                params: { ...createUserFromLicense },
            });
            // log the response to the event emitter
            this._eventEmitter.emit(EVENT_TYPE.CREATE_USER_FROM_LICENSE, {
                ...response,
            });
            // Log that the create user from license request is complete and return the response
            this._logger.debug(
                EVENT_TYPE.CREATE_USER_FROM_LICENSE,
                "Create user from license complete. Returning response.",
            );
            // return the response
            return response;
        },
        delete: {
            single: async ({ license, deleteUserToo = false }) => {
                // Log the delete license process
                this._logger.debug(
                    EVENT_TYPE.DELETE_LICENSE,
                    `Deleting a license${
                        deleteUserToo ? " and deleting the user to" : ""
                    }.`,
                );

                // Prepare the delete license parameters
                const deleteLicense: DeleteLicenseParams = {
                    type: "del",
                    key: license,
                    userToo: deleteUserToo ? "1" : "0",
                };

                // Log the delete license request
                this._logger.debug(
                    EVENT_TYPE.DELETE_LICENSE,
                    `Sending delete license request.`,
                );
                // Send the delete license request and wait for the response
                const response = await this._makeRequest({
                    params: { ...deleteLicense },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.DELETE_LICENSE, {
                    ...response,
                });
                // Log that the delete license request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.DELETE_LICENSE,
                    "Delete license complete. Returning response.",
                );
                // return the response
                return response;
            },
            multiple: async ({ licenses, deleteUserToo = false }) => {
                // Log the delete multiple license process
                this._logger.debug(
                    EVENT_TYPE.DELETE_MULTIPLE_LICENSE,
                    `Deleting multiple licenses${
                        deleteUserToo ? " and deleting the users to" : ""
                    }.`,
                );

                // Prepare the delete multiple license parameters
                const deleteMultipleLicense: DeleteMultipleLicenseParams = {
                    type: "delmultiple",
                    key: licenses.join(", "),
                    userToo: deleteUserToo ? "1" : "0",
                };

                // Log the delete multiple licenses request
                this._logger.debug(
                    EVENT_TYPE.DELETE_MULTIPLE_LICENSE,
                    `Sending delete multiple licenses request.`,
                );
                // Send the delete multiple licenses request and wait for the response
                const response = await this._makeRequest({
                    params: { ...deleteMultipleLicense },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.DELETE_MULTIPLE_LICENSE, {
                    ...response,
                });
                // Log that the delete multiple licenses request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.DELETE_MULTIPLE_LICENSE,
                    "Delete multiple licenses complete. Returning response.",
                );
                // return the response
                return response;
            },

            unused: async () => {
                // Log the delete unused licenses process
                this._logger.debug(
                    EVENT_TYPE.DELETE_UNUSED_LICENSE,
                    `Deleting unused licenses.`,
                );

                // Prepare the delete unused licenses parameters
                const deleteUnusedLicense: DeleteUnusedLicenseParams = {
                    type: "delunused",
                };

                // Log the delete unused licenses request
                this._logger.debug(
                    EVENT_TYPE.DELETE_UNUSED_LICENSE,
                    `Sending delete unused licenses request.`,
                );
                // Send the delete unused licenses request and wait for the response
                const response = await this._makeRequest({
                    params: { ...deleteUnusedLicense },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.DELETE_UNUSED_LICENSE, {
                    ...response,
                });
                // Log that the delete unused licenses request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.DELETE_UNUSED_LICENSE,
                    "Delete unused licenses complete. Returning response.",
                );
                // return the response
                return response;
            },

            used: async () => {
                // Log the delete used licenses process
                this._logger.debug(
                    EVENT_TYPE.DELETE_USED_LICENSE,
                    `Deleting unused licenses.`,
                );

                // Prepare the delete used licenses parameters
                const deleteUsedLicense: DeleteUsedLicenseParams = {
                    type: "delused",
                };

                // Log the delete used licenses request
                this._logger.debug(
                    EVENT_TYPE.DELETE_USED_LICENSE,
                    `Sending delete used licenses request.`,
                );
                // Send the delete used licenses request and wait for the response
                const response = await this._makeRequest({
                    params: { ...deleteUsedLicense },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.DELETE_USED_LICENSE, {
                    ...response,
                });
                // Log that the delete used licenses request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.DELETE_USED_LICENSE,
                    "Delete used licenses complete. Returning response.",
                );
                // return the response
                return response;
            },
            all: async () => {
                // Log the delete all licenses process
                this._logger.debug(
                    EVENT_TYPE.DELETE_ALL_LICENSE,
                    `Deleting all licenses.`,
                );

                // Prepare the delete all licenses parameters
                const deleteAllLicense: DeleteAllLicenseParams = {
                    type: "delalllicenses",
                };

                // Log the delete all licenses request
                this._logger.debug(
                    EVENT_TYPE.DELETE_ALL_LICENSE,
                    `Sending delete All licenses request.`,
                );
                // Send the delete All licenses request and wait for the response
                const response = await this._makeRequest({
                    params: { ...deleteAllLicense },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.DELETE_ALL_LICENSE, {
                    ...response,
                });
                // Log that the delete all licenses request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.DELETE_ALL_LICENSE,
                    "Delete all licenses complete. Returning response.",
                );
                // return the response
                return response;
            },
        },

        fetchAll: async () => {
            // Log the fetch all license keys process
            this._logger.debug(
                EVENT_TYPE.FETCH_ALL_LICENSE,
                `Fetching all license keys.`,
            );

            // Prepare the fetch all license keys parameters
            const fetchAllLicense: FetchAllLicenseParams = {
                type: "fetchallkeys",
            };

            // Log the fetch all license keys request
            this._logger.debug(
                EVENT_TYPE.FETCH_ALL_LICENSE,
                `Sending fetch all license keys request.`,
            );
            // Send the fetch all license keys request and wait for the response
            const response = await this._makeRequest({
                params: { ...fetchAllLicense },
            });

            // Check to see if the object has a value called keys if so transform the data
            if ("keys" in response) {
                const keys: Key[] = [];
                response.keys.forEach((key: any) => {
                    keys.push({
                        id: key.id,
                        key: key.key,
                        note: key.note,
                        expires: key.expires,
                        status: key.status,
                        level: key.level,
                        genBy: key.genby,
                        genDate: key.gendate,
                        usedOn: key.usedon,
                        usedBy: key.usedby,
                        app: key.app,
                        banned: key.banned,
                    });
                });
                response.keys = keys;
            }
            // log the response to the event emitter
            this._eventEmitter.emit(EVENT_TYPE.FETCH_ALL_LICENSE, {
                ...response,
            });
            // Log that the fetch all license keys request is complete and return the response
            this._logger.debug(
                EVENT_TYPE.FETCH_ALL_LICENSE,
                "Fetching all license keys complete. Returning response.",
            );
            // return the response
            return response;
        },

        addTime: async ({ time }) => {
            // Log the add time to all unused license keys process
            this._logger.debug(
                EVENT_TYPE.ADD_TIME_TO_UNUSED,
                `Adding time to all unused license keys.`,
            );

            // Prepare the add time to license keys parameters
            const addTimeToUnused: AddTimeToUnusedLicenseParams = {
                type: "addtime",
                time,
            };

            // Log the add time to all unused license keys request
            this._logger.debug(
                EVENT_TYPE.ADD_TIME_TO_UNUSED,
                `Sending add time to all unused license keys request.`,
            );
            // Send the add time to all unused license keys request and wait for the response
            const response = await this._makeRequest({
                params: { ...addTimeToUnused },
            });
            // log the response to the event emitter
            this._eventEmitter.emit(EVENT_TYPE.ADD_TIME_TO_UNUSED, {
                ...response,
            });
            // Log that the add time to all unused license keys request is complete and return the response
            this._logger.debug(
                EVENT_TYPE.ADD_TIME_TO_UNUSED,
                "Adding time to all unused license keys complete. Returning response.",
            );
            // return the response
            return response;
        },
        ban: async ({ license, reason, banUserToo = false }) => {
            // Log the ban license process
            this._logger.debug(
                EVENT_TYPE.BAN_LICENSE,
                `Banning a license key.`,
            );

            // Prepare ban license key parameters
            const banLicense: BanLicenseParams = {
                type: "ban",
                key: license,
                reason,
                userToo: banUserToo ? "1" : "0",
            };

            // Log the ban license request
            this._logger.debug(
                EVENT_TYPE.BAN_LICENSE,
                `Sending ban license request.`,
            );
            // Send the ban license request and wait for the response
            const response = await this._makeRequest({
                params: { ...banLicense },
            });
            // log the response to the event emitter
            this._eventEmitter.emit(EVENT_TYPE.BAN_LICENSE, {
                ...response,
            });
            // Log that the ban license request is complete and return the response
            this._logger.debug(
                EVENT_TYPE.BAN_LICENSE,
                "Banning license complete. Returning response.",
            );
            // return the response
            return response;
        },

        unban: async ({ license }) => {
            // Log the unban license process
            this._logger.debug(
                EVENT_TYPE.UNBAN_LICENSE,
                `Unbanning a license key.`,
            );

            // Prepare unban license key parameters
            const unbanLicense: UnbanLicenseParams = {
                type: "unban",
                key: license,
            };

            // Log the unban license request
            this._logger.debug(
                EVENT_TYPE.UNBAN_LICENSE,
                `Sending unban license request.`,
            );
            // Send the unban license request and wait for the response
            const response = await this._makeRequest({
                params: { ...unbanLicense },
            });
            // log the response to the event emitter
            this._eventEmitter.emit(EVENT_TYPE.UNBAN_LICENSE, {
                ...response,
            });
            // Log that the unban license request is complete and return the response
            this._logger.debug(
                EVENT_TYPE.UNBAN_LICENSE,
                "Unbanning license complete. Returning response.",
            );
            // return the response
            return response;
        },
        retrieve: async ({ username }) => {
            // Log the retrieve a license from a user process
            this._logger.debug(
                EVENT_TYPE.GET_LICENSE,
                `Retrieving a license from a user.`,
            );

            // Prepare the retrieve a license from a user parameters
            const retrieveLicense: RetrieveLicenseFromUserParams = {
                type: "getkey",
                user: username,
            };

            // Log the retrieve license from user request
            this._logger.debug(
                EVENT_TYPE.GET_LICENSE,
                `Sending retrieve license from user request.`,
            );
            // Send the retrieve license from user request and wait for the response
            const response = await this._makeRequest({
                params: { ...retrieveLicense },
            });
            // log the response to the event emitter
            this._eventEmitter.emit(EVENT_TYPE.GET_LICENSE, {
                ...response,
            });
            // Log that the retrieve license from user request is complete and return the response
            this._logger.debug(
                EVENT_TYPE.GET_LICENSE,
                "Retrieve license from user complete. Returning response.",
            );
            // return the response
            return response;
        },
        setNote: async ({ license, note }) => {
            // Log the set note for license process
            this._logger.debug(
                EVENT_TYPE.SET_LICENSE_NOTE,
                `Setting the note for a license key.`,
            );

            // Prepare the set note for license parameters
            const setLicenseNote: SetLicenseNoteParams = {
                type: "setnote",
                key: license,
                note,
            };

            // Log the set note for license
            this._logger.debug(
                EVENT_TYPE.SET_LICENSE_NOTE,
                `Sending set license note request.`,
            );
            // Send the set note for license request and wait for the response
            const response = await this._makeRequest({
                params: { ...setLicenseNote },
            });
            // log the response to the event emitter
            this._eventEmitter.emit(EVENT_TYPE.SET_LICENSE_NOTE, {
                ...response,
            });
            // Log that the set license note request is complete and return the response
            this._logger.debug(
                EVENT_TYPE.SET_LICENSE_NOTE,
                "Setting license note complete. Returning response.",
            );
            // return the response
            return response;
        },
        getInfo: async ({ license }) => {
            // Log the get license info process
            this._logger.debug(
                EVENT_TYPE.GET_LICENSE_INFO,
                `Getting info from license key.`,
            );

            // Prepare the get license info parameters
            const licenseInfo: GetLicenseInfoParams = {
                type: "info",
                key: license,
            };

            // Log the get license info
            this._logger.debug(
                EVENT_TYPE.GET_LICENSE_INFO,
                `Sending get license info request.`,
            );
            // Send the get license info request and wait for the response
            const response = await this._makeRequest({
                params: { ...licenseInfo },
            });

            const buildResponse: GetLicenseInfoResponse = {
                success: response.success,
                message:
                    response.success === true
                        ? "Successfully retrieved license information"
                        : response.message,
                duration: response.duration,
                hwid: response.hwid,
                note: response.note,
                status: response.status,
                level: response.level,
                createdBy: response.createdby,
                usedBy: response.usedby,
                usedOn: response.usedon,
                creationDate: response.creationdate,
                time: response.time,
            };
            // log the response to the event emitter
            this._eventEmitter.emit(EVENT_TYPE.GET_LICENSE_INFO, {
                ...buildResponse,
            });
            // Log that the get license info request is complete and return the response
            this._logger.debug(
                EVENT_TYPE.GET_LICENSE_INFO,
                "Getting license info complete. Returning response.",
            );
            // return the response
            return buildResponse;
        },
    };
    /**
     * Anything to do with the users can be found here
     */
    public user: UserService = {
        delete: {
            existing: async ({ username }) => {
                // Log the delete user process
                this._logger.debug(
                    EVENT_TYPE.DELETE_EXISTING_USER,
                    `Deleteing a user.`,
                );

                // Prepare delete user parameters
                const deleteUser: DeleteExistingUserParams = {
                    type: "deluser",
                    user: username,
                };

                // Log the delete user request
                this._logger.debug(
                    EVENT_TYPE.DELETE_EXISTING_USER,
                    `Sending delete user request.`,
                );
                // Send the delete user request and wait for the response
                const response = await this._makeRequest({
                    params: { ...deleteUser },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.DELETE_EXISTING_USER, {
                    ...response,
                });
                // Log that the delete user request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.DELETE_EXISTING_USER,
                    "Deleting user complete. Returning response.",
                );
                // return the response
                return response;
            },
            expired: async () => {
                // Log the delete all expired users process
                this._logger.debug(
                    EVENT_TYPE.DELETE_EXPIRED_USERS,
                    `Deleteing all expired users.`,
                );

                // Prepare delete expired users parameters
                const deleteExpiredUser: DeleteExpiredUserParams = {
                    type: "delexpusers",
                };

                // Log the delete all expired users request
                this._logger.debug(
                    EVENT_TYPE.DELETE_EXPIRED_USERS,
                    `Sending delete all expired users request.`,
                );
                // Send the delete all expired users request and wait for the response
                const response = await this._makeRequest({
                    params: { ...deleteExpiredUser },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.DELETE_EXPIRED_USERS, {
                    ...response,
                });
                // Log that the delete all expired users request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.DELETE_EXPIRED_USERS,
                    "Deleting all expired users complete. Returning response.",
                );
                // return the response
                return response;
            },
        },
        hwid: {
            reset: async ({ username }) => {
                // Log the reset user hwid process
                this._logger.debug(
                    EVENT_TYPE.RESET_USER_HWID,
                    `Reseting users hwid.`,
                );

                // Prepare reset users hwid parameters
                const resetUserHwid: ResetUserHWIDParams = {
                    type: "resetuser",
                    user: username,
                };

                // Log the reset users hwid request
                this._logger.debug(
                    EVENT_TYPE.RESET_USER_HWID,
                    `Sending reset users hwid request.`,
                );
                // Send the reset users hwid request and wait for the response
                const response = await this._makeRequest({
                    params: { ...resetUserHwid },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.RESET_USER_HWID, {
                    ...response,
                });
                // Log that the reset users hwid request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.RESET_USER_HWID,
                    "Resetting users hwid complete. Returning response.",
                );
                // return the response
                return response;
            },
            resetAll: async () => {
                // Log the reset all users hwid process
                this._logger.debug(
                    EVENT_TYPE.RESET_ALL_USERS_HWID,
                    `Reseting all users hwid.`,
                );

                // Prepare reset all users hwid parameters
                const resetAllUserHwid: ResetAllUsersHWIDParams = {
                    type: "resetalluser",
                };

                // Log the reset all users hwid request
                this._logger.debug(
                    EVENT_TYPE.RESET_ALL_USERS_HWID,
                    `Sending reset all users hwid request.`,
                );
                // Send the reset all users hwid request and wait for the response
                const response = await this._makeRequest({
                    params: { ...resetAllUserHwid },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.RESET_ALL_USERS_HWID, {
                    ...response,
                });
                // Log that the reset all users hwid request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.RESET_ALL_USERS_HWID,
                    "Resetting all users hwid complete. Returning response.",
                );
                // return the response
                return response;
            },
            add: async ({ username, hwid }) => {
                // Log the add users hwid process
                this._logger.debug(
                    EVENT_TYPE.ADD_USER_HWID,
                    `Adding users hwid.`,
                );

                // Prepare add users hwid parameters
                const addUserHwid: AddHWIDToUserParams = {
                    type: "addhwiduser",
                    hwid,
                    user: username,
                };

                // Log the add users hwid request
                this._logger.debug(
                    EVENT_TYPE.ADD_USER_HWID,
                    `Sending addusers hwid request.`,
                );
                // Send the add users hwid request and wait for the response
                const response = await this._makeRequest({
                    params: { ...addUserHwid },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.ADD_USER_HWID, {
                    ...response,
                });
                // Log that the add users hwid request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.ADD_USER_HWID,
                    "Adding users hwid complete. Returning response.",
                );
                // return the response
                return response;
            },
        },
        var: {
            set: async ({ username, varData, varName, readonly = false }) => {
                // Log the set users var process
                this._logger.debug(
                    EVENT_TYPE.SET_USER_VAR,
                    `Setting users var.`,
                );

                // Prepare setting users var parameters
                const setUsersVar: SetUsersVarParams = {
                    type: "setvar",
                    user: username,
                    data: varData,
                    var: varName,
                    readonly: readonly ? "1" : "0",
                };

                // Log the set users var request
                this._logger.debug(
                    EVENT_TYPE.SET_USER_VAR,
                    `Sending set users var request.`,
                );
                // Send the set users var request and wait for the response
                const response = await this._makeRequest({
                    params: { ...setUsersVar },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.SET_USER_VAR, {
                    ...response,
                });
                // Log that the set users var request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.SET_USER_VAR,
                    "setting users var complete. Returning response.",
                );
                // return the response
                return response;
            },
            get: async ({ username, varName }) => {
                // Log the get users var process
                this._logger.debug(
                    EVENT_TYPE.GET_USER_VAR,
                    `Getting users var.`,
                );

                // Prepare getting users var parameters
                const getUsersVar: GetUsersVarParams = {
                    type: "getvar",
                    user: username,
                    var: varName,
                };

                // Log the get users var request
                this._logger.debug(
                    EVENT_TYPE.GET_USER_VAR,
                    `Sending Get users var request.`,
                );
                // Send the get users var request and wait for the response
                const response = await this._makeRequest({
                    params: { ...getUsersVar },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.GET_USER_VAR, {
                    ...response,
                });
                // Log that the get users var request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.GET_USER_VAR,
                    "Getting users var complete. Returning response.",
                );
                // return the response
                return response;
            },
            getAll: async () => {
                // Log the get all users var process
                this._logger.debug(
                    EVENT_TYPE.FETCH_ALL_USER_VARS,
                    `Getting all users var.`,
                );

                // Prepare getting all users var parameters
                const getAllUsersVar: FetchAllUsersVarsParams = {
                    type: "fetchalluservars",
                };

                // Log the get users var request
                this._logger.debug(
                    EVENT_TYPE.GET_USER_VAR,
                    `Sending Get users var request.`,
                );
                // Send the get all users var request and wait for the response
                const response = await this._makeRequest({
                    params: { ...getAllUsersVar },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.FETCH_ALL_USER_VARS, {
                    ...response,
                });
                // Log that the get all users var request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.FETCH_ALL_USER_VARS,
                    "Getting all users var complete. Returning response.",
                );
                // return the response
                return response;
            },
            delete: {
                single: async ({ username, varName }) => {
                    // Log the delete user var process
                    this._logger.debug(
                        EVENT_TYPE.DELETE_USER_VAR,
                        `Deleting users var.`,
                    );

                    // Prepare deleting users var parameters
                    const deleteUsersVar: DeleteUsersVarParams = {
                        type: "deluservar",
                        user: username,
                        var: varName,
                    };

                    // Log the delete users var request
                    this._logger.debug(
                        EVENT_TYPE.DELETE_USER_VAR,
                        `Sending delete users var request.`,
                    );
                    // Send the delete users var request and wait for the response
                    const response = await this._makeRequest({
                        params: { ...deleteUsersVar },
                    });
                    // log the response to the event emitter
                    this._eventEmitter.emit(EVENT_TYPE.DELETE_USER_VAR, {
                        ...response,
                    });
                    // Log that the delete users var request is complete and return the response
                    this._logger.debug(
                        EVENT_TYPE.DELETE_USER_VAR,
                        "Deleting users var complete. Returning response.",
                    );
                    // return the response
                    return response;
                },
                byName: async ({ varName }) => {
                    // Log the delete user var by name process
                    this._logger.debug(
                        EVENT_TYPE.DELETE_USER_VAR_BY_NAME,
                        `Deleting users var by name.`,
                    );

                    // Prepare deleting users var parameters
                    const deleteUsersVarByName: DeleteUsersVarWithNameParams = {
                        type: "massUserVarDelete",
                        name: varName,
                    };

                    // Log the delete users var by name request
                    this._logger.debug(
                        EVENT_TYPE.DELETE_USER_VAR_BY_NAME,
                        `Sending delete users var by name request.`,
                    );
                    // Send the delete users var by name request and wait for the response
                    const response = await this._makeRequest({
                        params: { ...deleteUsersVarByName },
                    });
                    // log the response to the event emitter
                    this._eventEmitter.emit(
                        EVENT_TYPE.DELETE_USER_VAR_BY_NAME,
                        {
                            ...response,
                        },
                    );
                    // Log that the delete users var by name request is complete and return the response
                    this._logger.debug(
                        EVENT_TYPE.DELETE_USER_VAR_BY_NAME,
                        "Deleting users var by name complete. Returning response.",
                    );
                    // return the response
                    return response;
                },
            },
        },
        subscription: {
            delete: async ({ username, subName }) => {
                // Log the delete user sub process
                this._logger.debug(
                    EVENT_TYPE.DELETE_USER_SUB,
                    `Deleting users sub.`,
                );

                // Prepare deleting users sub parameters
                const deleteUsersSub: DeleteUsersSubParams = {
                    type: "delsub",
                    user: username,
                    sub: subName,
                };

                // Log the delete users sub request
                this._logger.debug(
                    EVENT_TYPE.DELETE_USER_SUB,
                    `Sending delete users sub request.`,
                );
                // Send the delete users sub request and wait for the response
                const response = await this._makeRequest({
                    params: { ...deleteUsersSub },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.DELETE_USER_SUB, {
                    ...response,
                });
                // Log that the delete users sub request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.DELETE_USER_SUB,
                    "Deleting users sub complete. Returning response.",
                );
                // return the response
                return response;
            },
            subtract: async ({ username, subName, seconds }) => {
                // Log the subtract user sub process
                this._logger.debug(
                    EVENT_TYPE.SUBTRACT_USER_SUB,
                    `Subtracting users sub.`,
                );

                // Prepare subtract users sub parameters
                const subtractUsersSub: SubtractUsersSubParams = {
                    type: "subtract",
                    seconds: seconds.toString(),
                    user: username,
                    sub: subName,
                };

                // Log the subtract users sub request
                this._logger.debug(
                    EVENT_TYPE.SUBTRACT_USER_SUB,
                    `Sending subtract users sub request.`,
                );
                // Send the subtract users sub request and wait for the response
                const response = await this._makeRequest({
                    params: { ...subtractUsersSub },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.SUBTRACT_USER_SUB, {
                    ...response,
                });
                // Log that the subtract users sub request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.SUBTRACT_USER_SUB,
                    "Subtracting users sub complete. Returning response.",
                );
                // return the response
                return response;
            },
            count: async ({ subName }) => {
                // Log the count sub process
                this._logger.debug(EVENT_TYPE.COUNT_SUBS, `Counting subs.`);

                // Prepare count sub parameters
                const countSub: CountSubscriptionsParams = {
                    type: "countsubs",
                    name: subName,
                };

                // Log the count sub request
                this._logger.debug(
                    EVENT_TYPE.COUNT_SUBS,
                    `Sending count sub request.`,
                );
                // Send the count sub request and wait for the response
                const response = await this._makeRequest({
                    params: { ...countSub },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.COUNT_SUBS, {
                    ...response,
                });
                // Log that the count sub request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.COUNT_SUBS,
                    "Counting subs complete. Returning response.",
                );
                // return the response
                return response;
            },

            extend: async ({
                username,
                subName,
                expiry,
                activeOnly = false,
            }) => {
                // Log the extend sub process
                this._logger.debug(
                    EVENT_TYPE.EXTEND_USERS_SUB,
                    `Extending sub.`,
                );

                // Prepare extend sub parameters
                const extendSub: ExtendUsersSubParams = {
                    type: "extend",
                    user: username,
                    sub: subName,
                    expiry: expiry,
                    activeOnly: activeOnly ? "1" : "0",
                };

                // Log the extend sub request
                this._logger.debug(
                    EVENT_TYPE.EXTEND_USERS_SUB,
                    `Sending extend sub request.`,
                );
                // Send the extend sub request and wait for the response
                const response = await this._makeRequest({
                    params: { ...extendSub },
                });
                // log the response to the event emitter
                this._eventEmitter.emit(EVENT_TYPE.EXTEND_USERS_SUB, {
                    ...response,
                });
                // Log that the extend sub request is complete and return the response
                this._logger.debug(
                    EVENT_TYPE.EXTEND_USERS_SUB,
                    "Extending sub complete. Returning response.",
                );
                // return the response
                return response;
            },
        },
        create: async ({
            expiry = "1",
            subName = "default",
            username,
            password,
        }) => {
            // Log the create user process
            this._logger.debug(EVENT_TYPE.CREATE_USER, `Creating a new user.`);

            // Prepare create new user parameters
            const newUser: CreateUserParams = {
                type: "adduser",
                expiry,
                sub: subName,
                user: username,
                pass: password,
            };

            // Log the create user request
            this._logger.debug(
                EVENT_TYPE.CREATE_USER,
                `Sending create user request.`,
            );
            // Send the create user request and wait for the response
            const response = await this._makeRequest({
                params: { ...newUser },
            });
            // log the response to the event emitter
            this._eventEmitter.emit(EVENT_TYPE.CREATE_USER, {
                ...response,
            });
            // Log that the create user request is complete and return the response
            this._logger.debug(
                EVENT_TYPE.CREATE_USER,
                "Creating user complete. Returning response.",
            );
            // return the response
            return response;
        },
    };
}
