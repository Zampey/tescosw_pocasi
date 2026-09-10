/**
 * @import { ForecastResponse, ForecastItem } from '../types/weather.types.js'
 */

export class ForecastView {
    /** @type {HTMLElement} */
    #sectionElement;
    /** @type {HTMLElement} */
    #locationTitleElement;
    /** @type {HTMLElement} */
    #listElement;

    /**
     * Creates an instance of ForecastView.
     * @param {HTMLElement} sectionElement - The main section container for forecast data
     */
    constructor(sectionElement) {
        this.#sectionElement = sectionElement;
        this.#locationTitleElement = /** @type {HTMLElement} */ (this.#sectionElement.querySelector('#locationTitle'));
        this.#listElement = /** @type {HTMLElement} */ (this.#sectionElement.querySelector('#forecastContainer'));
    }

    /**
     * Renders 5-day forecast response data grouped by days into collapsible rows using pure DOM API.
     * @public
     * @param {ForecastResponse} forecastData - The API forecast response object
     * @returns {void}
     */
    render(forecastData) {
        this.#sectionElement.style.display = 'block';
        this.#locationTitleElement.textContent = `${forecastData.city.name}, ${forecastData.city.country}`;

        this.#listElement.innerHTML = '';

        /** @type {Map<string, ForecastItem[]>} */
        const daysMap = new Map();

        forecastData.list.forEach(item => {
            const dateKey = item.dt_txt.split(' ')[0];
            if (!daysMap.has(dateKey)) {
                daysMap.set(dateKey, []);
            }
            /** @type {ForecastItem[]} */ (daysMap.get(dateKey)).push(item);
        });

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const userLocale = navigator.language || 'en-US';

        daysMap.forEach((items, dateStr) => {
            const isToday = (dateStr === todayStr);
            let displayItem = items[0];

            if (isToday) {
                const currentTimestamp = now.getTime() / 1000;
                let closest = items[0];
                let minDiff = Math.abs(items[0].dt - currentTimestamp);

                for (let i = 1; i < items.length; i++) {
                    const diff = Math.abs(items[i].dt - currentTimestamp);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closest = items[i];
                    }
                }
                displayItem = closest;
            } else {
                // For future days, pick the item with the highest temperature as the summary representative
                let highest = items[0];
                for (let i = 1; i < items.length; i++) {
                    if (items[i].main.temp > highest.main.temp) {
                        highest = items[i];
                    }
                }
                displayItem = highest;
            }

            const rowElement = document.createElement('div');
            rowElement.className = 'forecast-row';

            const headerElement = document.createElement('div');
            headerElement.className = 'forecast-row-header';

            const rowLeft = document.createElement('div');
            rowLeft.className = 'forecast-row-left';

            const dayLabelSpan = document.createElement('span');
            dayLabelSpan.className = 'forecast-day-label';
            dayLabelSpan.textContent = this.#formatDateLabel(dateStr, userLocale);

            rowLeft.appendChild(dayLabelSpan);

            // Show time sub-span only for the current day
            if (isToday) {
                const rawDefaultTime = displayItem.dt_txt.split(' ')[1].slice(0, 5);
                const formattedDefaultTime = this.#formatTimeLabel(rawDefaultTime, userLocale);

                const timeSubSpan = document.createElement('span');
                timeSubSpan.className = 'forecast-time-sub';
                timeSubSpan.textContent = `(${formattedDefaultTime})`;
                rowLeft.appendChild(timeSubSpan);
            }

            const rowRight = document.createElement('div');
            rowRight.className = 'forecast-row-right';

            const weatherIconContainer = document.createElement('div');
            weatherIconContainer.className = 'forecast-weather-icon-container';

            const iconImg = document.createElement('img');
            iconImg.className = 'forecast-icon-img';
            iconImg.src = `https://openweathermap.org/img/wn/${displayItem.weather[0].icon}.png`;
            iconImg.alt = 'icon';
            iconImg.width = 30;
            iconImg.height = 30;

            const tempSpan = document.createElement('span');
            tempSpan.className = 'forecast-temp-span';
            tempSpan.textContent = `${Math.round(displayItem.main.temp)} °C`;

            weatherIconContainer.appendChild(iconImg);
            weatherIconContainer.appendChild(tempSpan);

            const metaSpan = document.createElement('div');
            metaSpan.className = 'forecast-meta-span';

            const humidityDiv = document.createElement('span');
            humidityDiv.textContent = `💧 ${displayItem.main.humidity}%`;

            const windDiv = document.createElement('span');
            windDiv.textContent = `💨 ${displayItem.wind.speed} m/s`;

            metaSpan.appendChild(humidityDiv);
            metaSpan.appendChild(windDiv);

            const toggleIcon = document.createElement('span');
            toggleIcon.className = 'toggle-icon';
            toggleIcon.textContent = '▼';

            rowRight.appendChild(weatherIconContainer);
            rowRight.appendChild(metaSpan);
            rowRight.appendChild(toggleIcon);

            headerElement.appendChild(rowLeft);
            headerElement.appendChild(rowRight);

            const detailsElement = document.createElement('div');
            detailsElement.className = 'forecast-row-details';

            const listContainer = document.createElement('div');
            listContainer.className = 'forecast-details-list';

            items.forEach((subItem) => {
                const startTimeRaw = subItem.dt_txt.split(' ')[1].slice(0, 5);
                const [hours, minutes] = startTimeRaw.split(':').map(Number);
                const endHours = (hours + 3) % 24;
                const endTimeRaw = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

                const formattedStartTime = this.#formatTimeLabel(startTimeRaw, userLocale);
                const formattedEndTime = this.#formatTimeLabel(endTimeRaw, userLocale);
                const timeRange = `${formattedStartTime} – ${formattedEndTime}`;

                const subItemEl = document.createElement('div');
                subItemEl.className = 'forecast-detail-item';

                const subTimeRange = document.createElement('div');
                subTimeRange.className = 'forecast-detail-time';
                subTimeRange.textContent = timeRange;

                const subContentRight = document.createElement('div');
                subContentRight.className = 'forecast-detail-content';

                const subWeatherGroup = document.createElement('div');
                subWeatherGroup.className = 'forecast-detail-weather';

                const subIcon = document.createElement('img');
                subIcon.src = `https://openweathermap.org/img/wn/${subItem.weather[0].icon}.png`;
                subIcon.alt = 'icon';
                subIcon.width = 24;
                subIcon.height = 24;

                const subTemp = document.createElement('span');
                subTemp.className = 'temp';
                subTemp.textContent = `${Math.round(subItem.main.temp)} °C`;

                subWeatherGroup.appendChild(subIcon);
                subWeatherGroup.appendChild(subTemp);

                const subMeta = document.createElement('div');
                subMeta.className = 'forecast-detail-meta';

                const subHum = document.createElement('span');
                subHum.textContent = `💧 ${subItem.main.humidity}%`;

                const subWind = document.createElement('span');
                subWind.textContent = `💨 ${subItem.wind.speed} m/s`;

                subMeta.appendChild(subHum);
                subMeta.appendChild(subWind);

                subContentRight.appendChild(subWeatherGroup);
                subContentRight.appendChild(subMeta);

                subItemEl.appendChild(subTimeRange);
                subItemEl.appendChild(subContentRight);

                listContainer.appendChild(subItemEl);
            });

            detailsElement.appendChild(listContainer);

            headerElement.addEventListener('click', () => {
                const isExpanded = detailsElement.classList.contains('expanded');
                if (isExpanded) {
                    detailsElement.style.maxHeight = '0px';
                    detailsElement.classList.remove('expanded');
                    headerElement.classList.remove('expanded');
                } else {
                    detailsElement.classList.add('expanded');
                    headerElement.classList.add('expanded');
                    detailsElement.style.maxHeight = `${detailsElement.scrollHeight}px`;
                }
            });

            rowElement.appendChild(headerElement);
            rowElement.appendChild(detailsElement);
            this.#listElement.appendChild(rowElement);
        });
    }

    /**
     * Formats ISO date string to a localized day label using browser locale.
     * @private
     * @param {string} dateStr - Date string in YYYY-MM-DD format
     * @param {string} locale - Browser locale string
     * @returns {string} Formatted day label
     */
    #formatDateLabel(dateStr, locale) {
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat(locale, {
            weekday: 'long',
            day: 'numeric',
            month: 'numeric'
        }).format(date);
    }

    /**
     * Formats time string (HH:mm) to localized format using browser locale settings.
     * @private
     * @param {string} timeStr - Time string in HH:mm format
     * @param {string} locale - Browser locale string
     * @returns {string} Formatted localized time
     */
    #formatTimeLabel(timeStr, locale) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        try {
            return new Intl.DateTimeFormat(locale, {
                hour: 'numeric',
                minute: '2-digit'
            }).format(date);
        } catch {
            return timeStr;
        }
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