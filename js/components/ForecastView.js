/**
 * @import { ForecastResponse } from '../types/weather.types.js'
 */

export class ForecastView {
    /** @type {HTMLElement} */
    #container;
    /** @type {HTMLElement} */
    #sectionElement;
    /** @type {HTMLElement} */
    #locationTitleElement;
    /** @type {HTMLElement} */
    #gridElement;

    /**
     * @param {HTMLElement} sectionElement - The main section container for forecast data
     */
    constructor(sectionElement) {
        this.#sectionElement = sectionElement;
        this.#locationTitleElement = /** @type {HTMLElement} */ (this.#sectionElement.querySelector('#locationTitle'));
        this.#gridElement = /** @type {HTMLElement} */ (this.#sectionElement.querySelector('#forecastContainer'));
    }

    /**
     * Renders forecast response data into the UI.
     * @public
     * @param {ForecastResponse} forecastData - The API forecast response object
     * @returns {void}
     */
    render(forecastData) {
        this.#sectionElement.style.display = 'block';
        this.#locationTitleElement.textContent = `${forecastData.city.name}, ${forecastData.city.country}`;

        this.#gridElement.innerHTML = '';

        forecastData.list.slice(0, 8).forEach(item => {
            const timeOnly = item.dt_txt.split(' ')[1].slice(0, 5);
            const dateOnly = item.dt_txt.split(' ')[0].slice(5);

            const itemElement = document.createElement('div');
            itemElement.className = 'forecast-item';
            itemElement.innerHTML = `
                <div class="time">${dateOnly} ${timeOnly}</div>
                <div class="temp">${Math.round(item.main.temp)} °C</div>
                <div class="desc">${item.weather[0].description}</div>
            `;
            this.#gridElement.appendChild(itemElement);
        });
    }

    /**
     * Hides the forecast section.
     * @public
     * @returns {void}
     */
    hide() {
        this.#sectionElement.style.display = 'none';
    }
}