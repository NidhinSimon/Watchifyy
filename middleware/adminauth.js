const adminLogin = (req, res, next) => {

    if (req.session.admin) {
        next()
    } else {
        res.redirect('/admin')
    }
}
const adminLogout = (req, res) => {
    req.session.admin = false
    res.redirect('/admin')
}
module.exports = {
    adminLogin,
    adminLogout
}