const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
// const mongoose = require('mongoose')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 5000

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/',(req,res)=>{
  res.render("pages/search");
})

app.get('/pg1/:name',(req,res)=>{
  var song =  require('./assignment');
  var ab = req.params.name;
  console.log(ab)
  song.find({"name.name":ab}).then((response) =>{
    // console.log(response[0].name.name);
    res.render("pages/page1", {            // IF DATA FOUND GO TO PAGE1.ejs with data
      artist: response
    })    
  })  
})

app.get('/pg2/:title',(req,res)=>{
  // console.log(lower); 
  var song =  require('./assignment');
  song.find({'title':req.params.title}).then((response) =>{
    // console.log(response[0].lyrics)
    var lyric = response[0].lyrics;
      res.render("pages/page2", {            // IF DATA FOUND GO TO PAGE1.ejs with data
        artist: response,
        lyrics: lyric
      })
    
    
  })
  .catch((error) => {
    console.log("item not found");
    res.redirect("/");    
  })
})
app.get('/pg3',(req,res)=>{
  var song = require('./assignment');
  song.find({}).then((response)=>{
    res.render("pages/page3",{
      songList: response
    });
  })
})

app.post('/searchS', (req, res)=>{
  var lower = req.body.songsearch.toLowerCase();
  console.log(lower); 
  var song =  require('./assignment');
  song.findOne({"name.lowerName":lower}).then((response) =>{
    console.log(response);
    if(response == null){         // IF DATA IS NOT FOUND GO BACK TO SEARCH.ejs
      console.log("empty");
      res.redirect('/error/search')
    }
    else{
      res.redirect("/pg1/"+response.name.name)
    }
    
  })
  .catch((error) => {
    console.log(error)
  })
})
app.post('/pg2', (req, res)=>{
  var lower = req.body.songsearch.toLowerCase();
  console.log(lower); 
  var song =  require('./assignment');
  song.find({'name.lowerName':lower}).then((response) =>{
    // console.log(response);
    if(response[0].title == null){         // IF DATA IS NOT FOUND GO BACK TO SEARCH.ejs
      console.log("empty");
    }
    else{
      res.redirect("/pg2/"+lower)
    }
    
  })
  .catch((error) => {
  console.log("item not found");
  res.redirect("/");    
  })
})

app.post('/insertSong', (req,res,next)=>{     // INSERT NEW SONG
  var song =  require('./assignment');
  var status = 'new';
  song.find({}).then((response) =>{
    // console.log(response[0].title);
    for(var n = 0; n < response.length; n++){
      if(response[n].title.toLowerCase() == req.body.searchsongs.toLowerCase()){ // Check song exist
        console.log(response[n].title);
        console.log('song exist');
        if(response[n].name.lowerName == req.body.searchartist.toLowerCase()){  // Check artist exist
          console.log(response[n].name.lowerName);
          console.log('artist exist');
          status = 'exist';
          res.redirect('/pg3');
        }
      }
    }
    if(status == "new"){
      console.log(status);
      var artist = req.body.searchartist.toLowerCase();
      var song = req.body.searchsongs;
      const querystr4 =`https://api.deezer.com/search/track?q=${song}`; // Get Name / Title / Preview / Picture_big
      axios.get(querystr4).then((response4)=>{
        // console.log(response.data)
        if(response4.data == null){     // API dont have the song
          console.log('song error ')
          res.redirect('/error/pg3')
        }
        else if(response4.data != null){    // API have the song
          console.log('song found')
          console.log(response4.data); // Show result from API
          var i = 0;
          while(i < response4.data.data.length){  // Loop the list to find artist
            var artistLowName = response4.data.data[i].artist.name.toLowerCase()
            if(artistLowName == artist){        // Get artist name
              console.log('artist found');      // If found artist get lyrics go save in mongodb 
              const querystr5 = `https://api.lyrics.ovh/v1/${artistLowName}/${song}`;   // Get Lyrics 
              axios.get(querystr5).then((response5)=>{
                // var lyricsstring = JSON.stringify(response5.data.lyrics);
                // console.log(lyricsstring)
                var songIns = require('./assignment')
                songs = new songIns({
                  title:response4.data.data[i].title,
                  name:{
                      name: response4.data.data[i].artist.name,
                      lowerName: artistLowName
                  },
                  preview:response4.data.data[i].preview,
                  lyrics:response5.data.lyrics,
                  picture_big:response4.data.data[i].artist.picture_big
                })
                songs.save().then((result)=>{ //save into database 
                  console.log(result);
                  res.redirect('/pg3')
                })
              })
              return;
            }
            i++;
          }
          // Fail to find artist
          console.log('fail to find artist'); 
          res.redirect('/error/pg3')
        }
      })
    }
    else{
      console.log(status)
    }
    // res.redirect('/pg3');
  })

})

app.post('/delete', (req, res)=>{
  var linkdb = require("./assignment");
  linkdb.deleteOne({"_id":req.body.deletesongs}).then((result)=>{
    res.redirect('/pg3');
  })
  .catch((error)=>{
    console.log('error')
  //  res.redirect('/pg3')
  })
})

app.get('/error/:errorpage',(req,res)=>{
  var pgname = req.params.errorpage
  if(pgname == "search"){
    res.render("pages/error", {
      name: "one"
    })
  }
  else if(pgname == "pg3"){
    res.render("pages/error", {
      name: "two"
    })
  }

})

app.get('/back/:error',(req,res)=>{
  if(req.params.error== "one"){
    res.redirect("/")
  }
  else if(req.params.error== "two"){
    res.redirect("/pg3")
  }
})


app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
