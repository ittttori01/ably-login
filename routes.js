const Router = app => {

    const SignUpControllers = require('./controllers/signup/signUp');
    app.post('/send/code',(req,res) => SignUpControllers.sendDigitCode(req,res));
    app.post('/signup/code',(req,res)=> SignUpControllers.checkDigitCode(req,res));
    app.post('/check/email',(req,res)=> SignUpControllers.checkEmail(req,res));
    app.post('/signup',(req,res)=> SignUpControllers.signUp(req,res));
    
    const Login = require('./controllers/login/login');
    app.post('/login',(req,res) => Login.login(req,res));

    const Mypage = require('./controllers/mypage/index');
    app.post('/mypage',(req,res) => Mypage.getUserInfo(req,res));
};

module.exports = Router;