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
* Version: 1.7
* A complete rewrite
*/

(function ($) {

    var methods = {
        init: function (options) {

            var settings = $.extend({
                'selectorType': "id", // defaults to selecting by id
                'inputType': "span", // defaults to creating a span for the current selected item
                'simple': true, // defaults to a simple wrapper (no top and bottom divs)
                'wrapper': "select-wrapper", // 
                'input': "selectbox",
                'dropdownWrapper': "dd-wrapper",
                'dropdownWrapperTop': "dd-wrapper-top",
                'dropdownWrapperBottom':"dd-wrapper-bottom",
                'zIndex': 1000,
                'current': "dd-current",
                'selected': "dd-selected",
                'group': "dd-group", //css class for group
                'maxHeight': 110, // max height of dropdown list
                'matchWidth': true,
                'noLooping': false, // to remove the step in list moves loop
                'selBoxIndex': getCurrentSelected(), // set which item to show by default
                'onChangeCallback': false,
                'onChangeParams': false,
                'debug': false
            }, options);

            var selectId = this.id;
            // check to see if it has already been created in case of AJAX refresh
            var elmCheck = $('#' + elm_id + '_select_wrapper');
            if (elmCheck.length > 0) {
                $('#' + elm_id + '_select_wrapper').remove();
            }

            return this.each(function () {
                $(this).width(settings.width);

            });

            var $this = $(this),
            data = $this.data('selectbox')
            // If the plugin hasn't been initialized yet
            if (!data) {

                /*
                Do more setup stuff here
                */

                $(this).data('selectbox', {
                    target: $this
                });

            }
        },
        destroy: function () {

            return this.each(function () {

                var $this = $(this);

                $this.removeData('tooltip');

            })
        }
    };

    $.fn.selectbox = function (method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.selectbox');
        }

    };

})(jQuery);