import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import Logger from "../utils/logger";
import { BASE_URL, HEADERS } from "../utils/constants";
import {
    CHARACTER,
    CreateLicense,
    CreateLicenseParams,
    CreateLicenseResponse,
    CreateUserFromLicense,
    CreateUserFromLicenseParams,
    CreateUserFromLicenseResponse,
    DeleteMultipleLicense,
    DeleteLicense,
    DeleteLicenseParams,
    DeleteLicenseResponse,
    EVENT_TYPE,
    EXPIRY,
    EventMap,
    KeyauthSellerEventEmitter,
    License,
    MASK,
    MakeRequest,
    Seller,
    SellerOptions,
    VerifyLicense,
    VerifyLicenseParams,
    VerifyLicenseResponse,
    DeleteMultipleLicenseResponse,
    DeleteMultipleLicenseParams,
    DeleteUnusedLicenseResponse,
    DeleteUnusedLicenseParams,
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
    license: License = {
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
         * @returns {Promise<CreateLicenseResponse>} {@link CreateLicenseResponse} - The promise response from creating a license(s) can be of {@link SingleLicenseResponse} or {@link MultipleLicenseResponse}
         */
        create: async (data?: CreateLicense): Promise<CreateLicenseResponse> =>
            this._createLicense.call(this, data),
        /**
         * Verify a license exists
         *
         * @see https://keyauth.readme.io/reference/verify-license-exists
         *
         * @param {VerifyLicense} `data` - All the params needed to verify a license key
         * @param {VerifyLicense['license']} [data.license] - The license key that you would like to verify
         * @returns {Promise<VerifyLicenseResponse>} {@link VerifyLicenseResponse} - The promise response from verify license
         */
        verify: async (data: VerifyLicense): Promise<VerifyLicenseResponse> =>
            this._verifyLicense.call(this, data),
        /**
         * Create a user from a license key
         *
         * @see https://keyauth.readme.io/reference/use-license-to-create-a-user
         *
         * @param {CreateUserFromLicense} `data` - All the params needed to create a user from license key
         * @param {CreateUserFromLicense['license']} [data.license] - The license key that you would like to suer to create the user
         * @param {CreateUserFromLicense['username']} [data.username] - The username of the new user you would like to create
         * @param {CreateUserFromLicense['password']} [data.password] - The password of the new user you would like tos create
         * @returns {Promise<CreateUserFromLicenseResponse>} {@link CreateUserFromLicenseResponse} - The promise response from create user from license
         */
        createUser: async (
            data: CreateUserFromLicense,
        ): Promise<CreateUserFromLicenseResponse> =>
            this._createUserFromLicense.call(this, data),
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
             * @param {DeleteLicense['license']} [data.license] - The license key that you would like to delete
             * @param {DeleteLicense['deleteUserToo']} [data.deleteUserToo] - [Default `false`] If to delete the user attached to that key also
             * @returns {Promise<DeleteLicenseResponse>} {@link DeleteLicenseResponse} - The promise response from delete license
             */
            single: async (
                data: DeleteLicense,
            ): Promise<DeleteLicenseResponse> =>
                this._DeleteLicense.call(this, data),
            /**
             * Delete multiple license keys
             *
             * @see https://keyauth.readme.io/reference/delete-multiple-licenses
             *
             * @param {DeleteMultipleLicense} `data` - All the params needed to delete multiple license keys
             * @param {DeleteMultipleLicense['licenses']} [data.licenses] - All the license keys that you would like to delete
             * @param {DeleteMultipleLicense['deleteUserToo']} [data.deleteUserToo] - [Default `false`] If to delete the user attached to the keys also
             * @returns {Promise<DeleteMultipleLicenseResponse>} {@link DeleteMultipleLicenseResponse} - The promise response from delete multiple licenses
             */
            multiple: async (
                data: DeleteMultipleLicense,
            ): Promise<DeleteMultipleLicenseResponse> =>
                this._DeleteMultipleLicense.call(this, data),
            /**
             * Delete all unused license keys
             *
             * @see https://keyauth.readme.io/reference/delete-unused-licenses
             *
             * @returns {Promise<DeleteUnusedLicenseResponse>} {@link DeleteUnusedLicenseResponse} - The promise response from delete unused licenses
             */
            unused: async (): Promise<DeleteUnusedLicenseResponse> =>
                this._DeleteUnusedLicense.call(this),
        },
    };
    private async _createLicense(
        data?: CreateLicense,
    ): Promise<CreateLicenseResponse> {
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
    }
    private async _verifyLicense({
        license,
    }: VerifyLicense): Promise<VerifyLicenseResponse> {
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
    }
    private async _createUserFromLicense({
        license,
        password,
        username,
    }: CreateUserFromLicense): Promise<CreateUserFromLicenseResponse> {
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
    }
    private async _DeleteLicense({
        license,
        deleteUserToo = false,
    }: DeleteLicense): Promise<DeleteLicenseResponse> {
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
    }
    private async _DeleteMultipleLicense({
        licenses,
        deleteUserToo = false,
    }: DeleteMultipleLicense): Promise<DeleteMultipleLicenseResponse> {
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
    }

    private async _DeleteUnusedLicense(): Promise<DeleteUnusedLicenseResponse> {
        // Log the delete unused licenses process
        this._logger.debug(
            EVENT_TYPE.DELETE_UNUSED,
            `Deleting unused licenses.`,
        );

        // Prepare the delete unused licenses parameters
        const deleteUnusedLicense: DeleteUnusedLicenseParams = {
            type: "delunused",
        };

        // Log the delete unused licenses request
        this._logger.debug(
            EVENT_TYPE.DELETE_UNUSED,
            `Sending delete unused licenses request.`,
        );
        // Send the delete unused licenses request and wait for the response
        const response = await this._makeRequest({
            params: { ...deleteUnusedLicense },
        });
        // log the response to the event emitter
        this._eventEmitter.emit(EVENT_TYPE.DELETE_UNUSED, {
            ...response,
        });
        // Log that the delete unused licenses request is complete and return the response
        this._logger.debug(
            EVENT_TYPE.DELETE_UNUSED,
            "Delete unused licenses complete. Returning response.",
        );
        // return the response
        return response;
    }
}
