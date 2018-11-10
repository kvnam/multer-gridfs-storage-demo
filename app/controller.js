const MongoClient = require('mongodb');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage')

//I used an mlab Sandbox DB. Substitute the details with your own
const url = "mongodb://<dbuser>:<dbpwd>@ds112345.mlab.com:12435/your_db_name";
const dbName = "your_db_name";

let storage = new GridFsStorage({
  url: "mongodb://<dbuser>:<dbpwd>@ds112345.mlab.com:12435/your_db_name",
  file: (req, file) => {
    return {
      bucketName: 'test',       //Setting collection name, default name is fs
      filename: file.originalname     //Setting file name to original name of file
    }
  }
});

let upload = null;

storage.on('connection', (db) => {
  //Setting up upload for a single file
  upload = multer({
    storage: storage
  }).single('file1');
  
});


module.exports.loadHome = (req, res) => {
  res.render('index', {title: 'Express App', message: 'Express Boilerplate set up!'});
};

module.exports.uploadFile = (req, res) => {
  upload(req, res, (err) => {
    if(err){
      return res.render('index', {title: 'Uploaded Error', message: 'File could not be uploaded', error: err});
    }
    res.render('index', {title: 'Uploaded', message: `File ${req.file.filename} has been uploaded!`});
  });
};

module.exports.getFile = (req, res) => {
  //Accepting user input directly is very insecure and should 
  //never be allowed in a production app.
  //Sanitize the input before accepting it
  //This is for demonstration purposes only
  let fileName = req.body.text1;
  //Connect to the MongoDB client
  MongoClient.connect(url, function(err, client){

    if(err){
      return res.render('index', {title: 'Uploaded Error', message: 'MongoClient Connection error', error: err.errMsg});
    }
    const db = client.db(dbName);
    
    const collection = db.collection('test.files');
    const collectionChunks = db.collection('test.chunks');
    collection.find({filename: fileName}).toArray(function(err, docs){
      if(err){
        return res.render('index', {title: 'File error', message: 'Error finding file', error: err.errMsg});
      }
      if(!docs || docs.length === 0){
        return res.render('index', {title: 'Download Error', message: 'No file found'});
      }else{
        //Retrieving the chunks from the db
        collectionChunks.find({files_id : docs[0]._id}).sort({n: 1}).toArray(function(err, chunks){
          if(err){
            return res.render('index', {title: 'Download Error', message: 'Error retrieving chunks', error: err.errmsg});
          }
          if(!chunks || chunks.length === 0){
            //No data found
            return res.render('index', {title: 'Download Error', message: 'No data found'});
          }
          //Append Chunks
          let fileData = [];
          for(let i=0; i<chunks.length;i++){
            //This is in Binary JSON or BSON format, which is stored
            //in fileData array in base64 endocoded string format
            fileData.push(chunks[i].data.toString('base64'));
          }
          //Display the chunks using the data URI format
          let finalFile = 'data:' + docs[0].contentType + ';base64,' + fileData.join('');
          res.render('imageView', {title: 'Image File', message: 'Image loaded from MongoDB GridFS', imgurl: finalFile});
        });
      }
      
    });
  });


};

