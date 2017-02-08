/**
 * @name Utilities Class Library
 * @since 2013-11-19 07:43:37
 * @author bitchunk
 * @version 0.2.0
 */

/**
 * 矩形クラス 
 */

function Rect(){
	return null;
}
Rect.prototype = {
	init: function (x, y, w, h)
	{
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.d = 1;
		this.z = 0;
		this.ex = x + w;
		this.ey = y + h;
//		this.toString = this.convertString();
//		this.toArray = this.convertArray();
		this.overlapRect = [];
		this.appendRect = [];
		this.SORTAXIS = ['x', 'y', 'z'];
		this.SORTSOLID = ['w', 'h', 'd'];
//		this.SORTAXIS = ['x', 'y'];
//		this.SORTSOLID = ['w', 'h'];
	},

	isContain: function(x, y)
	{
		//OR//
		var orResult = false, i, len;
		this.reculc();
		if(typeof x == 'object'){
			return  this.isContainRect(x);
		}
		// if(this.x <= x && this.y <= y && (this.x + this.w) > x && (this.y + this.h) > y){
		if(this.x <= x && this.y <= y && this.ex > x && this.ey > y){
			orResult = orResult || true;
		}
		len = this.appendRect.length;
		if(len > 0){
			for(i = 0; i < len; i++){
				if(this.appendRect[i].isContain(x, y)){
					orResult = orResult || true;
					break;
				}
			}
		}
		//OR//

		return orResult;
	},
	
	// r in this
	isContainRect: function(r)
	{
//		this.reculc();
		var orResult = false, i, len;
		if(this.isContain(r.x, r.y) && this.isContain(r.x, r.ey - 1) && this.isContain(r.ex - 1, r.y) && this.isContain(r.ex - 1, r.ey - 1)){
			orResult |= true;
		}
		len = this.appendRect.length;
		if(len > 0){
			for(i = 0; i < len; i++){
				if(this.appendRect[i].isContainRect(r)){
					orResult |= true;
					break;
				}
			}
		}

		return orResult;		
	},
	
	isOverlap: function(r)
	{
//		this.reculc();
		var orResult = false, i, len;
		if(this.isContain(r.x, r.y) || this.isContain(r.x, r.ey - 1) || this.isContain(r.ex - 1, r.y) || this.isContain(r.ex - 1, r.ey - 1)){
			orResult |= true;
		}
		len = this.appendRect.length;
		if(len > 0){
			for(i = 0; i < len; i++){
				if(this.appendRect[i].isOverlap(r)){
					orResult |= true;
					break;
				}
			}
		}

		return orResult;
	},
	
	isFit: function(r)
	{
		this.reculc();
		var orResult = false, i, len;
		if(r.x == this.x && r.y == this.y && r.ex == this.ex && r.ey == this.ey){
			orResult |= true;
		}
		len = this.appendRect.length;
		if(len > 0){
			for(i = 0; i < len; i++){
				if(this.appendRect[i].isFit(r)){
					orResult |= true;
					break;
				}
			}
		}
		
		return orResult;
	},
	
	//align(outer): lower higher
	//align(inner): low middle high
	//align(keep): keep
	//'x y z'
	adjoin: function(rect, align)
	{
		var self = this, axis = this.SORTAXIS, solid = this.SORTSOLID;
		align = typeof align == 'string' ? align.split(' ') : align;
		
		align.forEach(function(a, i){
			var p, s = axis[i], d = solid[i];
			if(a == 'lower'){
				p = rect[s] - self[d];
			}else if(a == 'higher'){
				p = rect[s] + rect[d];
			}else if(a == 'low'){
				p = rect[s];
			}else if(a == 'middle'){
				p = rect[s] + (rect[d] / 2) - (self[d] / 2);
			}else if(a == 'high'){
				p = rect[s] + rect[d] - self[d];
			}else{
				p = self[s];
			}
			self[axis[i]] = p;
		});
		return this;
	},

	reculc: function(x, y, w, h)
	{
		var mul = 1;
		if(typeof x == 'string'){
			x = x.trim();
			if(x.indexOf('*') >= 0){
				mul = x.replace('*') * 1;
			}else if(x.indexOf('/') >= 0){
				mul = 1 / x.replace('/');
			}
		}
		
		this.x = (x != null ? x : this.x) * mul;
		this.y = (y != null ? y : this.y) * mul;
		this.w = (w != null ? w : this.w) * mul;
		this.h= (h != null ? h : this.h) * mul;
		
		this.ex = this.x + this.w;
		this.ey = this.y + this.h;
//		this.toString = this.convertString();
//		this.toArray = this.convertArray();

		return this;
	},
	
	toString: function(){
		return this.convertString();
	},
	
	convertString: function()
	{
		var s = ' ';
		return this.x + s + this.y + s +  this.w + s + this.h;
	},
	
	toArray: function(){
		return this.convertArray(null);
	},
	
	convertArray: function(fillValue)
	{
		var x, y, r = [];
		fillValue = fillValue == null ? undefined : fillValue;
		for(y = 0; y < this.h; y++){
			r[y] = [];
			for(x = 0; x < this.w; x++){
				r[y][x] = fillValue;
			}
		}
		return r;
	},
	
	append: function(add)
	{
		this.appendRect.push(add);
	},
};

/**
 * Make Rect 
 * x, y, w, h
 * OR
 * @param {string} x space delimiter & *x (startX startY endX endY)
 * @param {array} x
 * @param {int} x
 * @param {int} y
 * @param {int} w
 * @param {int} h
 */
function makeRect(x, y, w, h)
{
	var rects, m = 1, ptp = false, opt
		, reg  = /[x*]([0-9]+)/, c, xf, yf
		, type = typeof x;
	if(type == 'string'){
		x = x.split(' ').length > 3 ? x.split(' ') : x;
	}
	if(type == 'object'){
		if(x.length != null && x[0].length != null){
			return makeRect(0, 0, x[0].length, x.length);
		}
	}
	if(typeof x == 'object'){
		x = x.map(function(a){
			return a.search(/^\d+$/) > -1 ? a | 0 : a;
		});
		opt = x[4] != null ? x[4] : '';
		m = opt != '' && opt.search(reg) > -1 ? opt.match(reg)[1] | 0 : m;
		ptp = opt != '' ? opt.search(/:pos/, '') > -1 : ptp;
		if(ptp){
			yf = x[1] > x[3];
			xf = x[0] > x[2];
			h = yf ? x[1] - x[3] + 1: x[3] - x[1] + 1;
			w = xf ? x[0] - x[2] + 1: x[2] - x[0] + 1;
			y = yf ? x[3] : x[1];
			x = xf ? x[2] : x[0];
		}else{
			h = x[3];
			w =x[2];
			y = x[1];
			x = x[0];
		}
	}
	rects = new Rect();
	rects.init(x * m, y * m, w * m, h * m);
	return rects;
}

/**
 * イージング
 * @param {value} s Start value
 * @param {value} e End value 
 * @param {value} t Duration frame count
 * @returns {Ease}
 */
function Ease(){
	this.count;
	this.range;
	this.start = 0;
	this.division;
	this.duration;
	this.func;
}

Ease.prototype = {
	init: function(s, e, d){
		this.count = 0;
		this.start = s;
		this.end = e;
		this.range = e - s;
		this.duration = d;
	},
	
	linear: function(e_in, e_out){
		var self = this;
//		this.division = t * 0.01;
		func = function(){
			return self.count / self.duration;
		};
		
		return func;
		
	},
	
	exp: function(s, e, d){
		var self = this;
		this.init(s, e, d);
		this.division = d * 0.01;
		this.func = function(){
			return 1 / Math.exp(self.division / (self.count + 0.001));
		};
	},
	
	swing: function(s, e, d){
		var self = this;
		this.init(s, e, d);
		this.division = d;
		this.func = function(){
			return 0.5 - Math.cos(self.count * (Math.PI / self.division)) / 2;
		};
	},
	
	cubic: function(e_in, e_out){
		var func, self = this;
		if(e_in && !e_out){
			func = function(){
				var t = self.count / self.duration;
				return t * t * t;
			};
		}else if(!e_in && e_out){
			func = function(){
				var t = (self.count / self.duration) - 1;
				return (t * t * t) + 1;
			};
		}else{
			func = function(){
				var t = self.count / (self.duration / 2), t2 = t - 2;
				return t < 1 ? t * t * t / 2 : ((t2 * t2 * t2) + 2) / 2;
			};
		}
		return func;
	},
	
	quartic: function(e_in, e_out){
		var func, self = this;
		if(e_in && !e_out){
			func = function(){
				var t = self.count / self.duration;
				return t * t * t * t;
			};
		}else if(!e_in && e_out){
			func = function(){
				var t = (self.count / self.duration) - 1;
				return -((t * t * t * t) - 1);
			};
		}else{
			func = function(){
				var t = self.count / (self.duration / 2), t2 = t - 2;
				return t < 1 ? t * t * t * t / 2 : -((t2 * t2 * t2 * t2) - 2) / 2;
			};
		}
		return func;
	},
	
	in: function(s, e, d, type){
		var self = this;
		this.init(s, e, d);
		this.division = d;
		if(type && this[type]){
			this.func = this[type](true, false);
		}else{
			this.func = this.cubic(true, false);
		}
		
	},
	
	out: function(s, e, d, type){
		var self = this;
		this.init(s, e, d);
		this.division = d;
		if(type && this[type]){
			this.func = this[type](false, true);
		}else{
			this.func = this.cubic(false, true);
//			this.func = function(){
//				return 0.5 - Math.cos(self.count * (Math.PI / self.division)) / 2;
//			};
		}
		
	},
	
	inout: function(s, e, d, type){
		var self = this;
		this.init(s, e, d);
		this.division = d;
		if(type && this[type]){
			this.func = this[type](true, true);
		}else{
			this.func = function(){
				return 1 - Math.exp(-8 * Math.pow(self.count / self.division, 3));
			};
		}
	},
	
	
	next: function(){
		if(this.func == null){
			return this.start;
		}
		if(this.count < this.duration){
			this.count++;
			return (this.func() * this.range) + this.start;
		}else{
			return this.range + this.start;
		}
	}
};

function Position(){return null;}
Position.prototype = {
	init: function(x, y, z){
		var p
		;
		if((x + '').indexOf(' ') >= 0){
			p = x.split(' ');
			this.x = p[0] == null ? 0 : p[0];
			this.y = p[1] == null ? 0 : p[1];
			this.z = p[2] == null ? 0 : p[2];
		}else{
			this.x = x == null ? 0 : x;
			this.y = y == null ? 0 : y;
			this.z = z == null ? 0 : z;
		}
		
		this.arrayTo = [this.x, this.y, this.z];
	},
	
};
function makePosition(x, y, z){
	var p = new Position();
	p.init(x, y, z);
	return p;
}

function makeSpritePart(resourceName, params){
	var part = new SpritePart();
	if(params.query != null){
		part.initQueries(resourceName, params.query);
	}else{
		part.init();
	}
	
	return part;
}
function SpritePart(){return null;}
SpritePart.prototype = {
	init: function(){
		this.global = makePosition();
		this.local = makePosition();
		this.sprites = [];
		this.visible = true;
		this.spriteNum = 0;
	},
	
	initQueries: function(resourceName, queries){
		if(this.global == null){
			this.init();
		}
		this.appendSprite(resourceName, queries);
	},
	
	getRect: function(global){
		var sp = this.sprites[this.spriteNum]
			, pos, rect
		;
		global = global == null ? true : global;
		pos = global ? this.global : this.local;
		rect = makeRect(pos.x, pos.y, sp.w, sp.h);
		rect.z = pos.z;
//		rect.d = sp.d;
		return rect;
	},
	
	appendSprite: function(resourceName, queries){
		var sprites = this.sprites;
		queries = queries instanceof Array ? queries : [queries];
		
		queries.forEach(function(q){
			sprites.push(makeSpriteQuery(resourceName, q));
		});
		return this;
	},
	
	setParams: function(params){
		var k;
		for(k in params){
			this[k] = params[k];
		}
		return this;
	},
	
	refreshGlobal: function(from, to){
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
	},
	
	show: function(){
		this.visible = true;
		return this;
	},
	
	hide: function(){
		this.visible = false;
		return this;
	},
	
	pattern: function(p){
		this.spriteNum = p;
		return this;
	},
	
	setnum: function(num){
		this.spriteNum = num;
		return this;
	},
	
	move: function(posArray){
		var pos = this.local
			, back = makePosition(pos.x, pos.y, pos.z)
		;
		pos.x += posArray[0] == null ? 0 : posArray[0];
		pos.y += posArray[1] == null ? 0 : posArray[1];
		pos.z += posArray[2] == null ? 0 : posArray[2];
		this.refreshGlobal(back, pos);
		return this;
	},
	
	setpos: function(posArray){
		var pos = this.local
			, back = makePosition(pos.x, pos.y, pos.z)
		;
		pos.x = posArray[0] == null ? pos.x : posArray[0];
		pos.y = posArray[1] == null ? pos.y : posArray[1];
		pos.z = posArray[2] == null ? pos.z : posArray[2];
		this.refreshGlobal(back, pos);
		return this;
	},
	
	adjoin: function(rect, align){
		var r, global = false;
		r = this.getRect(global).adjoin(rect, align);
		this.setpos([r.x, r.y, r.z]);
		return this;
	},
	
	drawTo: function(scroll, global){
		if(!this.visible){
			return this;
		}
		scroll.drawSprite(this.sprites[this.spriteNum], global.x + this.local.x, global.y + this.local.y);
		return this;
	},
};

function makeSpriteBone(resourceName, patsParams){
	var b = new SpriteBone();
	b.init();
	b.addPartsBySpriteQuery(resourceName, patsParams);
	return b;
}
function SpriteBone(){return null;}
SpriteBone.prototype = {
	init: function(){
		this.parts = {};
		this.partsArray = [];
		this.local = makePosition();
		this.global = makePosition();
		this.visible = true;
	},
	//{name: spriteQuery}
	addPartsBySpriteQuery: function(resourceName, parts){
		var k, sp;
		
		for(k in parts){
//			sp = makeSpriteQuery(resourceName, parts[k]);
			this.parts[k] = makeSpritePart(resourceName, parts[k]);
			this.partsArray.push(this.parts[k]);
		}
	},
	
	setParams: function(params){
		var name, k, p, part = this.parts;
		for(name in params){
			parts[name].setParams(params[name]);
		}
	},
	
	partRect: function(part, global){
		var r = this.parts[part].getRect(global);
		return r;
	},
	
	adjoinPart: function(a, b, align){
		var global = false;
		this.parts[a].adjoin(this.partRect(b, global), align);
		return this.parts[a];
	},
	
	//com: space delimiter, 0: partName, 1: method
	com: function(com, value){
		var q = com.split(' ')
		;
		if(q.length < 2){
			return this.parts[q[0]];
		}
		if(this.parts[q[0]] == null || this.parts[q[0]][q[1]] == null){
			console.worn('notfound ' + q[0] + ' ' + q[1]);
			return false;
		}
		this.parts[q[0]][q[1]](value);
		return this.parts[q[0]];
	},
	
	drawTo: function(scroll){
		var parts = this.partsArray
			, sortparts = []
			, bonepos = this.global
		;
		if(this.visible == false){
			return;
		}
			
		sortparts = parts.slice().sort(function(a, b){
			var c = a.local.z - b.local.z;
			return c;
//				return c == 0 ? -1 : c;
		});

		sortparts.forEach(function(a){
			a.drawTo(scroll, bonepos);
		});
	},

};

/**
 * 0で桁埋め
 * @param keta
 * @param num
 * @returns {String}
 */

function formatNum(num, keta)
{

	var src = num + ''
		, cnt = keta - src.length;
	if (cnt <= 0)
		return src;
	while (cnt-- > 0)
	src = "0" + src;
	return src;
}

/**
 * 指定文字数の空きを文字でうめる
 * default STR_PAD_RIGHT
 * @param input
 * @param pad_length
 * @param pad_string
 * @param pad_type
 * @returns
 */
function str_pad(input, pad_length, pad_string, pad_type)
{
	if(typeof(input) == "number"){
		input = input + "";
	}else if(typeof(input) != "string"){
		return "";
	}
	if(input.length == 0){
		return "";
	}
	pad_type = pad_type == null || pad_type == 'left' || pad_type == "STR_PAD_LEFT";
	//true = left (001)
	if(pad_length != null && input.length >= pad_length){
		if(pad_type){
			input = input.slice(input.length - pad_length);
		}else{
			input = input.slice(0, pad_length);
		}
		return input;
	}

	var addcount = pad_length - input.length
		,addstr = "";

	for(var i = 0; i < addcount; i++){
		addstr += pad_string;
	}

	if(pad_type){
		input = addstr + input;
	}else{
		input = input + addstr;
	}

	return input;

//	dulog(charArray);
}

function numFormat(num, length)
{
	var addcount, i;
	num = parseInt(num) + '';
	addcount = length - num.length;
	for(i = 0; i < addcount; i++){
		num = '0' + num;
	}
	
	return num.slice(num.length - length);
}

function clone(src){
	var dst, k
	;
	if(typeof src != 'object'){
		return src;
	}
	dst = src instanceof Array ? [] : {};
	for(k in src) {
		dst[k] = typeof src[k] == 'object' && (k != 'prototype' || k != '__proto__') ? clone(src[k]) : src[k];
	}
	return dst;
}

/**
 * 
 * @param {object} obj
 * @param {array} keys
 * @returns {object}
 */
function objectForKeys(obj, keys){
	var i, res = {}, k;
	for(i = 0; i < keys.length; i++){
		k = keys[i];
		res[k] = k in obj ? obj[k] : null;
	}
	
	return res;
}

function arrayToObject(a){
	var i, o = {};
	for(i = 0; i < a.length; i++){
		if(a[i] == undefined){
			continue;
		}
		o[i] = a[i];
	}
	return o;
}

/**
 * APIインターフェース 
 */
var APIServer = {url: null};
function initAPIServer(apiUrl)
{
	APIServer.url = apiUrl;
};

/**
 * API送信
 * @param {string} method
 * @param {string} api
 * @param {object} params
 * @param {function} func
 * @param {function} errorFunc
 * @returns {undefined}
 */
function sendToAPIServer(method, api, params, func, errorFunc)
{
	var query = [], key, x = new XMLHttpRequest();
	if(APIServer.url == null){console.error('not initialize api server'); return;}
//	if(func != null){
//		x.onreadystatechange = function(){
//			var j;
//			switch(x.readyState){
//				case 0:break;//オブジェクト生成
//				case 1:break;//オープン
//				case 2:break;//ヘッダ受信
//				case 3:break;//ボディ受信
//				case 4:
//							if((200 <= x.status && x.status < 300) || (x.status == 304)){
//								j = x.responseText;
//								try{
//									j = typeof j == 'string' ? JSON.parse(j) : '';
//								}catch(e){
//									j = null;
//								}
//								func(j);
//								x.abort();
//							}else{
////								x.ontimeout();
//								x.abort();
//							}
//							 break;//send()完了
//			}
//		//	func;
//		};
//	}

	x.timeout = 5000;
	
	x.onload = func != null ? function () {
		var j;
		if (x.readyState === 4) {
			if (x.status === 200) {
				try{
					j = x.responseText;
					j = typeof j == 'string' ? JSON.parse(j) : '';
				}catch(e){
					j = null;
				}
				func(j);
			} else {
				console.error(x.statusText);
			}
		}
	} : function () {
		return false;
	};
	
	if(errorFunc != null){
		x.ontimeout = function(e){
			errorFunc(e);
			return false;
		};
		x.onerror = function(e){
			errorFunc(e);
			return false;
		};
		x.onabort = function(e){
			errorFunc(e);
			return false;
		};
	}
		
	
	for(key in params){
		query.push(key + '=' + params[key]);
	}
	str = query.join('&');
	if(method.toUpperCase() == 'GET'){
		x.open(method, APIServer.url + '/' + api + '?' + str , true);
		str = "";
	}else{
		x.open(method, APIServer.url + '/' + api, true);
	}
	x.withCredentials = true;
	x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');

	// Set-Cookie:LITROSOUND=8lr6fpmr30focapfnejn807mo5;
	x.send(str);
};

function checkAPIReceive(data){
	if(data == null){
		console.error('server error');
		return false;
	}else if(data instanceof String){
		console.error(data);
		return false;
	}
	return true;
}
