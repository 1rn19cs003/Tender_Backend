// const dbConnect=require('./mongodb');
const multer = require('multer');
const https = require("https");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const aws = require('aws-sdk')
const multerS3 = require('multer-s3')

module.exports = function (app, db) {
    // dummy route
    // =================admin Api===================
    app.get("/admin", (req, res) => {
        try {
            db.collection("admin")
                .find({})
                .toArray((err, res) => console.log(res, err));
            res.send("Admin part");
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    });
    // =========================================================================================
    // function to upload the files
    // cb means call back

    aws.config.update({
        secretAccessKey: process.env.ACCESS_SECRET,
        accessKeyId: process.env.ACCESS_KEY,
        region: process.env.REGION,
    });



    const BUCKET_UPLOADS = process.env.BUCKET_UPLOADS
    const s3 = new aws.S3();

    const upload_data = multer({
        storage: multerS3({
            s3: s3,
            bucket: BUCKET_UPLOADS,
            destination: function (req, file, cb) {
                cb(null, "tender_uploads")
            },
            key: function (req, file, cb) {
                console.log(file);
                cb(null, file.fieldname + "_" + Date.now() + ".pdf")
            }
        })
    }).single("file_upload");
    app.post('/upload_vender_admin', upload_data, async function (req, res, next) {
        let k = req.body;
        console.log("Files");
        let size = 1;
        // console.log('Successfully uploaded ' + edm.fieldname + " " + pan.fieldname + " " + aadhar.fieldname + ' location!')
        if ((size != 0 && k.tenderName && k.startDate && k.endDate) || (req.session && req.session.userid)) {
            // check if record already exists...
            db.collection("files").findOne({ tenderName: k.tenderName }, { projection: { _id: 1, tenderName: 1 } }, (error, result) => {
                if (result && result._id) {
                    res.json({
                        status: "error",
                        message: "File already exists !",
                        isLogged: false,
                    })
                }
                // tenderName doesn't exists, create one
                else {
                    let obj = {
                        tenderName: k.tenderName,
                        profile: {
                            file: req.file,
                            startDate: k.startDate,
                            endDate: k.endDate,
                        },
                    }
                    db.collection("files").insertOne(obj, (error, results) => {
                        if (error) {
                            res.json({
                                status: "error",
                                message: error,
                                isLogged: false,
                            })
                            throw error
                        }
                        // Records inserted, auto log in
                        else {
                            // log it in
                            res.json({
                                status: "success",
                                message: "File Uploaded !",
                                isLatest: true,
                                isLogged: true,
                                profile: obj.profile,
                            })
                        }
                    })
                }
            })
        } else {
            // some fields are null
            res.json({
                status: "error",
                message: "Empty or invalid data",
                isLogged: false,
            })
        }
    })


    app.get("/list_admin", async (req, res) => {
        try {
            let result = await s3.listObjectsV2({ Bucket: BUCKET_UPLOADS }).promise()
            let value = await result.Contents.map(item => item.Key);
            console.log("result " + result)
            console.log("value " + value)
            res.send(value)
        } catch (error) {
            res.json({
                status: "error",
                message: error,
            });
        }
    })

    app.get("/download_admin/:filename", async (req, res) => {
        try {
            const filename = req.params.filename;
            let x = await s3.getObject({ Bucket: BUCKET_UPLOADS, Key: filename }).promise();
            res.send(x);
            console.log(x);
            // res.sendFile(path.join(x + req.params.filename))
            res.send("File downLoaded");
        }
        catch (error) {
            res.json({
                status: "error",
                message: error,
            });
        }
    })

    app.delete("/delete_admin/:filename", (req, res) => {

        try {
            const filename = req.params.filename;
            let x = s3.deleteObject({ Bucket: BUCKET_UPLOADS, Key: filename }).promise();
            res.json({
                status: "Sucess",
                message: "File deleted succesfully " + x,
            });
        }
        catch (error) {
            res.json({
                status: "error",
                message: error,
            });
        }
    })



    // =======================================================================*******************************================================
    // =======================================================================*******************************================================

    aws.config.update({
        secretAccessKey: process.env.ACCESS_SECRET,
        accessKeyId: process.env.ACCESS_KEY,
        region: process.env.REGION,
    });



    const BUCKET_TENDER = process.env.BUCKET_TENDER

    const upload_PAN = multer({
        storage: multerS3({
            s3: s3,
            bucket: BUCKET_TENDER,
            destination: function (req, file, cb) {
                cb(null, "tender_uploads")
            },
            key: function (req, file, cb) {
                console.log(file);
                cb(null, file.fieldname + "_" + Date.now() + ".pdf")
            }
        })
    }).any('EDM_file', 'PAN_file', 'aadhar_file')
    app.post('/upload_file', upload_PAN, async function (req, res, next) {
        let f = req.files;
        let k = req.body;
        console.log("Files");
        // console.log(k);
        // console.log(f);
        let edm = f[0];
        let pan = f[1];
        let aadhar = f[2]
        // console.log(edm.fieldname)
        // console.log(pan.fieldname)
        // console.log(aadhar.fieldname)
        let size = 1;
        console.log('Successfully uploaded ' + edm.fieldname + " " + pan.fieldname + " " + aadhar.fieldname + ' location!')
        if (req.session && req.session.userid) {
            res.json({
                status: "warn",
                message: "Session already exists !",
                isLogged: true,
                lastUpdated: req.session.lastUpdated,
                isLatest: false,
                profile: req.session.profile,
            });
        }
        // check if any value is not null
        else if (size != 0
            && edm
            && pan
            && aadhar
            && k.tenderName
            && k.email
            && k.tenderValue
            && k.amountWords
            && k.endDate) {
            // check if record already exists...
            db.collection("tender_files").findOne(
                { projection: { _id: 1, email: 1, tenderName: 1 } },
                (error, result) => {
                    if (result && result._id) {
                        res.json({
                            status: "error",
                            message: "File already exists !",
                            isLogged: false,
                        });
                    }
                    // tenserName doesn't exists, create one
                    else {
                        let obj = {
                            tenderName: k.tenderName,
                            email: k.email,
                            profile: {
                                tenderName: k.tenderName,
                                email: k.email,
                                endDate: k.endDate,
                                amountWords: k.amountWords,
                                edm: edm,
                                pan: pan,
                                aadhar: aadhar,
                                tenderValue: k.tenderValue,
                            },
                        };
                        // Object.assign(obj, { elem[0]: { elem[0]:obj1 }});
                        // console.log("object " + obj);
                        db.collection("tender_files").insertOne(obj, (error, results) => {
                            if (error) {
                                res.json({
                                    status: "error",
                                    message: error,
                                    isLogged: false,
                                });
                                throw error;
                            }
                            // Records inserted, auto log in
                            else {
                                // log it in
                                res.json({
                                    status: "success",
                                    message: "File Uploaded !",
                                    isLatest: true,
                                    isLogged: true,
                                    profile: obj.profile,
                                });
                            }
                        });
                    }
                }
            );
        } else {
            // some fields are null
            res.json({
                status: "error",
                message: "Empty or invalid data",
                isLogged: false,
            });
        }
    })


    app.get("/list", async (req, res) => {
        try {
            let result = await s3.listObjectsV2({ Bucket: BUCKET_TENDER }).promise()
            let value = await result.Contents.map(item => item.Key);
            console.log("result " + result)
            console.log("value " + value)
            res.send(value)
        } catch (error) {
            res.json({
                status: "error",
                message: error,
            });
        }
    })

    app.get("/download/:filename", async (req, res) => {
        try {
            const filename = req.params.filename;
            let x = await s3.getObject({ Bucket: BUCKET_TENDER, Key: filename }).promise();
            res.send(x);
            console.log(x);
            // res.sendFile(path.join(x + req.params.filename))
            res.send("File downLoaded");
        } catch (error) {
            res.json({
                status: "error",
                message: error,
            });
        }
    })

    app.delete("/delete/:filename", (req, res) => {
        try {
            const filename = req.params.filename;
            let x = s3.deleteObject({ Bucket: BUCKET_TENDER, Key: filename }).promise();
            res.json({
                status: "Sucess",
                message: "File deleted succesfully " + x,

            });
        }
        catch (error) {
            res.json({
                status: "error",
                message: error,
            });
        }
    })


    // =======================================================================*******************************================================
    // =======================================================================*******************************================================
    // get all vendors
    app.get("/all_vendors", (req, res) => {
        try {
            let k = req.body;
            console.log(k);
            db.collection("members")
                .find()
                .toArray((error, results) => {
                    if (error) {
                        res.json({
                            status: "error",
                            message: "unable to fetch data with requested params",
                            isLogged: true,
                        });
                        throw error;
                    }
                    res.json(results);
                });
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    });
    // =======================================================================*******************************================================
    // =======================================================================*******************************================================
    app.get("/all_files", (req, res) => {
        try {
            let k = req.body;
            console.log(k);
            db.collection("files")
                .find()
                .toArray((error, results) => {
                    if (error) {
                        res.json({
                            status: "error",
                            message: "unable to fetch data with requested params",
                            isLogged: true,
                        });
                        throw error;
                    }
                    res.json(results);
                });
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    });
    // =======================================================================*******************************================================
    // =======================================================================*******************************================================
    // api to downaload files 
    // const fs = require("fs");

    const log = console.log;
    const path = require("path");
    const { exit } = require("process");
    const request = require("request-promise-native");
    // 2. custom download folder
    const folder = path.resolve(__dirname, '../pdf/');
    // log('folder', folder);

    // 3. check if the folder exists, if not create it
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    async function downloadFile(url, filename) {
        log('🚧 pdf downloading ...');
        const pdfBuffer = await request.get({
            uri: url,
            encoding: null,
        });
        // 4. write file to local file system
        fs.writeFileSync(filename, pdfBuffer);
        log('✅ pdf download finished!');
        // 5. exit the terminal after download finished
        exit(0);
    }
    app.get("/download", (req, res) => {
        console.log(req.body.path_url);
        let k = req.body;
        // let link = folder + '/cs193p-2021-l1.pdf';
        // downloadFile(k.url,link);
        if (k.path_url) {
            const fname = path.basename(k.path_url);
            let link = folder + "/" + fname;
            downloadFile(k.path_url, link);
            console.log(k.path_url + "downloaded successfully");


            res.json({
                status: "Sucess",
                message: "File downloaded successfully",
                isLogged: true,
            });
        }
        else {
            res.json({
                status: "error",
                message: "Empty or invalid url",
                isLogged: false,
            });
        }
    });
    // ======================================================================*******************************================================
    // =======================================================================*******************************================================
    app.delete("/delete_file", (req, res) => {
        // console.log(req.body.email);
        let k = req.body;
        db.collection("files").findOne(
            { tenderName: k.tenderName },
            { projection: { _id: 1, tenderName: 1 } },
            (error, result) => {
                if (result && result._id) {
                    // res.json({
                    //     result
                    // });
                    const resu = db.collection("files").deleteOne({ tenderName: k.tenderName });
                    res.send(resu);
                }
                else {
                    // console.log(results);
                    // res.json(results);
                    res.json({
                        status: "error",
                        message: "Empty or invalid email",
                        isLogged: false,
                    });
                }
            });
    });

    app.delete("/delete_file", (req, res) => {
        console.log(req.body);
        let k = req.body;
        db.collection("files").findOne(
            { tenderName: k.tenderName },
            { projection: { _id: 1, tenderName: 1 } },
            (error, result) => {
                if (result && result._id) {
                    // res.json({
                    //     result
                    // });
                    const resu = db.collection("files").deleteOne({ tenderName: k.tenderName });
                    res.send(resu);
                }
                else {
                    // console.log(results);
                    // res.json(results);
                    res.json({
                        status: "error",
                        message: "Empty or Invalid Name",
                        isLogged: false,
                    });
                }
            });
    });
    // =======================================================================*******************************================================
    // =======================================================================*******************************================================
    app.delete("/delete_tender", (req, res) => {
        // console.log(req.body.email);
        let k = req.body;
        console.log(k.tenderName);
        db.collection("tender_files").findOne(
            { tenderName: k.tenderName },
            { projection: { _id: 1, tenderName: 1 } },
            (error, result) => {
                if (result && result._id) {
                    // res.json({
                    //     result
                    // });
                    const resu = db.collection("tender_files").deleteMany({ tenderName: k.tenderName });
                    // res.send(resu);
                    console.log(resu);
                    res.send(resu);
                }
                else {
                    // console.log(results);
                    // res.json(results);
                    res.json({
                        status: "error",
                        message: "Empty or invalid email",
                        isLogged: false,
                    });
                }
            });
    });
    // =======================================================================*******************************================================
    // =======================================================================*******************************================================
    app.delete("/delete_tender_file", (req, res) => {
        // console.log(req.body.email);
        let k = req.body;
        console.log(k.tenderName);
        db.collection("tender_files").findOne(
            { tenderName: k.tenderName },
            { projection: { _id: 1, tenderName: 1 } },
            (error, result) => {
                if (result && result._id) {
                    // res.json({
                    //     result
                    // });
                    const resu = db.collection("tender_files").deleteMany({ tenderName: k.tenderName, email: k.email });
                    // res.send(resu);
                    console.log(resu);
                    res.send(resu);
                }
                else {
                    // console.log(results);
                    // res.json(results);
                    res.json({
                        status: "error",
                        message: "Empty or invalid email",
                        isLogged: false,
                    });
                }
            });
    });
    // =======================================================================*******************************================================
    // =======================================================================*******************************================================
    // combined data of files and members
    app.get("/all_data", (req, res) => {
        console.log("insides");
        console.log("insides");
        db.collection("tender_files")
            .aggregate([
                {
                    $lookup: {
                        from: "members",
                        localField: "email",
                        foreignField: "email",
                        as: "stud",
                    },
                },
            ])
            .toArray((error, results) => {
                if (error) {
                    res.json({ error });
                }
                res.json(results);
            });
    });

    app.get("/all_admin_data", (req, res) => {
        console.log("insides");
        db.collection("files")
            .aggregate([
                {
                    $lookup: {
                        from: "members",
                        localField: "email",
                        foreignField: "email",
                        as: "stud",
                    },
                },
            ])
            .toArray((error, results) => {
                if (error) {
                    res.json({ error });
                }
                res.json(results);
            });
    });
    // =======================================================================*******************************================================
    // =======================================================================*******************************================================
    app.get("/all_data", (req, res) => {
        console.log("insides");
        db.collection("files")
            .aggregate([
                {
                    $lookup: {
                        from: "members",
                        localField: "email",
                        foreignField: "email",
                        as: "stud",
                    },
                },
            ])
            .toArray((error, results) => {
                if (error) {
                    res.json({ error });
                }
                res.json(results);
            });
    });
    // =======================================================================*******************************================================
    // =======================================================================*******************************================================
    // post route for register (expects json data)
    // to register all members
    app.post("/register", (req, res) => {
        let k = req.body;
        console.log(req.body);
        // Check if already logged in ?
        if (req.session && req.session.userid) {
            res.json({
                status: "warn",
                message: "Session already exists !",
                isLogged: true,
                lastUpdated: req.session.lastUpdated,
                isLatest: false,
                // keys: req.session.keys,
                profile: req.session.profile,
            });
        }
        // check if any value is not null
        else if (
            k.name &&
            k.organization &&
            k.phoneno &&
            k.verified &&
            k.email &&
            k.password &&
            !k.admin

        ) {
            // check if record already exists...
            db.collection("members").findOne(
                { email: k.email },
                { projection: { _id: 1, email: 1 } },
                (error, result) => {
                    if (result && result._id) {
                        res.json({
                            status: "error",
                            message: "User already exists !",
                            isLogged: false,
                        });
                    }
                    // email doesn't exists, create one
                    else {
                        let obj = {
                            email: k.email,
                            profile: {
                                name: k.name,
                                organization: k.organization,
                                phoneno: k.phoneno,
                                email: k.email,
                                isVerified: k.verified,
                            },
                            admin: k.admin,
                            password: k.password,
                        };
                        db.collection("members").insertOne(obj, (error, results) => {
                            if (error) {
                                res.json({
                                    status: "error",
                                    message: error,
                                    isLogged: false,
                                });
                                throw error;
                            }
                            // Records inserted, auto log in
                            else {
                                // log it in
                                req.session.userid = k.email;
                                req.session.profile = obj.profile;
                                req.session.lastUpdated = new Date();
                                res.json({
                                    status: "success",
                                    message: "Account created !",
                                    lastUpdated: req.session.lastUpdated,
                                    isLatest: true,
                                    isLogged: true,
                                    profile: obj.profile,
                                });
                            }
                        });
                    }
                }
            );
        } else {
            // some fields are null
            res.json({
                status: "error",
                message: "Empty or invalid data",
                isLogged: false,
            });
        }
    });
};