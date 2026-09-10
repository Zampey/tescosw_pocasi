/**
 * @typedef {'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'} HttpMethod
 */

const SUPPORTED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const METHODS_WITH_BODY = ['POST', 'PUT', 'PATCH'];

export class ApiRequest {
    #endpoint;
    #method;
    #params;
    #body;
    #headers;

    /**
     * @param {string} endpoint - Target path or URL
     * @param {HttpMethod} [method='GET'] - HTTP method
     * @param {Record<string, string|number>} [params={}] - Query parameters
     * @param {any} [body=null] - Request body
     * @param {Record<string, string>} [headers={}] - HTTP headers
     */
    constructor(endpoint, method = 'GET', params = {}, body = null, headers = {}) {
        if (!endpoint || typeof endpoint !== 'string') {
            throw new Error('ApiRequest: Endpoint must be a valid non-empty string.');
        }

        const normalizedMethod = /** @type {HttpMethod} */ (method.toUpperCase());
        if (!SUPPORTED_METHODS.includes(normalizedMethod)) {
            throw new Error(`ApiRequest: Unsupported HTTP method "${method}".`);
        }

        this.#endpoint = endpoint;
        this.#method = normalizedMethod;
        this.#params = { ...params };
        this.#body = body;
        this.#headers = { ...headers };
    }

    get endpoint() { return this.#endpoint; }
    get method() { return this.#method; }
    get params() { return { ...this.#params }; } // Return a copy to prevent external mutation
    get body() { return this.#body; }
    get headers() { return { ...this.#headers }; }

    /**
     * Safely merges additional parameters (e.g., default API keys).
     * @param {Record<string, string|number>} additionalParams
     */
    mergeParams(additionalParams) {
        this.#params = { ...this.#params, ...additionalParams };
    }

    /**
     * Constructs the full URL including query parameters.
     * @param {string} baseUrl - The base URL to resolve the endpoint against.
     * @returns {string} - The full URL as a string.
     */
    getUrl(baseUrl) {
        const url = new URL(this.#endpoint, baseUrl);

        if (Object.keys(this.#params).length > 0) {
            Object.entries(this.#params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return url.toString();
    }

    /**
     * Converts the ApiRequest instance into a fetch-compatible options object.
     * @returns {RequestInit} - The fetch options object.
     */
    toFetchOptions() {
        /** @type {RequestInit} */
        const options = {
            method: this.#method,
            headers: { ...this.#headers }
        };

        if (this.#body !== null && METHODS_WITH_BODY.includes(this.#method)) {
            if (!options.headers['Content-Type'] && !options.headers['content-type']) {
                options.headers['Content-Type'] = 'application/json';
            }
            options.body = typeof this.#body === 'string' ? this.#body : JSON.stringify(this.#body);
        }

        return options;
    }
}