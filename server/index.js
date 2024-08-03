
require("dotenv").config();
const config=require("./config.json");
const mongoose= require("mongoose");


mongoose.connect(config.ConnectionString);


const User=require("./models/user.model");
const Note=require("./models/note.model")

const express= require("express");
const bodyParser=require("body-parser");
const cors=require("cors")
const jwt = require("jsonwebtoken")
const {authendicateTocken} =require("./utilities")

const app=express();




app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
}));

app.get("/",(req,res)=>{
    res.json({data:"hello"})
});


//Sign up
app.post("/create-account",async(req,res)=>{

    const{fullName , email, password}=req.body;

    if(!fullName){
      return res
      .status(400)
      .json({error: true, message:"Full Name is required"});
    }
  
    if(!email){
      return res.status(400).json({error: true, message:"Email is required"});
    }
   

    if(!password){
      return res.status(400).json({error: true, message:"Password is required"});
    }

    const isUser= await User.findOne({email:email});

    if(isUser){
      return res.json({
        error:true,
        message:"User alredy exist",
      })
    }

    const user = new User({
      fullName,
      email,
      password,
    })

    await user.save();
    
    const accessToken =jwt.sign({user},process.env.ACCESS_TOKEN_SECRECT,{
      expiresIn:"36000m",
    });


    return res.json({
      error:false,
      user,
      accessTocken,
      message:"Registration Successful"
    });

})

// Login
app.post("/login", async (req,res)=>{
  const {email,password}= req.body

  if(!email){
    return res.status(400).json({message:"Email is required"});
  }
  if(!password){
    return res.status(400).json({message:"Password is required"});
  }
   const userInfo= await User.findOne({email:email});

   if(!userInfo){
    return res.status(400).json({message:"User not found"})
   }

   if(userInfo.email == email && userInfo.password == password){
    const user ={user: userInfo}
    const accessTocken=jwt.sign(user,process.env.ACCESS_TOKEN_SECRECT,{
      expiresIn:"36000m",
    })
    return res.json({
      error:false,
      message:"Login Succesful",
      email,
      accessTocken,
    })
   }else{
    return res.status(400).json({
      error:true,
      message:"Invalid Credentials",
    })
   }

})

//get User
app.get("/get-user",authendicateTocken,async (req,res)=>{
  const {user}=req.user

  const isUser= await User.findOne({_id:user._id})

  if(!isUser){
     return res.sendStatus(401);
  }
  return res.json({
    user:{
      fullName:isUser.fullName,
      email:isUser.email,
      _id:isUser._id,
      createdOn:isUser.createdOn
    },
    message:""
  })

})

//Add note
app.post("/add-note", authendicateTocken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;  

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }
  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note added successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

//Edit Note
app.put("/edit-note/:noteId", authendicateTocken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;
 
  if (!title && !content && !tags && typeof isPinned === 'undefined') {
    return res.status(400).json({ error: true, message: "No changes provided" });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

//Get all Notes
app.get("/get-all-notes",authendicateTocken,async(req,res)=>{
  const {user}=req.user;
  try{
    const notes= await Note.find({userId:user._id}).sort({isPinned:-1});
    return res.json({
      error:false,
      notes,
      message:"All notes retrived Succesfully"
    })
  } catch(error){
    return res.status(500).json({
      error:true,
      message:"Internal Server Error "
    })
  }
})


// DELETE route to delete a note
app.delete("/delete-note/:noteId", authendicateTocken, async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    await Note.deleteOne({ _id: noteId, userId: user._id });

    return res.json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

// updated isPinned value 
app.put("/update-note-pinned/:noteId", authendicateTocken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });

    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    // Update the isPinned status only if it is explicitly provided
    if (typeof isPinned !== 'undefined') {
      note.isPinned = isPinned;
    }

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});

function escapeRegex(text) {
  return text.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}



app.get("/search-notes/", authendicateTocken, async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: true, message: "Search query is required" });
  }

  try {
    // Sanitize and escape the query string for regex
    function escapeRegex(text) {
      return text.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    }

    const regex = new RegExp(escapeRegex(query), "i");
    console.log('Regex:', regex);

    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: regex } },
        { content: { $regex: regex } }
      ]
    });

    console.log('Matching Notes:', matchingNotes);

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});



app.listen(3001,()=>{
    console.log("server is running")
})


module.exports = app;