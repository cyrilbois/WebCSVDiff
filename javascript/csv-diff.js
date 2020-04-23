resultToDraw = {json1: '', json2: '', colorLine: [], stepDiff: [], currentLine: 0, tab: ''};			

myCodeMirrorText1 = null;
myCodeMirrorText2 = null;

diffText = '';

var DiffStatus = {
  SAME: 0,
  ONLY1: 1,
  ONLY2: 2,
  DIFFERENT: 3
};

currentEditor = null;
dialogLoadFromURL = null;

var resultContainer = document.getElementById('result-csv-diff');
var separatorSelect = document.getElementById('separatorRow');	
var quoteSelect = document.getElementById('quoteRow');	
var escapeSelect = document.getElementById('escapeRow');	

var Compare = {
  ONLY1: 1,
  ONLY2: 2,
};

function onChangeText() {
	var separator = separatorSelect.value;
	var quoteChar = quoteSelect.value;
	var escapeChar = escapeSelect.value;
	function getColumns(line) {
		var result = [];
		var fusion = false;
		var columns = line.split(separator);
		for (var iColumn = 0; iColumn < columns.length; iColumn++) {
			fusion = false;
			var dataColumn = columns[iColumn];
			if (dataColumn.length) {
				if (dataColumn[0] == quoteChar) {
					if (dataColumn.length >= 2) {
						if (dataColumn[dataColumn.length - 1] !== quoteChar) {
							fusion = true;
						} else {
							if (dataColumn.length > 2) {
								if (dataColumn[dataColumn.length - 2] === escapeChar) {
									fusion = true;
								}
							}
						}
					} else {
						fusion = true;
					}
				}
			}
			if (fusion && iColumn !== columns.length - 1) {
				columns[iColumn+1] = dataColumn + separator + columns[iColumn+1];
			} else {
				result.push(dataColumn);
			}
		}
		return result;
	}
	function newLine(cLine) {
		var line = document.createElement('div');
		resultContainer.appendChild(line);
		line.classList.add('csv-diff-line');
		
		if (cLine) {
			var column = document.createElement('div');
			column.classList.add('csv-diff-column');
			column.appendChild(document.createTextNode("Line " + cLine));
			line.appendChild(column);
		}
		return line;
	}
	function newColumn(line, column1, column2, error) {
		var txt = '';
		var column = document.createElement('div');
		line.appendChild(column);
		column.classList.add('csv-diff-column');
		if (error === Compare.ONLY1) {
			column.classList.add('csv-diff-column-only-line1');
		} else if (error === Compare.ONLY2) {
			column.classList.add('csv-diff-column-only-line2');
		}
		if (column1 === null && column2 === null) {
			txt = "";
		} else if (column1 === null) {
			column.classList.add('csv-diff-column-only-column2');
			txt = " != "+column2;
		} else if (column2 === null) {
			column.classList.add('csv-diff-column-only-column1');
			txt = column1 + " != ";
		} else if (column1 === column2) {
			column.classList.add('csv-diff-column-equals');
			txt = column1;
		} else {
			column.classList.add('csv-diff-column-different');
			txt = column1 + " != " + column2;
		}
		column.appendChild(document.createTextNode(txt));
		diffText += txt;
		return line;
	}
	diffText = '';
	emptyAndHide(['editor-error1', 'editor-valid1']);
	emptyAndHide(['editor-error2', 'editor-valid2']);
	var text1 = myCodeMirrorText1.getValue("\n");
	var text2 = myCodeMirrorText2.getValue("\n");
	var textByLine1 = text1.split(/\r?\n/);
	var textByLine2 = text2.split(/\r?\n/);
	while(resultContainer.firstChild) resultContainer.removeChild(resultContainer.firstChild);
	var cLine = 0;
	var maxColumn = 0;
	textByLine1.forEach(function (line, indexLine) {
		if ((getColumns(line)).length > maxColumn) {
			maxColumn = (getColumns(line)).length;
		}
	});
	textByLine2.forEach(function (line, indexLine) {
		if ((getColumns(line)).length > maxColumn) {
			maxColumn = (getColumns(line)).length;
		}
	});
	var line = newLine();
	for (var i = 0; i <= maxColumn; i++) {
		var column = document.createElement('div');
		column.classList.add('csv-diff-column');
		if (i > 0) {
			column.appendChild(document.createTextNode("Field " + i));
		}
		line.appendChild(column);
	}
	textByLine1.forEach(function (line1, indexLine) {
		cLine++;
		var line = newLine(cLine);
		var textByColumn1 = (getColumns(line1));
		if (textByLine2.length > indexLine) {
			var line2 = textByLine2[indexLine];
			var textByColumn2 = getColumns(line2);
			textByColumn1.forEach(function (column1, indexColumn) {
				if (textByColumn2.length > indexColumn) {
					var column2 = textByColumn2[indexColumn];
					newColumn(line, column1, column2);
				} else {
					newColumn(line, column1, null);
				}
				if (textByColumn1.length != indexColumn + 1) {
					diffText += separator;
				}
			});
			textByColumn2.forEach(function (column2, index) {
				if (index >= textByColumn1.length) {
					diffText += separator;
					newColumn(line, null, column2);
				}
			});
			for (var i = Math.max(textByColumn1.length, textByColumn2.length) ; i < maxColumn ; i++) {
				diffText += separator;
				newColumn(line, null, null);
			}
		} else {
			textByColumn1.forEach(function (column1, indexColumn) {
				if (indexColumn !== 0) {
					diffText += separator;
				}
				newColumn(line, column1, null, Compare.ONLY1);
			});
			for (var i = textByColumn1.length; i < maxColumn ; i++) {
				diffText += separator;
				newColumn(line, null, null);
			}
		}
		if (textByLine1.length != indexLine + 1) {
			diffText += "\n";
		}
	});
	textByLine2.forEach(function (line2, index) {
		if (index >= textByLine1.length) {
			diffText += "\n";
			cLine++;
			var line = newLine(cLine);
			var textByColumn2 = getColumns(line2);
			textByColumn2.forEach(function (column2, index) {
				newColumn(line, null, column2, Compare.ONLY2);
				if (textByColumn2.length != index + 1) {
					diffText += separator;
				}
			});
			for (var i = textByColumn2.length; i < maxColumn ; i++) {
				diffText += separator;
				newColumn(line, null, null);
			}
		}
	});
	resultContainer.appendChild(document.createElement('br'));
	resultContainer.appendChild(document.createElement('br'));
}

function copyToClipBoard (text) {
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
function readSingleFile(e, callback) {
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
	Array.prototype.forEach.call(files, function(file) { 
		var reader = new FileReader();
		reader.onload = function() {
			callback(reader.result, {file: file});
		};
		reader.readAsText(file);	
	});
}
function dragAndDrop (dropZone, callback, options) {
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
				readSingleFile(e, function(data) {
					callback(data);
				}, options);
			} else {
				callback(e);
			}
		});
	}
}
function exportDiff(fileObject) {
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
function emptyAndHide (containerId) {
	if (containerId instanceof Array) {
		containerId.forEach(function(id) {
			emptyAndHide(id);
		});
	} else {
		var containerError = (typeof containerId === 'string' ? document.getElementById(containerId) : containerId);
		if (containerError) {
			containerError.innerText = '';
			containerError.style.display = 'none';
		}
	}
}

document.getElementById('file-input-text').addEventListener('change', function(e) {
	readSingleFile(e, function(data) {
		myCodeMirrorText1.setValue(data);
		document.getElementById('file-input-text').value = '';
	});
}, false);

document.getElementById('file-input-text-2').addEventListener('change', function(e) {
	readSingleFile(e, function(data) {
		myCodeMirrorText2.setValue(data);  
		document.getElementById('file-input-text-2').value = '';
	});
}, false);



function displayLoadURLDialog(editor)
{
	currentEditor = editor;
	dialogLoadFromURL.show();
	document.getElementById("url").focus();
}
function get (url, callback, callbackError, options) {
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
function loadFromURL(callback)
{
	var editor = currentEditor;
	var url = document.getElementById('url').value;
	get(url, 
		function (data) {
			if (editor && data)
			{
				editor.setValue(data);
			}
			dialogLoadFromURL.hide();
			if (callback) callback();
		}, function () {
		}
	);
}

function loadURL(callback) {
	var url = new URL(window.location.href);
	var url1 = url.searchParams.get("url1");
	var url2 = url.searchParams.get("url2");
	var nbUrlToLoad = 0;
	if (url1 && url1.length) nbUrlToLoad++;
	if (url2 && url2.length) nbUrlToLoad++;
	if (nbUrlToLoad == 0) {
		return callback();
	}
	if (url1 && url1.length) {
		currentEditor = myCodeMirrorText1;
		document.getElementById('url').value = url1;
		loadFromURL(function () {
			nbUrlToLoad--;
			if (nbUrlToLoad == 0) {
				callback();
			}
		});
	}
	if (url2 && url2.length) {
		currentEditor = myCodeMirrorText2;
		document.getElementById('url').value = url2;
		loadFromURL(function () {
			nbUrlToLoad--;
			if (nbUrlToLoad == 0) {
				callback();
			}
		});
	}
}


window.addEventListener('load', function () {		
	myCodeMirrorText1 = CodeMirror.fromTextArea(document.getElementById('editor-container-text'), { lineNumbers: true, viewportMargin: Infinity});
	myCodeMirrorText2 = CodeMirror.fromTextArea(document.getElementById('editor-container-text-2'), { lineNumbers: true, viewportMargin: Infinity});
	
	dragAndDrop(document.getElementById('dropZone'), function(data) {
		if (data) myCodeMirrorText1.setValue(data);
	});
	dragAndDrop(document.getElementById('dropZone2'), function(data) {
		if (data) myCodeMirrorText2.setValue(data);
	});
	separatorSelect.addEventListener('change', function () {
		onChangeText();
	});
	quoteSelect.addEventListener('change', function () {
		onChangeText();
	});
	escapeSelect.addEventListener('change', function () {
		onChangeText();
	});
	
	document.getElementById('copy-diff').addEventListener("click", function() {
		copyToClipBoard(diffText);	
	});
	document.getElementById('download-diff').addEventListener('click', function(e) {
		exportDiff({data: diffText, filename: "file.csv", mime: 'text/plain'}); 
	}, false);
	
	
	dialogLoadFromURL = new A11yDialog(document.getElementById('dialog-load-from-url'));
	
	loadURL(function () {
		myCodeMirrorText1.on("change", onChangeText);
		myCodeMirrorText2.on("change", onChangeText);
		setTimeout(function () {
			onChangeText();
		}, 10);
	});
}, true);
