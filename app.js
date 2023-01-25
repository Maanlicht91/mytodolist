//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname +"/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();
app.set ("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set("strictQuery", true);
mongoose.connect("mongodb+srv://root:Aynur882@fruits.wy0fpd1.mongodb.net/todolistDB", { useNewUrlParser: true,
useUnifiedTopology: true}).then (() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
  console.log("Error connecting to MongoDB");
  console.log(err);
});
/* let items = ["Buy Food","Cook Food","Eat Food"];
let workList = [];
 */

const todolistSchema = new mongoose.Schema ({
  name: String
});

const todolistModel = new mongoose.model("todolist", todolistSchema);

const item1 = todolistModel ({
  name: "Welcome to your todolist"
});
const item2 = todolistModel ({
  name: "Hit the + button to add new item"
});
const item3 = todolistModel ({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

//! For route page list
const listSchema = new mongoose.Schema ({
  name: String,
  items: [todolistSchema]
});
const List = new mongoose.model("List", listSchema);


app.get("/", function(req, res){
  
  /*var currentDay = today.getDay()
  var dayList = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var day = dayList[currentDay];  // Another solution */ 

  //for (var i=0; i<=day.length; i++){
    //if (currentDay === i) {
      //  day = day[i];
    //}
  //} <<< was my Solution

  todolistModel.find({}, function(err, foundItems){
    if  (foundItems.length === 0) {
      todolistModel.insertMany (defaultItems, function(err){
        if (err){
          console.log(err);
        } else {
          console.log("Success!");
        }
        res.redirect("/");
      });
    } else {
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
    
  });

  let day = date.getDate();
  

});

//! Route new page
app.get("/:topic", function(req, res){
  const topic = _.capitalize(req.params.topic);
  //? Do not create new one if it already exists
  List.findOne({name:topic}, function(err, foundList){
    if (!err) {
      if (!foundList) {
        //? Create new list
        const list = new List ({
          name: topic,
          items: defaultItems
      
        });
        list.save();
        res.redirect("/" + topic);
      } else {
        //? Show and exist list
        res.render ("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  })
  
});
 

//! Post tasks
app.post("/", function(req,res) {
    const itemName = req.body.addMore

    //? For add tasks to route pages
    const listName = req.body.list;
    
    const item = new todolistModel ({
      name: itemName
    });

    if (listName === "Today") {
      item.save();
      res.redirect("/");
    } else {
      List.findOne({name: listName}, function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+ listName);
      })
    }
    
});

//! Delete tasks 
app.post("/delete", function(req,res) {
  const checkedItemId = req.body.checkbox.trim();
  //? Delete tasks from route pages
  const listName = req.body.listName.trim();
  if (listName === "Today") { 
    todolistModel.findByIdAndRemove(checkedItemId, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Checked");
      }
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId}}}, function(err,foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    } );
  }
  

});

app.get("/about",function(req,res){
  res.render("about");
});

app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
