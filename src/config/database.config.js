require("dotenv").config()
const { MongoClient } = require("mongodb")
const mongoose = require("mongoose")
const url = process.env.MONGODB_URL
// const url = process.env.MONGODB_URL || "mongodb://localhost:27017/placement"
// const url = 'mongodb://localhost:27017/<name_the_cluster>'

let flag = false
let dbo


module.exports = {
    connect: callback => {
        MongoClient.connect(process.env.MONGODB_URL || url, async (err, db) => {
            if (err) throw err
            console.log("DB connected !")
            dbo = await db.db("Vendors")
            try {
                collections.forEach((v, index, arr) => {
                    dbo.createCollection("vendors", (err, res) => {
                        if (err && err.codeName === "NamespaceExists") {
                            arr.length = index + 1
                            flag = true
                            console.log(`Collection ${v} exists !`)
                        } else if (!err) console.log("Collection created !")
                    })
                })
            } catch (error) {
                if (!flag) {
                    console.log("\n Error \n")
                    throw error
                } else console.log("Hey user , Collection already exists")
            } finally {
                return callback(err, dbo)
            }
        })
    },
    getdb: () => {
        return dbo
    },
}
// }).catch((err)=>console.log(`No Connection`));
