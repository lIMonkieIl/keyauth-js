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
    License,
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
    public license: License = {
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
}
