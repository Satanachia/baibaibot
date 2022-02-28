var MongoClient = require('mongodb').MongoClient;
var mongourl = require('../../baibaiConfigs').mongourl;
var gm = require('gm')
var request = require("request");
var imageMagick = gm.subClass({ imageMagick : true });
var {sendGmImage} = require('../../cq/sendImage');


var tmpfight = {};
var limitFight = {};
var checkmsg = {};



const {getGroupMemInfo} = require('../../cq/cache');





var udb;
var cl_user;
var cl_chat;

initDB();
function initDB(){
  MongoClient.connect(mongourl, function(err, db) {
    udb=db;
    cl_user = db.collection('cl_user');
    cl_chat = db.collection('cl_chat');
  });
}











function fight(fromid,content,gid,callback){
  var from;
  var to;

  content=content.trim();
  if(content.substring(0,1)==1&&content.length==2){
    var tmp = tmpfight[fromid];
    var no = content.substring(1);
    if(tmp){
      var from=tmp.f;
      var to = tmp[no];
      if(from&&to){
        fightUser(from,to,callback,gid)
      }
    }else{
      callback(from+'砍向了'+'空气'+',造成'+Math.floor(Math.random()*100-50)+'点伤害');
    }
    return;
  }
  var tom={};
  var memInfo = getGroupMemInfo(gid);
  if(!memInfo){
    callback(from+'不小心砍向了自己,造成'+Math.floor(Math.random()*1000-500)+'点伤害');
    return;
  }
  for(var qq in memInfo){
    var info = memInfo[qq];
    if(fromid==info.user_id){
      from = info.nickname;
    }
    if(info.nickname&&info.nickname.indexOf(content)>=0){
      tom[info.nickname]=1;
      continue;
    }
    if(info.card&&info.card.indexOf(content)>=0){
      tom[info.nickname]=1;
      continue;
    }
  }
  if(content.substring(0,1).toUpperCase()=="B"&&content.length==2){
    to = content.toUpperCase();
    fightUser(from,to,callback,gid);
    return;
  }
  var toa=Object.keys(tom);
  if(toa.length==1&&from){
    to=toa[0];
    if(from&&to){
      fightUser(from,to,callback,gid)
    }else{
      callback(content+'是谁？'+from+'砍向了'+content+',造成'+Math.floor(Math.random()*1999999-999999)+'点伤害');
    }
  }else{
    if(toa.length>9){
      callback(from+'砍向了'+'空气'+',造成'+Math.floor(Math.random()*1000-500)+'点伤害');
    }else{
      var ret = "请选择：\n";
      tmpfight[fromid]={f:from};
      for(var i=0;i<toa.length;i++){
        ret = ret + '`f1'+i+' | '+toa[i]+'\n';
        tmpfight[fromid][i]=toa[i]
      }
      callback(ret.trim());
    }
  }
}




function sendFightImage(wd,callback){
  var wa = wd.split('\n');
  var maxwd = 0;
  var uwd = 32;
  var uw = "";
  for(var i=0;i<wa.length;i++){
    var lw = wa[i];
    var ud = "";
    while(lw.length>uwd){
      ud = ud + lw.substring(0,uwd)+"\n";
      lw = lw.substring(uwd);
    }
    if(lw.length>0){
      uw = uw + ud +lw+"\n";
    }else{
      uw = uw + ud;
    }
  }
  var ua = uw.split('\n');
  for(var i=0;i<ua.length;i++){
    if(ua[i].length>maxwd){
      maxwd = ua[i].length;
    }
  }

  var len = ua.length;
  var imgname = new Date().getTime()+"";
  var folder = 'static/'

  var img1 = new imageMagick("static/blank.png");
  console.log("len:"+maxwd+":"+len);
  img1.resize(maxwd*19+29, len*26+24,'!') //加('!')强行把图片缩放成对应尺寸150*150！
    .autoOrient()
    .fontSize(20)
    .fill('blue')
    .font('./font/STXIHEI.TTF')
    .drawText(0,0,uw,'NorthWest');
  sendGmImage(img1,'',callback);
}








function checkChat(port){
  var from = new Date();
  from.setHours(0);
  from.setMinutes(0);
  from.setSeconds(0);
  var query = {'_id': {'$gt':from},uid:2375373419,port:port};
  console.log(query);
  cl_chat.count(query).then(function(ret){
    checkmsg[port]={n:ret,ts:new Date().getTime()};
  })
}



function fightUser(from,to,Ncallback,gid,port){
  if(from=="百百"){
    return;
  }
  var now = new Date();

  var chatCount = checkmsg[port];
  if(chatCount){
    console.log(JSON.stringify(chatCount));
  }
  var canf;
  if(!chatCount){
    checkChat(port);
    canf=true
  }else{
    var cthents = chatCount.ts;
    var daythen = Math.floor((cthents+3600000*8)/86400000);
    var daynow = Math.floor((now.getTime()+3600000*8)/86400000);
    if(daythen==daynow){
      var cthencount = chatCount.n;
      if(cthencount<2000){
        var sub = Math.floor((now.getTime()-cthents)*150/3600000);
        if(sub+cthencount>2000){
          chatCount();
        }
        console.log(JSON.stringify(chatCount));
        canf=true;
      }else{
        canf=false;
      }
    }else{
      canf=true;
    }
  }
  if(!canf){
    Ncallback('本日砍人次数已用尽');
    return;
  }



  var callback = function(ret){
    sendFightImage(ret,Ncallback);
  }

  var add=6;
  var gidstr = gid + "";
  if((port==23334)&&(!gidstr.startsWith("20570"))){
    callback('此群不支持砍人');
    return;
  }if(gidstr.startsWith("74633")){
    add=4;
  }else if(gidstr.startsWith("20570")){
    add=6;
  }else if(gidstr.startsWith("67096")){
    add=3;
  }else{
    callback('此群不支持砍人');
    return;
  }









  var then = limitFight[from];
  if(!then){
    then = {ts:0,c:0};
  }
  var thents = then.ts;
  var thenc = then.c;
  var tsnew;
  var cnew;
  if(now.getTime()-thents>1000000){
    tsnew = now.getTime();
    cnew = 1;
  }else{
    tsnew = thents;
    cnew = thenc;
  }
  var maxtime = 5;
  if(new Date().getHours()<8){
    maxtime = 25;
  }
  if(cnew>maxtime){
    callback(from+'疲劳中无法攻击,恢复时间：\n'+new Date(tsnew+1000000).toLocaleString());
    return;
  }

  cnew = cnew+6;
  limitFight[from]={ts:tsnew,c:cnew};
  if(from==to){
    callback(from+'自杀了');
    return;
  }
  var query = {'_id':from};
  cl_user.findOne(query, function(err, data) {
    if (data) {

    } else {
      init = {'_id': from, hp: 100, mp: 100, tp: 100, gold: 100,lv: 1,exp:0,
         str: 9, int: 9, agi: 9, atk:9, def:9, mag:9,luck:9,status:0,
        love: 0}
      data = init;
    }
    var mpcost = 20;
    if(data.status==3){
      mpcost = 50;
    }
    if(data.status==4){
      mpcost = 0;
      data.hp=Math.floor(data.hp/2);
    }
    if(data.mp<=mpcost){
      callback(from+'mp不足,无法发动攻击');
    }else if(data.status==1){
      callback(from+'死了也想砍'+to+',但砍到了自己,受到'+Math.floor(Math.random()*10000-5000)+'点伤害');
    }else{
      data.mp=data.mp-mpcost;
      var q2 = {'_id':to};
      cl_user.findOne(q2,function(err, data2) {
        if (data2) {

        } else {
          init = {'_id': to, hp: 100, mp: 100, tp: 100, gold: 100,lv: 1,exp:0,
            str: 9, int: 9, agi: 9, atk:9, def:9, mag:9,luck:9,status:0,
            love: 0}
          data2 = init;
        }
        if(data2.status==1){
          callback(from+'想鞭尸'+to+',但砍到了自己,受到'+Math.floor(Math.random()*100000-50000)+'点伤害');
        }else{
          var ret = battle(data,data2);
          callback(ret);
        }
      })
    }
  });
}


const {battlePlusBeforeDamage,battlePlusAfterDamage} = require('./job');
function battle(data1,data2){
  var ret='';
  var damageAndStr = generateDamage(data1,data2,1,1);
  var damage = damageAndStr[0];

  var dmgstr = damageAndStr[1];
  ret = ret + dmgstr;
  data1.exp=data1.exp+damage;
  if(damage>data2.hp){
    data2.status=1;
    if(data2._id=="B1"){
      data2.hp=999+data2.lv*50;
      data2.atk=data2.lv*4+30;
      data2.lv=data2.lv+1;
    }else{
      data2.hp=100;
    }

    ret = ret + data2._id+'被砍死了,失去'+(data2.gold/2)+'金钱,稍后复活\n'+data1._id+'获得'+(15+data2.gold/2)+'金钱';

    var lvsub = data2.lv-data1.lv;
    var addexp = 25+data2.lv*data2.lv*data2.lv;
    var subadd = 35+Math.floor(Math.min(addexp,Math.pow(2,lvsub)));
    addexp=addexp+subadd;
    if(lvsub>-40){
      addexp = Math.floor(addexp*(0.5+lvsub/100))
    }else{
      addexp = 29+Math.floor(Math.random()*60);
    }


    data1.exp = data1.exp+addexp;
    ret = ret + "\n"+data1._id+'砍死敌人，获得额外'+addexp+'经验';


    data1.gold=data1.gold+Math.floor(15+data2.gold/2);
    data2.gold=data2.gold-Math.floor(data2.gold/2);
  }else{
    data2.hp=data2.hp-damage;
    var damageAndStr = generateDamage(data2,data1,2,1);
    var damage = damageAndStr[0];
    var dmgstr = damageAndStr[1];
    data2.exp=data2.exp+damage;
    ret = ret + dmgstr;
    if(damage>data1.hp){
      data1.status=1;
      data1.hp=100;
      ret = ret + data1._id+'被砍死了失去'+(data1.gold/2)+'金钱,稍后复活\n'+data2._id+'获得'+(15+data1.gold/2)+'金钱';


      if(data2._id=="B3"){
        var rd = Math.floor(Math.random()*5);
        if(rd==0){
          data1.atk=data1.atk-1;
          ret = ret + "\nB3发动了吸食,"+data1._id+"攻击力-1";
        }else if(rd==1){
          data1.def=data1.def-1;
          ret = ret + "\nB3发动了吸食,"+data1._id+"防御力-1";
        }else if(rd==2){
          data1.luck=data1.luck-1;
          ret = ret + "\nB3发动了吸食,"+data1._id+"幸运-1";
        }else if(rd==3){
          data1.agi=data1.agi-1;
          ret = ret + "\nB3发动了吸食,"+data1._id+"速度-1";
        }else{
          ret = ret + "\nB3发动吸食失败了";
        }
      }





      data2.gold=data2.gold+Math.floor(15+data1.gold/2);
      data1.gold=data1.gold-Math.floor(data1.gold/2);

    }else{
      data1.hp=data1.hp-damage;
      if(data1.agi>data2.agi*(Math.random()/2+1)){
        ret = ret + data1._id+'对'+data2._id+'发动了EX袭击\n';
        var rate = data1.agi/data2.agi-1;
        if(rate<0.5){
          rate = 0.5;
        }
        if(rate>2){
          rate = 2;
        }
        var damageAndStr = generateDamage(data1,data2,1,rate);
        var damage = damageAndStr[0];
        var dmgstr = damageAndStr[1];
        ret = ret + dmgstr;
        data1.exp=data1.exp+damage;
        if(damage>data2.hp){
          data2.status=1;
          if(data2._id=="B1"){
            data2.hp=999+data2.lv*50;
            data2.atk=data2.lv*4+30;
            data2.lv=data2.lv+1;
          }else{
            data2.hp=100;
          }
          ret = ret + data2._id+'被砍死了,失去'+(data2.gold/2)+'金钱,稍后复活\n'+data1._id+'获得'+(15+data2.gold/2)+'金钱';


          var lvsub = data2.lv-data1.lv;
          var addexp = 25+data2.lv*data2.lv*data2.lv;
          var subadd = 35+Math.floor(Math.min(addexp,Math.pow(2,lvsub)));
          addexp=addexp+subadd;
          if(lvsub>-40){
            addexp = Math.floor(addexp*(0.5+lvsub/100))
          }else{
            addexp = 29+Math.floor(Math.random()*60);
          }

          data1.exp = data1.exp+addexp;
          ret = ret + "\n"+data1._id+'砍死敌人，获得额外'+addexp+'经验';


          data1.gold=data1.gold+Math.floor(15+data2.gold/2);
          data2.gold=data2.gold-Math.floor(data2.gold/2);
        }else {
          data2.hp = data2.hp - damage;
        }
      }else{
        ret = ret + "ex袭击未发生";
      }
    }
  }
  cl_user.save(data1);
  cl_user.save(data2);
  return ret;
}

function generateDamage(data1,data2,type,rate2){
  if(data1.status==1||data1.status==2){
    var damage = 1;
    var str = data1._id+'砍向'+data2._id+',造成'+damage+'点伤害,获得'+damage+'点经验\n';
    return [damage,str];
  }else{
    var sum = data1.atk+data1.luck+data1.agi;
    var max = sum/3;
    var criticalrate = ((data1.luck<max?data1.luck:(max+Math.sqrt(data1.luck)))-data2.lv);
    var critical = Math.random()*100<criticalrate;
    if(type==2){
      critical=false;
    }
    var criticalrate = 1;
    if(critical){
      criticalrate = 2.5;
    }
    var atk = data1.atk*(criticalrate)*(Math.random()+0.5);
    if(data2._id=="B4"||data2._id=="B5"){
      atk=Math.floor(atk*(2+Math.log(1+Math.abs(atk))));
    }
    var def = data2.def*(Math.random()*0.5+0.5);
    if(data2.status==2){
      def = def * 2;
    }
    if(data1.status==3){
      atk = atk * 2;
    }
    if(critical){
      if(data1.status==3){
        atk = atk + Math.floor(1.8*data2.def*Math.random())
      }
    }
    var rate = (80 + data1.lv+(data1.hp<200?data1.hp:200))/2;
    if(type==2){
      rate = rate / 2;
    }
    var damage = 0;
    if(atk<def){
      damage = data2.hp*Math.random()*0.08;
    }else{
      damage = (atk-def)*rate/100;
    }
    if(Math.random()*100>data1.lv+80){
      damage = 0;
    }
    damage = Math.floor(damage*rate2);
    damage = Math.floor(damage*(Math.random()*0.5+1));
    if(damage<0){
      damage=0;
    }
    var str = data1._id+'砍向'+data2._id+'\n'+(critical?'会心一击!':'')+'造成'+damage+'点伤害,获得'+damage+'点经验\n';
    return [damage,str];
  }
}

function getUserInfo(fromid,content,gid,callback){
  content=content.trim();
  var userName;
  var tom={};
  var from;
  var memInfo = getGroupMemInfo(gid);
  if(!memInfo){
    callback(fromid+'不小心砍向了自己,造成'+Math.floor(Math.random()*1000-500)+'点伤害');
    return;
  }
  for(var qq in memInfo){
    var info = memInfo[qq];
    if(fromid==info.user_id){
      from = info.nickname;
    }
    if(info.nickname&&info.nickname.indexOf(content)>=0){
      tom[info.nickname]=1;
      continue;
    }
    if(info.card&&info.card.indexOf(content)>=0){
      tom[info.nickname]=1;
      continue;
    }
  }
  var toa=Object.keys(tom);
  if(content.substring(0,1).toUpperCase()=="B"&&content.length==2){
    userName = content.toUpperCase();
  }else if(content==""){
    userName=from;
  }else if(toa.length==1){
    userName=toa[0];
  }else{
    callback(content + '是谁？');
    return;
  }
  var memInfo = getGroupMemInfo(gid);
  if(!memInfo){
    callback(from+'不小心砍向了自己,造成'+Math.floor(Math.random()*1000-500)+'点伤害');
    return;
  }

  var query = {'_id': userName};
  console.log(query);
  cl_user.findOne(query, function (err, data) {
    if (data) {
      var statusstr;
      if(data.status==0){
        statusstr='普通';
      }else if(data.status==1){
        statusstr='死亡';
      }else if(data.status==2){
        statusstr='防御';
      }else if(data.status==3){
        statusstr='攻击';
      }else if(data.status==4){
        statusstr='狂怒';
      }
      var ret = data._id + "\n";
      ret = ret + "hp:" + data.hp + "   mp:" + data.mp + "\n";
      ret = ret + "lv:" + data.lv + "   exp:" + data.exp + "/"+(50+data.lv*data.lv*data.lv)+"\n";
      ret = ret + "atk:" + data.atk + "   def:" + data.def + "\n";
      ret = ret + "luck:" + data.luck + "   agi:" + data.agi + "\n";
      ret = ret + "gold:" + data.gold + "   status:" + statusstr + "\n";
      if(data._id=="B3"){
        ret = ret + "skill:吸食（被自己杀死的敌人一定概率某项能力-1）\n";
      }

      callback(ret);
    } else {
      callback(content + '是谁？');
    }
  });
}


var limitItem = {};
function useMagicOrItem(fromuin,userName,content,members,Ncallback,port){


  var callback = function(ret){
    sendFightImage(ret,Ncallback);
  }


  var now = new Date();

  var chatCount = checkmsg[port];
  console.log(chatCount);

  var canf=true;
  if(!chatCount){
    checkChat(port);
  }else{
    var cthents = chatCount.ts;
    var daythen = Math.floor((cthents+3600000*8)/86400000);
    var daynow = Math.floor((now.getTime()+3600000*8)/86400000);
    if(daythen==daynow){
      var cthencount = chatCount.n;
      if(cthencount<2000){
        var sub = Math.floor((now.getTime()-cthents)*150/3600000);
        if(sub+cthencount>2000){
          checkChat();
        }
        console.log("count:"+chatCount);
      }else{
        canf=false;
      }
    }
  }
  if(!canf){
    Ncallback('本日砍人次数已用尽');
    return;
  }










  var now = new Date();
  var then = limitFight[fromuin];
  if(!then){
    then = {ts:0,c:0};
  }
  var thents = then.ts;
  var thenc = then.c;
  var tsnew;
  var cnew;
  if(now.getTime()-thents>1000000){
    tsnew = now.getTime();
    cnew = 1;
  }else{
    tsnew = thents;
    cnew = thenc+1;
  }
  var maxtime = 9;
  if(new Date().getHours()<8){
    maxtime = 50;
  }
  if(cnew>maxtime){
    callback(fromuin+'疲劳中无法完成指令,恢复时间：\n'+new Date(tsnew+1000000).toLocaleString());
    return;
  }
  limitFight[fromuin]={ts:tsnew,c:cnew};




  if(content==""){
    ret = "`f+要砍的人：攻击该玩家\n";
    ret = ret + " `g0:查询自己状态,`g0+名字:查询该人物状态\n";
    ret = ret + " `g1:回复魔法(消耗25MP,回复0-200点HP)\n";
    ret = ret + " `g2:转换为防御状态(防御力2倍)\n";
    ret = ret + " `g3:购买MP药水(消耗45金钱,回复20-150MP)\n";
    ret = ret + " `g4:转换为普通状态(自然回复2倍)\n";
    ret = ret + " `g5:升级\n";
    ret = ret + " `g6:转换为攻击状态(攻击力2倍,每次攻击消耗50点MP)\n";
    ret = ret + " `g7:购买重生药水(消耗60金钱,重置等级和经验值)\n";
    ret = ret + " `g8:转换为狂怒状态(攻击消耗一半HP不消耗MP)\n";
    ret = ret + " `g9:乾坤一掷\n";
    ret = ret + " `ga:学习技能\n";
    callback(ret);
  }else if(content.substring(0,1)==0){
    getUserInfo(fromuin,content.substring(1).trim(),members,callback);
  }else{
	  var gid=members;
	  var fromid = fromuin;
  var tom={};
  var from;
  var memInfo = getGroupMemInfo(gid);
  if(!memInfo){
    callback(fromid+'不小心砍向了自己,造成'+Math.floor(Math.random()*1000-500)+'点伤害');
    return;
  }
  for(var qq in memInfo){
    var info = memInfo[qq];
    if(fromid==info.user_id){
      from = info.nickname;
    }
    if(info.nickname&&info.nickname.indexOf(content)>=0){
      tom[info.nickname]=1;
      continue;
    }
    if(info.card&&info.card.indexOf(content)>=0){
      tom[info.nickname]=1;
      continue;
    }
  }
	  userName=from;

    if(userName=="百百"){
      return;
    }
	  
      var query = {'_id': from};
      cl_user.findOne(query, function (err, data) {
        if (data) {

        } else {
          var init = {
            '_id': from, hp: 100, mp: 100, tp: 100, gold: 100, lv: 1, exp: 0,
            str: 9, int: 9, agi: 9, atk: 9, def: 9, mag: 9, luck: 9, status: 0,
            love: 0
          }
          data = init;
        }
        if(content==1){
          var then = limitItem[fromuin];
          var now = new Date();
          if(!then){
            then = {i1:0,i3:0,i7:0};
          }
          if(now.getTime()-then.i1<300000){
            callback(userName+'的回复魔法CD中！回复时间：'+new Date(then.i1+300000).toLocaleString());
            return;
          }
          then.i1 = now.getTime();
          limitItem[fromuin]=then;
          if(data.mp>=25){
            data.mp=data.mp-25;
            var rate=data.a1?(data.a1+1):1;
            var addhp = Math.floor(20000/(100+data.hp-10*Math.random())*rate)
            data.hp=data.hp+addhp;
            callback(userName+'使用了回复魔法回复了'+addhp+'点HP');
          }
        }else if(content==3){
          var then = limitItem[fromuin];
          var now = new Date();
          if(!then){
            then = {i1:0,i3:0,i7:0};
          }
          if(now.getTime()-then.i3<300000){
            callback(userName+'的回复魔法CD中！回复时间：'+new Date(then.i3+300000).toLocaleString());
            return;
          }
          then.i3 = now.getTime();
          limitItem[fromuin]=then;
          if(data.gold>=40){
            data.gold=data.gold-40;
            var rate=data.a2?(data.a2+1):1;
            var addmp = Math.floor(13000/(100+data.mp)+20*Math.random())*rate;
            data.mp=data.mp+addmp;
            callback(userName+'使用了魔法药水回复了'+addmp+'点MP');
          }
        }else if(content==2){
          if(data.status!=1){
            data.status=2;
            callback(userName+'转换为防御状态');
          }
        }else if(content==4){
          if(data.status!=1){
            data.status=0;
            callback(userName+'转换为普通状态');
          }
        }else if(content==6){
          if(data.status!=1){
            data.status=3;
            callback(userName+'转换为攻击状态');
          }
        }else if(content==8){
          if(data.status!=1){
            data.status=4;
            callback(userName+'转换为狂怒状态');
          }
        }else if(content.substring(0,1)==9){
          var next = content.substring(1);
          if(next==""){
            var ret = "请选择：\n";
            ret = ret +  "`g91:消耗200金币，一定概率攻击力-1，一定概率攻击力+1\n";
            ret = ret +  "`g92:消耗200金币，一定概率防御力-1，一定概率防御力+1\n";
            ret = ret +  "`g93:消耗200金币，一定概率幸运-1，一定概率幸运+1\n";
            ret = ret +  "`g94:消耗200金币，一定概率速度-1，一定概率速度+1\n";
            ret = ret +  "`g9x/AAA:消耗AAA金币，一定概率x-1，一定概率x+1\n";
            callback(ret);
          }else{
            console.log("next:"+next);
            var un=next.indexOf('/')
            var decrease=200;
            var rate = 0.51;
            if(un!=-1){
              decrease = parseInt(next.substring(un+1));
              if(decrease>10000){
                decrease=10000;
              }
              next=next.substring(0,1);
              rate = Math.log(decrease)/16+0.18;
            }
            if(decrease>=200&&data.gold>=decrease){
              var ret = "消耗了"+decrease+"金钱";
              data.gold=data.gold-decrease;
              if(next==1){
                if(Math.random()<rate){
                  data.atk=data.atk+1;
                  ret = ret + ",atk+1"
                }else{
                  data.atk=data.atk-1;
                  ret = ret + ",atk-1"
                }
              }
              if(next==2){
                if(Math.random()<rate){
                  data.def=data.def+1;
                  ret = ret + ",def+1"
                }else{
                  data.def=data.def-1;
                  ret = ret + ",def-1"
                }
              }
              if(next==3){
                if(Math.random()<rate){
                  data.luck=data.luck+1;
                  ret = ret + ",luck+1"
                }else{
                  data.luck=data.luck-1;
                  ret = ret + ",luck-1"
                }
              }
              if(next==4){
                if(Math.random()<rate){
                  data.agi=data.agi+1;
                  ret = ret + ",agi+1"
                }else{
                  data.agi=data.agi-1;
                  ret = ret + ",agi-1"
                }
              }
              callback(ret);
            }else{
              if(decrease<200){
                callback(userName+"最少消耗200金币");
              }else{
                callback(userName+"金钱不足");
              }
            }
          }
        }else if(content==7){
          var now = new Date();
          if(!then){
            then = {i1:0,i3:0,i7:0};
          }
          if(now.getTime()-then.i7<300000){
            callback(userName+'的重生魔法CD中！回复时间：'+new Date(then.i7+300000).toLocaleString());
            return;
          }
          then.i7 = now.getTime();
          if(data.gold>60){
            var l = data.lv-1;
            data.exp=data.exp+l*50+l*l*(l+1)*(l+1)/4;
            data.gold=data.gold-60;
            data.lv=1;
            data.atk=9;
            data.def=9;
            data.luck=9;
            data.agi=9;
            callback(userName+'获得了新生,等级降为1');
          }else{
            callback(userName+'金钱不足,无法获得新生');
          }
        }else if(content.substring(0,1)=="a"){
          var next = content.substring(1);
          if(next==""){
            var ret = "91级以上可以学习技能,每次学习技能消耗1000金币：\n";
            ret = ret +  "`ga1:等级-10,全属性-10,升级回复魔法\n(当前等级"+(data.a1?data.a1:0)+")\n";
            ret = ret +  "`ga2:等级-10,全属性-10,升级MP药水效果\n(当前等级"+(data.a2?data.a2:0)+")\n";
            ret = ret +  "`ga3:等级-10,全属性-10,等级上限+1\n(当前等级上限"+(data.a3?(data.a3+99):99)+")\n";
            ret = ret +  "`ga4:等级-10,全属性-3\n";
            callback(ret);
          }else{
            if(data.lv>=91){
              if(data.gold>=1000){
                if(next==1){
                  if(!data.a1){
                    data.a1=1;
                  }else{
                    data.a1=data.a1+1;
                  }
                  data.lv=data.lv-10;
                  data.atk=data.atk-10;
                  data.def=data.def-10;
                  data.luck=data.luck-10;
                  data.agi=data.agi-10;
                  callback(userName+"的回复魔法升级到了"+data.a1+"级");
                }else if(next==2){
                  if(!data.a2){
                    data.a2=1;
                  }else{
                    data.a2=data.a2+1;
                  }
                  data.lv=data.lv-10;
                  data.atk=data.atk-10;
                  data.def=data.def-10;
                  data.luck=data.luck-10;
                  data.agi=data.agi-10;
                  callback(userName+"的MP药水效果升级到了"+data.a2+"级");

                }else if(next==3){
                  if(!data.a3){
                    data.a3=1;
                  }else{
                    data.a3=data.a3+1;
                  }
                  data.lv=data.lv-10;
                  data.atk=data.atk-10;
                  data.def=data.def-10;
                  data.luck=data.luck-10;
                  data.agi=data.agi-10;
                  callback(userName+"的等级上限升级到了 "+(data.a3+99)+"");
                }else if(next==4){
                  data.lv=data.lv-10;
                  data.atk=data.atk-3;
                  data.def=data.def-3;
                  data.luck=data.luck-3;
                  data.agi=data.agi-3;
                  callback(userName+"等级-10,全属性-3");
                }
              }else{
                callback(userName+"金钱不足，不能学习技能");
              }
            }else{
              callback(userName+"等级不足，不能学习技能");
            }
          }
        }else if(content.substring(0,1)==5){
          var next = content.substring(1);
          if(next==""){
            var ret = "请选择：\n";
            ret = ret +  "`g51:攻击力+1,其他能力一定概率+1\n";
            ret = ret +  "`g52:防御力+2,其他能力一定概率+1\n";
            ret = ret +  "`g53:幸运+1,其他能力一定概率+1\n";
            ret = ret +  "`g54:速度+1,其他能力一定概率+1\n";
            ret = ret +  "`g55:升5级攻击\n";
            ret = ret +  "`g56:升5级防御\n";
            ret = ret +  "`g57:升5级幸运\n";
            ret = ret +  "`g58:升5级速度\n";
            callback(ret);
          }else{
            var maxlv = data.a3?(data.a3+99):99
            if(next>4&&data.lv<=maxlv){
              var exp = data.exp;
              for(var i=0;i<5;i++){
                exp = exp - (data.lv+i)*(data.lv+i)*(data.lv+i)-50;
              }
              if(exp>=0){
                var ret = "";
                data.exp=exp;
                data.lv=data.lv+5;
                if(next==5){
                  data.atk=data.atk+5;
                  ret = ret + ",atk+5"
                }else if(next==6){
                  data.def=data.def+10;
                  ret = ret + ",def+10";
                }else if(next==7){
                  data.luck=data.luck+5;
                  ret = ret + ",luck+5";
                }else if(next==8){
                  data.agi=data.agi+5;
                  ret = ret + ",agi+5";
                }else{

                }
                if(next!=5){
                  var add = Math.round(Math.random()*4.5);
                  if(add>=1){
                    data.atk=data.atk+add;
                    ret = ret + ",atk+"+add;
                  }
                }
                if(next!=6){
                  var add = Math.round(Math.random()*4.5);
                  if(add>=1){
                    data.def=data.def+add;
                    ret = ret + ",def+"+add;
                  }
                }
                if(next!=7){
                  var add = Math.round(Math.random()*4.5);
                  if(add>=1){
                    data.luck=data.luck+add;
                    ret = ret + ",luck+"+add;
                  }
                }
                if(next!=8){
                  var add = Math.round(Math.random()*4.5);
                  if(add>=1){
                    data.agi=data.agi+add;
                    ret = ret + ",agi+"+add;
                  }
                }
                callback(userName+'升级到'+data.lv+'级\n'+ret.substring(1))
              }else{
                callback(userName+'经验不足,不能升级');
              }

            }else{
              if(data.exp>=data.lv*data.lv*data.lv+50){
                if(data.lv<maxlv){
                  data.exp=data.exp-data.lv*data.lv*data.lv-50;
                  data.lv=data.lv+1;
                  var ret = "";
                  if(next==1){
                    data.atk=data.atk+1;
                    ret = ret + ",atk+1"
                  }else if(next==2){
                    data.def=data.def+3;
                    ret = ret + ",def+2";
                  }else if(next==3){
                    data.luck=data.luck+1;
                    ret = ret + ",luck+1";
                  }else if(next==4){
                    data.agi=data.agi+1;
                    ret = ret + ",agi+1";
                  }else{

                  }
                  if(next!=1&&Math.random()<0.45){
                    data.atk=data.atk+1;
                    ret = ret + ",atk+1"
                  }
                  if(next!=2&&Math.random()<0.45){
                    data.def=data.def+1;
                    ret = ret + ",def+1";
                  }
                  if(next!=3&&Math.random()<0.45){
                    data.luck=data.luck+1;
                    ret = ret + ",luck+1";
                  }
                  if(next!=4&&Math.random()<0.45){
                    data.agi=data.agi+1;
                    ret = ret + ",agi+1";
                  }
                  callback(userName+'升级到'+data.lv+'级\n'+ret.substring(1))
                }else{
                  callback(userName+'不能在升级了,请转生后在升级');
                }
              }else{
                callback(userName+'经验不足,不能升级');
              }
            }

          }
        }
        cl_user.save(data);
      });
  }
}

var timer = 0;
function regenTimer(){
  var left = 3600000 - new Date().getTime()%3600000
  if(timer==0){
    timer = 1;
    setTimeout(function(){
      regen();
      setTimeout(function () {
        timer = 0;
        regenTimer();
      },10000);
    },left)
  }
}

function regen(){
    var query = {};
    cl_user.find().toArray(function(err, userArr) {
      for(var i=0;i<userArr.length;i++){
        var u = userArr[i];
        var addrate = 1;
        if(u.status==0){
          addrate = 2;
        }
        var update = false;
        if(u.status==1){
          update = true;
          u.status=0;
		      if(u._id=="B1"){
            u.hp=999+u.lv*50;
            u.atk=u.lv*4+3;
            u.lv=u.lv+1;
		        u.gold=u.gold+u.exp*1.5+99;
			      u.exp=0
    			}
          if(u._id=="B2"){
            u.hp=u.lv*100+u.exp;
            u.atk=Math.floor(9+u.lv*5+u.exp/20);
            u.agi=Math.floor(u.lv+u.exp/100);
            u.lv=u.lv+1;
            u.gold=u.gold+u.exp;
          }
          if(u._id=="B3"){
            u.hp=u.exp*3;
            u.atk=263+Math.floor(Math.pow(u.exp,0.32));
            u.agi=9+Math.floor(Math.log(u.exp));
            u.lv=Math.floor(1.6*Math.log(u.exp));
            u.def=Math.floor(u.exp/2.22);
            u.gold=3333+Math.floor(u.exp/2.62);
          }
          if(u._id=="B4"){
            u.hp=999+u.exp;
            u.atk=293+Math.floor(Math.pow(u.exp,0.32));
            u.agi=1;
            u.lv=1;
            u.def=0;
            u.gold=4444+Math.floor(u.exp/2.22);
          }
          if(u._id=="B5"){
            u.hp=u.exp*2;
            u.atk=199+Math.floor(Math.pow(u.exp,0.32));
            u.agi=1;
            u.lv=1;
            u.def=Math.floor(u.exp/2.22);;
            u.gold=5555+Math.floor(u.exp/2.02);
          }
          if(u._id=="百百"){
            u.hp=9999+999*Math.floor(Math.log(u.exp));
            u.gold=u.gold+999*Math.floor(Math.log(u.exp));
          }
        }
        if(u.hp<100){
          u.hp=u.hp+5*addrate+Math.floor(10*Math.log(u.hp));
          update = true;
        }else{
          if(u._id=="百百"){
                u.hp=u.hp+Math.floor(10*Math.log(u.hp));
                update = true;
          }
	      }
        if(u.mp<200){
          u.mp=u.mp+60*addrate;
          update = true;
        }
        if(u.gold<150){
          u.gold=u.gold+6*addrate;
          update = true;
        }
        if(update){
          cl_user.save(u);
        }
      }
    });
}

function fixUser(){
  MongoClient.connect(mongourl, function(err, db) {
    var cl_user = db.collection('cl_user');
    cl_user.find().toArray(function(err, userArr) {
      for(var i=0;i<userArr.length;i++){
        var u = userArr[i];
        var update = false;
        if(u.lv>1){
          u.atk=9;
          u.def=9;
          u.luck=9;
          u.exp=u.exp+u.lv*100-100;
          cl_user.save(u);
        }
      }
    });
  });
}

module.exports={
  fight,
  useMagicOrItem,
  regenTimer,
  fixUser,
  regen
}

regenTimer()
