/**
 * @typedef {'GET' | 'POST' | 'PUT' | 'DELETE'} HttpMethod
 */

export class ApiRequest {
    /**
     * @param {string} endpoint - Target path or URL (e.g. '/geo/1.0/direct')
     * @param {HttpMethod} [method='GET'] - HTTP method
     * @param {Record<string, string|number>} [params={}] - Query parameters
     * @param {Record<string, string>} [headers={}] - HTTP headers
     */
    constructor(endpoint, method = 'GET', params = {}, headers = {}) {
        this.endpoint = endpoint;
        this.method = method;
        this.params = params;
        this.headers = headers;
    }

    /**
     * Builds the final URL including encoded query parameters.
     * @param {string} baseUrl - Base API URL
     * @returns {string}
     */
    getUrl(baseUrl) {
        const url = new URL(this.endpoint, baseUrl);

        Object.entries(this.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });

        return url.toString();
    }

    /**
        * Returns a configuration object for native fetch.
     * @returns {RequestInit}
     */
    toFetchOptions() {
        return {
            method: this.method,
            headers: {
                'Content-Type': 'application/json',
                ...this.headers
            }
        };
    }
}