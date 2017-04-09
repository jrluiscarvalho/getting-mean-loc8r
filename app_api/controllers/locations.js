var mongoose = require('mongoose');
var Loc = mongoose.model('Location');
var request = require('request');

var apiOptions = {
    server: "http://localhodt:3000"
};
if(process.env.NODE_ENV === 'production'){
    apiOptions.server = "https://getting-mean-loc8r.herokuapp.com";
}

var requestOptions = {
    url: "http://yourapi.com/api/path",
    method: "GET",
    json:{},
    qs:{
        offset:20
    }
};

request(requestOptions, function(err, response, body){
    if(err){
        console.log(err);
    }else if(response.statusCode === 200){
        console.log(body);
    }else{
        console.log(response.statusCode);
    }
});



var sendJsonResponse = function(res, status, content){
    res.status(status);
    res.json(content);
}

module.exports.locationsCreate = function(req, res){
    Loc.create({
        name: req.body.name,
        address: req.body.address,
        facilities: req.body.facilities.split(","),
        coords: [parseFloat(req.body.lng). parseFloat(req.body.lat)],
        openingTimes: [{
            days: req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1,
        },{
            days: req.body.days2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2,
        }]
    }, function(err, location){
        if(err){
            sendJsonResponse(res, 400, err);
        }else{
            sendJsonResponse(res, 201, location);
        }
    });
};

module.exports.locationsReadOne = function(req, res){
    if(req.params && req.params.locationId){
        Loc
            .findById(req.params.locationId)
            .exec(function(err, location){
                if(!location){
                    sendJsonResponse(res, 404, {
                        "message": "locationid not found"
                    });
                    return;
                }else if (err){
                    sendJsonResponse(res, 404, err);
                    return;
                }
                sendJsonResponse(res, 200, location);
            });
    }else{
        sendJsonResponse(res, 404, {
            "message": "No locationId in request"
        });
    }
};

module.exports.reviewsReadOne = function(req, res){
    if(req.params && req.params.locationId && req.params.reviewId){
        Loc
            .findById(req.params.locationId)
            .select('name reviews')
            .exec(
                function(err, location){
                    var response, review;
                    if(!location){
                        sendJsonResponse(res, 404, {
                            "message":"locationId not found"
                        });
                        return;
                    }else if(err){
                        sendJsonResponse(res, 400, err);
                        return;
                    }
                    if(location.reviews && location.reviews.length > 0){
                        review = location.reviews.id(req.params.reviewId);
                        if(!review){
                            sendJsonResponse(res, 404, {
                                "message": "reviewId not found"
                            });
                        }else{
                            response = {
                                location: {
                                    name: location.name,
                                    id: req.params.locationId
                                },
                                review: review
                            };
                            sendJsonResponse(res, 200, response);
                        }
                    } else{
                        sendJsonResponse(req, 404, {
                            "message": "No reviews found"
                        });
                    }
                }
            );
    }else{
        sendJsonResponse(res, 404, {
            "message":"Not found, locationId and reviewId are both required"
        });
    }
};

module.exports.locationsListByDistance = function(req, res){
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);

    var point = {
        type: "Point",
        coordinates: [lng, lat]
    };
    Loc.geoNear(point, options, callback);
};

module.exports.reviewsCreate = function(req, res){
    var locationId = req.params.locationId;
    if(locationId){
        Loc
            .findById(locationId)
            .select('reviews')
            .exec(
                function(err, location){
                    if(err){
                        sendJsonResponse(res, 400, err);
                    }else{
                        doAddReview(req, res, location);
                    }
                }
            )
    }else{
        sendJsonResponse(res, 404, {
            "message":"Not found, locationId required"
        });
    }
};

var addReview = function(req, res){
    if(!location){
        sendJsonResponse(res, 404, {
            "message":"locationId not found"
        });
    }else{
        location.reviews.push({
            author: req.body.author,
            rating: req.body.rating,
            reviewText: req.body.reviewText
        });

        location.save(function(err, location){
            var thisReview;
            if(err){
                sendJsonResponse(res, 400, err);
            }else{
                thisReview = location.reviews[location.reviews.length - 1];
                sendJsonResponse(res, 201, thisReview);
            }
        });        
    }
};


var updateAverageRating = function(locationId){
    Loc
        .findById(locationId)
        .select('rating, reviews')
        .exec(
            function(err, location){
                if(!err){
                    doSetAverageRating(location);
                }
        });
};

var doSetAverageRating = function(location){
    var i, reviewCount, ratingAverage, ratingTotal;
    if(location.reviews && location.reviews.length > 0){
        reviewCount = location.reviews.length;
        ratingTotal = 0;
        for(i =0; i < reviewCount; i++){
            ratingTotal = ratingTotal + location.reviews[i].rating;
        }
        ratingAverage = parseInt(ratingTotal / reviewCount, 10);
        location.rating = ratingAverage;
        location.save(function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Average rating updated to ", ratingAverage);
            }
        });
    }
};

module.exports.locationUpdateOne = function(req, res){
    if(!req.params.locationId){
        sendJsonResponse(res, 404, {
            "message":"Not Found, locationId is required"
        });
        return;
    }
    Loc
        .findById(req.params.locationId)
        .select('-reviews -rating')
        .exec(function(err, location){
            if(!location){
                sendJsonResponse(res, 404, {
                    "message":"locationid not found"
                });
                return;
            }else if(err){
                sendJsonResponse(res, 400, err);
                return;
            }
            location.name = req.body.name;
            location.address = req.body.address;
            location.facilities = req.body.facilities.split(",");
            location.coords = [parseFloat(req.body.lng),parseFloat(req.body.lat)];
            location.openingTimes = [{
                days: req.body.days1,
                opening: req.body.opening1,
                closing: req.body.closing1,
                closed: req.body.closed1,
            }, {
                days: req.body.days2,
                opening: req.body.opening2,
                closing: req.body.closing2,
                closed: req.body.closed2,
            }];
            location.save(function(err, location){
                if(err){
                    sendJsonResponse(res, 404, err);
                }else{
                    sendJsonResponse(res, 200, location);
                }
            });
        }
    );
};


module.exports.reviewsUpdateOne = function(req, res){
    if(!req.params.locationId || !req.params.reviewId){
        sendJsonResponse(res, 404, {
            "message":"Not found, location and reviewId are both required"
        });
        return;
    }
    Loc
        .findById(req.params.locationId)
        .select('reviews')
        .exec(
            function(err, location){
                var thisReview;
                    if(!location){
                        sendJsonResponse(res, 404, {
                            "message":"locationId not found"
                        });
                        return;
                    }else if(err){
                        sendJsonResponse(res, 400, err);
                        return;
                    }
                    if(location.reviews && location.reviews.length > 0){
                        thisReview = location.reviews.id(req.params.reviewId);
                        if(!thisReview){
                            sendJsonResponse(res, 404, {
                                "message":"reviewId not found"
                            });
                        }else {
                            thisReview.author = req.body.author;
                            thisReview.rating = req.body.rating;
                            thisReview.reviewText = req.body.reviewText;
                            location.save(function(err, location){
                                if(err){
                                    sendJsonResponse(res, 404, err)
                                }else{
                                    updateAverageRating(location._id);
                                    sendJsonResponse(res, 200, thisReview);
                                }
                            });
                        }
                    } else {
                        sendJsonResponse(res, 404, {
                            "message":"No review to update"
                        });
                    }
            }
        );
};

module.exports.locationsDeleteOne = function(req, res){
    var locationId = req.params.locationId;
    if(locationId){
        Loc
            .findByIdAndRemove(locationId)
            .exec(
                function(err, location){
                    if(err){
                        sendJsonResponse(res, 404, err);
                        return;
                    }
                    sendJsonResponse(res, 404, null);
                }
            );
    }else{
        sendJsonResponse(res, 404, {
            "message":"No locationId"
        });
    }
};

module.exports.reviewsDeleteOne = function(req, res){
    if(!req.params.locationId || !req.params.reviewId){
        sendJsonResponse(res, 404, {
            "message":"Not found, locationId amd reviewId are both required"
        });
        return;
    }
    Loc
        .findById(req.params.locationId)
        .select('reviews')
        .exec(
            function(err, location){
                if(!location){
                    sendJsonResponse(res, 404, {
                        "message":"locationId not found"
                    });
                    return;
                }else if (err){
                    sendJsonResponse(res, 400, err);
                    return;
                }
                if(location.reviews && location.reviews.length > 0){
                    if(!location.reviews.id(req.params.reviewId)){
                        sendJsonResponse(res, 404, {
                            "message":"reviewId not found"
                        });
                    }else{
                        location.reviews.id(req.params.reviewId).remove();
                        location.save(function(err){
                            if(err){
                                sendJsonResponse(res, 404, err);
                            }else{
                                updateAverageRating(location._id);
                                sendJsonResponse(res, 204, null);
                            }
                        });
                    }
                }else{
                    sendJsonResponse(res, 404, {
                        "message":"No review to delete"
                    });
                }
            }
        );
};

let renderHomepage = function(req, res, reponseBody){
    res.render('locations-list', {
        'title':'Loc8r - find a place to work with wifi',
        pageHeader:{
            title: 'Loc8r',
            strapline: 'Find places to work with wifi near you!'
        },
        sidebar: "looking for wifi and a seat? loc8r helps you find places to work when out and about",
        locations: responseBody
    });
};

module.exports.homelist = function(req, res){
    let requestOptions, path;
    path = '/api/locations';
    requestOptions = {
        url: apiOptions.server + path,
        method: "GET",
        json: {},
        qs:{
            lng: -0.7992599,
            lat: 51.378091,
            maxDistance: 20
        }
    };
    request(
        requestOptions,
        function(err, response, body){
            renderHomepage(req, res);
        }
    );
}