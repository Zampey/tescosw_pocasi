import { ApiRequest } from './ApiRequest.js';

export class ApiClient {
    #baseUrl;
    #defaultParams;

    /**
     * @param {string} baseUrl - Base API URL
     * @param {Record<string, string|number>} [defaultParams={}] - Default query parameters
     */
    constructor(baseUrl, defaultParams = {}) {
        this.#baseUrl = baseUrl;
        this.#defaultParams = defaultParams;
    }

    /**
     * Sends an HTTP request and returns the native Response or parsed payload.
     * @template T
     * @param {ApiRequest} request - The request instance
     * @returns {Promise<{ data: T, status: number, ok: boolean, headers: Headers }>}
     */
    async send(request) {
        // Merge default params with request params
        request.params = { ...this.#defaultParams, ...request.params };

        const url = request.getUrl(this.#baseUrl);
        const options = request.toFetchOptions();

        const response = await fetch(url, options);

        let data = null;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            throw new Error(`API Error [${response.status}]: ${JSON.stringify(data)}`);
        }

        return {
            data,
            status: response.status,
            ok: response.ok,
            headers: response.headers
        };
    }
}