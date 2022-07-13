const Router = app => {

    const SignUpControllers = require('./controllers/signup/signUp');
    app.post('/signup/send/code',(req,res) => SignUpControllers.sendDigitCode(req,res));
    app.post('/signup/check/code',(req,res)=> SignUpControllers.checkDigitCode(req,res));
    app.post('/check/email',(req,res)=> SignUpControllers.checkEmail(req,res));
    app.post('/signup',(req,res)=> SignUpControllers.signUp(req,res));
    
    const Login = require('./controllers/login/login');
    app.post('/login',(req,res) => Login.login(req,res));

    const Mypage = require('./controllers/mypage/index');
    app.post('/mypage',(req,res) => Mypage.getUserInfo(req,res));

    const ResetPassword = require('./controllers/resetPassword/resetPassword');
    app.post('/reset/send/code',(req,res) => ResetPassword.sendCode(req,res));
    app.post('/reset/check/code',(req,res) => ResetPassword.checkDigitCode(req,res));
    app.put('/reset/pwd',(req,res) => ResetPassword.setNewPassword(req,res));
};

module.exports = Router;