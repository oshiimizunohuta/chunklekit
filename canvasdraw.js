/* global SCROLL_MAX_SPRITES_DRAW, SCROLL_MAX_SPRITES_STACK, UI_SCREEN_ID, VIEWMULTI, DISPLAY_WIDTH */

/**
 * Canvas Draw Library
 * Since 2013-11-19 07:43:37
 * @author bitchunk
 * chunklekit_v0.3.0
 */
//キャンバスことスクロール
var canvasScrollBundle = {};
//var VIEWMULTI = 1;
// var SCROLL_MAX_SPRITES_DRAW = 32;
// var SCROLL_MAX_SPRITES_STACK = 2048;

function makeScroll(name, mainFlag, width, height){
	var scr = new CanvasScroll();
	scr.init(name, mainFlag, width, height);
	return scr;
};
function makeCanvasScroll(scrollName, insertID){
	var scr = new CanvasScroll();
	scr.init(name, insertID == UI_SCREEN_ID, null, null, insertID);
	return scr;
};

/**
 * 描画リピート
 */
var CANVASDRAWREPEATFUNC = function(){return;}; 
function setCanvasDrawRepeat(func){
	CANVASDRAWREPEATFUNC = func;
}
function canvasDrawRepeat()
{
	CANVASDRAWREPEATFUNC();
}

dulog = function(){return;};


/**
 * スクロール風canvas
 * @class
 * @name CanvasScroll
 */
function CanvasScroll()
{
	return;
}
CanvasScroll.prototype = {
	init: function(name, mainFlag, width, height, insertID){
		var size = getDisplaySize()
			, scrsize = getScrollSize()
			;
		
		insertID = insertID == null ? 'display' : insertID;
		this.canvas = document.getElementById(name);
		if(this.canvas == null){
			this.canvas = document.createElement('canvas');
			this.canvas.setAttribute('id', name);
			document.getElementById(insertID).appendChild(this.canvas);
		}
	//	this.autoClear = true;//no actiove
	//	this.clearTrig = false;//no clear trigger
		if(mainFlag != null && mainFlag){
			width = size.w;
			height =size.h;
	//		this.autoClear = false;
		}else if(width == null && height == null){
			width = scrsize.w;
			height = scrsize.h;
		}
		if(mainFlag == null || mainFlag == false){
			display = 'none';
		}else{
			display = 'inline';///////////////////////
		}
		this.name = name;
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style.width = width;
		this.canvas.style.height = height;
		this.canvas.style.display = display;
		this.canvas.hidden = display == 'none' ? false : true;
		this.canvas.style.backgroundColor = "transparent";
		
		this.ctx = contextInit(this.canvas);
		this.x = 0;
		this.y = 0;
		canvasScrollBundle[name] = this;
		this.maxSprites = SCROLL_MAX_SPRITES_DRAW;
		this.maxSpritesStack = SCROLL_MAX_SPRITES_STACK;
		this.drawInfoStack = [];
		
		this.pointImage = this.ctx.createImageData(1, 1);
		
		this.rasterFunc = null;
		this.rasterLines = {horizon: [], vertical: []};
		this.rasterVolatile = true;
		
		this.mirrorMode = null;
		this.mirrorH = false;
		this.mirrorV = false;
	},

	drawto: function(targetScroll, x, y, w, h)
	{
		if(!this.is_visible()){return;}
		if(targetScroll == null){return;}
		if(w == null){w = this.canvas.width;}
		if(h == null){h = this.canvas.height;}
		if(x == null){x = 0;}
		if(y == null){y = 0;}
		targetScroll.ctx.drawImage(this.canvas, 0 | -x, 0 | -y);
	},

	//拡大しない
	rasterto: function(targetScroll, dx, dy, dw, dh)
	{
		if(!this.is_visible()){return;}
		if(dw == null){dw = this.canvas.width;}
		if(dh == null){dh = this.canvas.height;}
		if(dx == null){dx = this.x;}
		if(dy == null){dy = this.y;}
		var sw = dw, sh = dh	, sx = 0, sy = 0
			, i, raster, pos = {x: 0, y: 0}, fixpos = {x: dx, y: dy}, line = 0;
		
		if(this.rasterLines.horizon.length > 0){
			raster = this.rasterLines.horizon;
			for(i = 0; i < sh; i++){
				if(raster[i] != null){
					if(line < i){
						targetScroll.ctx.drawImage(this.canvas, 0, line, 0 | sw, i - line, 0 | (pos.x + fixpos.x) % (dw * 2), 0 | (pos.y + fixpos.y) % (dh * 2), 0 | dw, i - line);
					}
					pos.x = raster[i].x;
					pos.y = raster[i].y;
					targetScroll.ctx.drawImage(this.canvas, 0, i, 0 | sw, 1, 0 | (pos.x + fixpos.x) % (dw * 2), 0 | (pos.y + fixpos.y) % (dh * 2), 0 | dw, 1);
					line = i + 1;
					pos.y++;
				}
			}
			targetScroll.ctx.drawImage(this.canvas, 0, line, 0 | sw, i - line, 0 | pos.x + fixpos.x, 0 | pos.y + fixpos.y, 0 | dw, i - line);
		}else if(this.rasterLines.vertical.length > 0){
			raster = this.rasterLines.vertical;
			for(i = 0; i < sw; i++){
				if(raster[i] != null){
					if(line < i){
						targetScroll.ctx.drawImage(this.canvas, line, 0, 0 | i - line, 0 | sh, 0 | pos.x + fixpos.x, 0 | pos.y + fixpos.y, i - line, 0 | dh);
					}
					rpos.x = raster[i].x;
					rpos.y = raster[i].y;
					targetScroll.ctx.drawImage(this.canvas, i, 0, 1, 0 | sh, 0 | pos.x + fixpos.x, 0 | pos.y + fixpos.y, 1, 0 | dh);
					line = i + 1;
					pos.y++;
				}
			}
			targetScroll.ctx.drawImage(this.canvas, line, 0, 0 | i - line, 0 | sh, 0 | pos.x + fixpos.x, 0 | pos.y + fixpos.y, i - line, 0 | dh);
			
		}else{
			if(this.rasterFunc == null){
				targetScroll.ctx.drawImage(this.canvas, 0 | sx, 0 | sy, 0 | sw, 0 | sh, 0 | dx, 0 | dy, 0 | dw, 0 | dh);
			}else{
				this.rasterFunc(targetScroll, {sx: 0 | sx, sy: 0 | sy, sw: 0 | sw, sh: 0 | sh, dx: 0 | dx, dy: 0 | dy, dw: 0 | dw, dh: 0 | dh});
			}
		}
		
		if(this.rasterVolatile){
			this.resetRaster();
		}

//		alert();
	},
	/**
	 * ニアレストネイバー
	 * @param targetScroll
	 * @param multi
	 */
	nearestTo: function(targetScroll, multi)
	{
		if(targetScroll.canvas == null){return;}
		if(multi == null){multi = VIEWMULTI;}

//		var from = {};
		var to = {}, w, h;//, x, y;

		to.w = targetScroll.canvas.width | 0;
		to.h = targetScroll.canvas.height | 0;
		to.x = (this.x * multi) | 0;
		to.y = (this.y * multi) | 0;

		w = (to.w / multi) | 0;
		h = (to.h / multi) | 0;
		// x = (this.x * multi) | 0;
		// y = (this.y * multi) | 0;

		targetScroll.ctx.drawImage(this.canvas, 0, 0, w, h, to.x, to.y, to.w, to.h);
		
		//ミラーリング
		if(this.x != 0){
			targetScroll.ctx.drawImage(this.canvas, 0, 0, w, h, to.x - to.w, to.y, to.w, to.h);
		}
		if(this.y != 0){
			targetScroll.ctx.drawImage(this.canvas, 0, 0, w, h, to.x, to.y - to.h, to.w, to.h);
		}
		if(this.y * this.y != 0){
			targetScroll.ctx.drawImage(this.canvas, 0, 0, w, h, to.x - to.w, to.y - to.h, to.w, to.h);
		}

	},

	drawDrawInfoStack: function()
	{
		var stack = this.drawInfoStack, drawInfo, cnt = 0
		;
		while(stack.length){
			if(cnt++ > this.maxSprites){
				// if(this.name == 'bg1'){console.log(this.name);}
				return false;
			}
			drawInfo = stack.shift();
			if(drawInfo.sprite != null){
				this.drawSpriteInfo(drawInfo);
			}else if(drawInfo.fillrect != null){
				this.drawFillRectInfo(drawInfo);
			}else if(drawInfo.from != null){
				this.drawSpriteLineInfo(drawInfo);
			}
		}
		return true;
	},

	/**
	   * 描く
	   * @param sprite
	   * @param x
	   * @param y
	   */
	drawSprite: function(sprite, x, y)
	{
		this.drawInfoStack.push({sprite: sprite, x: x, y: y});
		if(this.maxSpritesStack < this.drawInfoStack.length){
			this.drawInfoStack.shift();
		}
	},

	drawSpriteInfo: function(spriteInfo)
	{
		var sprite, x, y
				, image
				, vf = 1, hf = 1, r, rox = 0, roy = 0, w = 0, h = 0
				;
		sprite = spriteInfo.sprite;
		x = spriteInfo.x;
		y = spriteInfo.y;
		w = sprite.w;
		h = sprite.h;
			
		;
		if(sprite.swapImage !== null){
			//色変更
			// image = new Image();
			// image.src = this.canvas.toDataURL("image/png");
			// sprite.swapStart().data;
			// image = sprite.swapStart(this.ctx.getImageData(x, y, w, h));
			image = sprite.swapImage;
		}else{
			//通常
			image = sprite.image;
		}
		//反転
		if(sprite.vFlipFlag || sprite.hFlipFlag){
			hf = (-sprite.hFlipFlag + !sprite.hFlipFlag) | 0;
			vf = (-sprite.vFlipFlag + !sprite.vFlipFlag) | 0;
			this.ctx.scale(hf, vf);
			x = (x * hf) - (sprite.hFlipFlag * w);
			y = (y * vf) - (sprite.vFlipFlag * h);
			
			// sprite.flip();
		}
		//回転
		if(sprite.rotFlag > 0){
			r = sprite.rotFlag;

			r = (((1 == r) * 90) + ((2 == r) * 180) + ((3 == r) * 270)) * Math.PI / 180;
			// rox = (x * hf) - (sprite.hFlipFlag * sprite.w);
			rox = x;
			roy = y;
			x = (((Math.cos(r) + Math.sin(r)) * w) - w) * 0.5;
			y = (((Math.cos(r + (Math.PI * 0.5)) + Math.sin(r + (Math.PI * 0.5))) * h) - h) * 0.5;
			this.ctx.translate(rox , roy);
			this.ctx.rotate(r);
		}
		
		if(sprite.swapImage != null){
			//色変更描画
			// sprite.workSpace.ctx.putImageData(image, 0, 0);
			// this.ctx.drawImage(sprite.workSpace.canvas, 0, 0, 0 | sprite.w, 0 | sprite.h, 0 | (hf * x) - (sprite.w * sprite.hFlipFlag), 0 | (vf * y) - (sprite.h * sprite.vFlipFlag) , 0 | (sprite.w), 0 | (sprite.h));
			this.ctx.drawImage(image, 0, 0, 0 | w, 0 | h, 0 | x, 0 | y, 0 | w, 0 | h);
		}else{
			//通常描画
			// this.ctx.drawImage(image, 0 | sprite.x, 0 | sprite.y, 0 | sprite.w, 0 | sprite.h, 0 | (hf * x) - (sprite.w * sprite.hFlipFlag), 0 | (vf * y) - (sprite.h * sprite.vFlipFlag) , 0 | (sprite.w), 0 | (sprite.h));
			this.ctx.drawImage(image, 0 | sprite.x, 0 | sprite.y, 0 | w, 0 | h, 0 | x, 0 | y, 0 | w, 0 | h);
			
		}
		
		//以下元通りにする
		if(sprite.rotFlag > 0){
			this.ctx.rotate(-r);
			this.ctx.translate(-rox , -roy);
		}
		if(sprite.vFlipFlag || sprite.hFlipFlag){
			this.ctx.scale(hf, vf);
			// sprite.flip();
		}
		//this.ctx.drawImage(otherScroll, otherScroll.x, otherScroll.y, otherScroll.w, otherScroll.h, otherScroll.x, otherScroll.y, otherScroll.w, otherScroll.h);
		sprite = null;
		image = null;
	},
	
	drawSpriteArray: function(spriteArray, x, y, cellsWidth)
	{
		var posX, posY, slen = spriteArray.length, i
		;
		if(cellsWidth == null){throw "noCellWidth!";}
		
		for(i = 0; i < slen; i++){
			sprite = spriteArray[i];
			posX = (x < 0) 
			? DISPLAY_WIDTH + (sprite.w * (i % cellsWidth)) + x
			: (sprite.w * (i % cellsWidth)) + x;
			posY = (y < 0)
			? DISPLAY_HEIGHT + (sprite.h * (0 | (i / cellsWidth))) + y
			: (sprite.h * (0 | (i / cellsWidth))) + y;
			if((y < 0) ){
				dulog(((0 | (i / cellsWidth)) - (0 | (slen / cellsWidth))));
			}
			this.drawSprite(sprite, posX, posY);
		}
	},
// TODO 旧バージョンの-値使用状況を調べる
	drawSprite2dArray: function(sprite2dArray, x, y)
	{
		var j , i, posX, posY, s2len = sprite2dArray.length, slen;
		for(j= 0; j < s2len; j++){
			spriteArray = sprite2dArray[j];
			slen = spriteArray.length;
			for(i = 0; i < slen; i++){
				sprite = spriteArray[i];
				// posX = (x < 0) 
				// ? DISPLAY_WIDTH + (sprite.w * i) + x
				// : (sprite.w * i) + x;
				// posY = (y < 0)
				// ? DISPLAY_HEIGHT + (sprite.h * j) + y
				// : (sprite.h * j) + y;
				posX = (sprite.w * i) + x;
				posY = (sprite.h * j) + y;
				this.drawSprite(sprite, posX, posY);
			}
		}
	},

	drawSpriteChunk: function(chunk, x, y)
	{
		if(chunk.length == null){
			// dulog(chunk);
			chunk = [[chunk]];
		}
		if(chunk.length == 0){
			chunk = [[chunk]];
		}
		if(chunk[0].length == 0){
			chunk = [chunk];
		}
		this.drawSprite2dArray(chunk, x, y);
	},

	stackClear: function()
	{
		DRAW_EVENTS.oneShot(this, "clear");
	},

	stackDraw: function(func)
	{
		DRAW_EVENTS.oneShot(this, func);
	},

	pset: function(x, y, color)
	{
		var img = this.ctx.getImageData(0, 0)
		// var img = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
			// , data = img.data
			// , pos = (x + (this.canvas.width * y)) * 4;
			;
			// img[pos++] = color[0];
			// img[pos++] = color[1];
			// img[pos++] = color[2];
			// img[pos++] = color[3];
	},

	drawSpriteLineInfo: function(lineInfo)
	{
		var i, from = lineInfo.from, to = lineInfo.to, color = lineInfo.color
			, point, x = from.x | 0, y = from.y | 0
			, lx = (to.x - from.x) | 0
			, ly = (to.y - from.y) | 0
			, pri =  (lx > 0 ? lx : -lx) > (ly > 0 ? ly : -ly) ? 'x' : 'y' //大きい方
			, len = pri == 'x' ? lx : ly
			, dx = pri == 'x' ? 1 : lx / ly
			, dy = pri == 'y' ? 1 : ly / lx
			, ctx = this.ctx
		;
		// if(isNaN(len)){
			// return;
		// }
// 		
		if(lx == 0 || ly == 0){
			lx = lx == 0 ? 1 : lx; ly = ly == 0 ? 1 : ly;
			ctx.fillStyle = makeRGB(color);
			ctx.fillRect(x, y, lx, ly);

		}else{
			// point = this.ctx.getImageData(0, 0, 1, 1);
			point = this.pointImage;
			
			point.data[0] = color[0];
			point.data[1] = color[1];
			point.data[2] = color[2];
			point.data[3] = color[3];
			
			if(len < 0){
				for(i = 0; -i > len - 1; i++){
					this.ctx.putImageData(point, (to.x + (i * dx)) | 0, (to.y + (i * dy)) | 0);
				}
			}else if(len > 0){
				for(i = 0; i < len + 1; i++){
					this.ctx.putImageData(point, (from.x + (i * dx)) | 0, (from.y + (i * dy)) | 0);
				}
			}else{
				this.ctx.putImageData(point, from.x, from.y);
			}
		}
		
	},
	
	// function spriteLine(from, to, sprite)
	spriteLine: function(from, to, color)
	{
		var f = {x: from.x, y: from.y}, t = {x: to.x, y: to.y}, c = color
		,info = {from : f, to: t, color: c};
		this.drawInfoStack.push(info);
		if(this.maxSpritesStack < this.drawInfoStack.length){
			this.drawInfoStack.shift();
		}
	},
	
	/**
	* 消す
	*/
	clear: function(color, rect)
	{
		if(rect == null){
			rect = {x: 0, y: 0, w: (0 | this.canvas.width), h: (0 | this.canvas.height)};
			// console.log(rect);
		}
		if(color != null){
			//this.canvas.style.backgroundColor = color;
			this.ctx.fillStyle = makeRGB(color);
			this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
		}
		this.drawInfoStack.push({color: color == null ? null : color, fillrect: rect == null ? null : rect});
		// console.log(color, rect);
		// if(rect == null){
			// rect = {x: 0, y: 0, w: (0 | this.canvas.width), h: (0 | this.canvas.height)};
// 			
		// }
		// if(color != null){
			// //this.canvas.style.backgroundColor = color;
			// this.ctx.fillStyle = makeRGB(color);
			// this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
		// }else{		
			// this.ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
		// }
	},
	
	drawFillRectInfo: function(rectInfo)
	{
		var color = rectInfo.color, rect = rectInfo.fillrect;
		if(rect == null){
			rect = {x: 0, y: 0, w: (0 | this.canvas.width), h: (0 | this.canvas.height)};
		}
		if(color != null){
			//this.canvas.style.backgroundColor = color;
			this.ctx.fillStyle = makeRGB(color);
			this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
		}else{
			this.ctx.clearRect(rect.x, rect.y, rect.w, rect.h);
		}
	},
	
	debugRect: function(rect, color)
	{
		color = COLOR_WHITE;
		this.clear(color, rect);
	},
	
	clearDrawInfoStack: function()
	{
		this.drawInfoStack = [];
	},

	isDrawingInfoStack: function()
	{
		return this.drawInfoStack.length > 0;
	},

//未使用？
	colorSwap: function(sprite, left, top)
	{
		var swaps = sprite.swaps
			, tmp, tmpimage
			, from, to, data, index
			, i, y, x, h = sprite.h, w = sprite.w
			;
		sprite.swaps = null;//一旦nullにしないと無限入れ子

		tmp = new CanvasScroll();
		tmp.init("tmp", null, sprite.w, sprite.h);
		tmp.hide();

		tmp.drawSprite(sprite);
		tmpimage = tmp.ctx.getImageData(0, 0, sprite.w, sprite.h);
		data = tmpimage.data;
		for(i in swaps){
			from = swaps[i][0];
			to = swaps[i][1];
			index = 0;
			for(y = 0; y < h; y++){
				for(x = 0; x < w; x++){
					if(data[index] == from[0] && data[index + 1] == from[1] && data[index + 2] == from[2] && data[index + 3] == from[3]){
						data[index++] = to[0];
						data[index++] = to[1];
						data[index++] = to[2];
						data[index++] = to[3];
					}else{
						index += 4; continue;
					}
				}
			}
		}
		tmp.ctx.putImageData(tmpimage, 0, 0);

		this.ctx.drawImage(tmp.canvas, left, top, sprite.w, sprite.h);
		sprite.swaps = swaps;//もどしてやる
		swaps = null;
		tmp = null;
		tmpimage = null;
		from = null;
		to = null;
		data = null;
	},

	/**
	* 映す
	*/
	project: function(scrollsrc)
	{
		this.ctx.clearRect();
	},

	zIndex: function(z)
	{
		this.canvas.style.zIndex = z;
	},


	hide: function() {
		this.canvas.hidden = true;
	},

	visible: function() {
		this.canvas.hidden = false;
	},


	is_visible: function() {
		if (this.canvas.hidden) {
			return false;
		}
		return true;
	},

	setRasterFunc: function(func) {
		this.rasterFunc = func;
	},

	resetRaster: function() {
		this.rasterLines.vertical = [];
		this.rasterLines.horizon = [];
	},

	setRasterHorizon: function(sy, dx, dy) {
		this.rasterLines.vertical = [];
		this.rasterLines.horizon[sy] = {
			x : dx,
			y : dy
		};
	},


	setRasterVertical: function(sx, dx, dy) {
		this.rasterLines.horizon = [];
		this.rasterLines.vertical[sx] = {
			x : dx,
			y : dy
		};
	},

	setPosition: function(x, y) {
		this.canvas.style.left = x + "px";
		this.canvas.style.top = y + "px";
	},

	getSize: function() {
		var size = {}
		;
		size.h = this.canvas.height;
		size.w = this.canvas.width;
		return size;
	},

	getRect: function() {
		return makeRect(this.x, this.y, this.canvas.width, this.canvas.width);
	},

	screenShot: function()
	{
		//図形の保存
		var img = new Image()
		//保存できるタイプは、'image/png'と'image/jpeg'の2種類
		, type = 'image/png'
		, element_img, element_a, del_a, pair;
		//imgオブジェクトのsrcに格納。
		img.src = this.canvas.toDataURL(type);
		//念のため、onloadで読み込み完了を待つ。
		img.onload = function() {
			//例：現在のウィンドウに出力。
			// location.href = img.src;
			//別ウィンドウに表示
			element_img = document.createElement("img");
			element_a = document.createElement("a");
			del_a = document.createElement("a");
			pair = document.createElement("span");
			element_img.setAttribute("src", img.src);
			element_img.setAttribute("width", "96px");
			element_a.setAttribute("href", "javascript:window.open('" + img.src +"'); ");
			del_a.setAttribute("onclick", "SSImgRemove(this)");
			del_a.innerHTML = '<a href="javascript:void(0);">X</a>';
			
			element_a.appendChild(element_img);
			pair.appendChild(del_a);
			pair.appendChild(element_a);
			
			document.body.appendChild(pair);
		}; 
	},

};

function SSImgRemove(obj)
{
	// dulog(obj.parentNode.parentNode);
	obj.parentNode.parentNode.removeChild(obj.parentNode);
}

/**
 * 簡易呼び出し
 */
function screenView(to, from, multi)
{
	from.nearestTo(to, multi == null ? VIEWMULTI : multi);
}

function scrollByName(name)
{
	var scr = canvasScrollBundle == null ? layerScroll : canvasScrollBundle;
	return (scr[name] != null) ? scr[name] : null;
}

function getScrolls()
{
	var scr = canvasScrollBundle == null ? layerScroll : canvasScrollBundle;
	return scr;
	
}

function drawCanvasStacks(max)
{
	var cnt = 0, k, scr = canvasScrollBundle == null ? layerScroll : canvasScrollBundle, complete = true;
	max = max == null ? SCROLL_MAX_SPRITES_DRAW * canvasScrollBundle.length : max;
	for(k in scr){
		complete &= scr[k].drawDrawInfoStack();
		if(max <= cnt++){
			break;
		}
	}
	scr = null;
	if(!complete && max > cnt){
		return drawCanvasStacks(max - cnt);
	}
	return complete;
}
/**
 * 画面キャプチャー
 */
function captureScreen(scrollName)
{
	scrollByName(scrollName).screenShot();
}

function createCanvas(w, h)
{
	var c = document.createElement('canvas');
	if(w != null){
		c.width = w;
	} 
	if(h != null){
		c.height = h;
	}
	return c;
}
function initContext(canvas)
{
	var ctx
	;
	ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;//アンチ無効
	ctx.webkitImageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	ctx.oImageSmoothingEnabled = false;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// ctx.scale(-1, 1);
	// ctx.translate(-canvas.width, 0);
	return ctx;
}
function contextInit(canvas)
{
	return initContext(canvas);
}
////////
////////
////////
/**
 * イメージリソース
 */
var imageResource = function(){return;};

imageResource.init = function(){
	this.data = [];
	this.dirpath =  "./images/spritechips/";
	this.extention =  ".png";
	this.isLoadNum = 0;//ロードする数
	this.loadcount = 0;//ロードした数
	this.separateWidth = [];
	this.separateHeight = [];
	this.workSpace = [];
	this.stack= [];
	this.ctx = {};
	this.loadRefreshTime = Date.now();
	
	this.multi = window.VIEWMULTI == null ? 1 : window.VIEWMULTI;
};	
imageResource.init();

//imageResource.create = function(nameArray, sepWidth, sepHeight)
imageResource.create = function(name, sepWidth, sepHeight, callbackEnable)
{
	this.separateWidth[name] = sepWidth;
	this.separateHeight[name] = sepHeight;

	var img = new Image()
	;
	img.src = this.dirpath + name + this.extention;
	
	if(callbackEnable == null){
		callbackEnable = true;
	}
	if(callbackEnable){
		img.onload = this.loaded;//ロードされたらカウント
	}
	img.name = name; //無理やりプロパティ
	this.data[name] = img;
};
/**
 * プリロード用
 */
imageResource.appendImage = function(name, img, sepWidth, sepHeight)
{
	this.separateWidth[name] = sepWidth;
	this.separateHeight[name] = sepHeight;

	this.data[name] = img;
};


imageResource.push = function(name, sepWidth, sepHeight)
{
	this.stack.push({name: name, w:sepWidth, h:sepHeight, });
	this.isLoadNum++;
};

// function loadImages(imageNames){
	// this.stack = imageNames;
	// this.isLoadNum = this.stack.length;
	// imageResource.createStack();
// }

imageResource.createStack = function()
{
	for(var i = 0; i < this.stack.length; i++){
		this.create(this.stack[i].name, this.stack[i].w, this.stack[i].h);
	}
	this.stack = [];
};

imageResource.makePointSprite = function(name, index, size)
{
	var img = this.data[name]
		, cellsX = 0|(img.width / this.separateWidth[name])
		, cellsY = 0|(img.height / this.separateHeight[name])
		, x = (index % cellsX) * this.separateWidth[name]
		, y = (0|(index / cellsX)) * this.separateHeight[name]
		, spr
		;
		size = size == null ? 1 : size;
	spr = new CanvasSprite();
	spr.init(name, x, y, size, size);
	return spr;
};

imageResource.makeSprite = function(name, index)
{
	var img = this.data[name]
		, cellsX = 0|(img.width / this.separateWidth[name])
		, cellsY = 0|(img.height / this.separateHeight[name])
		, x = (index % cellsX) * this.separateWidth[name]
		, y = (0|(index / cellsX)) * this.separateHeight[name]
		, spr = new CanvasSprite()
		;
	spr.init(name, x, y, this.separateWidth[name], this.separateHeight[name]);
	return  spr;
};

/**
 * 配列でスプライト生成
 * 画像が読み込まれる前にinit等を実行するタイミングに注意
 * @param name
 * @param indexes
 * @returns {Array}
 */
imageResource.makeSpriteArray = function(name, indexes)
{
// console.log(name, indexes)
	var img = this.data[name]
		, cellsX = 0 | (img.width / this.separateWidth[name])
		, cellsY = 0 | (img.height / this.separateHeight[name])
		, spriteArray = [], i, x, y, spr
	;
		
	for(i = 0; i < indexes.length; i++){
		x = (indexes[i] % cellsX) * this.separateWidth[name];
		y = (0 | (indexes[i] / cellsX)) * this.separateHeight[name];
		spr = new CanvasSprite();
		spr.init(name, x, y, this.separateWidth[name], this.separateHeight[name]);
		spriteArray.push(spr);
	}

	return spriteArray;
};
//TODO あんまり使わないので削除するかも
imageResource.makeSprite2dArray = function(name, indexes)
{
	var img = this.data[name]
		, cellsX = 0 | (img.width / this.separateWidth[name])
		, cellsY = 0 | (img.height / this.separateHeight[name])
		, spriteArray = [], j, i, x, y, spr
	;

	for(j = 0; j < indexes.length; j++){
		for(i = 0; i < indexes[0].length; i++){
			x = (indexes[j][i] % cellsX) * this.separateWidth[name];
			y = (0 | (indexes[j][i] / cellsX)) * this.separateHeight[name];
			spr = new CanvasSprite();
			spr.init(name, x, y, this.separateWidth[name], this.separateHeight[name]);
			spriteArray.push(spr);
		}
	}
	return spriteArray;
};

/**
 * 2次元配列から2次元スプライト配列をつくる
 */
imageResource.makeSpriteChunk = function(name, indexes)
{
	var img = this.data[name]
		, cellsX = 0 | (img.width / this.separateWidth[name])
		, cellsY = 0 | (img.height / this.separateHeight[name])
		, spriteChunk = [], i, j, x, y, spr
	;
	for(j = 0; j < indexes.length; j++){
		spriteChunk[j] = [];
		for(i = 0; i < indexes[0].length; i++){
			x = (indexes[j][i] % cellsX) * this.separateWidth[name];
			y = (0 | (indexes[j][i] / cellsX)) * this.separateHeight[name];
			spr = new CanvasSprite();
			spr.init(name, x, y, this.separateWidth[name], this.separateHeight[name]);
			spriteChunk[j].push(spr);
		}
	}
	return spriteChunk;
};

/**
 * rect(x, y, w, h)から2次元スプライト配列をつくる
 */
imageResource.makeSpriteChunkFromRect = function(name, sprect)
{
	var img = this.data[name]
		, spriteChunk = []
		, i, j, x, y, spr
	;

	for(j = 0; j < sprect.h; j++){
		spriteChunk[j] = [];
		for(i = 0; i < sprect.w; i++){
			x = (sprect.x + i) * this.separateWidth[name];
			y = (sprect.y + j) * this.separateHeight[name];
			spr = new CanvasSprite();
			spr.init(name, x, y, this.separateWidth[name], this.separateHeight[name]);
			spriteChunk[j].push(spr);
		}
	}
	return spriteChunk;
};

imageResource.width = function(name)
{
	return this.data[name].width;
};
imageResource.height = function(name)
{
	return this.data[name].height;
};
imageResource.makeWorkSpace = function(img, w, h)
{
	var canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	ctx = contextInit(canvas);
	return {canvas:canvas, ctx:ctx, data: canvas};
};
/**
 * ロードされた
 * イベントより呼び出されたものなのでthisはImageオブジェクト？
 */
imageResource.loaded = function (img){
	var canvas, ctx, workSpace, i, data
		, r = imageResource
	;
	r.loadcount++;	
	
	img = img.src == null ? this : img;
	//make canvas & context
	canvas = document.createElement('canvas');
	canvas.width = img.width;
	canvas.height = img.height;
	ctx = contextInit(canvas);
	ctx.drawImage(img, 0, 0);
	imageResource.data[img.name] = canvas;
	data = canvas;
	imageResource.ctx[img.name] = ctx;
	
	//make workspace
	r.workSpace[img.name] = r.makeWorkSpace(img, r.separateWidth[img.name], r.separateHeight[img.name]);
	delete img;
	if(imageResource.isload()){
		console.log('Onload ImageResource.');
		if(imageResource.onload.length == null){
			imageResource.onload();
		}else{
			for(i = 0; i < imageResource.onload.length; i++){
				imageResource.onload[i]();
			}
		}
	}
};

imageResource.isload = function()
{
	if(this.loadcount == this.isLoadNum){
		return true;
	}
	return false;
};

imageResource.onload = [];

// [name, cellsize_x, cellsize_y]
function loadImages(imageInfo, func)
{
	var R = imageResource, i, info;
	imageInfo = imageInfo.length != null ? imageInfo : [imageInfo];
	
	for(i = 0; i < imageInfo.length; i++){
		info = typeof imageInfo[i] != 'string' ? imageInfo[i] : [imageInfo[i], CHIPCELL_SIZE, CHIPCELL_SIZE];
		R.push(info[0], info[1], info[2]);
	}
	IMAGE_DIR = IMAGE_DIR.replace(/\/+$/, '') + '/';
	R.dirpath = IMAGE_DIR;
	R.onload.push(func == null ? R.onload : func);
	R.createStack();
};

/**
 * コールバック付き画像ロード
 */
function preLoadImage(name, sepWidth, sepHeight,  func)
{
	// preLoadObj = this.apply;
	var t = new Image(), r = imageResource;
	t.src = r.dirpath + name + r.extention + '?lrt=' + r.loadRefreshTime;
	t.name = name;
	t.sepWidth = sepWidth == null ? null : sepWidth;
	t.sepHeight = sepHeight == null ? null : sepHeight;
	t.onload = function(){
		r.appendImage(this.name, this, this.sepWidth == null ? this.width | 0 : this.sepWidth, this.sepHeight == null ? this.height | 0 : this.sepHeight);
		func();
	};
}

function setImageLoadRefreshTime(time){
	imageResource.loadRefreshTime = time;
}

function setLoadImageDir(dir)
{
	var pre = imageResource.dirpath;
	imageResource.dirpath = dir;
	return pre;
}
// var preLoadImageTmp;

function makePoint(name, sprite, size)
{
	return imageResource.makePointSprite(name, sprite, size);
};
function makeSprite(name, sprite)
{
	return imageResource.makeSprite(name, sprite);
};
function resourceSizeByName(name)
{
	return {w: imageResource.data[name].width, h: imageResource.data[name].height};
}
function resourceByName(name)
{
	return imageResource.workSpace[name];
}

function appendImageOnload(name, func)
{
	imageResource.onload.push(function(){
		func(imageResource.workSpace[name]);
	});
}

function setResourceFromCanvas(canvasScroll, sepw, seph){
	var cv = canvasScroll, r = imageResource;
	r.appendImage(cv.name, cv.canvas, sepw, seph);
	r.workSpace[cv.name] = r.makeWorkSpace(cv.canvas, sepw, seph);
	
}

/**
 * 短縮系関数
 * 
 * sprect:sprite rect or 2dArray
 * makeRect(x,y,w,h)
 * [a1,a2,a3,a4]
 * 結合する
 */
function makeSpriteChunk(name, sprect)
{
	var c;
	try{
		if(sprect.length != null){
			c = imageResource.makeSpriteChunk(name, sprect);
		}else{
			c = imageResource.makeSpriteChunkFromRect(name, sprect);
		}
		return convertChunk(c, '');
	}catch(e){
		dulog(name + ": error makeSpriteChunk");
		dulog(sprect);
	}
}

function makeSpriteImage(name)
{
	var img = imageResource, d = img.data[name]
		, cw = d.width / img.separateWidth[name] | 0
		, ch = d.height / img.separateWidth[name] | 0
		;
	return makeSpriteChunk(name, makeRect(0, 0, cw, ch));
		
};

/**
 * spriteからcanvasを生成
 */
function makeSpriteInCanvas(canvas, x, y, w, h)
{
	var s = new CanvasSprite();
	s.initInCanvas(canvas, x, y, w, h);
			// console.log(s);
	return s;
}

function copyCanvasSprite(sprite)
{
	if(sprite.length != null){
		return copyCanvasSpriteChunk(sprite);
	}
	var s = new CanvasSprite();
	s.copySprite(sprite);
	return s;
}

function copyCanvasSpriteChunk(spriteChunk)
{
	var x, y, res = [];
	for(y = 0; y < spriteChunk.length; y++){
		res[y] = [];
		for(x = 0; x < spriteChunk[y].length; x++){
			res[y][x] = copyCanvasSprite(spriteChunk[y][x]);
		}
	}
	return res;
}


function makeSpriteArrayInCanvas(canvas, w, h, indexes)
{
	var img = canvas
			, cellsX, cellsY 
			, spriteArray = [], i, x, y, len = 0
		;
		h = h == null ? img.height : h;
		w = w == null ? img.width : w;
		cellsX = 0 | (img.width / w);
		cellsY = 0 | (img.height / h);
		if(indexes != null){
			len = indexes.length;
			for(i = 0; i < len; i++){
				x = (indexes[i] % cellsX) * w;
				y = (0 | (indexes[i] / cellsX)) * h;
				spriteArray.push(makeSpriteInCanvas(img, x, y, w, h));
			}
		}else{
			len = cellsX * cellsY;
			for(i = 0; i < len; i++){
				x = (i % cellsX) * w;
				y = (0 | (i / cellsX)) * h;
				spriteArray.push(makeSpriteInCanvas(img, x, y, w, h));
			}
		}
		// console.log(spriteArray);
	return spriteArray;
}

/**
 * spriteChunkを結合して一つのspriteにする 
 */
var CONVERT_COUNT = 0;
function convertChunk(spriteChunk, query){
	var x, y, i, j, chunk, sprite, clen, slen, w, h, rect
		, scroll, dirScroll, sname, maked, ids = [[]], rot, subChunk, subQuery = [[]]
		, bspriteChunk = spriteChunk
		, isReplaceQuery
	;
	query = query == null ? '' : query;
	clen = spriteChunk.length;
	slen = spriteChunk[0].length;
	sprite = spriteChunk[0][0];
	h = clen;
	w = slen;
	isReplaceQuery = query.indexOf(SPQ_REP) >= 0;
	
	sname = 'sprc-' + CONVERT_COUNT + '['+ sprite.name + ',' + w + ':' + h + ',' + sprite.x + ':' + sprite.y+ ']';
	scroll = makeScroll(sname, false, sprite.w * w, sprite.h * h);
	//sprite draw New Scroll
	for(j = 0; j < clen; j++){
		chunk = spriteChunk[j];
		slen = chunk.length;
		for(i = 0; i < slen; i++){
			sprite = chunk[i];
			if(sprite == null){
				continue;
			}
			scroll.drawSpriteInfo({sprite: sprite, x: sprite.w * i, y: sprite.h * j});
		}
	}
	CONVERT_COUNT++;
	maked = makeSpriteInCanvas(scroll.canvas, 0, 0, w * sprite.w, h * sprite.h);
	
	//id collect
	for(j = 0; j < clen; j++){
		ids[j] = [];
		chunk = spriteChunk[j];
		slen = chunk.length;
		for(i = 0; i < slen; i++){
			sprite = chunk[i];
			if(sprite == null){
				continue;
			}
			ids[j][i] = sprite.id;
			
		}
	}
	//query|$ のときchunkIdsを参照
	if(isReplaceQuery){
		maked.chunkIds = sprite.chunkIds;
	}else{
		maked.chunkIds = ids;
	}
	//chunkmap collect
	y = 0;
	// clen = query.slice(SPQ_NEWLINE);
	for(j = 0; j < clen; j++){
		// subQuery[y] = [];
		chunk = spriteChunk[j];
		slen = chunk.length;
		x = 0;
		for(i = 0; i < slen; i++){
			sprite = chunk[i];
			if(sprite == null){
				continue;
			}
		}
		y += h;
	}
	// maked.chunkMap = subQuery;
	// console.log(maked, query)
	return maked;
}

/**
 * sprite.chunkMapから低レベルクエリを出力する
 * HMULTI VMULTI PATは使わない
 * @param {SpriteChunk} spriteChunk
 * @return {String} (x,y,dir)blQuery (x,y,dir)blQuery (x,y,dir)blQuery 
 */
function outputLowChunkQuery(spriteChunk)
{
	var lquery = []
	, recursive = function(qmap, bx, by){
		var i, j, chunk, x, y, rect, q, match, dir
			, multi_w, multi_h, mcv, mch, squery
			, repeatMulti = function(q, rect,  x, y, dstr, mw, mh){
				var i, j, pos_x, pos_y;
				for(j = 0; j < mh; j++){
					pos_y = y + (j * rect.h);
					for(i = 0; i < mw; i++){
						pos_x = x + (i * rect.w);
						lquery.push('(' + pos_x + ',' + pos_y + ',' + dstr + ')' + q);
					}
				}
			}
		;
		y = by;
		for(j = 0; j < qmap.length; j++){
			chunk = qmap[j];
			x = bx;
			for(i = 0; i < chunk.length; i++){
				squery = chunk[i];
				//TODO 未使用
				if(typeof q == 'array'){
					rect = recursive(q, i, j);
					i +=rect.w;
					j +=rect.h;
					continue;
				}
				
				match = squery.split(SPQ_CONNECT);
				
				q = match[0];
				
				//Rectの抽出
				rect = queryToRect(q);
				if(!rect){
					continue;
				}
				
				//繰り返し
				mch = squery.match(SPQREG_HMULTI);
				multi_w = mch == null ? 1 : mch[1] | 0;
				
				mcv = squery.match(SPQREG_VMULTI);
				multi_h = mcv == null ? 1 : mcv[1] | 0;
				
				q = squery.replace(SPQREG_HMULTI, '').replace(SPQREG_VMULTI, '');
				rect = queryToRect(q);
				dir = dstrToDirection(squery);
				match = q.split(SPQ_CONNECT);
				
				repeatMulti(match[0], rect, i, j, directionToDstr(dir), multi_w, multi_h);
			}
		}
		return makeRect(0, 0, i, j);
	}
	;
	// console.log(spriteChunk.chunkMap);
	recursive(spriteChunk.chunkMap, 0, 0);
	console.log(lquery);
	
	return lquery.join(' ');
}

/**
 * @param {String} blockQuery
 * @param {Rect} baseRect
 * @return {Rect} rect 
 * 
 * [from]x-n:y:m*w^h [to]{Rect}
 */
function queryToRect(blockQuery, baseRect){
	blockQuery += '';
	var rect, vmul = 1, hmul = 1
		, regh = blockQuery.match(SPQREG_HMULTI)
		, regv = blockQuery.match(SPQREG_VMULTI)
		, make 
		, singleRect = function(q){
			q |= 0;
			if(q < 0){
				rect = false;
			}else if(baseRect != null){
				rect = makeRect(q % baseRect.w, (q / baseRect.w) | 0, hmul, vmul);
			}else{
				rect = makeRect(0, 0, hmul, vmul);
			}
			
			return rect;
		}
	;
	blockQuery = blockQuery.split(SPQ_CONNECT)[0];

	if(blockQuery.indexOf(' ') >= 0){
		return false;
	}
	
	if(regh != null){
		hmul = regh[1] | 0;
	}
	if(regv != null){
		vmul = regv[1] | 0;
	}
	
	make = blockQuery
			.replace(SPQREG_HMULTI, '')
			.replace(SPQREG_VMULTI, '')
			.match(SPQREG_MAKE);
	// make = blockQuery.match(SPQREG_MAKE);
	if(make != null){
		if(make[1] != null){
			rect = singleRect(make[1]);
		}else if(make[2] != null){
			rect = make[2].replace(':','+').split('+');
			rect = makeRect(rect[0], rect[2], rect[1] * hmul, rect[3] * vmul);
		}else if(make[3] != null){
			rect = make[3].replace(':','-').split('-');
			rect = makeRect(rect[0], rect[2], (rect[1] - rect[0] + 1) * hmul, (rect[3] - rect[2] + 1) * vmul);
		}else{
			rect = singleRect(blockQuery);
		}
	}else{
		rect = singleRect(blockQuery);
	}
	
	return rect;
}

/**
 * 配列を回転・反転させる
 * caution: make empry element
 */
function directionSortSprites(sprites, dir)
{
	if(sprites == null || sprites.length == null){
		return sprites;
	}
	var i, j, h = sprites.length, w = sprites[0].length
		, rsorted = [], sorted = [], len, dstr = directionToDstr(dir)
	;
	len = dir.rot == 1 || dir.rot == 3 ? w : h;
	
	for(j = 0; j < len; j++){
		rsorted[j] = [];
		sorted[j] = [];
	}

	if(dir.rot == 1){
		for(j = 0; j < h; j++){
			for(i = 0; i < w; i++){
				rsorted[i][h - j - 1] = sprites[j][i];
			}
		}
	}else if(dir.rot == 2){
		for(j = 0; j < h; j++){
			for(i = 0; i < w; i++){
				rsorted[h - j - 1][w - i - 1] = sprites[j][i];
			}
		}
	}else if(dir.rot == 3){
		for(j = 0; j < h; j++){
			for(i = 0; i < w; i++){
				rsorted[w - i - 1][j] = sprites[j][i];
			}
		}
	}else{
		for(j = 0; j < h; j++){
			for(i = 0; i < w; i++){
				rsorted[j][i] = sprites[j][i];
			}
		}
	}
	
	h = rsorted.length;
	w = rsorted[0].length;
	if(dir.flip_h > 0){
		for(j = 0; j < h; j++){
			for(i = 0; i < w; i++){
				sorted[j][w - i - 1] = rsorted[j][i];
			}
		}
	}else{
		for(j = 0; j < h; j++){
			for(i = 0; i < w; i++){
				sorted[j][i] = rsorted[j][i];
			}
		}
	}
	
	if(dir.flip_v > 0){
		for(j = 0; j < h; j++){
			for(i = 0; i < w; i++){
				rsorted[h - j - 1][i] = sorted[j][i];
			}
		}
	}else{
		for(j = 0; j < h; j++){
			for(i = 0; i < w; i++){
				rsorted[j][i] = sorted[j][i];
			}
		}
	}
	// for(j = 0; j < h; j++){
		// for(i = 0; i < w; i++){
				// rsorted[j][i].chunkQuery += dstr;
		// }
	// }
// 	
	return rsorted;
}

function dstrToDirection(dstr)
{
	var dir = {rot: 0, flip_v: 0, flip_h: 0}
		, rotexp = /\S*\|?r(\d)\S*/
		;
		
	dir.rot = (dstr.indexOf('r') >= 0 ? dstr.replace(rotexp, "$1") | 0 : 0);
	dir.flip_h = dstr.match(SPQREG_HFLIP) != null ? 1 : 0;
	dir.flip_v = dstr.match(SPQREG_VFLIP) != null ? 1 : 0;
	return dir;
}

function directionToDstr(dir, before)
{
	var dstr = '';
	before = before == null ? '' : before;
	dstr += dir.rot > 0 ? '|r' + dir.rot : '';
	dstr += dir.flip_h > 0 ? '|fh' : '';
	dstr += dir.flip_v > 0 ? '|fv' : '';
	dstr = dstr.length > 0 ? dstr : '';
	// console.log(dstr)
	return dstr;
}

//スプライト生成クエリ
var SPQ_DELIMITER = ' ';
var SPQ_NEWLINE = ';';
var SPQ_FORCE = '!';
var SPQ_BOTTOMLINE = SPQ_FORCE + SPQ_NEWLINE;
var SPQ_RECT_X = 'x';
var SPQ_RECT_Y = 'y';
var SPQ_RECT_SEP = ':';
var SPQ_CONNECT = '|';
var SPQ_VFLIP = 'fv';
var SPQ_HFLIP = 'fh';
var SPQ_ROT = 'r';
var SPQ_ALL = 'a';
var SPQ_REP = '$';
var SPQ_NSTREP = '@';
var SPQ_VMULTI = '^';
var SPQ_HMULTI = '*';
var SPQ_EMPTY = '-1';
var SPQREG_BOTTOMLINE = new RegExp('\\!');
var SPQREG_CHROW = new RegExp('\\?[0-9]+$');
var SPQREG_FLIPALL = new RegExp('\\[|fh]+', 'g');
var SPQREG_RECTC = new RegExp('^[0-9]+\\+[0-9]+:[0-9]+\\+[0-9]+');
var SPQREG_RECTR = new RegExp('^[0-9]+\\-[0-9]+:[0-9]+\\-[0-9]+');
var SPQREG_MAKE = new RegExp(''
	+ '(^[0-9]+$)'
	+ '|(^[0-9]+\\+[0-9]+:[0-9]+\\+[0-9]+$)'
	+ '|(^[0-9]+\\-[0-9]+:[0-9]+\\-[0-9]+$)'
	+ '|(^[0-9$]+$)'
	+ '|(^[0-9@]+$)'
	);
	
var SPQREG_FLIP = new RegExp('\\|[fhv|]{2,}');
var SPQREG_VFLIP = new RegExp('\\|f[hv]?v');
var SPQREG_HFLIP = new RegExp('\\|f[hv]?h');
var SPQREG_ROT = new RegExp('\\|r([0-3])');
var SPQREG_HMULTI = new RegExp('\\*([0-9]+)');
var SPQREG_VMULTI = new RegExp('\\^([0-9]+)');
var SPQREG_PAT = new RegExp('\\([^()]*\\)', 'g');
var SPQREG_INPAT = new RegExp('\\([^)]*\\(.*\\)[^(]*\\)', 'g');

var SPQSUBREG_PAT = new RegExp('^\\((.*)\\)$');
var SPQ_RCOUNT = 0;

/**
 * クエリからスプライト(結合)を生成 
 * @param {string} name
 * @param {string} spq
 */
function makeSpriteQuery(name, spq)
{
	var mtpat, nstpat = [], sppat = [], sprite = [], chunkMap = [], rect
	, spstr, i, j, rw, rh, ofy, chunkMapOfy, s, sst, ilen, jlen, mk, mt, prerect, sprstr
	, sourceq = spq, dir, dirstr, baseMatch = ''
	, rectFillSub = function(chunk, query, rect){
		var x, y, r = rect.convertArray(SPQ_EMPTY)
		;
		query = query.push == null ? [query] : query;
		query = query[0].push == null ? [query] : query;
		for(y = 0; y < query.length; y++){
			for(x = 0; x < query[0].length; x++){
				r[y][x] = query[y][x];
			}
		}
		chunk = concatSprite(chunk, r, rect.y);
		return chunk;
	}
	, rectFillMulti = function(chunk, w, h){
		var x, y
		;
		w = w > 1 ? '*'  + w : '';
		h = h > 1 ? '^'  + h : '';
		for(y = 0; y < chunk.length; y++){
			for(x = 0; x < chunk[0].length; x++){
				chunk[y][x] += chunk[y][x] == SPQ_EMPTY ? '' : w + h;
			}
		}
		return chunk;
	}
	;
	SPQ_RCOUNT++;
	if(	SPQ_RCOUNT > 200){
		SPQ_RCOUNT--;
		return;
	}
	if(spq == SPQ_ALL){
		return makeSpriteImage(name);
	}
	try{
		// console.log(spq.match(SPQREG_INPAT));
		//Nest Groups
		nstpat = spq.match(SPQREG_INPAT);
		nstpat = nstpat == null ? nstpat : nstpat.map(function(s, i){
			// console.log(s, nstpat);
			return makeSpriteQuery(name, s.replace(SPQSUBREG_PAT, '$1'));
		});
		spq = spq.replace(SPQREG_INPAT, SPQ_NSTREP);

		//Single Groups
		sppat = spq.match(SPQREG_PAT);
		// console.log(mtpat);
		sppat = sppat == null ? sppat : sppat.map(function(s, i){

			return makeSpriteQuery(name, s.replace(SPQSUBREG_PAT, '$1'));
		});
		spq = spq.replace(SPQREG_PAT, SPQ_REP);
		spstr = spq.split(SPQ_NEWLINE);

		ilen = spstr.length;
		ofy = 0;
		chunkMapOfy = 0;
		for(i = 0; i < ilen; i++){
			sst = spstr[i];
			s = sst.split(SPQ_DELIMITER);
			jlen = s.length;
			for(j = 0; j < jlen; j++){
				// console.log("j" + j, s[j]);
				sprstr = s[j].replace(SPQREG_HMULTI, '').replace(SPQREG_VMULTI, '').replace(SPQREG_BOTTOMLINE, '');

				mt = sprstr.split(SPQ_CONNECT)[0].match(SPQREG_MAKE);
				// console.log( s[j] );
				//rectsight
				if(mt == null){
					continue;
				}else if(mt[2] != null){
					//.e.g "xx+ww:yy+hh"
					baseMatch = mt[2];
					prerect = baseMatch.replace(':','+').split('+').map(function(r){return r | 0;});
					mk = makeSpriteChunk(name, makeRect(prerect[0], prerect[2], prerect[1], prerect[3]));
				}else if(mt[3] != null){
					//.e.g "xx-ccx:yy-ccy"
					baseMatch = mt[3];
					prerect = baseMatch.replace(':', '-').split('-').map(function(r){return r | 0;});
					mk = makeSpriteChunk(name, makeRect(prerect[0], prerect[2], prerect[1] - prerect[0] + 1, prerect[3] - prerect[2] + 1));
					// console.log(mk, prerect);
				}else if(mt[4] != null){
					baseMatch = mt[4];
					mk = sppat.shift();
					// console.log(mt[4], s[j])
				}else if(mt[5] != null){
					baseMatch = mt[5];
					mk = nstpat.shift();
					// console.log(mt[4], s[j])
				}else if(mt[1] != null){
					//.e.g "id"
					baseMatch = mt[1];
					mk = makeSprite(name, mt[1]);
					// console.log(mt[1], mk);
				}
				// console.log(mt);
				//repeat
				mt = s[j].match(SPQREG_HMULTI);
				rw = mt == null ? 1 : mt[1] | 0;
				
				mt = s[j].match(SPQREG_VMULTI);
				rh = mt == null ? 1 : mt[1] | 0;
				mk = repeatSprite(mk, rw, rh);

				// if(s[j].indexOf(SPQ_REP) < 0 && s[j].indexOf(SPQ_NSTREP) < 0){
					if(s[j].indexOf(SPQ_REP) >= 0 || s[j].indexOf(SPQ_NSTREP) >= 0){
						//*^MULTIは考慮されてない
						sprstr = s[j].replace(SPQ_REP, mk[0][0].chunkMap[0][0]).replace(SPQ_FORCE, '');
						rect = makeRect(0, chunkMapOfy + i, mk[0][0].chunkMap[0].length * rw, mk[0][0].chunkMap.length * rh);
						mk[0][0].chunkMap = rectFillMulti(mk[0][0].chunkMap, rw, rh);
						rectFillSub(chunkMap, mk[0][0].chunkMap, rect);
					}else{
						//*^MULTIは考慮されている
						rect = queryToRect(s[j].replace(SPQ_FORCE, ''));
						rect.x = 0;
						rect.y = chunkMapOfy + i;
						rectFillSub(chunkMap, s[j].replace(SPQ_FORCE, ''), rect);
					}
				// }
				
				//direction
				mt = s[j].match(SPQREG_FLIP);
				if(mt != null){
					// console.log("flip", mt);
					mk = flipSprite(mk, mt[0].indexOf('h') >= 0, mt[0].indexOf('v') >= 0);
				}
				
				mt = s[j].match(SPQREG_ROT);
				if(mt != null){
					// console.log("rot", mt);
					mk = rotSprite(mk, mt[1]);
				}
				dir = dstrToDirection(s[j]);
				//配列の回転
				if(dir.rot > 0 || dir.flip_v > 0 || dir.flip_h > 0){
					mk = directionSortSprites(mk, dir);
				}

				sprite = concatSprite(sprite, mk, ofy + i);
				mt = s[j].match(SPQ_FORCE);
				if(mt != null){
					ofy = sprite.length - i - 1;
					chunkMapOfy = chunkMap.length - i - 1;
					sprite.push([]);
					// console.log(sprite , mt, ofy, i);
				}
				
			}
		}
	}catch(e){
		console.error(e, 'Sprite query syntax error :' + spq);
		console.log(mk, sprite);
		return null;
	}
	SPQ_RCOUNT--;
	if(SPQ_RCOUNT == 0){
		sprite = convertChunk(sprite, sourceq);
		sprite.chunkMap = chunkMap;
	}else{
		sprite[0][0].chunkMap = chunkMap;
	}
	// console.log(sprite, spq, rotq + flipq, dstrToDirection(rotq + flipq));
	return sprite;
}


function repeatSprite(sprite, w, h)
{
	var row = [], mk = [], d;
	for(d = 0; d < w; d++){
		row = concatSprite(row, sprite, 0);
	}
	
	for(d = 0; d < h; d++){
		mk = concatSprite(mk, row, mk.length);
	}
	return mk;
}

function concatSprite(sprite1, sprite2, row)
{
	var i;
	if(sprite2.length != null){
		// chunk
		sprite2.map(function(s, l){
			sprite1[row + l] = sprite1[row + l] == null ? s : sprite1[row + l].concat(s);
		});
	}else{
		// id
		sprite1[row] == null ? sprite1[row] = [sprite2] : sprite1[row].push(sprite2);
	}
	return sprite1;
}

function spreadSpriteChunk(name, indexes, w, h)
{
	var spArray = [], y, x;
	try{
		for(y = 0; y < h; y++){
			spArray[y] = [];
			for(x = 0; x < w; x++){
				spArray[y].push(indexes);
			}
		}
		return imageResource.makeSpriteChunk(name, spArray);
	}catch(e){
		dulog(name);
		dulog(indexes);
	}
}


function rotSprite(sprite, r)
{
	if(sprite.length != null){
		sprite = sprite.map(function(s, i){
			return rotSprite(s, r);
		});
		return sprite;
	}
	if(r > 0){sprite.rot(r);}
	return sprite;
}

function flipSprite(sprite, h, v)
{
	if(sprite.length != null){
		sprite = sprite.map(function(s, i){
			return flipSprite(s, h, v);
		});
		return sprite;
	}
	if(v){sprite.vflip(v);}
	if(h){sprite.hflip(h);}
	return sprite;
}
function swapColorSpriteRecursive(sprite, type, to, from)
{
	// try{
		if(sprite.length != null){
			sprite.forEach(function(s, i){
				swapColorSpriteRecursive(s, type, to, from);
			});
			return sprite;
		}
		
		if(type == null || type == 'set'){
			sprite.setSwapColor(to, from);
		}else if(type == 'push'){
			sprite.pushSwapColor(to, from);
		}else if(type == 'start'){
			sprite.swapStart();
		}else if(type == 'reset'){
			sprite.resetSwapColor();
		}
		return sprite;
	// }catch(e){
		// console.error(e, 'not sprite:', sprite);
	// }
}

function setSwapColorSprite(sprite, to, from, reset)
{
	if(sprite.length != null){
		sprite = sprite.map(function(s, i){
			return setSwapColorSprite(s, to, from, reset);
		});
		return sprite;
	}
	if(to == null && from == null){
		sprite.resetSwapColor();
	}else{
		if(reset != null && reset){
			sprite.setSwapColor(to, from);
		}else{
			sprite.pushSwapColor(to, from);
		}
	}
	return sprite;
}

//TODO 使用してなさそう
function imageWidth(name)
{
	return imageResource.data[name].width;
}

function imageSeparateWidth(name)
{
	return imageResource.separateWidth[name];
}

/**
 * 1セルのサイズ
 */
function imageCellSize(name){
	var img = imageResource;
	return {w: separateWidth[name], h: separateHeight[name]};
}

/**
 * 画像のサイズ(セル単位)
 */
function imageCellsNum(name){
	var size = imageCellSize(name)
		, img = imageResource.data[name];
	return {w: (img.width / size.w) | 0, h: (img.height / size.h) | 0};
}

function imageChipSize(name)
{
	return imageCellSize[name];
}

function spriteFromImage(name, index)
{
	var sp = imageResource.makeSprite(name, index);
	return sp;
}
////////
////////
////////
/**
 * キャンバススプライト
 * @param img
 * @param x
 * @param y
 * @param w
 * @param h
 * @returns
 */
function CanvasSprite(){return;}
CanvasSprite.prototype = {

	// init: function(img, x, y, w, h)
	init: function(name, x, y, w, h)
	{
		this.image = imageResource.data[name];
		this.ctx = imageResource.ctx[name];
		this.workSpace = imageResource.workSpace[name];
		this.initCommon(name, x, y, w, h);
	},
	
	initInCanvas: function(canvas, x, y, w, h)
	{
		var name = canvas.name != null ? canvas.name :  'incanvas_' + Object.keys(imageResource.data).length;
		this.image = canvas;
		this.ctx = canvas.getContext('2d');
		// this.workSpace = imageResource.makeWorkSpace(this.image, sprite.w, sprite.h);
		imageResource.appendImage(name, this.image, w, h);
		this.workSpace = {canvas: this.image, ctx: this.ctx, data: this.image};
		this.initCommon(name, x, y, w, h);
	},
	
	copySprite: function(sprite)
	{
		var name = 'copySprite_' + Object.keys(imageResource.data).length;
		this.image = createCanvas(sprite.image.width, sprite.image.height);
		this.ctx = initContext(this.image);
		this.ctx.drawImage(sprite.image, 0, 0);
		imageResource.makeWorkSpace(this.image, sprite.w, sprite.h);
		imageResource.appendImage(name, this.image, sprite.w, sprite.h);
		this.workSpace = {canvas: this.image, ctx: this.ctx, data: this.image};
		this.initCommon(name, sprite.x, sprite.y, sprite.w, sprite.h);
		this.hFlipFlag =  sprite.hFlipFlag;
		this.vFlipFlag =  sprite.vFlipFlag;
		this.rotFlag = sprite.rotFlag;
	},
	
	initCommon: function(canvas, x, y, w, h)
	{
		this.x = x; this.y = y;
		this.w = w; this.h = h;
		this.swaps = null;
		this.swapImage = null;
		this.swapCanvas = null;
		this.swapContext = null;
		// this.swapCanvas = createCanvas(w, h);
		// this.swapContext = initContext(this.swapCanvas);
		this.hFlipFlag = false;
		this.vFlipFlag = false;
		this.rotFlag = 0; //0:↑ 1:→ 2:↓ 3:←
		this.name = canvas;
		this.id = (this.x / this.w) + (this.y * (imageResource.data[this.name].width / this.w) / this.h) | 0;
		this.chunkQuery = ''; //CurrentQuery
		this.chunkIds = null; //CurrentSpriteId
		this.chunkMap = [[]]; //ChunkQuery-Position
	},
	
	drawScroll: function(scroll, x, y)
	{
		scroll.drawSprite(this, 0 | x, 0 | y);
	},

	makeRect: function(x, y)
	{
		var rects = new Rect();
		rects.init(x, y, this.w, this.h);
		return rects;
	},

	vflip: function(toggle)
	{
		this.vFlipFlag = toggle == null ? !this.vFlipFlag : toggle;
		return this;
	},
	
	hflip: function(toggle)
	{
		this.hFlipFlag = toggle == null ? !this.hFlipFlag : toggle;
		
		return this;
	},
	
	flip: function()
	{
		var h = (-sprite.hFlipFlag + !sprite.hFlipFlag) | 0, v = (-sprite.hFlipFlag + !sprite.hFlipFlag) | 0;
		this.ctx.translate(this.x, 0);
		this.ctx.scale(-1, 1);
		// this.x = this.image.width - this.x - this.w;
		this.ctx.drawImage(this.image, this.x, 0);
		// this.ctx.translate(this.image.width, this.image.height);
		// this.x = this.x * -sprite.hFlipFlag;
		// this.y = this.y * -sprite.vFlipFlag;
		// this.x = this.image.width - this.x ;
	},
	
	//回転非対応
	rot: function(trbl)
	{
		var pr = this.rotFlag, ph;
		this.rotFlag = trbl == null ? (trbl + 1) % 4 : trbl;

		if(this.rotFlag != pr && (this.rotFlag - pr + 4) % 2 == 1){
			ph = this.h;
			this.h = this.w;
			// this.w = ph;
		}
		
		return this;
	},

	/**
	 * スクロール側で実行
	 */
	swapStart_o: function(bg)
	{
		var tmp, data, bgdata, index = 0
			, from , to, pixels = this.w * this.h, p, slen, i, swaps = this.swaps, swap
			, index1 = 0, index2 = 1, index3 = 2, index4 = 3
		;
		if(swaps == null){swaps = [];}
		slen = swaps.length;
		tmp = this.ctx.getImageData(this.x, this.y, this.w, this.h);
		data = tmp.data; bgdata = bg.data;
		for(p = 0; p < pixels; p++){
			for(i = 0; i < slen; i++){
				swap = swaps[i];
				from = swap[0];
				to = swap[1];
				if(data[index1] == from[0] && data[index2] == from[1] && data[index3] == from[2] && data[index4] == from[3]){
					data[index1] = to[0];
					data[index2] = to[1];
					data[index3] = to[2];
					data[index4] = to[3];
					break;
				}
			}
			if(data[index4] == 0){
				//アルファ描画補正
				data[index1] = bgdata[index1];
				data[index2] = bgdata[index2];
				data[index3] = bgdata[index3];
				data[index4] = bgdata[index4];
			}
			// index += 4;
			index1 += 4;
			index2 += 4;
			index3 += 4;
			index4 += 4;
		}
		this.swapImage = tmp;
		return tmp;
	},
	/**
	 * スクロール側で実行
	 */
	swapStart: function()
	{
		var tmp, data, bgdata, index = 0
			, from , to, pixels = this.w * this.h, p, slen, i, swaps = this.swaps, swap
			, index1 = 0, index2 = 1, index3 = 2, index4 = 3
		;
		if(swaps == null){
			swaps = [];
		}
		slen = swaps.length;
		tmp = this.ctx.getImageData(this.x, this.y, this.w, this.h);
		if(swaps.length == 0){
			// no swqp empty swapcolors
			return tmp;
		}
		
		data = tmp.data;
		// bgdata = bg.data;
		for(p = 0; p < pixels; p++){
			for(i = 0; i < slen; i++){
				swap = swaps[i];
				from = swap[0];
				to = swap[1];
				if(data[index1] == from[0] && data[index2] == from[1] && data[index3] == from[2] && data[index4] == from[3]){
					data[index1] = to[0];
					data[index2] = to[1];
					data[index3] = to[2];
					data[index4] = to[3];
					break;
				}
			}

			index1 += 4;
			index2 += 4;
			index3 += 4;
			index4 += 4;
		}
		this.swapCanvas = createCanvas(this.w, this.h);
		this.swapContext = initContext(this.swapCanvas);
		this.swapContext.putImageData(tmp, 0, 0);
		this.swapImage = this.swapCanvas;
		this.swaps = [];

		return tmp;
	},
	/**
	 * 色を交換
	 * ※連続的に変更する場合は
	 * swapColorReset
	 * も合わせて使うこと
	 */
	swapColor: function(to, from)
	{
		if(this.swaps == null){this.swaps = [];}
		this.swaps.push([from, to]);
		return this;
	},

	setSwapColor: function(to, from)
	{
		this.swaps = [];
		this.swaps.push([from, to]);
		this.swapStart();
		return this;
	},
	pushSwapColor: function(to, from)
	{
		if(this.swaps == null){this.swaps = [];}
		if(this.isSwapColor(to, from)){
			return this;
		};
		this.swaps.push([from, to]);
		return this;
	},
	
	isSwapColor: function(to, from)
	{
		var i, fromto = from.join(',') + ':' + to.join(',');
		if(this.swaps == null){this.swaps = [];}
		for(i = 0; i < this.swaps.length; i++){
			if(this.swaps[i][0].join(',') + ':' + this.swaps[i][1].join(',') == fromto){
				return true;
			}
		}
		return false;
	},


	/**
	 * 色交換をリセット
	 */
	resetSwapColor: function()
	{
		this.swaps = null;
	},

};

//サイズ変換
function cellto(cell, size, side)
{
	if(size == null){
		size = CHIPCELL_SIZE;
	}
	
	if(side != null && side == "bottom"){
		return DISPLAY_HEIGHT - (cell * size);
	}else if(side != null && side == "right"){
		return DISPLAY_WIDTH - (cell * size);
	}
	return cell * size;
}
function cellhto(cellh, side)
{
	if(side != null && side == "bottom"){
		return DISPLAY_HEIGHT - (cellh * CHIPCELL_SIZE);
	}else if(side != null && side == "right"){
		return DISPLAY_WIDTH - (cellh * CHIPCELL_SIZE);
	}
	return cellh * CHIPCELL_SIZE;
}

function tocellh(px)
{
	return (px / CHIPCELL_SIZE) | 0;
}

/**
 * セルサイズで割り切れる値 
 */
function parseCell(px, size)
{
	size = size == null ? CHIPCELL_SIZE : size;
	px |= 0;
	return px - (px % size);
	
}

function SpriteHandle(imageName, id, scroll){
	return;
}

SpriteHandle.prototype = {
	commonInitialize: function(imageName, id, scroll)
	{
	//	alert(imageName);
		this.x = 0;
		this.y = 0;
		this.sprite;
		this.scroll = 'view';
		this.disp = true;
		this.id = null;
		this.key = null;
		this.destroy = false;
		this.imageName = "";
		this.sortIndex = 0;
		this.frameAnimation = null;	// = new frameAnimation();
		this.frameTransition = {x: null, y:null};	// = new frameTransition();
		this.name = "noname";
		this.priority = "";//多分使わない方向
	
		if(scroll != null){
			this.scroll = scroll;
		}
	
	//	this.sprite = imageResource.makeSprite(this.imageName, 0);
		if(imageName != null){
			this.imageName = imageName;
		}
		if(id != null){
			this.id = id;
		}
		//スプライトをつくる
		if(this.id != null && this.scroll != null){
			this.sprite = imageResource.makeSprite(this.imageName, this.id);
	// console.log(111)
		}
	},
	
	initWithResourceSpriteIdScroll: function(resource, id, scroll)
	{
		this.commonInitialize(resource, id, scroll);
		// dulog(resource);
		this.setImageName(resource);
		this.setId(id);
		this.setScroll(scroll);
		if(this.key == null){
			this.key = SpriteHandleBundle.stack(this);//
		}
		this.sortIndex = 0;
	},
	
	initWithResourceSpriteRectScroll: function(resource, sprRect, scroll)
	{
		this.commonInitialize(resource, 0, scroll);
		this.setImageName(resource);
		if(sprRect != null){
			this.sprite = makeSpriteChunk(resource, sprRect);
		}
		this.setScroll(scroll);
		if(this.key == null){
			this.key = SpriteHandleBundle.stack(this);//
		}
		this.sortIndex = 0;
	},
	
	setTransition: function(dist, frame, points, delay, loop, func){
		var trn = this.frameTransition; 
		if(trn != null){
			trn = this.initTransition(trn, dist, points, frame, (delay != null) ? delay : null, (loop != null) ? loop : null, (func != null) ? func : null);
		}else{
			trn = this.makeTransition("", dist, points, frame, (delay != null) ? delay : null, (loop != null) ? loop : null, (func != null) ? func : null);
		}
		this.frameTransition = trn;
	},

	setTransition_x: function(dist, frame, points, delay, loop, func){
		var trn = this.frameTransition.x;
		if(trn != null){
			trn = this.initTransition(trn, dist, points, frame, (delay != null) ? delay : null, (loop != null) ? loop : null, (func != null) ? func : null);
		}else{
			trn = this.makeTransition(".x", dist, points, frame, (delay != null) ? delay : null, (loop != null) ? loop : null, (func != null) ? func : null);
		}
		this.frameTransition.x = trn;
	},
	
	setTransition_y: function(dist, frame, points, delay, loop, func){
		var trn = this.frameTransition.y;
		if(trn != null){
			trn = this.initTransition(trn, dist, points, frame, (delay != null) ? delay : null, (loop != null) ? loop : null, (func != null) ? func : null);
		}else{
			trn = this.makeTransition(".y", dist, points, frame, (delay != null) ? delay : null, (loop != null) ? loop : null, (func != null) ? func : null);
		}
		this.frameTransition.y = trn;

	},
	
	getTransition: function()
	{
		return this.frameTransition;
	},

	makeTransition: function(ext, dist, points, frame, delay, loop, func){
		var trn = new FrameTransition(this.imageName + "." + this.scroll + "." + this.key + ext);
		this.initTransition(
			trn, dist, 
			(points == null) ? null : points,
			(frame == null) ? null : frame,
			(delay == null) ? null : delay,
			(loop == null) ? null : loop,
			(func == null) ? null : func
			
		);
		// trn.setFramePoints(dist, frame, (points == null) ? null : points);
		// if(delay != null){//みしよう？
			// trn.setDelay(delay);
		// }
		// if(func != null){
			// trn.setCallback(func);
		// }
		// // dulog(trn.from)
		// trn.loop = (loop != null) ? loop : trn.loop;

		return trn;
	},
	
	initTransition: function(trn, dist, points, frame, delay, loop, func){
		trn.setFramePoints(dist, frame, (points == null) ? null : points);
		if(delay != null){//みしよう？
			trn.setDelay(delay);
		}
		if(func != null){
			trn.setCallback(func);
		}
		// dulog(trn.from)
		trn.loop = (loop != null) ? loop : trn.loop;

		return trn;
	},

	resetTransition_x: function()
	{
		this.frameTransition.x.resetCount();
	},
	
	resetTransition_y: function()
	{
		this.frameTransition.y.resetCount();
	},
	
	doesTransition: function()
	{
		return this.frameTransition == null ? false : !this.frameTransition.isFinish();
	},

	doesTransition_x: function()
	{
		return this.frameTransition.x == null ? false : !this.frameTransition.x.isFinish();
	},

	doesTransition_y: function()
	{
		return this.frameTransition.y == null ? false : !this.frameTransition.y.isFinish();
	},
	
	doesAnimation: function()
	{
		return this.frameAnimation == null ? false : !this.frameAnimation.isFinish();
	},

	setAnimation: function(sprites, frames, delay, loop, func, primary)
	{
		// var anm = new FrameAnimation(this.imageName + "." + this.scroll + "." + this.key);
		var anm, i;
		if(this.frameAnimation == null){
			anm = new FrameAnimation(this.priority + this.imageName + "." + this.scroll + "." + this.key);
		}else{
			anm = this.frameAnimation;
		}
		anm.setSpritesFrames(sprites, frames);
		this.sprite = [];
		for(i = 0; i < sprites.length; i++){
			if(sprites[i].length != null){
				this.sprite.push(makeSprite(this.imageName, sprites[i]));
			}else{
				// this.sprite[sprites[i]] = makeSprite(this.imageName, sprites[i]);
				this.sprite.push(makeSprite(this.imageName, sprites[i]));
			}
		}
		anm.loop = (loop != null) ? loop : anm.loop;
			//	dulog(this.sprite);

		this.frameAnimation = anm;
	},

	setName: function(name){
		this.name = name;
	},

	setImageName: function(imageName){
		this.imageName = imageName;
	},

	setScroll: function(scroll){
		if(typeof scroll == "string"){
			scroll = scrollByName(scroll);
		}
		this.scroll = scroll;
		// dulog(this.scroll)
	},

	setId: function(id){
		if(id == null){
			id = 0;
		}
		if(id.length != null){
			this.setIds(id);
			return;
		}
		
//		this.sprite = imageResource.makeSprite(this.imageName, this.id);
		this.id = id;
		this.sprite = imageResource.makeSprite(this.imageName, this.id);
		var swap = this.getSwap();
		this.setSwap(swap);
	},

	setIds: function(ids){
		if(ids.length == 0){
			ids = [[ids]];
		}
		if(ids[0].length == 0){
			ids = [ids];
		}
		this.id = ids;
		// dulog(this.id);
		this.sprite = makeSpriteChunk(this.imageName, this.id);
		var swap = this.getSwap();
		this.setSwap(swap);
	},

	setPos: function(x, y){
		if(x != null){
			this.x = x;
		}
		if(y != null){
			this.y = y;
		}
	},

	getPos: function()
	{
		var x = this.x, y = this.y;
		x += (this.frameTransition.x != null) ? this.frameTransition.x.getNowPoint() : 0;
		y += (this.frameTransition.y != null) ? this.frameTransition.y.getNowPoint() : 0;
		return {x: x, y: y};
	},
	
	getSprite: function()
	{
		// return (this.frameAnimation != null) ? this.sprite[this.frameAnimation.getNowSprite()] : this.sprite;
		try{
			return (this.frameAnimation != null) ? this.sprite[this.frameAnimation.getNowSpritePat()] : this.sprite;
		}catch(e){
			dulog([this.frameAnimation, this.sprite]);
			throw 'getSprite error: ';
		}
		
	},
	
	setSprite: function(sprite)
	{
		this.sprite = sprite;
	},
	
	setSort: function(index)
	{
		this.sortIndex = index;
	},
	getSortIndex: function(index)
	{
		return this.sortIndex;
	},
	
	width: function()
	{
		return this.sprite.w;
	},

	height: function()
	{
		return this.sprite.h;
	},

	visible: function()
	{
		this.disp = true;
	},

	hide: function()
	{
		this.disp = false;
	},

	//スクロールに書き込む
	drawScroll: function(scr, x, y){
		if(scr == null){
			if(this.scroll == null){return;}
			scr = this.scroll;
		}
		if(this.getSprite() == null){return;}
		
		if(!this.disp){return;}
		var pos;
		if(x != null && y != null){
			pos = {x:x, y:y};
		}else{
			pos = this.getPos();
		};
		if(this.sprite.length == null){
			scr.drawSprite(this.getSprite(), pos.x, pos.y);
		}else{
			scr.drawSpriteChunk(this.getSprite(), pos.x, pos.y);
		}
	},

	getSwap: function()
	{
		if(this.sprite.length != null){
			if(this.sprite[0].length != null){
				return this.sprite[0][0].swaps;
			}
			return this.sprite[0].swaps;
		}
		return this.sprite.swaps;
	},

	setSwap: function(swap)
	{
		var i, j;
		if(this.sprite.length != null){
			if(this.sprite[0].length != null){
				for(j in this.sprite){
					for(i in this.sprite[j]){
						this.sprite[j][i].swaps = swap;
					}
				}
				return;
			}
			for(i in this.sprite){
				this.sprite[i].swaps = swap;
			}
			return;
		}
		this.sprite.swaps = swap;
	},

	swapColor: function(to, from)
	{
//		alert(from);
		this.sprite.swapColor(to, from);
	},
	swapColorReset: function()
	{
		this.sprite.swapColorReset();
	},
	//スタックする
//	stack: function(scroll){
//		if(scroll != null){
//			this.scroll = scroll;
//		}
////		if(this.sprite == null){return;}alert(scroll);
//	},

	makeRect: function()
	{
		var rect = this.sprite.makeRect();
		return rect;
	},


	remove: function(){
		this.destroy = true;
		this.hide();
		if(this.frameAnimation != null){
			this.frameAnimation.remove();
		}
		if(this.frameTransition.remove != null){
			this.frameTransition.remove();
		}else{
			if(this.frameTransition.y != null){
				this.frameTransition.y.remove();
			}
			if(this.frameTransition.x != null){
				this.frameTransition.x.remove();
			}
		}
		delete this.sprite;
	},
};

function getScrollNum()
{
	return layerScroll.length;
}


/**
 * スプライトハンドルまとめ（DrawEventでまとめてSprite実行）
 */

var SpriteHandleBundle = {};

SpriteHandleBundle.init = function()
{
	this.spriteStacks = [getScrollNum()];//sprite Handle

	this.FrameEvent = new FrameEvent("sprite:frame");//FrameEventを先にインスタンスしないとDrawEventがインスタンスできない
	this.DrawEvent = new DrawEvent("zzzsprite:draw", this);//これでいいのかよくわからない
//	alert(a_dump(this.DrawEvent));
	this.DrawEvent.append("draw");
//	this.FrameEvent.append("ysort");

	this.stack = function(spriteh)
	{
		// console.log(111);
		var scroll, returnKey;
		// if(this.spriteStacks == null){return;}
		if(spriteh.scroll == null){return;}
		scroll = spriteh.scroll;
		if(scroll == null){scroll = 'view';}
		if(this.spriteStacks[scroll] == null){
		// alert(scroll);
			this.spriteStacks[scroll] = [];
		}
		// console.dir(spriteh);
		returnKey =this.spriteStacks[scroll].length;
		this.spriteStacks[scroll].push(spriteh);
		// dulog(returnKey);
		return returnKey;
//		this.spriteStacks.push = spriteh;
	};

	this.sort = function()
	{
		return;
	};

	this.ysort = function(stacks)
	{
		return;
	};

	this.draw = function()
	{
		var stack, scrName, sorted, sortIndexes, i;
		if(this.spriteStacks == null){
			return;
		}
		for(scrName in this.spriteStacks){
			if(this.spriteStacks[scrName] == null){
				// dulog("Scroll[" + scrName + "] not found");
				// pauseScript();
				continue;
			}
			 stack = this.spriteStacks[scrName];
			if(stack.length == 0){continue;}
// dulog(scrName);
			sorted = [];
			sortIndexes = [];
			// dulog(stack.length);
				//消す
			try{
				for(i = 0; i < stack.length; i++){
					if(stack[i].destroy){
						stack[i] = null;
						delete stack[i];
						stack.splice(i, 1);
						// this.spriteStacks[scrName].splice(i, 1);
//TODO:連続delete 確認
						i--;
						// dulog(stack);
					}
				}
			}catch(e){
				dulog('spriteHandle draw stacks error:');
				dulog([stack, i]);
			}

				for(i = 0; i < stack.length; i++){
					if(stack[i] == null){
						dulog("sprite handle not found: " + i);
					}
					sortIndexes.push(stack[i].sortIndex);
					sorted.push(stack[i]);
				}
				sorted.sort(function(a, b){return a.getSortIndex() - b.getSortIndex();});
	
				//表示
				try{
					for(i = 0; i < sorted.length; i++){
						// echoEnable = true;
						// echo("<br>sprite::" + sorted[i].destroy + "<hr>");
						// echo("<br>" + sorted.length);
						
						sorted[i].drawScroll();
					}
				}catch(e2){
					dulog([stack, sorted[i]]);
					throw (e2 + ' > spriteHandle sort draw error:');
				};
			}
	};

};

//要makeSprite
function makeSpriteHandle(sprites, scrollName, x, y)
{
	var spritehandle = [[]], handle, j, i;
	array_squrt(sprites);//2次元

	if(x == null){
		x = 0;
	}
	if(y == null){
		y = 0;
	}
	for(j in sprites)
		for(i in sprites[j])
		{
			handle = new SpriteHandle();
			handle.commonInitialize(sprites[j][i].image, 0, scrollName);
			handle.setPos(x + (sprites[j][i].w * i) , y + (sprites[j][i].h * j));
			spritehandle[j].push(handle);
		}
	return spritehandle;
}

function rectFromSprite(sprite, x, y)
{
	if(typeof sprite != "object"){
		return sprite.makeRect(x, y);
	}else if(typeof sprite[0] != "object"){
		sprite = [sprite];
	}
	var rects = new Rect(), i, j, w, h;
	rects.init(0,0,0,0);
	for(j = 0; j < sprite.length; j++){
		for(i = 0; i < sprite[0].length; i++){
			w = sprite[j][i].w;
			h = sprite[j][i].h;
			rects.append(sprite[j][i].makeRect(x + (i * w),y + (j * h)));
		}
	}
	return rects;
}


//RGBA
var COLOR_RED = [247, 49, 0, 255];
var COLOR_FONT8 = [252, 252, 252, 255];
var COLOR_FONT12 = [181, 247, 214, 255];
var COLOR_LIGHTBLUE = [60, 188, 252, 255];
var COLOR_TRANSPARENT = [0, 0, 0, 0];
var COLOR_ADD = [82, 247, 148, 255];
var COLOR_SUB = [247, 82, 148, 255];
// var COLOR_BLACK = [1, 1, 1, 255]; //pallet v
var COLOR_BLACK = [0, 0, 1, 255]; //pallet: NesPallet_NTSC
// var COLOR_WHITE = [255, 255, 255, 255];
var COLOR_WHITE = [252, 252, 252, 255];//nespallette
var COLOR_REQUID = [0, 140, 140, 255];
var COLOR_INVALID = [247, 181, 0, 255];
var COLOR_STAR = [255, 222, 123, 255];
function makeRGB(color)
{
	var csv = color.slice(0, 3).join(", ");
	return 'rgb(' + csv + ')';
}
function makeRGBA(color)
{
	var csv = color.join(", ");
	return 'rgba(' + csv + ')';
}
function makeColorArray(str)
{
	var a = str.slice(1).split(/([0-9a-fA-F]{2})/).filter(Boolean).concat("255");
	return a.map(function(b){
		return parseInt(b, 16);
	});
}

/**
 * 拡大縮小済み画面サイズ
 * @returns {___anonymous22047_22111}
 */
function getDisplaySize()
{
	return {w: (VIEWMULTI * DISPLAY_WIDTH), h: (VIEWMULTI * DISPLAY_HEIGHT)};
//	return {w: (DISPLAY_WIDTH), h: (DISPLAY_HEIGHT)};
}

/**
 * 拡大縮小なしスクロールサイズ	
 * @returns 
 */
function getScrollSize()
{
	return {w: (DISPLAY_WIDTH), h: (DISPLAY_HEIGHT)};
}

/**
 * アニメーション用推移
 */
function setTransition(transition, value, delay, from)
{
	if(transition == null){
		transition = {};
	}
	transition.to = value | 0;
	transition.count = 0;
	if(delay != null){
		transition.delay = delay | 0;
	}
	if(from != null){
		transition.from = from | 0;
	}
	return transition;
}

/**
 * 分割して何節目か
 */
function dividePattern(pattern, division)
{
	this.count = 0;
	this.pattern = pattern;
	this.division = division;
	this.max = this.pattern * this.division;
}
dividePattern.prototype = {
	init: function(division, pattern)
	{
		this.count = 0;
		this.pattern = pattern;
		this.division = division;
	},
		
	now: function()
	{
		var d = ((this.count / this.division) | 0) % this.pattern;
		return d;
	},
	
	next: function()
	{
		this.count = (this.count + 1) % (this.max);
	},
};


/**
 * 3点からなる2次曲線をの位置を求める
 * @param {Object} t->x
 * @param {Object} pos->y
 */
function quadrateCurve(t, pos)
{
	var term = []//ax^2 + bx + c = y
		, plen = pos.length
		, i, p, tlen, j, d, k, l, sub, m, res, n
		;
	for(i = 0; i < plen; i++){
		term[i] = [];
		for(p = 0; p < plen; p++){
			term[i].push(Math.pow(pos[i].x, plen - 1 - p));
		}
		term[i].push(pos[i].y);
		// term[i] = [pos[i].x * pos[i].x, pos[i].x, 1, pos[i].y];
		//100 10 0 1
		//400 20 0 2
		//900 30 0 25
		 // alert(term[i]);
	}
	tlen = term[0].length;
	for(j = 0; j < plen; j++){
		d = term[j][j];//注目式の係数を１にするための値
		// alert(d);
		//100 , 400?, 900?
		//
		for(k = j; k < tlen; k++){
			term[j][k] = (d != 0) ? term[j][k] / d : 0 ;//0を割るところはスキップされている
			
			//term[j][k] = (d != 0) ? term[j][k] / d : 1 ;//0を割るところはスキップされている
			
			//0, 0.1, 0, 0.01
			//
			// if(term[j][k] == 0){dulog([j, k])}
			// if(d==0){dulog("0divide")}
		}
		
		for(l = 0; l < plen; l++){
			if(l == j){continue;}//注目式スキップ
			sub = term[l][j];
			// _ 400, 900
			// alert(sub);
			for(m = j; m < tlen; m++){
				term[l][m] = term[l][m] - (sub * term[j][m]);
			// _ 400, 900
			}
		}
	}
	res = 0;
	for(n= 0; n < plen - 1; n++){
		res += Math.pow(t, plen - 1 - n) * term[n][tlen - 1];
		// dulog(res);
	}
	// toggleScript()
	// dulog(res);	
	return res;

}
