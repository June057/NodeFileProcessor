const fs = require('fs');
const fetch = require("node-fetch");

// Reading data in utf-8 format
// which is a type of character set.
// Instead of 'utf-8' it can be 
// other character set also like 'ascii'

const http = require("http");
const file = fs.createWriteStream("file.docx");

http.get("http://norvig.com/big.txt", response => {
  response.pipe(file);
  fs.readFile('file.docx', 'utf-8', (err, data) => {
    if (err) throw err;
  
    // Converting Raw Buffer to text
    // data using tostring function.
    getWordsInfo(data, 10).then(function (outputJson) {
        console.log(JSON.stringify(outputJson));
    }, function (err) {
        throw err;
    });

  }, function (err) {
      throw err;
})
})
 lookUpFunc= async (word)=>{
     const response= await fetch('https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20210216T114936Z.e4989dccd61b9626.373cddfbfb8a3b2ff30a03392b4e0b076f14cff9&lang=en-en&text='+word+'')
     .catch(e => console.log('Error: ', e.message));;
     return await response.json().catch(e => console.log('Error: ', e.message)); //extract JSON from the http response


 }
  getWordsInfo= async(data, cutOff)=> {
    return await new Promise(function (resolve, reject) {
        var cleanString = data.replace(/[.,-/#!$%^&*;:{}=\-_`~()]/g, ""),
            words = cleanString.split(' '),
            frequencies = {},
            word, i;

        words = words.filter(entry => /\S/.test(entry));

        for (i = 0; i < words.length; i++) {
            word = words[i];
            frequencies[word] = frequencies[word] || 0;
            frequencies[word]++;
        }

        words = Object.keys(frequencies);

        var topWordArray = words.sort(function (a, b) {
            return frequencies[b] - frequencies[a];
        }).slice(0, cutOff);

        var returnArray = [];
        var apisToBeCalled = topWordArray.length;
        topWordArray.forEach(word => {
            lookUpFunc(word).then(function (wordDetails) {
                var wordInfoJson = {
                    "count": frequencies[word]
                };
                if (wordDetails.def[0]) {
                    wordInfoJson.synonyms = wordDetails.def[0].syn || wordDetails.def[0].mean || "Not found";;
                    wordInfoJson.pos = wordDetails.def[0].pos|| "Not found";

                } else {
                    wordInfoJson.synonyms = "Not found";
                    wordInfoJson.pos = "Not found";
                }

                returnArray.push({
                    "word": word,
                    "output": wordInfoJson
                });
                apisToBeCalled--;
                if (apisToBeCalled === 0) {
                    returnArray = returnArray.sort(function (a, b) {
                        return b.output.count - a.output.count
                    })
                    var returnJson = {
                        "wordList": returnArray
                    };
                    resolve(returnJson);
                }
            }, function (err) {
                console.error(err);
                reject(err);
            });
        });
    });
}