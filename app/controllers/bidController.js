var common = require('../common/common.js');
var models = require('../models');
var _ = require('underscore');

var Bid = models.bid;

function updateRow(key, value) {
  return Bid.update({position: value}, {where: {id: key}});
}

function buildRowPromises(requestObject) {
  const promises = _.map(requestObject, (value, key) =>
    Promise.resolve().then(() => updateRow(key, value))
  );
  return promises;
}

function vendorPosition(tenderId) {

	Bid.findAll({where: {tenderId: tenderId}, order: ['value'], raw: true}).then(function(bids) {

		if (bids.length) {
			console.log(bids);
		}

		var values = bids.map(bid => bid.value);

		var bidIds = bids.map(bid => bid.id);

		var positions = values.slice().map(value => values.indexOf(value) + 1);

		var bidIdPositions = {}

		bidIds.forEach((bidId, i) => bidIdPositions[bidId] = positions[i]);

		Promise.all(buildRowPromises(bidIdPositions))

	});
}

exports.add_bid = function(req, res) {

	if (req.body.value && req.body.tenderId) {

		bidInfo = {
			value: req.body.value,
			tenderId: req.body.tenderId,
			vendorId: req.user.id,
			position: 1
		}

		Bid.create(bidInfo).then(function(newBid){

			temp = common.ResponseFormat(200, '', []);
			if(newBid) {
				vendorPosition(req.body.tenderId, req.body.value);
				temp.message = 'Successfully created the Bid!';
			}
			else {
				temp.message = 'Unable to create the Bid!';
			}

			res.status(temp.status)
				.json(temp);
		})

	}
	else {   

        temp = common.ResponseFormat(422, 'Missing Parameters!', req.body);
        res.status(temp.status)
            .json(temp);
	}
}