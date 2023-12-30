const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const twilio = require('twilio');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const logger = require('../config/logger');

const accountSid = 'AC6d6015319a234e1add4678f8f38e93f1';
const authToken = 'd0c14874af429bcb78dc244016484cbd';
const client = twilio(accountSid, authToken);
const smsKey = 'ethosms';
const twilioNum = '+13613493203';

const JWT_AUTH_TOKEN = 'JWT_AUTH_TOKEN';
const JWT_REFRESH_TOKEN = 'JWT_REFRESH_TOKEN';

const refreshTokensArr = [];

const register = catchAsync(async (req, res) => {
  console.log(req.body, 'req.body');
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login2 = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Retrieve user from the database
  const user = await authService.loginUserWithEmailAndPassword(email, password);

  if (user) {
    logger.debug('User confirmed');

    const accessToken = jwt.sign({ data: { email, id: user._id } }, JWT_AUTH_TOKEN, { expiresIn: '1y' });
    const refreshToken = jwt.sign({ data: { email, id: user._id } }, JWT_REFRESH_TOKEN, { expiresIn: '1y' });
    // Generate new JWT tokens
    // Set cookies with tokens
    res.cookie('accessToken', accessToken, {
      expires: new Date(new Date().getTime() + 31557600000), // 1 year    httpOnly: true,
      httpOnly: true,
      secure: false,
      SameSite: 'lax',
    });

    res.cookie('refreshToken', refreshToken, {
      expires: new Date(new Date().getTime() + 31557600000), // 1 year
      httpOnly: true,
      secure: false,
      SameSite: 'lax',
    });

    res.cookie('authSession', true, {
      expires: new Date(new Date().getTime() + 30 * 1000),
      httpOnly: true,
      secure: false,
      SameSite: 'lax',
    });
    res.cookie('refreshTokenID', true, {
      expires: new Date(new Date().getTime() + 31557600000), // 1 year
      httpOnly: true,
      secure: false,
      SameSite: 'lax',
    });

    res.status(202).send({ user, msg: 'Device verified' });
  } else {
    logger.debug('Not authenticated');
    return res.status(400).send({ verification: false, msg: 'Incorrect OTP' });
  }
});

const login = catchAsync(async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  const ttl = 2 * 60 * 1000;
  const expires = Date.now() + ttl;
  const data = `${phone}.${otp}.${expires}`;
  const hash = crypto.createHmac('sha256', smsKey).update(data).digest('hex');
  const fullHash = `${hash}.${expires}`;

  client.messages
    .create({
      body: `Your One Time Login Password For LOSFOUND is ${otp}`,
      from: twilioNum,
      to: phone,
    })
    .then((messages) => logger.debug(messages))
    .catch((err) => logger.error(err));
  await userService.createUserWithPhone(phone);
  res.status(200).send({ phone, hash: fullHash, otp }); // this bypass otp via api only for development instead hitting twilio api all the time
  // res.status(200).send({ phone, hash: fullHash }); // Use this way in Production
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyOTP = catchAsync(async (req, res) => {
  const { phone, hash, otp } = req.body;
  const [hashValue, expires] = hash.split('.');

  const now = Date.now();
  if (now > Number(expires)) {
    return res.status(504).send({ msg: 'Timeout. Please try again' });
  }
  const user = await userService.getUserByPhone(phone);

  const data = `${phone}.${otp}.${expires}`;
  const newCalculatedHash = crypto.createHmac('sha256', smsKey).update(data).digest('hex');
  if (newCalculatedHash === hashValue) {
    logger.debug('user confirmed');
    const accessToken = jwt.sign({ data: { phone, id: user._id } }, JWT_AUTH_TOKEN, { expiresIn: '1y' });
    const refreshToken = jwt.sign({ data: { phone, id: user._id } }, JWT_REFRESH_TOKEN, { expiresIn: '1y' });
    refreshTokensArr.push(refreshToken);
    res
      .status(202)
      .cookie('accessToken', accessToken, {
        expires: new Date(new Date().getTime() + 31557600000),
        secure: true,
        httpOnly: true,
      })
      .cookie('refreshToken', refreshToken, {
        expires: new Date(new Date().getTime() + 31557600000),
        secure: true,
        httpOnly: true,
      })
      .cookie('authSession', true, { expires: new Date(new Date().getTime() + 30 * 1000), sameSite: 'strict', secure: true })
      .cookie('refreshTokenID', true, {
        expires: new Date(new Date().getTime() + 31557600000),
        secure: true,
      })
      .send({ user, msg: 'Device verified' });
  } else {
    logger.debug('not authenticated');
    return res.status(400).send({ verification: false, msg: 'Incorrect OTP' });
  }
});

const home = catchAsync(async (req, res) => {
  res.status(202).send('Private Protected Route - Home');
});

const loginFailed = catchAsync(async (req, res) => {
  res.status(400).send('You Failed to log in!');
});

const loginSuccess = catchAsync(async (req, res) => {
  res.status(200).send(req.user);
});

const loginGoogleCallback = catchAsync(async (req, res) => {
  res.redirect('/login/success');
});

const loginFBCallback = catchAsync(async (req, res) => {
  res.redirect('/login/success');
});

const loginInsta = catchAsync(async (req, res) => {
  res.status(202).send('Private Protected Route - Home');
});

const loginApple = catchAsync(async (req, res) => {
  res.status(202).send('Private Protected Route - Home');
});

const loginLinkedin = catchAsync(async (req, res) => {
  res.status(202).send('Private Protected Route - Home');
});

const loginLinkedinCallback = catchAsync(async (req, res) => {
  res.redirect('/login/success');
});

const loginTwitter = catchAsync(async (req, res) => {
  res.status(202).send('Private Protected Route - Home');
});

const loginTwitterCallback = catchAsync(async (req, res) => {
  res.redirect('/login/success');
});

module.exports = {
  register,
  login,
  login2,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  verifyOTP,
  home,
  loginTwitter,
  loginInsta,
  loginApple,
  loginFailed,
  loginSuccess,
  loginGoogleCallback,
  loginFBCallback,
  loginLinkedin,
  loginLinkedinCallback,
  loginTwitterCallback,
};
