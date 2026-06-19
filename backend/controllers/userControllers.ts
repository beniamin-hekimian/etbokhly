/*export const login = (req, res) => {
    let user =req.body;

    res.status(201).json(user);
}*/
//import { prisma } from '../prisma';
/*
export const createUser = async (req, res) => {
  const { full_name, email, password } = req.body;

  const user = await prisma.user.create({
    data: {
      full_name,
      email,
      password
    }
  });

  res.status(201).json(user);
};*/
import { prisma } from "../lib/prisma";

export const createUser = async (req, res) => {
  try {
    const { full_name, email, password ,role } = req.body;
    console.log(req.body);
    const user = await prisma.user.create({
      data: {
        full_name,
        email,
        password,
        role
      },
    });
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error" });
  }
};