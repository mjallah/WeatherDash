let city = "";
let searchCity = $("#search-city")
let currentCity = $("#current-city");
let currentTemperature = $("#temp");
let currentHumidty = $("#humidity");
let currentWind = $("#wind");
let currentUvindex = $("#uv-index");
let sCity = [];

function find(previousCity) {
    for (let i = 0; i < sCity.length; i++) {
        if (previousCity.toUpperCase() === sCity[i]) {
            return -1;
        }
    }
    return 1;
}

let APIKey = "436429f5379fb07b83cab3d5aaa49133";
function displayWeather(event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        currentWeather(city);
    }
}

function currentWeather(city) {
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey + "&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {
        console.log(response);
        let weathericon = response.weather[0].icon;
        let iconurl = "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";
        let date = new Date(response.dt * 1000).toLocaleDateString();
        $(currentCity).html(response.name + "(" + date + ")" + "<img src=" + iconurl + ">");

        $(currentTemperature).html(response.main.temp + "&#8457");
        $(currentHumidty).html(response.main.humidity + "%");
        $(currentWind).html(response.wind.speed + "MPH");

        UVIndex(response.coord.lon, response.coord.lat);
        forecast(response.id);
        if (response.cod == 200) {
            sCity = JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity == null) {
                sCity = [];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname", JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if (find(city) > 0) {
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname", JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}


function UVIndex(ln, lt) {

    let uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
        url: uvqURL,
        method: "GET"
    }).then(function (response) {
        $(currentUvindex).html(response.value);
        if (response.value < 3) {
            $(currentUvindex).addClass("badge-success")

        }
        if (response.value >= 5) {
            $(currentUvindex).addClass("badge-warning")

        }

        if (response.value > 7) {
            $(currentUvindex).addClass("badge-danger")

        }
    });
}

function forecast(cityid) {
    let queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + APIKey + "&units=imperial";
    $.ajax({
        url: queryforcastURL,
        method: "GET"
    }).then(function (response) {
        for (i = 0; i < 5; i++) {
            let date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
            let iconcode = response.list[((i + 1) * 8) - 1].weather[0].icon;
            let iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
            $("#Date" + i).html(date);
            $("#Img" + i).html("<img src=" + iconurl + ">");
            $("#Temp" + i).html(response.list[((i + 1) * 8) - 1].main.temp + "&#8457");
            $("#Humidity" + i).html(response.list[((i + 1) * 8) - 1].main.humidity + "%");
        }

    });
}

function addToList(previousCity) {
    let listEl = $("<li>" + previousCity.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", previousCity.toUpperCase());
    $(".list-group").append(listEl);
}
function pastSearch(event) {
    let liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }

}

function loadlastCity() {
    $("ul").empty();
    let sCity = JSON.parse(localStorage.getItem("cityname"));
    if (sCity !== null) {
        sCity = JSON.parse(localStorage.getItem("cityname"));
        for (i = 0; i < sCity.length; i++) {
            addToList(sCity[i]);
        }
        city = sCity[i - 1];
        currentWeather(city);
    }

}
function clearHistory(event) {
    event.preventDefault();
    sCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();

}
$("#search-button").on("click", displayWeather);
$(document).on("click", pastSearch);
$(window).on("load", loadlastCity);
$("#clear-history").on("click", clearHistory);