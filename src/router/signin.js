module.exports = function (app, db) {

    // ---------------------admin login starts-----------------
    app.post("/signin", (req, res) => {
        console.log("hello from signin admin");
        let k = req.body
        let temp = k.email && k.password && k.admin === true;
        console.log(temp);
        // console.log(k);
        // Check if session already exists ?
        if (req.session && req.session.userid) {
            res.json({
                status: "warn",
                message: "Session already exists !",
                lastUpdated: req.session.lastUpdated,
                isLatest: false,
                isLogged: true,
                // keys: req.session.keys,
                profile: req.session.profile,
            })
        }
        // check if values aren't null

        else if (k.email && k.password && k.admin===true) {
            // let q = (k.accountType === "admin") ? "admin" : "admin"
            // console.log("After login ");
            // console.log(k);
            db.collection("members").findOne({ email: k.email, password: k.password , admin: k.admin }, {
                projection: {
                    _id: 1,
                    profile: 1
                }
            }, (error, result) => {
                if (error) {
                    res.json({
                        status: "error",
                        message: error,
                        isLogged: false,
                    })
                    console.log(error)
                }
                // if user exists...
                else if (result) {
                    // log in by saving to session
                    req.session.userid = k.email
                    req.session.profile = result.profile
                    req.session.admin = result.profile.admin
                    req.session.lastUpdated = new Date()
                    // return details
                    res.json({
                        status: "success",
                        message: "Log in success !",
                        lastUpdated: req.session.lastUpdated,
                        isLatest: true,
                        isLogged: true,
                        isAdmin: result.profile.accountType === "true",
                        profile: req.session.profile,
                    })
                }
                // No rows matched ...
                else {
                    try {
                        res.json({
                            status: "error",
                            message: "Invalid userid or password",
                            isLogged: false,
                        })
                    } catch (e) { console.log(e) }
                }
            })
        }
        // either of email or password is null
        else {
            console.log("Account type is incorrect")
            res.json({
                status: "error",
                message: "Empty userid or password",
                isLogged: false,
            })
        }
    })
    // --------------------------admin login end------------------------------

    // --------------------------vendors login begin------------------------------

    app.post("/vendors_signin", (req, res) => {
        console.log("hello from signin from vendors");
        let k = req.body
        let temp = k.email && k.password && k.admin === false;
        console.log(temp);
        // console.log(k);
        // Check if session already exists ?
        if (req.session && req.session.userid) {
            res.json({
                status: "warn",
                message: "Session already exists !",
                lastUpdated: req.session.lastUpdated,
                isLatest: false,
                isLogged: true,
                profile: req.session.profile,
            })
        }
        // check if values aren't null
        else if (k.email && k.password && k.admin===false) {
            console.log("After login ");
            console.log(k);
            // Fetch fields matching Email and pass
            // let q = (k.admin === "false") ? "true" : "false"
            // console.log(q);
            db.collection("members").findOne({ email: k.email, password: k.password , admin:k.admin}, {
                projection: {
                    _id: 1,
                    profile: 1
                }
            }, (error, result) => {
                if (error) {
                    res.json({
                        status: "error",
                        message: error,
                        isLogged: false,
                    })
                    console.log(error)
                }
                // if user exists...
                else if (result) {
                    // log in by saving to session
                    req.session.userid = k.email
                    req.session.profile = result.profile
                    req.session.accountType = result.profile.accountType
                    req.session.lastUpdated = new Date()
                    // return details
                    res.json({
                        status: "success",
                        message: "Log in success !",
                        lastUpdated: req.session.lastUpdated,
                        isLatest: true,
                        isLogged: true,
                        isAdmin: result.profile.admin === "false",
                        profile: req.session.profile,
                    })
                }
                // No rows matched ...
                else {
                    try {
                        res.json({
                            status: "error",
                            message: "Invalid userid or password",
                            isLogged: false,
                        })
                    } catch (e) { console.log(e) }
                }
            })
        }
        // either of email or password is null
        else {
            console.log("Account type is incorrect")
            res.json({
                status: "error",
                message: "Empty userid or password",
                isLogged: false,
            })
        }
    })
    // --------------------------vendors login end------------------------------

    // logout session (required as session isn'n maintained on client side only)
    app.get("/logout", (req, res) => {
        // log it out
        console.log("logging out : ", req.session.userid)
        if (req.session) req.session.destroy()
        res.json({
            status: "success",
            message: "Logout success !",
        })
    })

    // status, check if already logged in or not
    // useful during browser reload
    // must check on first page visit
    app.get("/status", (req, res) => {
        // already logged in, redirect user to their profile
        // console.log(req.session)

        if (req.session && req.session.userid) {
            console.log(req.session)
            // let q = (req.session.admin === true) ? "members" :false;
            db.collection("members").findOne({ email: req.session.userid }, {
                projection: {
                    _id: 0,
                    profile: 1
                }
            }, (error, result) => {
                if (error) {
                    res.json({
                        status: "success",
                        message: "Session exists !",
                        isLogged: true,
                        lastUpdated: req.session.lastUpdated,
                        isLatest: false,
                        // isAdmin: ((req.session.admin === true) || (req.session.admin === false)) ? true : false,
                        errorLatest: error,
                        // keys: req.session.keys,
                        profile: req.session.profile,
                    })
                    throw error
                } else {
                    res.json({
                        status: "success",
                        message: "Session exists !",
                        lastUpdated: new Date(),
                        isLatest: true,
                        isLogged: true,
                        // isAdmin: ((req.session.admin === "admin") || (req.session.accountType === "mentor")) ? true : false,
                        profile: result.profile,
                    })
                }
            })
        }
        // not logged in, redirect user to login page
        else {
            res.json({
                status: "success",
                message: "Not logged in !",
                isLogged: false,
            })
        }
    })
}
