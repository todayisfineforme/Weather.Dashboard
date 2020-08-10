$(document).ready(function () {

    // var searchHistory = search();

    const apiKey = "cfaa7485f04b7e242a2c491674d1d2f4";
    const currentTime = moment().format('dddd, MMMM Do');

    currentForecast = (apiKey, location) => {
        const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;
        $(".mainForecast").empty();
        $(".extendedForecast").empty();
        $(".historyList").empty();
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then((response) => {
            let lat = response.coord.lat;
            let lon = response.coord.lon;
            const temp = Math.floor(((response.main.temp) - 273.15) * 1.80 + 32);
            $(".mainForecast").append(`
                <h1 class="card-title" style="float: left;">${response.name} (${currentTime})</h1>
                <img src="http://openweathermap.org/img/wn/${response.weather[0].icon}.png" alt="responsive image">
                <br>
                <br>
                <h5 class="card-text">Temperature: ${temp} °F</h5>
                <br>
                <h5 class="card-text">Humidity: ${response.main.humidity}% </h5>
                <br>
                <h5 class="card-text">Wind Speed: ${response.wind.speed} mph</h5>
                <br> 
            `)
            sevenDayForecast(lat,lon);
        });
    };

    sevenDayForecast = (lat, lon) => {
        const queryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then((response) => {
            const uvi = response.daily[0].uvi;
            if (uvi > 8) {
                $('.mainForecast').append(`<h5 class="card-text" style="float: left;">UV Index: &ensp;</h5><a type="button" class="btn btn-danger btn-sm UVBtn" href="https://en.wikipedia.org/wiki/Ultraviolet_index#Index_usage" target="_blank">${uvi}</a>`)
            }
            else if (uvi < 8 && uvi > 5) {
                $('.mainForecast').append(`<h5 class="card-text" style="float: left;">UV Index: &ensp;</h5><a type="button" class="btn btn-warning btn-sm UVBtn" href="https://en.wikipedia.org/wiki/Ultraviolet_index#Index_usage" target="_blank">${uvi}</a>`)
            }
            else {
                $('.mainForecast').append(`<h5 class="card-text" style="float: left;">UV Index: &ensp;</h5><a type="button" class="btn btn-success btn-sm UVBtn" href="https://en.wikipedia.org/wiki/Ultraviolet_index#Index_usage" target="_blank">${uvi}</a>`)
            }
            for (var i = 1; i < 8; i++) {
                var dayNext = moment().add(i, 'days').format('L');
                var iconNext = response.daily[i].weather[0].icon
                var tempNext = Math.floor(((response.daily[i].temp.day) - 273.15) * 1.80 + 32);
                var humidityNext = response.daily[i].humidity;
                $('.extendedForecast').append(`
                    <div class="card text-white bg-dark mb-3" style="max-width: 18rem;">
                        <div class="card-header">
                            <h5>${dayNext}</h5>
                        </div>
                        <div class="card-body">
                            <img src="http://openweathermap.org/img/wn/${iconNext}.png" alt="responsive image">
                            <p class="card-title">Temp: ${tempNext} °F</p>
                            <p class="card-title">Humidity: ${humidityNext} %</p>
                        </div>
                    </div>
                `);
            }
        });
    };

    search = () => {
        const searched = JSON.parse(localStorage.getItem("searchHistory"));
        if (searched !== null) {
            searchHistory = searched;
            currentForecast(apiKey, searchHistory[0]);
            writeHistory();
        }else{
            searchHistory = [];
            currentForecast(apiKey, "Chicago")
        }
    }

    writeHistory = () => {
        for (var i=0; i<searchHistory.length; i++){
            $('.historyList').append(`
                <div class="row justify-content-center">
                    <div class="col-md-6 text-center">
                        <button type="button" class="btn btn-outline-secondary justify-content-center reSearch" data-location="${searchHistory[i]}" value="${searchHistory[i]}">${searchHistory[i]}</button>
                    </div>
                </div>
            `);
        }
    }

    $('.submitSearch').click(() => {
        const location = $('.citySearch').val();
        if (location !== ""){
            searchHistory.unshift(location);
            localStorage.setItem("searchHistory" , JSON.stringify(searchHistory));
            currentForecast(apiKey,location);
            writeHistory();
        }  
    });

    $('.historyList').delegate('.reSearch', 'click', () => {
        const location = $(this)[0].activeElement.attributes[2].value;
        $(".mainForecast").empty();
        $(".extendedForecast").empty();
        $(".historyList").empty();
        currentForecast(apiKey,location);
        writeHistory();
    });

    search();
});