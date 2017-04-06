var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var sendJsonResponse = function(res, status, content){
    res.status(status);
    res.json(content);
}

module.exports.locationsCreate = function(req, res){
    sendJsonResponse(res, 200, {"status": "success"});
}

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