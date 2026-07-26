import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID) {
  throw new Error("RAZORPAY_KEY_ID is missing");
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("RAZORPAY_KEY_SECRET is missing");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});