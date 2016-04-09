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
		this.overlapRect = [];
		this.appendRect = [];
	},

	isContain: function(x, y)
	{
//		alert(this.x + "-" + this.w + " > " + x + " , " + this.y + "-" + this.h + " >" + y);
		//OR//
		var orResult = false, i, len;
		if(this.x <= x && this.y <= y && (this.x + this.w) > x && (this.y + this.h) > y){
			orResult |= true;
		}
		len = this.appendRect.length;
		if(len > 0){
			for(i = 0; i < len; i++){
				if(this.appendRect[i].isContain(x, y)){
					orResult |= true;
					break;
				}
			}
		}
		//OR//

		return orResult;
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
 * x: [String] space delimiter & *x 
 * x: [Array]
 */
function makeRect(x, y, w, h)
{
	var rects, m = 1, ptp = false, opt
		, reg  = /[x*]([0-9]+)/, c, xf, yf;
	if(typeof x == 'string'){
		x = x.split(' ');
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

