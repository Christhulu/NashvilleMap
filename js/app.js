var studios = [
        {
            title: 'Jewel Music Studio',
            lat: 36.1251296,
            lng: -86.84930519999999
        },
        {
            title: 'Derik Thomas Music Studio',
            lat: 36.1504274802915,
            lng: -86.8627519197085
        },
        {
            title: 'Music Row',
            lat: 36.1468803,
            lng: -86.7938046
        },
        {
            title: 'RCA Studio B',
            lat: 36.1500354,
            lng: -86.7926952
        },
        {
            title: 'Palette Music Studio Productions (MSP)',
            lat: 36.2050367,
            lng: -86.5170472
        }
    ];

// Global Variables
var map, clientID, clientSecret;

var ViewModel = function() {
	var self = this;
    


    this.searchOption = ko.observable("");
    this.markers = [];

    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    this.populateInfoWindow = function(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;
            // Foursquare API Client
            clientID = "44UU3ZX3UQ0ZCXYHW5GHBQTQJ55QOAXT4FT4WNOTZGJ3QYL4";
            clientSecret = "33LKX1N3SDB3ZUSNGCXIFMG0JGEPFL1LNC3I0ZIIKEYYKOFQ";
            // URL for Foursquare API
            var apiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
                marker.lat + ', ' + marker.lng + '&client_id=' + clientID +
                '&client_secret=' + clientSecret + '&query=' + marker.title +
                '&v=20170801' + '&m=foursquare' + '&limit=1';

            this.title = '<div>' + '<h4 >' + marker.title +
                '</h4>';                
            // Foursquare API
            $.getJSON(apiUrl).done(function(marker) {
                var response = marker.response.venues[0];
                self.street = response.location.formattedAddress[0];
                self.city = response.location.formattedAddress[1];
                self.category = response.categories[0].shortName;
                self.country = response.location.formattedAddress[2];
                //Add content for foursquare to variable
                self.foursquare =
                    '<h5 >(' + self.category +
                    ')</h5>' + '<div>' +
                    '<h6> Address: </h6>' +
                    '<p>' + self.street + '</p>' +
                    '<p>' + self.city + '</p>' +
                    '<p>' + self.country +
                    '</p>' + '</div>' + '</div>';

                    //
                infowindow.setContent(self.title + self.foursquare);
            }).fail(function() {
                // Send alert
                alert(
                    "There was an issue loading the Foursquare API. Please refresh your page to try again."
                );
            });



            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    };

    this.populateAndBounceMarker = function() {
        self.populateInfoWindow(this, self.largeInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1400);
    };

    this.initMap = function() {
        var mapCanvas = document.getElementById('map');
        var mapOptions = {
            center: new google.maps.LatLng(36.2050367, -86.5170472),
            zoom: 11,
            styles: styles
        };
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(mapCanvas, mapOptions);

        // Set InfoWindow
        this.largeInfoWindow = new google.maps.InfoWindow();

        for (var i = 0; i < studios.length; i++) {
            this.markerTitle = studios[i].title;
            this.markerLat = studios[i].lat;
            this.markerLng = studios[i].lng;
            // Google Maps marker setup
            this.marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: this.markerLat,
                    lng: this.markerLng
                },
                title: this.markerTitle,
                lat: this.markerLat,
                lng: this.markerLng,
                id: i,
                animation: google.maps.Animation.DROP
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.populateAndBounceMarker);
        }
    };

    this.initMap();

    // This block appends our locations to a list using data-bind
    // It also serves to make the filter work
    this.studioFilter = ko.computed(function() {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.title.toLowerCase().includes(this.searchOption()
                    .toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);



};

function startApp() {
    ko.applyBindings(new ViewModel());
}

function errorHandling() {
    alert("Google Maps has failed to load. Please check your internet connection and try again.");
}