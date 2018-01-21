"use strict";

(function(){

	const map_id = "#map_container";

	const choropleth = new Choropleth(map_id);
	choropleth.init();

	$('.nstSlider').nstSlider({
	    "crossable_handles": false,
	    "left_grip_selector": ".leftGrip",
	    "right_grip_selector": ".rightGrip",
	    "value_bar_selector": ".bar",
	    "value_changed_callback": function(cause, leftValue, rightValue) {
	        $(this).parent().parent().find('.left-label').find('.leftLabel').text(leftValue);
	        $(this).parent().parent().find('.right-label').find('.rightLabel').text(rightValue);
	    },
	    "user_mouseup_callback": function(vmin, vmax, left_grip_moved){
	    	choropleth.update(vmin, vmax);
	    }
	});
	
})();