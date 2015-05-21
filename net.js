var ctx;
var nctx;
var grid = {
    x: 13,
    y: 13,
}

var sqsize = 20;
var mlvl = 6;
var halt;
var ht = 0;
var wd = 0;
var rht = 0;

var net = [[(grid.x-1)/2,(grid.y-1)/2],[(grid.x-1)/2 ,(grid.y-1)/2 + 1]];
var dirs = [[0,1],[1,0],[0,-1],[-1,0]];
var nets = [];
var adder;

function init() {
    var i,fn;
    var cvs = document.querySelector('#net');
    cvs.width = grid.x * sqsize;
    cvs.height = grid.y * sqsize;
    ctx = cvs.getContext('2d');
    cvs = document.querySelector('#nets');
    cvs.width = 2 * grid.x * sqsize;
    cvs.height = 2 * grid.y * sqsize;
    nctx = cvs.getContext('2d');
    fn = function () {return ;};
    for (i=mlvl-2; i>0; i--) {
	fn = makeAdder(i+1,fn);
    }
    adder = fn;
    draw();
    setInterval(draw,1);
}

function draw() {
    if (halt) {
	return;
    }
    adder(true);
    while (net.length < mlvl) {
	adder(true);
    }
    var i,j,e,ne,c,d;
    e = true;
    for (i=0; i < nets.length; i++) {
	if (checkNet(net,nets[i])) {
	    e = false;
	    break;
	};
    }
    if (e) {
	console.log(net);
	ne = [];
	c = [13,13];
	d = [0,0];
	for (i=0; i < net.length;i++) {
	    ne[i] = [net[i][0],net[i][1]];
	    c[0] = Math.min(net[i][0],c[0]);
	    c[1] = Math.min(net[i][1],c[1]);
	    d[0] = Math.max(net[i][0],d[0]);
	    d[1] = Math.max(net[i][1],d[1]);
	}
	nets.push(ne);
	if ((ht + d[1] - c[1])*sqsize > nctx.canvas.height) {
	    nctx.canvas.height = (ht + d[1] - c[1] + 2)*sqsize;
	    ht = 0;
	    wd = 0;
	    rht = 0;
	    nets.forEach(function(nt) {
		redraw(nt);
	    });
	    console.log('redrawing');
	} else {
	    redraw(ne);
	}
	nctx.restore();
    }
    clear(ctx);
    ctx.save();
    ctx.fillStyle = '#ccc';
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.rect(0,0,grid.x*sqsize,grid.y*sqsize);
    ctx.fill();
    j = 3;
    net.forEach(
	function(a) {
	    ctx.fillStyle = '#' + j + j + j;
	    j++;
	    ctx.beginPath();
	    ctx.rect(a[0]*sqsize,a[1]*sqsize,sqsize,sqsize);
	    ctx.fill();
	}
    );
    ctx.beginPath();
    for (i = 0; i < grid.x; i++) {
	ctx.moveTo(i*sqsize,0);
	ctx.lineTo(i*sqsize,grid.y*sqsize);
    }
    for (i = 0; i < grid.y; i++) {
	ctx.moveTo(0,i*sqsize);
	ctx.lineTo(grid.x*sqsize,i*sqsize);
    }
    ctx.stroke();
    ctx.restore();
}

function makeAdder (lvl,fn) {
    var sq = 0;
    var nsq = -1;
    return function (stop) {
	var newsq,isnew,i,added;
	if (net.length < lvl) {
	    return false;
	}
	if (fn()) {
	    return true;
	}
	if (net.length == lvl) {
	    sq = 0;
	    nsq = - 1;
	}
	net.length = lvl;
	added = false;
	while (!added) {
	    nsq++;
	    if (nsq == 4) {
		nsq = 0;
		sq++;
	    }
	    if (sq >= lvl) {
		if (stop) {
		    halt = true;
		}
		break;
	    }
	    newsq = [net[sq][0]+dirs[nsq][0],net[sq][1]+dirs[nsq][1]];
	    isnew = true;
	    for (i=0;i<lvl;i++) {
		if (net[i][0] == newsq[0] && net[i][1] == newsq[1]) {
		    isnew = false;
		    break;
		}
	    }
	    if (isnew) {
		net.push(newsq);
		added = true;
	    }
	}
	return added;
    }
}

function clear(c) {
    c.save();
    c.setTransform(1,0,0,1,0,0);
    c.clearRect(0,0,c.canvas.width,c.canvas.height);
    c.restore();
}

function checkNet(n,m) {
    var a,b,i,j,k,nn,mm;
    if (n.length != m.length) {
	return false;
    }
    a = [0,0];
    for (i=0;i<n.length;i++) {
	a[0] += n[i][0];
	a[1] += n[i][1];
    }
    a[0] /= n.length;
    a[1] /= n.length;
    b = [0,0];
    for (i=0;i<m.length;i++) {
	b[0] += m[i][0];
	b[1] += m[i][1];
    }
    b[0] /= m.length;
    b[1] /= m.length;
    nn = [];
    mm = [];
    for (i=0;i<n.length;i++) {
	nn[i] = [n[i][0]-a[0],n[i][1]-a[1]]
	mm[i] = [m[i][0]-b[0],m[i][1]-b[1]]
    }
    mm.sort(blockSort);
    for (j=0;j<2;j++) {
	for (i=0;i<nn.length;i++) {
	    nn[i] = [nn[i][1],nn[i][0]];
	}
	for (k=0;k<4;k++) {
	    for (i=0;i<nn.length;i++) {
		nn[i] = [-nn[i][1],nn[i][0]];
	    }
	    nn.sort(blockSort);
	    equal = true;
	    for (i=0; i< nn.length; i++) {
		if (nn[i][0] != mm[i][0]) {
		    equal = false;
		    break;
		}
		if (nn[i][1] != mm[i][1]) {
		    equal = false;
		    break;
		}
	    }
	    if (equal) {
		return true;
	    }
	}
    }
    return false;
}

function blockSort(p,q) {
    if (p[0] < q[0]) {
	return -1;
    }
    if (p[0] > q[0]) {
	return 1;
    }
    if (p[1] < q[1]) {
	return 1;
	}
    if (p[1] > q[1]) {
	return -1;
    }
    return 0;
}

function redraw(ne) {
    var c,d;
    c = [13,13];
    d = [0,0];
    for (i=0; i < ne.length;i++) {
	c[0] = Math.min(ne[i][0],c[0]);
	c[1] = Math.min(ne[i][1],c[1]);
	d[0] = Math.max(ne[i][0],d[0]);
	d[1] = Math.max(ne[i][1],d[1]);
    }
    if ((wd + d[0] - c[0] + 2)*sqsize > nctx.canvas.width) {
	wd = 0;
	ht += rht+2;
	rht = 0;
    }
    nctx.save();
    nctx.beginPath();
    ne.forEach(function(a) {
	nctx.rect((a[0]-c[0] + wd)*sqsize+2,(a[1]-c[1]+ht)*sqsize+2,sqsize-4,sqsize-4);
    });
    wd += d[0] - c[0] + 2;
    rht = Math.max(rht,d[1] - c[1]);
    nctx.fill();
}
