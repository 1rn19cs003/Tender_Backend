// const dbConnect=require('./mongodb');
const multer = require('multer');
const fs = require("fs");
require("dotenv").config();
// const aws = require('aws-sdk')
// const multerS3 = require('multer-s3')
const pdf = require("html-pdf");
// const nodemailer = require('nodemailer');
// const randomstring = require('randomstring');

module.exports = function (app, db) {
    // dummy route
    // =================admin Api===================
    app.get("/admin", (req, res) => {
        try {
            db.collection("admin")
                .find({})
                .toArray((err, res) => console.log(res, err));
            res.send("Admin update part");
        } catch (error) {
            console.log(error);
            res.send(error);
        }
    });
    // =========================================================================================
    // function to upload the files
    // cb means call back

    // aws.config.update({
    //     secretAccessKey: process.env.ACCESS_SECRET,
    //     accessKeyId: process.env.ACCESS_KEY,
    //     region: process.env.REGION,
    // });



    // const BUCKET_UPLOADS = process.env.BUCKET_UPLOADS
    // const s3 = new aws.S3();
    const { promisify } = require('util')
    const unlinkAsync = promisify(fs.unlink)

    const upload_data = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                // console.log(file+" ");
                // console.log(file.fieldname+" ");
                // console.log(file.size);
                // console.log(file.filename);
                cb(null, "uploads")
            },
            filename: function (req, file, cb) {
                // console.log(file.originalname);
                let name = file.originalname;
                if (name.length) {
                    // req.json({ file: req.file });
                    // console.log(req.params);
                    // console.log(name);
                    // console.log(req.file);
                    // console.log(name.length);
                    // console.log(req.body);
                }
                cb(null, file.fieldname + "_" + Date.now() + ".pdf")
            }
        })
    }).single("file_upload");
    app.post('/upload_vender_admin', upload_data, async function (req, res, next) {
        let k = req.body;
        console.log("Files");
        let size = 1;
        // console.log('Successfully uploaded ' + edm.fieldname + " " + pan.fieldname + " " + aadhar.fieldname + ' location!')
        if ((size != 0 && k.tenderName && k.startDate && k.endDate && k.minTenderAmount) || (req.session && req.session.userid)) {
            // check if record already exists...
            db.collection("files").findOne({ tenderName: k.tenderName }, { projection: { _id: 1, tenderName: 1, profile: 1, } }, (error, result) => {
                if (result && result._id) {
                    const filename = result.profile.file.filename;
                    // console.log(filename)
                    // console.log(result.profile)
                    if (filename.length != 0) {
                        fs.unlink("./uploads/" + filename, (err) => {
                            if (err) {
                                throw err;
                            }
                            console.log("Delete File successfully.");
                        });
                    }
                    db.collection("files").findOneAndUpdate(
                        { tenderName: k.tenderName },
                        {
                            $set: {
                                profile: {
                                    file: req.file,
                                    minTenderAmount: k.minTenderAmount,
                                    startDate: k.startDate,
                                    endDate: k.endDate,
                                }
                            }
                        },
                    )
                    res.json({
                        status: "Sucess",
                        message: "File Replcaed with new file exists !",
                        isLogged: false,
                    })
                }
                // tenderName doesn't exists, create one
                else {
                    let obj = {
                        tenderName: k.tenderName,
                        profile: {
                            file: req.file,
                            minTenderAmount: k.minTenderAmount,
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


    app.delete("/delete_admin/:filename", (req, res) => {
        try {
            const filename = req.params.filename;
            fs.unlink("./uploads/" + filename, (err) => {
                if (err) {
                    throw err;
                }
                console.log("Delete File successfully.");
                res.json({
                    status: "Sucess",

                });
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

    // aws.config.update({
    //     secretAccessKey: process.env.ACCESS_SECRET,
    //     accessKeyId: process.env.ACCESS_KEY,
    //     region: process.env.REGION,
    // });



    // const BUCKET_TENDER = process.env.BUCKET_TENDER

    const upload_files = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                // console.log(file+" ");
                // console.log(file.fieldname+" ");
                // console.log(file.size);
                // console.log(file.filename);
                cb(null, "uploads_tender")
            },
            filename: function (req, file, cb) {
                // console.log(file.originalname);
                let name = file.originalname;
                if (name.length) {
                    // req.json({ file: req.file });
                    // console.log(req.params);
                    // console.log(name);
                    // console.log(req.file);
                    // console.log(name.length);
                    // console.log(req.body);
                }
                cb(null, file.fieldname + "_" + Date.now() + ".pdf")
            }
        })
    }).any('EDM_file', 'PAN_file', 'aadhar_file')
    app.post('/upload_file', upload_files, async function (req, res, next) {
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
            && k.emdNumber
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
                            tenderValue: k.tenderValue,
                            withdraw: k.withdraw,
                            emdNumber: k.emdNumber,
                            profile: {
                                tenderName: k.tenderName,
                                email: k.email,
                                endDate: k.endDate,
                                amountWords: k.amountWords,
                                edm: edm,
                                pan: pan,
                                aadhar: aadhar,
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


    // app.get("/list", async (req, res) => {
    //     try {
    //         let result = await s3.listObjectsV2({ Bucket: BUCKET_TENDER }).promise()
    //         let value = await result.Contents.map(item => item.Key);
    //         console.log("result " + result)
    //         console.log("value " + value)
    //         res.send(value)
    //     } catch (error) {
    //         res.json({
    //             status: "error",
    //             message: error,
    //         });
    //     }
    // })

    // app.get("/download/:filename", async (req, res) => {
    //     try {
    //         const filename = req.params.filename;
    //         let x = await s3.getObject({ Bucket: BUCKET_TENDER, Key: filename }).promise();
    //         res.send(x);
    //         console.log(x);
    //         // res.sendFile(path.join(x + req.params.filename))
    //         res.send("File downLoaded");
    //     } catch (error) {
    //         res.json({
    //             status: "error",
    //             message: error,
    //         });
    //     }
    // })


    app.delete("/delete/:filename", (req, res) => {
        try {
            const filename = req.params.filename;
            fs.unlink("./uploads_tender/" + filename, (err) => {
                if (err) {
                    throw err;
                }
                console.log("Delete File successfully.");
                res.json({
                    status: "Sucess",
                });
            });
        }
        catch (error) {
            res.json({
                status: "error",
                message: error,
            });
        }
    })
    // app.delete("/delete/:filename", (req, res) => {
    //     try {
    //         const filename = req.params.filename;
    //         let x = s3.deleteObject({ Bucket: BUCKET_TENDER, Key: filename }).promise();
    //         res.json({
    //             status: "Sucess",
    //             message: "File deleted succesfully " + x,

    //         });
    //     }
    //     catch (error) {
    //         res.json({
    //             status: "error",
    //             message: error,
    //         });
    //     }
    // })


    // =======================================================================*******************************================================
    // =======================================================================*******************************================================
    // forgot password API
    // const config = require("../config/config");

    app.post("/forgot_password", (req, res) => {
        let k = req.body;

        try {
            db.collection("members").findOne(
                { email: k.email },
                { projection: { _id: 1, email: 1, name: 1 } },
                (error, results) => {
                    if (results && results._id) {
                        // res.json({
                        //     result
                        // });
                        // const resu = db.collection("files").deleteOne({ tenderName: k.tenderName });
                        // res.send(resu);
                        // const randomString = randomstring.generate();
                        db.collection("members").findOneAndUpdate(
                            { email: k.email },
                            { $set: { password: k.password } },
                        )
                        // sendRestPasswordMail(results.name, k.email, randomString);
                        res.status(200).send({
                            sucess: true,
                            msg: "Password has been updated!"
                        })
                        // res.json(results.name);
                    }
                    else {
                        // console.log(results);
                        // res.json(results);
                        res.json({
                            status: "error",
                            message: "File found but Action Can't be performed ",
                            isLogged: false,
                        });
                    }
                });
        } catch (error) {
            res.json({
                status: "error",
                message: "Mail doesn't exist.",
                isLogged: false,
            });
        }
    })
    // =======================================================================*******************************================================
    /**
     * app.post("/forgot_password") API to forgot password
     *      forgot password API requires mail for whom we have to reset the password
     * app.get("/reset_password") API to reset password
     *      requires the new password in body
     */
    // =======================================================================*******************************================================
    // Reset Password
    // app.get("/reset_password", (req, res) => {
    //     const passkey = req.body.password;
    //     console.log(passkey);
    //     if (!passkey) {
    //         res.json({
    //             status:"Error",
    //             message: "new Password is required",
    //             isLogged: false,
    //         });
    //     }
    //     else {
    //         try {
    //             const tok = req.query.token;
    //             db.collection("members").findOne(
    //                 { token: tok },
    //                 { projection: { _id: 1, token: 1 } },
    //                 (error, results) => {
    //                     if (results && results._id) {
    //                         // console.log(results.password);
    //                         db.collection("members").findOneAndUpdate(
    //                             { token: tok },
    //                             { $set: { password: passkey, token: '' } }, { new: true }
    //                         )
    //                         res.status(200).send({
    //                             sucess: true,
    //                             msg: "Password has been reset!",
    //                             data: results,
    //                         })
    //                     }
    //                     else {
    //                         // console.log(results);
    //                         // res.json(results);
    //                         res.json({
    //                             status: "error",
    //                             message: "This link has been expired",
    //                             isLogged: false,
    //                         });
    //                     }
    //                 });
    //         } catch (error) {
    //             res.json({
    //                 status: "error",
    //                 message: error,
    //                 isLogged: false,
    //             });
    //         }
    //     }
    // })
    // =======================================================================*******************************================================
    // =======================================================================*******************************================================

    app.post("/update_vender", (req, res) => {
        let k = req.body;
        try {
            db.collection("tender_files").findOne(
                {
                    email: k.email,
                    tenderName: k.tenderName
                },
                { projection: { _id: 1, email: 1, tenderName: 1, tenderValue: 1, profile: 1 } },
                (error, results) => {
                    if (results && results._id) {
                        console.log("???")
                        // res.json(results); 
                        // res.json({
                        //     result
                        // });
                        // const randomString = randomstring.generate();
                        db.collection("tender_files").findOneAndUpdate(
                            { email: results.email, tenderName: k.tenderName },
                            { $set: { tenderValue: k.tenderValue } }
                        )
                        res.json(results)
                        // updateValueMail(results.tenderName,k.email,randomString);
                        // res.status(200).send({
                        //     sucess: true,
                        //     msg: "Value has been Updated!"
                        // })
                    }
                    else {
                        // console.log(results);
                        // res.json(results);
                        res.json({
                            status: "error",
                            message: "File found but Action Can't be performed ",
                            isLogged: false,
                        });
                    }
                });
        } catch (error) {
            res.json({
                status: "error",
                message: "Mail doesn't exist. " + error,
                isLogged: false,
            });
        }
    })

    app.get("/update_value", (req, res) => {
        const value = req.body.tenderValue;
        console.log(value);
        if (!value) {
            res.json({
                status: "Error",
                message: "New value field can't be empty",
                isLogged: false,
            });
        }
        else {
            try {
                const tok = req.query.token;
                db.collection("tender_files").findOne(
                    { token: tok },
                    { projection: { _id: 1, token: 1 } },
                    (error, results) => {
                        if (results && results._id) {
                            // console.log(results.password);
                            db.collection("tender_files").findOneAndUpdate(
                                { token: tok },
                                { $set: { tenderValue: value, token: '' } }, { new: true }
                            )
                            res.status(200).send({
                                sucess: true,
                                msg: "Value has been Updated!",
                                data: results,
                            })
                        }
                        else {
                            // console.log(results);
                            // res.json(results);
                            res.json({
                                status: "error",
                                message: "This link has been expired",
                                isLogged: false,
                            });
                        }
                    });
            } catch (error) {
                res.json({
                    status: "error",
                    message: error,
                    isLogged: false,
                });
            }
        }
    })
    // =======================================================================*******************************================================
    // =======================================================================*******************************================================
    // To update the EDM file
    // const BUCKET_TENDER = process.env.BUCKET_TENDER

    const upload_EDM = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                // console.log(file+" ");
                // console.log(file.fieldname+" ");
                // console.log(file.size);
                // console.log(file.filename);
                cb(null, "uploads_tender")
            },
            filename: function (req, file, cb) {
                // console.log(file.originalname);
                let name = file.originalname;
                if (name.length) {
                    // req.json({ file: req.file });
                    // console.log(req.params);
                    // console.log(name);
                    // console.log(req.file);
                    // console.log(name.length);
                    // console.log(req.body);
                }
                cb(null, file.fieldname + "_" + Date.now() + ".pdf")
            }
        })
    }).single('EDM_file')
    app.post('/upload_edm', upload_EDM, async function (req, res, next) {
        let f = req.file;
        let k = req.body;
        console.log(k);
        console.log("Files");
        // let edm = f;
        let size = 1;
        console.log(f);
        console.log('Successfully uploaded ' + f.fieldname + ' location!')
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
            && f
            && k.tenderName
            && k.email) {
            // check if record already exists...
            db.collection("tender_files").findOne(
                {
                    email: k.email,
                    tenderName: k.tenderName
                },
                { projection: { _id: 1, email: 1, tenderName: 1, edm: 1, profile: 1 } },
                (error, result) => {
                    if (result && result._id) {
                        let filename = result.profile.edm.filename;
                        // console.log(filename);
                        // console.log(filename.length);
                        if (filename.length != 0) {
                                fs.unlink("./uploads_tender/" + filename, (err) => {
                                    if (err) {
                                        throw err;
                                    }
                                    console.log("Delete File successfully.");
                                });
                        }
                        db.collection("tender_files").findOneAndUpdate(
                            {
                                email: k.email,
                                tenderName: k.tenderName
                            },
                            {
                                $set: {
                                    profile: {
                                        tenderName: k.tenderName,
                                        email: k.email,
                                        endDate: result.profile.endDate,
                                        amountWords: result.profile.amountWords,
                                        edm: f,
                                        pan: result.profile.pan,
                                        aadhar: result.profile.aadhar,
                                    }
                                }
                            }, { new: true }
                        )
                        // console.log(f);
                        res.status(200).send({
                            sucess: true,
                            msg: "Value has been Updated!",
                            data: result,
                        })
                    }
                    else {
                        res.status(200).send({
                            sucess: "success",
                            message: "User Not Found"
                        })
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
    // =======================================================================*******************************================================
    // =======================================================================*******************************================================
    const upload_PAN = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                // console.log(file+" ");
                // console.log(file.fieldname+" ");
                // console.log(file.size);
                // console.log(file.filename);
                cb(null, "uploads_tender")
            },
            filename: function (req, file, cb) {
                // console.log(file.originalname);
                let name = file.originalname;
                if (name.length) {
                    // req.json({ file: req.file });
                    // console.log(req.params);
                    // console.log(name);
                    // console.log(req.file);
                    // console.log(name.length);
                    // console.log(req.body);
                }
                cb(null, file.fieldname + "_" + Date.now() + ".pdf")
            }
        })
    }).single('PAN_file')
    app.post('/upload_pan', upload_PAN, async function (req, res, next) {
        let f = req.file;
        let k = req.body;
        console.log(k);
        console.log("Files");
        // let edm = f;
        let size = 1;
        console.log(f);
        console.log('Successfully uploaded ' + f.fieldname + ' location!')
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
            && f
            && k.tenderName
            && k.email) {
            // check if record already exists...
            db.collection("tender_files").findOne(
                {
                    email: k.email,
                    tenderName: k.tenderName
                },
                { projection: { _id: 1, email: 1, tenderName: 1, edm: 1, profile: 1 } },
                (error, result) => {
                    if (result && result._id) {
                        let filename = result.profile.pan.filename;
                        // console.log(filename);
                        // console.log(filename.length);
                        if (filename.length != 0) {
                            fs.unlink("./uploads_tender/" + filename, (err) => {
                                if (err) {
                                    throw err;
                                }
                                console.log("Delete File successfully.");
                               
                            });
                        }
                        db.collection("tender_files").findOneAndUpdate(
                            {
                                email: k.email,
                                tenderName: k.tenderName
                            },
                            {
                                $set: {
                                    profile: {
                                        tenderName: k.tenderName,
                                        email: k.email,
                                        endDate: result.profile.endDate,
                                        amountWords: result.profile.amountWords,
                                        edm: result.profile.edm,
                                        pan: f,
                                        aadhar: result.profile.aadhar,
                                    }
                                }
                            }, { new: true }
                        )
                        // console.log(f);
                        res.status(200).send({
                            sucess: true,
                            msg: "Value has been Updated!",
                            data: result,
                        })
                    }
                    else {
                        res.status(200).send({
                            sucess: "success",
                            message: "User Not Found"
                        })
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
    // =======================================================================*******************************================================
    // =======================================================================*******************************================================
    const upload_aadhar = multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                // console.log(file+" ");
                // console.log(file.fieldname+" ");
                // console.log(file.size);
                // console.log(file.filename);
                cb(null, "uploads_tender")
            },
            filename: function (req, file, cb) {
                // console.log(file.originalname);
                let name = file.originalname;
                if (name.length) {
                    // req.json({ file: req.file });
                    // console.log(req.params);
                    // console.log(name);
                    // console.log(req.file);
                    // console.log(name.length);
                    // console.log(req.body);
                }
                cb(null, file.fieldname + "_" + Date.now() + ".pdf")
            }
        })
    }).single('Aadhar_file')
    app.post('/upload_aadhar', upload_aadhar, async function (req, res, next) {
        let f = req.file;
        let k = req.body;
        console.log(k);
        console.log("Files");
        // let edm = f;
        let size = 1;
        console.log(f);
        console.log('Successfully uploaded ' + f.fieldname + ' location!')
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
            && f
            && k.tenderName
            && k.email) {
            // check if record already exists...
            db.collection("tender_files").findOne(
                {
                    email: k.email,
                    tenderName: k.tenderName
                },
                { projection: { _id: 1, email: 1, tenderName: 1, edm: 1, profile: 1 } },
                (error, result) => {
                    if (result && result._id) {
                        let filename = result.profile.aadhar.filename;
                        // console.log(filename);
                        // console.log(filename.length);
                        if (filename.length != 0) {
                            fs.unlink("./uploads_tender/" + filename, (err) => {
                                if (err) {
                                    throw err;
                                }
                                console.log("Delete File successfully.");
                            });
                        }
                        db.collection("tender_files").findOneAndUpdate(
                            {
                                email: k.email,
                                tenderName: k.tenderName
                            },
                            {
                                $set: {
                                    profile: {
                                        tenderName: k.tenderName,
                                        email: k.email,
                                        endDate: result.profile.endDate,
                                        amountWords: result.profile.amountWords,
                                        edm: result.profile.edm,
                                        pan: result.profile.pan,
                                        aadhar: f,
                                    }
                                }
                            }, { new: true }
                        )
                        // console.log(f);
                        res.status(200).send({
                            sucess: true,
                            msg: "Value has been Updated!",
                            data: result,
                        })
                    }
                    else {
                        res.status(200).send({
                            sucess: "success",
                            message: "User Not Found"
                        })
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
    // =======================================================================*******************************================================
    // =======================================================================*******************************================================
    
    app.post("/update_withdraw", (req, res) => {
        let k = req.body;
        try {
            db.collection("tender_files").findOne(
                {
                    email: k.email,
                    tenderName: k.tenderName
                },
                { projection: { _id: 1, email: 1, tenderName: 1, tenderValue: 1, profile: 1 } },
                (error, results) => {
                    if (results && results._id) {
                        db.collection("tender_files").findOneAndUpdate(
                            { email: results.email, tenderName: k.tenderName },
                            { $set: { withdraw: k.withdraw } }, { new: true }
                        )
                        res.json(results)
                    }
                    else {
                        res.json({
                            status: "error",
                            message: "User Doesn't Exists ! ",
                            isLogged: false,
                        });
                    }
                });
        } catch (error) {
            res.json({
                status: "error",
                message: "Error " + error,
                isLogged: false,
            });
        }
    })
    // =======================================================================*******************************================================
    // =======================================================================*******************************================================
    app.post("/update_emdNumber", (req, res) => {
        let k = req.body;
        try {
            db.collection("tender_files").findOne(
                {
                    email: k.email,
                    tenderName: k.tenderName
                },
                { projection: { _id: 1, email: 1, tenderName: 1, emdNumber: 1, profile: 1 } },
                (error, results) => {
                    if (results && results._id) {
                        db.collection("tender_files").findOneAndUpdate(
                            { email: k.email, tenderName: k.tenderName },
                            { $set: { emdNumber: k.emdNumber } }, { new: true }
                        )
                        res.json(results)
                    }
                    else {
                        res.json({
                            status: "error",
                            message: "User Doesn't Exists ! ",
                            isLogged: false,
                        });
                    }
                });
        } catch (error) {
            res.json({
                status: "error",
                message: "Error " + error,
                isLogged: false,
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
    const pdfTemplate = require("./pdfmake");
    app.get("/all_files_data", (req, res) => {
        let k = req.body;
        // fs.readdir(__dirname + "/pdfs/", (err, files) => {
        //   if (files) {
        //     console.log(files.length);
        //     files.forEach((file) => {
        //       let yofile = file;
        //       if (files.length > 11) {
        //         fs.unlinkSync(__dirname + "/pdfs/" + yofile);
        //       }
        //     });
        //   }
        // });

        db.collection("tender_files").findOne(
            {
                email: k.email,
                tenderName: k.tenderName
            },
            {
                projection: { _id: 1, email: 1, tenderName: 1, profile: 1, tenderValue: 1, withdraw: 1, emdNumber: 1, }
            },
            (err, doc) => {
                if (err) {
                    res.json({
                        Msg: "Faced some difficulty in downloading the pdf, please try again later...",
                    });
                } else {
                    db.collection("members").findOne(
                        {
                            email: k.email,
                        },
                        {
                            projection: { _id: 1, email: 1, name: 1, profile: 1, admin: 1, }
                        },
                        (err, results) => {
                            if (err) {
                                res.json({
                                    Msg: "Faced some difficulty in downloading the pdf, please try again later...",
                                });
                            } else {
                                // console.log("profile");
                                // console.log(doc.profile);
                                let obj = {
                                    name: results.name,
                                    organization: results.profile.organization,
                                    phoneno: results.profile.phoneno,
                                    isVerified: results.profile.isVerified,
                                    admin: results.admin,
                                    tenderName: doc.tenderName,
                                    email: doc.email,
                                    tenderValue: doc.tenderValue,
                                    withdraw: doc.withdraw,
                                    emdNumber: doc.emdNumber,
                                    endDate: doc.profile.endDate,
                                    amountWords: doc.profile.amountWords,
                                    edm: doc.profile.edm,
                                    pan: doc.profile.pan,
                                    aadhar: doc.profile.aadhar,
                                }
                                console.log("-========== start ========---")
                                console.log(obj);
                                console.log("-========== end ========---")
                                pdf
                                    .create(pdfTemplate(obj), {
                                        childProcessOptions: {
                                            env: {
                                                OPENSSL_CONF: "/dev/null",
                                            },
                                        },
                                    })
                                    .toStream(function (err, stream) {
                                        if (err) {
                                            res.setHeader(500);
                                            console.log(err);
                                        } else {
                                            res.setHeader("content-type", "application/pdf");
                                            stream.pipe(res);
                                        }
                                    });
                                // .toFile(`${__dirname}/pdfs/${doc.usn}.pdf`, (err) => {
                                //   if (err) {
                                //     console.log("error");
                                //   }
                                //   res.sendFile(`${__dirname}/pdfs/${doc.usn}.pdf`);
                                // });
                            }
                        }
                    );
                }
            });
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

    // app.delete("/delete_file", (req, res) => {
    //     console.log(req.body);
    //     let k = req.body;
    //     db.collection("files").findOne(
    //         { tenderName: k.tenderName },
    //         { projection: { _id: 1, tenderName: 1 } },
    //         (error, result) => {
    //             if (result && result._id) {
    //                 // res.json({
    //                 //     result
    //                 // });
    //                 const resu = db.collection("files").deleteOne({ tenderName: k.tenderName });
    //                 res.send(resu);
    //             }
    //             else {
    //                 // console.log(results);
    //                 // res.json(results);
    //                 res.json({
    //                     status: "error",
    //                     message: "Empty or Invalid Name",
    //                     isLogged: false,
    //                 });
    //             }
    //         });
    // });
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
    // app.get("/all_data", (req, res) => {
    //     console.log("insides");
    //     db.collection("files")
    //         .aggregate([
    //             {
    //                 $lookup: {
    //                     from: "members",
    //                     localField: "email",
    //                     foreignField: "email",
    //                     as: "stud",
    //                 },
    //             },
    //         ])
    //         .toArray((error, results) => {
    //             if (error) {
    //                 res.json({ error });
    //             }
    //             res.json(results);
    //         });
    // });
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
                            name: k.name,
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