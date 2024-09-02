const generateOTP = () => {
  const min = 2000;
  const max = 9000;
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  return otp;
};

export default generateOTP;
