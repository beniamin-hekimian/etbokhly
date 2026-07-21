import { prisma } from "../lib/prisma"
import catchAsync from './../utils/catchAsync.js'
import appError from './../utils/appError.js';
import bcrypt, { compare } from "bcryptjs";
import jwt from "jsonwebtoken"

import { promisify } from "node:util";
const signToken =id=>{
return jwt.sign({id},process.env.JWT_SECRET,{expiresIn: process.env.JWT_EXPIRES_IN})

const signToken = id =>
{
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

}
export const signup = catchAsync(async (req, res, next) =>
{
  const { full_name, email, password, confirmPassword } = req.body;
  if (!full_name || !email || !password || !confirmPassword)
    return next(new appError('please provide all information!', 400));
  if (password != confirmPassword)
    return next(new appError('password and confirmPassword  are not equal!', 400));
  if (password.length <= 7)
    return next(new appError('password is too short!!', 400))

  const founded = await prisma.user.findUnique({ where: { email: email } })
  if (founded)
    return next(new appError('You already have an account', 409));
  const passwordHashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      full_name,
      email,
      password_hash: passwordHashed,
    },
  })
  const token = signToken(user.id);
  res.status(201).json({
    status: 'success',
    token,
    data: { user: user }
  })
})

export const login = catchAsync(async (req, res, next) =>
{
  const { email, password } = req.body
  if (!email || !password)
    return next(new appError('please provide email and password!', 400));
  const user = await prisma.user.findUnique({ where: { email: email } })
  if (!user)
  {

    return next(new appError(`User not found`, 404));
  }
  const checkPassword = await bcrypt.compare(password, user.password_hash);
  if (!checkPassword)
  {
    return next(new appError('incorrect password.Please try again!.', 401));
  }
  const token = signToken(user.id);
  res.status(201).json({
    status: 'success',
    token
  })
})

export const protect = catchAsync(async(req,res,next)=>{
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET)
    const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  ////changed password
  next();
})
