const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware,generateToken} = require('../jwt');
const Candidate = require('../models/candidate');


const checkAdminRole = async (userID ) =>{
    try{
        const user = await User.findById(userID);
        if(user.role==='admin'){
          return true;
        }
    }catch(err){
        return false;
    }
}

router.post('/',jwtAuthMiddleware, async(req,res)=>{

    try{
        if(! await checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'user has no admin role'});
        }
      const data = req.body 
  
    const newCandidate = new Candidate(data);
  
     const response = await newCandidate.save();
     console.log('data saved');

     const payload = {
      id: response.id
      
     }
     console.log(JSON.stringify(payload));
     const token = generateToken(payload);
     console.log("Token is saved: ",token);


     res.status(200).json({response: response});
    }
  
  catch(err){
          console.error(err);
          res.status(500).json({error: 'Internet server error'});
    }
   
  
  });

  router.put('/:candidateID',jwtAuthMiddleware, async(req,res)=>{
    try{

        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'user has no admin role'});
        }


   const candidateID = req.params.candidateID;
    const updatedCandidatedata = req.body;

    const response = await User.findByIdAndUpdate(candidateID,updatedCandidatedata,{
      new: true,
      runValidators:true,
    })

    if(!response){
      return res.status(404).json({error:'Candidate Not found'});
    }

    console.log('candidate data updated');
    res.status(200).json(response);
  }catch(err){
    console.error(err);
    res.status(500).json({error: 'Internal Server error'});


  }
  });



  router.delete('/:candidateID',jwtAuthMiddleware, async(req,res)=>{
    try{

        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({message: 'user has no admin role'});
        }


   const candidateID = req.params.candidateID;


    const response = await User.findByIdAndDelete(candidateID)

    if(!response){
      return res.status(404).json({error:'Candidate Not found'});
    }

    console.log('candidate deleted');
    res.status(200).json(response);
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

// users can see all the candidate list

router.get('/candidates', async (req,res)=>{
  try{

    const candidates = await Candidate.find({},'name party - _id');
    res.status(200).json(candidates);

  }catch(err){
    console.log(err);
    res.status(200).json({error: "Internal server error"});
  }
})





// comment added for testing purposes
  module.exports = router;