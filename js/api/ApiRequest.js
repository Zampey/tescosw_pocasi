/**
 * @typedef {'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'} HttpMethod
 */

/** @type {HttpMethod[]} */
const SUPPORTED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

/** @type {HttpMethod[]} */
const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'];

export class ApiRequest {
    /**
     * @param {string} endpoint - Target path or URL (e.g. '/geo/1.0/direct')
     * @param {HttpMethod} [method='GET'] - HTTP method
     * @param {Record<string, string|number>} [params={}] - Query parameters
     * @param {any} [body=null] - Request body for POST/PUT/PATCH
     * @param {Record<string, string>} [headers={}] - HTTP headers
     */
    constructor(endpoint, method = 'GET', params = {}, body = null, headers = {}) {
        // Validate the endpoint parameter
        if (!endpoint || typeof endpoint !== 'string') {
            throw new Error('ApiRequest: Endpoint must be a valid non-empty string.');
        }

        // Normalize and validate the HTTP method
        const normalizedMethod = /** @type {HttpMethod} */ (method.toUpperCase());
        if (!SUPPORTED_METHODS.includes(normalizedMethod)) {
            throw new Error(`ApiRequest: Unsupported HTTP method "${method}". Supported methods are: ${SUPPORTED_METHODS.join(', ')}.`);
        }

        // Assign validated and normalized values to instance properties
        this.endpoint = endpoint;
        this.method = normalizedMethod;
        this.params = params;
        this.body = body;
        this.headers = headers;
    }

    /**
     * Builds the final URL including encoded query parameters.
     * @param {string} baseUrl - Base API URL
     * @returns {string}
     */
    getUrl(baseUrl) {
        const url = new URL(this.endpoint, baseUrl);

        // Append query parameters to the URL if any are provided
        if (this.params && Object.keys(this.params).length > 0) {
            Object.entries(this.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return url.toString();
    }

    /**
     * Returns a configuration object for native fetch.
     * @returns {RequestInit}
     */
    toFetchOptions() {
        /** @type {RequestInit} */
        const options = {
            method: this.method,
            headers: {
                ...this.headers
            }
        };

        // Include the request body if applicable and the method supports it
        if (this.body !== null && METHODS_WITH_BODY.includes(this.method)) {
            if (!options.headers['Content-Type'] && !options.headers['content-type']) {
                options.headers['Content-Type'] = 'application/json';
            }
            options.body = typeof this.body === 'string' ? this.body : JSON.stringify(this.body);
        }

        return options;
    }
}