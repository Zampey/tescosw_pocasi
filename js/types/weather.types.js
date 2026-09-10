/**
 * @typedef {Object} WeatherCondition
 * @property {number} id
 * @property {string} main
 * @property {string} description
 * @property {string} icon
 */

/**
 * @typedef {Object} MainWeatherData
 * @property {number} temp
 * @property {number} feels_like
 * @property {number} temp_min
 * @property {number} temp_max
 * @property {number} pressure
 * @property {number} [sea_level]
 * @property {number} [grnd_level]
 * @property {number} humidity
 * @property {number} [temp_kf]
 */

/**
 * @typedef {Object} WindData
 * @property {number} speed
 * @property {number} deg
 * @property {number} [gust]
 */

/**
 * @typedef {Object} ForecastItem
 * @property {number} dt - Time of data forecasted (unix, UTC)
 * @property {MainWeatherData} main
 * @property {WeatherCondition[]} weather
 * @property {Object} clouds
 * @property {number} clouds.all
 * @property {WindData} wind
 * @property {number} visibility
 * @property {number} pop - Probability of precipitation
 * @property {Object} [rain]
 * @property {number} [rain.3h]
 * @property {Object} [snow]
 * @property {number} [snow.3h]
 * @property {Object} sys
 * @property {string} sys.pod - Part of the day (n/d)
 * @property {string} dt_txt - Time of data forecasted (ISO, UTC)
 */

/**
 * @typedef {Object} CityInfo
 * @property {number} id
 * @property {string} name
 * @property {Object} coord
 * @property {number} coord.lat
 * @property {number} coord.lon
 * @property {string} country
 * @property {number} population
 * @property {number} timezone
 * @property {number} sunrise
 * @property {number} sunset
 */

/**
 * @typedef {Object} ForecastResponse
 * @property {string} cod
 * @property {number|string} message
 * @property {number} cnt - Number of timestamps returned
 * @property {ForecastItem[]} list
 * @property {CityInfo} city
 */

export { };