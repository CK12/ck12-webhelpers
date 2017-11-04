export default {
	mathJaxConfig : {
		extensions: ["tex2jax.js","TeX/AMSmath.js","TeX/AMSsymbols.js"],
		tex2jax: {
			inlineMath: [["@$","@$"]],
			displayMath: [["@$$","@$$"]],
		},
		showMathMenu: false,
		jax: ["input/TeX","output/HTML-CSS"],
		messageStyle: "none",
		TeX: {
			extensions: ["cancel.js", "color.js", "autoload-all.js"]
		},
		"HTML-CSS": {
			scale: 85
		}
	}
};
