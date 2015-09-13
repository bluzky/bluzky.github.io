$(document).ready(function(){

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
