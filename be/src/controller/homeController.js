const db = require('../models/index');

const getHomePage = async (req, res) => {

    try {
        let data = await db.Member.findAll();
        console.log('>>>>>', data);
        res.render('home', { data: JSON.stringify(data) });
    } catch (e) {
        console.log(e);
    }

}

module.exports = {
    getHomePage
}