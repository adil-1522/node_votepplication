const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware,generateToken} = require('./../jwt');
const Candidate = require('../models/candidate');



router.post('/signup', async(req,res)=>{

    try{
      const data = req.body 
  
    const newUser = new User(data);
  
     const response = await newUser.save();
     console.log('data saved');

     const payload = {
      id: response.id
      
     }
     console.log(JSON.stringify(payload));
     const token = generateToken(payload);
     console.log("Token is saved: ",token);


     res.status(200).json({response: response, token: token});
    }
  
  catch(err){
          console.error(err);
          res.status(500).json({error: 'Internet server error'});
    }
   
  
  });

  router.post('/login', async(req,res)=>{
    try{
      //extract the username and password

      const {aadharCardNumber,password} = req.body;

      //find the user by the username
      const user = await User.findOne({aadharCardNumber: aadharCardNumber});

      //if the user doesnt exist or the password does not match 
      if(!user || !await user.comparePassword(password)){
        return res.status(401).json({error:'Invalid username or password'});
      }

      //generate a Token
      const payload = {
        id: user.id
        
      }
      const token = generateToken(payload);

      //return token as a response
      res.json({token})
    }
    catch(err){
      console.error(err);
      res.status(500).json({error: 'Internal server error'});

    }
  })
  router.get('/profile',jwtAuthMiddleware,async(req,res)=>{
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await User.findbyId(userId);
        res.status(200).json({user});
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
  });


  

  router.put('/person/password',jwtAuthMiddleware, async(req,res)=>{
    try{
    const userId = req.user;
    const {currentPassword,newPassword} = req.body 

    const user = await User.findbyId(userId);

    if( !await user.comparePassword(currentPassword)){
        return res.status(401).json({error:'Invalid username or password'});
      }

    user.password = newPassword;
    
    await user.save();
    

    console.log('password updated');
    res.status(200).json({message: 'Password Updated'});
  }catch(err){
    console.error(err);
    res.status(500).json({error: 'Internal Server error'});


  }
  });

//now you can start the voting
router.post('/vote/:candidateID',jwtAuthMiddleware, async(req,res)=>{

  candidateID = req.params.candidateID;
  userId = req.user.id;

  try{

    const candidate = await Candidate.findById(candidateID);
    if(!candidate){
      return res.status(404).json({message: 'Candidate not found'});
    }

    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({message: 'User not found'});
    }

    if(user.isVoted){
      return res.status(400).json({message: 'User already voted'});
    }

    if(user.role=='admin'){
      return res.status(403).json({message: 'Admin not allowed to vote'});
    }

    candidate.votes.push({user: userId});
    candidate.voteCount++;
    await candidate.save();

    user.isVoted = true;
    await user.save();

    res.status(200).json({message: 'Your Vote recorded successfully'});

  }catch(err){
    console.error(err);
    res.status(500).json({error:"Internal Server Error"});
  }
})

//update vote voteCount

router.get('/vote/count', async (req,res)=>{
  try{
    const candidate = await Candidate.find().sort({voteCount: 'desc'});
    

    const voteRecord = candidate.map((data)=>{
      return{
        party: data.party,
        count: data.voteCount
      }
    });

    res.status(200).json(voteRecord);

  }catch(err){
    console.error(err);
    res.status(500).json({error: 'Internal server error'});
  }
})



// comment added for testing purposes
  module.exports = router;