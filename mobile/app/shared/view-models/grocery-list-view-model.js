var config = require("../../shared/config");
var countdown = require("../../library/countdown");
var observableArrayModule = require("data/observable-array");

function GroceryListViewModel(items) {
	var viewModel = new observableArrayModule.ObservableArray(items);

	viewModel.getList = function() {
		return fetch(config.apiUrl + "items", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
            	"X-User-Id": "12131231"
			}
		})
		.then(handleErrors)
		.then(function(response) {
			return response.json();
		}).then(function(data) {
			data.sort(function(a, b) { return a.expiration_date - b.expiration_date;})
                .forEach(function(item) {
                    item.color_class = _getColorClass(item.expiration_date);
                    item.expiration_string = _getExpirationString(item.expiration_date);
                    viewModel.push(item);
			});
		});
    };

    viewModel.addToList = function(picture) {
        encodedPicture = picture.toBase64String("jpeg", 100);

		return fetch(config.apiUrl + "items", {
			method: "POST",
			body: JSON.stringify({
				image: encodedPicture,
			}),
			headers: {
				"Content-Type": "application/json",
            	"X-User-Id": "12131231"
			}
		})
		.then(handleErrors)
		.then(function(response) {
			return response.json();
		}).then(function(data) {
            console.log("added picture: " + data.name);
            viewModel.empty();
            viewModel.push({
                name: data.name,
                id: data.id,
                expiration_date: data.expiration_date
            });

            console.log(viewModel);

            viewModel.getList();
		});
    };

    viewModel.removeFromList = function(index) {
		return fetch(config.apiUrl + "items/" + viewModel.getItem(index).itemID, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
            	"X-User-Id": "12131231"
			}
		})
		.then(handleErrors)
		.then(function(response) {
			return response.json();
		}).then(function() {
            viewModel.getList();
		});
    };

	viewModel.empty = function() {
		while (viewModel.length) {
			viewModel.pop();
		}
	};

	return viewModel;
}

function handleErrors(response) {
	console.log("error");
	if (!response.ok) {
		console.log(JSON.stringify(response));
		throw Error(response.statusText);
	}
	return response;
}

function _getColorClass(expirationDate) {
	currentTime = new Date().getTime();
	var oneDay = currentTime + 86400000;
	var threeDays = currentTime + 259200000;
	var fiveDays = currentTime + 432000000;

	if (expirationDate < currentTime) {
		return "expired";
	} else if (expirationDate < oneDay) {
		return "under1day";
	} else if (expirationDate < threeDays) {
		return "under3days";
	} else if (expirationDate < fiveDays) {
		return "under5days";
	} else {
		return "above5days";
	}
}

function _getExpirationString(expirationDate) {
	currentTime = new Date().getTime();
	oneDay = currentTime + 86400000;
	sevenDays = currentTime + 604800000;

	if (expirationDate < currentTime) {
		return "Expired";
	} else if (expirationDate < oneDay) {
		var countdownObj = countdown(currentTime, expirationDate, countdown.HOURS);
		return countdownObj.hours + "h";
	} else if (expirationDate < sevenDays) {
		var countdownObj = countdown(currentTime, expirationDate, countdown.DAYS|countdown.HOURS);
		return countdownObj.days + "d " + countdownObj.hours + "h";
	} else {
		var countdownObj = countdown(currentTime, expirationDate, countdown.WEEKS|countdown.DAYS);
		return countdownObj.weeks + "w " + countdownObj.days + "d";
	}
}

module.exports = GroceryListViewModel;
