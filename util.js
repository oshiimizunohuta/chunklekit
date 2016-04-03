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
	var rects, m = 1;
	if(typeof x == 'string'){
		x = x.split(' ');
	}
	if(typeof x == 'object'){
		m = x['4'] != null ? x['4'].replace(/[x*]/, '') | 0 : m;
		h = x['3'];
		w = x['2'];
		y = x['1'];
		x = x['0'];
	}
	rects = new Rect();
	rects.init(x * m, y * m, w * m, h * m);
	return rects;
}

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

