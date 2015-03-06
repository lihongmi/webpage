;var $ZExtend = function(){
	var args = arguments;
	if (args.length == 1) args = [this, args[0]];
	for (var prop in args[1]) args[0][prop] = args[1][prop];
	return args[0];
};
function $ZClass() {}
$ZClass.prototype.construct = function() {};
$ZClass.extend = function(def) {
	var classDef = function() {
		if (arguments[0] !== $ZClass) { return this.construct.apply(this, arguments); }
	};
  
	var proto = new this($ZClass);
	$ZExtend(proto,def);

	classDef.prototype = proto;
	classDef.extend = this.extend;
	return classDef;
};

var $Z = function(elm,root) {
	var proto = $Z.extend({},$ZElement.prototype)
		,d = typeof(root) == 'undefined' ? document : (typeof(root) == 'string'? $(root):root);
	if(typeof(elm) == "string") {
		if(elm.indexOf('#')==0){
			elm = d.getElementById(elm.replace('#',''));	
		}else{
			if(elm.indexOf('.')==0){
				var elms = [];
				if (document.getElementsByClassName) {
					elms = d.getElementsByClassName(elm.replace('.',''));
			    } else {
			    	q = d.getElementsByTagName("*");
			    	var cls = elm.replace('.','');
				    for (var i = 0,len = q.length; i < len; i++) {
						if (q[i].className && (' '+q[i].className+' ').indexOf(' '+cls+' ') >= 0) {
							elms.push(q[i]);
						}
					}
			    }
			}else{
				var elms = d.getElementsByTagName(elm);
			}
			var tempArr = [];
			for(var i=0; i<elms.length; i++){
				tempArr.push($ZExtend(elms[i],proto));
			}
			return tempArr;
		}
		
		if(elm==null) return false;
	}
	
	if(elm == window) {
		for(var p in proto) {
			if(p != 'on'&&p != 'un') {
				delete proto[p];
			}
		}
	}
	return $ZExtend(elm,proto);
};

var $ZElement = $ZClass.extend({
	construct : function(elm,d) {
		if(typeof(elm) == "string") {
			elm = (d || document).createElement(elm);
		}
		elm = $Z(elm);
		return elm;
	},
	
	wrapper : function(elm) {
		elm.appendChild(this);	
		return this;
	},

	
	before : function(elm) {
		if(typeof(elm) == 'string') {
			elm = document.createTextNode(elm);
		}
		elm.parentNode.insertBefore(this,elm);	
		return this;
	},

	append : function(elm) {
		if(typeof(elm) == 'string') {
			elm = document.createTextNode(elm);
		}
		this.appendChild(elm);	
		return this;
	},
	
	on : function(type, fn) {
		$Z.on(this,type,fn);
		return this;	
	},
	un : function(type, fn) {
		$Z.un(this,type,fn);
		return this;	
	},
	html : function(c) {
		this.innerHTML = c;
		return this;
	},


	pos : function() {
		var bodyRect = document.body.getBoundingClientRect(),
		elemRect = $Z(this).getBoundingClientRect(),
    	pos   = [elemRect.left - bodyRect.left,elemRect.top - bodyRect.top];
    	return pos;
	},

	mask : function(){
		var maskId=$Z(this).id+'__ZMLOADING__',pos=$Z(this).pos();

		if(!$Z('#'+maskId)){
			var mask = document.createElement("DIV"),maskTxt = document.createElement("DIV");
			mask.id = maskId;
			mask.style.cssText = 'background: rgb(0, 0, 0) transparent; background: rgba(0, 0, 0, 0.6); filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000, endColorstr=#99000000); -ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000, endColorstr=#99000000)"';
			maskTxt.style.cssText = 'border-radius:3px;-moz-border-radius:3px;-webkit-border-radius:3px;line-height:28px;font-size:12px;cursor:wait;color:#999;margin-top:-16px;margin-left:-49px;position:absolute;border:2px double #EEE;padding-left:32px;height:28px; width:60px;top:50%;left:50%;background:#FFF url(http://html.zmaitech.com/document/common/loading.gif) no-repeat;';
			maskTxt.innerHTML = '加载中...';
			$Z(mask).wrapper(document.body);
			$Z(maskTxt).wrapper(mask);
		};
		
		

		$Z('#'+maskId).css({
			'position':'absolute',
			'width':$Z(this).css('width'),
			'height':Math.min(parseInt($Z(this).css('height')),window.innerHeight)+'px',
			'z-index':9999,
			'left':pos[0]+'px',
			'top':pos[1]+'px'
		}).show();

		if(arguments[0]){
			$Z('#'+maskId).firstChild.innerHTML = arguments[0];
		};
		return this;
	},
	
	unMask: function() {
		try{
			var maskId=$Z(this).id+'__ZMLOADING__';
			$Z('#'+maskId).hide();	
		}catch(e){}
		
	},

	win : function(config){
		var maskId=$Z(this).id+'__ZMWINDOW__',pos=$Z(this).pos();
		config = $.extend({
			width:525,
			height:455,
			padding:'20px'
		},config);

		var css = 'width:'+config.width+'px;height:'+config.height+'px;left:50%;top:50%;margin-left:-'+config.width/2+'px;margin-top:-'+config.height/2+'px;';

		if(!$Z('#'+maskId)){
			var mask = document.createElement("DIV"),maskTxt = document.createElement("DIV"),closeBtn = document.createElement('a');
			mask.id = maskId;
			mask.style.cssText = 'background: rgb(0, 0, 0) transparent; background: rgba(0, 0, 0, 0.6); filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000, endColorstr=#99000000); -ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000, endColorstr=#99000000)"';
			maskTxt.style.cssText = css+';overflow:auto;padding:'+config.padding+';position:absolute;border-radius:3px;-moz-border-radius:3px;-webkit-border-radius:3px;background:#FFF';
			closeBtn.innerHTML = '&#10006';
			closeBtn.style.cssText = 'position:absolute;right:5px;top:5px;font-family: Arial, sans-serif;text-decoration:none;line-height:1;font-size:16px;color:#666';
			closeBtn.href = 'javascript:$Z("#'+$Z(this).id+'").winClose()';
		
			$Z(mask).wrapper(document.body);
			$Z(maskTxt).wrapper(mask);
			$Z(maskTxt).appendChild(closeBtn);
			$Z(this).wrapper(maskTxt);
		
		}
		
		$Z('#'+maskId).show();
		$Z(window).on('resize',(function(){
			if($Z('#'+maskId).css('display')=='none') return;
			$Z('#'+maskId).css({
				'position':'absolute',
				'width':$Z(window).innerWidth+'px',
				/*'height':Math.max($Z(window).innerHeight,parseInt($Z(document.body).css('height')))+'px',*/
				'height':$Z(window).innerHeight+'px',
				'z-index':9999,
				'left':0,
				'top':0
			});
			return arguments.callee;
		})());
		return this;
	},
	winClose: function() {
		try{
			var maskId=$Z(this).id+'__ZMWINDOW__';
			$Z('#'+maskId).hide();
		}catch(e){}
		
	},
	
	noSelect : function() {
		$Z.noSelect(this);
		return this;
	},
	
	parentTag : function(t) {
		var elm = this;
		 do {
		 	elm = elm.parentNode;
			if(elm && elm.nodeName && elm.nodeName.toUpperCase() == t.toUpperCase()) {
				return $(elm);
			}
		} while(elm);
		return false;
	},

	parent: function(t) {
		var elm = this;
		var c = t.replace('.','');
		 do {
		 	elm = elm.parentNode;
			if(elm && (t.indexOf('.') !== 0 ? (elm.nodeName && elm.nodeName.toUpperCase() == t.toUpperCase()) : ((' '+elm.className+' ').indexOf(' '+c+' ') >= 0))) {
				return $(elm);
			}
		} while(elm);
		return false;
	},

	next: function(t) {
		var elm = this;
		var c = t.replace('.','');
		 do {
		 	elm = elm.nextSibling;
			if(elm && elm.nodeType === 1 && (t.indexOf('.') !== 0 ? (elm.nodeName && elm.nodeName.toUpperCase() == t.toUpperCase()) : ((' '+elm.className+' ').indexOf(' '+c+' ') >= 0))) {
				return $(elm);
			}
		} while(elm);
		return false;
	},

	prev: function(t) {
		var elm = this;
		var c = t.replace('.','');
		 do {
		 	elm = elm.previousSibling;
			if(elm && elm.nodeType === 1 && (t.indexOf('.') !== 0 ? (elm.nodeName && elm.nodeName.toUpperCase() == t.toUpperCase()) : ((' '+elm.className+' ').indexOf(' '+c+' ') >= 0))) {
				return $(elm);
			}
		} while(elm);
		return false;
	},
	
	hasClass : function(cls) {
		return this.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
	},
	
	addClass : function(cls) {
		if (!this.hasClass(cls)) { this.className += " "+cls };
		this.className = this.className.replace(/^\s+|\s+$/g,"");
		return this;
	},
	
	removeClass : function(cls) {
		if (this.hasClass(cls)) {
			this.className = this.className.replace(new RegExp('(\\s|^)'+cls+'(\\s|$)'),' ');
			this.className = this.className.replace(/^\s+|\s+$/g,"");//trim
		}
		return this;
	},

	css : function() {
		if(typeof(arguments[0]) == "object"){

			var st = arguments[0];
			var elmStyle = this.style;
			for(var itm in st) {
				switch(itm) {
					case 'float':
						elmStyle['cssFloat'] = elmStyle['styleFloat'] = st[itm];
						break;
					case 'opacity':
						elmStyle.opacity = st[itm];
						elmStyle.filter = "alpha(opacity=" + Math.round(st[itm]*100) + ")"; 
						break;
					case 'className':
						this.className = st[itm];
						break;
					default:
						//if(document.compatMode || itm != "cursor") { // Nasty Workaround for IE 5.5
							elmStyle[$Z.camelize(itm)] = st[itm];
						//}		
				}
			}
			return this;
		}else if(typeof(arguments[0]) == "string"){
			var cssRule = arguments[0],d = arguments[1];
			var doc = document.defaultView;
			if(d){
				this.style[$Z.camelize(cssRule)]=d;
				return this;
			}else if(this.nodeType == 1){
				return (doc && doc.getComputedStyle) ? doc.getComputedStyle( this, null ).getPropertyValue(cssRule) : this.currentStyle[ $Z.camelize(cssRule) ];
			}
		}	
	},
	show:function(){
		this.css({'display':'block'});
		return this;
	},
	hide:function(){
		this.css({'display':'none'});
		return this;
	},

	remove : function() {
		this.parentNode.removeChild(this);
		return this;	
	},
	
	attr : function(at) {
		if(typeof(at)=='object'){
			for(var itm in at) {
				if(itm=='style'){
					this.style.cssText = at[itm];
				}else{
					this.setAttribute(itm,at[itm])
				}
				
			}
			return this;
		}else if(typeof(at)=='string'){
			if(arguments.length==2){
				this[at] = arguments[1];
			}else{
				if(at=='style'){
					return this.style.cssText;
				}else{
					return this.getAttribute(at);
				}
			}
			 
		}
	},

	data: function(key,value) {
		var PREFIX_ = 'data-';
		if(typeof(value) != 'undefined') {
			if (this.dataset) {
				this.dataset[key] = value;
			} else {
				this.setAttribute(
			   		PREFIX_ + key,
			    value);
			}
		} else {
			if (this.dataset) {
				return this.dataset[key];
			} else {
				return this.getAttribute(PREFIX_ +key);
			}
		}
	},

	zmwidth: function(value) {
		if(typeof(value) == 'undefined') {
			return parseInt(this.css('width'));
		} else if(value === true) {
			if(this.css('display') != 'none') return this.offsetWidth;
			return parseInt(this.css('height'))+parseInt(this.css('padding-left'))+parseInt(this.css('padding-right'))+parseInt(this.css('border-left-width'))+parseInt(this.css('border-right-width'));
		}
		this.css('width',value+'px');
	},

	zmheight: function(value) {
		if(typeof(value) == 'undefined') {
			return parseInt(this.css('height'));
		} else if(value === true) {
			if(this.css('display') != 'none') return this.offsetHeight;
			return parseInt(this.css('height'))+parseInt(this.css('padding-top'))+parseInt(this.css('padding-bottom'))+parseInt(this.css('border-top-width'))+parseInt(this.css('border-bottom-width'));
		}
		this.css('height',value+'px');
	}
});

$ZExtend($Z,{
	isMSIE : (navigator.appVersion.indexOf("MSIE") != -1),
	
	on : function(obj, type, fn) {
		(obj.addEventListener) ? obj.addEventListener( type, fn, false ) : obj.attachEvent("on"+type, fn);	
	},
	un : function(obj, type, fn) {
		(obj.removeEventListener) ? obj.removeEventListener( type, fn, false ) : obj.detachEvent("on"+type, fn);	
	},
	toArray : function(iterable) {
		var length = iterable.length, results = new Array(length);
    	while (length--) { results[length] = iterable[length] };

    	return results;	
	},
	
	noSelect : function(element) {
		if(element.setAttribute && element.nodeName.toLowerCase() != 'input' && element.nodeName.toLowerCase() != 'textarea') {
			element.setAttribute('unselectable','on');
		}
		for(var i=0;i<element.childNodes.length;i++) {
			$Z.noSelect(element.childNodes[i]);
		}
	},
	camelize : function(s) {
		return s.replace(/\-(.)/g, function(m, l){return l.toUpperCase()});
	},
	inArray : function(arr,item) {
	    return ($Z.search(arr,item) != null);
	},
	search : function(arr,itm) {
		for(var i=0; i < arr.length; i++) {
			if(arr[i] == itm)
				return i;
		}
		return null;	
	},
	cancelEvent : function(e) {
		e = e || window.event;
		if(e.preventDefault && e.stopPropagation) {
			e.preventDefault();
			e.stopPropagation();
		}
		return false;
	},
	domLoad : [],
	domLoaded : function() {
		if (arguments.callee.done) return;
		arguments.callee.done = true;
		for (i = 0;i < $Z.domLoad.length;i++) $Z.domLoad[i]();
	},
	extend : function(){	
		var args = arguments;	var obj = {};	for (var i = 0,len = args.length; i < len; i++) {	if(!args[i]) continue;	for(var k in args[i]) {	obj[k] = args[i][k];	}	};	return obj;
	},
	ajax : function(config) {
		var params = config.params || [],req;
		if(typeof params === 'object') {
			var p = [];
			for(var k in params) {
				p.push(encodeURIComponent(k)+'='+encodeURIComponent(params[k]));
			}
			params = p;
		}
		var url = config.url || '';
		
		if(config.form) {
			var frm = $Z('#'+config.form);
			url = url || frm.action;
		    for(var i=0,len = frm.elements.length; i < len; i++) {
		        el = frm.elements[i];
		        if(el.tagName.toUpperCase() == 'SELECT') {
		        	var v = el.options[el.selectedIndex].value;
		        	if(el.name && v !== '') {
		        		params.push(encodeURIComponent(el.name) +'='+ encodeURIComponent(v));
		        	}
		        } else if(el.name && el.value !== '' && ((el.type !='radio'&&el.type != 'checkbox') || el.checked)) {
		            params.push(encodeURIComponent(el.name) +'='+ encodeURIComponent(el.value));
		        }
		    }
		}

		if(url.indexOf('?')>-1){ url += '&timestamp='+new Date().valueOf(); }else{ url += '?timestamp='+new Date().valueOf(); }


		function sendRequest(url,postData,config) {
		    req = createXMLHTTPObject();
		    if (!req) return;
		    var method = (postData) ? "POST" : "GET";
		    req.open(method,url,true);
		    req.setRequestHeader('User-Agent','XMLHTTP/1.0');
		    if (postData)
		        req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
		    req.onreadystatechange = function () {
		        if (req.readyState != 4) return;
		        if (req.status != 200 && req.status != 304) {
		            return;
		        }
		        var res = eval('('+req.responseText+')');
		        if(config.callback) {
		        	config.callback(res);
		        }
		        if(res.success) {
		        	config.success && config.success(res);
		        } else {
					(config.failure || function(res) {alert(res.detail);})(res);
		        }
		    };
		    if (req.readyState == 4) return;
		    req.send(postData);
		}

		var XMLHttpFactories = [
		    function () {return new XMLHttpRequest()},
		    function () {return new ActiveXObject("Msxml2.XMLHTTP")},
		    function () {return new ActiveXObject("Msxml3.XMLHTTP")},
		    function () {return new ActiveXObject("Microsoft.XMLHTTP")}
		];

		function createXMLHTTPObject() {
		    var xmlhttp = false;
		    for (var i=0;i<XMLHttpFactories.length;i++) {
		        try {
		            xmlhttp = XMLHttpFactories[i]();
		        }
		        catch (e) {
		            continue;
		        }
		        break;
		    }
		    return xmlhttp;
		}
		sendRequest(url,params.join('&'),config);
		return req;
	},

	each: function(arr,callback) {
		for (var i = 0,len = arr.length; i < len; i++) {
			if(callback(i,arr[i]) === false) {
				break;
			}
		};
	}
});

//闭包
Function.prototype.closure = function() {
  var __method = this, args = $Z.toArray(arguments), obj = args.shift();
  return function() { if(typeof($Z) != 'undefined') {return __method.apply(obj,args.concat($Z.toArray(arguments))); } };
};
	
Function.prototype.closureListener = function() {
  	var __method = this, args = $Z.toArray(arguments), object = args.shift(); 
  	return function(e) { 
  		e = e || window.event;
  		if(e.target) { var target = e.target; } else { var target =  e.srcElement };
	  		return __method.apply(object, [e,target].concat(args) ); 
	};
};
$Z.fn = $ZElement.prototype;
if(typeof($) == 'undefined') {
	$ = $Z;
};
