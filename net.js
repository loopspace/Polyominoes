var ctx;
var ndiv;
var ndivs;
var nctx;
var mlvl;
var grid;
var shall;

var sqsize = 20;
var halt;
var ht;
var wd;
var rht;

var net;
var dirs = [[0,1],[1,0],[0,-1],[-1,0]];
var nets;
var adder;
var children = {};

var stime;
var dtime;
var ltime;
var nshapes;
var nfound;

function init() {
    var cvs;
    ndiv = document.querySelector('#nets');
    dtime = document.querySelector('#dtime')
    ltime = document.querySelector('#ltime')
    nshapes = document.querySelector('#nshapes');
    cvs = document.querySelector('#net');
    ctx = cvs.getContext('2d');
    var btn = document.querySelector('#start');
    btn.onclick = start;
}

function start() {
    var i,fn,cvs,nmbr,nd;
    nmbr = document.querySelector('#len');
    mlvl = nmbr.options[nmbr.selectedIndex].value;
    nmbr = document.querySelector('#shall');
    if (nmbr.options[nmbr.selectedIndex].value == 'true') {
	shall = true;
    } else {
	shall = false;
    }
    grid = {
	x: 2*mlvl-3,
	y: 2*mlvl-1,
    }
    ht = 0;
    wd = 0;
    rht = 0;
    halt = false;
    children = {};
    stime = new Date().getTime();
    ltime.innerHTML = '0';
    dtime.innerHTML = '0';
    nfound = 0;
    net = [[(grid.x-1)/2,(grid.y-1)/2]];//,[(grid.x-1)/2 ,(grid.y-1)/2 + 1]];
    nets = [];
    ctx.canvas.width = grid.x * sqsize;
    ctx.canvas.height = grid.y * sqsize;
    while (ndiv.firstChild) ndiv.removeChild(ndiv.firstChild);
    ndivs = [];
    for (i=1; i<=mlvl; i++) {
	nd = document.createElement('div');
	nd.id = 'level' + i;
	ndiv.appendChild(nd);
	ndivs.push(nd);
    }
    fn = function () {return ;};
    for (i=mlvl-1; i>0; i--) {
	fn = makeAdder(i,fn);
    }
    adder = fn;
    draw();
    setInterval(draw,1);
    return false;
}

function draw() {
    var i,j,e,ne,c,d,pnet,tnet,rnet;
    if (halt) {
	return;
    }
    adder(true);
    rnet = checkNet(net,nets);
    if (rnet) {
	pnet = rnet;
    } else {
	if (!nets[net.length])
	    nets[net.length] = [];
	pnet = normaliseNet(net);
	nets[net.length].push(pnet);
	if (shall || net.length == mlvl) {
	    addNet(pnet);
	    nfound++;
	    ltime.innerHTML = ((new Date().getTime() - stime)/1000).toFixed(3);
	    nshapes.innerHTML = nfound;
	}
    }
    if (halt)
	reorder();
    clear(ctx);
    ctx.save();
    ctx.fillStyle = '#ccc';
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.rect(0,0,grid.x*sqsize,grid.y*sqsize);
    ctx.fill();
    ctx.fillStyle = '#333';
    net.forEach(
	function(a) {
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
    dtime.innerHTML = ((new Date().getTime() - stime)/1000).toFixed(3);
}

function makeAdder (lvl,fn) {
    var sq = 0;
    var nsq = -1;
    return function (stop) {
	var newsq,isnew,i,added,rnet,pnet;
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
		pnet = normaliseNet(net);
		net.push(newsq);
		rnet = checkNet(net,nets);
		if (rnet) {
		    if (!children[JSON.stringify(rnet)])
			children[JSON.stringify(rnet)] = {};
		    children[JSON.stringify(rnet)][JSON.stringify(pnet)] = true;
		    net.pop();
		    added = false;
		} else {
		    added = true;
		}
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

function normaliseNet(n) {
    var nn,i;
    nn = [];
    for (i=0;i<n.length;i++) {
	nn[i] = [n[i][0],n[i][1]];
    }
    nn.sort(blockSort);
    for (i=1;i<nn.length;i++) {
	nn[i][0] -= nn[0][0];
	nn[i][1] -= nn[0][1];
    }
    nn[0] = [0,0];
    return nn;
}

function checkNet(n,ns) {
    var a,b,i,j,k,l,nl,nn,nnn,equal;
    nl = n.length;
    if (!ns[nl])
	return false;
    nn = normaliseNet(n);
    for (j=0;j<2;j++) {
	for (i=0;i<nn.length;i++) {
	    nn[i] = [nn[i][1],nn[i][0]];
	}
	for (k=0;k<4;k++) {
	    for (i=0;i<nn.length;i++) {
		nn[i] = [-nn[i][1],nn[i][0]];
	    }
	    nnn = normaliseNet(nn);
	    for (l=0;l<ns[nl].length;l++) {
		equal = true;
		for (i=0; i< nnn.length; i++) {
		    if (nnn[i][0] != ns[nl][l][i][0]) {
			equal = false;
			break;
		    }
		    if (nnn[i][1] != ns[nl][l][i][1]) {
			equal = false;
			break;
		    }
		}
		if (equal) {
		    return ns[nl][l];
		}
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

function addNet(ne) {
    var c,d,n,nctx,ncvs,sqs;
    if (shall) {
	sqs = Math.floor(sqsize /(1+Math.log(ne.length)));
    } else {
	sqs = sqsize;
    }
    c = [2*mlvl,2*mlvl];
    d = [0,0];
    for (i=0; i < ne.length;i++) {
	c[0] = Math.min(ne[i][0],c[0]);
	c[1] = Math.min(ne[i][1],c[1]);
	d[0] = Math.max(ne[i][0],d[0]);
	d[1] = Math.max(ne[i][1],d[1]);
    }
    n = [];
    for (i=0; i< ne.length; i++) {
	n[i] = [ne[i][0]-c[0],ne[i][1]-c[1]];
    }
    d[0] -= c[0];
    d[1] -= c[1];
    d[0]++;
    d[1]++;
    ncvs = document.createElement('canvas');
    ncvs.width = d[0]*sqs;
    ncvs.height = d[1]*sqs;
    ncvs.classList.add('net');
    ncvs.id = 'shape' + hashcode(JSON.stringify(ne));
    nctx = ncvs.getContext('2d');
    nctx.save();
    nctx.beginPath();
    n.forEach(function(a) {
	nctx.rect((a[0]+.1)*sqs,(a[1]+.1)*sqs,.8*sqs,.8*sqs);
    });
    nctx.fill();
    nctx.restore();
    ndivs[ne.length-1].appendChild(ncvs);
}


// Source: http://stackoverflow.com/a/7616484/315213
function hashcode(str) {
  var hash = 0, i, chr, len;
  if (str.length == 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function reorder() {
    var i,j,k,score,nj,parent,n,tmpdiv;
    score = {};
    for (i=1;i<nets.length;i++) {
	for (j=0;j<nets[i].length;j++) {
	    nj = JSON.stringify(nets[i][j]);
	    score[nj] = 0;
	    if (children[nj]) {
		n = 0;
		for (parent in children[nj]) {
		    score[nj] += score[parent];
		    n++;
		}
		score[nj] /= n;
	    }
	}
	nets[i].sort(function(a,b) { return score[JSON.stringify(a)] - score[JSON.stringify(b)]});
	for (j=0;j<nets[i].length;j++) {
	    nj = JSON.stringify(nets[i][j]);
	    score[nj] = j;
	    ndivs[i-1].appendChild(document.querySelector('#shape' + hashcode(nj)));
	}
    }
}
