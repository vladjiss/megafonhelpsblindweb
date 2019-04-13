var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var express = require("express");
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var upload = multer();
var app = express();
var url = 'mongodb://localhost:27017/myproject';
var counter = 0;
app.use(express.static(__dirname + '/'));
mongoose.Promise = global.Promise;

function makePromocode() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

var carDataSchema = new Schema({
	event_type: {
		type: String
	},
	lat: {
		type: Number
	},
	lng: {
		type: Number
	},
	course: {
		type: Number
	},
	fuel_level: {
		type: Number
	},
	vin: {
		type: String
	},
	odometer: {
		type: Number	
	},
	coolant_temp: {
		type: Number
	},
	engine_oil_pressure: {
		type: Number
	},
	coolant_level_low: {
		type: Boolean
	},
	generator_malfunction: {
		type: Boolean
	},
	break_fluid_low_level: {
		type: Boolean
	},
	airbag_fired: {
		type: Boolean
	},
	onboard_power_voltage: {
		type: Number
	},
	max_rpm: {
		type: Number
	},
	trip_time: {
		type: Number
	},
	time: {
		type: String
	},
	ignition_status: {
		type: Boolean
	}
})

var placeSchema = new Schema({
	partner_id: {
		type: String
	},
	lat: {
		type: Number
	},
	lng: {
		type: Number
	},
	address: {
		type: String
	},
	title: {
		type: String
	},
	phone: {
		type: String
	},
	type: {
		type: String
	},
	sale: {
		type: Number
	},
	share_text: {
		type: String
	},
	approved: {
		type: Boolean
		
	}
});

var partnerSchema = new Schema({
	title: {
		type: String
	},
	tax: {
		type: Number
	},
	my_id: {
		type: Number
	}
});

var parkSchema = new Schema({
	title: {
		type: String
	},
	tax: {
		type: Number
	}
});

var  driverSchema = new Schema({
	park_id: {
		type: String
	},
	name: {
		type: String
	},
	vin: {
		type: String
	},
	promocode: {
		type: String
	}
});

var transactionSchema = new Schema({
	promocode: {
		type: String
	},
	sum: {
		type: Number
	},
	place_id: {
		type: String
	}
});

mongoose.connect(url);

var carData = mongoose.model("carData", carDataSchema);
var place = mongoose.model("place", placeSchema);
var park = mongoose.model("park", parkSchema);
var partner = mongoose.model("partner", partnerSchema);
var driver = mongoose.model("driver", driverSchema);
var transaction = mongoose.model("transaction", transactionSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 
	extended: true
})); 


app.get('/login',function(req,res){
  res.sendFile('/Users/danreegly/Downloads/GAZ/login.html');
});


app.get('/clearCounter', function(req, res){
	counter = 0;
	res.send("OK");
});

app.post('/addTransaction', function(req, res){
	let curTransaction = new transaction({
		promocode: req.body.promocode,
		sum: req.body.sum,
		place_id: req.body.place_id
	});
	
	transaction.create(curTransaction, function(err, data){
		res.send("OK");
	});
});

app.get('/getDriversByParkId', function(req, res){
	res.setHeader('Access-Control-Allow-Origin', '*');
	drivers.find({park_id: req.body.park_id}, function(err, data){
		res.send(data);
	});
});

app.get('/getPromocodeByDriverId', function(req, res){
	res.setHeader('Access-Control-Allow-Origin', '*');
	driver.find({promocode: req.body.promocode}, function(err, data){
		res.send(data);
	});
});

app.post('/addDriver', function(req, res){
	let curDriver = new driver({
		park_id: req.body.park_id,
		name: req.body.name,
		vin: req.body.vin,
		promocode: makePromocode()
	});
	
	park.findByIdAndUpdate(id, {$push: {drivers: curDriver}}, function(err, data){
		if(err) return console.log(err);
		
		res.send("OK");
	});
});

app.post('/addPark', function(req, res){
	let curPark = new park({
		title: req.body.title,
		tax: req.body.tax
	});
	
	park.create(curPark, function(err, doc){
		if(err) return console.log(err);	     
    console.log("Сохранен объект user", doc);
	
	res.send("OK");
	});
});

app.post('/approvePlace', function(req, res){
	place.findByIdAndUpdate(req.query.id, {approved: true}, function(err, data){
		if(err) return console.log(err);
		
		res.send("OK");
	});
});

app.get('/getPlacesByPartnerId', function(req,res){
	place.find({partner_id: req.query.id}, function(err, data){
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.send({
			places: data
		});
	});
});

app.get('/getPlacesInRadius', function(req, res){
	let res_array = [];
	
	place.find({}, function(err, data){
		data.forEach(function(data_item){
			if (Math.sqrt(Math.pow(data_item.lat - req.query.lat, 2) * 111,2 + Math.pow(data_item.lng - req.query.lng, 2) * 62.58) < req.query.radius) {
				res_array.push(data_item);
			}
		});
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.send({
			places: res_array
		});
	});
});

app.post('/addPlace', function(req, res){
	let curPlace = new place({
		partner_id: req.body.partner_id,
		lat: req.body.lat,
		lng: req.body.lng,
		address: req.body.address,
		title: req.body.title,
		phone: req.body.phone,
		type: req.body.type,
		sale: req.body.sale,
		share_text: req.body.share_text,
		approved: false,
	});
	
	place.create(curPlace, function(err, doc){
		if(err) return console.log(err);	     
    console.log("Сохранен объект user", doc);
	
	res.send("OK");
	});
});

app.get('/getCarData', function(req, res){
	carData.find({vin: req.query.vin}, function(err, data){
		console.log(data);
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.send(data[counter++]);
	});
});

app.post('/addCarData', function(req, res){
	let curCarData = new carData({
		event_type: req.body.event_type,
		lat: req.body.lat,
		lng: req.body.lng,
		course: req.body.course,
		fuel_level: req.body.fuel_level,
		vin: req.body.vin,
		odometer: req.body.odometer,
		coolant_temp: req.body.coolant_temp,
		engine_oil_pressure: req.body.engine_oil_pressure,
		coolant_level_low: req.body.coolant_level_low,
		generator_malfunction: req.body.generator_malfunction,
		break_fluid_low_level: req.body.break_fluid_low_level,
		onboard_power_voltage: req.body.onboard_power_voltage,
		max_rpm: req.body.max_rpm,
		time: req.body.time,
	    trip_time: 0
	});
	//TODO - time_trip
	/*if (event_type == 'IGNITION_ON') {
		curCarData.ignition_status = 1;
	} else if (event_type == 'IGNITION_OFF') {
		curCarData.ignition_status = 0;
	}*/
	
	//carData.findOne({curCarData.vin}, {}, {sort: {'created_at': -1}}, function(err, data));
	
	carData.create(curCarData, function(err, doc){
		if(err) return console.log(err);	     
    console.log("Сохранен объект user", doc);
	
	res.send("OK");
	});
});

app.listen(3000);