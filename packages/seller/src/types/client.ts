// Interfaces for various data structures

import { EventType, EventMap } from "./event";
import { keyauthLogger } from "../utils/logger";

/**
 * All the details needed from https://keyauth.cc/app/?page=seller-settings
 */
export interface Seller {
    /**
     * The sellerkey needed to interact with the seller api from https://keyauth.readme.io/reference/create-licenses
     */
    sellerKey: string;
}
/**
 * All the options for the seller client these are all optional
 */
export interface SellerOptions {
    /**
     * [Default `https://keyauth.win/api/seller`] This can be changed for if you are self hosting.
     */
    baseUrl?: string;
    /**
     * [Default `inactive`] All the logger options
     */
    logger?: Omit<keyauthLogger, "tag" | "name">;
    /**
     * [Default `{ maxTokens: 10, refillRate: 5000 }`] Override the global rate limit set on the package.
     */
    ratelimit?: { maxTokens: number; refillRate: number };
}

/**
 * Params needed for making a request
 */
export interface MakeRequestParams extends Record<string, any> {
    type: EventType;
}

/**
 * Parameters for making a request
 */
export interface MakeRequest {
    params: MakeRequestParams;
    /**
     * [Default `false`] Skip sending the response to the response event emitter
     */
    skipResponse?: boolean;
    /**
     * [Default `false`] Skip sending the error response to the error event emitter
     */
    skipError?: boolean;
}

/**
 * Base response structure
 */
export interface BaseResponse {
    /**
     * If the response was successful or not
     */
    success: boolean;
    /**
     * The message from the response
     */
    message: string;
    /**
     * How long it has taken for the response in milliseconds
     */
    time: number;
}

export interface RequestResponse<EType extends EventType> {
    request: {
        url: string;
        params: Record<string, any>;
    };
    response: EventMap[EType];
}
