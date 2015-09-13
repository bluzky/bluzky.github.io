$(document).ready(function() {

});

google.maps.event.addDomListener(window, 'load', initialize);
var map = undefined;
var startInfo = undefined;
var startMarker = undefined;
var endInfo = undefined;
var endMarker = undefined;
var directionsService = undefined;
var directionsDisplay = undefined;
var startIcon = "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|8CC152";

function initialize() {

    var myCenter = new google.maps.LatLng(51.508742, -0.120850);
    var mapProp = {
        center: myCenter,
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });
    directionsDisplay.setMap(map);

    // var marker = new google.maps.Marker({
    //     position: myCenter,
    //     draggable: true,
    //     animation: google.maps.Animation.DROP,
    // });
    //
    // var endPoint = new google.maps.Marker({
    //
    // })

    // marker.setMap(map);

    // var infowindow = new google.maps.InfoWindow({
    //     content: "<b>Hello World!</b>"
    // });
    //
    // infowindow.open(map, marker);
    // google.maps.event.addListener(marker, 'click', function() {
    //     infowindow.open(map, marker);
    // });
    //
    // google.maps.event.addListener(marker, 'dragend', function() {
    //     geocodePosition(marker.getPosition());
    // });



    getUserLocation();
    initStartPointSearchBox();
    initEndPointSearchBox();
}

// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

function initStartPointSearchBox() {

    // Create the search box and link it to the UI element.
    var start_input = document.getElementById('start-address');
    var startSearchBox = new google.maps.places.SearchBox(start_input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(start_input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        startSearchBox.setBounds(map.getBounds());
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    startSearchBox.addListener('places_changed', function() {
        var places = startSearchBox.getPlaces();

        if (places.length == 0) {
            return;
        }
        if (startMarker)
            startMarker.setMap(null);

        // For each place, get the icon, name and location.
        places.forEach(function(place) {

            // Create a marker for each place.
            startMarker = new google.maps.Marker({
                map: map,
                title: place.name,
                draggable: true,
                animation: google.maps.Animation.DROP,
                position: place.geometry.location,
                icon: startIcon
            });

            startInfo = new google.maps.InfoWindow({
                content: place.name
            });
            startInfo.open(map, startMarker);
            google.maps.event.addListener(startMarker, 'click', function() {
                startInfo.open(map, startMarker);
            });
        });

        google.maps.event.addListener(startMarker, 'dragend', function() {
            geocodePosition(startMarker, startInfo);
        });

        calculateAndDisplayRoute(directionsService, directionsDisplay);
    });
}

function initEndPointSearchBox() {

    // Create the search box and link it to the UI element.
    var end_input = document.getElementById('destination-address');
    var desSearchBox = new google.maps.places.SearchBox(end_input);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(end_input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        desSearchBox.setBounds(map.getBounds());
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    desSearchBox.addListener('places_changed', function() {
        var places = desSearchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        if (endMarker)
            endMarker.setMap()
            // For each place, get the icon, name and location.
        places.forEach(function(place) {
                // Create a marker for each place.
            endMarker = new google.maps.Marker({
                map: map,
                animation: google.maps.Animation.DROP,
                draggable: true,
                title: place.name,
                position: place.geometry.location,
            });

            endInfo = new google.maps.InfoWindow({
                content: place.name
            });
            endInfo.open(map, endMarker);
            google.maps.event.addListener(endMarker, 'click', function() {
                endInfo.open(map, endMarker);
            });
        });

        google.maps.event.addListener(endMarker, 'dragend', function() {
            geocodePosition(endMarker, endInfo);
        });

        calculateAndDisplayRoute(directionsService, directionsDisplay);
    });
}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    map.setCenter(new google.maps.LatLng(lat, lng));
    map.setZoom(13)
}

function geocodePosition(marker, infowindow) {
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({
            latLng: marker.getPosition()
        },
        function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                infowindow.setContent(results[0].formatted_address);
                calculateAndDisplayRoute(directionsService, directionsDisplay);
            } else {
                $("#mapErrorMsg").html('Cannot determine address at this location.' + status).show(100);
            }
        }
    );
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {

    if(startMarker == undefined || endMarker == undefined)
        return

    directionsService.route({
        origin: startMarker.position,
        destination: endMarker.position,
        travelMode: google.maps.TravelMode.DRIVING
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}
