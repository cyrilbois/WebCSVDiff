function Services () {
	this.file = new File(this);
	this.http = new Http(this);
	this.converter = new Converter(this);
	this.billboard = new Billboard(this);
	this.codeMirror = new _CodeMirror(this);
	this.work = new Work(this);
	this.dom = new DOM(this);
	this.json = new _JSON(this);
	this.comment = new _COMMENT(this);
	this.progressBar = new _ProgressBar(this);
	this.storage = new _Storage(this);
	this.grid = new _Grid(this);
}

Services.prototype.HTMLEntities = function(text) {
	var text = String(text), chars = {
	  '<':'&lt;',
	  '>':'&gt;'
	};
	Object.keys(chars).forEach(function(c) {
		text=text.replace(new RegExp(c,'g'), chars[c]);
	});
	return text;
}

Services.prototype.copyToClipBoard = function(text) {
var textarea = document.createElement('textarea');
	textarea.textContent = text;
	document.body.appendChild(textarea);

	var selection = document.getSelection();
	var range = document.createRange();
	range.selectNode(textarea);
	selection.removeAllRanges();
	selection.addRange(range);

	document.execCommand('copy');
	selection.removeAllRanges();

	document.body.removeChild(textarea);
}
	
Services.prototype.getOrGenerateIdentifier = function() {
	var identifier = services.storage.getItem('identifier');
	if (identifier === null || identifier === undefined) {
		identifier = this.uniqid();
		services.storage.setItem('identifier', identifier);
	}
	return identifier;
}

Services.prototype.reverseDisplay = function(divId) {
	var div = (typeof divId === 'string' ? document.getElementById(divId) : divId);
	if (div) {
		if (div.style.display == 'none') {
			div.style.display = '';
		} else {
			div.style.display = 'none';
		}
	}
}
Services.prototype.uniqid = function(prefix) {
	if (prefix == undefined) prefix = '';
	var id = prefix + String(new Date().getTime()) + Math.floor(Math.random() * 1000000);
	if (typeof(md5) !== "undefined") {
		return md5(id);
	} else {
		return id;
	}
}
Services.prototype.addClass = function(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
}
Services.prototype.removeClass = function(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
}

Services.prototype.openTabber = function(tabber, className, selector) {
    if (!className) {
		className = 'w3-dark-grey';
	}
	var i;
    var x;
	if (!selector) {
		x = document.getElementsByClassName("tabber");
	} else {
		x = document.querySelectorAll(selector);
	}
	
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none"; 
		this.removeClass(document.getElementById('button-'+x[i].id), className);
    }
    document.getElementById(tabber).style.display = "block"; 
	this.addClass(document.getElementById('button-'+tabber), className);
}

function _Grid (services) {
	this.services = services;
}
_Grid.prototype.displayResult = function(rows, separator) {
	var table = document.getElementById('results');
	var tBody = table.getElementsByTagName('tbody')[0];
	var tHeader = table.getElementsByTagName('thead')[0];
	var rowCount = table.rows.length;
	
	for (var i = rowCount - 1; i >= 0; i--) {
		table.deleteRow(i);
	}

	exportCSV = '';

	var keys = [];
	
	rows.forEach(function(row) {				
		Object.keys(row).forEach(function(field) {
			if (keys.indexOf(field) === -1) {
				keys.push(field);
			}
		});
	});
	
	var iColumn = 0;
	var newHeader  = tHeader.insertRow(tHeader.rows.length);
	keys.forEach(function(field ) {
		newHeader.insertCell(iColumn).appendChild(document.createTextNode(field));
		exportCSV += (iColumn > 0 ? separator : '') + field;
		iColumn++;
	});
	exportCSV += "\n";

	var iLine = 0;
	rows.forEach(function(row) {				
		iLine++;
		var newRow   = tBody.insertRow(tBody.rows.length);
		if (iLine % 2 === 1) {
			newRow.className = "sqlite-results-odd";
		}
		iColumn = 0;
		keys.forEach(function(field) {
			newRow.insertCell(iColumn).appendChild(document.createTextNode( (row[field] == null ? '' : row[field] ) ));
			exportCSV += (iColumn > 0 ? separator : '') + (row[field] == null ? '' : row[field] );
			iColumn++;
		});
		exportCSV += "\n";
	});
	return exportCSV;
}

function _Storage (services) {
	this.services = services;
	this.identifier = null;
}
_Storage.prototype.localStorage = function() {
	return (typeof(Storage) !== "undefined");
}

_Storage.prototype.getItem = function(name) {
	if (typeof(Storage) !== "undefined") {
		return localStorage.getItem(name);
	}
	return null;
}
_Storage.prototype.setItem = function(name, value) {
	if (typeof(Storage) !== "undefined") {
		localStorage.setItem(name, value);
	}
}
function _ProgressBar (services) {
	this.services = services;
	this.id = null;
}
_ProgressBar.prototype.stop = function() {
	clearInterval(this.id);
	document.getElementById("myProgress").style.display='none';
}
_ProgressBar.prototype.start = function(time) {
	if (time == undefined) time = 50;
	var self = this;
	var container = document.getElementById("myProgress");
	var elem = document.getElementById("myBar"); 
	var width = 1;
	this.id = setInterval(frame, time);
	container.style.display = '';
	function frame() {
		if (width >= 100) {
			clearInterval(self.id);
			container.style.display = 'none';
		} else if (width >= 95) {
			clearInterval(self.id);
			self.id = setInterval(frame, 60000);
			width++; 
			elem.style.width = width + '%';	
		} else if (width >= 90) {
			clearInterval(self.id);
			self.id = setInterval(frame, 30000);
			width++; 
			elem.style.width = width + '%';
		} else if (width >= 80) {
			clearInterval(self.id);
			self.id = setInterval(frame, time*10);
			width++; 
			elem.style.width = width + '%';			
		} else if (width >= 70) {
			clearInterval(self.id);
			self.id = setInterval(frame, time*8);
			width++; 
			elem.style.width = width + '%';
		} else if (width >= 50) {
			clearInterval(self.id);
			self.id = setInterval(frame, time*4);
			width++; 
			elem.style.width = width + '%';
		} else if (width >= 30) {
			clearInterval(self.id);
			self.id = setInterval(frame, time*2);
			width++; 
			elem.style.width = width + '%'; 
		} else {
			width++; 
			elem.style.width = width + '%'; 
		}
	}
	return this.id;
}

function _COMMENT (services) {
	this.services = services;
	this.editor = [];
}
_COMMENT.prototype.init = function() {
	var self = this;
	var editor = services.codeMirror.create('editor-container-comments', { lineNumbers: true, viewportMargin: Infinity});
	editor.setSize(null, 180);
	this.editor.push({id:null, editor:editor});
	editor.on("focus", function (cm, change)  {
		var dataContainer = document.getElementById('comment-extra-data');
		if (dataContainer.style.display == 'none') {
			self.services.http.get(websiteURL + '/captchaHtml', function(response) { 
				document.getElementById('captcha').innerHTML = response; 
			} );
			dataContainer.style.display = '';
		}
	});
}
_COMMENT.prototype.reply = function(id) {
	var elt = document.getElementById('comment-reply-'+id);
	if (elt) {
		if (elt.style.display == 'none') {
			elt.style.display = '';
			if (!this.editor.some(function (editor){
				if (editor.id == id) {
					return true;
				}
				return false;
			})) {
				this.editor.push({id:id, editor:services.codeMirror.create('editor-container-comments'+id, { lineNumbers: true, viewportMargin: Infinity})});
				
				services.http.get(websiteURL + '/captchaHtml-'+id, function(response) { document.getElementById('captcha'+id).innerHTML = response; } );
			}			
		} else {
			elt.style.display = 'none';
		}
		
	}
}
_COMMENT.prototype.send = function(uri, id) {
	var name = document.getElementById('comment-name'+(id == null ? '' : id));
	var email = document.getElementById('comment-email'+(id == null ? '' : id));
	var url = document.getElementById('comment-website'+(id == null ? '' : id));
	var captcha = document.getElementById('comment-captcha'+(id == null ? '' : id));
	var editor;
	if (name.value == '') {
		alert('You must enter a name.');
		return;
	}
	this.editor.some(function(editorObj) {
		if (editorObj.id == id) {
			editor = editorObj.editor;
			return true;
		}
		return false;
	});
	var self = this;
	this.services.http.post(websiteURL + '/add-comment', (id == null ? '' : '&parent='+id)+'&captcha='+captcha.value+'&uri='+uri+'&name='+encodeURIComponent(name.value)+'&email='+encodeURIComponent(email.value)+'&url='+encodeURIComponent(url.value)+'&comment='+encodeURIComponent(editor.getValue("\n")), function(response) {
		if (response.trim() == '1') {
			editor.setValue('');
			if (id != null) {
				self.reply();
			}
			alert('Your comment is awaiting moderation.');
		} else {
			alert('Bad captcha or an error has occured');
		}
		self.services.http.get(websiteURL + '/captchaHtml'+(id == null ? '' : '-'+id), function(response) { 
			document.getElementById('captcha'+(id == null ? '' : id)).innerHTML = response; 
		} );
	});
}

function _JSON (services) {
	this.services = services;
}
_JSON.prototype.minify = function(str) {
	try {
		var o = JSON.parse(str);
		return JSON.stringify(o);
	} catch (e) {
		return this._format(str, null);
	}
}
_JSON.prototype.format = function(str) {
	return this._format(str, '');
}
_JSON.prototype._readArray = function(o, tab) {
	var _o = {str:o.str.trim().substring(1)};
	o.result = "["+( tab == null ? '' : "\n"+tab);
	while(true) {
		this._readElement(_o, tab);
		o.result += _o.result;
		_o.rest = _o.rest.trim();
		if(_o.rest.charAt(0) ==  ',') {
			o.result += ","+( tab == null ? '' : "\n"+tab);
			_o.str = _o.rest.substring(1);
		} else if (_o.rest.charAt(0) == ']') {
			o.result += ( tab == null ? '' : "\n"+tab)+"]";
			o.rest = _o.rest.substring(1);
			break;
		} else {
			_o.str = _o.rest;
			
		}
	}
}
_JSON.prototype._readObject = function(o, tab) {
	var _o = {str:o.str.trim().substring(1)};
	o.result = ( tab == null ? "{" : "{\n"+tab+"\t" ) ;
	while(true) {
		this._readAttribute(_o, ( tab == null ? null : tab+"\t"));
		o.result += _o.result;
		_o.rest = _o.rest.trim();
		if (_o.rest.charAt(0) == ':')
		{
			o.result += ':';
			_o.rest = _o.rest.substring(1);
			_o.rest = _o.rest.trim();
			_o.str = _o.rest;
			this._readElement(_o, ( tab == null ? null : tab+"\t\t")  );
			o.result += _o.result;
			_o.rest = _o.rest.trim();
		} else {
			o.rest = _o.rest;
			break;
		}
		if(_o.rest.charAt(0) ==  ',') {
			o.result += ( tab == null ? ',' : ",\n"+tab+"\t") ;
			_o.str = _o.rest.substring(1);
		} else if (_o.rest.charAt(0) == '}') {
			o.result += ( tab == null ? '}' : "\n"+tab+"}") ;
			o.rest = _o.rest.substring(1);
			break;
		} else {
			_o.str = _o.rest;
		}
	}
}
_JSON.prototype._readAttribute = function(o, tab) {
	o.str = o.str.trim();
	if (o.str.charAt(0) == '"') {
		this._readString(o, tab);
	} else  {
		this._readText(o, tab, false);
	}
}
_JSON.prototype._readText = function(o, tab, all) {
	var special = "\"{}[],:\n\r";
	o.str = o.str.trim();
	for(var index = 0; index < o.str.length; index++) {
		var c = o.str.charAt(index);
		if (special.indexOf(c) !== -1){
			break;
		}
	}
	if (all && index == 0) {
		o.result = o.str.substring(0, 1);
		o.rest = o.str.substring(1);		
	} else {
		o.result = o.str.substring(0, index);
		o.rest = o.str.substring(index);
	}
}
	
_JSON.prototype._readString = function(o) {
	o.str = o.str.substring(1);
	var pos = o.str.indexOf('"');
	while (pos !== -1) {
		if (pos == 0 || o.str.charAt(pos-1) != "\\") {
			break;
		}
		pos = o.str.indexOf('"', pos + 1);
	}
	if (pos !== -1) {
		o.result = '"'+o.str.substring(0, pos+1); 
		o.rest = o.str.substring(pos + 1);
	} else {
		//a voir
		o.result = o.str;
		o.rest = "";
	}
}
_JSON.prototype._readNumeric = function(o) {
	o.str = o.str.trim();
	var index = 0;
	var numericChar = "0123456789";
	while (index <= o.str.length - 1 && numericChar.indexOf(o.str.charAt(index)) !== -1) {
		index++;
	}
	if (index <= o.str.length - 1 && o.str.charAt(index) == '.') {
		index++;
		while (index <= o.str.length - 1 && numericChar.indexOf(o.str.charAt(index)) !== -1) {
			index++;
		}
	}
	o.result = o.str.substring(0, index).trim(); 
	o.rest = o.str.substring(index);
}
_JSON.prototype._readElement = function(o, tab) {
	var numericChar = "0123456789";
	o.str = o.str.trim();
	if (o.str.charAt(0) == '{') {
		this._readObject(o, tab);
	}  else if (o.str.charAt(0) == '[') {
		this._readArray(o, tab);
	}  else if (o.str.charAt(0) == ']') {
		o.result = '';
		o.rest = o.str;
	} else if (o.str.charAt(0) == '"') {
		this._readString(o, tab);
	} else if (numericChar.indexOf(o.str.charAt(0)) !== -1) {
		this._readNumeric(o, tab);
	} else {
		this._readText(o, tab, true);
	}
}
_JSON.prototype._format = function(str, tab) {
	var result = '';
	var o = {str:str.trim()};
	while(true) {
		this._readElement(o, tab);
		result += o.result+ (tab == null ? '' : "\n");
		if (o.rest == '') {
			break;
		} else {
			o.str = o.rest;
		}
	}
	return result;
}

/*
[
	{a:1, b:2, c:3},
	{a:11, b:22, d:44}
]
*/
_JSON.prototype.json2csv = function(o) {
	var convert = {
		/*
		[
			{a:1, b:2, c:3},
			{a:11, b:22, d:44}
		]
		*/
		json2csv: function (o) {
			if (o instanceof Array) {
				return convert.array2csv(o);
			} else if (o instanceof Object) {
				return [convert.object2csv(o)];
			} else {
				// value ?
				var result = {};
				result[o] = o;
				return [result];
			}
		},		
		/*
		[
			{a:1, b:2, c:3},
			{a:11, b:22, d:44}
		]
		*/
		array2csv: function (arr) {
			var result = [];
			arr.forEach(function(elt) {
				if (elt instanceof Array) {
					var row = {};
					var arrSubElt= convert.array2csv(elt);
					arrSubElt.forEach(function (subelt, index) {
						for (var propertyName in subelt) {
							row[index+'/'+propertyName] = subelt[propertyName];
						}
					});
					result.push(row);
				} else if (elt instanceof Object) {
					result.push(convert.object2csv(elt));
				} else {
					var row = {};
					row[elt] = elt;
					result.push(row);
				}
			});
			return result;
		},
		/*
			{a:11, b:22, d:44}
		*/
		object2csv: function (o) {
			var result = {};
			for (var propertyName in o) {
				var property = o[propertyName];
				if (property instanceof Array) {
					var subarray = convert.array2csv(property);
					subarray.forEach(function (elt, index){
						for (var subpropertyName in elt) {
							result[propertyName+'/'+index+'/'+subpropertyName] = elt[subpropertyName];
						}
					}); 
				} else if (property instanceof Object) {
					var subObject = convert.object2csv(property);
					for (var subProperty in subObject) {
						result[propertyName+'/'+subProperty] = subObject[subProperty];
					}
				} else {
					result[propertyName] = property;
				}
			}
			return result;
		}
	};
	return convert.json2csv(o);
}

function DOM (services) {
	this.services = services;
}
DOM.prototype.selectItemByValue = function(element, value) {
	for(var i=0; i < element.options.length; i++)
	{
		if(element.options[i].value == value) {
			element.selectedIndex = i;
			break;
		}
	}
}

function Work (services) {
	this.services = services;
}
Work.prototype.executeUniq = function(myCodeMirror, callback, successMessage, errorMessage) {
	this.services.billboard.emptyAndHide(['editor-error', 'editor-valid']);
	var text = myCodeMirror.getValue("");
	try {
		var result = callback(text);
	} catch (e) {
		if (errorMessage) {
			this.services.billboard.setAndDisplay('editor-error', errorMessage);
		} else {
			this.services.billboard.setAndDisplay('editor-error', e.message);
			this.services.codeMirror.setLineInError(myCodeMirror, e);
		}
		return;
	}
	if (result && result.message) {
		this.services.billboard.setAndDisplay('editor-valid', result.message);
	} else {
		this.services.billboard.setAndDisplay('editor-valid', successMessage);
	}
}
Work.prototype.executeDuo = function(myCodeMirrorFrom, myCodeMirrorTo, callback, successMessage, errorMessage) {
	this.services.billboard.emptyAndHide(['editor-error', 'editor-valid']);
	var text = myCodeMirrorFrom.getValue("");
	myCodeMirrorTo.setValue("");
	try {
		var result = callback(text);
		myCodeMirrorTo.setValue(result);
	} catch (e) {
		if (errorMessage) {
			this.services.billboard.setAndDisplay('editor-error', errorMessage);
		} else {
			this.services.billboard.setAndDisplay('editor-error', e.message);
			this.services.codeMirror.setLineInError(myCodeMirrorFrom, e);
		}
		return;
	}
	this.services.billboard.setAndDisplay('editor-valid', successMessage);
}
function Billboard (services) {
	this.services = services;
}
Billboard.prototype.emptyAndHide = function(containerId) {
	var self = this;
	if (containerId instanceof Array) {
		containerId.forEach(function(id) {
			self.emptyAndHide(id);
		});
	} else {
		var containerError = (typeof containerId === 'string' ? document.getElementById(containerId) : containerId);
		if (containerError) {
			containerError.innerText = '';
			containerError.style.display = 'none';
		}
	}
}
Billboard.prototype.setAndDisplay = function(containerId, messageText) {
	var containerError = (typeof containerId === 'string' ? document.getElementById(containerId) : containerId);
	if (containerError && messageText) {
		containerError.innerText = messageText;
		containerError.style.display = '';
	}
}
function _CodeMirror (services) {
	this.services = services;
	this.errors = [];
}

_CodeMirror.prototype.create = function(textAreaId, options) {
	var myCodeMirror = CodeMirror.fromTextArea((typeof textAreaId === 'string' ? document.getElementById(textAreaId) : textAreaId), options);
	var self = this;
	myCodeMirror.on('change',function(cMirror){
	  self.resetError(myCodeMirror);
	});
	return myCodeMirror;
}
	
_CodeMirror.prototype.setLineInError = function(codeMirror, exception) {
	if (exception.message) {
		if (exception.message.indexOf('at position ') !== -1) {
			var charNumber = exception.message.substring(exception.message.indexOf('at position ') + 'at position '.length);
			var errorLine = (codeMirror.getValue("\n").substring(0, parseInt(charNumber)).match(/\n/g) || []).length;
			codeMirror.addLineClass(errorLine, "background", "CodeMirror-error");
			this.errors.push({codeMirror:codeMirror, line:errorLine});
		}
	}
}
_CodeMirror.prototype.resetError = function(codeMirror) {
	var errors = [];
	this.errors.forEach(function(errorObject) {
		if (errorObject.codeMirror === codeMirror) {
			codeMirror.removeLineClass(errorObject.line, "background", "CodeMirror-error");
			errors.push(errorObject);
		}
	});
	var self = this;
	errors.forEach(function(errorObject) {
		self.errors.splice(self.errors.indexOf(errorObject), 1);
	});
}


function File (services) {
	this.services = services;
}
var ReadModeEnum = {
  TEXT: 1,
  ARRAY_BUFFER: 2,
  DATA_URL: 3
};
File.prototype.dragAndDrop = function(dropZone, mode, callback, options) {
	if (dropZone) {
		dropZone.addEventListener('dragover', function(e) {
			try {
				e.stopPropagation();
				e.preventDefault();
				e.dataTransfer.dropEffect = 'copy';
			} catch(error) {
			
			}
		});
		dropZone.addEventListener('drop', function(e) {
			e.stopPropagation();
			e.preventDefault();
			if (mode) {
				services.file.readSingleFile(e, mode, function(data) {
					callback(data);
				}, options);
			} else {
				callback(e);
			}
		});
	}
}

File.prototype.readSingleFile = function(e, readAs, callback, options) {
	var files;
	if (e.target && e.target.files) {
		files = e.target.files;
	} else if (e.dataTransfer && e.dataTransfer.files) 
	{
		files = e.dataTransfer.files;
	}
	if (!files || files.length == 0) {
		callback(null);
		return;
	}
	if (options && options.group) {
		var filesList = files;
		var fullData = '';
		var iter = function () {
			var file = filesList.shift();
			if (file) {
				var reader = new FileReader();
				reader.onload = function() {
					fullData += reader.result;
					iter();
				};
				if (readAs === ReadModeEnum.ARRAY_BUFFER) reader.readAsArrayBuffer(file);
				else if (readAs === ReadModeEnum.DATA_URL) reader.readAsDataURL(file);
				else reader.readAsText(file);
			} else {
				callback(fullData);
			}
		};
		iter();
	} else {
		Array.prototype.forEach.call(files, function(file) { 
			var reader = new FileReader();
			reader.onload = function() {
				callback(reader.result, {file: file});
			};
			if (readAs === ReadModeEnum.ARRAY_BUFFER) reader.readAsArrayBuffer(file);
			else if (readAs === ReadModeEnum.DATA_URL) reader.readAsDataURL(file);
			else reader.readAsText(file);	
		});
	}
}

File.prototype.filename = function(fullPath) {
	var filename = '';
	if (fullPath) {
		var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
		filename = fullPath.substring(startIndex);
		if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
			filename = filename.substring(1);
		}
	}
	return filename;
}
File.prototype.sizeFormat = function(fileSizeInBytes) {
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

File.prototype.export = function(fileObject) {
	var blob = (fileObject.blob ? fileObject.blob : new Blob([fileObject.data], { type: fileObject.mime }));
	if (navigator.msSaveBlob) { // IE 10+
		navigator.msSaveBlob(blob, fileObject.filename);
	} else {
		var link = document.createElement("a");
		if (link.download !== undefined) { // feature detection
			// Browsers that support HTML5 download attribute
			var url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", fileObject.filename);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
}
	
function Http (services) {
	this.services = services;
}
Http.prototype.get = function(url, callback, callbackError, options) {
	if (options && options.remote) {
		options.remote = false;
		return this.post(myDomain + '/rest-client-request', JSON.stringify({method: 'GET', url: url, headers: [], body: ''}),
			function(responseText, response) {
				var responseObj = JSON.parse(responseText);
				responseObj.getAllResponseHeaders = function() {
					return responseObj.headers;
				};
				if (responseObj.status != 200) {
					callbackError(responseObj);
				} else {
					callback(responseObj.responseText, responseObj);
				}
			}, 
			function (res) {
				var responseObj = JSON.parse(responseText);
				callbackError(responseObj);
			}
		);
	}
	var xhr= new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.onreadystatechange= function() {
		if (this.readyState!==4) return;
		if (this.status!==200) {
			if (callbackError) {
				return callbackError(this);
			} else {
				alert('An error has occured.');
				return; // or whatever error handling you want
			}
		}
		callback((options && options.responseType && options.responseType == 'blob' ? this.response : this.responseText), this);
	};
	if (options && options.responseType) {
		xhr.responseType = options.responseType;
	}
	xhr.send();
} 
Http.prototype.post = function(url, data, callback, callbackError, options) {
	if (options && options.remote) {
		options.remote = false;
		return this.post(myDomain + '/rest-client-request', JSON.stringify({method: 'POST', url: url, headers: options.headers ? options.headers : [], body: data}),
			function(responseText, response) {
				var responseObj = JSON.parse(responseText);
				responseObj.getAllResponseHeaders = function() {
					return responseObj.headers;
				};
				if (responseObj.error) {
					responseObj.error = responseObj.error;
				}
				if (responseObj.status != 200) {
					callbackError(responseObj);
				} else {
					callback(responseObj.responseText, responseObj);
				}
			}, 
			function (res) {
				var responseObj = JSON.parse(responseText);
				callbackError(responseObj);
			}, 
			options);
	}
	var xhr= new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.onreadystatechange= function() {
		if (this.readyState!==4) return;
		if (this.status!==200) {
			if (callbackError) {
				return callbackError(this);
			} else {
				alert('An error has occured.');
				return; // or whatever error handling you want
			}
		}
		callback(this.responseText, this);
	};
	if (options && options.headers) {
		options.headers.forEach(function(header) {
			xhr.setRequestHeader(header.name, header.value);
		});
	}
	if (data) xhr.send(data);
	else xhr.send();
}
function Converter (services) {
	this.services = services;
}
Converter.prototype.atob = function(text) {
	return atob(text);
}
Converter.prototype.btoa = function(text) {
	return btoa(text);
}
Converter.prototype.json2xml = function(jsonText) {
	var xml = '';
	var shift = "";
	var self = this;
	var object = JSON.parse(jsonText);
	if (Object.keys(object).length === 0) {
		return "<root></root>";
	}
	if (Object.keys(object).length > 1 || (Object.keys(object).length === 1 && Array.isArray(object[Object.keys(object)[0]]))) {
		shift = shift+"\t";
		xml += "<root>\n";
	}
	Object.keys(object).forEach(function(property) {
		xml += self.object2xml(object[property], (Array.isArray(object) ? 'element' : property), shift);	
	});
	if (Object.keys(object).length > 1 || (Object.keys(object).length === 1 && Array.isArray(object[Object.keys(object)[0]]))) {
		xml += "\n</root>";	
	}
	return xml;
}
Converter.prototype.object2xml = function(property, name, shift) {
	var xml = "";
	var self = this;
	if (property instanceof Array) {
		property.forEach(function(element) {
			if (Array.isArray(element)) {
				xml += shift + "<"+name+">\n";
				xml += self.object2xml(element, name, shift+"\t");
				xml += shift + "</"+name+">\n";
			} else {
				xml += self.object2xml(element, name, shift);
			}			
		});
	}
	else if (typeof(property) == "object") {
		var hasChild = false;
		var hasText = false;
		
		xml += shift + "<" + name;
		if (property === null) {
			xml += "/>\n";
		} else {
			Object.keys(property).forEach(function(p) {
				if (p == "#text") {
					hasText = true;
				} else if (p.charAt(0) == "@") { // attribute
					xml += " " + p.substr(1) + "=\"" + property[p].toString().replace('<', '&lt;').replace('>', '&gt;').replace('&', '&amp;').replace('\'', '&apos;').replace('"', '&quot;') + "\"";
				} else {
					hasChild = true;
				}
			});
		
			xml += hasChild ? ">\n" : (hasText ? ">": "/>\n");
			if (hasChild || hasText) {
				var self = this;
				Object.keys(property).forEach(function(p) {
					if (p == "#text")
						xml += property[p].replace('<', '&lt;').replace('>', '&gt;').replace('&', '&amp;').replace('\'', '&apos;').replace('"', '&quot;');
					else if (p.charAt(0) != "@")
						xml += self.object2xml(property[p], p, shift+"\t");
				});
				xml += (xml.charAt(xml.length-1)=="\n"?shift:"") + "</" + name + ">\n";
			}
		}
	}
	else {
		xml += shift + "<" + name + ">" + property.toString().replace('<', '&lt;').replace('>', '&gt;').replace('&', '&amp;').replace('\'', '&apos;').replace('"', '&quot;') +  "</" + name + ">\n";
	}
	return xml;
}
Converter.prototype.xml2dom = function(xmlText) {
	var xml = (new DOMParser()).parseFromString(xmlText, "text/xml"); 
	var ua = window.navigator.userAgent;
 
    if (ua.indexOf("MSIE ") !== -1 || ua.indexOf("Trident") !== -1)
    {
		
	} else {
		var isParseError = function(parsedDocument) {
			// parser and parsererrorNS could be cached on startup for efficiency
			/*
			For ie:
			xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async=false;
			xmlDoc.loadXML(text);
			
			*/
			var parser = new DOMParser(),
				errorneousParse = parser.parseFromString('<', 'text/xml'),
				parsererrorNS = errorneousParse.getElementsByTagName("parsererror")[0].namespaceURI;
			if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
				// In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
				return parsedDocument.getElementsByTagName("parsererror").length > 0;
			}
			return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0;
		};
		if (isParseError(xml)) {
			throw new Error ('XML: Parse error');
		}
	}
	if (xml.nodeType == 9) {
		xml = xml.documentElement;
	}

	// var find = '	';
	// var re = new RegExp(find, 'g');
	return xml; // .replace(re, '');
}

Converter.prototype.xml2json = function(xmlText) {
	var xml = (new DOMParser()).parseFromString(xmlText, "text/xml"); 
	var ua = window.navigator.userAgent;
 
    if (ua.indexOf("MSIE ") !== -1 || ua.indexOf("Trident") !== -1)
    {
		
	} else {
		var isParseError = function(parsedDocument) {
			// parser and parsererrorNS could be cached on startup for efficiency
			/*
			For ie:
			xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async=false;
			xmlDoc.loadXML(text);
			
			*/
			var parser = new DOMParser(),
				errorneousParse = parser.parseFromString('<', 'text/xml'),
				parsererrorNS = errorneousParse.getElementsByTagName("parsererror")[0].namespaceURI;
			if (parsererrorNS === 'http://www.w3.org/1999/xhtml') {
				// In PhantomJS the parseerror element doesn't seem to have a special namespace, so we are just guessing here :(
				return parsedDocument.getElementsByTagName("parsererror").length > 0;
			}
			return parsedDocument.getElementsByTagNameNS(parsererrorNS, 'parsererror').length > 0;
		};
		if (isParseError(xml)) {
			throw new Error ('XML: Parse error');
		}
	}
	if (xml.nodeType == 9) {
		xml = xml.documentElement;
	}

	// var find = '	';
	// var re = new RegExp(find, 'g');
	return "{\n" + this.object2json(this.xml2Object(xml), xml.nodeName, "\t") + "\n}"; // .replace(re, '');
}
Converter.prototype.xml2Object = function(xml) {
	var result = {};
	this.removeWhiteSpace(xml);
	switch(xml.nodeType)
	{
		case 1:   // element
			if (xml.attributes.length) {  // node with attributes 
				for (var attribute=0; attribute<xml.attributes.length; attribute++) {
					result["@"+xml.attributes[attribute].nodeName] = (xml.attributes[attribute].nodeValue||"").toString();
				}
			}
			if (xml.firstChild) { // children 
				var nbText=0; 
				var nbcdata=0;
				var hasChild=false;
				var array = Array.prototype.slice.call(xml.childNodes);
				array.forEach(function(child) {
					switch(child.nodeType) {
						case 1: hasChild = true; break;
						case 3: if (child.nodeValue.match(/[^ \f\n\r\t\v]/)) {
									nbText++; // not full white
								}
								break;
						case 4: nbcdata++; break; // cdata section node
					}
				});
				if (hasChild) {
					if (nbText < 2 && nbcdata < 2) { // uniq element
						this.removeWhiteSpace(xml);
						for (var n=xml.firstChild; n; n=n.nextSibling) {
							if (n.nodeType == 3)  // text
							   result["#text"] = this.escape(n.nodeValue);
							else if (n.nodeType == 4)  // cdata node
							   result["#cdata"] = this.escape(n.nodeValue);
							else if (result[n.nodeName]) {  // elements
							   if (result[n.nodeName] instanceof Array)
								  result[n.nodeName][result[n.nodeName].length] = this.xml2Object(n);
							   else
								  result[n.nodeName] = [result[n.nodeName], this.xml2Object(n)];
							}
							else {
							   result[n.nodeName] = this.xml2Object(n);
							}
						}
					} else { // mixed content
						if (!xml.attributes.length)
							result = this.escape(this.innerTextNode(xml));
						else
							result["#text"] = this.escape(this.innerTextNode(xml));
					}
				} else if (nbText) { // text
					if (!xml.attributes.length) {
						result = this.escape(this.innerTextNode(xml));
					} else {
						result["#text"] = this.escape(this.innerTextNode(xml));
					}
				}
				else if (nbcdata) { // cdata
					if (nbcdata > 1)
						result = this.escape(this.innerTextNode(xml));
					else {
						for (var n=xml.firstChild; n; n=n.nextSibling) {
							result["#cdata"] = this.escape(n.nodeValue);
						}
					}
				}
			}
			if (!xml.attributes.length && !xml.firstChild) { // empty
				result = null; 
			}
			break;
		case 7: //ProcessingInstruction
		case 8: //comment
		case 10: //DocumentType 
			result = null;
			break;
		case 9: // document.node
			result = this.xml2Object(xml.documentElement);
			break;
		default:
			throw new Error('nodeType error');
	}
	return result;
}
Converter.prototype.object2json = function(object, name, ind) {
	var result = name ? ("\""+name+"\"") : "";
	if (object == null) {
		result += (name&&":") + "null";
	} else if (object instanceof Array) {
		for (var i=0,n=object.length; i<n; i++)
			object[i] = this.object2json(object[i], "", ind+"\t");
		result += (name?":[":"[") + (object.length > 1 ? ("\n"+ind+"\t"+object.join(",\n"+ind+"\t")+"\n"+ind) : object.join("")) + "]";
	}
	else if (typeof(object) == "object") {
		var arr = [];
		for (var m in object)
			arr[arr.length] = this.object2json(object[m], m, ind+"\t");
		result += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
	}
	else if (typeof(object) == "string")
		result += (name&&":") + "\"" + object.toString() + "\"";
	else //numeric
		result += (name&&":") + object.toString();
	return result;
}
Converter.prototype.innerTextNode = function(node) {
	var result = "";
	var child=node.firstChild;
	while (child) {
		if (child.nodeType == 3) {
			result += child.nodeValue;
		}
		child=child.nextSibling
	}
	return result;
}
Converter.prototype.escape = function(text) {
	return text.replace(/[\\]/g, "\\\\").replace(/[\"]/g, '\\"').replace(/[\n]/g, '\\n').replace(/[\r]/g, '\\r').replace(/^\s+|\s+$/gm,'');
}
Converter.prototype.removeWhiteSpace = function(element) {
	element.normalize();
	var child = element.firstChild
	while (child) {
		switch(child.nodeType) {
			case 1: // element		
					this.removeWhiteSpace(child);
					child = child.nextSibling;
				break;
			case 3: // text
					if (!child.nodeValue.match(/[^ \f\n\r\t\v]/)) { // full whitespace
						var toRemove = child;
						child = child.nextSibling;
						element.removeChild(toRemove);
					}
					else {
						child = child.nextSibling;
					}
				break;
			default: // other node
				child = child.nextSibling;
		}
	}
	return element;
}

services = new Services();

// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
     // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    }
  });
}

if (!Object.prototype.cloneObject) {
	Object.defineProperty(Object.prototype, 'cloneObject', {
		value: function(objToClone, call, parent) {
			if (!parent) {
				parent = null;
			}
			var clone = null;
			// primitive type or null / undefined
			if (objToClone === null || objToClone === undefined || typeof objToClone !== 'object') {
				clone = objToClone;
			} else if (objToClone instanceof Array) {
				// Array
				clone = [];
				objToClone.forEach(function(elt) {
					clone.push(Object.cloneObject(elt, call, parent));
				});
			} else {
				// Object
				clone = Object.create( Object.getPrototypeOf( objToClone ) ) ;
				Object.keys(objToClone).forEach(function(property) {
					if (objToClone.hasOwnProperty(property)) {
						var descriptor = Object.getOwnPropertyDescriptor( objToClone , property );
						if (descriptor.enumerable === true) {
							if (call == null || call(clone, objToClone, property, parent)) {
								clone[property] = Object.cloneObject(objToClone[property], call, clone);
							}
						}
					}
				});
			}
			return clone;
		}
	});
}

// lazy load https://bulledev.com/chargement-image-progressif-lazy-load/
!function(){function e(e){var t=0;if(e.offsetParent){do t+=e.offsetTop;while(e=e.offsetParent);return t}}var t=window.addEventListener||function(e,t){window.attachEvent("on"+e,t)},o=window.removeEventListener||function(e,t,o){window.detachEvent("on"+e,t)},n={cache:[],mobileScreenSize:500,addObservers:function(){t("scroll",n.throttledLoad),t("resize",n.throttledLoad)},removeObservers:function(){o("scroll",n.throttledLoad,!1),o("resize",n.throttledLoad,!1)},throttleTimer:(new Date).getTime(),throttledLoad:function(){var e=(new Date).getTime();e-n.throttleTimer>=200&&(n.throttleTimer=e,n.loadVisibleImages())},loadVisibleImages:function(){for(var t=window.pageYOffset||document.documentElement.scrollTop,o=window.innerHeight||document.documentElement.clientHeight,r={min:t-300,max:t+o+300},i=0;i<n.cache.length;){var a=n.cache[i],c=e(a),l=a.height||0;if(c>=r.min-l&&c<=r.max){var s=a.getAttribute("data-src-mobile");a.onload=function(){this.name="lazy-loaded"},s&&screen.width<=n.mobileScreenSize?a.src=s:a.src=a.getAttribute("data-src"),a.removeAttribute("data-src"),a.removeAttribute("data-src-mobile"),n.cache.splice(i,1)}else i++}0===n.cache.length&&n.removeObservers()},init:function(){document.querySelectorAll||(document.querySelectorAll=function(e){var t=document,o=t.documentElement.firstChild,n=t.createElement("STYLE");return o.appendChild(n),t.__qsaels=[],n.styleSheet.cssText=e+"{x:expression(document.__qsaels.push(this))}",window.scrollBy(0,0),t.__qsaels}),t("load",function e(){for(var t=document.querySelectorAll("img[data-src]"),r=0;r<t.length;r++){var i=t[r];n.cache.push(i)}n.addObservers(),n.loadVisibleImages(),o("load",e,!1)})}};n.init()}();



