/**
 * @import { LocationResult } from '../types/geocoding.types.js'
 * @import { SearchQueryDetail } from '../types/ui.types.js'
 */

export class SearchPanel extends EventTarget {
    /** @type {HTMLElement} */
    #container;
    /** @type {HTMLInputElement} */
    #inputElement;
    /** @type {HTMLUListElement} */
    #suggestionsList;
    /** @type {HTMLButtonElement} */
    #geoButton;

    /**
     * Creates an instance of SearchPanel.
     * @param {HTMLElement} container - The DOM element where the search panel will be mounted
     */
    constructor(container) {
        super();
        // Ensure the container is a valid HTMLElement before proceeding
        if (!(container instanceof HTMLElement)) {
            throw new TypeError('SearchPanel requires a valid HTMLElement container.');
        }
        this.#container = container;
        this.#render();
        this.#bindEvents();
    }

    /**
     * Renders the internal HTML structure and caches DOM elements.
     * @private
     * @returns {void}
     */
    #render() {
        this.#container.innerHTML = `
            <div class="search-panel">
                <div class="search-box" style="display: flex; gap: 8px; position: relative;">
                    <input type="text" id="cityInput" placeholder="Zadej název města..." autocomplete="off" style="flex: 1; padding: 10px; font-size: 16px;">
                    <button id="geoBtn" title="Použít aktuální polohu" style="padding: 0 12px; cursor: pointer;">📍</button>
                </div>
                <ul id="suggestionsList" style="list-style: none; padding: 0; margin: 4px 0 0 0; background: white; border: 1px solid #ccc; position: absolute; width: 100%; z-index: 10; display: none;"></ul>
            </div>
        `;

        // Cache DOM elements after rendering
        this.#inputElement = this.#container.querySelector('#cityInput');
        this.#suggestionsList = this.#container.querySelector('#suggestionsList');
        this.#geoButton = this.#container.querySelector('#geoBtn');
    }

    /**
     * Binds internal event listeners to DOM elements.
     * @private
     * @returns {void}
     */
    #bindEvents() {
        // Handle input events for the search box
        this.#inputElement.addEventListener('input', (e) => {
            const query = /** @type {HTMLInputElement} */ (e.target).value;
            /** @type {CustomEvent<SearchQueryDetail>} */
            const event = new CustomEvent('search:query', { detail: { query } });
            this.dispatchEvent(event);
        });

        // Handle click events for the geolocation button
        this.#geoButton.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('geolocation:request'));
        });

        // Handle clicks outside the search panel to close suggestions
        document.addEventListener('click', (e) => {
            if (!this.#container.contains(/** @type {Node} */(e.target))) {
                this.clearSuggestions();
            }
        });
    }

    /**
     * Renders location suggestions into the dropdown list.
     * @public
     * @param {LocationResult[]} locations - Array of matched location objects
     * @returns {void}
     */
    renderSuggestions(locations) {
        this.#suggestionsList.innerHTML = '';

        // If no locations are provided, clear the suggestions and exit
        if (!locations || locations.length === 0) {
            this.clearSuggestions();
            return;
        }

        this.#suggestionsList.style.display = 'block';

        // Render each location as a list item in the suggestions dropdown
        locations.forEach(loc => {
            const li = document.createElement('li');
            li.style.padding = '8px 12px';
            li.style.cursor = 'pointer';
            li.style.borderBottom = '1px solid #eee';
            li.textContent = `${loc.name} (${loc.country}${loc.state ? `, ${loc.state}` : ''})`;

            li.addEventListener('mouseenter', () => li.style.background = '#f4f4f4');
            li.addEventListener('mouseleave', () => li.style.background = 'white');

            li.addEventListener('click', () => {
                this.#inputElement.value = loc.name;
                this.clearSuggestions();
                /** @type {CustomEvent<LocationResult>} */
                const event = new CustomEvent('location:select', { detail: loc });
                this.dispatchEvent(event);
            });

            this.#suggestionsList.appendChild(li);
        });
    }

    /**
     * Clears and hides the suggestions dropdown.
     * @public
     * @returns {void}
     */
    clearSuggestions() {
        this.#suggestionsList.innerHTML = '';
        this.#suggestionsList.style.display = 'none';
    }

    /**
     * Sets the value of the search input field.
     * @public
     * @param {string} text - Text to set
     * @returns {void}
     */
    setInputValue(text) {
        this.#inputElement.value = text;
    }
}