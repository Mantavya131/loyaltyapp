/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS,
    },
  };
  
  export default nextConfig;