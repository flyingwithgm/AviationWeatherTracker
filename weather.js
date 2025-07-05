async function getWeather() {
  const icao = document.getElementById('icaoInput').value.toUpperCase().trim();
  const resultDiv = document.getElementById('weatherResult');

  if (!icao || icao.length !== 4) {
    resultDiv.innerHTML = "<p>Please enter a valid 4-letter ICAO code (e.g., KJFK, DGAA).</p>";
    return;
  }

  resultDiv.innerHTML = "<p>Loading weather data...</p>";

  try {
    const response = await fetch(`https://avwx.rest/api/metar/${icao}?options=summary&format=json`, {
      headers: {
     Authorization: "5zrr7y-qcaVVlKbBeOjJgNLhVQIeYxW63xymdcsXFnQ"    // Replace with your real key
      }
    });

    if (!response.ok) {
      throw new Error("Weather data not available for this ICAO code.");
    }

    const data = await response.json();

    resultDiv.innerHTML = `
      <div class="weather-card">
        <h2>${data.station} (${icao})</h2>
        <p><strong>Flight Rules:</strong> ${data.flight_rules}</p>
        <p><strong>Temperature:</strong> ${data.temperature.value}°C</p>
        <p><strong>Wind:</strong> ${data.wind_direction.repr}° at ${data.wind_speed.repr} knots</p>
        <p><strong>Visibility:</strong> ${data.visibility.repr} meters</p>
        <p><strong>Clouds:</strong> ${data.clouds.length > 0 ? data.clouds.map(cloud => cloud.repr).join(', ') : 'Clear'}</p>
        <p><strong>Raw METAR:</strong> ${data.raw}</p>
      </div>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}
