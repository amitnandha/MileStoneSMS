/*!
 * @copyright@
 */
sap.ui.define([],function(){"use strict";var N={};N.render=function(r,c){var v=c.getValue();var i=c.getIndicator();var s=c.getScale();var S=c.getState();var I=sap.m.DeviationIndicator.None!==i&&v!=="";var w=c.getWithMargin();var W;if(w){W="";}else{W="WithoutMargin";}if(c.getFormatterValue()){var f=c._parseFormattedValue(v);s=f.scale;v=f.value;}var b=s&&v;r.write("<div");r.writeControlData(c);var t=c.getTooltip_AsString();if(typeof t!=="string"){t="";}r.writeAttributeEscaped("aria-label",t);r.writeAttribute("role","image");if(S==sap.m.LoadState.Failed||S==sap.m.LoadState.Loading){r.writeAttribute("aria-disabled","true");}if(c.getAnimateTextChange()){r.addStyle("opacity","0.25");}if(c.getWidth()){r.addStyle("width",c.getWidth());}r.writeStyles();r.addClass("sapMNC");r.addClass(W);if(c.hasListeners("press")){r.writeAttribute("tabindex","0");r.addClass("sapMPointer");}r.writeClasses();r.write(">");r.write("<div");r.addClass("sapMNCInner");r.addClass(W);r.writeClasses();r.write(">");if(w){this._renderScaleAndIndicator(r,c,I,b,W,i,s);this._renderValue(r,c,W,v);}else{this._renderValue(r,c,W,v);this._renderScaleAndIndicator(r,c,I,b,W,i,s);}r.write("</div>");r.write("</div>");};N._prepareAndRenderIcon=function(r,c,i){if(i){var s,l=sap.m.LoadState,C=c.getState();for(s in l){if(l.hasOwnProperty(s)&&s!==C){i.removeStyleClass(s);}else if(l.hasOwnProperty(s)&&s===C){i.addStyleClass(s);}}i.addStyleClass("sapMNCIconImage");r.renderControl(i);}};N._renderScaleAndIndicator=function(r,c,i,a,w,t,b){if(i||a){var s=c.getState();var C=c.getValueColor();r.write("<div");r.addClass("sapMNCIndScale");r.addClass(w);r.addClass(s);r.writeClasses();r.write(">");r.write("<div");r.writeAttribute("id",c.getId()+"-indicator");r.addClass("sapMNCIndicator");r.addClass(t);r.addClass(s);r.addClass(C);r.writeClasses();r.write("/>");if(a){r.write("<div");r.writeAttribute("id",c.getId()+"-scale");r.addClass("sapMNCScale");r.addClass(s);r.addClass(C);r.writeClasses();r.write(">");r.writeEscaped(b.substring(0,3));r.write("</div>");}r.write("</div>");}};N._renderValue=function(r,c,w,v){var e;if(c.getNullifyValue()){e="0";}else{e="";}r.write("<div");r.writeAttribute("id",c.getId()+"-value");r.addClass("sapMNCValue");r.addClass(w);r.addClass(c.getValueColor());r.addClass(c.getState());r.writeClasses();r.write(">");r.write("<div");r.writeAttribute("id",c.getId()+"-value-scr");r.addClass("sapMNCValueScr");r.addClass(w);r.writeClasses();r.write(">");this._prepareAndRenderIcon(r,c,c._oIcon);var C=c.getTruncateValueTo();if(v.length>=C&&(v[C-1]==="."||v[C-1]===",")){r.writeEscaped(v.substring(0,C-1));}else{if(v){r.writeEscaped(v.substring(0,C));}else{r.writeEscaped(e);}}r.write("</div>");r.write("</div>");};return N;},true);
