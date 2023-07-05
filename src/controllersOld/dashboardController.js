//For Register Page
var session;
const dashboardView = (req, res) => {
    session = req.session;
    if (session.userid) {
        res.render("admin/pages/login");
    }
    res.render('admin/pages/dashboard');
}

module.exports = { dashboardView };