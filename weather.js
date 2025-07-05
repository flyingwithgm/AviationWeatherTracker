document.addEventListener('DOMContentLoaded', function() {
    const getWeatherBtn = document.getElementById('get-weather');
    const icaoInput = document.getElementById('icao-input');
    const weatherResult = document.getElementById('weather-result');
    const airportName = document.getElementById('airport-name');
    const metarString = document.getElementById('metar-string');
    const temperature = document.getElementById('temperature');
    const wind = document.getElementById('wind');
    const visibility = document.getElementById('visibility');
    const conditions = document.getElementById('conditions');

    // API key and base URL
    const apiKey = 'LW8efytv434DQwRj4mN0ulbMYAEAInxSnGEf-7rXdc0';
    const baseUrl = 'https://avwx.rest/api/metar/';

    getWeatherBtn.addEventListener('click', fetchWeather);

    icaoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            fetchWeather();
        }
    });

    function fetchWeather() {
        const icaoCode = icaoInput.value.trim().toUpperCase();
        
        if (!icaoCode) {
            alert('Please enter an ICAO airport code (e.g. KJFK, EGLL)');
            return;
        }

        // Show loading state
        weatherResult.classList.remove('hidden');
        airportName.textContent = 'Loading...';
        metarString.textContent = 'Fetching METAR data...';
        temperature.textContent = '-';
        wind.textContent = '-';
        visibility.textContent = '-';
        conditions.textContent = '-';

        fetch(`${baseUrl}${icaoCode}?format=json&options=info`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            airportName.textContent = 'Error';
            metarString.textContent = 'Could not fetch weather data';
            temperature.textContent = '-';
            wind.textContent = '-';
            visibility.textContent = '-';
            conditions.textContent = '-';
        });
    }

    function displayWeather(data) {
        // Set airport name
        airportName.textContent = data.station ? `${data.station.name} (${data.station.icao})` : data.icao;
        
        // Set raw METAR string
        metarString.textContent = data.raw;
        
        // Set temperature
        if (data.temperature && data.temperature.value) {
            const tempC = data.temperature.value;
            const tempF = Math.round((tempC * 9/5) + 32);
            temperature.textContent = `${tempC}°C / ${tempF}°F`;
        } else {
            temperature.textContent = 'N/A';
        }
        
        // Set wind information
        if (data.wind_direction && data.wind_speed) {
            const windDir = data.wind_direction.value || 'VRB';
            const windSpeed = data.wind_speed.value;
            const windUnit = data.units.wind_speed;
            let windGust = '';
            
            if (data.wind_gust) {
                windGust = ` gusting to ${data.wind_gust.value} ${windUnit}`;
            }
            
            wind.textContent = `${windDir}° at ${windSpeed} ${windUnit}${windGust}`;
        } else {
            wind.textContent = 'N/A';
        }
        
        // Set visibility
        if (data.visibility) {
            const visValue = data.visibility.value;
            const visUnit = data.units.visibility;
            visibility.textContent = `${visValue} ${visUnit}`;
        } else {
            visibility.textContent = 'N/A';
        }
        
        // Set weather conditions
        if (data.flight_rules) {
            let conditionText = '';
            const rules = data.flight_rules;
            
            // Map flight rules to weather conditions
            if (rules === 'VFR') conditionText = 'Visual Flight Rules (VFR)';
            else if (rules === 'MVFR') conditionText = 'Marginal VFR';
            else if (rules === 'IFR') conditionText = 'Instrument Flight Rules (IFR)';
            else if (rules === 'LIFR') conditionText = 'Low IFR';
            
            // Add weather phenomena if available
            if (data.wx_codes && data.wx_codes.length > 0) {
                const phenomena = data.wx_codes.map(wx => wx.value).join(', ');
                conditionText += ` - ${phenomena}`;
            }
            
            conditions.textContent = conditionText;
            
            // Add appropriate weather icon
            const weatherIcon = conditions.querySelector('i');
            if (rules === 'VFR') {
                weatherIcon.className = 'fas fa-sun';
            } else if (rules === 'MVFR') {
                weatherIcon.className = 'fas fa-cloud-sun';
            } else if (rules === 'IFR') {
                weatherIcon.className = 'fas fa-cloud';
            } else if (rules === 'LIFR') {
                weatherIcon.className = 'fas fa-cloud-rain';
            }
        } else {
            conditions.textContent = 'N/A';
        }
    }
});
