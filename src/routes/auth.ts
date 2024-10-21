import { Router, Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { userSchema } from '../types/userType';

const router = Router();


router.post('/signup', async (req: Request, res: Response) => {
    const { email, password } = req.body;

  try {

    const valid = userSchema.safeParse(req.body);
    if (!valid.success) {
        return res.status(411).json({
            msg: "invalid inputs",
            errors: valid.error.issues
        });
    }

     // Check for existing user
     const existingUser = await User.findOne({ email });
      if (existingUser) {
       return res.status(400).json({ message: 'User already exists' });
     }
    // Hash the password before creating the user
    const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password

    // Create a new user with the hashed password
    const user = new User({ email, password: hashedPassword });
    await user.save(); // Save the user to the database

     // Generate a token
     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!);

     res.status(201).json({ message: 'User created', token });

  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {

    const valid = userSchema.safeParse(req.body);
    if (!valid.success) {
        return res.status(411).json({
            msg: "invalid inputs",
            errors: valid.error.issues
        });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
