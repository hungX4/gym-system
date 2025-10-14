const db = require('../models/index');

const getHomePage = async (req, res) => {

    try {
        console.log('db keys:', Object.keys(db));
        console.log('db.User:', db.Users);
        let data = await db.Users.findAll();
        console.log('>>>>>', data);
        res.render('home', { data: JSON.stringify(data) });
    } catch (e) {
        console.log(e);
    }

}

module.exports = {
    getHomePage
}