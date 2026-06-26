import { prisma } from "../lib/prisma"
import catchAsync from './../utils/catchAsync.js'
import appError from './../utils/appError.js';
import bcrypt from "bcryptjs";
export const signup=catchAsync(async(req,res,next)=>{
   
    const {full_name,email,password,confirmPassword}=  req.body;
    if(  !full_name||!email|| !password||!confirmPassword)
      return next(new appError('please provide all information!',400));
    if(password!=confirmPassword)
       return next(new appError('password and confirmPassword  are not equal!',400));
    if (password.length<=7)
      return next(new appError('password is too short!!',400))
    
    const founded=await prisma.user.findUnique({where:{email:email}})
    if(founded)
      return next(new appError('You already have an account', 409));
    const passwordHashed= await bcrypt.hash(password,12);
    const user =await prisma.user.create({
      data:{
        full_name,
        email,
        password_hash:passwordHashed,
      },
    })
    res.status(201).json({
      status:'success'
    })
  })
