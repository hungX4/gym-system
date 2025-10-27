const db = require('../models/index');
const { addNewUser,
    getAllUsers,
    getUserData,
    updateUserInformation,
    deleteCrudById } = require('../services/crudServices')
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

const getCrudform = (req, res) => {
    res.render('crud');
}

const postCrudform = async (req, res) => {
    try {
        const user = await Users.create(req.body);
        return res.status(201).json(user);
    } catch (err) {
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: err.errors.map(e => e.message)
            });
        }
        console.error(err);
        return res.status(500).json({ error: 'Lỗi server' });
    }
};


const displayCrud = async (req, res) => {
    let data = await getAllUsers();
    console.log('get all user from database >>>>>', data);
    res.render('displayCrud', { data: data });
}

const updateUser = async (req, res) => {
    const id = req.query.id;
    if (id) {
        let userData = await getUserData(id);
        console.log(userData);
        res.render('updateCrud', { userData: userData });
    } else {
        res.send('User not found!!!');
    }
}

const putCrud = async (req, res) => {
    let data = req.body;
    await updateUserInformation(data);
    res.redirect('/display-crud');
}


const deleteCrud = async (req, res) => {
    const id = req.query.id;
    if (id) {
        await deleteCrudById(id);
        res.redirect('/display-crud');
    } else {
        res.send('user not found!!!');
    }
}
module.exports = {
    getHomePage,
    getCrudform,
    postCrudform,
    displayCrud,
    updateUser,
    putCrud,
    deleteCrud
}