/**
 * @name Utilities Class Library
 * @since 2013-11-19 07:43:37
 * @author bitchunk
 * @version 0.3.0
 */

/**
 * 矩形クラス 
 */

export class Rect{
	init(x, y, w, h)
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
	}
	
	center(){
		return {x: this.x + (this.w / 2), y: this.y + (this.h / 2), z: this.z + (this.d / 2)};
	}

	isContain(x, y)
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
	}
	
	// r in this
	isContainRect(r)
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
	}
	
	isOverlap(r)
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
	}
	
	isFit(r)
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
	}
	
	//align(outer): lower higher
	//align(inner): low middle high
	//align(keep): keep
	//'x y z'
	adjoin(rect, align)
	{
		var self = this, axis = this.SORTAXIS, solid = this.SORTSOLID;
		align = typeof align == 'string' ? align.split(' ') : align;
		
		align.forEach(function(a, i){
			var p, s = axis[i], d = solid[i];
			if(a == 'lower'){
				//対象の最小（上）部
				p = rect[s] - self[d];
			}else if(a == 'higher'){
				//対象の最大（下）部
				p = rect[s] + rect[d];
			}else if(a == 'low'){
				//対象の内側最小（上）部
				p = rect[s];
			}else if(a == 'middle'){
				//対象の中心
				p = rect[s] + (rect[d] / 2) - (self[d] / 2);
			}else if(a == 'high'){
				//対象の内部最大（下）部
				p = rect[s] + rect[d] - self[d];
			}else{
				//keep?
				p = self[s];
			}
			self[axis[i]] = p;
		});
		return this;
	}

	reculc(x, y, w, h)
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
	}
	
	toString(){
		return this.convertString();
	}
	
	convertString()
	{
		var s = ' ';
		return this.x + s + this.y + s +  this.w + s + this.h;
	}
	
	toArray(){
		return this.convertArray(null);
	}
	
	convertArray(fillValue)
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
	}
	
	append(add)
	{
		this.appendRect.push(add);
	}
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
export function makeRect(x, y, w, h)
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
			h = yf ? x[1] - x[3] : x[3] - x[1];
			w = xf ? x[0] - x[2] : x[2] - x[0];
//			h = yf ? x[1] - x[3] + 1: x[3] - x[1] + 1;
//			w = xf ? x[0] - x[2] + 1: x[2] - x[0] + 1;
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
export class Ease{
	constructor(){
		this.count;
		this.range;
		this.start = 0;
		this.division;
		this.duration;
		this.func;
	}
	init(s, e, d){
		this.count = 0;
		this.start = s;
		this.end = e;
		this.range = e - s;
		this.duration = d;
	}
	
	linear(e_in, e_out){
		var self = this, func;
//		this.division = t * 0.01;
		func = function(){
			return self.range * self.count / self.duration;
		};
		
		return func;
		
	}
	
	// TODO 削除
	exp(s, e, d){
		var self = this;
		this.init(s, e, d);
		this.division = d * 0.01;
		this.func = function(){
			return 1 / Math.exp(self.division / (self.count + 0.001));
		};
	}
	// TODO 削除
	swing(s, e, d){
		var self = this;
		this.init(s, e, d);
		this.division = d;
		this.func = function(){
			return 0.5 - Math.cos(self.count * (Math.PI / self.division)) / 2;
		};
	}
	
	setFunction(fin, fout, finout){
		
	}
	
	sinusoidal(e_in, e_out){
		var func, self = this;
		if(e_in && !e_out){
			func = function(){
				return (self.range * -Math.cos(self.count / self.duration * (Math.PI / 2))) + self.range;
			};
		}else if(!e_in && e_out){
			func = function(){
				return self.range * Math.sin(self.count / self.duration * (Math.PI / 2));
			};
		}else{
			func = function(){
				return self.range * -(Math.cos(Math.PI * self.count / self.duration) - 1) / 2;
			};
		}
		return func;
	}
	
	cubic(e_in, e_out){
		var func, self = this;
		if(e_in && !e_out){
			func = function(){
				var t = self.count / self.duration;
				return self.range * t * t * t;
			};
		}else if(!e_in && e_out){
			func = function(){
				var t = (self.count / self.duration) - 1;
				return self.range * ((t * t * t) + 1);
			};
		}else{
			func = function(){
				var t = self.count / (self.duration / 2), t2 = t - 2;
				return t < 1 ? self.range * t * t * t / 2 : self.range * ((t2 * t2 * t2) + 2) / 2;
			};
		}
		return func;
	}
	
	quartic(e_in, e_out){
		var func, self = this;
		if(e_in && !e_out){
			func = function(){
				var t = self.count / self.duration;
				return self.range * t * t * t * t;
			};
		}else if(!e_in && e_out){
			func = function(){
				var t = (self.count / self.duration) - 1;
				return self.range * -((t * t * t * t) - 1);
			};
		}else{
			func = function(){
				var t = self.count / (self.duration / 2), t2 = t - 2;
				return t < 1 ? self.range * t * t * t * t / 2 : self.range * -((t2 * t2 * t2 * t2) - 2) / 2;
			};
		}
		return func;
	}
	
	in(s, e, d, type){
		var self = this;
		this.init(s, e, d);
		this.division = d;
		if(type && this[type]){
			this.func = this[type](true, false);
		}else{
			this.func = this.cubic(true, false);
		}
		
	}
	
	out(s, e, d, type){
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
		
	}
	
	inout(s, e, d, type){
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
	}
	
	current(){
		if(this.func == null){
			return this.start;
		}
		if(this.count < this.duration){
			return this.func() + this.start;
		}else{
			return this.range + this.start;
		}
	}

	next(){
		if(this.func == null){
			return this.start;
		}
		if(this.count < this.duration){
			this.count++;
			return this.func() + this.start;
		}else{
			return this.range + this.start;
		}
	}
	
	isFin(){
		return this.count >= this.duration;
	}
};

export const
makeEaseTri = function(){
	var ease = {
			x: new Ease()
			, y: new Ease()
			, z: new Ease()
		}
	;
	ease.x.in(0, 0, 1);
	ease.y.in(0, 0, 1);
	ease.z.in(0, 0, 1);
	return ease;
}
;

export class Position{
	init(x, y, z){
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
	}
	
}

export const
makePosition = function(x, y, z){
	var p = new Position();
	p.init(x, y, z);
	return p;
}

/**
 * 0で桁埋め
 * @param keta
 * @param num
 * @returns {String}
 */
, formatNum = function(num, keta)
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
, str_pad = function(input, pad_length, pad_string, pad_type)
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

/**
 * 指定文字数の左側に空きを文字でうめる
 * default STR_PAD_RIGHT
 * @param input
 * @param pad_length
 * @param pad_string
 * @returns
 */
, strpad = function(input, padstring, length){
	var addcount, i;
	input = input + '';
	addcount = length - input.length;
	for(i = 0; i < addcount; i++){
		input = padstring + input;
	}
	
	return input;
}

, numFormat = function(num, length)
{
	var addcount, i;
	num = parseInt(num) + '';
	addcount = length - num.length;
	for(i = 0; i < addcount; i++){
		num = '0' + num;
	}
	
	return num.slice(num.length - length);
}

, hexFormat = function(num, length)
{
	var addcount, i;
	num = num.toString(16);
	addcount = length - num.length;
	for(i = 0; i < addcount; i++){
		num = '0' + num;
	}
	
	return num.slice(num.length - length);
}

, clone = function(src){
	var dst, k
	;
	if(typeof src != 'object'){
		return src;
	}
	
	if(src.constructor != null){
		return Object.assign(Object.create(src), src);
	}
		
	dst = src instanceof Array ? [] : {};
	for(k in src) {
		dst[k] = typeof src[k] == 'object' && (k != 'prototype' || k != '__proto__') ? clone(src[k]) : src[k];
	}
	return dst;
}

, merge = function(a, b){
	if(typeof a != 'object' || typeof b != 'object'){
		return false;
	}
	for(var k in b){
		a[k] = b[k];
	}
	return a;
}

/**
 * 
 * @param {object} obj
 * @param {array} keys
 * @returns {object}
 */
, objectForKeys = function(obj, keys){
	var i, res = {}, k;
	for(i = 0; i < keys.length; i++){
		k = keys[i];
		res[k] = k in obj ? obj[k] : null;
	}
	
	return res;
}

, arrayToObject = function(a){
	var i, o = {};
	for(i = 0; i < a.length; i++){
		if(a[i] == undefined){
			continue;
		}
		o[i] = a[i];
	}
	return o;
}

, bubbleSort = function(data, order, k){
	var i, j, n, len
	, len = data.length
	, diff = order == null || order == 'asc' 
		? function(a, b){return a > b;} 
		: function(a, b){return a < b;}
		, swaped = true
	;
	if(k == null){
		for (i = 0; i < len - 1; i++){
			for (j = 0; j < len - i - 1; j++){
				if (diff(data[j], data[j + 1])){
					n = data[j];
					data[j] = data[j + 1];
					data[j + 1] = n;
				}
			}
		}
	}else{
		i = 0;
//		for (i = 0; i < len - 1; i++){
		while(swaped){
			swaped = false;
			i++;
			for (j = 0; j < len - i; j++){
				if (diff(data[j][k], data[j + 1][k])){
					n = data[j];
					data[j] = data[j + 1];
					data[j + 1] = n;
					swaped = true;
				}
			}
		}
	}
}

, timetoYmdHis = function(timestamp){
	var d = new Date(timestamp | 0 == 0 ? timestamp : timestamp * 1000)
		, dstr
	;
	dstr = {
		y: formatNum(d.getFullYear(), 4)
		, m: formatNum(d.getMonth() + 1, 2)
		, d: formatNum(d.getDate(), 2)
		, h: formatNum(d.getHours(), 2)
		, i: formatNum(d.getMinutes(), 2)
		, s: formatNum(d.getSeconds(), 2)
	};

	return dstr;
}
;

/**
 * APIインターフェース 
 */
export let APIServer = {url: null};
export class CKAPIServer{
	init(apiUrl){
		this.serverUrl = apiUrl;
		this.filterFunc = function(j){return j;};
		this.error = null;
		this.errorFunc = function(e){
			console.error(e);
		};
	}
	
	post(api, params, func, errorFunc){
		this.send('post', api, params, func, errorFunc);
	}
	get(api, params, func, errorFunc){
		this.send('get', api, params, func, errorFunc);
	}
	
	send(method, api, params, func, errorFunc){
		var data, query = [], key, x = new XMLHttpRequest()
			, self = this
		;
		if(this.serverUrl == null){console.error('not initialize api server'); return;}

		x.timeout = 5000;

		x.onload = func != null ? function () {
			var j;
			if (x.readyState === 4) {
				if (x.status === 200) {
					try{
						j = x.responseText;
						j = typeof j == 'string' ? JSON.parse(j) : '';
						j = self.filterFunc(j);
					}catch(e){
						j = null;
					}
					func(j);
				} else {
					console.error(x.statusText);
				}
			}
		} : function() {
			return false;
		};

		if(errorFunc != null){
			x.ontimeout = function(e){
				self.error = e.data != null ? e.data.error : null;
				errorFunc(e);
				return false;
			};
			x.onerror = function(e){
				self.error = e.data != null ? e.data.error : null;
				errorFunc(e);
				return false;
			};
			x.onabort = function(e){
				self.error = e.data != null ? e.data.error : null;
				errorFunc(e);
				return false;
			};
		}

		if(params instanceof FormData){
			data = params;
			x.open(method, this.serverUrl + '/' + api , true);
		}else{
			for(key in params){
				query.push(key + '=' + params[key]);
			}
			data = query.join('&');
			if(method.toUpperCase() == 'GET'){
				x.open(method, this.serverUrl + '/' + api + '?' + data , true);
				data = "";
			}else{
				x.open(method, this.serverUrl + '/' + api, true);
			}
			x.withCredentials = true;
			x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
		}

		x.send(data);
	}
}

export function initAPIServer(apiUrl)
{
	APIServer.url = apiUrl;
}

function CKServers(name){
	
}
/**
 * API送信
 * @param {string} method
 * @param {string} api
 * @param {object} params
 * @param {function} func
 * @param {function} errorFunc
 * @returns {undefined}
 */
export function sendToAPIServer(method, api, params, func, errorFunc)
{
	var query = [], key, x = new XMLHttpRequest(), str;
	if(APIServer.url == null){console.error('not initialize api server'); return;}

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
	} : function() {
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

export function checkAPIReceive(data){
	if(data == null){
		console.error('server error');
		return false;
	}else if(data instanceof String){
		console.error(data);
		return false;
	}
	return true;
}
