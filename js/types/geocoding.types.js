/**
 * @typedef {Record<string, string>} LocalNames
 */

/**
 * @typedef {Object} LocationResult
 * @property {string} name - City name
 * @property {LocalNames} [local_names] - Names of the location in different languages
 * @property {number} lat - Latitude
 * @property {number} lon - Longitude
 * @property {string} country - Country code (ISO 3166)
 * @property {string} [state] - State or region name
 */