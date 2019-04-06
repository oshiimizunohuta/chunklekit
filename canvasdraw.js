/* global SCROLL_MAX_SPRITES_DRAW, SCROLL_MAX_SPRITES_STACK, UI_SCREEN_ID, VIEWMULTI, DISPLAY_WIDTH */

/**
 * @name Canvas Draw Library
 * @since 2013-11-19 07:43:37
 * @author bitchunk
 * @version 0.4.5
 */

import * as props from './prop.js'; 
import {makeRect, CKAPIServer, initAPIServer, bubbleSort} from './util.js';
//キャンバスことスクロール
var canvasScrollBundle = {};

export function makeScroll(name, mainFlag, width, height){
	var scr = new CanvasScroll();
	scr.init(name, mainFlag, width, height);
	return scr;
};
export function makeCanvasScroll(scrollName, insertID){
	var scr = new CanvasScroll();
	insertID = insertID == null ? 'display' : insertID;
	scr.init(scrollName, scrollName == props.UI_SCREEN_ID, null, null, insertID);
	canvasScrollBundle[scrollName] = scr;
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


function screenViewScroll(){
	return scrollByName(props.UI_SCREEN_ID);
}
/**
 * 拡大縮小済み画面サイズ
 * @returns {___anonymous22047_22111}
 */
export function getDisplaySize()
{
//	let s = screenViewScroll();
//	return s.getRect();
	let r = CanvasScroll.scaleRate()
		, c = CanvasScroll
		, size = getScrollSize()
	;
	return {w: r * size.w, h: r * size.h};
}

function getScrollSize()
{
	let C = CanvasScroll
		, R = imageResource
	;
//	return {w: (VIEWMULTI * (DISPLAY_WIDTH + CHIPCELL_SIZE)), h: (VIEWMULTI * (DISPLAY_HEIGHT + CHIPCELL_SIZE))};
	return {w: C.DISPLAY_WIDTH, h: C.DISPLAY_HEIGHT};
//	return {w: C.DISPLAY_WIDTH + R.CHIPCELL_SIZE, h: C.DISPLAY_HEIGHT + R.CHIPCELL_SIZE};
}


/**
 * スクロール風canvas
 * @class
 * @name CanvasScroll
 */
class CanvasScroll{
	init(name, mainFlag, width, height, insertID){
		var size = getDisplaySize()
			, scrsize = getScrollSize()
			, display
			;
		
		this.canvas = document.getElementById(name);
		if(this.canvas == null){
			this.canvas = document.createElement('canvas');
			this.canvas.setAttribute('id', name);
			//makeScrollによるエレメントをhtmlに追加しない処理もある
			if(insertID != null){
				document.getElementById(insertID).appendChild(this.canvas);
			}
		}
	//	this.autoClear = true;//no actiove
	//	this.clearTrig = false;//no clear trigger
		mainFlag = mainFlag == null ? false : mainFlag;
		if(mainFlag != null && mainFlag){
			width = size.w;
			height = size.h;
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
		this.canvas.name = name;
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style.width = width;
		this.canvas.style.height = height;
		this.canvas.style.display = display;
		this.canvas.hidden = display == 'none' ? false : true;
		this.canvas.style.backgroundColor = "transparent";
		this.mainFlag = mainFlag;
		
		this.ctx = initContext(this.canvas);
		this.x = 0;
		this.y = 0;
//		canvasScrollBundle[name] = this;
		this.maxSprites = props.SCROLL_MAX_SPRITES_DRAW;
		this.maxSpritesStack = props.SCROLL_MAX_SPRITES_STACK;
		this.drawInfoStack = [];
		this.drawPrimary = true; //draw reliably even overdraw
		this.blinkContinues = 0; 
		
		this.pointImage = this.ctx.createImageData(1, 1);
		
		this.rasterFunc = null;
		this.rasterLines = {horizon: [], vertical: []};
		this.rasterVolatile = true;
		
		this.mirrorMode = null;
		this.mirrorWidth = width;
		this.mirrorHeight = height;
		
		this.volatile = false;
		this.defaultColor = null;
		//描画された履歴
		this.drawnInfoHistory = {};
		
	}

	drawto(targetScroll, x, y, w, h)
	{
		if(!this.is_visible()){return;}
		if(targetScroll == null){return;}
		if(w == null){w = this.canvas.width;}
		if(h == null){h = this.canvas.height;}
		if(x == null){x = this.x;}
		if(y == null){y = this.y;}
		targetScroll.ctx.drawImage(this.canvas, 0 | x, 0 | y, w, h);
//		targetScroll.ctx.drawImage(this.canvas, 0 | -x, 0 | -y, w, h);
	}

	//拡大しない
	//対象のスクロール基準の走査
	rasterto(targetScroll, dx, dy, dw, dh)
	{
		var x, y
		;
		if(!this.is_visible()){return;}
		if(dw == null){dw = this.canvas.width;}
		if(dh == null){dh = this.canvas.height;}
		if(dx == null){dx = this.x;}
		if(dy == null){dy = this.y;}
		var sw = dw, sh = targetScroll.canvas.height, sx = 0, sy = 0
			, i, raster, pos = {x: 0, y: 0}, fixpos = {x: dx, y: dy}, currentLine = 0
			, raster = this.rasterLines.horizon
			, h = 0
			, mirrorw = this.mirrorWidth, mirrorh = this.mirrorHeight
			;
			
		if(raster.length > 0){
			for(i = 0; i < sh; i++){
				if(raster[i] != null){
					h = i - currentLine;
					if(h > 0){
//						x = 0 | (pos.x + fixpos.x) % (dw * 2);
//						y = 0 | (currentLine - pos.y - fixpos.y) % (dh * 2);
						x = 0 | (pos.x + fixpos.x);
						x = x <= - mirrorw ? mirrorw + mirrorw + x : x;
						x = x >= mirrorw ? x - mirrorw - mirrorw : x;
						y = 0 | (currentLine - pos.y - fixpos.y);
						y = y <= - mirrorh ? mirrorh + mirrorh + y : y;
						y = y >= mirrorh ? y - mirrorh - mirrorh : y;
						targetScroll.ctx.drawImage(this.canvas, 0, y, 0 | sw, h, x, currentLine, 0 | dw, h);

						currentLine = i;
					}
					pos.x = raster[i].x;
					pos.y = raster[i].y;
				}
			}
//			x = 0 | (pos.x + fixpos.x) % (dw * 2);
//			y = 0 | (currentLine - pos.y - fixpos.y) % (dh * 2);
			x = 0 | (pos.x + fixpos.x);
			x = x <= - mirrorw ? mirrorw + mirrorw + x : x;
			x = x >= mirrorw ? x - mirrorw - mirrorw : x;
			y = 0 | (currentLine - pos.y - fixpos.y);
			y = y <= - mirrorh ? mirrorh + mirrorh + y : y;
			y = y >= mirrorh ? y - mirrorh - mirrorh : y;
			h = i - currentLine;
			targetScroll.ctx.drawImage(this.canvas, 0, y, 0 | sw, h, x, currentLine, 0 | dw, h);
		}else if(this.rasterLines.vertical.length > 0){
			raster = this.rasterLines.vertical;
			for(i = 0; i < sw; i++){
				if(raster[i] != null){
					if(currentLine < i){
						targetScroll.ctx.drawImage(this.canvas, currentLine, 0, 0 | i - currentLine, 0 | sh, 0 | pos.x + fixpos.x, 0 | pos.y + fixpos.y, i - currentLine, 0 | dh);
					}
					pos.x = raster[i].x;
					pos.y = raster[i].y;
					targetScroll.ctx.drawImage(this.canvas, i, 0, 1, 0 | sh, 0 | pos.x + fixpos.x, 0 | pos.y + fixpos.y, 1, 0 | dh);
					currentLine = i + 1;
					pos.y++;
				}
			}
			targetScroll.ctx.drawImage(this.canvas, currentLine, 0, 0 | i - currentLine, 0 | sh, 0 | pos.x + fixpos.x, 0 | pos.y + fixpos.y, i - currentLine, 0 | dh);
			
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
	}
	
	//元のスクロール基準の走査
	rasterfrom(targetScroll, dx, dy, dw, dh)
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
					pos.x = raster[i].x;
					pos.y = raster[i].y;
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
	}
	
	
	/**
	 * ニアレストネイバー
	 * @param targetScroll
	 * @param multi
	 */
	nearestTo(targetScroll, multi)
	{
		if(targetScroll.canvas == null){return;}
		if(multi == null){multi = props.VIEWMULTI;}

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

	}

	drawDrawInfoStack()
	{
		var stack = this.drawInfoStack, drawInfo, cnt = 0
			, overnum = stack.length - this.maxSprites
//			, blinkStart = this.maxSprites - overnum
			, blinkRate = overnum < 0 ? 0 : overnum / this.maxSprites
			, blinked = 0, primal = this.drawPrimary, tinue = this.blinkContinues
		;
		bubbleSort(stack, 'asc', 'order');
//		stack.sort(function(a, b){return a.order - b.order;});

//		stack = stack.slice();
		while(stack.length){
			drawInfo = stack.shift();

			if(drawInfo.sprite != null){
				if(!primal && blinkRate > 0){
//				if(blinkRate > 0){
					if((blinkRate * cnt++) + tinue >= blinked){
						blinked++;
						continue;
					}
				}
//				console.log(drawInfo.sprite.x);
				this.drawSpriteInfo(drawInfo);
			}else if(drawInfo.fillrect != null){
				this.drawFillRectInfo(drawInfo);
			}else if(drawInfo.from != null){
				this.drawSpriteLineInfo(drawInfo);
			}
		}
		
		this.blinkContinues = (blinkRate * cnt) + tinue - blinked;
		return true;
	}

	/**
	   * 描く
	   * @param sprite
	   * @param x
	   * @param y
	   */
	drawSprite(sprite, x, y)
	{
		if(sprite == null){
			return null;
		}
		var info = sprite.makeSpriteInfo(x, y);
		this.drawInfoStack.push(info);
		if(this.maxSpritesStack < this.drawInfoStack.length){
			this.drawInfoStack.shift();
		}
		return info;
	}

	drawSpriteInfo(spriteInfo)
	{
		var sprite, x, y
				, image
				, vf = 1, hf = 1, r, rox = 0, roy = 0, w = 0, h = 0, t
				, vflip, hflip
				;
		sprite = spriteInfo.sprite;
		x = spriteInfo.x;
		y = spriteInfo.y;
		w = sprite.w;
		h = sprite.h;
		vflip = spriteInfo.vflip;
		hflip = spriteInfo.hflip;
			
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
		if(vflip || hflip){
			hf = (-hflip + !hflip) | 0;
			vf = (-vflip + !vflip) | 0;
			this.ctx.scale(hf, vf);
			x = (x * hf) - (hflip * w);
			y = (y * vf) - (vflip * h);
			
			// sprite.flip();
		}
		//回転
		if(spriteInfo.rot > 0){
			if(spriteInfo.rot % 2 == 1){
				t = w;
				w = h;
				h = t;
			}
			r = spriteInfo.rot;

			r = (((1 == r) * 90) + ((2 == r) * 180) + ((3 == r) * 270)) * Math.PI / 180;
			// rox = (x * hf) - (spriteInfo.hflip * sprite.w);
			rox = x;
			roy = y;
			x = (((Math.cos(r) + Math.sin(r)) * w) - w) * 0.5;
			y = (((Math.cos(r + (Math.PI * 0.5)) + Math.sin(r + (Math.PI * 0.5))) * h) - h) * 0.5;
			this.ctx.translate(rox , roy);
			this.ctx.rotate(r);
		}
		
		if(sprite.swapImage != null){
			//色変更描画
			this.ctx.drawImage(image, 0, 0, 0 | w, 0 | h, 0 | x, 0 | y, 0 | w, 0 | h);
		}else{
			//通常描画
			this.ctx.drawImage(image, 0 | sprite.x, 0 | sprite.y, 0 | w, 0 | h, 0 | x, 0 | y, 0 | w, 0 | h);
			
		}
		//描画情報を記録
		this.drawnInfoHistory[y] = this.drawnInfoHistory[y] != null ? this.drawnInfoHistory[y] : {};
		this.drawnInfoHistory[y][x] = spriteInfo;
//		this.drawnInfoHistory[y][x] = this.drawnInfoHistory[y][x] != null ? spriteInfo : {};
		
		//以下元通りにする
		if(spriteInfo.rot > 0){
			this.ctx.rotate(-r);
			this.ctx.translate(-rox , -roy);
		}
		if(vflip || hflip){
			this.ctx.scale(hf, vf);
			// sprite.flip();
		}
		sprite = null;
		image = null;
	}
	
	//drawInfoを再描画
	redrawInfo(){
		var x, y
			, dinfo = this.drawnInfoHistory
		;
		
		for(y in dinfo){
			for(x in dinfo[y]){
				this.drawSpriteInfo(dinfo[y][x]);
			}
		}
	}
	
	drawSpriteArray(spriteArray, x, y, cellsWidth)
	{
		var posX, posY, slen = spriteArray.length, i, sprite
		;
		if(cellsWidth == null){throw "noCellWidth!";}
		
		for(i = 0; i < slen; i++){
			sprite = spriteArray[i];
			posX = (x < 0) 
			? props.DISPLAY_WIDTH + (sprite.w * (i % cellsWidth)) + x
			: (sprite.w * (i % cellsWidth)) + x;
			posY = (y < 0)
			? props.DISPLAY_HEIGHT + (sprite.h * (0 | (i / cellsWidth))) + y
			: (sprite.h * (0 | (i / cellsWidth))) + y;
			if((y < 0) ){
				console.warn(((0 | (i / cellsWidth)) - (0 | (slen / cellsWidth))));
			}
			this.drawSprite(sprite, posX, posY);
		}
	}
// TODO 旧バージョンの-値使用状況を調べる
	drawSprite2dArray(sprite2dArray, x, y)
	{
		var j , i, posX, posY, s2len = sprite2dArray.length, slen, sprite, spriteArray;
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
	}

	drawSpriteChunk(chunk, x, y)
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
	}

	stackClear()
	{
		DRAW_EVENTS.oneShot(this, "clear");
	}

	stackDraw(func)
	{
		DRAW_EVENTS.oneShot(this, func);
	}

	pset(x, y, color)
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
	}

	drawSpriteLineInfo(lineInfo)
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
		
	}
	
	// function spriteLine(from, to, sprite)
	spriteLine(from, to, color)
	{
		var f = {x: from.x, y: from.y}, t = {x: to.x, y: to.y}, c = color
		,info = {from : f, to: t, color: c, order: props.SPRITE_ORDER_DEFAULT};
		this.drawInfoStack.push(info);
		if(this.maxSpritesStack < this.drawInfoStack.length){
			this.drawInfoStack.shift();
		}
	}
	
	/**
	* 消す
	*/
	clear(color, rect, order)
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
		this.drawInfoStack.push({color: color == null ? null : color, fillrect: rect == null ? null : rect, order: order == null ? 0 : order});
	}
	
	drawFillRectInfo(rectInfo)
	{
		var color = rectInfo.color, rect = rectInfo.fillrect;
		if(rect == null){
			rect = {x: 0, y: 0, w: (0 | this.canvas.width), h: (0 | this.canvas.height)};
		}
		this.contextClear(rect.x, rect.y, rect.w, rect.h, color);
	}
	
	contextClear(x, y, w, h, color){
		if(color != null){
			this.ctx.fillStyle = makeRGB(color);
			this.ctx.fillRect(x, y, w, h);
		}else{
			this.ctx.clearRect(x, y, w, h);
		}
		
	}
	
	debugRect(rect, color)
	{
		color = COLOR_WHITE;
		this.clear(color, rect);
	}
	
	clearDrawInfoStack()
	{
		this.drawInfoStack = [];
	}

	isDrawingInfoStack()
	{
		return this.drawInfoStack.length > 0;
	}

//未使用？
	colorSwap(sprite, left, top)
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
	}

	/**
	* 映す
	*/
	project(scrollsrc)
	{
		this.ctx.clearRect();
	}

	zIndex(z)
	{
		this.canvas.style.zIndex = z;
	}


	hide() {
		this.canvas.hidden = true;
	}

	visible() {
		this.canvas.hidden = false;
	}


	is_visible() {
		if (this.canvas.hidden) {
			return false;
		}
		return true;
	}
	
	disableVolatile(){
		this.volatile = true;
	}
	enableVolatile(color){
		this.defaultColor = color;
		this.volatile = true;
	}
	
	isVolatile(){
		return this.volatile;
	}

	setRasterFunc(func) {
		this.rasterFunc = func;
	}

	resetRaster(start, end) {
		var i;
		if(start != null || end != null){
			start = start == null ? 0 : start;
			end = end == null ? this.canvas.height : end;
			for(i = start; i < end; i++){
				this.rasterLines.vertical[i] = null;
				this.rasterLines.horizon[i] = null;
			}
		}else{
			this.rasterLines.vertical = [];
			this.rasterLines.horizon = [];
		}
	}

	setRasterHorizon(sy, dx, dy, retention) {
		var i, line;
		this.rasterLines.vertical = [];
		if(retention != null && retention){
			// retention有効: すでに設定されているラスターを優先する
			for(i = sy; i >= 0; i--){
				if(this.rasterLines.horizon[i] != null){
					line = this.rasterLines.horizon[i];
					break;
				}
			}
			if(line != null){
				dx = line.x;
				dy = line.y;
			}
		}
		this.rasterLines.horizon[sy] = {
			x : dx % (this.mirrorWidth * 2),
			y : dy % (this.mirrorHeight * 2)
		};
	}


	setRasterVertical(sx, dx, dy, retention) {
		var i, line;
		this.rasterLines.horizon = [];
		if(retention != null && retention){
			for(i = sy; i >= 0; i--){
				if(this.rasterLines.horizon[i] != null){
					line = this.rasterLines.horizon[i];
					break;
				}
			}
			if(line != null){
				dx = line.x;
				dy = line.y;
			}
		}		if(retention != null && retention && this.rasterLines.vertical[sx] != null){
			return;
		}
		this.rasterLines.vertical[sx] = {
			x : dx % (this.mirrorWidth * 2),
			y : dy % (this.mirrorHeight * 2)
		};
	}

	setPosition(x, y) {
		this.canvas.style.left = x + "px";
		this.canvas.style.top = y + "px";
	}
	
	//※内容は削除される
	resizeCanvas(w, h){
		var c = this.canvas
		;
		c.width = w;
		c.height = h;
		c.style.width = w;
		c.style.height = h;
		
	}

	getSize() {
		var size = {}
		;
		size.h = this.canvas.height;
		size.w = this.canvas.width;
		return size;
	}

	getRect() {
		return makeRect(this.x, this.y, this.canvas.width, this.canvas.height);
	}
	
	static scaleRate(scale){
		if(scale != null){
			CanvasScroll.SCALSE_RATE = scale;
		}else{
			return CanvasScroll.SCALSE_RATE;
		}
	}
	
	getCenter(target){
		return (this.getSize().w - target) / 2;
	}
	
	getMiddle(target){
		return (this.getSize().h - target) / 2;
	}
	
	static displaySize(){
		
	}
	
	screenShot()
	{
		//図形の保存
		var img = new Image()
		//保存できるタイプは、'image/png'と'image/jpeg'の2種類
		, type = 'image/png'
		, element_img, element_a, del_a, pair;
		//imgオブジェクトのsrcに格納。
//		img.crossOrigin = 'Anonymous';
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
		
		return img;
	}

}
CanvasScroll.SCALSE_RATE = props.VIEWMULTI;
CanvasScroll.DISPLAY_WIDTH = props.DISPLAY_WIDTH;
CanvasScroll.DISPLAY_HEIGHT = props.DISPLAY_HEIGHT;


function swapColorImageData(ctx, swaps, rect){
	var tmp = ctx.getImageData(rect.x, rect.y, rect.w, rect.h)
		, index1 = 0, index2 = 1, index3 = 2, index4 = 3
		, data, swap, slen, from, to, p, i
		, pixels = rect.w * rect.h
	;
	if(swaps.length == 0){
		// no swqp empty swapcolors
		return tmp;
	}

	data = tmp.data;
	slen = swaps.length;
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
	
	ctx.putImageData(tmp, rect.x, rect.y);	
	return tmp;

}

function SSImgRemove(obj)
{
	// dulog(obj.parentNode.parentNode);
	obj.parentNode.parentNode.removeChild(obj.parentNode);
}

/**
 * 簡易呼び出し
 */
export function screenView(to, from, multi)
{
	from.nearestTo(to, multi == null ? CanvasScroll.scaleRate() : multi);
}

export function scrollByName(name)
{
	var scr = canvasScrollBundle == null ? layerScroll : canvasScrollBundle;
	return (scr[name] != null) ? scr[name] : null;
}

function getMainScroll()
{
	var a, scr = getScrolls(), res = [];
	for(a in scr){
		if(scr[a].mainFlag){
			return scr[a];
		}
	}
	return null;
}

export function getScrolls()
{
	var scr = canvasScrollBundle == null ? layerScroll : canvasScrollBundle;
	return scr;
	
}

export function drawCanvasStacks(max)
{
	let cnt = 0, k, scr = canvasScrollBundle == null ? layerScroll : canvasScrollBundle, complete = true
		, scroll
	;
	max = max == null ? props.SCROLL_MAX_SPRITES_DRAW * canvasScrollBundle.length : max
	;
	for(k in scr){
		scroll = scr[k];
		if(scroll.isVolatile()){
//			scr[k].clear(scr[k].defaultColor);
			//優先で矩形削除
			scroll.contextClear(0, 0, scroll.canvas.width, scroll.canvas.height, scroll.defaultColor);
			scroll.drawnInfoHistory = {};
		}
		complete &= scroll.drawDrawInfoStack();
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

export function createCanvas(w, h)
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
export function initContext(canvas, clear)
{
	var ctx
	;
	ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;//アンチ無効
//	ctx.webkitImageSmoothingEnabled = false;
//	ctx.mozImageSmoothingEnabled = false;
	ctx.oImageSmoothingEnabled = false;
	if(clear == null || clear){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
	// ctx.scale(-1, 1);
	// ctx.translate(-canvas.width, 0);
	return ctx;
}
function contextInit(canvas)
{
	return initContext(canvas);
}

//function resizeImage(){
//	
//}
//function trimImage(){
//	
//}

////////
////////
////////
/**
 * イメージリソース
 */
var imageResource = function(){return;};

imageResource.init = function(){
	this.data = {};
	this.dirpath =  "./images/spritechips/";
	this.extention =  ".png";
	this.isLoadNum = 0;//ロードする数
	this.loadcount = 0;//ロードした数
	this.separateWidth = {};
	this.separateHeight = {};
	this.workSpace = {};
	this.stack= [];
	this.ctx = {};
	this.loadRefreshTime = Date.now();
	
//	this.multi = window.VIEWMULTI == null ? 1 : window.VIEWMULTI;
	this.multi = 1;
};	
imageResource.init();
imageResource.onload = [];

imageResource.CHIPCELL_SIZE = props.CHIPCELL_SIZE;

//TODO リソース名をキーにしたパラメータを持つこと（現在パラメータキー）
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
	r.appendImage(img.name, img, null, null);
	
	//make workspace
	r.workSpace[img.name] = r.makeWorkSpace(img, r.separateWidth[img.name], r.separateHeight[img.name]);
	img = null
//	delete img;
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

/**
 * プリロード用
 */
imageResource.appendImage = function(name, img, sepWidth, sepHeight)
{
	var cv, ctx;
	this.separateWidth[name] = sepWidth == null ? this.separateWidth[name] : sepWidth;
	this.separateHeight[name] = sepHeight == null ? this.separateHeight[name] : sepHeight;

	if(img.src != null){
		cv = createCanvas(img.width, img.height);
		ctx = initContext(cv);
		ctx.drawImage(img, 0, 0);
	}else{
		cv = img;
		ctx = initContext(cv, false);
	}
	
	this.data[name] = cv;
	this.ctx[name] = ctx;
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

imageResource.makeSpriteRect = function(name, rect)
{
	var img = this.data[name]
		, spr = new CanvasSprite()
		;
	spr.init(name, rect.x, rect.y, rect.w, rect.h);
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
	var canvas = document.createElement('canvas'), ctx;
	canvas.width = w;
	canvas.height = h;
	ctx = initContext(canvas);
	return {canvas:canvas, ctx:ctx, data: img};
//	return {canvas:canvas, ctx:ctx, data: canvas};
};

// [name, cellsize_x, cellsize_y]
export const
loadImages = function(imageInfo, func)
{
	var R = imageResource, i, info;
	imageInfo = imageInfo.length != null ? imageInfo : [imageInfo];
	
	for(i = 0; i < imageInfo.length; i++){
		info = typeof imageInfo[i] != 'string' ? imageInfo[i] : [imageInfo[i], R.CHIPCELL_SIZE, R.CHIPCELL_SIZE];
		R.push(info[0], info[1], info[2]);
	}
	props.CKImageDir(props.IMAGE_DIR);
//	props.IMAGE_DIR = props.IMAGE_DIR.replace(/\/+$/, '') + '/';
	R.dirpath = props.IMAGE_DIR;
	R.onload.push(func == null ? R.onload : func);
	R.createStack();
}

/**
 * コールバック付き画像ロード
 * 追加で画像を読み込む場合
 */
, preLoadImage = function(name, sepWidth, sepHeight,  func)
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

, preLoadImages = function(imageInfo, func)
{
	var callback = function(){
		var t = new Image(), info, R = imageResource;
		if(imageInfo.length == 0){
			func();
			return;
		}
		info = imageInfo.shift();
		
		info = typeof info != 'string' ? info : [info, R.CHIPCELL_SIZE, R.CHIPCELL_SIZE];
//		info = typeof info == 'string' ? [info, R.CHIPCELL_SIZE, R.CHIPCELL_SIZE] : info;
		info[2] = info[2] == null ? info[1] : info[2];
		t.onload = function(){
			R.appendImage(this.name, this, this.sepWidth == null ? this.width | 0 : this.sepWidth, this.sepHeight == null ? this.height | 0 : this.sepHeight);
			callback();
		};
		t.src = R.dirpath + info[0] + R.extention + '?lrt=' + R.loadRefreshTime;
		t.name = info[0];
		t.sepWidth = info[1] == null ? null : info[1];
		t.sepHeight = info[2] == null ? null : info[2];
			
	}
	;
	
	//str > [str]
	//[str, str, str]
	//[str, x, y] > [[str, x, y]]
	//[[str, x, y], str, str]
	//[[str, xy], str, str]
	imageInfo = imageInfo instanceof Array ? imageInfo : [imageInfo];
	imageInfo = imageInfo[1] != null && isFinite(imageInfo[1]) ? [imageInfo] : imageInfo;
	callback();

}

, setImageLoadRefreshTime = function(time)
{
	imageResource.loadRefreshTime = time;
}

, setLoadImageDir = function(dir)
{
	var pre = imageResource.dirpath;
	imageResource.dirpath = dir;
	return pre;
}
// var preLoadImageTmp;

, makePoint = function(name, sprite, size)
{
	return imageResource.makePointSprite(name, sprite, size);
}
, makeSprite = function(name, sprite)
{
	return imageResource.makeSprite(name, sprite);
}
, makeSpriteRect = function(name, rect)
{
	return imageResource.makeSpriteRect(name, rect);
}
, resourceSizeByName = function(name)
{
	return {w: imageResource.data[name].width, h: imageResource.data[name].height};
}
, resourceByName = function(name)
{
	return imageResource.workSpace[name] != null ? imageResource.workSpace[name] : null;
}

, setResourceSeparate = function(name, w, h)
{
	imageResource.separateWidth[name] = w;
	imageResource.separateHeight[name] = h;
}

, getResourceChipSize = function(name)
{
	return {
		w: imageResource.separateWidth[name]
		, h: imageResource.separateHeight[name]
	};
}

, appendImageOnload = function(name, func)
{
	imageResource.onload.push(function(){
		func(imageResource.workSpace[name]);
	});
}

, appendImage = function(name, img, sepw, seph)
{
	imageResource.appendImage(name, img, sepw, seph);
}

, setResourceFromCanvas = function(canvasScroll, sepw, seph)
{
	var cv = canvasScroll, r = imageResource;
	r.appendImage(cv.name, cv.canvas, sepw, seph);
	r.workSpace[cv.name] = r.makeWorkSpace(cv.canvas, sepw, seph);
}

, resourceDraw = function(image, scr, x, y)
{
	var m = 1;
	image = (typeof image == 'string') ? resourceByName(name).data : image;
	scr.ctx.drawImage(image, 0, 0, 0 | image.width, 0 | image.height, 0 | x * m, 0 | y * m, 0 | image.width * m, 0 | image.height * m);
}
;

/**
 * @class SpriteQueryCanvas
 * sprite query用スクロールの管理
 */
export class SpriteQueryCanvas{
//SpriteQueryCanvas.prototype = {
	static init(){
		SpriteQueryCanvas.imageName = 'spriteQuery';
		SpriteQueryCanvas.tmpImageName = 'tmpSpriteQuery';
		var name = SpriteQueryCanvas.imageName
			, tname = SpriteQueryCanvas.tmpImageName
			, R = imageResource
			;
		this.scroll = makeScroll(name, false);
		appendImage(name, this.scroll.canvas, R.CHIPCELL_SIZE, R.CHIPCELL_SIZE);
		this.tmpScroll = makeScroll(tname, false);
		appendImage(tname, this.tmpScroll.canvas, R.CHIPCELL_SIZE, R.CHIPCELL_SIZE);
		//convertChunkで使います
		this.convertScroll = makeScroll(tname, false);
		appendImage(tname, this.convertScroll.canvas, R.CHIPCELL_SIZE, R.CHIPCELL_SIZE);

		this.queries = {};
		this.rects = {};
		this.rowRects = [];
		this.position = {x: 0, y: 0};
		this.nullRect = makeRect(0, 0, 0, 0);
	}
	static getBlankRect(rect){
		var scrRect = this.scroll.getRect()
		, rows = this.rowRects
		, rowRect, x, y
		, ex, ey = rows.length
		;
		for(y = 0; y < ey; y++){
			rowRect = rows[y][0];
			rowRect = rows[y].pop();
			rows[y].push(rowRect);
			ex = rows[y].length;
			rect.reculc(rowRect.ex, rowRect.y);
			if(rowRect.h != rect.h){
				continue;
			}

			if(scrRect.isContain(rect)){
				this.position.x = ex;
				this.position.y = y;
				return rect;
			}
		}
		if(rowRect != null){
			rect.reculc(0, rowRect.y + rowRect.h);
		}else{
			rect.reculc(0, rect.y);
		}
		this.position.x = 0;
		this.position.y = y;
		this.resizeScroll(scrRect.w, rect.y + rect.h);
		return rect;
	}

	static resizeScroll(w, h){
		var s = this.scroll
			, t = this.tmpScroll
		;
		if(s.canvas.width == w && s.canvas.height == h){
			return;
		}
	//	if(s.canvas.width > t.canvas.width || s.canvas.height > t.canvas.height){
	//		t.resizeCanvas(s.canvas.width, s.canvas.height);
	//	}
		s.drawto(t);
		s.resizeCanvas(w, h);
		t.drawto(s);
		t.resizeCanvas(w, h);
	}

	static registQuery(name, rect)
	{
		this.rects[name] = rect;
		this.queries[rect.toString()] = name;
	}

	static registRowRect(x, y, size)
	{
		var s = this.rowRects
		;
		s[y] = s[y] != null ? s[y] : s[y] = [];
		s[y][x] = size;
	}

	static makeSpriteFromScroll(scroll){
		var rect, find = this.rects[scroll.name] != null
		;
		rect = find ? this.rects[scroll.name] : this.getBlankRect(scroll.getRect());

		scroll.drawto(this.scroll, rect.x, rect.y, rect.w, rect.h);

		if(!find){
			this.registQuery(scroll.name, rect);
			this.registRowRect(this.position.x, this.position.y, rect);
		}

		return makeSpriteRect(SpriteQueryCanvas.imageName, rect);
	}

	static copySprite(sprite, indexkey){
		var rect, name = this.convertSpriteName(sprite, indexkey == null ? '' : indexkey)
		;
		if(indexkey != null && (name in this.rects)){
			return makeSpriteRect(SpriteQueryCanvas.imageName, this.rects[name]);
		}
		//新しい領域を探す
		rect = this.getBlankRect(sprite.getRect());
		//領域に描画
		this.scroll.drawSpriteInfo(sprite.makeSpriteInfo(rect.x, rect.y));

		//領域を登録
		this.registQuery(name, rect);
		this.registRowRect(this.position.x, this.position.y, rect);

		//領域からスプライトを作成
		return makeSpriteRect(SpriteQueryCanvas.imageName, rect);
	}

	static exists(sprite, indexkey){
		var name = this.convertSpriteName(sprite, indexkey == null ? '' : indexkey)	
		;
		if(name in this.rects){
			return this.rects[name];
		}
		return false;
	}

	static convertSpriteName(sprite, key){
		return sprite.name + '[' + sprite.getRect().toString() + ']' + key;
	}

}


function getSQCSprite(name){
	var c = SpriteQueryCanvas
		, rect
	;
	if(c.rects[name] == null){
		return false;
	}
	return makespriteRect(c.imageName, c.rects[name]);
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
		
		//TODO makeSpriteQueryではconvertしたくない
		return c;
//		return convertChunk(c, '');
	}catch(e){
		console.warn(name + ": error makeSpriteChunk");
		console.warn(sprect);
	}
}

function makeSpriteImage(name)
{
	var img = imageResource, d = img.data[name]
		, cw = d.width / img.separateWidth[name] | 0
		, ch = d.height / img.separateWidth[name] | 0
		;
	return convertChunk(makeSpriteChunk(name, makeRect(0, 0, cw, ch)), SPQ_ALL);
		
};

/**
 * spriteからcanvasを生成
 */
function makeSpriteInCanvas(canvas, x, y, w, h)
{
	var s = new CanvasSprite();
	s.initInCanvas(canvas, x, y, w, h);
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
		, sqCanvas = SpriteQueryCanvas
	;
	query = query == null ? '' : query;
	clen = spriteChunk.length;
	slen = spriteChunk[0].length;
	sprite = spriteChunk[0][0];
	h = clen;
	w = slen;
	isReplaceQuery = query.indexOf(SPQ_REP) >= 0;
	
//	sname = 'sprc-' + CONVERT_COUNT + '['+ sprite.name + ',' + w + ':' + h + ',' + sprite.x + ':' + sprite.y+ ']';
	sname = 'sprc' + '['+ sprite.name + ',' + w + ':' + h + ',' + sprite.x + ':' + sprite.y+ ']';
//	console.log(query);
	//sprite draw New Scroll
	//スクロールサイズを算出
	y = 0;
	for(j = 0; j < clen; j++){
		chunk = spriteChunk[j];
		slen = chunk.length;
		x = 0;
		for(i = 0; i < slen; i++){
			sprite = chunk[i];
			if(sprite == null){
				continue;
			}
			x += sprite.w;
		}
		y += sprite.h;
	}
	sname = sprite.name + '['+ query + ']';
	scroll = SpriteQueryCanvas.convertScroll;
	scroll.resizeCanvas(x, y);
	scroll.name = sname;
	
	//スプライト貼付け
	y = 0;
	for(j = 0; j < clen; j++){
		chunk = spriteChunk[j];
		slen = chunk.length;
		x = 0;
		for(i = 0; i < slen; i++){
			sprite = chunk[i];
			if(sprite == null){
				continue;
			}
			scroll.drawSpriteInfo(sprite.makeSpriteInfo(x, y));
			x += sprite.w;
		}
		y += sprite.h;
	}

	CONVERT_COUNT++;
	maked = sqCanvas.makeSpriteFromScroll(scroll);
	
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
//	y = 0;
//	for(j = 0; j < clen; j++){
//		chunk = spriteChunk[j];
//		slen = chunk.length;
//		x = 0;
//		for(i = 0; i < slen; i++){
//			sprite = chunk[i];
//			if(sprite == null){
//				continue;
//			}
//		}
//		y += h;
//	}
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
	recursive(spriteChunk.chunkMap, 0, 0);
	
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
		, dir = dstrToDirection(blockQuery)
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
			if(dir.rot == 1 || dir.rot == 3){
				rect = makeRect(rect[0], rect[2], rect[3] * hmul, rect[1] * vmul);
			}else{
				rect = makeRect(rect[0], rect[2], rect[1] * hmul, rect[3] * vmul);
			}
		}else if(make[3] != null){
			rect = make[3].replace(':','-').split('-');
			if(dir.rot == 1 || dir.rot == 3){
				rect = makeRect(rect[0], rect[2], (rect[1] - rect[0] + 1) * hmul, (rect[3] - rect[2] + 1) * vmul);
			}else{
				rect = makeRect(rect[0], rect[2], (rect[1] - rect[0] + 1) * hmul, (rect[3] - rect[2] + 1) * vmul);
			}
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
var SPQREG_BOTTOMLINE = /\!/;
var SPQREG_CHROW = /\?[0-9]+$/;
var SPQREG_FLIPALL = /\[|fh]+', 'g/;
var SPQREG_RECTC = /^[0-9]+\+[0-9]+:[0-9]+\+[0-9]+/;
var SPQREG_RECTR = /^[0-9]+\-[0-9]+:[0-9]+\-[0-9]+/;
var SPQREG_MAKE = new RegExp(''
	+ '(^[0-9]+$)'
	+ '|(^[0-9]+\\+[0-9]+:[0-9]+\\+[0-9]+$)'
	+ '|(^[0-9]+\\-[0-9]+:[0-9]+\\-[0-9]+$)'
	+ '|(^[0-9$]+$)'
	+ '|(^[0-9@]+$)'
	);
	
var SPQREG_FLIP = /\|[fhv|]{2,}/;
var SPQREG_VFLIP = /\|f[hv]?v/;
var SPQREG_HFLIP = /\|f[hv]?h/;
var SPQREG_ROT = /\|r([0-3])/;
var SPQREG_HMULTI = /\*([0-9]+)/;
var SPQREG_VMULTI = /\^([0-9]+)/;
var SPQREG_PAT = /\([^()]*\)/g;
//var SPQREG_INPAT = new RegExp('\\([^)]*\\(.*\\)[^(]*\\)', 'g');
//var SPQREG_INPAT = /\([^)]*\(.*\)[^(]*\)/g;

//var SPQREG_INPAT = /\(((?!\().*?)\)/g;
var SPQREG_INPAT = /\(((?!\().)*?\)/;
var SPQSUBREG_PAT = /^\((.*)\)$/;

var SPQ_RCOUNT = 0;

/**
 * クエリからスプライト(結合)を生成 
 * @name makeSpriteQuery
 * @param {string} name
 * @param {string} spq
 * @param {array} nstpat
 */
export function makeSpriteQuery(name, spq, nstpat)
{
	var nstMatch, sprite = [], chunkMap = [], rect
	, spstr, i, j, rw, rh, ofy, chunkMapOfy, s, sst, ilen, jlen, mk, mt, prerect, sprstr
	, sourceq = spq, dir, baseMatch = ''
	, SPQ_MESSAGE = [], image, cvs

	, rectFillSub = function(chunk, query, rect){
		var x, y, r = rect.convertArray(SPQ_EMPTY)
		;
		query = query.push == null ? [query] : query;
		query = query[0].push == null ? [query] : query;
		for(y = 0; y < query.length; y++){
			for(x = 0; x < query[y].length; x++){
				r[y][x] = query[y][x];
			}
		}
		chunk = concatSprite(chunk, r, rect.y);
		return chunk;
	}
	, rectFillMulti = function(chunk, w, h){
		return repeatSprite(chunk, w, h);
	}
	;
	if(getImage(SpriteQueryCanvas.imageName) == false){
		SpriteQueryCanvas.init();
	}
	image = getImage(name + '[' + spq + ']');
	if(image != false){
//		return makeSprite(name + '[' + spq + ']', 0);
	}
	
	SPQ_RCOUNT = SPQ_RCOUNT < 0 ? 0 : SPQ_RCOUNT;
	SPQ_RCOUNT++;
	if(	SPQ_RCOUNT > 200){
		SPQ_RCOUNT--;
		return;
	}
	
	if(spq == SPQ_ALL){
		SPQ_RCOUNT = 0;
		return makeSpriteImage(name);
	}
	try{
		//Nest Groups
		do{
			nstpat = nstpat == null ? [] : nstpat;
//			spq = spq.replace(/^\((.*)\)$/, '$1');
			nstMatch = spq.match(SPQREG_INPAT);
			if(nstMatch == null){
				break;
			}
			if(spq.match(/[0-9]/) == null){
				spq = spq.replace(/[\(\)]/g, '');
				break;
			}

			// $の数だけ取り出す
			mt = [];
			j = nstMatch[0].split(SPQ_REP).length - 1;
			if(j > 0){
				mt = nstpat.splice(-j);
			}
			// nstpatは再起関数内で
			mk = makeSpriteQuery(name, nstMatch[0].replace(SPQSUBREG_PAT, '$1'), mt);
			if(mt != null && nstMatch[0].indexOf(SPQ_REP) < 0){
//				nstpat.push(mt);
			}
			nstpat.push(mk);
			spq = spq.replace(SPQREG_INPAT, SPQ_REP);
		}while(spq);

		spstr = spq.split(SPQ_NEWLINE);

		ilen = spstr.length;
		ofy = 0;
		chunkMapOfy = 0;
		for(i = 0; i < ilen; i++){
			sst = spstr[i];
			s = sst.split(SPQ_DELIMITER);
			jlen = s.length;
			for(j = 0; j < jlen; j++){
				sprstr = s[j].replace(SPQREG_HMULTI, '').replace(SPQREG_VMULTI, '').replace(SPQREG_BOTTOMLINE, '');

				mt = sprstr.split(SPQ_CONNECT)[0].match(SPQREG_MAKE);
				SPQ_MESSAGE.push('CQuery:' + s[j]);
				//rectsight
				if(mt == null){
					continue;
				}else if(mt[2] != null){
					//.e.g "xx+ww:yy+hh"
					baseMatch = mt[2];
					prerect = baseMatch.replace(':','+').split('+').map(function(r){return r | 0;});
					mk = makeSpriteChunk(name, makeRect(prerect[0], prerect[2], prerect[1], prerect[3]));
					SPQ_MESSAGE.push('type:+');
				}else if(mt[3] != null){
					//.e.g "xx-ccx:yy-ccy"
					baseMatch = mt[3];
					prerect = baseMatch.replace(':', '-').split('-').map(function(r){return r | 0;});
					mk = makeSpriteChunk(name, makeRect(prerect[0], prerect[2], prerect[1] - prerect[0] + 1, prerect[3] - prerect[2] + 1));
					SPQ_MESSAGE.push('type:-');
					// console.log(mk, prerect);
				}else if(mt[4] != null){
					baseMatch = mt[4];
					mk = nstpat.shift();
					SPQ_MESSAGE.push('type:$');
					// console.log(mt[4], s[j])
				}else if(mt[5] != null){
					baseMatch = mt[5];
					mk = nstpat.shift();
					// console.log(mt[4], s[j])
				}else if(mt[1] != null){
					//.e.g "id"
					baseMatch = mt[1];
					mk = makeSprite(name, mt[1]);
					SPQ_MESSAGE.push('type:id');
					// console.log(mt[1], mk);
				}
				
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
				// 
// console.log(mt);
				//repeat
				mt = s[j].match(SPQREG_HMULTI);
				rw = mt == null ? 1 : mt[1] | 0;
				
				mt = s[j].match(SPQREG_VMULTI);
				rh = mt == null ? 1 : mt[1] | 0;
				
				SPQ_MESSAGE.push('Repeat:' + rw + ':' + rh);
				mk = repeatSprite(mk, rw, rh);

				if(s[j].indexOf(SPQ_REP) >= 0 || s[j].indexOf(SPQ_NSTREP) >= 0){
					//*^MULTIは考慮されてない
					sprstr = s[j].replace(SPQ_REP, mk[0][0].chunkMap[0][0]).replace(SPQ_FORCE, '');
					rect = makeRect(0, chunkMapOfy + i, mk[0][0].chunkMap[0].length * rw, mk[0][0].chunkMap.length * rh);
					mk[0][0].chunkMap = rectFillMulti(mk[0][0].chunkMap, rw, rh);
					SPQ_MESSAGE.push('RectFill($):' + rect.toString());
					rectFillSub(chunkMap, mk[0][0].chunkMap, rect);
				}else{
					//*^MULTIは考慮されている
					rect = queryToRect(s[j].replace(SPQ_FORCE, ''));
//					rect = queryToRect(sprstr.replace(SPQ_FORCE, ''));
					rect.x = 0;
					rect.y = chunkMapOfy + i;
					SPQ_MESSAGE.push('RectFill:' + rect.toString());
					rectFillSub(chunkMap, s[j].replace(SPQ_FORCE, ''), rect);
				}
				
				SPQ_MESSAGE.push('Concat:' + (ofy + i));
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
		console.log(mk, sprite, SPQ_MESSAGE.join(' '));
		SPQ_RCOUNT = -1;
		SPQ_MESSAGE = [];
		return null;
	}
	SPQ_RCOUNT--;
	if(SPQ_RCOUNT == 0){
		sprite = convertChunk(sprite, sourceq);
		sprite.chunkMap = chunkMap;
		SPQ_MESSAGE = [];
		SPQ_RCOUNT = -1;
	}else{
		sprite[0][0].chunkMap = chunkMap;
	}
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

export function makeSpriteSwapColor(sprite, to, from, type)
{
	var sqc = SpriteQueryCanvas
		, resSprites, key, q
		;
	
	if(sprite instanceof Array){
		resSprites = [];
		sprite.forEach(function(s, i){
			resSprites.push(makeSpriteSwapColor(s, to, from, type));
		});
		return resSprites;
	}else if(sprite instanceof CanvasSprite === false && sprite instanceof Object){
		resSprites = {};
		for(key in sprite){
			resSprites[key] = makeSpriteSwapColor(sprite[key], to, from, type);
		}
		return resSprites;
	}
//	sprite.name = resourceColorQuery();
	q = swapColorQuery([to, from]);
	if(sqc.exists(sprite, q)){
		return sqc.copySprite(sprite, q);
	}
	sprite = sqc.copySprite(sprite, q);

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
}
//
//function makeSwapColor(toColors, fromColors){
//	
//}


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
//		TODO 利用中のものを確認　if(reset != null && reset){
		if(reset == null || reset){
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

function getImage(imageName)
{
	return imageResource.data[imageName] != null ? imageResource.data[imageName] : false;
}

/**
 * @param {colorArray} swaps - カラー配列
 * @return {stirng} - カラー文字列
 * カラースワップアクセス用連想キー取得
 */
function swapColorQuery(swaps)
{
	return JSON.stringify(swaps);
}
////////
////////
////////

export class CanvasSprite{

	// init: function(img, x, y, w, h)
/**
 * キャンバススプライト
 * @param name 取り込んだ画像の名前
 * @param x imageのX座標
 * @param y imageのY座標
 * @param w spriteの幅
 * @param h spriteの高さ
 * @returns
 */
	init(name, x, y, w, h)
	{
		this.image = imageResource.data[name];
		this.ctx = imageResource.ctx[name];
		this.workSpace = imageResource.workSpace[name];
		this.initCommon(name, x, y, w, h);
	}
	
	initInCanvas(canvas, x, y, w, h)
	{
		var name = canvas.name != null ? canvas.name :  'incanvas_' + Object.keys(imageResource.data).length;
		this.image = canvas;
		this.ctx = initContext(canvas);
//		this.ctx = canvas.getContext('2d');
		// this.workSpace = imageResource.makeWorkSpace(this.image, sprite.w, sprite.h);
		imageResource.appendImage(name, this.image, w, h);
		this.workSpace = {canvas: this.image, ctx: this.ctx, data: this.image};
		this.initCommon(name, x, y, w, h);
	}
	
//	initInImage(image, x, y, w, h, dx, dy, dw, dh, func)
//	{
//		var name = image.name != null ? image.name : image.src;
//		this.image = image;
//		this.ctx = this.image.getContext('2d');
//		imageResource.appendImage(name, this.image, w, h);
//		this.workSpace = {canvas: createCanvas(image.width, image.height), ctx: this.ctx, data: this.image};
//		this.initCommon(name, x, y, w, h);
//	}
	
	// TODO 使用しなくなるかも
	copySprite(sprite)
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
	}
	
	initCommon(canvas, x, y, w, h)
	{
		this.x = x; this.y = y;
		this.w = w; this.h = h;
//		this.bfsx = 0; this.bfsy = 0;
		this.bufferOriginal = null;
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
		this.chunkIds = null; //CurrentSpriteId
		this.primary = true; //draw reliably even overdraw
		this.order = props.SPRITE_ORDER_DEFAULT; // display order [first << late]
	}
	
	drawScroll(scroll, x, y)
	{
		scroll.drawSprite(this, 0 | x, 0 | y);
	}

	makeRect(x, y)
	{
//		var rects = new Rect();
//		rects.init(x, y, this.w, this.h);
		return makeRect(x, y, this.w, this.h);
	}
	
	makeSpriteInfo(x, y)
	{
		return {sprite: this, x: x, y: y, vflip: this.vFlipFlag, hflip: this.hFlipFlag, rot: this.rotFlag, order: this.order};
	}

	getRect()
	{
//		var rects = new Rect();
//		rects.init(this.x, this.y, this.w, this.h);
//		return rects;
		return makeRect(this.x, this.y, this.w, this.h);
	}

	vflip(toggle)
	{
		this.vFlipFlag = toggle == null ? !this.vFlipFlag : toggle;
		return this;
	}
	
	hflip(toggle)
	{
		this.hFlipFlag = toggle == null ? !this.hFlipFlag : toggle;
		
		return this;
	}
	
	flip()
	{
		var h = (-sprite.hFlipFlag + !sprite.hFlipFlag) | 0, v = (-sprite.hFlipFlag + !sprite.hFlipFlag) | 0;
		this.ctx.translate(this.x, 0);
		this.ctx.scale(-1, 1);
		this.ctx.drawImage(this.image, this.x, 0);
	}
	
	//回転非対応
	rot(trbl)
	{
		var pr = this.rotFlag, ph;
		this.rotFlag = trbl == null ? (trbl + 1) % 4 : trbl;

		if(this.rotFlag != pr && (this.rotFlag - pr + 4) % 2 == 1){
			//描画の直前はモトに戻す
			ph = this.h;
			this.h = this.w;
			this.w = ph;
		}
		
		return this;
	}

	/**
	 * スクロール側で実行
	 * カラーを変更を実行する
	 */
	swapStart()
	{
		var tmp, data, bgdata, index = 0
			, from , to, pixels = this.w * this.h, p, slen, i, swaps = this.swaps, swap
			, index1 = 0, index2 = 1, index3 = 2, index4 = 3
			, query = swapColorQuery(this.name, swaps)
//			, image = getImage(query)
//			, getSprite = getSQCSprite(query)
			, ctx
		;
		if(swaps == null){
			swaps = [];
		}
		
//		if(getSprite != false){
//			return getSprite;
//		}
		
		return swapColorImageData(this.ctx, swaps, this.getRect());
		
	}
	/**
	 * 色を交換
	 * ※連続的に変更する場合は
	 * swapColorReset
	 * も合わせて使うこと
	 */
	swapColor(to, from)
	{
		if(this.swaps == null){this.swaps = [];}
		
		this.swaps.push([from, to]);
		return this;
	}

	setSwapColor(to, from)
	{
		var self = this;
		this.swaps = [];
		//to from 両方同じ要素数であること
		to = to.colors != null ? to.colors : to;
		from = from.colors != null ? from.colors : from;
		if(to[0] != null && to[0].length != null){
			to.map(function(a, i){
				self.swapColor(a, from[i]);
			});
		}
		this.swaps.push([from, to]);
		this.swapStart();
		return this;
	}
	pushSwapColor(to, from)
	{
		if(this.swaps == null){this.swaps = [];}
		if(this.isSwapColor(to, from)){
			return this;
		};
		this.swaps.push([from, to]);
		return this;
	}
	
	isSwapColor(to, from)
	{
		var i, fromto = from.join(',') + ':' + to.join(',');
		if(this.swaps == null){this.swaps = [];}
		for(i = 0; i < this.swaps.length; i++){
			if(this.swaps[i][0].join(',') + ':' + this.swaps[i][1].join(',') == fromto){
				return true;
			}
		}
		return false;
	}
	
	getBufferOriginal(){
		if(this.bufferOriginal == null){
			this.bufferOriginal = this.ctx.getImageData(this.x, this.y, this.w, this.h);
		}
		return this.bufferOriginal;
	}
	
	resetShiftBuffer(){
//		this.bfsx = x;
//		this.bfsy = y;
		if(this.bufferOriginal != null){
			this.ctx.putImageData(this.bufferOriginal, this.x, this.y);
		}
	}
	
	//TODO 未使用？
	shiftBufferRotate(x, y, append1, append2, append3){
		var dat1, dat2, dat3, dat4
			, sx = this.x
			, sy = this.y
			, w = this.w
			, h = this.h
			, slicew = w, sliceh = h
			, norotate = false
		;
		dat1 = this.getBufferOriginal();
		dat3 = null;
		dat2 = null;
		dat4 = null;
		
		if(append1 instanceof CanvasSprite){
			dat2 = append1.getBufferOriginal();
			dat4 = dat2;
		}
		if(append2 instanceof CanvasSprite){
			dat3 = append2.getBufferOriginal();
		}
		if(append3 instanceof CanvasSprite){
			dat4 = append3.getBufferOriginal();
		}
		
		if(x != null && x != 0){
			x = (((x % w) + w) % w) | 0;
			slicew = w - x;
		}else{
			x = 0;
		}
		if(y != null && y != 0){
			y = (((y % h) + h) % h) | 0;
			sliceh = h - y;
		}else{
			y = 0;
		}
		if(x != null && x != 0){
			if(dat2 != null){
				this.ctx.putImageData(dat2, sx - slicew, sy + y, slicew, 0, x, sliceh);
			}else{
				this.ctx.fillStyle = makeRGBA(append1);
				this.ctx.fillRect(sx - slicew + w, sy + y + h, x, sliceh);
			}
			this.ctx.putImageData(dat1, sx + x, sy + y, 0, 0, slicew, sliceh);
		}
		
		if(y != null && y != 0){
			if(dat4 != null){
				this.ctx.putImageData(dat4, sx - slicew, sy - sliceh, slicew, sliceh, x, y);
			}else{
				this.ctx.fillStyle = makeRGBA(append1);
				this.ctx.fillRect(sx - slicew + w, sy - sliceh + h, slicew, sliceh);
			}
			this.ctx.putImageData(dat3, sx + x, sy - sliceh, 0, sliceh, slicew, y);
		}
		return this;
		
	}
	/**
	 * @name shiftBuffer
	 * @param {unsigned Number} x
	 * @param {unsigned Number} y
	 * @param {Sprite}{ColorArray} append1
	 * @returns {this}
	 * @description スプライト情報の上書き
	 */
	shiftBuffer(x, y, append1, append2, append3){
		var dat4, dat2, dat3, dat1
			, w = this.w
			, h = this.h
			, col = COLOR_BLACK
		;
		dat1 = this.getBufferOriginal();
		dat3 = col;
		dat2 = col;
		dat4 = col;
		
		if(append1 instanceof CanvasSprite){
			dat2 = append1.getBufferOriginal();
			dat3 = dat2;
			dat4 = dat1;
		}else{
			//色指定
			dat2 = append1 == null ? makeRGBA(COLOR_BLACK) : makeRGBA(append1);
			dat3 = dat2;
			dat4 = dat1;
		}
		if(append2 instanceof CanvasSprite){
			dat3 = append2.getBufferOriginal();
			dat4 = dat2;
		}
		if(append3 instanceof CanvasSprite){
			dat4 = append3.getBufferOriginal();
		}
		//testclear
//		this.ctx.fillStyle = makeRGBA(col);
//		this.ctx.fillRect(sx, sy, 96, 32);
		x = Math.round(x);
		y = Math.round(y);
		this.shiftBufferSub(x, y, dat1);
		this.shiftBufferSub(x + this.w, y, dat2);
		this.shiftBufferSub(x, y + this.h, dat3);
		this.shiftBufferSub(x + this.w, y + this.h, dat4);
		return this;
	}
	shiftBufferSub(x, y, dat){
		var
			 sx = this.x
			, sy = this.y
			, w = this.w
			, h = this.h
			, slicewR = w, slicehB = h
			, slicewL = 0, slicehT = 0
//			, col = COLOR_BLACK
		;
		if(x != null && x != 0){
			if(x <= -w){
				x =  ((x - w) % (w + w)) + w;
			}else if(x >= w){
				x =  ((x + w) % (w + w)) - w;
			}
			slicewR = x > 0 ? w - (x % w) : w + (x % w);
			slicewL = w - slicewR;
		}else{
			x = 0;
		}
		//y = -32
		if(y != null && y != 0){
			if(y <= -h){
				y =  ((y - h) % (h + h)) + h;
			}else if(y >= h){
				y =  ((y + h) % (h + h)) - h;
			}
			slicehT = y > 0 ? (y % h) : -(y % h);
			slicehB = h - slicehT;
		}else{
			y = 0;
		}
//		if(y == -h || x == -w){
		if(y >= h || y <= -h || x >= w || x <= -w){
			return;
		}
		if(dat instanceof ImageData){
			this.ctx.putImageData(dat, sx + x, sy + y,  x > 0 ? 0 : slicewL, y > 0 ? 0 : slicehT, slicewR, slicehB);
		}else{
			x = x < 0 ? 0 : x;
			y = y < 0 ? 0 : y;
			this.ctx.fillStyle = dat;
			this.ctx.fillRect(sx + x, sy + y, slicewR, slicehB);
		}

	}
	
	show(){
		this.x = this.x < 0 ? - this.x - this.w : this.x;
	}

	hide(){
		this.x = this.x >= 0 ? - this.x - this.w : this.x;
	}

	/**
	 * 色交換をリセット
	 */
	resetSwapColor()
	{
		this.swaps = null;
	}

};

export class canvasPalette{
	init(colors, name){
		this.size = colors.length;
		this.colors = typeof colors[0].length == null ? [colors] : colors;
//		this.brightLevel = level == null ? 0 : level;
		this.name = name == null ? colors.map(function(a){return '[' + a.join(',') + ']';}).join(':') : name;
	}
	
	color(id){
		return this.colors[id] == null ? COLOR_BLACK : this.colors[id];
	}
}
export const
makeCanvasPalette = function(color, name){
	var a = new canvasPalette();
	a.init(color, name);
	
	return a;
}

//サイズ変換
, cellto = function(cell, size, side)
{
	let R = imageResource
		, C = CanvasScroll
	;
	if(size == null){
		size = R.CHIPCELL_SIZE;
	}
	
	if(side != null && side == "bottom"){
		return C.DISPLAY_HEIGHT - (cell * size);
	}else if(side != null && side == "right"){
		return C.DISPLAY_WIDTH - (cell * size);
	}
	return cell * size;
}
, cellhto = function(cellh, side)
{
	let R = imageResource
		, C = CanvasScroll
	;
	if(side != null && side == "bottom"){
		return C.DISPLAY_HEIGHT - (cellh * R.CHIPCELL_SIZE);
	}else if(side != null && side == "right"){
		return C.DISPLAY_WIDTH - (cellh * R.CHIPCELL_SIZE);
	}
	return cellh * R.CHIPCELL_SIZE;
}

, tocellh = function(px)
{
	return (px / imageResource.CHIPCELL_SIZE) | 0;
}

/**
 * セルサイズで割り切れる値 
 */
, parseCell = function(px, size)
{
	size = size == null ? imageResource.CHIPCELL_SIZE : size;
	px |= 0;
	return px - (px % size);
	
}

, getScrollNum = function()
{
	return layerScroll.length;
}

, rectFromSprite = function(sprite, x, y)
{
	if(typeof sprite != "object"){
		return sprite.makeRect(x, y);
	}else if(typeof sprite[0] != "object"){
		sprite = [sprite];
	}
//	var rects = new Rect(), i, j, w, h;
//	rects.init(0,0,0,0);
	var rects = makeRect(0, 0, 0, 0), i, j, w, h;
	for(j = 0; j < sprite.length; j++){
		for(i = 0; i < sprite[0].length; i++){
			w = sprite[j][i].w;
			h = sprite[j][i].h;
			rects.append(sprite[j][i].makeRect(x + (i * w),y + (j * h)));
		}
	}
	return rects;
}

, makeRGB = function(color)
{
	var csv = color.slice(0, 3).join(", ");
	return 'rgb(' + csv + ')';
}
, makeRGBA = function(color)
{
	var csv = color.join(", ");
	return 'rgba(' + csv + ')';
}
, makeColorArray = function(str)
{
	var a = str.slice(1).split(/([0-9a-fA-F]{2})/).filter(Boolean).concat("255");
	return a.map(function(b){
		return parseInt(b, 16);
	});
}

/**
 * スクリーンサイズ変更（環境設定）
 * @param {type} scaleRate
 * @returns {screenScale}
 * @description PointingControll resizeRateも必要に応じて実行
 */
, screenScale = function(scaleRate){
	if(scaleRate != null){
		var s;
//		CanvasScroll.SCALE_RATE = scaleRate;
		CanvasScroll.scaleRate(scaleRate);
		s = getDisplaySize();
		scrollByName(props.UI_SCREEN_ID).resizeCanvas(s.w | 0, s.h | 0);
		scrollByName(props.UI_SCREEN_ID).ctx.imageSmoothingEnabled = false;//アンチ無効
	}
	return CanvasScroll.scaleRate();
}
;
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
export class dividePattern{
	constructor(pattern, division){
		this.count = 0;
		this.pattern = pattern;
		this.division = division;
		this.max = this.pattern * this.division;
	}
	init(division, pattern)
	{
		this.count = 0;
		this.pattern = pattern;
		this.division = division;
	}
	now()
	{
		var d = ((this.count / this.division) | 0) % this.pattern;
		return d;
	}
	
	next()
	{
		this.count = (this.count + 1) % (this.max);
	}
}


/**
 * 3点からなる2次曲線をの位置を求める
 * @param {Object} t->x
 * @param {Object} pos->y
 */
export function quadrateCurve(t, pos)
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
	}
	// toggleScript()
	return res;

}
