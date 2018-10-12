/**
 * @name Word Print Library
 * @since 2013-11-19 07:43:37
 * @author bitchunk
 * @version 0.7.0
 */
// function wordPrint(scrolls, sizetype)
import {makeSpriteQuery, makeSpriteSwapColor, cellhto, makeCanvasScroll, getScrolls, loadImages, getResourceChipSize, scrollByName} from './canvasdraw.js';
import * as props from './prop.js'; 
export default class WordPrint{
	init(sizetype){
		this.moji_hira = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやっゆ⼀よらりるれろわ、を。んぁぃぅぇぉゃ゛ゅ゜ょ";
		this.moji_hira_daku = "がぎぐげござじずぜぞだぢづでどばびぶべぼ";
		this.moji_hira_han = "ぱぴぷぺぽ";
//		this.moji_hira_sm = "ぁぃぅぇぉゃ゛ゅ゜ょ";
		//・『』◯☓
		this.moji_kata = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤッユ～ヨラリルレロワ☆ヲ♥ンァィゥェォャ（ュ）ョ";
		this.moji_kata_daku = "ガギグゲゴザジズゼゾダヂヅデドバビブベボ";
		this.moji_kata_han = "パピプペポ";
//		this.moji_kata_sm = "ァィゥェォャ（ュ）ョ";
		//＝＋－＊／
		this.moji_alph = "ABCDEFGHIJKLMNOPQRSTUVWXYZ,.:;abcdefghijklmnopqrstuvwxyz" + "'" + '"[]';
		this.moji_suji = "0123456789";
		this.moji_kigo = '!?#%&=+-*/◯☓「」・_^@©＄＄＄＄＄￥￥￥￥￥＄＄＄＄＄￥￥￥￥￥＄＄＄＄＄￥￥￥￥￥＄＄＄＄＄￥￥￥￥ ';
		
		//文字コード群から離れているモノ、間違えやすいモノ
		this.swapWords = {
			'　': ' ', '，': ',', '．': '.', '：': ':', '；': ';' , '　': ' ', '＾': '^', '＆': '&', '™': '©', '＿': '_'
			,'=':'=', '+': '+', '－': '-', '＊': '*', '／': '/'
			, '~': '～', '(':  '（', ')': '）'
			, '♥':'♥', '♡':'♥', '❤':'♡' 
			, '☆':'☆', '★':'☆'
			,
			'、': '、', '。': '。'  
			, 'ー': '⼀', '？': '?', '！': '!', '・':'・', '『': '「', '』': '」', '◯': '◯', '☓': '☓'
			,'･':'・', '·': '・', '○': '◯', '×': '☓'
			
			, '’': "'", '"': '"', '”': '"', '“': '"'
		};
		
		this.soundmarkQueries = [
			'56;5', '56;6', '56;7', '56;8', '56;9', 
			'56;10', '56;11', '56;12', '56;13', '56;14', 
			'56;15', '56;16', '56;17', '56;18', '56;19',
			'56;25', '56;26', '56;27', '56;28', '56;29',
			'58;25', '58;26', '58;27', '58;28', '58;29', 
			'56;65', '56;66', '56;67', '56;68', '56;69', 
			'56;70', '56;71', '56;72', '56;73', '56;74', 
			'56;75', '56;76', '56;77', '56;78', '56;79',
			'56;85', '56;86', '56;87', '56;88', '56;89',
			'58;85', '58;86', '58;87', '58;88', '58;89', 
		];
		
		this.spriteWordString = this.moji_hira + this.moji_kata + this.moji_alph + this.moji_suji + this.moji_kigo;
		this.allWordString = this.moji_hira + this.moji_kata + this.moji_alph + this.moji_suji + this.moji_kigo + this.moji_hire_daku + this.moji_hira_han + this.moji_kata_daku + this.moji_kata_han;
		
		this.sprtiteID = this.initSpriteID(this.spriteWordString);
		this.soundMarkSpriteID = this.initSpriteID(this.moji_hira_daku + this.moji_hira_han + this.moji_kata_daku + this.moji_kata_han);
		this.soundmarkAlign = 'horizon'; // vertical:horizon
		this.soundmarkPos = []; // {line:line, pos:pos}
		this.soundmarkEnable = true;
	
		this.color;
		this.bgcolor;
		
		this.vflip = false;
		this.hflip = false;
		
		
	//	this.newLineWord = "\n";
		this.newLineWord = "n";
		this.escapeWord = "$";
		this.NEWLINE_WORD = this.escapeWord + this.newLineWord;
		this.NOTFOUND_WORD = "？";
		this.cols = 0; //自動改行までの文字数
		this.rows = 0; //文字表示行数
		this.rowSpace = 0; //改行幅
		
		this.NOTFOUND_CODE = 191; //'？'
		this.SPACE_CODE = 249; //'　'
//		this.NOTFOUND_CODE = 83; //'？'
//		this.SPACE_CODE = 236; //'　'
		this.HYPHEN_CODE = 177; //'-'
		this.ESCAPE_CODE = 254; //$
		this.imageNames = {
			'8px':props.WORDPRINT_FONT8PX
			, '12px': props.WORDPRINT_FONT12PX
			, '4v6px': props.WORDPRINT_FONT4V6PX
		};
		
		this.chipSize = 8;
		this.vChipSize = 8;
		this.fontSize = '8px';
		sizetype = sizetype != null ? sizetype : '8px';
		this.sourceCanvasName = this.imageNames[sizetype];
		
		
		this.allWordSprites = {};
		this.DEFAULT_COLOR = props.COLOR_WHITE;
		this.DEFAULT_BGCOLOR = props.COLOR_TRANSPARENT;
		this.COLORS = props.PALETTE_GRAYSCALE_TP;
//		this.COLORS = [props.COLOR_WHITE, props.COLOR_LGRAY, props.COLOR_GRAY, props.COLOR_TRANSPARENT];
		// this.canvas = null;
		// this.context = null;
		this.canvasSpriteSource = {};
		// this.canvasSprite = null;
		this.coloredCanvasSprite = {};
		this.scroll;
		
		this.swapColors = {to:[this.DEFAULT_COLOR, this.DEFAULT_BGCOLOR], from:[this.DEFAULT_COLOR, this.DEFAULT_BGCOLOR]};
		this.setColor(this.DEFAULT_COLOR, this.DEFAULT_BGCOLOR);
		this.setFontSize(sizetype);
		
		this.wordIds;// = new Array();
		this.readMode = false; //外部から弄らない
		this.readChars = 0;
		
		// this.targetScroll;
		this.position_x = 0;
		this.position_y = 0;
		this.spriteArray = [];
		this.scroll = "";
		
		this.infoCache = {
			newLinesPosition:{
				key: '', info: null
			},
			replaceNewLineStr:{
				key: '', info: null
			},
			wordSprites:{
				key: '', info: null
			},
			wordSpritesInfo:{
				key: '', info: null
			},
		};
		
		this.DrawEvent;// = new DrawEvent();
		this.str;
		this.disp = true;
		this.drawOrder = 128;
		
		this.propKeys = {};
		this.initPropKeys();
	}
	
	initCommon(){
		
//		this.sprtiteID = this.initSpriteID();
		
		this.swapWords = {};
		this.soundmarkAlign = 'horizon'; // vertical:horizon
		this.soundmarkPos = []; // {line:line, pos:pos}
		this.soundmarkEnable = true;
		this.COLORS = props.PALETTE_GRAYSCALE_TP;
		this.swapColors = {from: this.COLORS, to: this.COLORS};
	
		this.vflip = false;
		this.hflip = false;
		
		
	//	this.newLineWord = "\n";
		this.newLineWord = "n";
		this.escapeWord = "$";
		this.NEWLINE_WORD = this.escapeWord + this.newLineWord;
		this.NOTFOUND_WORD = "?";
//		this.NOTFOUND_WORD = "？";
		this.cols = 0; //自動改行までの文字数
		this.rows = 0; //文字表示行数
		this.rowSpace = 0; //改行幅
		
		
		this.allWordSprites = {};
		this.canvasSpriteSource = {};
		this.coloredCanvasSprite = {};
		this.scroll;
		
		
		this.wordIds;// = new Array();
		this.readMode = false; //外部から弄らない
		this.readChars = 0;
		
		// this.targetScroll;
		this.position_x = 0;
		this.position_y = 0;
		this.spriteArray = [];
		this.scroll = "";
		
		this.infoCache = {
			newLinesPosition:{
				key: '', info: null, color: ''
			},
			replaceNewLineStr:{
				key: '', info: null, color: ''
			},
			wordSprites:{
				key: '', info: null, color: ''
			},
			wordSpritesInfo:{
				key: '', info: null, color: ''
			},
		};
		
		this.DrawEvent;// = new DrawEvent();
		this.str;
		this.disp = true;
		this.drawOrder = 128;
		
		this.propKeys = {};
		this.initPropKeys();		
	}
	
	initWith(fontName, wordStr){
		var tag = 'font_'
			, size
		;
		this.initCommon();
		
		this.allWordString = wordStr;
		this.fontSize = fontName;
		this.sourceCanvasName = tag + fontName;
		this.sprtiteID = this.initSpriteID(this.allWordString);

		size = getResourceChipSize(this.sourceCanvasName);
		this.chipSize = size.w;
		this.vChipSize = size.h;
		this.soundmarkEnable = false;
		
		this.SPACE_CODE = 36; //alphabet+number
			
	}
	
	
	//スプライトの元になるスクロールを生成（基本未使用）
	initSourceCanvasScroll(imageName)
	{
		var w, h
		, cs = new CanvasSprite()
		, self = this
		, resName = this.sourceCanvasName
		, res = resourceSizeByName(resName)
		, scroll = makeScroll(imageName, false, res.w, res.h)
		, spr = makeSpriteRect(resName, scroll.getRect())
		;
		
		//白紙のスクロールに画像を貼付け
		scroll.drawSpriteInfo(spr.makeSpriteInfo(0, 0));
		//デフォルトソース
		this.canvasSpriteSource[imageName] = scroll;
		
		return scroll;
	}
	
	initPropKeys(){
		var props = {
			'font-size': 'fontSize'
			, 'bg-color': 'bgcolor'
			, 'fg-color': 'color'
			, 'color': 'swapColors'
			, 'mark-align': 'soundmarkAlign'
			, 'cols-length': 'cols'
			, 'max-rows': 'rows'
			, 'row-space': 'rowSpace'
			, 'draw-order': 'drawOrder'
			, 'scroll': 'scroll'
			, 'v-flip': 'vflip'
			, 'h-flip': 'hflip'
		};
		this.propKeys = props;
	}
	
	allocSprites(){
		var spr = {vertical: {}, horizon: {}}, i, len
			, w = this.allWordString
			, len = w.length
			, str 
		;
		for(i = 0; i < len; i++){
			str = w.substr(i, 1);
			spr.vertical[str] = null;
			spr.horizon[str] = null;
		}
		return spr;
	}
	
	initSpriteID(wordStr){
		var i, len
			, w = wordStr
			, len = w.length, ids = {}
		;
		for(i = 0; i < len; i++){
			ids[w.substr(i, 1)] = i;
		}
		return ids;
	}
	
	/**
	 * 文字をスプライト格納
	 * @returns {undefined}
	 */
	initSprite(s){
		var all = this.allWordSprites
			, imageName = this.getImageName()
			, qh, qv, space = this.soundmarkEnable ? this.SPACE_CODE + ';' : ''
//			, smark = this.soundmarkEnable ? this.soundmarks : {}
			, smarkStr =  this.soundmarkEnable ? this.soundmarkQueries : []
			, spr, id, swaps = this.getSwapColor()
		;
		
		if(all[imageName] == null){
//			all[imageName] = {vertical: {}, horizon: {}};
			all[imageName] = this.allocSprites();
		}
		
		if(this.sprtiteID[s] != null){
			id = this.sprtiteID[s];
			qv = space + id;
			qh = id + '';
		}else if(this.soundMarkSpriteID[s] != null){
			id = this.soundMarkSpriteID[s];
			qv = smarkStr[id];
			qh = qv.split(';');
			qh = qh[1] + ' ' + qh[0] + '|r2';
		}else{
			id = this.NOTFOUND_CODE;
			s = this.NOTFOUND_WORD;
			qv = space + id;
			qh = id + '';
		}
		
//		q = id in smark == false ? space + id : id + ';' + smark[id];
		spr = makeSpriteQuery(this.sourceCanvasName, qv);
		spr = makeSpriteSwapColor(spr, swaps.to, swaps.from);
		all[imageName].vertical[s] = spr;
		
//		qh = id in smark == false ? id + '': smark[id] + ' ' + id + '|r2';
		spr = makeSpriteQuery(this.sourceCanvasName, qh);
		spr = makeSpriteSwapColor(spr, swaps.to, swaps.from);
		all[imageName].horizon[s] = spr;
		
		return;
	}
	
	/**
	 * 全ての文字をスプライト格納（基本未使用）
	 * @returns {undefined}
	 */
	initAllSprites()
	{
		var all = this.allWordSprites
			, w = this.allWordString
			, spr = {}, i, len = w.length
			, imageName = this.getImageName()
			, q, space = this.soundmarkEnable ? this.SPACE_CODE + ';' : ''
			, smark = this.soundmarkEnable ? this.soundmarks : {}
			, scroll, scrollRect
			, swaps = this.getSwapColor()
		;
		
		if(all[imageName] == null){
			scroll = this.initSourceCanvasScroll(imageName);
			scrollRect = scroll.getRect();
			appendImage(imageName, scroll.canvas, this.chipSize, this.vChipSize);
			swapColorImageData(scroll.ctx
				, [swaps.to, swaps.from]
				, scroll.getRect()
			);
//			swapColorImageData(scroll.ctx
//				, [[this.DEFAULT_COLOR, this.getColor()]
//				, [this.DEFAULT_BGCOLOR, this.getBGColor()]]
//				, scroll.getRect()
//			);
			all[imageName] = {vertical: {}, horizon: {}};
		}else{
			return;
		}
		
		spr = {};
		for(i = 0; i < len; i++){
			q = i in smark == false ? space + i : i + ';' + smark[i];
			spr[w.substr(i, 1)] = makeSpriteQuery(imageName, q);
		}
		all[imageName].vertical = spr;
		
		spr = {};
		for(i = 0; i < len; i++){
			q = i in smark == false ? i + '': smark[i] + ' ' + i + '|r2';
			spr[w.substr(i, 1)] = makeSpriteQuery(imageName, q);
		}
		all[imageName].horizon = spr;
		
	}

	setScroll(scrollStr)
	{
		this.scroll  = scrollStr;
	}
	
	/**
	 * カラースワップアクセス用連想キー取得
	 */
	colorQuery()
	{
		var colorQuery = []
			, swaps = this.getSwapColor()
			, i, len, c, str = ''
		;
		c = swaps.to;
		len = c.length;
		for(i = 0; i < len; i++){
			str += c[i].join();
		}
		colorQuery.push(str);
		
		c = swaps.from;
		str = '';
		len = c.length;
		for(i = 0; i < len; i++){
			str += c[i].join();
		}
		colorQuery.push(str);
		
//		if(this.color != null){
//			colorQuery.push(this.color != null ? this.color.join(',') : '');
//		}
//		if(this.bgcolor != null){
//			colorQuery.push(this.bgcolor != null ? this.bgcolor.join(',') : '');
//		}
		return colorQuery.join(':');
	}
	
	getSwapColor(){
//		if(this.swapColors == null || this.swapColors.to == null){
		if(this.getColor() != null){
			return {to: [this.getColor(), this.getBGColor()], from: [this.DEFAULT_COLOR, this.DEFAULT_BGCOLOR]};
		}else{
			return this.swapColors;
		}
		
	}
	setSwapColor(to){
		var i;
		if(to.length == null){
			to = [to];
		}
		this.swapColors.to = [];
		for(i = 0; i < to.length; i++){
			this.swapColors.to[i] = to[i] != null ? to[i] : this.swapColors.from[i];
		}
		return this;
	}
	
	getImageName()
	{
		var name = this.fontSize
			, cq = this.colorQuery()
		;
		name +=  cq.length > 0 ?  ':' + this.colorQuery() :  '';
		return name;
	}
	
	getWordSprites(imageName, align)
	{
		imageName = imageName == null ? this.getImageName() : imageName;
		align = align == null ? (this.isHorizon() ? 'horizon' : 'vertical') : align;
		if(this.allWordSprites[imageName] == null){
			this.allWordSprites[imageName] = this.allocSprites();
			this.initSprite(this.NOTFOUND_WORD);
//
		}
		
		return this.allWordSprites[imageName][align];
	}
	
	getScroll()
	{
		return this.scroll;
	}
	isHorizon()
	{
		return (this.chipSize < 12 && this.soundmarkAlign == 'horizon');
	}
	
	isVertical()
	{
		return (this.chipSize < 12 && this.soundmarkAlign == 'vertical');
	}
	
	
	//濁音、半濁音の後挿入
	patchSoundmarks(){
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
	}

	setFontSize(sizetype)
	{
		if(sizetype == "8px"){
			// this.imageName = "font8p";
			this.sourceCanvasName = this.imageNames[sizetype];
			this.DEFAULT_COLOR = props.COLOR_WHITE;
			this.chipSize = 8;
			this.vChipSize = 8;
			this.soundmarkEnable = true;
		}else if(sizetype == "4v6px"){
			// this.imageName = "font4v6p";
			this.sourceCanvasName = this.imageNames[sizetype];
			this.DEFAULT_COLOR = props.COLOR_WHITE;
			this.chipSize = 4;
			this.vChipSize = 6;
			this.soundmarkEnable = true;
		}else if(sizetype == "12px"){
			// this.imageName = "font12p";
			this.sourceCanvasName = this.imageNames[sizetype];
			this.DEFAULT_COLOR = props.COLOR_WHITE;
			this.chipSize = 12;
			this.vChipSize = 12;
			this.soundmarkEnable = false;
		}else{
			console.log('font no select!!');
			return;
		}
		this.fontSize = sizetype;
//		this.initAllSprites();
	}
	
	setMarkAlign(align)
	{
		this.soundmarkAlign = align;
	}

	
	setDrawOrder(o){
		this.drawOrder = o;
	}
	
	setStyle(prop, value){
		var k, propKeys = this.propKeys
		;
		if(value != null){
			//prop指定 valueセット
			if(propKeys[prop] == null){
				return;
			}
			if(propKeys[prop] == 'swapColors'){
				this.setSwapColor(value);
				return;
			}
			this[propKeys[prop]] = value;
		}
		
		//propがobject
		for(k in prop){
			if(propKeys[k] == null){
				continue;
			}
			if(propKeys[k] == 'swapColors'){
				this.setSwapColor(prop[k]);
				continue;
			}
			this[propKeys[k]] = prop[k];
		}
	}
	
	getStyle(key){
		var k, props = this.propKeys
			, styles = {}
		;
		if(key == null){
			for(k in props){
				styles[k] = this[props[k]];
			}
		}else{
			return this[props[key]];
		}
		return styles;
	}
	
	spriteWordIds_o(words)
	{
		var len = words.length, sprites = [], i, spr;
		for(i = 0; i < len; i++){
			if(this.rows > 0 && i >= this.rows){break;}
			spr = imageResource.makeSpriteArray(this.sourceCanvasName, words[i]);
			sprites.push(spr);
		}
		this.spriteArray = sprites;
		return sprites;
	}
	
	/**
	 * カラースワップ済み取得 
	 */
	getColoredSprite()
	{
		var q = this.colorQuery();
//		if(q == ':' || q.length == 0){
//			return this.coloredCanvasSprite.def;
////			return this.coloredCanvasSprite.def;
//		}else{
			return this.coloredCanvasSprite[q];
//		}
	}
	
	spriteWordIds(words)
	{
		var len = words.length, sprites = [], i, spr
			, cv = this.getColoredSprite().image
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
	}
	
	//TODO 未使用？
	spriteMarkRot(sArray, marks)
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
	}
	
	lineHeight(){
		return (this.rowSpace + this.vChipSize) * (this.isVertical() ? 2 : 1);
	}
	
	textScale(str)
	{
		var i, len, s, sprite, offset
			, isVertical = this.isVertical()
			, sprites = []
			, all = this.getWordSprites()
			, posx = 0
			, posy = 0, x, y
			, newLines = [] , newWord = this.NEWLINE_WORD
			, newLinePos = (this.chipSize * this.cols) + posx
			, scr = this.scroll
			, enableNewLine = this.cols > 0
			, enableMaxRow = this.rows > 0
			, rowHeight = (this.rowSpace + this.vChipSize) * (isVertical ? 2 : 1)
			, maxRowPos = (rowHeight * this.rows) + posy
			, newline = function(){
				y += rowHeight;
//				y += s.h;
				x = posx;
			}
			, info
		;
		if(!this.disp){
			return 0;
		}
		if(typeof scr == "string"){
			scr = layerScroll[scr];
		}
		str += '';
		
		info = this.processWordSpriteInfo(str, posx, posy);
		return {w: info.w, h: info.h};
		
		
//		str = str.replace(/\r?\n/g, newWord);
//		while(str.indexOf(newWord) >= 0){
//			newLines.push(str.indexOf(newWord));
//			str = str.replace(newWord, '');
//		}
//		len = str.length;
		
//		sprites = [];
//		for(i = 0; i < len; i++){
//			s = str.substr(i, 1);
//			s = sp_alph[s] != null ? sp_alph[s] : s;
//			s = s !== false ? s : this.NOTFOUND_WORD; //TODO 不要???
//			if(all[s] == null){
//				// make colored sprite v and h
//				this.initSprite(s);
//				all = this.getWordSprites();
//				if(all[s] == null){
//					all[s] = all[this.NOTFOUND_WORD];
//				}
//			}
//			sprites.push(all[s]);
//		}
		
		x = 0;
		y = 0;
		newLines = this.strNewLines(str);
		sprites = this.strWordSprites(str);
		
		len = sprites.length;
		offset = this.readMode ? this.readChars : 0;
		i = newLines.indexOf(offset);
		if(i >= 0){
			delete newLines[i];
		}
		for(i = offset; i < len; i++){
			s = sprites[i];
			if(s == null){
				s = all[this.NOTFOUND_WORD];
			}
			if(enableNewLine && x + s.w > newLinePos){
				newline();
			}
			if(newLines.indexOf(i) >= 0){
				newline();
				newLines.shift();
			}
			if(enableMaxRow && y >= maxRowPos){
				return {w: x + s.w, h: y + rowHeight};
			}
			x += s.w;
		}
		
		return {w: x, h: y};
	}
	
	cacheInfo(category, key, info){
		this.infoCache[category].key = key;
		this.infoCache[category].info = info;
		this.infoCache[category].color = this.colorQuery();
	}
	
	restoreFromCache(category, keystr){
		var cache = this.infoCache[category]
		;
		if(cache.key == keystr && this.colorQuery() == cache.color){
			return cache.info;
		}else{
			return false;
		}
	}
	
	strReplaceNewLine(str){
		var newLines = []
			, newWord = this.NEWLINE_WORD
			, cache, nlstr = ''
		;
		str += '';
		
		cache = this.restoreFromCache('replaceNewLineStr', str);
		if(cache != false){
			return cache;
		}
		
		nlstr = str.replace(/\r?\n/g, newWord);
		while(nlstr.indexOf(newWord) >= 0){
			newLines.push(nlstr.indexOf(newWord));
			nlstr = nlstr.replace(newWord, '');
		}
		//現在の改行情報に追加
		this.cacheInfo('newLinesPosition', str, newLines);
		//現在の改行置換情報に追加
		this.cacheInfo('replaceNewLineStr', str, nlstr);
		
		return nlstr;
	}
	
	strNewLines(str){
		var newLines = []
			, newWord = this.NEWLINE_WORD
			, cache
			, nlstr = ''
		;
		str += '';
		
		cache = this.restoreFromCache('newLinesPosition', str);
		if(cache != false){
			return cache.slice();
		}
		
		this.strReplaceNewLine(str);
		newLines = this.restoreFromCache('newLinesPosition', str);
		
		//現在の改行情報に追加
		this.cacheInfo('newLinesPosition', str, newLines);
		
		return newLines.slice();
	}

	
	strWordSprites(str){
		var i, len, s
			, isHorizon =  this.isHorizon(), isVertical = this.isVertical()
			, sprites = []
			, all = this.getWordSprites()
			, newWord = this.NEWLINE_WORD
			, sp_alph = this.swapWords
			, cache, nlstr
		;
		str += '';
		
		cache = this.restoreFromCache('wordSprites', str);
		
		if(cache != false){
			return cache;
		}
		
		nlstr = this.strReplaceNewLine(str);
		len = nlstr.length;
		sprites = [];
		for(i = 0; i < len; i++){
			s = nlstr.substr(i, 1);
			s = sp_alph[s] != null ? sp_alph[s] : s;
			s = s !== false ? s : this.NOTFOUND_WORD;
			if(s == newWord){
				continue;
			}
			if(all[s] == null){
				// make colored sprite v and h
				this.initSprite(s);
				all = this.getWordSprites();
				if(all[s] == null){
					all[s] = all[this.NOTFOUND_WORD];
				}
			}
			sprites.push(all[s]);
		}
		this.cacheInfo('wordSprites', str, sprites);
		
		return sprites;
	}
	
	processWordSpriteInfo(str, posx, posy){
		var i, len, x, y
			, isVertical = this.isVertical()
			, info = {sprites: [], w: 0, h: 0}
			, sprites, newLines
			, offset, s
			, nlWord = this.newLineWord
			, all = this.getWordSprites()
			, enableNewLine = this.cols > 0
			, enableMaxRow = this.rows > 0
			, rowHeight = (this.rowSpace + this.vChipSize) * (isVertical ? 2 : 1)
			, newLinePos = (this.chipSize * this.cols) + posx
			, maxRowPos = (rowHeight * this.rows) + posy
			, newline = function(){
				y += rowHeight;
				x = posx;
			}			
		;
		str += '';
		x = posx;
		y = posy;
		newLines = this.strNewLines(str);
		sprites = this.strWordSprites(str);

		len = sprites.length;
		offset = this.readMode ? this.readChars : 0;
		i = newLines.indexOf(offset);
		if(i >= 0){
			delete newLines[i];
		}
		for(i = offset; i < len; i++){
			s = sprites[i];
			if(s == null){
				s = all[this.NOTFOUND_WORD];
			}
			
			
			if(enableNewLine && x + s.w > newLinePos){
				newline();
			}
			if(newLines.indexOf(i) >= 0){
				if(x != posx){
					newline();
				}
				newLines.shift();
			}
			if(enableMaxRow && y >= maxRowPos){
				info.w = x + s.w;
				info.h = y + rowHeight;
				return info;
			}
			s.order = this.drawOrder;
			s.vflip(this.vflip);
			s.hflip(this.hflip);
			info.sprites.push(s.makeSpriteInfo(x, y));
			x += s.w;
		}
		
		info.w = x;
		info.h = y;
		return info;
	}
	
	makeStrWordSpriteInfo(str, x, y){
		var i, len
			, isHorizon =  this.isHorizon(), isVertical = this.isVertical()
			, posx, posy
			, info = [], sprites, newLines
			, cache, offset, s
			, all = this.getWordSprites()
			, enableNewLine = this.cols > 0
			, enableMaxRow = this.rows > 0
			, rowHeight = (this.rowSpace + this.vChipSize) * (isVertical ? 2 : 1)
			, newLinePos
			, maxRowPos
			, newline = function(){
				y += rowHeight;
				x = posx;
			}			
		;
		str += '';
//		cache = this.restoreFromCache('wordSpritesInfo', str);
//		if(cache != false){
//			return cache;
//		}

		this.position_x = x == null ? this.position_x : x;
		this.position_y = y == null ? this.position_y : y;
		posx = this.position_x;
		posy = isVertical && this.soundmarkEnable ? this.position_y - this.vChipSize : this.position_y;
		
		return this.processWordSpriteInfo(str, posx, posy).sprites;
		///////////////
		///////////////
		///////////////
		
		newLinePos = (this.chipSize * this.cols) + posx;
		maxRowPos = (rowHeight * this.rows) + posy;
		
		x = posx;
		y = posy;
		newLines = this.strNewLines(str);
		sprites = this.strWordSprites(str);

		len = sprites.length;
		offset = this.readMode ? this.readChars : 0;
		i = newLines.indexOf(offset);
		if(i >= 0){
			delete newLines[i];
		}
		for(i = offset; i < len; i++){
			s = sprites[i];
			if(s == null){
				s = all[this.NOTFOUND_WORD];
			}
			if(enableNewLine && x + s.w > newLinePos){
				newline();
			}
			if(newLines.indexOf(i) >= 0){
				newline();
				newLines.shift();
			}
			if(enableMaxRow && y >= maxRowPos){
				return info;
			}
			s.order = this.drawOrder;
			s.vflip(this.vflip);
			s.hflip(this.hflip);
			info.push(s.makeSpriteInfo(x, y));
			x += s.w;
		}
		
		return info;
	}
	
	drawWord(str)
	{
		var i, len, s, sprite, offset
			, isHorizon =  this.isHorizon(), isVertical = this.isVertical()
			, sprites = []
			, scr = this.scroll
		;
		if(!this.disp){
			return 0;
		}
		if(typeof scr == "string"){
			scr = getScrolls()[scr];
		}
		
		sprites = this.makeStrWordSpriteInfo(str);
//		newLines = this.strNewLines(str);
		
		len = sprites.length;
		for(i = 0; i < len; i++){
			s = sprites[i];
			scr.drawSprite(s.sprite, s.x, s.y);
		}
		
		offset = this.readMode ? this.readChars : 0;
		return i + offset;
		
	}

	escCommand(words, index, lineWords){
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
	}
	
	exeCommand(word, lineWords, left){
		// console.log(word, lineWords, left, this.wordIds);
		switch(word){
			case this.newLineWord: result = this.newLine(lineWords, left);break;
			default: result = lineWords; break;
		}
		return result;
	}

	newLine(lineWords, left)
	{
		if(left == null){
			this.wordIds.push(lineWords);
			return '';
		}else{
			this.wordIds.push(lineWords.slice(0, left));
			return lineWords.slice(left + 1);
		}
	}

	newLineA(lineWords, left)
	{
		if(left == null){
			this.wordIds.push(lineWords);
			return [];
		}else{
			this.wordIds.push(lineWords.slice(0, left));
			return lineWords.slice(left + 1);
		}
	}

	setPos(x, y)
	{
		if(x != null){this.position_x = x;}
		if(y != null){this.position_y = y;}
	}
	
	getPos()
	{
		return {x: this.position_x, y: this.position_y};
	}

	//DrawEventに登録
	registDraw(str)
	{
		if(str != null){
			this.setStr(str);
		}
		if(this.DrawEvent == null){
			this.DrawEvent = new DrawEvent(this.str, this);
			this.DrawEvent.append("draw");
		}
	}
	
	draw(scr)
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
		for(i = 0; i < this.spriteArray.length; i++){
			// line = isVertical ? (i * 0.5) | 0 : i;
			if(rows > 0 && i >= rows){break;}
			lineSpace = isVertical ? i * this.vChipSize : i * (this.rowSpace + this.vChipSize);
			scr.drawSpriteArray(this.spriteArray[i], this.position_x, this.position_y + lineSpace + ofy, cols);
		}
		// dulog(this.cols);
	}

	//一行の長さ
	setLineCols(num)
	{
		this.cols = num;
	}
	
	setMaxRows(num)
	{
		this.rows = num;
	}

	setColor(color, bgColor)
	{
		this.color = color;
		this.bgcolor = bgColor == null ? this.bgcolor : bgColor;
		
		this.setSwapColor([this.color, this.bgcolor]);
//		this.swapColor();
	}
	
	getColor()
	{
		return this.color == null ? this.DEFAULT_COLOR : this.color;
	}

	setBGColor(color)
	{
		this.bgcolor = color;
//		this.swapColor();
	}

	getBGColor()
	{
		return this.bgcolor == null ? this.DEFAULT_BGCOLOR : this.bgcolor;
	}
	
	swapColor_o()
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

	}

	
	swapColor(){
//		this.makeCustomCanvasSprite();
//		this.initAllSprites();
	}
	
	resetRead(){
		this.readChars = 0;
	}
	
	read(str, x, y, color, bgcolor)
	{
		var cnt, noRead = false;
		
		this.readMode = true;
		cnt = this.print(str, x, y, color, bgcolor);
		this.readMode = false;
		
		if(cnt == this.readChars){
			noRead = true;
//			this.readChars = 0;
		}
		this.readChars = cnt;
		
		return noRead;
	}

	print(str, x, y, color, bgcolor)
	{
		if(x != null){this.position_x = x;}
		if(y != null){this.position_y = y;}
		if(color != null){this.color = color;}
		if(bgcolor != null){this.bgcolor = bgcolor;}
//		this.swapColor();
		return this.drawWord(str);
	}
	
	hide(){
		this.disp = false;
	}
	
	visible()
	{
		this.disp = true;
	}
}
