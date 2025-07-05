document.addEventListener('DOMContentLoaded', function() {
    const fetchWeatherBtn = document.getElementById('fetchWeather');
    const icaoInput = document.getElementById('icaoInput');
    const weatherResult = document.getElementById('weatherResult');
    const weatherContent = document.getElementById('weatherContent');

    fetchWeatherBtn.addEventListener('click', fetchWeatherData);
    icaoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fetchWeatherData();
        }
    });

    function fetchWeatherData() {
        const icaoCode = icaoInput.value.trim().toUpperCase();
        
        if (!icaoCode) {
            showError('Please enter an ICAO airport code');
            return;
        }

        if (icaoCode.length !== 4) {
            showError('ICAO codes must be exactly 4 characters');
            return;
        }

        const apiUrl = `https://aviationweather.gov/api/data/metar?ids=${icaoCode}&format=json`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.length === 0) {
                    throw new Error('No weather data found for this airport');
                }
                displayWeather(data[0]);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                showError(error.message || 'Failed to fetch weather data. Please try again.');
            });
    }

    function displayWeather(metarData) {
        weatherResult.classList.remove('hidden');
        
        // Parse the raw METAR data
        const rawMetar = metarData.rawOb || 'Data not available';
        const tempC = metarData.tempC || 'N/A';
        const windDir = metarData.windDir || 'Variable';
        const windSpeed = metarData.windSpeed || '0';
        const windGust = metarData.windGust || null;
        const visibility = metarData.visibility || 'N/A';
        const clouds = metarData.clouds || [];

        // Format wind information
        let windInfo = `${windDir}° at ${windSpeed} knots`;
        if (windGust) {
            windInfo += `, gusting to ${windGust} knots`;
        }

        // Format cloud information
        let cloudInfo = 'Clear skies';
        if (clouds.length > 0) {
            cloudInfo = clouds.map(cloud => {
                return `${cloud.cover} at ${cloud.base} feet`;
            }).join(', ');
        }

        weatherContent.innerHTML = `
            <h3>Weather for ${icaoInput.value.toUpperCase()}</h3>
            <p class="raw-metar"><small>${rawMetar}</small></p>
            
            <div class="weather-item">
                <i class="fas fa-temperature-high"></i>
                <span>Temperature: ${tempC}°C</span>
            </div>
            
            <div class="weather-item">
                <i class="fas fa-wind"></i>
                <span>Wind: ${windInfo}</span>
            </div>
            
            <div class="weather-item">
                <i class="fas fa-eye"></i>
                <span>Visibility: ${visibility} statute miles</span>
            </div>
            
            <div class="weather-item">
                <i class="fas fa-cloud"></i>
                <span>Clouds: ${cloudInfo}</span>
            </div>
        `;
    }

    function showError(message) {
        weatherResult.classList.remove('hidden');
        weatherContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i> ${message}
            </div>
        `;
    }
});
