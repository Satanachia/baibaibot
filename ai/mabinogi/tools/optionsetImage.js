const fs = require('fs'),
  path = require('path'),
  { createCanvas, Canvas } = require('canvas'),
  { sendImageMsgBuffer } = require('../../../cq/sendImage.js')
// const gm = require('gm')
// let imageMagick = gm.subClass({ imageMagick : true });

const checkMaxWidth = (ctx, str, maxWidth) => {
  let start = 0, splitArr = []
  for(let i = 1; i < str.length; i++){
    if(ctx.measureText(str.substring(start, i)).width > maxWidth){
      splitArr.push(str.substring(start, i - 1))
      start = i - 1
    }
  }
  splitArr.push(str.substring(start))
  return splitArr
}
const renderText = (ctx, textArr, topMargin, leftMargin, lineHeight) => {
  textArr.forEach((text, index) => {
    ctx.fillText(text, leftMargin, topMargin + lineHeight * (index + 1))
  })
}
const renderBuffText = (ctx, textArr, topMargin, leftMargin, lineHeight) => {
  textArr.forEach((text, index) => {
    if(text.buff){
      ctx.fillStyle = 'rgba(16,131,255,1)'
    } else {
      ctx.fillStyle = 'rgba(251,0,7,1)'
    }
    ctx.fillText(text.text, leftMargin, topMargin + lineHeight * (index + 1))
  })
}
const renderTextBox = (ctx, left, top, width, height, radius, title) => {
  ctx.beginPath()
  ctx.strokeStyle = 'rgba(204,204,204,1)'
  ctx.lineWidth = 1
  ctx.moveTo(left + radius, top)
  ctx.lineTo(left + width - radius, top)
  ctx.arcTo(left + width, top, left + width, top + radius, radius)
  ctx.lineTo(left + width, top + height - radius)
  ctx.arcTo(left + width, top + height, left + width - radius, top + height, radius)
  ctx.lineTo(left + radius, top + height)
  ctx.arcTo(left, top + height, left, top + height - radius, radius)
  ctx.lineTo(left, top + radius)
  ctx.arcTo(left, top, left + radius, top, radius)

  ctx.stroke()
  let titleWidth = ctx.measureText(title).width
  ctx.fillStyle = 'rgba(0,0,0,1)'
  ctx.fillRect(left + radius + 5, top - 14, titleWidth + 8, 28)
  ctx.fillStyle = 'rgba(238,78,7,1)'
  ctx.fillText(title, left + radius + 9, top + 6)
}

module.exports = function(obj, wheres, __dir = 'mabi', callback){
  let canvasTmp = createCanvas(400, 2000)
    , ctxTmp = canvasTmp.getContext('2d');
  let fontFamily = 'STXIHEI'
  ctxTmp.font = `20px ${fontFamily}`
  /* 预处理属性 */
  let desc = obj.OptionDesc.split('\\n'), objArr = []
  const MAX_WIDTH = 350
  desc.forEach(str => {
    // console.log(str)
    let buff = true
    if(/^\[.*\]$/.test(str)){
      buff = false
      str = str.substring(1, str.length - 1)
    }
    if(ctxTmp.measureText(str).width < MAX_WIDTH) {
      objArr.push({text: str, buff: buff})
    } else {
      objArr = objArr.concat(checkMaxWidth(ctxTmp, str, MAX_WIDTH).map(val => {return {text: val, buff: buff}}))
    }
  })
  let buffHeight = objArr.length * 25
  let cavasHeight = 77 + buffHeight + 70
  let whereArr = []
  let whereHeight
  if(wheres.length){
    wheres.forEach(where => {
      let whereText
      if(obj.where == 'CN') {
        whereText = where
      } else {
        whereText = `${where.article} → ${where.where}`
      }
      if(ctxTmp.measureText(whereText).width < MAX_WIDTH) {
        whereArr.push(whereText)
      } else {
        whereArr = whereArr.concat(checkMaxWidth(ctxTmp, whereText, MAX_WIDTH))
      }
    })
    console.log(whereArr)
    whereHeight = whereArr.length * 25
    cavasHeight += whereHeight + 40
  }


  let canvas = createCanvas(400, cavasHeight)
    , ctx = canvas.getContext('2d')

  ctx.font = `20px ${fontFamily}`
  ctx.fillStyle = 'rgba(0,0,20,0.9)'
  ctx.fillRect(0, 0, 400, cavasHeight)

  ctx.fillStyle = 'rgba(255,255,255,1)'
  ctx.strokeStyle = 'rgba(0,0,0,0.5)'
  let title = '魔法释放卷轴'
  ctx.fillText(title, (400 - ctx.measureText(title).width)/2, 30)

  let titleDesc = 'Enchant Scroll'
  ctx.font = `12px ${fontFamily}`
  ctx.fillText(titleDesc, (400 - ctx.measureText(titleDesc).width)/2, 45)

  ctx.font = `20px ${fontFamily}`

  renderTextBox(ctx, 12, 77, 376, buffHeight + 50, 10, '道具属性')

  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.fillText(`${obj.LocalName}(${obj.Usage}:等级${obj.Level})`, 25, 117)

  renderBuffText(ctx, objArr, 117, 25, 25)

  if(wheres.length){
    renderTextBox(ctx, 12, 77 + buffHeight + 70, 376 , whereHeight + 20, 10, '卷轴出处')
    ctx.fillStyle = 'rgba(255,255,255,1)';
    renderText(ctx, whereArr, 77 + buffHeight + 80, 25, 25)
  }

  let imgData = canvas.toDataURL()
  let base64Data = imgData.replace(/^data:image\/\w+;base64,/, "")
  let dataBuffer = new Buffer(base64Data, 'base64')
  sendImageMsgBuffer(dataBuffer, obj.ID, __dir, msg => {
    callback(msg)
  })

  // fs.writeFile(path.join(__dirname, '/test/image.png'), dataBuffer, function(err) {
  //   if(err){
  //     console.log(err)
  //   }else{
  //     console.log("保存成功！");
  //   }
  // });
}