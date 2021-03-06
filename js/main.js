(function () {

    var today = new Date(),
        sun = document.getElementById("circle"),
        htmlElement = document.getElementById("html-element"),
        apiAnswer,
        presentationText = '',
        googleApiAnswer;

    // Initializes the application
    function init() {

        // Prompt user for location service.
        navigator.geolocation.getCurrentPosition( geolocationSuccess, geolocationError );

    }

    /**
     * Callback function if getting the location was successful
     *
     * @param object position
     *
     */
    function geolocationSuccess( pos ) {

        var crd = pos.coords,
            request = new XMLHttpRequest();

        // Do GET request towards sunset API, call function sunsetListener when data is loaded
        // This is to get time of sunset
        request.addEventListener("load", function () {
            sunsetListener(this, crd);
        }, false);
        request.open("GET", "http://api.sunrise-sunset.org/json?lat=" + crd.latitude + "&lng=" + crd.longitude + "&date=today");
        request.send();

    }

    /**
     * Callback function for when getting the location was not successful
     *
     */
    function geolocationError() {
        alert("You have to give permission to access your location if you want this website to work.");
    }

    /**
     * Callback function when data from sunrise-sunset API is loaded
     *
     * @param object response (the data recieved from the GET request to sunrise-sunset API),
     * @param object crd (coordinates of user)
     *
     */
    function sunsetListener(response, crd) {

        var requestGoogle = new XMLHttpRequest; // Used to call GET from Google

        // Parse response data from sunrise-sunset to JSON object
        apiAnswer = JSON.parse(response.responseText);

        // Do GET request towards Google API, call function googleListener when data is loaded
        // This is to get address/specified location of user
        requestGoogle.addEventListener("load", googleListener);
        requestGoogle.open("GET", "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + crd.latitude + "," + crd.longitude + "&sensor=true");
        requestGoogle.send();

    }

    /**
     * Callback function when data from Google API is loaded
     *
     */
     function googleListener() {

        // Parse response data from Google to JSON Object
        googleApiAnswer = JSON.parse(this.responseText);

        // Both API results are in global variables, call the formatting function
        formatOutputStrings();
    };

    /**
     * Format the API results in to strings to be displayed for user
     * Using global variables googleApiAnswer and apiAnswer
     *
     */
     function formatOutputStrings() {
        var now = new Date(),
            nowString = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds(),
            timeInMinutes,
            amOrPm,
            timezoneOffset = today.getTimezoneOffset(),
            timezoneAsString,
            hours,
            minutes,
            timeForOutput;

        // Get formatted adress in response from Google
        googleApiAnswer = googleApiAnswer.results[2].formatted_address;

        // Time of sunset, format 00:00:00 AM/PM
        apiAnswer = apiAnswer.results.sunset;

        // Save either string "AM" or "PM" from api answer
        amOrPm = apiAnswer.substr(apiAnswer.length - 2);

        if( nowString > convertTo24Hour(apiAnswer) ) {

            // Add classes to elements to do css animations
            sun.className = "do-move-up";
            htmlElement.className = "do-sunrise-color-fade";
            presentationText = "The sun will rise ";

        } else {

            // Add classes to elements to do css animations
            sun.className = "do-move-down";
            htmlElement.className = "do-sunset-color-fade";
            presentationText = "The sun will set ";

        }

        // Remove last three characters (space and AM or PM)
        apiAnswer = apiAnswer.substring(0, apiAnswer.length - 3);

        // Make api answer in to array and add the hours and minutes together in form of minutes
        apiAnswer = apiAnswer.split(":");

        // If the seconds are greater than 30, round up an extra minute
        if (parseInt(apiAnswer[2]) > 29) {
            apiAnswer[1] = parseInt(apiAnswer[1]) + 1;
        }

        // Get the total amount of minutes of time given from API
        timeInMinutes = parseInt(apiAnswer[0] * 60) + parseInt(apiAnswer[1]);

        // If api answer was PM, add 720 minutes (12 hours) to timeInMinutes
        if (amOrPm === "PM") {
            timeInMinutes = timeInMinutes + 720;
        }

        // Adjust time in minutes with timezone
        if (timezoneOffset > 0) {
            // Subtract the negative timezone offset
            timeInMinutes -= timezoneOffset;
        }
        else if (timezoneOffset < 0) {
            // Timezone ahead of UTC is given as a negative int
            // First make it in to string, then remove subtraction char, then make it back to int
            timezoneAsString = String(timezoneOffset);
            timezoneAsString = timezoneAsString.substring(1, timezoneAsString.length);
            timezoneOffset = parseInt(timezoneAsString);

            // Add the positive timezone offset to the time in minutes
            timeInMinutes += timezoneOffset;
        }

        // Convert timeInMinutes back to 12 hour clock
        hours = parseInt(timeInMinutes / 60);
        minutes = timeInMinutes - (hours * 60);

        // To make sure minutes are always displayed as two characters :00-style
        if (minutes < 10) {
            minutes = "0" + String(minutes);
        }

        // Adjust to 12 hour clock, make it in to string for output
        if (hours > 12) {
            hours = hours - 12;

            timeForOutput = hours + ":" + minutes + " PM";
        }
        else {
            timeForOutput = hours + ":" + minutes + " AM";
        }

        displaySunsetTimeLocation(timeForOutput, googleApiAnswer);
    };

    /**
     * Change elements to display the time and location in the proper formats
     *
     * @param time string
     * @param location string
     *
     */
     function displaySunsetTimeLocation(time, location) {
        var textContainer = document.getElementById("text-in-box"),
            timeParagraph = document.getElementById("loader-and-result"),
            locationParagraph = document.getElementById("city-country");

        textContainer.textContent =presentationText;
        timeParagraph.textContent = time;
        locationParagraph.textContent = location;
    };

    function convertTo24Hour(time) {
        var hours = parseInt(time.substr(0, 2));
        if(time.indexOf('AM') != -1 && hours == 12) {
            time = time.replace('12', '0');
        }
        if(time.indexOf('PM')  != -1 && hours < 12) {
            time = time.replace(hours, (hours + 12));
        }
        return time.replace(/(AM|PM)/, '');
    }

    init();

})();