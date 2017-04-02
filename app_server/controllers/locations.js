module.exports.homelist = function(req, res){
    res.render('locations-list', {
        title:'Loc8r - find a place to work with wifi',
        pageHeader: {
            title: 'Loc8r',
            strapline: 'Find places to work with wifi near you!!!'
        },
        locations: [{
            name: 'Starcups',
            address: '125 High Street ',
            rating: 5,
            facilities: ['Hot Drinks', 'Food', 'Premium wifi'],
            distance:'100m'
        },{
            name: 'Cafe Hero',
            address: '125 High Street ',
            rating: 3,
            facilities: ['Hot Drinks', 'Food', 'Premium wifi'],
            distance:'100m'
        },{
            name: 'Burguer Queen',
            address: '125 High Street ',
            rating: 4,
            facilities: ['Hot Drinks', 'Food', 'Premium wifi'],
            distance:'100m'
        }]
    });
}

module.exports.locationInfo = function(req, res){
    res.render('location-info', {title:'Location Info'});
}

module.exports.addReview = function(req, res){
    res.render('location-review-form', {title:'Add review'});
}