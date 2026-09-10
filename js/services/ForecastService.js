import { ApiRequest } from '../api/ApiRequest.js';

/**
 * @import { ForecastResponse } from '../types/weather.types.js'
 */

export class ForecastService extends EventTarget {
    #apiClient;

    /**
     * @param {import('../api/ApiClient.js').ApiClient} apiClient - Initialized API client instance
     */
    constructor(apiClient) {
        super();
        this.#apiClient = apiClient;
    }

    /**
     * Fetches 5-day / 3-hour weather forecast for the given geographic coordinates.
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     */
    fetchForecast(lat, lon) {
        if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) {
            this.dispatchEvent(new CustomEvent('forecast:error', {
                detail: new Error('ForecastService: Invalid coordinates provided.')
            }));
            return;
        }

        this.dispatchEvent(new CustomEvent('forecast:start', { detail: { lat, lon } }));

        const request = new ApiRequest('/data/2.5/forecast', 'GET', {
            lat,
            lon,
            units: 'metric'
        });

        this.#apiClient.send(
            request,
            /** @param {{ data: ForecastResponse }} response */
            (response) => {
                this.dispatchEvent(new CustomEvent('forecast:success', { detail: response.data }));
            },
            (error) => {
                this.dispatchEvent(new CustomEvent('forecast:error', { detail: error }));
            }
        );
    }
}