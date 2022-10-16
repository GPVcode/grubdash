const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function dishExists(req, res, next){
   const dishId = req.params.dishId;
   res.locals.dishId = dishId;
   const foundDish = dishes.find((dish) => dish.id === dishId);
   if (!foundDish) {
      return next({
         status: 404, 
         message: `Dish not found: ${dishId}` });
   }
   res.locals.dish = foundDish;
};

function dishValidName(req, res, next){
   const { data = null } = req.body;
   res.locals.newDD = data;
   const dishName = data.name;
   if (!dishName || dishName.length === 0) {
      return next({
         status: 400,
         message: "Dish must include a name",
      });
   }
};

function dishHasValidDescription(req, res, next){
   const dishDescription = res.locals.newDD.description;
   if (!dishDescription || dishDescription.length === 0) {
      return next({
         status: 400,
         message: "Dish must include a description",
      });
   }
};

function dishHasValidPrice(req, res, next){
   const dishPrice = res.locals.newDD.price;
   if (!dishPrice || typeof dishPrice != "number" || dishPrice <= 0) {
      return next({
         status: 400,
         message: "Dish must have a price that is an integer greater than 0",
      });
   }
};

function dishHasValidImage(req, res, next){
   const dishImage = res.locals.newDD.image_url;
   if (!dishImage || dishImage.length === 0) {
      return next({
         status: 400,
         message: "Dish must include an image_url",
      });
   }
};

function dishIdMatches(req, res, next){
  const paramId = res.locals.dishId;
  const { id = null } = res.locals.newDD;
  if(paramId != id && id) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${paramId}`,
    });
  }
};



//Clarity Middleware Functions
function createValidation(req, res, next){
   dishValidName(req, res, next);
   dishHasValidDescription(req, res, next);
   dishHasValidPrice(req, res, next);
   dishHasValidImage(req, res, next);
   next();
};

function readValidation(req, res, next){
   dishExists(req, res, next);
   next();
};

function updateValidation(req, res, next){
   dishExists(req, res, next);
   dishValidName(req, res, next);
   dishHasValidDescription(req, res, next);
   dishHasValidPrice(req, res, next);
   dishHasValidImage(req, res, next);
   dishIdMatches(req, res, next);
   next();
};

//Handlers:
function create(req, res) {
   const newDishData = res.locals.newDD;
   newDishData.id = nextId();
   dishes.push(newDishData);
   res.status(201).json({ data: newDishData });
}

function read(req, res) {
   res.status(200).json({ data: res.locals.dish });
}

function update(req, res) {
   const newData = res.locals.newDD;
   const oldData = res.locals.dish;
   const index = dishes.indexOf(oldData);
   for (const key in newData) {
      dishes[index][key] = newData[key];
   }
   res.status(200).json({ data: dishes[index] });
}

function list(req, res) {
   res.status(200).json({ data: dishes });
}

module.exports = {
   create: [createValidation, create],
   read: [readValidation, read],
   update: [updateValidation, update],
   list,
};










