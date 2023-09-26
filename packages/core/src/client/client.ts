// Import necessary modules and types
import { RateLimiter } from "../utils/rateLimiter";
import axios, { AxiosInstance } from "axios";
import {
    App,
    EVENT_TYPE,
    ClientOptions,
    EventMap,
    KeyauthEventEmitter,
} from "types";
import Logger from "../utils/logger";
import { BASE_URL, HEADERS } from "../utils/constants";

/**
 * KeyAuth Client API Wrapper
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
     * Information about the app.
     * @private
     */
    private _app: App;

    /**
     * Flag to track whether the client has been initialized.
     * @private
     */
    private _initializedClient: boolean = false;

    /**
     * Rate limiter for API requests.
     * @private
     */
    private _rateLimiter: RateLimiter;

    /**
     * EventEmitter for handling events.
     * @private
     */
    private _eventEmitter: KeyauthEventEmitter;
    /**
     * Flag to determine whether to convert timestamps to local dates.
     * @private
     */
    private _convertTimes: boolean;

    /**
     * KeyAuth Client API Wrapper
     *
     * This class provides a TypeScript wrapper for the KeyAuth.cc API.
     *
     * It allows you to interact with various API endpoints for user management and more.
     *
     * Constructor for the Api class.
     * @param {App} `app` - App details can be found on the keyauth dashboard.
     * @param {App['name']} `app.name` - The application name.
     * @param {App['ownerid']} `app.ownerid` - The application ownerID.
     * @param {App['ver']} `app.ownerid` - The application version.
     *
     * @param {ClientOptions} [options] - Client api options all optional.
     * @param {ClientOptions['baseUrl']} `options.baseUrl` - To change the base url from https://keyauth.win/api/1.2/ to anything you like.
     * @param {ClientOptions['convertTimes']} `options.convertTimes` - To convert all times to readable times example like sub expiry.
     * @param {ClientOptions['logger']} `options.logger` - All the logger options.
     * @param {ClientOptions['ratelimit']} `options.ratelimit` - overrider the global rate limit set on the package.
     */
    constructor(app: App, options?: ClientOptions) {
        // Initialize event emitter
        const eventEmitter = new KeyauthEventEmitter();
        this._eventEmitter = eventEmitter;

        // Initialize logger with provided options or empty object
        this._logger = new Logger(
            { ...options?.logger, name: "Keyauth API" } ?? {},
        );

        // Log custom base URL usage if provided
        if (options?.baseUrl) {
            this._logger.info(EVENT_TYPE.INSTANCE, "Using custom base url");
        }

        // Create Axios instance with base URL and headers
        this._axiosInstance = axios.create({
            baseURL: options?.baseUrl ?? BASE_URL,
            headers: HEADERS,
        });

        // Initialize rate limiter with default or provided options
        this._rateLimiter = new RateLimiter(
            options?.ratelimit ?? { maxTokens: 10, refillRate: 5000 },
        );

        // Determine whether to convert timestamps to local dates
        this._convertTimes = options?.convertTimes ?? false;

        // Store information about the app
        this._app = app;

        // Log Axios instance creation
        this._logger.debug(EVENT_TYPE.INSTANCE, "Keyauth instance created.");
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
}
