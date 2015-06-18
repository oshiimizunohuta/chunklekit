/**
 * InterFaceTools Library
 * Since 2013-11-19 07:43:37
 * @author しふたろう
 */

function makeCursor(name, x, y, z){
	var c = new CUCursor();
	c.init();
	c.cells.x = x;
	c.cells.y = y;
	c.cells.z = z;
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
		this.cellReturn = true;
		this.name = 'cursor';
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
		this.move(0, num, 0);
	},
	down: function(num)
	{
		num = num == null ? 1 : num;
		this.move(0, -num, 0);
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

	move: function(x, y, z)
	{
		var pos = this.pos, pre = this.pos_pre, cells = this.cells
		, loop = this.looped
		, keys = Object.keys(pos), a
		, nums = {x: (x == null ? 0 : x), y: (y == null ? 0 : y), z: (z == null ? 0 : z)};
		
		for(a in keys){
			pre[a] = pos[a];
			pos[a] += nums[a];
			if(pos[a] >= cells[a]){
				loop[a]++;
				pos[a] = pos[a] % cells[a];
			}else if(pos[a] < 0){
				loop[a]--;
				pos[a] = cells[a] + ((-pos[a]) % cells[a]);
			}else{
				loop[a] = 0;
			}
		}
	},
	
	moveTo: function(x, y, z)
	{
		var pos = this.pos, pre = this.pos_pre, cells = this.cells
		, loop = this.looped
		, keys = Object.keys(pos), a
		, nums = {x: (x == null ? 0 : x), y: (y == null ? 0 : y), z: (z == null ? 0 : z)};
		
		for(a in keys){
			pos[a] += nums[a];
			if(pos[a] >= cells[a]){
				loop[a]++;
				pos[a] = pos[a] % cells[a];
			}else if(pos[a] < 0){
				loop[a]--;
				pos[a] = cells[a] + ((-pos[a]) % cells[a]);
			}else{
				loop[a] = 0;
			}
		}
		
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
