const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
//mongo database connection
mongoose.connect("mongodb+srv://a345163745:qwe5668875@chat-app.3stgh2x.mongodb.net/todolistDB");

//create item schema 
const itemsSchema = {
    name:String,
};
//create a mongoose model and used the schema to form it
const Item = mongoose.model("Item",itemsSchema);

//create new instance of Item 
const item1 = new Item({
    name:"item1"
})
const item2 = new Item({
    name:"item2"
})
const item3 = new Item({
    name:"item3"
})
const defaultList = [item1,item2,item3];
//List schema
const listSchema = {
    name:String,
    items:[itemsSchema]
};
const List = mongoose.model("List",listSchema);

//use to set up ejs 
app.set("view engine","ejs");

//use to set up bodyParser for collecting form data
app.use(bodyParser.urlencoded({extended:true}))

//serve html, css and js files to backend
app.use(express.static("public"))

const items = [];
const workItems = [];

app.get('/',(req,res)=>{
    //use the find method in mongoose to return the list from todolistDB and display on the frontend
    Item.find({},(err,items)=>{
        if(items.length===0){
            Item.insertMany(defaultList,(err)=>{
                if(err){
                    console.log(err)
                }else{
                    console.log("successfully!")
                }})
                res.redirect('/')
        }else{
            res.render("list",{listTitle:"Today",newItems:items});
        }
    })
})

app.post('/',(req,res)=>{
    //use bodyParser to collect from data and store into a body object 
    const item = req.body.newItem;
    const listName = req.body.list;
    //store item into a new item name 
    const newItem = new Item({
        name:item
        })
    if(listName==="Today"){
    //save it to the mongoDB 
    newItem.save();
    //return to the home page
    res.redirect('/')
    }else{
        List.findOne({name:listName},(err,foundList)=>{
            foundList.items.push(newItem);
            foundList.save();
            res.redirect('/' + listName);
        });
    };
});

app.post('/delete',(req,res)=>{
    const itemID = req.body.checkbox;
    const listName = req.body.listName;
    if(listName==="Today"){
        Item.findByIdAndRemove(itemID,(err)=>{
            if(!err){
                console.log("successfully removed item")
                res.redirect('/')
            }
        })
    }else{
        //this method match the name with listname and remove the item that match the itemID
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemID}}},(err,foundList)=>{
            if(!err){
                res.redirect("/"+ listName)
            }
        })
    }
})


app.get('/:customListName',(req,res)=>{
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName},(err,foundList)=>{
        if(!err){
            if(!foundList){
                const list = new List({
                    name:customListName,
                    items:defaultList
                });
                list.save();
                res.redirect('/'+ customListName);
            }else{
                res.render("list",{listTitle: foundList.name , newItems: foundList.items });
            }
        }
    }) 
})

app.listen(3000,()=>{
    console.log("running on port 3000...")
})