/**
 * 矩形クラス 
 */

function Rect(){
	return;
}
Rect.prototype = {
	init: function (x, y, w, h)
	{
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.ex = x + w;
		this.ey = y + h;
		this.toString = this.convertString();
		this.toArray = this.convertArray();
		this.overlapRect = [];
		this.appendRect = [];
	},

	isContain: function(x, y)
	{
		//OR//
		var orResult = false, i, len;
		this.reculc();
		
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
	
	isOverlap: function(r)
	{
		this.reculc();
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

	reculc: function(x, y, w, h)
	{
		var mul = 1;
		if(typeof x == 'string'){
			x = x.trim();
			if(x.indexOf('*') >= 0){
				mul = x.replace('*') | 0;
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
		return this;
	},
	
	convertString: function()
	{
		return [this.x, this.y, this.w, this.h].join(' ');
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
		m = opt != '' && opt.search(reg) > -1 ? opt.replace(reg, '$1') | 0 : m;
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


function Ease(){
		this.count;
		this.range;
		this.start = 0;
		this.division;
		this.time;
		this.func;
	return;
}
Ease.prototype = {
	init: function(s, e, t){
		this.count = 0;
		this.start = s;
		this.end = e;
		this.range = e - s;
		this.time = t;
	},
	
	exp: function(s, e, t){
		var self = this;
		this.init(s, e, t);
		this.division = t * 0.1;
		this.func = function(){
			return 1 / Math.exp(self.division / (self.count + 1));
		};
	},
	
	swing: function(s, e, t){
		var self = this;
		this.init(s, e, t);
		this.division = t;
		this.func = function(){
			return 0.5 - Math.cos(self.count * (Math.PI / self.division)) / 2;
		};
	},
	
	next: function(){
		if(this.func == null){
			return this.start;
		}
		var p = this.func();
		this.count = this.count < this.time ? this.count + 1 : this.time;
		return p * this.range + this.start;
	}
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
	if(pad_length != null && input.length >= pad_length){
		if(pad_type == "STR_PAD_LEFT"){
			input = input.slice(input.length - pad_length);
		}else{
			input = input.slice(0, pad_length);
		}
		return input;
	}

	var addcount = pad_length - input.length;
	var addstr = "";

	for(var i = 0; i < addcount; i++){
		addstr += pad_string;
	}

	if(pad_type == "STR_PAD_LEFT"){
		input = addstr + input;
	}else{
		input = input + addstr;
	}

	return input;

//	dulog(charArray);
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
 * APIインターフェース 
 */
var APIServer = {url: null};
function initAPIServer(apiUrl)
{
	APIServer.url = apiUrl;
};

function sendToAPIServer(method, api, params, func, errorFunc)
{
	var query = [], key, x = new XMLHttpRequest();
	if(APIServer.url == null){console.error('not initialize api server'); return;}
	if(func != null){
		x.onreadystatechange = function(){
			var j;
			switch(x.readyState){
				case 0:break;//オブジェクト生成
				case 1:break;//オープン
				case 2:break;//ヘッダ受信
				case 3:break;//ボディ受信
				case 4:
							if((200 <= x.status && x.status < 300) || (x.status == 304)){
								j = x.responseText;
								try{
									j = typeof j == 'string' ? JSON.parse(j) : '';
								}catch(e){
									j = null;
								}
								func(j);
								x.abort();
							}else{
								errorFunc();
								x.abort();
							}
							 break;//send()完了
			}
		//	func;
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


