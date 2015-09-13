$(document).ready(function() {

});

google.maps.event.addDomListener(window, 'load', initialize);
var map = undefined;

function initialize() {

    var myCenter = new google.maps.LatLng(51.508742, -0.120850);
    var mapProp = {
        center: myCenter,
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("googleMap"), mapProp);

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
    initAutocomplete();
}

// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.

function initAutocomplete() {

    // Create the search box and link it to the UI element.
    var start_input = document.getElementById('start-address');
    var startSearchBox = new google.maps.places.SearchBox(start_input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(start_input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        startSearchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    startSearchBox.addListener('places_changed', function() {
        var places = startSearchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
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
    map.setZoom(10)
}

function geocodePosition(pos) {
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({
            latLng: pos
        },
        function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                alert(results[0].formatted_address);
                $("#mapErrorMsg").hide(100);
            } else {
                $("#mapErrorMsg").html('Cannot determine address at this location.' + status).show(100);
            }
        }
    );
}
