var dialogsModule = require("ui/dialogs");
var observableModule = require("data/observable");
var viewModule = require("ui/core/view");
var frameModule = require("ui/frame");
var imageModule = require("ui/image");
var cameraModule = require("camera");
var http = require("http")

var socialShare = require("nativescript-social-share");
var swipeDelete = require("../../shared/utils/ios-swipe-delete");
var GroceryListViewModel = require("../../shared/view-models/grocery-list-view-model");

var page;
var groceryList = new GroceryListViewModel([]);
var pageData = new observableModule.Observable({
	grocery: "",
	groceryList: groceryList
});

exports.loaded = function(args) {
	page = args.object;
	if (page.ios) {
		var listView = viewModule.getViewById(page, "groceryList");
		swipeDelete.enable(listView, function(index) {
			groceryList.removeFromList(index);
		});
	}
	page.bindingContext = pageData;
	groceryList.empty();
	pageData.set("isLoading", true);
	groceryList.getList().then(function() {
		pageData.set("isLoading", false);
	});
};

exports.add = function() {
    // Capture a picture with the system camera.
	cameraModule.takePicture({
        width: 250,
        height: 250,
        keepAspectRatio: true
    }).then(function(picture) {
	    console.log("Result is an image source instance");

        // Send to the server.
        groceryList.addToList(picture);
	});
	// Check for empty submission
	/*
	if (pageData.get("grocery").trim() !== "") {
		viewModule.getViewById(page, "grocery").dismissSoftInput();
		groceryList.add(pageData.get("grocery"))
			.catch(function(error) {
				console.log(error);
				dialogsModule.alert({
					message: "An error occurred while adding an item to your list.",
					okButtonText: "OK"
				});
			});

		// Clear the textfield
		pageData.set("grocery", "");
	} else {
		dialogsModule.alert({
			message: "Enter a grocery item",
			okButtonText: "OK"
		});
	} */
};

exports.share = function() {
	var list = [];
	for (var i = 0, size = groceryList.length; i < size ; i++) {
		item = groceryList.getItem(i);
		list.push(item.name + ": " + item.expiration_string);
	}
	var listString = list.join(", ").trim();
	socialShare.shareText(listString);
};

exports.delete = function(args) {
	var item = args.view.bindingContext;
	var index = groceryList.indexOf(item);
	groceryList.delete(index);
};
