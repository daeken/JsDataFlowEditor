function property(getter, setter) {
	return function(value) {
		if(value == undefined) return getter.call(this);
		else return setter.call(this, value);
	};
}

function event(onAdd, onRemove) {
	onAdd = onAdd == undefined ? null : onAdd;
	onRemove = onRemove == undefined ? null : onRemove;
	var hooks = [];
	var evt = function() {
		var args = [];
		for(var i in arguments)
			args[i] = arguments[i];
		for(var i in hooks)
			hooks[i].apply(this, args);
		return this;
	};
	evt.add = function(hook) {
		if(onAdd != null)
			onAdd.call(this, hook);
		hooks.push(hook);
		return this;
	};
	evt.remove = function(hook) {
		if(onAdd != remove)
			onAdd.call(this, hook);
		for(var i in hooks)
			if(hooks[i] == hook) {
				hooks.splice(i, 1);
				break;
			}
		return this;
	};
	evt.clear = function() {
		hooks = [];
	};

	return evt;
};

Raphael.fn.connection = function (obj1, obj2, line, bg, removeHook) {
    if (obj1.line && obj1.from && obj1.to) {
        line = obj1;
        obj1 = line.from;
        obj2 = line.to;
    }
    var bb1 = obj1.getBBox(),
        bb2 = obj2.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
        {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
        {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
        {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
        {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
        {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
        {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
        {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
        d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
    if (line && line.line) {
        line.bg && line.bg.attr({path: path});
        line.line.attr({path: path});
    } else {
        var color = typeof line == "string" ? line : "#000";
        var lineElem = this.path(path);
        var bgElem = (bg && bg.split) ? this.path(path) : null;
        if(removeHook != undefined) {
        	function dblclick(e) {
						(e.originalEvent || e).preventDefault();
	        	removeHook();
	        	lineElem.remove();
	        	if(bgElem != null)
		        	bgElem.remove();
	        }
        	lineElem.dblclick(dblclick);
        	if(bgElem != null)
	        	bgElem.dblclick(dblclick);
      	}
        return {
            line: lineElem.attr({stroke: color, fill: "none"}).toBack(),
            bg: bg && bg.split && bgElem.attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}).toBack(),
            from: obj1,
            to: obj2
        };
    }
};

Raphael.fn.removeConnection = function(connection) {
	if(connection.line != undefined)
		connection.line.remove();
	if(connection.bg != undefined)
		connection.bg.remove();
};

Raphael.el.xlateText = function() {
	this.translate(this.getBBox().width / 2, 0);
	return this;
};

var connecting = null;
var connectionCallback = null;

var defaultTheme = {
	nodeFill: '#eee',
	pointInactive: '#fff',
	pointActive: '#ccc',

	connectingFill: '#fff',
	connectingStroke: '#000',
	connectingStrokeWidth: '3',

	lineFill: 'blue',
	lineStroke: '#000',
	lineStrokeWidth: '3'
};

function graphEditor(id, width, height, theme) {
	if(theme == undefined)
		this.theme = defaultTheme;
	else {
		this.theme = {};
		for(k in theme)
			this.theme[k] = theme[k];
		for(k in defaultTheme)
			if(this.theme[k] == undefined)
				this.theme[k] = defaultTheme[k];
	}

	this.raphael = Raphael(id, width, height);
	this.nodes = [];
	this.selected = null;

	return true;
}

graphEditor.prototype.rigConnections = function(point) {
	var sthis = this;
	point.circle.mousedown(
		function(e) {
			(e.originalEvent || e).preventDefault();

			var circle = sthis.raphael.circle(point.circle.attr('cx'), point.circle.attr('cy'), 1);
			if(!point.multi && point.connections.length != 0) {
				var other = point.connections[0];
				beginning = other.circle;
				point.removeConnection(sthis.raphael, other);
				connecting = other;
			} else
				connecting = point;
			var line = sthis.raphael.connection(connecting.circle, circle, sthis.theme.connectingFill, sthis.theme.connectingStroke + '|' + sthis.theme.connectingStrokeWidth);
			var jo = $(sthis.raphael.element);
			var mouseup = function() {
				circle.remove();
				sthis.raphael.removeConnection(line);
				connecting = null;
				connectionCallback = null;
				jo.unbind('mouseup', mouseup);
				jo.unbind('mousemove', mousemove);
			}
			jo.mouseup(mouseup);

			var sx = undefined, sy = undefined;
			var mousemove = function(e) {
				if(sx == undefined) {
					sx = e.pageX;
					sy = e.pageY;
				}
				circle.translate(e.pageX - sx, e.pageY - sy);
				sthis.raphael.connection(line);
				sx = e.pageX;
				sy = e.pageY;
			}
			jo.mousemove(mousemove);

			connectionCallback = function(cpoint) {
				if(cpoint.dir != connecting.dir && cpoint.parent != connecting.parent)
					connecting.connect(sthis.raphael, cpoint);
			};
		}
	);
	point.circle.mouseup(
		function(e) {
			if(connecting == null) return;

			connectionCallback(point);
		}
	);
};

graphEditor.prototype.addNode = function(x, y, node) {
	var sthis = this;
	this.nodes.push(node);

	node.raphael = this.raphael;
	node.parent = this;
	node.focus.add(
		function() {
			if(sthis.selected != null)
				sthis.selected.blur();
			sthis.selected = this;
			this.element.toFront();
			this.element.attr('stroke-width', 3);
		}
	);
	node.blur.add(
		function() {
			sthis.selected = null;
			this.element.attr('stroke-width', 1);
		}
	);

	var temp = [];
	ly = y+35;
	mx = 0;
	for(i in node.points) {
		var point = node.points[i];
		if(point.dir == 'out') continue;
		point.circle = circle = this.raphael.circle(x+10, ly, 7.5).attr({stroke: '#000', fill: this.theme.pointInactive}).toFront();
		this.rigConnections(point);
		label = this.raphael.text(x+20, ly, point.label).attr({fill: '#000', 'font-size': 12}).xlateText().toFront();
		bbox = label.getBBox();
		ly += bbox.height + 5;
		if(bbox.width > mx)
			mx = bbox.width;
		temp.push(circle);
		temp.push(label);
	}
	lx = (mx != 0) ? mx + 25 : 0;
	lx += x + 25;
	mx = 0;
	my = ly;
	labels = [];
	ly = y+35;
	for(i in node.points) {
		var point = node.points[i];
		if(point.dir == 'in') continue;
		label = this.raphael.text(lx, ly, point.label).attr({fill: '#000', 'font-size': 12}).xlateText().toFront()
		label.point = point;
		bbox = label.getBBox();
		ly += bbox.height + 5;
		if(bbox.width > mx)
			mx = bbox.width;
		labels.push(label);
	}
	ly = y+35;
	ex = lx + mx + 10;

	var text = this.raphael.text(x+20, y+15, node.title).attr({fill: '#000', 'font-size': 16, 'font-weight': 'bold'}).xlateText();
	bbox = text.getBBox();
	if(ex < bbox.width + 80)
		ex = bbox.width + 80;

	for(i in labels) {
		var label = labels[i];
		label.point.circle = circle = this.raphael.circle(ex, ly, 7.5).attr({stroke: '#000', fill: this.theme.pointInactive}).toFront();
		this.rigConnections(label.point);
		bbox = label.getBBox();
		ly += bbox.height + 5;
		temp.push(circle);
		temp.push(label);
	}

	rect = this.raphael.rect(x, y, ex+10 - x, Math.max(my, ly) - y, 10).attr({fill: this.theme.nodeFill, 'fill-opacity': 0.9});
	var set = node.element = this.raphael.set().push(rect, text.toFront());
	for(i in temp)
		set.push(temp[i].toFront());

	var suppressSelect = false;
	rect.click(
		function() {
			if(suppressSelect == true) {
				suppressSelect = false;
				return false;
			}
			if(node.selected)
				node.blur();
			else
				node.focus();
		}
	);

	function start() {
		this.cx = this.cy = 0;
		this.moved = false;
		set.animate({'fill-opacity': 0.4}, 250);
	}
	function move(dx, dy) {
		set.translate(dx - this.cx, dy - this.cy);
		this.cx = dx;
		this.cy = dy;
		this.moved = true;
		set.toFront();
		for(i in node.points)
			node.points[i].fixConnections(sthis.raphael);
	}
	function end() {
		set.animate({'fill-opacity': 0.9}, 250);
		if(this.moved != false)
			suppressSelect = true;
	}
	rect.drag(move, start, end);
};

function graphNode(id, title) {
	this.id = id;
	this.title = title;
	this.points = [];

	this.focus = event().add(function() {
		this.selected = true;
	});
	this.blur = event().add(function() {
		this.selected = false;
	});
	this.connect = event();
	this.disconnect = event();
	this.update = event().add(function() {
		this.selected = false;
	});
	this.remove = event().add(function() {
		if(this.selected)
			this.blur();
		this.element.remove();
		for(var i in this.points)
			this.points[i].remove(this.raphael);
	});
	this.selected = false;

	return true;
}

graphNode.prototype.addPoint = function(label, dir, multi) {
	var npoint = this[label] = new point(this, label, dir, multi);
	this.points.push(npoint);
	return this;
};

function point(parent, label, dir, multi) {
	this.parent = parent;
	this.label = label;
	this.dir = dir;
	if(multi == undefined)
		this.multi = dir == 'out';
	else
		this.multi = multi;

	this.connections = [];
	this.lines = []

	return true;
}

point.prototype.remove = function(raphael) {
	for(var i in this.connections)
		this.connections[i].removeConnection(raphael, this, true);
	for(var i in this.lines)
		raphael.removeConnection(this.lines[i]);
};

point.prototype.connect = function(raphael, other, sub) {
	var sthis = this;
	var editor = this.parent.parent;

	if(sub !== true) {
		if(!this.multi && this.connections.length != 0)
			return false;
		else if(!other.multi && other.connections.length != 0)
			return false;
	}

	this.connections.push(other);
	this.circle.attr({fill: editor.theme.pointActive});
	if(sub !== true) {
		function remove() {
			sthis.removeConnection(raphael, other);
		}

		other.connect(raphael, this, true);
		line = raphael.connection(this.circle, other.circle, editor.theme.lineFill, editor.theme.lineStroke + '|' + editor.theme.lineStrokeWidth, remove);
		this.lines.push(line);
		other.lines.push(line);
	}

	this.parent.connect(this, other);

	return true;
};

point.prototype.removeConnection = function(raphael, other, sub) {
	var editor = this.parent.parent;
	for(var i in this.connections)
		if(this.connections[i] == other) {
			this.connections.splice(i, 1);
			if(sub !== true) {
				other.removeConnection(raphael, this, true);
				raphael.removeConnection(this.lines[i]);
			}
			this.lines.splice(i, 1);
			break;
		}

	if(this.connections.length == 0)
		this.circle.attr({fill: editor.theme.pointInactive});

	this.parent.disconnect(this, other);
};

point.prototype.fixConnections = function(raphael) {
	for(var i in this.lines)
		raphael.connection(this.lines[i]);
};
