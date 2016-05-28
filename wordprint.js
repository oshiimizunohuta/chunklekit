/**
 * Word Print Library
 * Since 2013-11-19 07:43:37
 * @author しふたろう
 */
// function wordPrint(scrolls, sizetype)
function WordPrint(){return;};
WordPrint.prototype ={
	init: function(sizetype){
		this.moji_hira =  "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやっゆ⼀よらりるれろわ、を。んがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽぁぃぅぇぉゃ！ゅ？ょ・『』◯☓";
		this.moji_kata = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤッユ～ヨラリルレロワ☆ヲ♥ンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポァィゥェォャ（ュ）ョ＝＋－＊／";
		this.moji_alph = "ABCDEFGHIJKLMNOPQRSTUVWXYZ,.:;abcdefghijklmnopqrstuvwxyz ^&©";
		this.moji_suji = "0123456789";
		
		//文字コード群から離れているモノ、間違えやすいモノ
		this.sp_alph = {
			',': ',', '.': '.', ':': ':', ';': ';' , ' ': ' ', '^': '^', '&': '&', '©': '©'
			,'，': ',', '．': '.', '：': ':', '；': ';' , '　': ' ', '＾': '^', '＆': '&', '@': '©', '＠': '©', '™': '©'
		};
		this.sp_kata = {
			'＝':'＝', '＋': '＋', '－': '－', '＊': '＊', '／': '／'
			,'=':'＝', '+': '＋', '-': '－', '*': '＊', '/': '／'
			, '_': '－', '～': '～', '（':  '（', '）': '）'
			, '♥':'♥', '♡':'♥', '❤':'♡' 
			, '☆':'☆', '★':'☆'
		};
		this.sp_hira = {
			'、': '、', '。': '。'  
			, 'ー': '⼀', '？': '？', '！': '！', '・':'・', '『': '『', '』': '』', '◯': '◯', '☓': '☓'
			,'･':'・', '?': '？', '!': '！',  '「': '『', '」': '』', '○': '◯', '×': '☓'
		};
		this.soundmarks = {
			50: 5, 51: 6, 52: 7, 53: 8, 54: 9, 55: 10, 56: 11, 57: 12, 58: 13, 59: 14
			, 60: 15, 61: 16, 62: 17, 63: 18, 64: 19, 65: 25, 66: 26, 67: 27, 68: 28, 69: 29
			, 70: 25, 71: 26, 72: 27, 73: 28, 74: 29
			, 140: 95, 141: 96, 142: 97, 143: 98, 144: 99, 145: 100, 146: 101, 147: 102, 148: 103, 149: 104
			, 150: 105, 151: 106, 152: 107, 153: 108, 154: 109, 155: 115, 156: 116, 157: 117, 158: 118, 159: 119
			, 160: 115, 161: 116, 162: 117, 163: 118, 164: 119
		};
		this.soundmarkAlign = 'horizon'; // vertical:horizon
		this.soundmarkPos = []; // {line:line, pos:pos}
	
		this.color;
		this.bgcolor;
		
		
	//	this.newLineWord = "\n";
		this.newLineWord = "n";
		this.escapeWord = "$";
		this.cols = 0; //自動改行までの文字数
		this.rows = 0; //文字表示行数
		this.rowSpace = 2; //改行幅
		
		this.NOTFOUND_CODE = 83; //'？'
		this.SPACE_CODE = 236; //'　'
		this.HYPHEN_CODE = 177; //'-'
		this.ESCAPE_CODE = 254; //$
		this.imageNames = {
			'8px': WORDPRINT_FONT8PX
			, '12px': WORDPRINT_FONT12PX
			, '4v6px': WORDPRINT_FONT4V6PX
		};
		
		this.chipSize = 8;
		this.vChipSize = 8;
		this.fontSize = '8px';
		sizetype = sizetype != null ? sizetype : '8px';
		this.imageName = this.imageNames[sizetype];
		
		
		this.DEFAULT_COLOR = COLOR_FONT8;
		// this.canvas = null;
		// this.context = null;
		this.canvasSpriteSource = null;
		// this.canvasSprite = null;
		this.coloredCanvasSprite = {};
		this.scroll;
		
		this.setFontSize(sizetype);
		
		this.wordIds;// = new Array();
		this.DEFAULT_BGCOLOR = COLOR_TRANSPARENT;
	
		// this.targetScroll;
		this.position_x = 0;
		this.position_y = 0;
		this.spriteArray = [];
		this.scroll = "";
		
		this.DrawEvent;// = new DrawEvent();
		this.str;
		this.disp = true;
	},
	
	initCanvas: function()
	{
		var w, h, res
		, img = this.imageName
		, cs = new CanvasSprite()
		, self = this
		;
		res = resourceSizeByName(img);
		this.canvasSpriteSource = cs;
		if(res == null){
			//TODO まだ使いたくない使わない
			appendImageOnload(img, function(res){
				// var cs = self.canvasSpriteSource;
				cs.init(img, 0, 0, res.w, res.h);
			});
		}else{
			//スワップ済みはクリーン
			//TODO デフォルトはいらないかもしれない
			cs.init(img, 0, 0, res.w, res.h);
			this.coloredCanvasSprite = [];
			this.coloredCanvasSprite.def = cs;
			this.swapColor();
		}
	},

	setScroll: function(scrollStr)
	{
		this.scroll  = scrollStr;
	},
	
	getScroll: function()
	{
		return this.scroll;
	},
	
	getSpriteHandle: function(str)
	{
		this.makeStrId(str);
		var SpriteHandles = makeSpriteHandle(this.spriteArray, this.scrolls);
		return SpriteHandles;
	},
	
	getSpriteArray: function(str, color, bgColor)
	{
		this.setColor(color == null ? this.color : color, bgColor == null ? this.bgcolor : bgColor);
		this.swapColor();
		this.parse(str);
		return this.spriteArray;
	},
	
	isHorizon: function()
	{
		return (this.chipSize < 12 && this.soundmarkAlign == 'horizon');
	},
	
	isVertical: function()
	{
		return (this.chipSize < 12 && this.soundmarkAlign == 'vertical');
	},
	
	SearchWordNum: function(w){
		var match;
		//ひらがな
		match = this.moji_hira.indexOf(w);
		if(match > -1){return match;}
		//カタカナ
		match = this.moji_kata.indexOf(w);
		if(match > -1){return match + 90;}
		//アルファベット
		match = this.moji_alph.indexOf(w);
		if(match > -1){return match + 180;}
		//数字
		match = this.moji_suji.indexOf(w);
		if(match > -1){return match + 240;}

		return match;
	},
	
	indexOf: function(i){
		//ひらがな
		if(i < 90){return this.moji_hira.substr(i, 1);}
		//カタカナ
		if(i < 180){return this.moji_kata.substr(i - 90, 1);}
		//アルファベット
		if(i < 240){return this.moji_alph.substr(i - 180, 1);}
		//数字
		if(i < 250){return this.moji_suji.substr(i - 240, 1);}

		// return this.NOTFOUND_CODE;
		return -1;
	},

	searchNum: function(w){
		var match = -1, ofs = 0, code = w.charCodeAt(0);

		if(w in this.sp_alph){
			match = this.moji_alph.indexOf(this.sp_alph[w]);
			ofs = 180;
		}else if(w in this.sp_hira){
			match = this.moji_hira.indexOf(this.sp_hira[w]);
			ofs = 0;
		}else if(w in this.sp_kata){
			match = this.moji_kata.indexOf(this.sp_kata[w]);
			ofs = 90;
		}
		else if(code < 65){
			match = this.moji_suji.indexOf(w);
			ofs = 240;
		}else if(code < 8000){
			//アルファベット
			match = this.moji_alph.indexOf(w);
			ofs = 180;
		// }else if(code < 12450 && code > 9829){
		}else if(code >= 12353 && code <= 12438){
			//ひらがな
			match = this.moji_hira.indexOf(w);
			ofs = 0;
		// }else{
		}else if(code >= 12448 && code <= 12538){
			//カタカナ
			match = this.moji_kata.indexOf(w);
			ofs = 90;
		}
// console.log(match);
		if(w == this.escapeWord){
			return this.ESCAPE_CODE;
		}
		
		return match < 0 ? this.NOTFOUND_CODE : match + ofs;
	},
	
	toStrId: function(str)
	{
		var idstr, baseword, TheWord, baseWords = []
		;
		for(i = 0; i < MS.length; i++){
			baseword = this.searchNum(MS.substr(i, 1));
			baseWords.push(baseword);
		}
		return baseWords;
	},
	
	makeStrId: function(MS)
	{
		var i, j, theWord, baseword = 0, subword = this.SPACE_CODE
			, baseWords = []//行の文字
			, subWords = []//上段行の文字
			, isHorizon =  this.isHorizon(), isVertical = this.isVertical(), isSoundmark
			, str, len , w, ccnt, nlcnt
			, isDirectNum = typeof MS != 'string' && typeof MS != 'number'
			, spritStr = !isDirectNum ? MS.split(this.escapeWord + this.newLineWord) : (MS[0].length != null ? MS : [MS])
			, linelen = spritStr.length
			;
		for(j = 0; j < linelen; j++){
			str = spritStr[j];
			len = str.length;
			for(i = 0; i < len; i++){
				baseword = isDirectNum ? str[i] : this.searchNum(str.substr(i, 1));

				isSoundmark = baseword in this.soundmarks;//濁点半濁点
				if(isSoundmark && (isHorizon || isVertical)){
					subword = baseword;
					baseword = this.soundmarks[baseword];
				}else{
					subword = this.SPACE_CODE;
					isSoundmark = false;
				}
				
				if(baseword == -1){
					baseword = 179;
					subword = this.SPACE_CODE;
				}else if(baseword == this.ESCAPE_CODE){//特殊
					baseWords.push(str[i + 1]);
					i += 1;
					continue;
				}
				
				baseWords.push(baseword);
				if(isSoundmark){
					if(isHorizon){
						baseWords.push(subword);
					}
					this.soundmarkPos.push({pos: baseWords.length - 1, line:this.wordIds.length, left:baseWords.length - 1, word: subword});
				}
				
				if((baseWords.length >= this.cols) && (this.cols > 0)){
					baseWords.splice(this.cols, 0, this.newLineWord);
					baseWords = this.newLineA(baseWords, this.cols);
					continue;
				}
				
			}
			baseWords = this.newLineA(baseWords);
			// baseWords = [];
		}

		if(baseWords.length > 0){
			baseWords = this.newLine(baseWords);
		}

		return baseWords;
	},
	
	//濁音、半濁音の後挿入
	patchSoundmarks: function(){
		var subLine = [], smp = []
		;
		if(this.isHorizon()){
			smp = this.soundmarkPos;
		}else if(this.isVertical()){
			this.wordIds.forEach(function(wordLine, j){
				var sub = [], p = 0;
				wordLine.forEach(function(words, i){
					sub.push(this.SPACE_CODE);
				}, this);
				subLine.push(sub);
			}, this);
			
			this.soundmarkPos.forEach(function(mark, i){
				subLine[mark.line][mark.left] = mark.word;
				smp.push({line: mark.line * 2, left: mark.left});
			}, this);
	
			subLine.forEach(function(line, i){
				this.wordIds.splice(i * 2, 0, line);
			}, this);
		}
		this.soundmarkPos = smp;
		// return subLine;
	},

	setFontSize: function(sizetype)
	{
		if(sizetype == "8px"){
			// this.imageName = "font8p";
			this.imageName = this.imageNames[sizetype];
			this.DEFAULT_COLOR = COLOR_FONT8;
			this.chipSize = 8;
			this.vChipSize = 8;
		}else if(sizetype == "4v6px"){
			// this.imageName = "font4v6p";
			this.imageName = this.imageNames[sizetype];
			this.DEFAULT_COLOR = COLOR_FONT8;
			this.chipSize = 4;
			this.vChipSize = 6;
		}else if(sizetype == "12px"){
			// this.imageName = "font12p";
			this.imageName = this.imageNames[sizetype];
			this.DEFAULT_COLOR = COLOR_FONT12;
			this.chipSize = 12;
			this.vChipSize = 12;
		}else{
			console.log('font no select!!');
			return;
		}
		this.initCanvas();
		this.setColor(this.DEFAULT_COLOR, this.DEFAULT_BGCOLOR);
	},
	
	setMarkAlign: function(align)
	{
		this.soundmarkAlign = align;
	},

	setStr: function(str)
	{
		this.str = str;
		this.parse(str);
	},
	
	spriteWordIds_o: function(words)
	{
		var len = words.length, sprites = [], i, spr;
		for(i = 0; i < len; i++){
			if(this.rows > 0 && i >= this.rows){break;}
			spr = imageResource.makeSpriteArray(this.imageName, words[i]);
			sprites.push(spr);
		}
		this.spriteArray = sprites;
		return sprites;
	},	
	
	/**
	 * カラースワップ済み取得 
	 */
	getColoredSprite: function()
	{
		var q = this.colorQuery();
		if(q.length == 0){
			return this.coloredCanvasSprite.def;
		}else{
			return this.coloredCanvasSprite[q];
		}
	},
	
	spriteWordIds: function(words)
	{
		var len = words.length, sprites = [], i, spr
			// , cv = this.canvasSprite.swapImage == null ? this.canvasSprite.image : this.canvasSprite.swapImage
			, cv = this.getColoredSprite().swapImage
			, rows = this.rows + (this.isVertical() * this.rows)

		;
		for(i = 0; i < len; i++){
			if(rows > 0 && i >= rows){break;}
			// spr = makeSpriteArrayInCanvas(cv, this.chipSize, this.vChipSize, words[i]);
			spr = makeSpriteArrayInCanvas(cv, this.chipSize, this.vChipSize, words[i]);
			sprites.push(spr);
		}
		this.spriteArray = sprites;
		return sprites;
	},
	
	spriteMarkRot: function(sArray, marks)
	{
		var len = sArray.length, i, sumlen = 0, alen;
		
		for(i = 0; i < len; i++){
			if(this.rows > 0 && i >= this.rows){break;}
			alen = sArray[i].length;
			// if(marks.pos <= sumlen + alen - i){
			if(marks.pos <= sumlen + alen){
				sArray[i][marks.pos - sumlen].rot(2);
				return sArray;
			}
			sumlen += alen;
		}
		return sArray;
	},

	parse: function(MS)// char length, message
	{
		var ar, spr, isHorizon = this.isHorizon(), subLine, baseWords;
		this.wordIds = [];//行
		this.soundmarkPos = [];
		
		
		if(typeof MS == "number"){
			MS += "";
		}
		baseWords = this.makeStrId(MS);
		this.patchSoundmarks();

		this.spriteArray =[];
		
		this.spriteWordIds(this.wordIds);
			
		if(isHorizon){
			this.soundmarkPos.forEach(function(mark, i){
				this.spriteArray[mark.line][mark.pos].rot(2);
				// this.spriteArray = this.spriteMarkRot(this.spriteArray, mark);
			}, this);
		}
	},

	escCommand: function(words, index, lineWords){
		var command = words.substr(index + 1, 1)
			, result = []
		;
		// if(this.wordIds.length >1){
		// console.log(lineWords, this.cols);}
		switch(command){
		case this.newLineWord: result = this.newLine(lineWords);break;
		default: result = lineWords; break;
		}
		return result;
	},
	
	exeCommand: function(word, lineWords, left){
		// console.log(word, lineWords, left, this.wordIds);
		switch(word){
			case this.newLineWord: result = this.newLine(lineWords, left);break;
			default: result = lineWords; break;
		}
		return result;
	},

	newLine: function(lineWords, left)
	{
		if(left == null){
			this.wordIds.push(lineWords);
			return '';
		}else{
			this.wordIds.push(lineWords.slice(0, left));
			return lineWords.slice(left + 1);
		}
	},

	newLineA: function(lineWords, left)
	{
		if(left == null){
			this.wordIds.push(lineWords);
			return [];
		}else{
			this.wordIds.push(lineWords.slice(0, left));
			return lineWords.slice(left + 1);
		}
	},

	setPos: function(x, y)
	{
		if(x != null){this.position_x = x;}
		if(y != null){this.position_y = y;}
	},
	
	getPos: function()
	{
		return {x: this.position_x, y: this.position_y};
	},

	//DrawEventに登録
	registDraw: function(str)
	{
		if(str != null){
			this.setStr(str);
		}
		if(this.DrawEvent == null){
			this.DrawEvent = new DrawEvent(this.str, this);
			this.DrawEvent.append("draw");
		}
	},
	
	draw: function(scr)
	{
		var i, spr, ofs = 0
		, isHorizon = this.isHorizon()
		, isVertical = this.isVertical()
		, ofy = isVertical ? -this.vChipSize : 0
		, cols = this.cols > 0 ? this.cols : 256
		, rows = this.rows + (isVertical * this.rows)
		;
		
		if(!this.disp){
			return;
		}
		if(scr == null){
			scr = this.scroll;
		}
		if(typeof scr == "string"){
			scr = layerScroll[scr];
		}
		// this.swapColor();
		for(i = 0; i < this.spriteArray.length; i++){
			// line = isVertical ? (i * 0.5) | 0 : i;
			if(rows > 0 && i >= rows){break;}
			lineSpace = isVertical ? i * this.vChipSize : i * (this.rowSpace + this.vChipSize);
			scr.drawSpriteArray(this.spriteArray[i], this.position_x, this.position_y + lineSpace + ofy, cols);
		}
		// dulog(this.cols);
	},

	//一行の長さ
	setLineCols: function(num)
	{
		this.cols = num;
	},
	
	setMaxRows: function(num)
	{
		this.rows = num;
	},

	setColor: function(color, bgColor)
	{
		this.color = color;
		this.bgcolor = bgColor == null ? this.bgcolor : bgColor;
//		this.swapColor();
	},

	setBGColor: function(color)
	{
		this.bgcolor = color;
//		this.swapColor();
	},

	swapColor_o: function()
	{
		// for(var j in this.spriteArray){
		for(var j = 0; j < this.spriteArray.length; j++){
			if(this.color == null){break;}
			for(var i = 0; i < this.spriteArray[j].length; i++){
				this.spriteArray[j][i].swapColor(this.color, this.DEFAULT_COLOR);
			}
		}
		for(var j = 0; j < this.spriteArray.length; j++){
			if(this.bgcolor == null){break;}
			for(var i = 0; i < this.spriteArray[j].length; i++){
				this.spriteArray[j][i].swapColor(this.bgcolor, this.DEFAULT_BGCOLOR);
			}
		}

	},
	
	/**
	 * カラースワップアクセス用連想キー取得
	 */
	colorQuery: function()
	{
		var colorQuery = [];
		colorQuery.push(this.color != null ? this.color.join(',') : '');
		colorQuery.push(this.bgcolor != null ? this.bgcolor.join(',') : '');
		return colorQuery.join(':');
	},
	
	/**
	 * カラースワップ開始
	 * スワップパレットに格納
	 */
	swapColor: function()
	{
		var cs = this.canvasSpriteSource
			, c
			, colorQuery = this.colorQuery()
		;
		c = copyCanvasSprite(cs);
		// console.log(this.color, this.bgcolor);
		
		if(this.coloredCanvasSprite[colorQuery] == null){
			if(this.color != null){
				c.pushSwapColor(this.color, this.DEFAULT_COLOR);
			}
			if(this.bgcolor != null){
				c.pushSwapColor(this.bgcolor, this.DEFAULT_BGCOLOR);
			}
			c.swapStart();
			this.coloredCanvasSprite[colorQuery] = c;
			// console.log(c);
		}
		
	},

	print: function(str, x, y, color, bgcolor)
	{
		// var startTime = performance.now();

		if(x != null){this.position_x = x;}
		if(y != null){this.position_y = y;}
		if(color != null){this.color = color;}
		if(bgcolor != null){this.bgcolor = bgcolor;}
		this.swapColor();
		this.parse(str);
		this.draw();
		// var endTime = performance.now();
		// console.log(str, endTime - startTime);
	},
	
	hide: function(){
		this.disp = false;
	},
	
	visible: function()
	{
		this.disp = true;
	},
};
