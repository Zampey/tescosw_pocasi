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
     * Sends an HTTP request using callbacks instead of returning a Promise.
     * @param {ApiRequest} request
     * @param {(result: { data: any, status: number, ok: boolean, headers: Headers }) => void} onSuccess
     * @param {(error: Error) => void} onError
     */
    send(request, onSuccess, onError) {
        request.mergeParams(this.#defaultParams);

        const url = request.getUrl(this.#baseUrl);
        const options = request.toFetchOptions();

        // Send the HTTP request using fetch and handle the response with callbacks
        fetch(url, options)
            .then(async (response) => {
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

                // Success - call the success callback
                if (typeof onSuccess === 'function') {
                    onSuccess({
                        data,
                        status: response.status,
                        ok: response.ok,
                        headers: response.headers
                    });
                }
            })
            .catch((error) => {
                // Error - call the error callback
                if (typeof onError === 'function') {
                    onError(error);
                } else {
                    console.error('ApiClient unhandled error:', error);
                }
            });
    }
}