import { prisma } from "../lib/prisma"
import catchAsync from './../utils/catchAsync.js'
import appError from './../utils/appError.js';
export const getAllUsers=catchAsync(async (req, res, next) => {
   const users= await prisma.user.findMany();
  res.status(200).json({
    status: 'success',
    data: users
  });
});
export const getUser=catchAsync(async (req, res, next) => {
  const {id}= req.params;
  if(!id)
    return next(new appError("please provide id!"),404)
   const user= await prisma.user.findUnique({where:{id:id}})
   if(!user)
    return next(new appError("User not found!"),404)
  res.status(200).json({
    status: 'success',
    data: user
  });
});
export const updateUser=catchAsync(async (req, res, next) => {
  const {id}= req.params;
  const updatedData= req.body;
  if(!id || !updatedData)
    return next(new appError("please provide id and data!"),404)
   const founded= await prisma.user.findUnique({where:{id:id}})
   if(!founded)
    return next(new appError("User not found!"),404)
  const user = await prisma.user.update({where:{id:id},
  data:updatedData})
  res.status(200).json({
    status: 'User was updated',
    data: user
  });
});
export const deleteUser=catchAsync(async (req, res, next) => {
const {id}= req.params;
 if(!id)
    return next(new appError("please provide id!"),404)
  const founded= await prisma.user.findUnique({where:{id:id}})
   if(!founded)
    return next(new appError("User not found!"),404)
  const  deletedUser=  await prisma.user.delete({where:{id:id}})
 res.status(200).json({
        status: 'User was deleted',
        data: deletedUser,
    });
})