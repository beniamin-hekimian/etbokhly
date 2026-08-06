/* import { prisma } from "./lib/prisma";

async function main() {
  // Example: Fetch all records from a table
  // Replace 'user' with your actual model name
  const allUsers = await prisma.user.findMany();
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
 */ 
 
import express from 'express'
import userRoute from './routes/userRoute'
import tagRoute from './routes/tagRoute.js'
import mealRoute from './routes/mealRoute.js'
//import orderRoute from './routes/orderRoute.js'
//import { prisma } from "./lib/prisma"
const PORT = process.env.PORT || 3000;

const app= express();
app.use(express.json());
app.use('/user',userRoute)
//app.use('/order',orderRoute);
//app.use('/api/v1/users', userRoute);
//app.use('/api/v1/tags', tagRoute);
app.use('/meal', mealRoute);

app.listen(PORT, () =>
{
    console.log(`server is running on port ${PORT}`);
});
app.use((err, req, res, next) =>
{
	const statusCode = err.statusCode || (err.code === 'P2025' ? 404 : 500);
	const status = err.status || (statusCode >= 500 ? 'error' : 'fail');
	res.status(statusCode).json({
		status,
		message: err.message || 'Internal server error',
	});
});
