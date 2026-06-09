import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { User } from '../models/User.js';
import { OTP } from '../models/OTP.js';

let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to database (upsert to overwrite previous OTP if user requests again)
    await OTP.findOneAndUpdate(
      { email },
      { email, otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    // Send email without awaiting so the user gets an instant response
    const mailOptions = {
      from: `"Motionbook" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Motionbook Verification Code',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <div style="padding: 10px 0; color: #333333; line-height: 1.6;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello there,</p>
            <p style="font-size: 16px; margin-bottom: 30px;">Please use the following One-Time Password (OTP) to complete your verification process. This code is valid for the next <strong>5 minutes</strong>.</p>
            <div style="text-align: center; margin: 40px 0;">
              <div style="display: inline-block; padding: 15px 40px; font-size: 36px; font-weight: bold; color: #111111; background-color: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 8px; letter-spacing: 8px;">${otp}</div>
            </div>
            <p style="font-size: 14px; color: #666666; text-align: center;">If you didn't request this code, you can safely ignore this email. Someone might have typed their email incorrectly.</p>
          </div>
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #999999;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} Motionbook. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      await getTransporter().sendMail(mailOptions);
      res.status(200).json({ message: 'OTP sent successfully' });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      res.status(500).json({ message: 'Failed to send email. Check SMTP configuration.' });
    }
  } catch (error) {
    console.error('Error in sendOTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: 'OTP expired or not found. Please request a new one.' });
    }
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Delete OTP after successful verification
    await OTP.deleteOne({ email });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};
