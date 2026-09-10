/**
 * @import { ForecastResponse } from '../types/weather.types.js'
 */

export class ForecastChart {
    /** @type {HTMLElement} */
    #container;
    /** @type {HTMLCanvasElement} */
    #canvas;
    /** @type {Chart | null} */
    #chartInstance = null;

    /**
     * Creates an instance of ForecastChart.
     * @param {HTMLElement} container - Container where the chart canvas will be mounted
     */
    constructor(container) {
        if (!(container instanceof HTMLElement)) {
            throw new TypeError('ForecastChart requires a valid HTMLElement container.');
        }
        this.#container = container;
        this.#render();
    }

    /**
     * Renders the canvas element into the container.
     * @private
     * @returns {void}
     */
    #render() {
        this.#container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'forecast-chart-wrapper';

        this.#canvas = document.createElement('canvas');
        this.#canvas.className = 'forecast-chart-canvas';

        wrapper.appendChild(this.#canvas);
        this.#container.appendChild(wrapper);
    }

    /**
     * Renders or updates the temperature chart using Chart.js with localized X-axis dates and tooltips.
     * @public
     * @param {ForecastResponse} forecastData - The API forecast response object
     * @returns {void}
     */
    render(forecastData) {
        if (!window.Chart) {
            console.error('Chart.js is not loaded.');
            return;
        }

        const userLocale = navigator.language || 'en-US';

        // Format X-axis labels as dates (showing the date only when it changes to avoid clutter)
        let lastDateStr = '';
        const labels = forecastData.list.map(item => {
            const date = new Date(item.dt * 1000);
            const currentDateStr = new Intl.DateTimeFormat(userLocale, {
                day: 'numeric',
                month: 'numeric'
            }).format(date);

            if (currentDateStr !== lastDateStr) {
                lastDateStr = currentDateStr;
                return currentDateStr;
            }
            return '';
        });

        // Prepare localized date and time strings for tooltips on hover
        const tooltipDates = forecastData.list.map(item => {
            const date = new Date(item.dt * 1000);
            return new Intl.DateTimeFormat(userLocale, {
                weekday: 'short',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            }).format(date);
        });

        const temperatures = forecastData.list.map(item => Math.round(item.main.temp));

        if (this.#chartInstance) {
            this.#chartInstance.destroy();
        }

        const ctx = this.#canvas.getContext('2d');

        this.#chartInstance = new window.Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Teplota (°C)',
                    data: temperatures,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                const index = context[0].dataIndex;
                                return tooltipDates[index];
                            },
                            label: (context) => `${context.parsed.y} °C`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { size: 11 },
                            autoSkip: false,
                            maxRotation: 0
                        }
                    },
                    y: {
                        ticks: {
                            font: { size: 11 },
                            callback: (value) => `${value} °C`
                        }
                    }
                }
            }
        });
    }

    /**
     * Clears or destroys the chart instance.
     * @public
     * @returns {void}
     */
    destroy() {
        if (this.#chartInstance) {
            this.#chartInstance.destroy();
            this.#chartInstance = null;
        }
    }
}