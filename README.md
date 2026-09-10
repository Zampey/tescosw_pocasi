# Weather SPA

A modern single-page web application (**SPA**) for tracking a 5-day weather forecast, built with vanilla **JavaScript (ES6 modules)** without heavy frameworks. It emphasizes modular architecture, partial internationalization (i18n), responsive UI, and interactive data visualization using Chart.js.

## Running the Application

Because this application relies on native ES6 modules (`import`/`export`), it cannot be opened directly from the local file system (`file://` protocol) due to browser security restrictions regarding CORS policies. To run the project correctly, it must be served via a local HTTP server using one of the methods below.

### Option 1: Visual Studio Code (Live Server Extension) 
(I used this option when developing this app)

* Open the project root folder in **Visual Studio Code**.
* Install the **Live Server** extension (by Ritwick Dey) from the marketplace.
* Right-click the `index.html` file in the Explorer sidebar and select **Open with Live Server**.

### Option 2: Python (Built-in Server)

* Open your terminal or command prompt and navigate to the project root directory.
* Run the built-in HTTP server command: `python3 -m http.server 8000` (or `python`).
* Open your browser and navigate to `http://localhost:8000`.

### Option 3: Node.js (`http-server`)

* Ensure Node.js is installed on your system.
* Open your terminal in the project root and run: `npx http-server`.
* Click or copy the local development URL provided in the terminal output.

## Supported Browsers

The application fully supports the latest versions of modern browsers built on standard web technologies (ES6+, DOM API, Intl API):

* **Google Chrome** (latest version)
* **Mozilla Firefox** (latest version)
* **Microsoft Edge** (latest version)

## Internal Project Structure

The code is cleanly organized into modular folders according to the responsibilities of individual layers:

* **`js/app.js`**
* The main orchestrator of the entire application. Initializes services, manages global state, handles error states, and connects events between the user interface and the data layer.


* **`js/api/`**
* **`ApiClient.js`**: Universal HTTP client for communicating with external APIs (OpenWeatherMap) with support for secure parameter passing and response processing.


* **`js/services/`**
* **`GeocodingService.js`**: Handles searching for locations based on text queries.
* **`ForecastService.js`**: Retrieves weather data for given geographic coordinates. Both services inherit from `EventTarget` for clean asynchronous communication.


* **`js/components/`**
* **`SearchPanel.js`**: Search bar component with a 1s debounce, location autocomplete, and geolocation (GPS) support.
* **`ForecastView.js`**: Main component for rendering the forecast, organizing data into collapsible rows grouped by days.
* **`ForecastChart.js`**: Encapsulated component for rendering a temperature chart above the overview using **Chart.js** with localized axis labels and tooltips.


* **`js/i18n/`**
* Modular internationalization system. Automatically detects the user's browser language and provides corresponding dictionaries for localized texts (`cs.js`, `en.js`, central `i18n.js`).


* **`css/`**
* Separated style sheets for clarity: `variables.css` (global design variables), `base.css` (base layout), `search.css` (search engine styles), and `forecast.css` (forecast and chart styles).
