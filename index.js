const apiKey = 'eb15161719de413188894420250205';
const defaultCity = "Alwar";

const mainForm = document.getElementById("search-form");
const recentCities = document.getElementById("recent-cities");

const storedCities = JSON.parse(localStorage.getItem("cityNames"));
const searchedCities = storedCities ? [...storedCities] : [];

// Populate dropdown on load
if (storedCities && storedCities.length > 0) {
  storedCities.forEach(city => {
    const newOption = document.createElement("option");
    newOption.value = city;
    newOption.innerText = city;
    recentCities.appendChild(newOption);
  });
} else {
  recentCities.style.display = "none";
}


recentCities.addEventListener("change", () => {
  const selectedCity = recentCities.value;
  console.log("Selected city:", selectedCity);
  checkCityExists(selectedCity);
  // displayForecast(selectedCity);
});

mainForm.addEventListener("submit", async  (event) =>  {
  event.preventDefault();
  const formData = new FormData(mainForm);
  const cityName = formData.get('cityName').trim();

  if (!cityName) return;

  // if (!searchedCities.includes(cityName)) {
  //   searchedCities.push(cityName);
  //   localStorage.setItem("cityNames", JSON.stringify(searchedCities));

  //   const newOption = document.createElement("option");
  //   newOption.value = cityName;
  //   newOption.innerText = cityName;
  //   recentCities.appendChild(newOption);
  //   recentCities.style.display = "block";
  // }

  // displayForecast(cityName);

  checkCityExists(cityName);
  mainForm.reset();
});

function getCityName() {
  if (!navigator.geolocation) {
    console.log("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`);
        const data = await res.json();
        const city = data.location.name;
        console.log(`You are in: ${city}`);

        // Call the forecast logic
        displayForecast(city);

      } catch (err) {
        console.log("Failed to fetch city name.");
        console.error(err);
      }
    },
    (error) => {
      console.log(`Error: ${error.message}`);
    }
  );
}

displayForecast(defaultCity);

async function displayForecast(cityName) {
  try {
    const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=6`);
    const result = await res.json();

    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = "";

    result.forecast.forecastday.forEach(day => {
      const card = document.createElement("div");
      card.className = "bg-blue-500 text-white p-3 shadow-2xl w-[-webkit-fill-available] mb-10 rounded-md flex gap-6 justify-between flex-col xl:w-auto";

      card.innerHTML = `
        <span class="text-xl p-2 bg-blue-400 rounded-md">${day.date}</span>
        <div class="text-left p-2">
          <div class="flex gap-6 flex-col-reverse md:flex-row md:justify-between md:p-6">
            <div>
              <div class="flex gap-4 items-center mb-2">
                <span class="text-2xl font-semibold">${result.location.name}</span>
              </div>
              <div class="flex gap-4 items-center mb-2">
                <span class="text-md">Temperature</span>
                <span class="text-md">${day.day.avgtemp_c} °C</span>
              </div>
              <div class="flex gap-4 items-center mb-2">
                <span class="text-md">Wind</span>
                <span class="text-md">${day.day.maxwind_kph} kph</span>
              </div>
              <div class="flex gap-4 items-center mb-2">
                <span class="text-md">Humidity</span>
                <span class="text-md">${day.day.avghumidity}%</span>
              </div>
            </div>
            <div>
              <img class="w-30" src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            </div>
          </div>
        </div>
      `;
      forecastContainer.appendChild(card);
    });

  } catch (err) {
    console.log("Error fetching forecast:", err);
  }
}


async function checkCityExists(cityName) {
  try {
    const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${cityName}&days=1`);
    const data = await res.json();

    if (data.error) {
      console.error("City not found:", data.error.message);
      alert("City not found. Please enter a valid city name.");
    } else {
      const validCity = data.location.name;

      // ✅ Only add if not already in the list
      if (!searchedCities.includes(validCity)) {
        searchedCities.push(validCity);
        localStorage.setItem("cityNames", JSON.stringify(searchedCities));

        const newOption = document.createElement("option");
        newOption.value = validCity;
        newOption.innerText = validCity;
        recentCities.appendChild(newOption);
        recentCities.style.display = "block";
      }

      displayForecast(validCity);
    }
  } catch (err) {
    console.error("Network error:", err);
  }
}
