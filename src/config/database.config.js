const { MongoClient } = require('mongodb');
const mongoose =require('mongoose');

// const url =  process.env.MONGODB_URL || 'mongodb+srv://tender:tender@cluster0.mesqitc.mongodb.net/Vendors?retryWrites=true&w=majority'
const url = process.env.MONGODB_URL || "mongodb://localhost:27017/placement"
// const url = 'mongodb://localhost:27017/<name_the_cluster>'

let flag = false
let dbo

// const client = new MongoClient(url, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

// mongoose.connect(url,{
//     useNewUrlParser:true,
//     useCreateIndex:true,
//     useUnifiedTopology:true,
//     useFindAndModify:false
// }).then(()=>{
//     console.log(`connection successful`);
// }).catch((err)=>console.log(`No Connection`));

module.exports = {
    connect: (callback) => {
        MongoClient.connect(url, async (err, db) => {
            if (err) throw err
            console.log("DB connected !")
            dbo = await db.db("Vendors")
            try {
                collections.forEach((v, index, arr) => {
                    dbo.createCollection("vendors", (err, res) => {
                        if (err && err.codeName === 'NamespaceExists') {
                            arr.length = index + 1
                            flag = true
                            console.log(`Collection ${v} exists !`)
                        }
                        else if (!err) console.log("Collection created !")
                    })
                });
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
    getdb: () => { return dbo },
}
