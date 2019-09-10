var express = require('express');
var router = express.Router();
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var db;
var valueCallBack = [];
var fs = require('fs');

var multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/Dien_thoai/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
        cb(null, true);
    else {
        req.fileValidationError = 'Error! Wrong mimetype picture of product ( just .jpg and .png only). Please reup the product';
        return cb(null, false, new Error('goes wrong on the mimetype'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});


var handlebars = require('handlebars');

MongoClient.connect('mongodb://admin:admin@ds159866.mlab.com:59866/ban_dien_thoai', (err, database) => {
    if (err) return console.log(err);
    db = database.db('ban_dien_thoai');
    console.log("connected ok !!!!");
});

/* GET home page. */
router.get('/', function (req, res) {
    db.collection('Dien_thoai').find({}, {sort: {Ma_so: 1}}).toArray((err, result) => {
        if (err) console.log(err);
        res.render('admin/listDelivery', {valueCallBack: result});
    });
});

router.get('/addPhone', function (req, res) {
    res.render('admin/addPhone')
});

router.post('/addPhone', upload.single('imagePhone'), function (req, res) {
    if (req.fileValidationError) {
        return res.end(req.fileValidationError);
    }
    var typePhone;
    var price = parseInt(req.body.Don_gia_Nhap) + parseInt(req.body.Don_gia_Nhap) * 0.2;
    if (req.body.typePhone == "ANDROID") {
        typePhone = "Android";
    } else {
        typePhone = "Iphone"
    }
    ;
    const phone = {
        Ma_so: req.body.Ma_so,
        Ten: req.body.Ten,
        Don_gia_Nhap: parseInt(req.body.Don_gia_Nhap),
        Don_gia_Ban: price,
        Nhom_Dien_thoai: {
            Ten: typePhone,
            Ma_so: req.body.typePhone
        },
        fileImage: req.file.originalname,
        listDelivery: []
    };
    db.collection('Dien_thoai').save(phone, (err, result) => {
        if (err) console.log(err);
        console.log("saved successfully !!! ");
        res.redirect('/addPhone');
        // res.send(req.file);
    });
});

router.get('/btnUpdatePhone', function (req, res) {
    db.collection('Dien_thoai').find({}, {sort: {Ma_so: 1}}).toArray((err, result) => {
        if (err) console.log(err);
        res.render('admin/listPhoneUpdate', {valueCallBack: result});
    });
});

router.get('/btnDelPhone', function (req, res) {
    db.collection('Dien_thoai').find({}, {sort: {Ma_so: 1}}).toArray((err, result) => {
        if (err) console.log(err);
        res.render('admin/listPhoneDelete', {valueCallBack: result});
        // res.send(result);
    });
});

router.get('/:Ma_so', function (req, res) {
    var thamso = req.params.Ma_so;
    db.collection('Dien_thoai').find({Ma_so: thamso}).toArray((err, result) => {
        if (err) console.log(err);
        res.render('admin/updatePhone', {valueCallBack: result});
    });
});

router.post('/:Ma_so', function (req, res) {
    var thamso = req.body.donGiaBan;
    db.collection('Dien_thoai').findOneAndUpdate({Ma_so: req.body.Ma_so}, {
        $set: {
            Ten: req.body.Ma_so,
            Don_gia_Ban: thamso,
        }
    }, {
        sort: {_id: -1},
        upsert: true,
    }, (err, result) => {
        if (err) console.log(err);
        res.redirect('/');
    });
    // res.send(thamso);
});

router.get('/delete/:Ma_so', function (req, res) {
    var thamso = req.params;
    db.collection('Dien_thoai').findOne(thamso, (err, result) => {
        var chuoi = "../Web_admin/public/images/Dien_thoai/" + result.fileImage;
        fs.unlink(chuoi, (err) => {
            if (err) console.log(err);
            console.log("Image deleted !!");
        });
        // res.send(result);
    });
    db.collection('Dien_thoai').findOneAndDelete(thamso,(err,result)=>{
        if(err) console.log(err)
        else console.log("DONE!!!");
        res.redirect('/btnDelPhone');
    })
});

router.get('/logout', function (req, res) {
    res.send("clickde on button logout !!! ");
});

module.exports = router;
