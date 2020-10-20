var http=require('http');
var https=require('https');
var tls = require('tls');
var fs = require('fs');
var request = require('request');
let onlineObj = {}
const { DQCore, allGameAction } = require('./ai/DQ/DQgameCore')

var path = require('path');

//const { QQ, MsgHandler } = require('./qqlib');

const{saveTxt,answer,getMsgCount} = require(path.join(__dirname, '/lib/mongo.js'))
const xchange = require('./ai/xchange')
const {cal} = require('./ai/calculator');
const {baiduSearch,baikeReply} = require('./ai/baidusearch');
const {getWeatherByCity} = require('./ai/weather');
const {tulingMsg,getLike,getQAIresponse} = require('./ai/tuling');
const {translateMsg}=require('./ai/translate');
const {money} = require('./ai/money');
const {route} = require('./ai/map');
const {searchSongByName} = require('./ai/song');
const kce = require('./ai/kanColleEquip')
const kcq = require('./ai/kanColleQuest')
const {searchsenka} = require('./ai/kancolle/senka');
const {fight,useMagicOrItem} = require('./ai/favour/battle');
const {handleUserOperation} = require('./ai/chess/road');

const {pairReply}=require('./ai/pairAI');
const {getKancollStaffTweet} = require('./ai/twitter');
const {getShip} = require('./ai/kancolle/ship');
const roulette = require('./ai/Roulette')
const {copperReply} = require('./ai/games/card/copper');

require('./ai/push');


const {beautyReply} = require('./ai/ff14/beauty');

const {replayReply} = require('./ai/replay');
const {getUserNameInGroup,getUserNickInGroupByCache,getGroupName,getGroupMemberNum,banUserRandom} = require('./cq/cache');
const {lottoryReply} = require('./ai/lottory');
const smuggler = require('./ai/mabinogi/smuggler')
// const {drawNameCard} = require('./ai/games/card/draw');
const op = require('./ai/mabinogi/optionset')
const {googleImageSearch} = require('./ai/image/google');
const rua = require('./ai/mabinogi/ruawork')
const {baiduVoice} = require('./ai/voice/baiduvoice')
const {saveChat} = require('./ai/chat/collect');
const {getFoodRate} = require('./ai/kancolle/food');

const {descryptReply} = require('./ai/image/qqspeak');
const rp = require('./ai/rp');
const {G21Boss} = require('./ai/mabinogi/G21Boss');
const checkIgnoreUser = require('./ai/ignoreUser');
const {searchMHW} = require('./ai/mhw/index');
const {searchFeChara} = require('./ai/fe/feChara');
const {replyKancolleRoute} = require('./ai/kancolle/map_new');
const {searchFF14Item} = require('./ai/ff14/item');
const {searchQuest} = require('./ai/ff14/strategy');
const rd = require('./ai/randomDice')
const {zodiac,saveMyZodiac} = require('./ai/zodiac')

const {saveAlarm} = require('./ai/private/alerm');
const {poemReply} = require('./ai/image/xiaobing');

const {simplized,traditionalized,qqlized} = require('./lib/chs_cht');


const {fflogsReply} = require('./ai/ff14/fflogs');
const {fflogs2Reply} = require('./ai/ff14/fflogs2');

const gf = require('./ai/girlsfrontline/index')
const {handleGun} = require('./ai/games/survival/main');
const bomberman = require('./ai/games/Bomberman/main');
const {handleFF14weatherReply} = require('./ai/ff14/ff14weather');

const anr = require('./ai/arknights/arkNightsRecruit')
const ans = require('./ai/arknights/arkNightsCharacter')
const anc = require('./ai/arknights/arkNightsCalc')
const and = require('./ai/arknights/arkNightsBuildingTheme')
const anchan = require('./ai/arknights/arkNightsChallenge')
const anp = require('./ai/arknights/arkNightsCharacterCompare')
const { calendar } = require('./ai/arknights/arkNightsCalendar')

const { PerfectCactpot } = require('./ai/ff14/cactpot')
const {runsetu} = require('./ai/games/card/setu');
//const { wfp } = require('./ai/worldflipper/BossBattlePushing')
const {calAttr} = require('./ai/ff14/attr');
require('./ai/ff14/activity')

// const cov = require('./ai/CoV2020')
const { cov } = require('./ai/CoV2019ByTianApi')
const chp = require('./ai/chp')
const morse = require('./ai/MorseCode')

const {actp} = require('./ai/AnimalCrossing/TurnipProphet')
const { saveDTCPrice } = require('./ai/AnimalCrossing/priceRecord');

const { discord } = require('./ai/PrincessConnect/discord')
const { cherugo } = require('./ai/PrincessConnect/cherugo')
const { guildRankSearch } = require('./ai/PrincessConnect/guildRank')
const { schedule } = require('./ai/PrincessConnect/schedule')
const { chishenme } = require('./ai/chishenme')
const {ff14MarketReply} = require('./ai/ff14/itemmarket');
const {catreply} = require('./ai/games/card/cat');

const {handleFlyindReply} = require('./ai/games/flying/flight_chess');

initWS();
initWS2();
initWS3();
initWS4();

var wsonline = false;
function initWS(){
  var WebSocketClient = require('websocket').client;

  var client = new WebSocketClient();

  client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
  });

  client.on('connect', function(connection) {
    wsonline = true;
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
      console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
      wsonline=false;
      console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        handleMsg(JSON.parse(message.utf8Data))
      }
    });
  });
  client.connect('ws://192.168.17.52:23335/event');
}

function initWS2(){
  var WebSocketClient = require('websocket').client;

  var client = new WebSocketClient();

  client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
  });

  client.on('connect', function(connection) {
    wsonline = true;
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
      console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
      wsonline=false;
      console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        handleMsg(JSON.parse(message.utf8Data),2)
      }
    });
  });
  client.connect('ws://192.168.17.52:24335/event');
}



function initWS3(){
  var WebSocketClient = require('websocket').client;

  var client = new WebSocketClient();

  client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
  });

  client.on('connect', function(connection) {
    wsonline = true;
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
      console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
      wsonline=false;
      console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        handleMsg(JSON.parse(message.utf8Data),3)
      }
    });
  });
  client.connect('ws://192.168.17.52:25335/event');
}

function initWS4(){
  var WebSocketClient = require('websocket').client;

  var client = new WebSocketClient();

  client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
  });

  client.on('connect', function(connection) {
    wsonline = true;
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
      console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
      wsonline=false;
      console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        handleMsg(JSON.parse(message.utf8Data),4)
      }
    });
  });
  client.connect('ws://192.168.17.52:26335/event');
}



function reconnect(){
  if(!wsonline){
    initWS();
    initWS2()
    initWS3()
  }
}


var queue = []
var xqueue = []
function addSendQueue(groupid,msg,botqq){
  var gidstr = groupid+"";
  var vip = 0;
  if(gidstr.startsWith("20570")){
    vip = 3;
  }else if(gidstr.startsWith("69738")){
    vip = 2;
  }else if(gidstr.startsWith("22169")){
    vip = 2;
  }else if(gidstr.startsWith("63508")){
    vip = 2;
  }else if(gidstr.startsWith("78078")){
    vip = 2;
  }else if(gidstr.startsWith("56828")){
    vip = 2;
  }else if(gidstr.startsWith("96435")){
    vip = 2;
  }else if(gidstr.startsWith("14559")){
    vip = 2;
  }else if(gidstr.startsWith("77670")){
    vip = 2;
  }else if(gidstr.startsWith("54982")){
    vip = 2;
  }else if(gidstr.startsWith("57758")){
    vip = 2;
  }else if(gidstr.startsWith("74633")){
    vip = 2;
  }else if(gidstr.startsWith("29096")){
    vip = 2;
  }else if(gidstr.startsWith("59589")){
    vip = 2;
  }else if(gidstr.startsWith("11208")){
    vip = 2;
  }else if(gidstr.startsWith("4193673")){
    vip = 1;
  }else if(gidstr.startsWith("6707501")){
    vip = 1;
  }else if(gidstr.startsWith("176139")){
    vip = 1;
  }else if(gidstr.startsWith("xxxxx")){
    vip = 1;
  }else if(gidstr.startsWith("98265")){
    vip = 1;
  }else if(gidstr.startsWith("10273")){
    vip = 1;
  }else if(gidstr.startsWith("20549")){
    vip = 1;
  }else if(gidstr.startsWith("xxxxx")){
    vip = 1;
  }else if(gidstr.startsWith("18173")){
    vip = 1;
  }else if(gidstr.startsWith("39233")){
    vip = 1;
  }else if(gidstr.startsWith("xxxxx")){
    vip = 1;
  }else if(gidstr.startsWith("39255")){
    vip = 1;
  }else if(gidstr.startsWith("31590")){
    vip = 1;
  }else if(gidstr.startsWith("19302")){
    vip = 1;
  }else if(gidstr.startsWith("xxxxx")){
    vip = 1;
  }else if(gidstr.startsWith("30640")){
    vip = 1;
  }else if(gidstr.startsWith("xxxxx")){
    vip = 1;
  }else if(gidstr.startsWith("xxxxx")){
    vip = 1;
  }else if(gidstr.startsWith("xxxxx")){
    vip = 1;
  }else{
    if(getGroupMemberNum(groupid)<10){
      vip=1;
    }
  }
  var port;
  if(botqq==2){
    port = 24334;
  }else if(botqq==3){
    port = 25334;
  }else if(botqq==4){
    port = 26334;
  }else{
    port = 23334;
  }

  if(port!=23334){
    vip = vip +1;
  }


    msg = msg.replace(/CQ:image,file=sen/gi, "CQ:image,file=file:/home/hduser/upload/tk/coolq-data/cq/data/image/sen")
    msg = msg.replace(/CQ:cardimage,file=sen/gi, "CQ:cardimage,file=file:/home/hduser/upload/tk/coolq-data/cq/data/image/sen")
    msg = msg.replace(/CQ:record,file=sen/gi, "CQ:record,file=file:/home/hduser/upload/tk/coolq-data/cq/data/record/sen")



    var bdy = {"group_id": groupid, message: msg};
    console.log("send:"+groupid+":"+msg);
    request({
        headers:{
            "Content-Type":"application/json"
        },
        method: "POST",
        url: 'http://192.168.17.52:'+port+'/send_group_msg',
        body: JSON.stringify(bdy)
    }, function(error, response, body) {
        if (error && error.code) {
            console.log('pipe error catched!')
            console.log(error);
        } else {
            console.log('ok1');
        }
        saveChat(groupid, 981069482, "百百", msg,port);
    });
}



function handleMsg(msgObj,botqq){
  try{
    handleMsg_D0(msgObj,botqq);
  }catch(e){
    console.log(e);
  }
}

function handleMsg_D0(msgObj,botqq){
  var content = msgObj.message;
  if (content) {
    if (content.indexOf('&amp;') > -1) {
      content = content.replace(/&amp;/g, '&');
    }
    if (content.indexOf('&#44;') > -1) {
      content = content.replace(/&#44;/g, ',');
    }
    if (content.indexOf('[CQ:at,qq=2375373419]') > -1) {
      content = content.replace(/\[CQ:at,qq=2375373419\]/g, '百百');
    }
    if (content.indexOf('[CQ:at,qq=3291864216]') > -1) {
      content = content.replace(/\[CQ:at,qq=3291864216\]/g, '百百');
    }
    if (content.indexOf('[CQ:at,qq=1840239061]') > -1) {
      content = content.replace(/\[CQ:at,qq=1840239061\]/g, '百百');
    }
    if (content.indexOf('[CQ:at,qq=914853856]') > -1) {
      content = content.replace(/\[CQ:at,qq=914853856\]/g, '百百');
    }
    content = simplized(content);
    msgObj.message=content;
  }
  handleMsg_D(msgObj,botqq);
}



function handleMsg_D(msgObj,botqq) {
  // console.log('\n======================')
  // console.log(msgObj)
  // console.log(botqq)
  // console.log('======================\n')
  var type = msgObj.message_type;
  var groupid = msgObj.group_id;
  var content = msgObj.message;
  var callback
  var port;
  if(botqq==2){
    port = 24334;
  }else if(botqq==3){
    port = 25334;
  }else if(botqq==4){
    port = 26334;
  }else{
    port = 23334;
  }
    
  var gidstr= groupid+"";
  var force=0;
  if(content&&content.length>6){
    if(content.trim().substring(0,6)=="!force"){
      force=1;
    }
  }
  if(!force){
    if((
        gidstr.startsWith("20570")||
        gidstr.startsWith("22169")||
        gidstr.startsWith("74633")||
        gidstr.startsWith("22169")||
        gidstr.startsWith("67096")||
        gidstr.startsWith("77670")||
      gidstr.startsWith("69738")||

        gidstr.startsWith("61614")||
        gidstr.startsWith("xxxxx")
      )&&port==23334){
      return;
    }
    if((
        gidstr.startsWith("20570")||
        gidstr.startsWith("22169")||
        gidstr.startsWith("xxxxx")

      )&&port==25334){
      return;
    }
  }else{
    content = content.substring(6).trim();
  }

  if(getMsgCount(port)>1700){
    return;
  }

  if(msgObj.notice_type == 'group_increase') {
    if(new Set([2375373419, 3291864216, 1840239061, 981069482, 914853856, 2771362647]).has(msgObj.user_id)){
      return
    }
    // 加群操作
    let wellcome
    switch(groupid){
      case 96681597:
        wellcome = `欢迎新人[CQ:at,qq=${msgObj.user_id}]，入服教程：https://bbs.gugu6.info/forum.php?mod=viewthread&tid=95#lastpost`
        break
      case 672926817:
        wellcome = `看！新内鬼[CQ:at,qq=${msgObj.user_id}]`
        break
      default:
        wellcome = `欢迎[CQ:at,qq=${msgObj.user_id}]加群`
        break
    }
    addSendQueue(groupid,wellcome,botqq);

    return
  }

  if(msgObj.notice_type == 'group_decrease') {
    if(msgObj.sub_type == 'kick') {
      addSendQueue(groupid,`${msgObj.user_id}被踹走了`,botqq);
    } else {
      addSendQueue(groupid,`${msgObj.user_id}溜走了`,botqq);
    }
    return
  }


  if (type == 'private') {
    var userid = msgObj.user_id;
    callback = function (res) {
      if (res.trim().length > 0) {
        setTimeout(function () {
          var options = {
            host: '192.168.17.52',
            port: port,
            path: '/send_private_msg?user_id=' + userid + '&message=' + encodeURIComponent(res),
            method: 'GET',
            headers: {}
          };
          console.log("priv:" + userid + ":" + content + ":" + res);
          var req = http.request(options);
          req.on('error', function (err) {
            console.log('req err:');
            console.log(err);
          });
          req.end();
        }, 1000);
      }
    }
    if (saveAlarm(content, userid, callback)) {
    } else {
      //TODO
      var from = userid;
      var groupid = 999999999;
      var groupName = 'private_group_name';
      var name = 'n';
      var nickname = 'n'
      handle_msg_D2(content,from,name,groupid,callback,groupName,nickname,'private',port)
    }
    return;
  }
  if (type != 'group') {
    return;
  }
  var from = msgObj.user_id;

  var name = getUserNameInGroup(from, groupid,port);
  var nickname = getUserNickInGroupByCache(from, groupid);
  console.log(groupid + ":" + name + ":" + content)
  if (name == null) {
    name = nickname;
  }
  if (name.startsWith("nick error") || name.startsWith("card error")) {
    name = '[CQ:at,qq=' + from + ']';
  }

  var groupName = getGroupName(groupid,port);
  saveChat(groupid, from, name, content,port);
  callback = function (res, blank) {
    if (res.trim().length > 0) {
      addSendQueue(groupid,res,botqq);
    }
  }
  handle_msg_D2(content,from,name,groupid,callback,groupName,nickname,'group',port)
}

function handle_msg_D2(content,from,name,groupid,callback,groupName,nickname,msgType,port){





  content=content.trim();

  if(content.startsWith("w")){

    var options = {
      host: '192.168.17.52',
      port: 11005,
      path: '/c?d='+encodeURIComponent(content)+'&gid='+groupid+"&name="+encodeURIComponent(name)+"&qq="+from+"&port="+port,
      method: 'GET',
      headers: {}
    };
    var req = http.request(options,function(res){
      var resdata = '';
      res.on('data', function (chunk) {
        resdata = resdata + chunk;
      });
      res.on('end', function () {
        if(resdata.length>0){
          callback(resdata);
        }
      });
    });
    req.on('error', function (err) {
      console.log('req err:');
      console.log(err);
    });
    req.end();


    return;
  }

  if((content=='百百')||(content.indexOf('百百')>=0&&content.indexOf('菜单')>=0)){
    var ret = "";
    ret = ret + "欢迎使用百百型机器人\n";
    ret = ret + "通用功能导航：【`】【·】【ˋ】【'】【‘】【，】任选其一\n";
    ret = ret + "游戏导航：【玩游戏】\n";
    ret = ret + "最终幻想XIV导航【ffxiv】\n";
    ret = ret + "明日方舟导航【ark】\n";
    ret = ret + "洛奇导航【opt】\n"
    ret = ret + "舰队collection导航【'e】\n"
    ret = ret + "大头菜价记录和预测【dtsh】\n"
    ret = ret + "其他/意见或建议/定制功能请到\n"
    ret = ret + "https://github.com/TouhouFishClub/baibaibot/issues"
    callback(ret.trim());
    return;
  }

  if(content=="玩游戏"){
    var ret = "";
    ret = ret + "俄罗斯轮盘【俄罗斯轮盘】\n";
    ret = ret + "炸弹人【炸弹人】\n";
    ret = ret + "抽卡【抽卡】\n";
    ret = ret + "群友互砍【'g】\n";
    ret = ret + ""
    callback(ret.trim());
    return;
  }









  if(
    content === '炸弹人' ||
    content === '炸彈人' ||
    content === '参加' ||
    content === '參加' ||
    content === '放置' ||
    content === '移动' ||
    content === '移動' ||
    content === '待机' ||
    content === '待機'
  ){
    bomberman(content, from, name, groupid, callback)
    return
  }





  var rcontent = content;
  rcontent=rcontent.replace(/上/g,"u").replace(/下/g,"d").replace(/左/g,"l").replace(/右/g,"r");
  rcontent=rcontent.replace(/开火/g,"开枪").replace(/fire/g,"开枪");
  rcontent=rcontent.replace(/move/g,"移动");
  var survivalnew = false;
  if(rcontent=="俄罗斯轮盘"){
    survivalnew=true;
  }else if(rcontent.indexOf("开枪")>-1){
    if(rcontent.startsWith("开枪")&&rcontent.length==3){
      survivalnew=true;
    }else if(rcontent.startsWith("向")&&rcontent.endsWith("开枪")&&rcontent.length==4){
      survivalnew=true;
    }else if(rcontent=="开枪"){
      survivalnew=true;
    }
  }else if(rcontent.indexOf("移动")>-1){
    if(rcontent.startsWith("移动")&&rcontent.length==3){
      survivalnew=true;
    }else if(rcontent.startsWith("向")&&rcontent.endsWith("移动")&&rcontent.length==4){
      survivalnew=true;
    }else if(rcontent=="移动"){
      survivalnew=true;
    }
  }else if(rcontent=="u移"||rcontent=="d移"||rcontent=="l移"||rcontent=="r移"){
    survivalnew=true;
  }else if(rcontent=="u射"||rcontent=="d射"||rcontent=="l射"||rcontent=="r射"){
    survivalnew=true;
  }else if(rcontent=="加入"||rcontent=="参加"||rcontent=="join"){
    survivalnew=true;
  }
  if(survivalnew==true){
    handleGun(rcontent,from,name,groupid,callback);
    return;
  }


  if(
    rcontent === '俄罗斯轮盘' ||
    rcontent === '俄羅斯輪盤' ||
    rcontent === '加入' ||
    rcontent === '加入' ||
    rcontent === 'join' ||
    rcontent === '參加' ||
    rcontent === '参加' ||
    rcontent === '开枪' ||
    rcontent === '开火' ||
    rcontent === 'fire' ||
    rcontent === '開火' ||
    rcontent === '開槍' ||
    rcontent === '退出' ||
    rcontent === '退出' ||
    rcontent === 'quit' ||
    rcontent === 'escape' ||
    rcontent === '逃跑' ||
    rcontent === '跳过' ||
    rcontent === 'skip' ||
    rcontent === 'pass' ||
    rcontent === '逃跑' ||
    rcontent === 'kill' ||
    rcontent === '作弊' ||
    rcontent === '作弊' ||
    rcontent === '犯規' ||
    rcontent === '犯规'
  ){
    roulette(name,rcontent,callback,from,groupid)
    return
  }


  if(content.trim() === '走私查询'){
    smuggler(callback)
    return
  }

  if(content.trim()=='时尚品鉴'){
    beautyReply(content,groupid,callback);
    return;
  }

  if(content=="飞行棋"||content.startsWith("fly")){
    handleFlyindReply(content,from,groupid,callback)
    return;
  }



  let con =content.trim(), fi = con.substring(0,4)
  if(fi === '释放查询' || fi === 'opts'){
    op(name, con.substring(4).trim(), 'normal', callback);
    return;
  }
  if(fi == 'ffiv'){
    searchFF14Item(con.substring(4),name,callback);
    return;
  }
  if(fi == 'ffiq'){
    searchQuest(con.substring(4),name,callback);
    return;
  }
  if(fi == 'ffid'){
    ff14MarketReply(con.substring(4),from,callback);
    return;
  }

  if(con.startsWith("/")){
    calAttr(content.substring(1),from,callback);
    return;
  }
  fi = con.substring(0,5)
  if(fi == 'ffxiv'){
    searchFF14Item(con.substring(5),name,callback);
    return;
  }

  if(fi == 'fflog'){
    fflogs2Reply(con.substring(5).trim(),name,callback,0);
    return;
  }
  if(fi == 'cnlog'){
    fflogs2Reply(con.substring(5).trim(),name,callback,1);
    return;
  }

  fi = con.substring(0, 3)
  if(fi == 'ffc') {
    PerfectCactpot(con.substring(3), callback)
  }


  if(con === 'ruawork' || (con.indexOf('茹娅') + 1 && con.indexOf('上班') + 1)){
    rua(callback)
    return
  }

  if(con === 'jrrp' || con == '今日运势'){
    rp(from, callback)
    return
  }

  if(con.indexOf('座运势') + 1 && con.length == 5){
    zodiac(con, callback)
    return
  }
  if(con.startsWith("我的星座是")){
    saveMyZodiac(con.substring(5),from,name,callback);
    return;
  }

  if(con.startsWith('作诗')||con.startsWith('写诗')){
    poemReply(con.substring(2),name,callback);
    return;
  }

  fi = con.substring(0,2)
  if(fi=='fe'){
    searchFeChara(content.substring(2),from,groupid,callback);
    return;
  }



  if(con == '方舟老黄历') {
    calendar(callback)
  }
  if(con == '中午吃什么') {
    chishenme(callback)
  }
  if(con == 'bcr日程') {
    schedule('cn', callback)
  }
  if(con == 'pcr日程') {
    schedule('jp', callback)
  }
  if(con == 'chp' || con == '彩虹屁') {
    chp(callback)
  }


  if(con.substring(0, 3) == 'mct') {
    morse(con.substring(3).trim(), false, callback)
    return
  }

  if(con.substring(0, 2) == 'mc') {
    morse(con.substring(2).trim(), true, callback)
    return
  }

  let fie4 = con.substring(0, 4)
  if(fie4 == '切噜～♪') {
    cherugo(con.substring(4), false, callback)
    return
  }
  if(fie4 == '切噜一下') {
    cherugo(con.substring(4), true, callback)
    return
  }

  if(con.toLowerCase() === 'bcr') {
    callback(`bcr模块指令已迁移至sbcr`)
    return
  }

  if(fie4.toLowerCase() == 'sbcr'){
    // console.log('=============')
    // console.log(con.substring(3))
    discord(con.substring(4), from, groupid, callback);
    return;
  }

  let fie = con.substring(0, 3)
  if(fie.toLowerCase() === 'bcs') {
    // callback('活动结束已关闭此功能')
    // return
    let grs = con.substring(3).trim(), sp = grs.split(' -- '), option = {}
    if(sp.length == 2) {
      grs = sp[0]
      if(from == 799018865) {
        let params = sp[1]
        params.split('&').forEach(p => {
          let s = p.split('=')
          if(s.length == 2) {
            option[s[0]] = s[1]
          } else {
            option[s[0]] = true
          }
        })
      }
    }
    guildRankSearch(grs, from, groupid, callback, option)
    return
  }
  if(fie.toLowerCase() == 'ark'){
    let sa, si
    switch(con.substring(3, 4)){
      case 's':
      case 'S':
        sa = con.substring(4)
        si = sa.indexOf('+')
        if(si > -1) {
          sa = sa.substring(si + 1)
        }
        ans(from, sa, callback)
        break;
      case 'e':
      case 'E':
        sa = con.substring(4)
        si = sa.indexOf('+')
        if(si > -1) {
          sa = sa.substring(si + 1)
        }
        anc(from, sa, callback)
        break;
      case 'd':
      case 'D':
        sa = con.substring(4)
        si = sa.indexOf('+')
        if(si > -1) {
          sa = sa.substring(si + 1)
        }
        and(from, sa, callback)
        break;
      case 'c':
      case 'C':
        sa = con.substring(4)
        si = sa.indexOf('+')
        if(si > -1) {
          sa = sa.substring(si + 1)
        }
        anchan(sa, callback)
        break;
      case 'p':
      case 'P':
        sa = con.substring(4)
        si = sa.indexOf('+')
        if(si > -1) {
          sa = sa.substring(si + 1)
        }
        anp(from, sa, callback)
        break;
      case 'l':
      case 'L':
        calendar(callback)
        break;
      default:
        sa = con.substring(3)
        si = sa.indexOf('+')
        if(si > -1) {
          sa = sa.substring(si + 1)
        }
        si = sa.toLowerCase().indexOf('tag')
        if(si > -1) {
          sa = sa.substring(si + 3)
        }
        anr(from, sa, callback)
    }
    return
  }

  if(fie.toLowerCase() == 'dtc'){
    actp(con.substring(3), from, groupid, -1, callback);
    return;
  }
  if(fie.toLowerCase() == 'dts'){
    saveDTCPrice(con.substring(3),from,groupid,callback);
    return;
  }

  if(fie == 'opt' && fi != 'opts'){
    op(name, con.substring(3).trim(), 'image', callback);
    return;
  }
  if(rcontent=='好感度'){
    getLike(from,name,callback);
    return;
  }

  // if(rcontent.startsWith("抽卡")){
  //   drawNameCard(name,from,callback,groupid);
  //   return;
  // }


  if(rcontent.startsWith("猫图")||rcontent.startsWith("吸猫")){
    catreply(rcontent.substring(2),from,callback);
    return;
  }

  if(port!=22222){
    if(rcontent.startsWith("炼铜1")){
      copperReply(rcontent,groupid,from,callback);
      return;
    }
    if(rcontent.startsWith("炼铜2")){
      if(groupid == 720801895) return
      copperReply(rcontent,groupid,from,callback);
      return;
    }

    if(rcontent.startsWith("色图")||rcontent.startsWith("炼铜")){
      runsetu(rcontent,groupid,from,callback,port);
      return;
    }
  }




  if(rcontent.startsWith("搜图")){
    googleImageSearch(content.substring(2),callback)
    return;
  }

  var first = content.substring(0,1);
  if(first=="*"||first=='×'){
    lottoryReply(content.substring(1),name,callback);
    return;
  }
  if(first=="%"){
    replyKancolleRoute(content.substring(1),name,callback);
  }




  if(first=='`'||first=='·'||first=='ˋ'||first=="'"||first=="‘"||first=="，"){

    var c1 = content.substring(1);
    if(c1==""){
      var ret = "`1+名词：百科查询\n翻译成中文：`6+要翻译的内容\n翻译成日文：`2+要翻译的内容\n翻译成英文：`3+要翻译的内容\n";
      ret = ret + "`4+内容：百度查询\n`c汇率转换\n`0+数字：大写数字转换\n";
      ret = ret + '`d50x10：ROLL10次小于50整数\n';
      ret = ret + "天气预报：城市名+天气\n教百百说话：问题|答案\n计算器：直接输入算式\n闲聊：``+对话\n";
      ret = ret + "今日运势占卜【今日运势】【jrrp】\n";
      callback(ret);
    }else{
      reply(c1,name,callback,groupid,from,groupName,nickname,port);
    }
    return;
  }

  var n = content.indexOf('天气');
  if(n==2){
    var place = content.substring(0,2);
    if((place.indexOf("风")>=0)||(place.indexOf("冰")>=0)||(place.indexOf("火")>=0)||(place.indexOf("水")>=0)){
      handleFF14weatherReply(content,callback);
      return;
    }
  }

  let co = content.indexOf('疫情')
  if(co >= 0 && co <= 6 && content.length - co == 2) {
    cov(content.substring(0, co), callback)
    return
  }
  if(content == '硝局的花园') {
    cov(
      '硝局的花园',
      callback,
      true,
      ['现有女友', '今日新增女友', '确诊女友', '疑似女友', '境外女友'],
      {
        name: '硝局的花园',
        type: 'other',
      },
      {
        confirmedCount: [~~(8 * Math.random()), ~~(4 * Math.random())],
        curedCount: [~~(200 * Math.random()), ~~(100 * Math.random())],
        currentConfirmedCount: [~~(4 * Math.random()), ~~(2 * Math.random())],
        deadCount: [~~(4 * Math.random()), ~~(2 * Math.random())],
        suspectedCount: [~~(200 * Math.random()), ~~(100 * Math.random())]
      },
      '硝局的花园',
    )
    return
  }

  if(n>1&&n<10&&rcontent.length==n+2){
    var city = content.substring(0,n).trim();
    try{
      getWeatherByCity(city,name,callback);
    }catch(e){
      console.log(e);
    }
    return;

  }
  var ca = content.split('|');
  if(ca.length==2){
    if(ca[0].length<300 && ca[0].split(' ').length < 2){
      saveTxt(ca[0],ca[1],name,groupName,callback,from,groupid);
      return;
    }
  }

  var calret = cal(content);
  if(calret){
    callback(content+"="+calret);
    return;
  }
  if(content.indexOf('百百')>-1){
    tulingMsg(from,content.trim(),callback,groupid);
    return;
  }
  answer(content,name,groupName,callback,groupid,from);
  replayReply(content,name,groupid,callback,from,port);
  if(msgType=='private'){
    tulingMsg(from,content.trim(),callback,groupid);
    return;
  }
}

function reply(content,userName,callback,groupid,from,groupName,nickname,port){
  var first = content.substring(0,1);
  if(content.substring(0, 2) == 'gf'){
    gf(content.substring(2), callback)
  } else if(first=='`'||first=='·'||first=='ˋ'||first=="'"||first=="‘"||first=="，"){
    tulingMsg(userName,content.substring(1),callback,groupid);
  }else if(first==2){
    translateMsg(content.substring(1),'ja',callback);
  }else if(first==3){
    translateMsg(content.substring(1),'en',callback);
  }else if(first==1){
    baikeReply(content.substring(1),userName,callback);
  }else if(first==4){
    baiduSearch(userName,content.substring(1),callback);
  }else if(first==0){
    callback(money(content.substring(1)));
  }else if(first=='b'||first=='B'){
    banUserRandom(from,groupid);
  }else if(first=='c'||first=='C'){
    xchange(userName,content.substring(1),callback);
  }/*else if(first=='d'||first=='D'){
    pairReply(content.substring(1),userName,callback);
  }*/else if(first=='t'||first=='T'){
    getKancollStaffTweet(content.substring(1),userName,callback);
  }else if(first=="e"||first=='E'){
    kce(userName,content.substring(1),callback);
  }else if(first=="l"||first=='L'){
    getShipReply(content.substring(1),userName,callback);
  }else if(first=="q"||first=='Q'){
    kcq(userName,content.substring(1),callback);
  }else if(first=="i"||first=='I'){
    descryptReply(content.substring(1),callback);
  }else if(first=="k"||first=='K'){
    getShip(content.substring(1),callback);
  }else if(first=="z"||first=='Z'){
    searchsenka(userName,content.substring(1),callback,from);
  }else if(first=='s'||first=='S'){
    searchSongByName(userName,content.substring(1),callback);
  }else if(first=='r'||first=='R'){
    // rd(content.substring(1), callback)
    callback(""+Math.floor(Math.random()*parseInt(content.substring(1))));
  }else if(first=='d'||first=='D'){
    rd(content.substring(1), from, callback)
    // callback(""+Math.floor(Math.random()*parseInt(content.substring(1))));
  }else if(first=='w'||first=='W'){
    searchMHW(content.substring(1),from,groupid,callback);
  }else if(first=='f'||first=='F'){
    fight(from,content.substring(1),groupid,callback,port);
  }else if(first=='g'||first=='G'){
    useMagicOrItem(from,userName,content.substring(1),groupid,callback,port);
  }else if(first=='m'||first=='M'){
    handleUserOperation(from,content.substring(1),qqq.getMemberListInGroup(groupid),callback);
  }else if(first==8){
    var ca = content.substring(1).split('-');
    if(ca.length==2){
      route(0,ca[0],ca[1],callback);
    }
  }else if(first=='6'){
    translateMsg(content.substring(1),'zh-CHS',callback)
  }else{
    translateMsg(content,'zh-CHS',callback)
  }
}










const test1='123123'

module.exports={
  handleMsg,
  reconnect,
  reply,
  handle_msg_D2,
  test1
}


