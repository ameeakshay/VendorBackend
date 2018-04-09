var common = require('../common/common.js');
var models = require('../models');
var _ = require('underscore');
var Sequelize = require('sequelize');

const Op = Sequelize.Op;
var Bid = models.bid;

function validateBidValue(newValue, topValue){

	console.log('newValue' + newValue)
	console.log('topValue' + topValue)
	console.log((topValue - topValue * 0.1))

	if (newValue < (topValue - topValue * 0.1)) {
		console.log('Disallowed')
		return false
	}
	return true
}

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

				temp = common.ResponseFormat(200, '', {});

				if (updatedBid) {
					if (message == 'update') {

						temp.message = 'Successfully updated Bid ' + updatedBid.id;
					}
					else {
						temp.message = 'Successfully created Bid ' + updatedBid.id;
					}
				
					temp.data = updatedBid;
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

				temp = common.ResponseFormat(200, 'Unable to create the Bid!', {});
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

	if (req.body.value && req.body.bidId && req.body.tenderId) {

		Bid.findAll({where: {tenderId: req.body.tenderId}, order: ['value'], limit: 1, raw: true}).then(function(maxValueBid) {

			if (maxValueBid && validateBidValue(req.body.value, maxValueBid[0].value)) {
				Bid.update({value: req.body.value}, {where: {id: req.body.bidId, attemptsRemaining: {[Op.gte]: 1}}}).then(function(updated) {

					if(updated[0] != 0) {

						Bid.findById(req.body.bidId, {attributes: ['id', 'tenderId']}).then(function(updatedBid) {

							if (updatedBid) {

								updatedBid.decrement(['attemptsRemaining'], {by: 1});
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
				temp = common.ResponseFormat(200, 'Bid Value is lesser than 10 Percent of the lowest Bid.', [])
				res.status(temp.status)
					.json(temp);
			}
		});
	}
	else {   

        temp = common.ResponseFormat(422, 'Missing Parameters!', req.body);
        res.status(temp.status)
            .json(temp);
	} 
}

exports.get_bids = function(req, res) {

	if (req.params.status) {
		
		Bid.findAll({where: {vendorId: req.user.id}, 
			include: [{
				model: models.tender,
				where: {status: req.params.status}}]
		}).then(function(bids) {

			temp = common.ResponseFormat(200, '', {});

			if (bids.length) {
				temp.message = 'All bids for Vendor ' + req.user.id;
				temp.data = bids;
			}
			else {
				temp.message = 'No bids associated with Vendor ' + req.user.id;
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

exports.get_bid = function(req, res) {

	if (req.params.bidId) {

		Bid.findById(req.params.bidId, 
			{include: [{
				model: models.tender,
				include: [{model: models.sub_category}]
			}]
		}).then(function(bid) {
			temp = common.ResponseFormat(200, '', {});

			if (bid) {
				temp.message = 'Found the Bid ' + req.params.bidId;
				temp.data = bid;
			}
			else {
				temp.message = 'Unable to find the Bid';
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