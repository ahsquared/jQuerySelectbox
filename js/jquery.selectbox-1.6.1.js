/*
 * jQuery selectbox plugin
 *
 * Software License Agreement (BSD License)
 * see license.txt
 *
 * Copyright (c) 2011, Andre Hayter (ahsquared.com)
 * All rights reserved.
 *
 * 
 * The code is inspired from Sadri Sahraoui (brainfault.com) selectbox plugin
 * which in turn was inspired by Autocomplete plugin (http://www.dyve.net/jquery/?autocomplete)
 *
 * Revision: $Id$
 * Version: 1.6.1
 * 
 * Changelog :
 *  Version 1.6 by Andre Hayter
 *  - refactored, options changed to make sense, made default state easier to use
 *  Version 1.5 by Andre Hayter
 *  - added a check to see if the replacement has already been done. So that if the page is refreshed to enable another select box 
 *    according to the first one it will not recreate the select boxes.\
 *  Version 1.4 by Andre Hayter
 *  - added selectedIndex to the options
 *  Version 1.3 by Andre Hayter
 *  - added support for wrapping the selectbox to allow rounded corners etc...
 *  - fixed scroll issues with IE6, 7, 8
 *  - fixed issues with zindex and IE6
 *  - fixed maxHeight calculation when hidden - in a lightbox for example
 *  Version 1.0 by Andre Hayter
 */
 /* global jQuery
 */
jQuery.fn.extend({
	selectbox: function(options) {
		return this.each(function(index) {
			jQuery.SelectBox(this, options, index);
		});
	}
});


/* pawel maziarz: work around for ie logging */
if (!window.console) {
	var console = {
		log: function(msg) { 
		}
	};
}
/* */

jQuery.SelectBox = function(selectobj, options, index) {
	
	var opt = options || {};
	opt.selectorType = opt.selectorType || "id";
	opt.inputType = opt.inputType || "span";
	opt.simple = opt.simple || true;
	opt.wrapper = opt.wrapper || "select_wrapper";
	opt.input = opt.input || "selectbox";
	opt.dropdownWrapper = opt.dropdownWrapper || "dd_wrapper";
	opt.dropdownWrapperTop = opt.dropdownWrapperTop || "dd_wrapper_top";	
	opt.dropdownWrapperBottom = opt.dropdownWrapperBottom || "dd_wrapper_bottom";	
	opt.zIndex = (opt.zIndex - index) || (1000 - index);
	opt.current = opt.current || "dd_current";
	opt.selected = opt.selected || "dd_selected";
	opt.group = opt.group || "dd_group"; //css class for group
	opt.maxHeight = opt.maxHeight || 110; // max height of dropdown list
	opt.noLooping = opt.noLooping || false; // to remove the step in list moves loop
	opt.selBoxIndex = opt.selBoxIndex || getCurrentSelected(); // set which item to show by default
	opt.onChangeCallback = opt.onChangeCallback || false;
	opt.onChangeParams = opt.onChangeParams || false;
	opt.debug = opt.debug || false;
	
	var elm_id = selectobj.id;
	// check to see if it has already been created in case of AJAX refresh
	var elmCheck = $('#' + elm_id + '_wrapper')[0];
	if (elmCheck) {
		$('#' + elm_id + '_wrapper').remove();
	}	
	var active = -1;
	var inFocus = false;
	var heightCalculated = false;
	var widthCalculated = false;
	var ddWrapperBottomOffset = 0;
	var hasfocus = 0;
	var contFocus = false;

		//jquery object for select element
	var $select = jQuery(selectobj);
	if (!opt.simple) {
		// jquery ddWrapper top object
		var $ddWrapperTop = setupDdWrapperTop(opt);
		// jquery ddWrapper bottom object
		var $ddWrapperBottom = setupDdWrapperBottom(opt);
	}
	// jquery ddWrapper object
	var $ddWrapper = setupDdWrapper(opt);
	// jquery selectWrapper for all the replacement objects
	var $selectWrapper = setupSelectWrapper(opt);
	// jquery inner ddWrapper object
	var $listContainer = setupListContainer(opt);
	//jquery input object 
	var $input = setupInput(opt);
	// hide select and append newly created elements
	$select.hide().before($selectWrapper);
	if (opt.simple) {
		$selectWrapper.append($input).append($ddWrapper);
	} else {
		$selectWrapper.append($input).append($ddWrapperTop).append($ddWrapper).append($ddWrapperBottom);
	}
	$ddWrapper.append($listContainer);

	init(opt);
	
	$input
	.click(function(){
		if (!inFocus) {
			$ddWrapper.toggle();
			if (!opt.simple) {
				$ddWrapperTop.toggle();
				$ddWrapperBottom.toggle();
			}
		}
	})
	.focus(function(){
		if ($ddWrapper.not(':visible')) {
			inFocus = true;
			$ddWrapper.show();
			setHeight();
			setWidth();
			if (!opt.simple) {
				$ddWrapperTop.show();
				$ddWrapperBottom.show();
			}
		}
	})
	.keydown(function(event) {	   
		switch(event.keyCode) {
			case 38: // up
				event.preventDefault();
				moveSelect(-1);
				break;
			case 40: // down
				event.preventDefault();
				moveSelect(1);
				break;
			//case 9:  // tab 
			case 13: // return
				event.preventDefault(); // seems not working in mac !
				$('li.'+opt.current).trigger('click');
				break;
			case 27: //escape
			  hideMe();
			  break;
		}
	})
	.blur(function() {
		// if mouse still in container don't fire blur
		// to prevent IE firing blur when click on scrollbar
		if (!contFocus) {
		  hideMe();
		} else {
		  $(this).focus();
		}
	});
	
	$selectWrapper.mouseenter(function () {
		contFocus = true;
	});
	$selectWrapper.mouseleave(function () {
		contFocus = false;
		//hideMe();
	});

	
	function hideMe() { 
		hasfocus = 0;
		inFocus = false;
		contFocus = false;
		$ddWrapper.hide(); 
		if (!opt.simple) {
			$ddWrapperTop.hide();
			$ddWrapperBottom.hide();
		}
	}
	
	function setWidth() {
		if(!widthCalculated) {
			var wd = $input.outerWidth();
			//console.log(wd);
			if (!opt.simple) {
				$ddWrapperTop.css('width', wd);
				$ddWrapperBottom.css('width', wd);
			}
			widthCalculated = true;
		}
	}
	
	function setHeight() {
		if(!heightCalculated) {
			var iContHt = $listContainer.height();
			if(iContHt > opt.maxHeight) {
				$ddWrapper.height(opt.maxHeight);
				if (!opt.simple) {
					var t = $ddWrapperTop.outerHeight();
					//console.log(t);
					var iH = $input.outerHeight();
					$ddWrapper.css({
						'top': (t + iH)
					});
				}
				var iH = $input.outerHeight();
				$ddWrapper.css({
					'top': iH
				});
				$listContainer.height(opt.maxHeight);
				var w = jQuery("ul", $listContainer).css('width');
				jQuery("ul", $listContainer).css('width', parseInt(w, 10)-5);
			} else {
				$ddWrapper.height(iContHt);
			}
			heightCalculated = true;
			// create the offset for the ddWrapper bottom and fix it for IE6
			if(jQuery.browser.msie && jQuery.browser.version.substr(0,1) < 7) {
				ddWrapperBottomOffset = parseInt($ddWrapper.outerHeight(), 10) + parseInt($ddWrapper.css('top'), 10) + parseInt($ddWrapper.css('padding-top'), 10) - 4;
			} else {
				ddWrapperBottomOffset = parseInt($ddWrapper.outerHeight(), 10) + parseInt($ddWrapper.css('top'), 10) + parseInt($ddWrapper.css('padding-top'),10);
			}
			if (!opt.simple) {
				$ddWrapperBottom.css('top', ddWrapperBottomOffset);
			}
		}
	}
	
	function init(options) {
		$listContainer.append(getSelectOptions($input.attr(options.selectorType)));
		$ddWrapper.parent().css('zIndex', options.zIndex);
		var wd = $input.outerWidth();
		$ddWrapper.width(wd);
	}
	
	function setupDdWrapper(options) {
		var ddWrapper = document.createElement("div");
		$ddWrapper = jQuery(ddWrapper);
		$ddWrapper.attr('id', elm_id+'_dd_wrapper');
		$ddWrapper.addClass(options.dropdownWrapper);
		$ddWrapper.css({
			'display': 'none'
		});
		return $ddWrapper;
	}
	function setupDdWrapperTop(options) {
		var ddWrapperTop = document.createElement("div");
		$ddWrapperTop = jQuery(ddWrapperTop);
		$ddWrapperTop.attr('id', elm_id+'_dd_wrapper_top');
		$ddWrapperTop.addClass(options.dropdownWrapperTop);
		$ddWrapperTop.css('display', 'none');
		return $ddWrapperTop;
	}
	function setupDdWrapperBottom(options) {
		var ddWrapperBottom = document.createElement("div");
		$ddWrapperBottom = jQuery(ddWrapperBottom);
		$ddWrapperBottom.attr('id', elm_id+'_dd_wrapper_bottom');
		$ddWrapperBottom.addClass(options.dropdownWrapperBottom);
		$ddWrapperBottom.css('display', 'none');
		return $ddWrapperBottom;
	}
	
	function setupSelectWrapper(options) {
		var selectWrapper = document.createElement("div");
		$selectWrapper = jQuery(selectWrapper);
		$selectWrapper.attr('id', elm_id + '_select_wrapper');
		$selectWrapper.addClass(options.wrapper);
		return $selectWrapper;
	}

	function setupListContainer(options) {
		var listContainer = document.createElement("div");
		$listContainer = jQuery(listContainer);
		$listContainer.attr('id', elm_id+'_list_container');		
		$listContainer.addClass('dd_list_container');
		return $listContainer;
	}
	function setupInput(options) {
		if(opt.inputType == "span"){
			var input = document.createElement("span");
			var $input = jQuery(input);
			$input.attr("id", elm_id+"_input");
			$input.addClass(options.input);
			$input.attr("tabIndex", $select.attr("tabindex"));
			$input.html($select.children().eq(options.selBoxIndex).html());
		} else {
			var input = document.createElement("input");
			var $input = jQuery(input);
			$input.attr("id", elm_id+"_input");
			$input.attr("type", "text");
			$input.addClass(options.input);
			$input.attr("autocomplete", "off");
			$input.attr("readonly", "readonly");
			$input.attr("tabIndex", $select.attr("tabindex")); // "I" capital is important for ie
			$input.css("width", $select.css("width"));
    }
		return $input;	
	}
	
	function moveSelect(step) {
		var lis = jQuery("li", $listContainer);
		if (!lis || lis.length === 0) {
			return false;
		}
		// find the first non-group (first option)
		firstchoice = 0;
		active += step;
		while($(lis[firstchoice]).hasClass(opt.group)) { 
			firstchoice++;
		}
		// if we are on a group step one more time
		if ($(lis[active]).hasClass(opt.group)) {
			active += step;
		}
		//loop through list from the first possible option unless noLooping is true
		// in which case stop at the ends
		if (active < firstchoice) {
			(opt.noLooping ? active = 0 : active = lis.size() - 1);
		} else if (active > lis.size() - 1) {
			(opt.noLooping ? active = lis.size() - 1 : active = 0);
		}
		//if (opt.debug) console.log("active: " + active);
    scroll(lis, active);
		lis.removeClass(opt.current);
		jQuery(lis[active]).addClass(opt.current);
	}
	
	function scroll(list, active) {
		var el = jQuery(list[active]).get(0);
		//if (opt.debug) console.log(el + ", active: " + active);
		var list = $listContainer.get(0);
		if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) {
			list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight; 
			//if (opt.debug) console.log("list.scrollTop: " + list.scrollTop + ", active: " + active);
		} else if(el.offsetTop < list.scrollTop) {
			list.scrollTop = el.offsetTop;
		}
	}
	
	function setCurrent() {	
		var li = jQuery("li."+opt.selected, $listContainer).get(0);
		var ar = (''+li.id).split('_');
		var el = ar[ar.length-1];
		if (opt.onChangeCallback ){
			$select.get(0).selectedIndex = $('li', $listContainer).index(li);
			opt.onChangeParams = { selectedVal : $select.val() };
			opt.onChangeCallback(opt.onChangeParams);
		} else {
			$select.val(el);
			$select.change();
		}
		if(opt.inputType == 'span') {
			$input.html($(li).html());
		} else {
			$input.val($(li).html());
		}
		return true;
	}
	
	// select value
	function getCurrentSelected() {
		var s = 0;
		$(selectobj).children().each( function (index) {
				if ($(this).attr('selected')) {
						s = index;
				}
		});    
		return s;
	}
	
	// input value
	function getCurrentValue() {
		return $input.val();
	}

	function getSelectOptions(parentid) {
		var select_options = [];
		var ul = document.createElement('ul');
		select_options = $select.children('option');
		if(select_options.length === 0) {
			//alert('there are optgroups');
			var select_optgroups = [];
			select_optgroups = $select.children('optgroup');
			for(x=0;x<select_optgroups.length;x++){
				select_options = $("#"+select_optgroups[x].id).children('option');
				var li = document.createElement('li');
				li.setAttribute('id', parentid + '_' + $(this).val());
				li.innerHTML = $("#"+select_optgroups[x].id).attr('label');
				li.className = opt.group;
				ul.appendChild(li);
				select_options.each(function() {
					var li = document.createElement('li');
					li.setAttribute('id', parentid + '_' + $(this).val());
					li.innerHTML = $(this).html();
					if ($(this).is(':selected')) {
						$input.html($(this).html());
						$(li).addClass(opt.selected);
					}
					ul.appendChild(li);
					$(li)
					.mouseover(function(event) {
						hasfocus = 1;
						if (opt.debug) {
							//console.log('over on : '+this.id);
						}
						jQuery(event.target, $ddWrapper).addClass(opt.current);
					})
					.mouseout(function(event) {
						hasfocus = -1;
						if (opt.debug) {
							//console.log('out on : '+this.id);
						}
						jQuery(event.target, $ddWrapper).removeClass(opt.current);
					})
					.click(function(event) {
						//alert("clicked");
						//var fl = $('li.'+opt.current, $ddWrapper).get(0);
						if (opt.debug) {
							//console.log('click on :'+this.id);
						}
						$('li.'+opt.selected, $ddWrapper).removeClass(opt.selected); 
						$(this).addClass(opt.selected);
						setCurrent();
						$select.get(0).blur();
						hideMe();
					});
				});
			}
		} else select_options.each(function() {   
			var li = document.createElement('li');
			li.setAttribute('id', parentid + '_' + $(this).val());
			li.innerHTML = $(this).html();
			if ($(this).is(':selected')) {
				$input.val($(this).html());
				$(li).addClass(opt.selected);
			}
			ul.appendChild(li);
			$(li)
			.mouseover(function(event) {
				hasfocus = 1;
				if (opt.debug) {
					//console.log('over on : '+this.id);
				}
				jQuery(event.target, $listContainer).addClass(opt.current);
			})
			.mouseout(function(event) {
				hasfocus = -1;
				if (opt.debug) {
					//console.log('out on : '+this.id);
				}
				jQuery(event.target, $listContainer).removeClass(opt.current);
			})
			.click(function(event) {
			  var fl = $('li.'+opt.current, $listContainer).get(0);
				if (opt.debug) {
					//console.log('click on :'+this.id);
				}
				$('li.'+opt.selected, $listContainer).removeClass(opt.selected); 
				$(this).addClass(opt.selected);
				setCurrent();
				$select.get(0).blur();
				hideMe();
			});
		});
		return ul;
	}	


};
