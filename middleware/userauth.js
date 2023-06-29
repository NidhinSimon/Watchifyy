const userLogin = (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.isblocked === true) {
      res.redirect('/login');
    } else {
      next();
    }
  } else {
    res.redirect('/login');
  }
};

const userLogout = (req, res, next) => {
  if (req.session.user) {
    req.session.user = false
    res.redirect('/login')
  } else {
    res.redirect('/login')
  }
}
module.exports = {
  userLogin,
  userLogout
}