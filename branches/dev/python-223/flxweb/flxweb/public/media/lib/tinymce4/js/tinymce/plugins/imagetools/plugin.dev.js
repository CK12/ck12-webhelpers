/**
 * Inline development version. Only to be used while developing since it uses document.write to load scripts.
 */

/*jshint smarttabs:true, undef:true, latedef:true, curly:true, bitwise:true, camelcase:true */
/*globals $code */

(function(exports) {
	"use strict";

	var html = "", baseDir;
	var modules = {}, exposedModules = [], moduleCount = 0;

	var scripts = document.getElementsByTagName('script');
	for (var i = 0; i < scripts.length; i++) {
		var src = scripts[i].src;

		if (src.indexOf('/plugin.dev.js') != -1) {
			baseDir = src.substring(0, src.lastIndexOf('/'));
		}
	}

	function require(ids, callback) {
		var module, defs = [];

		for (var i = 0; i < ids.length; ++i) {
			module = modules[ids[i]] || resolve(ids[i]);
			if (!module) {
				throw 'module definition dependecy not found: ' + ids[i];
			}

			defs.push(module);
		}

		callback.apply(null, defs);
	}

	function resolve(id) {
		if (exports.privateModules && id in exports.privateModules) {
			return;
		}

		var target = exports;
		var fragments = id.split(/[.\/]/);

		for (var fi = 0; fi < fragments.length; ++fi) {
			if (!target[fragments[fi]]) {
				return;
			}

			target = target[fragments[fi]];
		}

		return target;
	}

	function register(id) {
		var target = exports;
		var fragments = id.split(/[.\/]/);

		for (var fi = 0; fi < fragments.length - 1; ++fi) {
			if (target[fragments[fi]] === undefined) {
				target[fragments[fi]] = {};
			}

			target = target[fragments[fi]];
		}

		target[fragments[fragments.length - 1]] = modules[id];
	}

	function define(id, dependencies, definition) {
		var privateModules, i;

		if (typeof id !== 'string') {
			throw 'invalid module definition, module id must be defined and be a string';
		}

		if (dependencies === undefined) {
			throw 'invalid module definition, dependencies must be specified';
		}

		if (definition === undefined) {
			throw 'invalid module definition, definition function must be specified';
		}

		require(dependencies, function() {
			modules[id] = definition.apply(null, arguments);
		});

		if (--moduleCount === 0) {
			for (i = 0; i < exposedModules.length; i++) {
				register(exposedModules[i]);
			}
		}

		// Expose private modules for unit tests
		if (exports.AMDLC_TESTS) {
			privateModules = exports.privateModules || {};

			for (id in modules) {
				privateModules[id] = modules[id];
			}

			for (i = 0; i < exposedModules.length; i++) {
				delete privateModules[exposedModules[i]];
			}

			exports.privateModules = privateModules;
		}

	}

	function expose(ids) {
		exposedModules = ids;
	}

	function writeScripts() {
		document.write(html);
	}

	function load(path) {
		html += '<script type="text/javascript" src="' + baseDir + '/' + path + '"></script>\n';
		moduleCount++;
	}

	// Expose globally
	exports.define = define;
	exports.require = require;

	expose(["tinymce/imagetoolsplugin/Canvas","tinymce/imagetoolsplugin/Mime","tinymce/imagetoolsplugin/ImageSize","tinymce/imagetoolsplugin/Conversions","tinymce/imagetoolsplugin/ImageTools","tinymce/imagetoolsplugin/CropRect","tinymce/imagetoolsplugin/ImagePanel","tinymce/imagetoolsplugin/ColorMatrix","tinymce/imagetoolsplugin/Filters","tinymce/imagetoolsplugin/UndoStack","tinymce/imagetoolsplugin/Dialog","tinymce/imagetoolsplugin/Plugin"]);

	load('classes/Canvas.js');
	load('classes/Mime.js');
	load('classes/ImageSize.js');
	load('classes/Conversions.js');
	load('classes/ImageTools.js');
	load('classes/CropRect.js');
	load('classes/ImagePanel.js');
	load('classes/ColorMatrix.js');
	load('classes/Filters.js');
	load('classes/UndoStack.js');
	load('classes/Dialog.js');
	load('classes/Plugin.js');

	writeScripts();
})(this);

// $hash: 88e48bf076a842d400340094e41cf438