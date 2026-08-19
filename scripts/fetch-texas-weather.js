const fs = require("fs");
const https = require("https");

const OUTPUT = "public/texas_weather.json";

const LOCATIONS = [
  {
    name: "Amarillo",
    region: "Panhandle",
    lat: 35.2220,
    lon: -101.8313
  },
  {
    name: "El Paso",
    region: "West Texas",
    lat: 31.7619,
    lon: -106.4850
  },
  {
    name: "Dallas-Fort Worth",
    region: "North Texas",
    lat: 32.8998,
    lon: -97.0403
  },
  {
    name: "Austin",
    region: "Central Texas",
    lat: 30.2672,
    lon: -97.7431
  },
  {
    name: "San Antonio",
    region: "South Central Texas",
    lat: 29.4241,
    lon: -98.4936
  },
  {
    name: "Houston",
    region: "Gulf Coast",
    lat: 29.7604,
    lon: -95.3698
  },
  {
    name: "Beaumont",
    region: "Southeast Texas",
    lat: 30.0802,
    lon: -94.1266
  },
  {
    name: "McAllen",
    region: "Rio Grande Valley",
    lat: 26.2034,
    lon: -98.2300
  }
];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          "User-Agent":
            "GSR-Lone-Star-Report/1.0 contact@gsrnetwork.com",
          "Accept":
            "application/geo+json, application/json"
        }
      },
      response => {
        if (response.statusCode !== 200) {
          response.resume();

          reject(
            new Error(
              `HTTP ${response.statusCode}: ${url}`
            )
          );

          return;
        }

        let data = "";

        response.setEncoding("utf8");

        response.on("data", chunk => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            resolve(JSON.parse(data));
          }
          catch (error) {
            reject(
              new Error(
                `Invalid JSON from ${url}`
              )
            );
          }
        });
      }
    );

    request.setTimeout(20000, () => {
      request.destroy(
        new Error("NWS request timeout")
      );
    });

    request.on("error", reject);
  });
}

async function fetchLocation(location) {
  const pointUrl =
    `https://api.weather.gov/points/${location.lat},${location.lon}`;

  const point = await fetchJson(pointUrl);

  const forecastUrl =
    point?.properties?.forecast;

  if (!forecastUrl) {
    throw new Error(
      `No forecast URL returned for ${location.name}`
    );
  }

  const forecast =
    await fetchJson(forecastUrl);

  const periods =
    forecast?.properties?.periods || [];

  if (!periods.length) {
    throw new Error(
      `No forecast periods returned for ${location.name}`
    );
  }

  const current = periods[0];
  const next = periods[1] || null;

  return {
    name: location.name,
    region: location.region,
    temperature: current.temperature,
    temperature_unit: current.temperatureUnit,
    forecast: current.shortForecast,
    wind_speed: current.windSpeed,
    wind_direction: current.windDirection,
    period: current.name,
    next_period: next
      ? {
          name: next.name,
          temperature: next.temperature,
          temperature_unit: next.temperatureUnit,
          forecast: next.shortForecast
        }
      : null,
    source: "National Weather Service"
  };
}

async function main() {
  const locations = [];
  const failures = [];

  for (const location of LOCATIONS) {
    process.stdout.write(
      `Fetching ${location.name} ... `
    );

    try {
      const result =
        await fetchLocation(location);

      locations.push(result);

      console.log(
        `${result.temperature}°${result.temperature_unit} - ${result.forecast}`
      );
    }
    catch (error) {
      failures.push({
        name: location.name,
        error: error.message
      });

      console.log(
        `FAILED: ${error.message}`
      );
    }
  }

  if (locations.length < 6) {
    throw new Error(
      `Only ${locations.length} of ${LOCATIONS.length} Texas weather locations succeeded.`
    );
  }

  const output = {
    generated_at:
      new Date().toISOString(),

    source:
      "National Weather Service",

    source_url:
      "https://www.weather.gov/",

    editorial_note:
      "Official National Weather Service forecast data.",

    locations,
    failures
  };

  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(
      output,
      null,
      2
    ),
    "utf8"
  );

  console.log("");
  console.log(
    `Texas weather snapshot written: ${locations.length}/${LOCATIONS.length} locations`
  );
}

main().catch(error => {
  console.error("");
  console.error(
    `WEATHER FETCH FAILED: ${error.message}`
  );

  process.exit(1);
});