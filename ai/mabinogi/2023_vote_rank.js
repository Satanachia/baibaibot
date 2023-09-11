const https = require('https')
const qs = require('qs')
const path = require("path-extra");
let GroupExpire = {

}

let DataExpire = {
	data: [],
	expire: 0
}

const getVoteData = (page, type, status) => new Promise((resolve, reject) => {
	let options = {
		host: 'evt05.tiancity.com',
		port: 443,
		path: '/luoqi/51724/home/index.php/comfort',
		method: 'POST',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		}
	}
	let postObj = {
		page, type, status
	}
	let postData = qs.stringify(postObj)

	const req = https.request(options, (res) => {
		res.setEncoding('utf8');
		let data = ''
		res.on('data', (chunk) => {
			// console.log(chunk)
			data += chunk
		});
		res.on('end', () => {
			console.log(`=== request data ${page} ===`)
			resolve(data)
		});
		res.on('error', e => {
			console.log('=== request res error ===')
			reject(e.message)
		})
	});

	req.on('error', (e) => {
		console.log('=== request req error ===')
		reject(`problem with request: ${e.message}`);
	});

	req.write(postData);
	req.end();
})

const fixStrLength = (targetLength, str) => {
	let sl =  str.replace(/[^\u0000-\u00ff]/g, "aa").length
	if (sl < targetLength) {
		return `${str}${new Array(targetLength - sl).fill(' ').join('')}`
	}
	return str
}

const searchTarget = (listData, targetName) => {
	let index = listData.findIndex(x => x.name == targetName)
	if(index < 0) {
		return {page:0,line:0,index:0}
	}
	let page = ~~(index / 12) + 1
	index = index % 12
	let line = ~~(index / 3) + 1
	index = index % 3 + 1
	return {page, line, index}
}

// const init = async () => {
// 	let listData = []
// 	for(let i = 1; i < 5; i ++) {
// 		let d = await getVoteData(i,1,2)
// 		try {
// 			d = JSON.parse(d)
// 			listData = listData.concat(d.data.lists)
// 		} catch(e) {
// 			console.log(e)
// 		}
// 	}
// 	listData.sort((a, b) => b.count - a.count)
// 	let {page, line, index} = searchTarget(listData, 'Flandre')
// 	console.log(`目标在第${page}页，第${line}行，第${index}个`)
// 	console.log(listData.map(x => `[${fixStrLength(4, x.id)}][${['亚特  ','伊鲁夏'][x.server - 1]}]${fixStrLength(12, x.name)}: 《${x.content}》(${x.count})`).join('\n'))
// }
// init()

const fetchAllData = async () => {
	let listData = []
	for(let i = 1; i < 5; i ++) {
		let d = await getVoteData(i,1,2)
		try {
			d = JSON.parse(d)
			listData = listData.concat(d.data.lists)
		} catch(e) {
			console.log(e)
		}
	}
	DataExpire = {
		data: listData,
		expire: Date.now() + 30*60*1000
	}
	return listData
}

const textFactory = (page, line, index) => {
	const chats = [
		`麻烦大家每天帮百百妈投票喵~\nhttps://evt05.tiancity.com/luoqi/51724/home/index.php\n首次投票先选择人气，翻到第${page}页找到第${line}排第${index}个（大概）\n然后，点击小星星收藏后就不用每天找得那么辛苦喵\n一天可以投一票，谢谢大家了喵~`,
		`亲爱的大家，帮忙支持一下吧！百百妈需要你的每一张票喵~ 🐱\n投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php\n投票方法很简单，首先选择“人气”，然后翻到第${page}页找到第${line}排第${index}个。点击小星星收藏后，就不用每天找得那么辛苦啦~\n每天只需要一分钟的时间，就可以为百百妈贡献一张宝贵的票。一天一票，就能让百百妈更有机会获得胜利。谢谢大家的支持喵！让我们一起助力百百妈，让她闪耀在舞台上吧！\n🌟🌟🌟`,
		`🐾 亲爱的朋友们，百百妈需要你们的支持！请点击以下链接，选择“人气”，然后找到第${page}页的第${line}排第${index}个（大概就是百百妈啦），点亮小星星收藏，每天一分钟，一票投给百百妈。谢谢大家的帮助，让我们一起为她加油！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
		`🌟 每一张票都是对百百妈的支持！请点击链接，选择“人气”，找到第${page}页的第${line}排第${index}个（就是百百妈啦），点亮小星星收藏。这个简单的行动每天都可以做，但对百百妈来说意义重大。让我们团结一心，帮她赢得胜利！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
		`🎉 亲爱的朋友们，让我们一起为百百妈投上一票吧！点击以下链接，选择“人气”，然后找到第${page}页的第${line}排第${index}个（百百妈），点亮小星星收藏。每天一次，每一票都让她更接近胜利。感谢大家的支持，一起助力百百妈获得荣耀！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
		`🌠 百百妈需要你的每一份支持！请点击下方链接，选择“人气”，然后找到第${page}页的第${line}排第${index}个（她就在那里），点亮小星星收藏。这只需要一分钟，但对百百妈来说意味着无限的感激。让我们一起投票，让她获得胜利！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
		`🐱 亲爱的大家，让我们团结一心，为百百妈投上一票！点击以下链接，选择“人气”，找到第${page}页的第${line}排第${index}个（她就在那里），点亮小星星收藏。一天一票，每一票都是对她的最好祝愿。感谢你的支持，让我们一起助力百百妈赢得这场竞赛！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
		`🌟 百百妈是我们心目中的明星！请点击下方链接，选择“人气”，找到第${page}页的第${line}排第${index}个（她就在那里），点亮小星星收藏。这是每天一次的小动作，但对她的胜利至关重要。感谢你的支持，一起为百百妈加油吧！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
		`🐾 让我们为百百妈加油！请点击以下链接，选择“人气”，然后找到第${page}页的第${line}排第${index}个（就是百百妈），点亮小星星收藏。每天一次，每一票都是对她的爱意。一起为百百妈的胜利努力！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
		`🎉 亲爱的朋友们，让我们一同支持百百妈！点击链接，选择“人气”，找到第${page}页的第${line}排第${index}个（她就在那里），点亮小星星收藏。这个简单的举动每天都可以做，但对百百妈来说意义深远。让我们团结一心，帮她赢得胜利！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
		`🌠 百百妈需要你的支持！请点击下方链接，选择“人气”，然后找到第${page}页的第${line}排第${index}个（她就在那里），点亮小星星收藏。这只需要一分钟，但对百百妈来说意味着无限的感激。让我们一起为她投上一票，为她的梦想助力！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
		`🐱 亲爱的大家，让我们共同助力百百妈！点击以下链接，选择“人气”，找到第${page}页的第${line}排第${index}个（她就在那里），点亮小星星收藏。每天一票，每一票都是对她的最好祝愿。感谢你的支持，让我们一起为百百妈的胜利加油！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
		`🌟 齐心协力，为百百妈投上一票！请点击链接，选择“人气”，找到第${page}页的第${line}排第${index}个（她就在那里），点亮小星星收藏。这是每天都可以做的小事，但对她来说是巨大的支持。感谢大家的参与，一起让百百妈获得胜利吧！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
		`🎶 百百妈需要你的每一份支持！请点击下方链接，选择“人气”，找到第${page}页的第${line}排第${index}个（她就在那里），点亮小星星收藏。这只需要一分钟，但对百百妈来说意味着一切。让我们一起投票，让她的梦想成真！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
		`🌈 让我们一同助力百百妈，为她投上一票！点击链接，选择“人气”，找到第${page}页的第${line}排第${index}个（她就在那里），点亮小星星收藏。每天一票，每一票都是对她的支持和鼓励。感谢你的参与，让我们一起为百百妈的胜利努力！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
		`🚀 亲爱的朋友们，百百妈需要你的投票！请点击以下链接，选择“人气”，找到第${page}页的第${line}排第${index}个（她就在那里），点亮小星星收藏。每天一票，每一票都为她的梦想增添一份力量。让我们一起为她加油，让她登上胜利的舞台！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
		`🌠 梦想需要你的支持！请点击链接，选择“人气”，找到第${page}页的第${line}排第${index}个（百百妈就是她），点亮小星星收藏。每天的一分钟，每一次的投票，都在为她的胜利添砖加瓦。感谢你的支持，让我们一同为百百妈的梦想努力！投票链接：https://evt05.tiancity.com/luoqi/51724/home/index.php`,
	]
	return chats[~~(Math.random() * chats.length)]
}

const autoVoteSend = async (groupId, callback) => {
	let listData = DataExpire.data
	if(Date.now() > DataExpire.expire) {
		listData = await fetchAllData()
	}
	if(Math.random() > 0.2) {
		console.log('==============> 未触发随机值')
		return
	}
	if(listData && listData.length) {
		if(GroupExpire[groupId] && Date.now() < GroupExpire[groupId]){
			console.log('==============> 群发送还在cd')
			return
		}
		let {page, line, index} = searchTarget(listData, 'Flandre')
		GroupExpire[groupId] = Date.now() + 4*60*60*1000
		callback(`（以下文案由chatGPT生成）\n${textFactory(page, line, index)}\n[CQ:image,file=${path.join('send', 'other', `farm.jpg`)}]`)
	} else {
		console.log('==============> 没有数据')
	}
}

module.exports = {
	autoVoteSend
}