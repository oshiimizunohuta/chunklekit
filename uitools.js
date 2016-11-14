/**
 * @name InterFaceTools Library
 * @since 2013-11-19 07:43:37
 * @author bitchunk
 * @version 0.1.0
 */

function makeCursor(name, x, y, z){
	var c = new CUCursor();
	c.init();
	c.cells.x = x;
	c.cells.y = y;
	c.cells.z = z;
	c.range(x, y, z);
	c.name = name;
	return c;
}

var CUCursor = function(){return;};

CUCursor.prototype = {
	init: function(){
		this.pos = {x: 0, y: 0, z: 0};
		this.pos_pre = {x: 0, y:0, z: 0};
		this.cells = {x: 0, y: 0, z: 0};
		this.looped = {x: 0, y: 0, z: 0};
		this.disablePos = [];
		this.cellReturn = true;
		this.name = 'cursor';
		this.index = 0;
		this.ranged = {x: 0, y: 0, z: 0};
		this.offsetted = {x: 0, y: 0, z: 0};
		this.rangeovered = {x: 0, y: 0, z: 0};
	},
	
	right: function(num)
	{
		num = num == null ? 1 : num;
		this.move(num, 0, 0);
	},
	left: function(num)
	{
		num = num == null ? 1 : num;
		this.move(-num, 0, 0);
	},
	up: function(num)
	{
		num = num == null ? 1 : num;
		this.move(0, -num, 0);
	},
	down: function(num)
	{
		num = num == null ? 1 : num;
		this.move(0, num, 0);
	},
	front: function(num)
	{
		num = num == null ? 1 : num;
		this.move(0, 0, num);
	},
	back: function(num)
	{
		num = num == null ? 1 : num;
		this.move(0, 0, -num);
	},
	
	disable: function(x, y, z){
		var pos = this.disablePos;
		if(this.isEnable(x, y, z)){
			return;
		}
		pos.push(this.makePositionStr(x, y, z).join(' '));
	},
	
	enable: function(x, y, z){
		var pos = this.disablePos, i, str = this.makePositionStr(x, y, z);;
		for(i = 0; i < pos.length; i++){
			if(pos[i] == str){
				pos.splice(i, 1);
			}
		}
	},
	
	range: function(x, y, z){
		x = x == null ? 1 : x;
		y = y == null ? 1 : y;
		z = z == null ? 1 : z;
		
		this.ranged = {x: x, y: y, z: z};
	},
	
	isEnable: function(x, y, z){
		var pos = this.dsablePos, i, str = this.makePositionStr(x, y, z);
		for(i = 0; i < pos.length; i++){
			if(pos[i] == str){
				return false;
			}
		}
		return true; 
	},
	
	valueOf: function(valueArray){
		var i = this.index
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
	},
	
	makePositionStr: function(x, y, z){
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
	},

	move: function(x, y, z)
	{
		var pos = this.pos, pre = this.pos_pre, cells = this.cells
		, loop = this.looped
//		, keys = Object.keys(pos), a
		, a, id
		, nums = {x: (x == null ? 0 : x), y: (y == null ? 0 : y), z: (z == null ? 0 : z)};
		
		for(a in pos){
			pre[a] = pos[a];
			pos[a] += nums[a];
			if(pos[a] >= cells[a]){
				loop[a]++;
				pos[a] = pos[a] % cells[a];
			}else if(pos[a] < 0){
				loop[a]--;
				//-pos
				pos[a] = (cells[a] + pos[a]) % cells[a];
			}else{
				loop[a] = 0;
			}
		}
		
		this.index = pos.x + (pos.y * cells.x) + (pos.z * cells.x * cells.y);
		this.rangeOverCheck();
	},
	
	moveTo: function(x, y, z)
	{
		var pos = this.pos, pre = this.pos_pre, cells = this.cells
		, loop = this.looped
		, a
		, nums = {x: (x == null ? 0 : x), y: (y == null ? 0 : y), z: (z == null ? 0 : z)};
		
		for(a in pos){
			pre[a] = pos[a];
			pos[a] = nums[a];
			if(pos[a] >= cells[a]){
				loop[a]++;
				pos[a] = pos[a] % cells[a];
			}else if(pos[a] < 0){
				loop[a]--;
				pos[a] = (cells[a] + pos[a]) % cells[a];
			}else{
				loop[a] = 0;
			}
		}
		this.index = pos.x + (pos.y * cells.x) + (pos.z * cells.x * cells.y);
		this.rangeOverCheck();
	},
	
	rangeOverCheck: function()
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
	},
	
	isRangeOver: function(axis)
	{
		var over = this.rangeovered;
		if(axis != null){
			return over.x == 0 && over.y == 0 && over.z == 0;
		}
		if(over[axis] != false){
			return over[axis] != 0;
		}
		return null;
	},
	
	isLooped: function(axis)
	{
		if(axis != null){
			return this.looped;
		}
		if(this.looped[axis] != false){
			return this.looped[axis];
		}
		return null;
	}
	
	
};


function SceneTransition(){return;}
SceneTransition.prototype = {
	init: function(){
		this.transitionClock = 0;
		this.sceneOrder = [];
		this.scenePrevious = null;
		 this.sceneCurrent = null;
	},
	
	current: function(){
		return this.sceneCurrent;
	},
	
//	pushOrder: function(funcName, duration, params){
	pushOrder: function(funcName, duration, params){
		this.sceneOrder.push({name: funcName, duration: duration, count: 0, params: params});
	},
	
	pushOrderFunc: function(func, duration, params){
		this.sceneOrder.push({func: func, duration: duration, count: 0, params: params});
	},
	
	unshiftOrder: function(funcName, duration, params){
		this.sceneOrder.unshift({name: funcName, duration: duration, count: 0, params: params});
	},
	
	removeOrder: function(name){
		var res;
		if(name == null){
			res = {order: this.sceneOrder.slice(), current: this.sceneCurrent};
			this.sceneOrder = [];
			this.sceneCurrent = null;
			return res;
		}
		this.sceneOrder = this.sceneOrder.filter(function(a){
			if(a.name == name){
				res = {order: [a], current: null};
			}
			return a.name != name;
		});
		if(this.sceneCurrent != null && this.sceneCurrent.name == name){
			res = {order: [], current: this.sceneCurrent};
			this.sceneCurrent = null;
			return res;
		}
		return {order: [], current: null};
	},
	
	transition: function(caller){
		var order = this.sceneOrder
			, current = this.sceneCurrent
		;
		if(current == null && order.length == 0){
			return;
		}
		
		current = current == null ? order.shift() : current;
		this.sceneCurrent = current;
		
		if(caller[current.name](current)){
			this.scenePrevious = this.sceneCurrent;
			this.sceneCurrent = null;
		}
		current.count++;
		if(current.duration > 0 && current.duration <= current.count){
			this.sceneCurrent = null;
		}
		
	},
};

function drawDebugCell(scroll, pointControll, wordprint, color){
	var bg = SCROLL.sprite
		, pos = pointControll.getMovePos()
		, cto = cellhto, toc = tocellh
		, x, y, w = cto(1)
		, str
		, backScroll = wordprint.getScroll()
	;
	
	color = color == null ? COLOR_WHITE : color;
	
	pos = {x: toc(pos.x), y: toc(pos.y)};
	x = pos.x - (pos.x < 1 ? 0 : 1);
	y = pos.y - (pos.y < 2 ? -1 : 2);
	str = (pos.x < 10 ? 'x:0' : 'x:') + pos.x + '$n' + (pos.y < 10 ? 'y:0' : 'y:') + pos.y + '';
	wordprint.setScroll(scroll);
	wordprint.print(str, cto(x), cto(y));
	scroll.debugRect(makeRect(cto(pos.x), cto(pos.y), w, w), color);
	
	//戻す
	wordprint.setScroll(backScroll);
}