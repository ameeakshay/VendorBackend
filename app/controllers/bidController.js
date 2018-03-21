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

function updatePosition(tenderId, BidId, message, res) {

	Bid.findAll({where: {tenderId: tenderId}, order: ['value'], raw: true}).then(function(bids) {

		if (bids.length) {
			console.log(bids);
		}

		var values = bids.map(bid => bid.value);

		var bidIds = bids.map(bid => bid.id);

		var positions = values.slice().map(value => values.indexOf(value) + 1);

		var bidIdPositions = {}

		bidIds.forEach((bidId, i) => bidIdPositions[bidId] = positions[i]);

		Promise.all(buildRowPromises(bidIdPositions)).then(function(updatedBids) {
			Bid.findOne({where: {id: BidId}}).then(function(updatedBid) {

				temp = common.ResponseFormat(200, '', []);

				if (updatedBid) {
					if (message == 'update') {

						updatedBid.decrement(['attemptsRemaining'], {by: 1});

						temp.message = 'Successfully updated Bid ' + updatedBid.id;
					}
					else {
						temp.message = 'Successfully created Bid ' + updatedBid.id;
					}
				}

				res.status(temp.status)
					.json(temp);
			});
		});
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

			if(newBid) {
				updatePosition(req.body.tenderId, newBid.id, 'create', res);
			}
			else {

				temp = common.ResponseFormat(200, 'Unable to create the Bid!', []);
				res.status(temp.status)
					.json(temp);
			}
		})
	}
	else {   

        temp = common.ResponseFormat(422, 'Missing Parameters!', req.body);
        res.status(temp.status)
            .json(temp);
	}
}

exports.update_bid = function(req, res) {

	if (req.body.value && req.body.bidId) {

		Bid.update({value: req.body.value}, {where: {id: req.body.bidId}}).then(function(updated) {

			if(updated) {

				Bid.findById(req.body.bidId, {attributes: ['id', 'tenderId']}).then(function(updatedBid) {

					if (updatedBid) {
						updatePosition(updatedBid.tenderId, updatedBid.id, 'update', res);
					}
				})
			}
			else {

				temp = common.ResponseFormat(200, 'Unable to update the Bid ' + req.body.bidId , []);
				res.status(temp.status)
					.json(temp);
			}
		})
	}
	else {   

        temp = common.ResponseFormat(422, 'Missing Parameters!', req.body);
        res.status(temp.status)
            .json(temp);
	} 
}