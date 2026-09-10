import { ApiRequest } from '../api/ApiRequest.js';

/**
 * @typedef {Object} LocationResult
 * @property {string} name - City name
 * @property {number} lat - Latitude
 * @property {number} lon - Longitude
 * @property {string} country - Country code
 */

export class GeocodingService extends EventTarget {
    #apiClient;
    #limit;

    /**
     * @param {import('../api/ApiClient.js').ApiClient} apiClient
     * @param {number} [limit=5]
     */
    constructor(apiClient, limit = 5) {
        super();
        this.#apiClient = apiClient;
        this.#limit = limit;
    }

    /**
    * triggered search
    * @param {string} cityName - Name of the city to search for
    * @returns {void} - This method does not return a value; results are dispatched via events.
    */
    searchLocations(cityName) {
        // Validate the city name before making the API request - if it's too short, immediately return empty results.
        if (!cityName || cityName.trim().length < 2) {
            this.dispatchEvent(new CustomEvent('results', { detail: [] }));
            return;
        }

        // Dispatch an event indicating the start of the search
        this.dispatchEvent(new CustomEvent('search:start', { detail: { query: cityName } }));

        const request = new ApiRequest('/geo/1.0/direct', 'GET', {
            q: cityName.trim(),
            limit: this.#limit
        });

        // Send the API request using the ApiClient with success and error callbacks
        this.#apiClient.send(
            request,
            (response) => {
                // Dispatch an event indicating the successful retrieval of search results
                const results = Array.isArray(response.data) ? response.data : [];
                this.dispatchEvent(new CustomEvent('search:success', { detail: results }));
            },
            (error) => {
                // Dispatch an event indicating an error occurred during the search
                this.dispatchEvent(new CustomEvent('search:error', { detail: error }));
            }
        );
    }
}