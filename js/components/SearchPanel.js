/**
 * @import { LocationResult } from '../types/geocoding.types.js'
 * @import { SearchQueryDetail } from '../types/ui.types.js'
 */

import { getTranslation } from '../i18n/i18n.js';

export class SearchPanel extends EventTarget {
    /** @type {HTMLElement} */
    #container;
    /** @type {HTMLInputElement} */
    #inputElement;
    /** @type {HTMLUListElement} */
    #suggestionsList;
    /** @type {HTMLButtonElement} */
    #geoButton;
    /** @type {number | null} */
    #debounceTimer = null;

    /**
     * Creates an instance of SearchPanel.
     * @param {HTMLElement} container - The DOM element where the search panel will be mounted
     */
    constructor(container) {
        super();
        if (!(container instanceof HTMLElement)) {
            throw new TypeError('SearchPanel requires a valid HTMLElement container.');
        }
        this.#container = container;
        this.#render();
        this.#bindEvents();
    }

    /**
     * Renders the internal HTML structure using pure DOM API and caches elements.
     * @private
     * @returns {void}
     */
    #render() {
        const t = getTranslation();

        const panelWrapper = document.createElement('div');
        panelWrapper.className = 'search-panel';

        const searchBox = document.createElement('div');
        searchBox.className = 'search-box';

        this.#inputElement = document.createElement('input');
        this.#inputElement.type = 'text';
        this.#inputElement.id = 'cityInput';
        this.#inputElement.className = 'search-input';
        this.#inputElement.placeholder = t.searchPlaceholder || 'Zadej název města...';
        this.#inputElement.autocomplete = 'off';

        this.#geoButton = document.createElement('button');
        this.#geoButton.id = 'geoBtn';
        this.#geoButton.className = 'geo-button';
        this.#geoButton.title = t.geoTitle || 'Použít aktuální polohu';
        this.#geoButton.textContent = '📍';

        searchBox.appendChild(this.#inputElement);
        searchBox.appendChild(this.#geoButton);

        this.#suggestionsList = document.createElement('ul');
        this.#suggestionsList.id = 'suggestionsList';
        this.#suggestionsList.className = 'suggestions-list';

        panelWrapper.appendChild(searchBox);
        panelWrapper.appendChild(this.#suggestionsList);

        this.#container.innerHTML = '';
        this.#container.appendChild(panelWrapper);
    }

    /**
     * Binds internal event listeners with debounce for search inputs.
     * @private
     * @returns {void}
     */
    #bindEvents() {
        this.#inputElement.addEventListener('input', (e) => {
            const query = /** @type {HTMLInputElement} */ (e.target).value;

            if (this.#debounceTimer) {
                clearTimeout(this.#debounceTimer);
            }

            this.#debounceTimer = window.setTimeout(() => {
                /** @type {CustomEvent<SearchQueryDetail>} */
                const event = new CustomEvent('search:query', { detail: { query } });
                this.dispatchEvent(event);
            }, 1000);
        });

        this.#geoButton.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('geolocation:request'));
        });

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

        if (!locations || locations.length === 0) {
            this.clearSuggestions();
            return;
        }

        this.#suggestionsList.classList.add('visible');

        locations.forEach(loc => {
            const li = document.createElement('li');
            li.className = 'suggestion-item';
            li.textContent = `${loc.name} (${loc.country}${loc.state ? `, ${loc.state}` : ''})`;

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
        this.#suggestionsList.classList.remove('visible');
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