'use strict';

hljs.configure({
    tabReplace: '    '
});

let keybindings = {
	tab: {
    	key: 9,
    	handler: function(range) {
 			this.quill.insertText(range.index, '    ');
			return false;
    	}
  	},
	'indent code-block': null,
	'outdent code-block': null,
	'code exit': null,
	'embed left': null,
	'embed right': null,
	'embed left shift': null,
	'embed right shift': null,
	'list autofill': null
};

Quill.register('modules/markup', Markup);

let quill = new Quill('#editor', {
	clipboard: true,
	modules: {
		history: {
      		delay: 2000,
      		maxStack: 500,
      		userOnly: true
    	},
		keyboard: {
		    bindings: keybindings
		},
		markup: {
			followLinks: true,
			onChange: (text) => {
				// console.log(`Changing text: ${text}`);
			},
			onClick: (pos) => {
				console.log(`clicked pos: ${pos}`);
			},
			onClickLink: (link) => {
				console.log(`clicked link: ${link.text}`);
			}
		},
		syntax: {
			delay: 100
		},
		toolbar: null
	},
	theme: 'snow'
});

let markup = quill.getModule('markup');
markup.set({
	custom: {
		background: 'black',
		foreground: 'white'
	},
	mode: MarkupMode.markdown
});

document.getElementById("refresh-button").onclick = (e) => {
	markup.refresh();
}

document.getElementById("font").onchange = (e) => {
	markup.setFont(e.target.value);
}

document.getElementById("fontsize").onchange = (e) => {
	markup.setFontSize(e.target.value);
}

document.getElementById("bold-button").onclick = (e) => {
	markup.setBold();
}

document.getElementById("italic-button").onclick = (e) => {
	markup.setItalic();
}

document.getElementById("underline-button").onclick = (e) => {
	markup.setUnderline();
}

document.getElementById("strike-button").onclick = (e) => {
	markup.setStrikeThrough();
}

document.getElementById("headerlevel").onchange = (e) => {
	markup.setHeader(e.target.value);

	let elements = e.target.selectedOptions;
    for(var i = 0; i < elements.length; i++){
      elements[i].selected = false;
    }
}

document.getElementById("undo-button").onclick = (e) => {
	markup.undo();
}

document.getElementById("redo-button").onclick = (e) => {
	markup.redo();
}

document.getElementById("mode").onchange = (e) => {
	markup.setMode(e.target.value);
}

document.getElementById("highlight").onchange = (e) => {
	markup.setHighlight(e.target.value);
}
