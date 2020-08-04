var https=require('https');
var http = require('http');
var timer = 0;
var path = require('path');
var fs = require('fs');

const {cm,combine} = require(path.join(__dirname, '/coin/market.js'))
const {getStock} = require(path.join(__dirname, '/coin/stock.js'))

pushTask();


function pushTask(){
  var left = 1800000 - new Date().getTime()%1800000;
  console.log('left:'+left);
  if(timer==0){
    timer = 1;
    setTimeout(function(){
      pushToGroup(2);
      setTimeout(function () {
        timer = 0;
        pushTask();
      },10000);
    },left)
  }
}

var failed=0;
function getCurrency(callback){
  console.log('will get currency');
  var options = {
    hostname: "api.fixer.io",
    port: 80,
    path: '/latest?base=USD',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.75 Safari/537.36'
    },
    method: 'GET'
  };
  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    var code = res.statusCode;
    if(code==200){
      var resdata = '';
      res.on('data', function (chunk) {
        resdata = resdata + chunk;
      });
      res.on('end', function () {
        var data = eval('('+resdata+')');
        var usd_cny=data.rates.CNY;
        callback(usd_cny);
      });
      res.on('error',function(){

      })
    }else{
      callback(0);
    }
  });
  req.on('error', function(err) {
    console.log('req err:');
    console.log(err);
  });
  req.setTimeout(5000,function(){
    req.end();
    callback(0);
  });
  req.end();
}


function pushToGroup(type) {
  if (type == 2) {
    var groupid = 221698514;
    var callback = function (res, blank) {

      var msg = res.trim();
      var port = 24334;
      var n = msg.indexOf('CQ:image')
      if(n>=0&&port!=23334){
        var npath;
        if(port == 24334){
          npath="wcq";
        }else if(port == 25334){
          npath="ecq";
        }else{
          npath="wcq";
        }
        var s1 = msg.substring(n+3);
        var n1 = s1.indexOf('file=');
        var s2 = s1.substring(n1+5);
        var n2 = s2.indexOf(']');
        var s3 = s2.substring(0,n2);
        var pa = s3.split('/');
        var ohead = '../coolq-data/cq/data/image/'

        var head = '../coolq-data/'+npath+'/data/image/'
        var fpath = head;
        for(var i=0;i<pa.length;i++){
          if(i==0){
            fpath=fpath+pa[i];
          }else{
            fpath=fpath+"/"+pa[i];
          }
          if(i!=pa.length-1){
            if(!fs.existsSync(fpath)){
              fs.mkdirSync(fpath);
            }
          }
        }

        console.log("copy:"+ohead+s3+"  -->  "+head+s3);
        try{
          let readStream = fs.createReadStream(ohead+s3);
          readStream.pipe(fs.createWriteStream(head+s3));
        }catch(e){
          console.log(e);
        }
      }

















      if (res.trim().length > 0) {
          res = res.replace(/CQ:image,file=sen/i, "CQ:image,file=file:/home/hduser/upload/tk/coolq-data/wcq/data/image/sen")        
          var bdy = {"group_id": groupid, message: res};
          console.log("send:" + msgd);
          request({
              headers:{
                  "Content-Type":"application/json"
              },
              method: "POST",
              url: 'http://192.168.17.52:'+24334+'/send_group_msg',
              body: JSON.stringify(bdy)
          }, function(error, response, body) {
              if (error && error.code) {
                  console.log('pipe error catched!')
                  console.log(error);
              } else {
                  console.log('ok1');
              }
              setTimeout(function () {
                  doSend1(thread);
              }, Math.floor(Math.random() * 3500 + 2500));
          });
      }
    }
    var now = new Date();
    if (now.getMinutes() > 25 && now.getMinutes() < 35) {
      combine(callback);
      if (now.getDay() >= 1 && now.getDay() <= 5 && now.getHours() == 15) {
        getStock(callback);
      }
    } else {
      combine(callback);
    }
  }
}



function getBitFlyer(callback,withproxy){
  console.log('will get bitflyer');
  var options = {
    hostname: "api.bitflyer.jp",
    port: 443,
    path: '/v1/ticker?product_code=BTC_JPY',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.75 Safari/537.36'
    },
    method: 'GET'
  };
  options.agent=agent;
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var code = res.statusCode;
    if(code==200){
      failed=0;
      var resdata = '';
      res.on('data', function (chunk) {
        resdata = resdata + chunk;
      });
      res.on('end', function () {
        parseBitFlyerRes(resdata,callback);
      });
      res.on('error',function(){

      })
    }else{
      failed = failed + 1;
      if(failed>2){
        callback('bitflyer BOOM!');
      }else{
        getBitFlyer(callback);
      }
    }
  });
  req.setTimeout(5000,function(){
    callback('bitflyer BOOM!');
  });
  req.on('error', function(err) {
    console.log('req err:');
    console.log(err);
  });
  req.end();
}

function parseBitFlyerRes(resdata,callback){
  var ret = '';
  try{
    var data = eval('('+resdata+')');
    var btc_jpy = data.best_bid;
    var now = new Date();
    ret = "比特币行情(Bitflyer)："+now.toLocaleString()+"\n";
    ret = ret + "BTC:"+btc_jpy+"円";
  }catch(e){
    console.log(e);
    ret = '';
  }
  callback(ret);
}

function getHT(callback,withproxy){
  console.log('will get bitflyer');
  var options = {
    hostname: "api.huobi.pro",
    port: 443,
    path: '/market/detail/merged?symbol=htusdt',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.75 Safari/537.36'
    },
    method: 'GET'
  };
  options.agent=agent;
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var code = res.statusCode;
    if(code==200){
      failed=0;
      var resdata = '';
      res.on('data', function (chunk) {
        resdata = resdata + chunk;
      });
      res.on('end', function () {
        parseHTRes(resdata,callback);
      });
      res.on('error',function(){

      })
    }else{
      failed = failed + 1;
      if(failed>2){
        callback('huobi BOOM!');
      }else{
        getHT(callback);
      }
    }
  });
  req.on('error', function(err) {
    console.log('req err:');
    console.log(err);
  });
  req.setTimeout(5000,function(){
    callback('huobi BOOM!');
  });
  req.end();
}

function parseHTRes(resdata,callback){
  var ret = '';
  try{
    var data = eval('('+resdata+')');
    var ch=data.ch;
    var symbol = ch.split(".")[1];
    var price = data.tick.close;
    var now = new Date();
    ret = "火币行情："+now.toLocaleString()+"\n";
    ret = ret + symbol+":"+price.toFixed(8);
  }catch(e){
    console.log(e);
    ret = '';
  }
  callback(ret);

}



function getPrice(callback){
  failed=0;
  getCoinMarket(callback,false);
}

var HttpsProxyAgent = require('https-proxy-agent')
var proxy = 'http://192.168.17.62:3128';
var agent = new HttpsProxyAgent(proxy);

function getBifFinex(usd_cny,callback,withproxy){
  console.log('will get bitfinex:'+withproxy);
  var options = {
    hostname: "api.bitfinex.com",
    port: 443,
    path: '/v2/tickers?symbols=tBTCUSD,tLTCUSD,tETHUSD,tETCUSD,tBCHUSD,tEOSUSD,tXRPUSD,tQTMUSD,tDSHUSD',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.75 Safari/537.36'
    },
    method: 'GET'
  };
  options.agent=agent;
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var code = res.statusCode;
    if(code==200){
      failed=0;
      var resdata = '';
      res.on('data', function (chunk) {
        resdata = resdata + chunk;
      });
      res.on('end', function () {
        parseBitFinexRes(resdata,usd_cny,callback);
      });
      res.on('error',function(){

      })
    }else{
      failed = failed + 1;
      if(failed>1){
        callback('bitfinex BOOM!');
      }else{
        getPrice(callback);
      }
    }
  });
  req.on('error', function(err) {
    console.log('req err:');
    console.log(err);
  });
  req.setTimeout(5000,function(){
    req.end();
    failed = failed + 1;
    if(failed>2){
      callback('bitfinex BOOM!');
    }else{
      getBifFinex(usd_cny,callback,true);
    }
  });
  req.end();
}

function parseBitFinexRes(resdata,usd_cny,callback){
  var list = eval('('+resdata+')');
  var now = new Date();
  var ret = "数字货币行情(Bitfinex)："+now.toLocaleString()+"\n";
  for(var i=0;i<list.length;i++){
    var p = list[i];
    var name = p[0].substring(1,4);
    var price = p[7];
    ret = ret + name + ":$"+price.toFixed(2)+"   \t￥"+(usd_cny*price).toFixed(2)+"\n";
  }
  ret = ret + "1$="+usd_cny+"1￥";
  callback(ret.trim());
}

function getCoinMarket(callback,withproxy, isInterface = false){
  var now = new Date();
  console.log('will get conmarket:'+withproxy);
  var options = {
    hostname: "api.coinmarketcap.com",
    port: 443,
    path: '/v1/ticker/?convert=CNY&limit=30',
    headers: {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.75 Safari/537.36'
    },
    method: 'GET'
  };
  if(withproxy){
    options.agent=agent;
  }
  //options.agent=agent;
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    var code = res.statusCode;
    if(code==200){
      var resdata = '';
      res.on('data', function (chunk) {
        resdata = resdata + chunk;
      });
      res.on('end', function () {
        var data = eval(resdata);
        var ret = "数字货币行情(CoinMarket)："+now.toLocaleString()+"\n";
        var n={"btc":1,"ltc":1,"eth":1,"etc":1,"xrp":1,"eos":1,"bch":1,"qtum":1,"dash":1,"neo":1,"ada":1}
        if(isInterface){
          ret = []
        }
        for(var i=0;i<data.length;i++){
          var pd = data[i];
          var symbol=pd.symbol;
          if(n[symbol.toLowerCase()]){
            var price_usd=parseFloat(pd.price_usd);
            var price_cny=parseFloat(pd.price_cny);
            //var rate = price_cny/price_usd;
            if(isInterface){
              ret.push({
                type: symbol,
                usd: price_usd.toFixed(2),
                cny: price_cny.toFixed(2),
                c1h: pd.percent_change_1h,
                c1d: pd.percent_change_24h
              })
            } else {
              ret = ret + symbol + ":$"+price_usd.toFixed(2)+"   \t￥"+price_cny.toFixed(2)+"\n";
            }
          }
        }
        callback(ret);
      });
      res.on('error',function(){

      })
    }
  });
  req.on('error', function(err) {
    console.log('req err:');
    console.log(err);
    failed = failed + 1;
    if(failed>2){
      callback('CoinMarket BOOM!');
    }else{
      getCoinMarket(callback,true);
    }
  });
  req.setTimeout(5000,function(){
    failed = failed + 1;
    if(failed>2){
      callback('CoinMarket BOOM!');
    }else{
      getCoinMarket(callback,true);
    }
  });
  req.end();
}


module.exports={
  pushToGroup,
  pushTask,
  getPrice,
  getBitFlyer,
  getCoinMarket
}
