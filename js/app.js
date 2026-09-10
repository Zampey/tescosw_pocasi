/**
 * @import { LocationResult } from './types/geocoding.types.js'
 * @import { ForecastResponse } from './types/weather.types.js'
 */

import { ApiClient } from './api/ApiClient.js';
import { GeocodingService } from './services/GeocodingService.js';
import { ForecastService } from './services/ForecastService.js';
import { SearchPanel } from './components/SearchPanel.js';
import { ForecastView } from './components/ForecastView.js';
import { getTranslation } from './i18n/i18n.js';

export class App {
    /** @type {ApiClient} */
    #apiClient;
    /** @type {GeocodingService} */
    #geocodingService;
    /** @type {ForecastService} */
    #forecastService;
    /** @type {SearchPanel} */
    #searchPanel;
    /** @type {ForecastView} */
    #forecastView;

    /** @type {HTMLElement} */
    #statusMessage;

    /**
     * Creates an instance of App.
     * @param {string} apiKey - OpenWeatherMap API key
     */
    constructor(apiKey) {
        // Initialize i18n texts in header
        this.#initHeaderTexts();

        // Initialize infrastructure and domain services
        this.#apiClient = new ApiClient('https://api.openweathermap.org', { appid: apiKey });
        this.#geocodingService = new GeocodingService(this.#apiClient, 5);
        this.#forecastService = new ForecastService(this.#apiClient);

        // Cache global DOM elements
        this.#statusMessage = /** @type {HTMLElement} */ (document.getElementById('statusMessage'));

        // Initialize UI components
        const searchContainer = /** @type {HTMLElement} */ (document.getElementById('searchContainer'));
        this.#searchPanel = new SearchPanel(searchContainer);

        const forecastSection = /** @type {HTMLElement} */ (document.getElementById('forecastSection'));
        this.#forecastView = new ForecastView(forecastSection);

        this.#initEvents();
    }

    /**
     * Initializes header texts using i18n translation files based on browser language.
     * @private
     * @returns {void}
     */
    #initHeaderTexts() {
        const t = getTranslation();
        const titleEl = document.querySelector('#headerTitle');
        const subtitleEl = document.querySelector('#headerSubtitle');
        const badgeEl = document.querySelector('#headerBadge');

        if (titleEl) titleEl.textContent = t.title;
        if (subtitleEl) subtitleEl.textContent = t.subtitle;
        if (badgeEl) badgeEl.textContent = t.live;
    }

    /**
     * Binds internal event listeners orchestrating the application flow.
     * @private
     * @returns {void}
     */
    #initEvents() {
        // 1. Handle user typing in the search input
        this.#searchPanel.addEventListener('search:query', (/** @type {CustomEvent<{query: string}>} */ e) => {
            const { query } = e.detail;

            if (!query || query.trim().length < 2) {
                this.#searchPanel.clearSuggestions();
                return;
            }

            this.#geocodingService.searchLocations(query.trim());
        });

        // 2. Handle successful geocoding results
        this.#geocodingService.addEventListener('search:success', (/** @type {CustomEvent<LocationResult[]>} */ e) => {
            this.#searchPanel.renderSuggestions(e.detail);
        });

        // 3. Handle geocoding errors
        this.#geocodingService.addEventListener('search:error', (/** @type {CustomEvent<Error>} */ e) => {
            this.#showError(`Search error: ${e.detail.message}`);
        });

        // 4. Handle location selection from suggestions
        this.#searchPanel.addEventListener('location:select', (/** @type {CustomEvent<LocationResult>} */ e) => {
            const location = e.detail;
            this.#setStatus(`Loading forecast for ${location.name}...`);
            this.#forecastService.fetchForecast(location.lat, location.lon);
        });

        // 5. Handle geolocation requests
        this.#searchPanel.addEventListener('geolocation:request', () => {
            if (!navigator.geolocation) {
                this.#showError('Geolocation is not supported by your browser.');
                return;
            }

            this.#setStatus('Detecting your location...');

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.#setStatus('Location found, fetching forecast...');
                    this.#searchPanel.setInputValue(getTranslation().currentLocation);
                    this.#forecastService.fetchForecast(latitude, longitude);
                },
                (error) => {
                    this.#showError(`Failed to retrieve location: ${error.message}`);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });

        // 6. Handle forecast lifecycle events
        this.#forecastService.addEventListener('forecast:start', () => {
            this.#forecastView.hide();
        });

        this.#forecastService.addEventListener('forecast:success', (/** @type {CustomEvent<ForecastResponse>} */ e) => {
            this.#setStatus('');
            this.#forecastView.render(e.detail);
        });

        this.#forecastService.addEventListener('forecast:error', (/** @type {CustomEvent<Error>} */ e) => {
            this.#showError(`Forecast error: ${e.detail.message}`);
        });
    }

    /**
     * Sets a standard status message.
     * @private
     * @param {string} message - Message text
     * @returns {void}
     */
    #setStatus(message) {
        this.#statusMessage.textContent = message;
        this.#statusMessage.className = '';
    }

    /**
     * Displays an error message.
     * @private
     * @param {string} message - Error text
     * @returns {void}
     */
    #showError(message) {
        this.#statusMessage.textContent = message;
        this.#statusMessage.className = 'error';
    }
}