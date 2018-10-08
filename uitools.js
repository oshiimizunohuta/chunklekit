/**
 * @name InterFaceTools Library
 * @since 2013-11-19 07:43:37
 * @author bitchunk
 * @version 0.1.1
 */

import {makeSpriteQuery, makeSpriteSwapColor, cellhto, makeCanvasScroll, getScrolls, loadImages} from './canvasdraw.js';
import {makeRect, makePosition} from './util.js';
export class CUCursor{
	construcror(){
		
	}
	init(){
		this.pos = {x: 0, y: 0, z: 0};
		this.pos_pre = {x: 0, y:0, z: 0};
		this.cells = {x: 0, y: 0, z: 0};
		this.looped_pre = {x: 0, y: 0, z: 0};
		this.looped = {x: 0, y: 0, z: 0};
		this.outside = {x: 0, y: 0, z: 0};
		this.disablePos = [];
		this.cellReturn = true;
		this.name = 'cursor';
		this.index = 0;
		this.ranged = {x: 0, y: 0, z: 0};
		this.offsetted = {x: 0, y: 0, z: 0};
		this.rangeovered = {x: 0, y: 0, z: 0}; //未使用？
	}
	
	copy(name){
		var c = makeCursor(name == null ? this.name : name, this.cells.x, this.cells.y, this.cells.z);
		c.moveTo(this.pos.x, this.pos.y, this.pos.z);
		return c;
	}
	
	resize(x, y, z){
		this.cells.x = x;
		this.cells.y = y;
		this.cells.z = z;
	}
	
	right(num)
	{
		num = num == null ? 1 : num;
		this.move(num, 0, 0);
		return this;
	}
	left(num)
	{
		num = num == null ? 1 : num;
		this.move(-num, 0, 0);
		return this;
	}
	up(num)
	{
		num = num == null ? 1 : num;
		this.move(0, -num, 0);
		return this;
	}
	down(num)
	{
		num = num == null ? 1 : num;
		this.move(0, num, 0);
		return this;
	}
	front(num)
	{
		num = num == null ? 1 : num;
		this.move(0, 0, num);
		return this;
	}
	back(num)
	{
		num = num == null ? 1 : num;
		this.move(0, 0, -num);
		return this;
	}
	
	disable(x, y, z){
		var pos = this.disablePos;
		if(this.isEnable(x, y, z)){
			return;
		}
		pos.push(this.makePositionStr(x, y, z).join(' '));
	}
	
	enable(x, y, z){
		var pos = this.disablePos, i, str = this.makePositionStr(x, y, z);;
		for(i = 0; i < pos.length; i++){
			if(pos[i] == str){
				pos.splice(i, 1);
			}
		}
	}
	
	range(x, y, z){
		x = x == null ? 1 : x;
		y = y == null ? 1 : y;
		z = z == null ? 1 : z;
		
		this.ranged = {x: x, y: y, z: z};
	}
	
	isEnable(x, y, z){
		var pos = this.disablePos, i, str = this.makePositionStr(x, y, z);
		for(i = 0; i < pos.length; i++){
			if(pos[i] == str){
				return false;
			}
		}
		return true; 
	}
	
	updateIndex(){
		var pos = this.pos, cells = this.cells;
		this.index = pos.x + (pos.y * cells.x) + (pos.z * cells.x * cells.y);
		return this.index;
	}
	
	positionByIndex(index){
		var cells = this.cells 
			, pos = {}
			, p
		;
		if(index < 0){
			p = cells.x * cells.y * cells.z;
			index = p - 1 + (index % p);
		}
		pos.x = index % cells.x;
		pos.z = ((index / (cells.x * cells.y)) | 0) % cells.z;
		pos.y = ((index / cells.x) | 0) % cells.y;
		
		return pos; 
	}
	
	valueOf(valueArray){
		var i = this.updateIndex()
			, vala = []
			, func = function(a){
				if(a instanceof Array){
					a.forEach(func);
					return;
				}
				vala.push(a);
				return;
			}
		;
		
		if(!(valueArray instanceof Array)){
			return null;
		}
		valueArray.forEach(func);
		
		return vala[i];
	}
	
	makePositionStr(x, y, z){
		var a = [];
		if(x != null){
			a.push(x);
		}
		if(y != null){
			a.push(y);
		}
		if(z != null){
			a.push(z);
		}
		return a.join(' ');
	}
	
	//他のカーソル切替時、isLoopedと組み合わせる
	out()
	{
//		this.pos[axis] = this.cells[axis];
		this.outside = {x: this.looped.x, y: this.looped.y, z: this.looped.z}
		return this.outside;
	}
	in(outside)
	{
		var cells = this.cells, a, pos = this.pos;
		for(a in pos){
			if(outside[a] > 0){
				pos[a] = 0;
			}else if(outside[a] < 0){
				pos[a] = cells[a] - 1;
			}
		}
	}
	
	undo(){
		var pos = this.pos, pre = this.pos_pre
			, a, prepre
			, loop = this.looped, loopre = this.looped_pre
		;
		for(a in pos){
			prepre = pre[a];
			pos[a] = pre[a];
			pre[a] = prepre;
			prepre = loop[a];
			loop[a] = loopre[a];
			loopre[a] = prepre;
		}
		return this;
	}

	move(x, y, z)
	{
		var pos = this.pos, pre = this.pos_pre, cells = this.cells
		, loop = this.looped, loopre = this.looped_pre, isReturn = this.cellReturn
//		, keys = Object.keys(pos), a
		, a, id
		, nums = {x: (x == null ? 0 : x), y: (y == null ? 0 : y), z: (z == null ? 0 : z)};
		
		for(a in pos){
			pre[a] = pos[a];
			loopre[a] = loop[a];
			pos[a] += nums[a];
			if(pos[a] >= cells[a]){
				loop[a] = pos[a] - cells[a] + 1;
				pos[a] = isReturn ? pos[a] % cells[a] : cells[a] - 1;
			}else if(pos[a] < 0){
				loop[a] = pos[a];
				//-pos
				pos[a] = isReturn ? (cells[a] + pos[a]) % cells[a] : 0;
			}else{
				loop[a] = 0;
			}
		}
		
		this.updateIndex();
		this.rangeOverCheck();
		return this;
	}
	
	moveTo(x, y, z)
	{
		var pos = this.pos, pre = this.pos_pre, cells = this.cells
		, loop = this.looped, loopre = this.looped_pre, isReturn = this.cellReturn
		, a
		, nums = {x: (x == null ? pos.x : x), y: (y == null ? pos.y : y), z: (z == null ? pos.z : z)};
//		, nums = {x: (x == null ? 0 : x), y: (y == null ? 0 : y), z: (z == null ? 0 : z)};
		
		for(a in pos){
			pre[a] = pos[a];
			loopre[a] = loop[a];
			pos[a] = nums[a];
			if(pos[a] >= cells[a]){
				loop[a]++;
				pos[a] = isReturn ? pos[a] % cells[a] : cells[a] - 1;
			}else if(pos[a] < 0){
				loop[a]--;
				pos[a] = isReturn ? (cells[a] + pos[a]) % cells[a] : 0;
			}else{
				loop[a] = 0;
			}
		}
		this.updateIndex();
		this.rangeOverCheck();
		return this;
	}
	
	rangeOverCheck()
	{
		var r = this.ranged, o = this.offsetted
			, p = this.pos, over = this.rangeovered, a
		;
		for(a in p){
			over[a] = p[a] - o[a];
			if(over[a] >= r[a]){
				o[a] = 1 + p[a] - r[a];
			}else if(over[a] < 0){
				o[a] = p[a];
			}
		}
	}
	
	isRangeOver(axis)
	{
		var over = this.rangeovered;
		if(axis != null){
			return over.x == 0 && over.y == 0 && over.z == 0;
		}
		if(over[axis] != false){
			return over[axis] != 0;
		}
		return null;
	}
	
	isLooped(axis, valued)
	{
		var l = this.looped;
		valued = valued == null ? true : valued;
		
		if(valued){
			if(axis == null){
				return this.looped;
			}
			if(this.looped[axis] != null){
				return this.looped[axis];
			}
		}else{
			if(axis == null){
				return l.x != 0 || l.y != 0 || l.z != 0;
			}else{
				return l[axis] != 0;
			}
		}
		return null;
	}
	
	is(x, y, z){
		var p = true;
		if(x == null && y == null && z == null){
			return null;
		}
		p = x != null ? x == this.x && p : p;
		p = y != null ? y == this.y && p : p;
		p = z != null ? z == this.z && p : p;
		return p;
	}
	
}
export class SceneOrder{
	init(order){
		this.name = order.name;
		this.duration = order.duration;
		this.count = order.count;
		this.remove = order.remove;
		this.params = order.params;
		this.trigger = order.trigger;
		this.remTrigger = order.rem_trig;
//		this.skipRate = order.skip_rate;
		this.funcNotFound = false;
	}
	isFirst(){
		return this.count == 0;
	}
	isLast(){
		return this.count >= this.duration - 1;
	}
	setTrigger(scene){
		this.trigger = scene;
		return this;
	}
	removeAt(scene){
		this.remTrigger = scene;
		return this;
	}
	
	reset(count){
		this.count = count == null ? 0 : count;
	}
//	skip(){
//		var skiped = this.isLast() === false;
//		this.count = this.duration > 0 ? this.duration - 1 : this.count;
//		return skiped;
//	}
	
}

export class SceneTransition{
	init(){
		this.transitionClock = 0;
		this.sceneOrder = [];
		this.scenePrevious = null;
		this.sceneCurrent = null;
		this.skipRate = 1;
//		this.triggerScene = null;
		
		this.nullFunc = function(info){
			return false;
		};
		
	}
	
	makeParams(funcName, duration, params, count, remove){
		count = count == null ? 0 : count;
		remove = remove == null ? false : remove;
		if(typeof funcName == 'object' && funcName != null){
			return funcName;
		}
		var res = {name: funcName, duration: duration, count: count, remove: remove, params: params, trigger: null, rem_trig: null};
		return makeSceneOrder(res);
	}
	
	find(name, inIndex){
		var f = [];
//		inIndex = inIndex == null ? 0 : inIndex;
		if(this.sceneCurrent != null && this.sceneCurrent.name == name){
			f.push(this.sceneCurrent);
//			return this.sceneCurrent;
		}
		f = f.concat(this.sceneOrder.filter(function(a){
			return a.name == name;
		}));
//		f = this.sceneOrder.reverse().find(function(a){
//			return a.name == name;
//		});
		
//		this.sceneOrder.reverse();
		if(f.length == 0){
			return null;
		}

		return inIndex != null ? f[inIndex] : f.pop();
//		return f;
//		return f[inIndex];
	}
	
		
	indexOf(name, inIndex){
		var i = -1;
		if(this.sceneCurrent != null && this.sceneCurrent.name == name){
			return this.sceneCurrent;
		}
		this.sceneOrder.reverse().find(function(a){
			i++;
			return a.name == name;
		});
		
		this.sceneOrder.reverse();
		return i;
	}

	current(name){
		var rem, current;
		if(name != null){
			rem = this.removeOrder(name);
			if(rem != null){
				this.scenePrevious = this.sceneCurrent;
				current = this.sceneCurrent;
				if(current == null){
					return rem;
				}
				this.sceneOrder.unshift({name: current.name, duration: current.duration, count: current.count, params: current.params});
				this.sceneCurrent = rem;
			}
		}
		
		
		return this.sceneCurrent == null ? this.sceneOrder[0] : this.sceneCurrent;
	}
	
	last(){
		var current = this.sceneCurrent
			, order = this.sceneOrder
		;
		//TODO currentの優先変更を検証
		if(order.length > 0){
			return order[order.length - 1];
		}else if(current != null){
			return current;
		}


//		if(current != null){
//			return current;
//		}
//		if(order.length > 0){
//			return order[order.length - 1];
//		}
		return false;
	}
	
	isEmpty(){
		return (this.sceneOrder.length == 0) && (this.sceneCurrent == null);
	}
	
	sumDuration(){
		var s = 0;
		this.sceneOrder.forEach(function(a){
			s += a.duration;
		});
		if(this.currentOrder != null){
			s += this.currentOrder.duration - this.currentOrder.count;
		}
		return s;
	}
	
//	pushOrder(funcName, duration, params){
	pushOrder(funcName, duration, params){
		params = params == null ? {} : params;
		this.sceneOrder.push(this.makeParams(funcName, duration, params));
		return this.sceneOrder[this.sceneOrder.length - 1];
	}
	
	pushOrderFunc(funcName, duration, params){
		params = params == null ? {} : params;
		this.sceneOrder.push(this.makeParams(funcName, duration, params));
	}
	
	unshiftOrder(funcName, duration, params){
		var current = this.sceneCurrent
			, order
		;
		params = params == null ? {} : params;
		if(current != null){
			//TODO currentを戻す必要性の調査
			this.sceneCurrent = null;
//			this.sceneOrder.unshift(this.makeParams(current.name, current.duration, current.params, current.count));
			this.sceneOrder.unshift(current);
			order = this.makeParams(funcName, duration, params);
			this.sceneOrder.unshift(order);
		}else{
			order = this.makeParams(funcName, duration, params);
			this.sceneOrder.unshift(order);
		}
//		console.log(order);
		return order;
	}
	//transitionのみで使用・
	removeCurrentOrder(){
		var current = this.sceneCurrent, name;
		if(current != null){
			//即消し
			current.remove = true;
			this.scenePrevious = current;
			this.sceneCurrent = null;
		}else if(this.sceneOrder.length > 0){
			//予約する
			//食い込み削除がされてしまう
//			this.sceneOrder[0].remove = true;
		}else{
			return false;
		}
		
		if(this.sceneOrder.length > 0){
			name = current == null ? 'null' : current.name;
			console.log(name + ' -> ' + this.sceneOrder[0].name);
		}
		
		return true;
	}
	
	removeOrder(name){
		var res = null;
		if(name == null){
			//全て削除
			res = this.sceneOrder.slice();
			this.sceneOrder.filter(function(s){
				s.remove = true;
			});
			this.sceneOrder = [];
//			this.removeCurrentOrder();
			if(this.sceneCurrent != null){
				this.sceneCurrent.remove = true;
			}
			this.sceneCurrent = null;
			return res;
		}
		
		//TODO 重複対応するか
		this.sceneOrder = this.sceneOrder.filter(function(a){
			if(a.name == name){
				res = a;
				res.remove = true;
			}
			return a.name != name;
		});
		
		if(this.sceneCurrent != null && this.sceneCurrent.name == name){
			res = this.sceneCurrent;
			this.sceneCurrent = null;
			res.remove = true;
			return res;
		}

		return res;
//		return {order: [], current: null};
	}
	
	setTrigger(scene, funcName, index)
	{
		var attach = this.last();
		if(attach == false){
			return false;
		}
		attach.trigger = scene;
		return attach;
//		this.triggerScene = scene;
	}
	
	removeAt(scene)
	{
		var attach = this.last();
		if(attach == false){
			return false;
		}
		attach.removeAt = scene;
		return attach;
	}
	
	skip(rate)
	{
		this.skipRate = rate;
	}
	
	transition(caller, skipCount){
		var order = this.sceneOrder
			, current = this.sceneCurrent
		;
		skipCount = skipCount == null ? 0 : skipCount;
		if(current == null && order.length == 0){
			return;
		}
		
		current = current == null ? order.shift() : current;
		this.sceneCurrent = current;

		if(current.trigger != null){
			current.trigger = current.trigger.remove ? null : current.trigger;
			return;
		}
		if(current.funcFound == null){
//			current.funcFound = current.name == null || caller[current.name] != null;
			//名前指定しているがメソッドが見つからない
			current.funcFound = current.name == null || caller[current.name] != null;
			if(!current.funcFound){
				console.warn('NotFound scene: ' + current.name);
			}
		}
		if(current.funcFound){
			//名前指定している、メソッドがTRUEを返すか削除フラグで削除処理
//			if((current.name != null && caller[current.name](current)) || current.remove){
			if(current.remove || (current.name != null && caller[current.name](current))){
				this.removeCurrentOrder();
			}
		}
		if(current.remTrigger != null && current.remTrigger.remove){
			this.removeCurrentOrder();
		}
		
		current.count++;
		if(current.duration > 0 && current.duration <= current.count){
			this.removeCurrentOrder();
		}
		
		while(this.skipRate - ++skipCount > 0){
			if(this.isEmpty()){
				break;
			}
			this.transition(caller, skipCount);
		}
		
	}
	
	print(){
		var p = [];
		this.sceneOrder.forEach(function(s){
			p.push(s.name == null ? 'null' : s.name);
		});
		if(this.sceneCurrent != null){
			p.push(this.sceneCurrent.name);
		}
		console.log(p.join("\n"));
//		console.log(p);
	}
}

 export class SpriteAnimation{
	init(sprites, frames, playCounts){
		var i, len;
		this.sprites = sprites;
		this.frames = frames;
		this.pattern = 0;
		this.count = 0;
		this.currentCount = 0;
		this.visible = true;
		this.lastPattern = sprites.length - 1;
		this.fixedPatterns = [];
		this.fixed = false;
		len = this.lastPattern;
		if(playCounts == null || Object.keys(playCounts).length == 0){
			this.play = {};
			this.play[len] = 0;
		}else{
			this.play = playCounts;
		}
		this.played = {};
		for(i in this.play){
			this.played[i] = 0;
		}
		this.duration = frames.reduce(function(a, b){
			return (a | 0) + (b | 0);
		});
		this.query = '';
		this.source = sprites;
	}
	
	hide(){
		this.visible = false;
	}
	show(){
		this.visible = true;
	}
	
	reset(){
		this.init(this.sprites, this.frames, this.play);
	}
	
	resetLowerPlayed(pat){
		var i;
		for(i in this.played){
			if(pat > i){
				this.played[i] = 0;
			}
		}
	}
	
	setPattern(pattern, frame){
		this.pattern = pattern != null ? pattern : this.pattern;
		this.currentCount = frame != null ? frame : this.currentCount;
		return this.current();
	}
	
	framesPattern(pattern){
		if(pattern == null){
			return this.frames[this.pattern];
		}else{
			return this.frames[pattern];
		}
	}
	
	isPattern(pattern, count){
		if(pattern == null){
			return this.currentCount == count;
		}else if(count != null){
			return this.pattern == pattern && this.currentCount == count;
		}else{
//			return this.pattern == pattern && this.currentCount == 0;
			return this.pattern == pattern;
		}
	}
	
	isLoop(){
		var pattern = this.pattern
			, play = this.play[pattern] != null ? this.play[pattern] : null
		;
		
		if(play == null){
			return false;
		}
		if(play > 0){
			if(this.played[pattern] > play){
				return false;
			}
		}
		return true;
	}
	
	isEnd(){
		var mp = this.lastPattern
		;
		return this.play[mp] > 0 && (this.played[mp] >= this.play[mp]);
//		return (this.pattern >= mp) && (this.currentCount >= this.frames[mp]) && (this.played[mp] >= this.play[mp]);
	}
	
	getFixed(count){
		if(!this.fixed){
			this.skip(count + 1);
		}
		return this.sprites[this.fixedPatterns[count % this.fixedPatterns.length]];
	}
	
	current(){
		return !this.isEnd() ? this.sprites[this.pattern] : this.sprites[this.lastPattern];
	}
	
	sum(start, end){
		var duration = this.frames.slice(start, end).reduce(function(a, b){
			return (a | 0) + (b | 0);
		});
		
		return duration;
	}
	
	skip(count){
		for(var i = 0; i < count; i++){
			this.next();
		}
		return this.current();
	}
	
	next(){
		var s
		;
		
		this.count++;
		this.currentCount++;
		
		if(!this.fixed && this.currentCount >= this.frames[this.pattern]){
			this.currentCount = 0;
			if(this.isLoop()){
				this.played[this.pattern]++;
				this.pattern = 0;
				this.resetLowerPlayed(this.pattern);
				this.fixed = true;
			}else{
				this.pattern++;
			}
		}
		
		if(this.isEnd()){
			if(this.visible){
				this.sprites[this.lastPattern].show();
			}else{
				this.sprites[this.lastPattern].hide();
			}
			this.fixed = true;
			return this.sprites[this.lastPattern];
		}else if(this.fixed){
			return this.sprites[this.fixedPatterns[this.count % this.fixedPatterns.length]];
		}
		
		if(this.visible){
			this.sprites[this.pattern].show();
		}else{
			this.sprites[this.pattern].hide();
		}
		
		// !this.fixed
		this.fixedPatterns.push(this.pattern);
		return this.sprites[this.pattern];
	}
	
}


export function makeSpritePart(resourceName, params){
	var part = new SpritePart();
	if(params.query != null){
		part.initQueries(resourceName, params.query);
	}else{
		part.init();
	}
	
	return part;
}
export class SpritePart{
	init(){
		this.global = makePosition();
		this.local = makePosition();
		this.sprites = [];
		this.visible = true;
		this.spriteNum = 0;
		this.name = '';
	}
	
	initQueries(resourceName, queries){
		if(this.global == null){
			this.init();
		}
		this.appendSprite(resourceName, queries);
	}
	
	getRect(global){
		var sp = this.sprites[this.spriteNum]
			, pos, rect
		;
		global = global == null ? true : global;
		pos = global ? this.global : this.local;
		rect = makeRect(pos.x, pos.y, sp.w, sp.h);
		rect.z = pos.z;
//		rect.d = sp.d;
		return rect;
	}
	
	appendSprite(resourceName, queries){
		var sprites = this.sprites;
		queries = queries instanceof Array ? queries : [queries];
		
		queries.forEach(function(q){
			sprites.push(makeSpriteQuery(resourceName, q));
		});
		return this;
	}
	
	setParams(params){
		var k;
		for(k in params){
			this[k] = params[k];
		}
		return this;
	}
	
	refreshGlobal(from, to){
		var gl = this.global
			, diff = {
				x: to.x - from.x,
				y: to.x - from.y,
				z: to.x - from.z
			}
		;
		this.global.x += diff.x;
		this.global.y += diff.y;
		this.global.z += diff.z;
		return this;
	}
	
	show(){
		this.visible = true;
		return this;
	}
	
	hide(){
		this.visible = false;
		return this;
	}
	
	pattern(p){
		this.spriteNum = p;
		return this;
	}
	
	setnum(num){
		this.spriteNum = num;
		return this;
	}
	
	move(posArray){
		var pos = this.local
			, back = makePosition(pos.x, pos.y, pos.z)
		;
		pos.x += posArray[0] == null ? 0 : posArray[0];
		pos.y += posArray[1] == null ? 0 : posArray[1];
		pos.z += posArray[2] == null ? 0 : posArray[2];
		this.refreshGlobal(back, pos);
		return this;
	}
	
	setpos(posArray){
		var pos = this.local
			, back = makePosition(pos.x, pos.y, pos.z)
		;
		pos.x = posArray[0] == null ? pos.x : posArray[0];
		pos.y = posArray[1] == null ? pos.y : posArray[1];
		pos.z = posArray[2] == null ? pos.z : posArray[2];
		this.refreshGlobal(back, pos);
		return this;
	}
	
	adjoin(rect, align){
		var r, global = false;
		r = this.getRect(global).adjoin(rect, align);
		this.setpos([r.x, r.y, r.z]);
		return this;
	}
	
	drawTo(scroll, global){
		if(!this.visible){
			return this;
		}
		if(this.sprites[this.spriteNum] == null){
			return this;
		}
		scroll.drawSprite(this.sprites[this.spriteNum], global.x + this.local.x, global.y + this.local.y);
		return this;
	}
}

export function makeSpriteBone(resourceName, patsParams){
	var b = new SpriteBone();
	b.init();
	b.addPartsBySpriteQuery(resourceName, patsParams);
	return b;
}
export class SpriteBone{
	init(){
		this.parts = {};
		this.partsArray = [];
		this.local = makePosition();
		this.global = makePosition();
		this.visible = true;
		this.vflip = false;
		this.hflip = false;
		this.originPart = '';
	}
	//{name: spriteQuery}
	addPartsBySpriteQuery(resourceName, parts){
		var k, sp;
		
		for(k in parts){
//			sp = makeSpriteQuery(resourceName, parts[k]);
			this.parts[k] = makeSpritePart(resourceName, parts[k]);
			this.parts[k].name = k;
			this.partsArray.push(this.parts[k]);
		}
	}
	
	setParams(params){
		var name, k, p, part = this.parts;
		for(name in params){
			parts[name].setParams(params[name]);
		}
	}
	
	partRect(part, global){
		var r = this.parts[part].getRect(global);
		return r;
	}
	
	adjoinPart(a, b, align){
		var global = false;
		this.parts[a].adjoin(this.partRect(b, global), align);
		return this.parts[a];
	}
	
	//com: space delimiter, 0: partName, 1: method
	com(com, value){
		var q = com.split(' ')
		;
		if(q.length < 2){
			return this.parts[q[0]];
		}
		if(this.parts[q[0]] == null || this.parts[q[0]][q[1]] == null){
			console.warn('notfound ' + q[0] + ' ' + q[1]);
			return false;
		}
		this.parts[q[0]][q[1]](value);
		return this.parts[q[0]];
	}
	
	flip(h, v, originPart){
		this.hflip = h != null ? h : this.hflip;
		this.vflip = v != null ? v : this.vflip;
	}
	
	drawTo(scroll, x, y){
		var parts = this.partsArray
			, sortparts = []
			, bonepos = this.global
			, x = x != null ? x : bonepos.x
			, y = y != null ? y : bonepos.y
			, z = bonepos.z
			, vf = this.vflip, hf = this.hflip
			, op = this.parts[this.originPart]
			, oname = this.originPart
			, os = op.sprites[op.spriteNum]
		;
		if(this.visible == false){
			return;
		}
		
		sortparts = parts.slice().sort(function(a, b){
			var c = a.local.z - b.local.z;
			return c;
		});
		
		sortparts.forEach(function(a){
			var s = a.sprites[a.spriteNum];
			if(s == null){
				return;
			}
			s.vflip(vf);
			s.hflip(hf);
			a.drawTo(scroll, {
				x: hf && oname != a.name ? x + os.w - (a.local.x * 2 + s.w) : x
				, y: vf && oname != a.name ? y + os.h - s.y : y
				, z: s.z
			});
			s.vflip(false);
			s.hflip(false);
		});
	}

}


export const
makeCursor = function(name, x, y, z){
	let c = new CUCursor();
	c.init();
	c.cells.x = x < 1 ? 1 : x;
	c.cells.y = y < 1 ? 1 : y;
	c.cells.z = z < 1 ? 1 : z;
	c.range(x, y, z);
	c.name = name;
	return c;
}

//, CUCursor = function(){return;};

, makeSceneOrder = function(order){
	var s = new SceneOrder();
	s.init(order);
	return s;
}

, makeScene = function(){
	var s = new SceneTransition();
	s.init();
	return s;
}


, SPRITEANM_DELIMITER = ']['
, SPRITEANM_FRAMES = '@' 
, SPRITEANM_LOOPS = /^\/(\d+)/
//function makeSpriteAnimation(imageName, query, canvasSprites){
, makeSpriteAnimation = function(spriteOrName, query){
	var i, res = [], qArr, q, spl, frames = [], sprites = [], spa, loops = {}, mat
		, baseFrame = 1, maked, isReffer
		, imageName, canvasSprites
		;
	
	//出来上がったスプライトを使用
	isReffer = typeof spriteOrName == 'object';
	imageName = isReffer ? null : spriteOrName;
	canvasSprites = isReffer ? spriteOrName : null ;
	
	query = query.replace(/^\[\[\]]+|\[\[\]]+$/g,'');
	qArr = query.split(SPRITEANM_DELIMITER);
	for(i = 0; i < qArr.length; i++){
		q = qArr[i];
		mat = q.match(SPRITEANM_LOOPS);
		if(mat != null){
			loops[sprites.length - 1] = mat[1] | 0;
			continue;
		}
		spl = q.split(SPRITEANM_FRAMES);
		if(spl[0].trim().length == 0){
			baseFrame = spl[1];
			continue;
		}
		if(spl[1] == null){
			spl[1] = baseFrame;
		}
		maked = isReffer ? canvasSprites[spl[0]] : makeSpriteQuery(imageName, spl[0]);
		if(maked == null){
			console.warn('No Sprite Animation: ', spriteOrName, query);
		}
		sprites.push(maked);
		frames.push(spl[1] | 0);
	}
	spa = new SpriteAnimation();
	spa.init(sprites, frames, loops);
	spa.query = query;
	spa.source = spriteOrName;
	return spa;
}

, copySpriteAnimation = function(anim){
	var make = new SpriteAnimation();
	make.init(anim.sprites, anim.frames,anim.play);
	return make;
}

, drawDebugCell = function(scroll, pointControll, wordprint, color){
	var bg = SCROLL.sprite
		, pos = pointControll.getMovePos()
		, start = pointControll.getStartPos()
		, right = pointControll.getState('right')
		, left = pointControll.getState('left')
		, cto = cellhto, toc = tocellh
		, x, y, w = cto(1)
		, xs, xe, ys, ye
		, r
		, str
		, backScroll = wordprint.getScroll()
		, bgcolor = COLOR_BLACK
		, backRow = wordprint.rows
	;
	
	color = color == null ? COLOR_WHITE : color;
	
	
	pos = {x: toc(pos.x), y: toc(pos.y)};
	start = {x: toc(start.x), y: toc(start.y)};
	xs = start.x > pos.x ? start.x + 1: start.x;
	xe = start.x > pos.x ? pos.x : pos.x + 1;
	ys = start.y > pos.y ? start.y + 1: start.y;
	ye = start.y > pos.y ? pos.y : pos.y + 1;

	wordprint.setScroll(scroll);
	if(left){
		r = makeRect([xs, ys, xe, ye].join(' ') + ' :pos' );
		scroll.debugRect(makeRect(r.toString() + ' *8'), color);
		
		str = numFormat(r.x, 2) + ':' + numFormat(r.y, 2) + "$n" 
			+ numFormat(r.w, 2) + ':' + numFormat(r.h, 2);
	
		if(r.w > 2 && r.h > 1){
			x = start.x >= pos.x ? start.x - 1.5 : start.x;
			y = start.y >= pos.y ? start.y - 1 : start.y;
		}else{
			x = start.x >= pos.x ? r.ex - 2.5 : r.x;
			y = start.y >= pos.y ? r.ey : r.y - 2;
		}
		x = x > 37.5 ? 37.5 : x;
		y = y > 28 ? 28 : y;
		x += x < 0 ? -x : 0;
		y += y < 0 ? -y : 0;
			
		if(r.isContain(x, y)){
//			color = COLOR_BLACK;
		}
	}else if(right){
		wordprint.print('IMAGE RESOURCES: ' + Object.keys(imageResource.data).length, cto(0), cto(29), color, bgcolor);
		
	}else{
		str = (pos.x < 10 ? 'x:0' : 'x:') + pos.x + "$n" + (pos.y < 10 ? 'y:0' : 'y:') + pos.y + '';
		scroll.debugRect(makeRect(cto(pos.x), cto(pos.y), w, w), color);
		x = pos.x - (pos.x < 1 ? 0 : 1);
		y = pos.y - (pos.y < 2 ? -1 : 2);
	}
	wordprint.setMaxRows(0);
	
	wordprint.print(str, cto(x), cto(y), color, bgcolor);
	//戻す
	wordprint.setScroll(backScroll);
	wordprint.setMaxRows(backRow);
	
}
;