// remove Util module when done
// Modules (static)
// - Util
// - PointTween
// ------------------ Util (static)
var Util = function() {
    var _log = function() {
        // if(localStorageVariable==debug==false) return;
        if (typeof console === "undefined" || typeof console.log === "undefined") return; // no log available
        
        for (var i = 0; i < arguments.length; i++) {
            var iteredArgument = arguments[i];
            console.log(iteredArgument);
        }
    };
    var _mergeArrays = function() {
        var i, ii, newArray = [], arrayAmount, iteredArray, iteredArrayContentsAmount;
        arrayAmount = arguments.length;
        for (i = 0; i < arrayAmount; i++) {
            iteredArray = arguments[i];
            iteredArrayContentsAmount = iteredArray.length;
            for (ii = 0; ii < iteredArrayContentsAmount; ii++) {
                newArray.push(iteredArray[ii]);
            }
        }
        return newArray;
    };
    //
    return {
        log: _log,
        mergeArrays:_mergeArrays
    };
}();
// ------------------ PointTween (static)
var PointTween = function() {
	
	var _static = {
		types: {
			PATH_D:'d'
		},
		errors: {
			NO_TYPE:'no_type',
			NO_POINTS:'no_points'
		}
	};

	var _to = function(element, seconds, options) {

		var miliseconds = seconds * 1000;
		// todo: make element object work as either a javascript or jquery object
		if(options.hasOwnProperty('type')) {
			
			switch(options.type) {
				// handle animations for the attribute d on a svg path element
				case _static.types.PATH_D:
					if(options.hasOwnProperty('points')) {
						var pathPointObjects = _getPathPointObjects(options.points);
						// todo : utilize the seconds object when this is done
						var animation_frame_amount = 100;
						var pathPointObjectsFrames = _getFrames(pathPointObjects, animation_frame_amount);
						var pathPointStringFrames = _getStringFrames(pathPointObjectsFrames);
						//
						// quick example of animation array	with out tweening each 
						var _buildAnimationSteps = function(animations) {
							var timeout = 500;
							var timeoutIncrement = 100;
							for (var i = 0; i < animations.length; i++) {
								var itered = animations[i];
								_delaySet(timeout, itered);
								timeout += timeoutIncrement;
							}
						};
						var _delaySet = function(timeout, set) {
							setTimeout(function() {
								svg_path.setAttribute("d", set);
							}, timeout);
						};
						_buildAnimationSteps(pathPointStringFrames);

					} else _catchError(_static.errors.NO_POINTS);
				break;
			}
		} else _catchError(_static.errors.NO_TYPE);
	};

	var _getPathPointObjects = function(pointsAsStrings) {
		var pathPointObjectCollection = [];
		var letterMatch_regex = /[MCZ]/g;
		var iteredPathPoints;
		var pathPointObject;
		var current;
		var previous;
		var match;
		var matches = [];
		var iteredMatch;
		// todo: move iteration variables outside of loop for faster iteration
		// var i, ii, i_limit, ii_limit;
		// i_limit = pointsAsStrings.length;
		for (var i = 0; i < pointsAsStrings.length; i++) {
			iteredPathPoints = pointsAsStrings[i];
			// find a match for letters M,C,Z
			while (match = letterMatch_regex.exec(iteredPathPoints)) {
				current = {letter:match[0], index:match.index};
				// if a previous match has been stored
				if(matches.length) {
					previous = matches[matches.length-1];
					previous['values'] = iteredPathPoints.slice(previous.index+2,current.index-1).split(' ');
				}
				matches.push(current);
			}
			// handle setting the last object value
			current['values'] = iteredPathPoints.slice(current.index+2,iteredPathPoints.length).split(' ');
			// matches object is utilized to track previous placement and to then set the pathPointObject
			// ii_limit = matches.length;
			pathPointObject = {};
			for (var ii = 0; ii < matches.length; ii++) {
				iteredMatch = matches[ii];
				var string_values = iteredMatch.values;
				var int_values = [];
				for (var iii = 0; iii < string_values.length; iii++) {
					var iteredStringValue = string_values[iii];
					if(iteredStringValue && iteredStringValue.length) {
						var separatedStrings = iteredStringValue.split(',');
						int_values.push({
							x:parseInt(separatedStrings[0], 10),
							y:parseInt(separatedStrings[1], 10)
						});
					}
				}
				// todo: possibly expand on object 
				pathPointObject[iteredMatch.letter] = int_values;
			}
			// blank out for next iteration
			matches = [];
			//
			pathPointObjectCollection.push(pathPointObject);
		}
		return pathPointObjectCollection;
	};

	var _getFrames = function(pathPointObjects, stepAmount) {
		// todo: re-visit this method... wrote this with partial brain damage
		var stepsProvided = pathPointObjects.length;
		var betweenAmount = Math.floor(  (stepAmount - stepsProvided) / stepsProvided ) ;
		var animationSteps = [];
		var iteredStepObject, current, previous;
		// start with the second i = 1
		for (var i = 1; i < stepsProvided; i++) {
			current = pathPointObjects[i];
			previous = pathPointObjects[i-1];
			// Util.log('previous',previous);
			animationSteps.push(previous);
			var betweenSteps = _getFrameDifferences(previous, current, betweenAmount);
			animationSteps = Util.mergeArrays(animationSteps, betweenSteps);
		}
		// push last
		animationSteps.push(previous);
		return animationSteps;
	};

	var _getFrameDifferences = function(first, second, stepAmount) {
		var animationSteps = [];
		var i = 0;
		// create the blank step objects
		for (i = 0; i < stepAmount; i++) {
			animationSteps.push({});
		}
		// allows for dynamic variable setting and getting
		for (var property in first) {
			if (first.hasOwnProperty(property) && second.hasOwnProperty(property)) {
				var points_start = first[property];						
				var points_end = second[property];
				// 
				if(points_start.length === points_end.length) {
					var pointAmount = points_start.length

					for (i = 0; i < pointAmount; i++) {
						var point_start = points_start[i];
						var point_end = points_end[i];
						var x_start = point_start.x;
						var y_start = point_start.y;
						var x_end = point_end.x;
						var y_end = point_end.y;
						// var x_increment = x_difference/stepAmount;
						// var y_increment = y_difference/stepAmount;
						var x_next = x_start;
						var y_next = y_start;
						var x_difference = x_next - x_end;
						var y_difference = y_next - y_end;
						var x_distance = Math.sqrt((x_difference*x_difference));
						var y_distance = Math.sqrt((y_difference*y_difference));
						var x_y_distance;
						for (var ii = 0; ii < stepAmount; ii++) {
							var iteredStep = animationSteps[ii];
							var propertyArray = iteredStep[property];
							// create an array if not yet created
							if(!propertyArray) propertyArray = iteredStep[property] = [];
							//
							x_difference = x_next - x_end;
							y_difference = y_next - y_end;

							x_distance = Math.sqrt((x_difference*x_difference));
							y_distance = Math.sqrt((y_difference*y_difference));
							// x_y_distance = Math.sqrt((x_difference*x_difference) + (y_difference*y_difference));
							var x_move = x_distance * (ii/stepAmount);
							var y_move = y_distance * (ii/stepAmount);
							if(x_difference<0) {
								x_next += x_move;
							} else {
								x_next -= x_move;
							}
							if(y_difference<0) {
								y_next += y_move;
							} else {
								y_next -= y_move;
							}
							propertyArray.push({x:x_next, y:y_next});
						}
					}
				} else _catchError('todo : some complex magic if this is the case');
			} else _catchError('why you not have matching props');
		}
		return animationSteps;
	};

	var _getStringFrames = function(pathObjects) {
		var stringSteps = [];
		for (var i = 0; i < pathObjects.length; i++) {
			var iteredPathObject = pathObjects[i];
			var stringPath = '';
			//
			for (var property in iteredPathObject) {
				// Util.log('property',property);
				stringPath += property+' ';
				var points = iteredPathObject[property];
				stringPath += _getPointString(points);
			}
			stringSteps.push(stringPath);
		}
		return stringSteps;
	};

	var _getPointString = function(pointCollection) {
		var pointString = '';
		for (var i = 0; i < pointCollection.length; i++) {
			var iteredPoint = pointCollection[i];
			var point_x = Math.round(iteredPoint.x).toString();
			var point_y = Math.round(iteredPoint.y).toString();
			pointString += point_x + ',' + point_y + ' ';
		}
		return pointString;
	};

	// todo: write true error handling
	var _catchError = function(errorType) {
		var message = '';
		var todoMessage = '\ntodo: messages should be something like:\ndo you have this:\nPointTween.to(element, seconds, {type:type_here, points:points_array_here});';
		switch(errorType) {
			case _static.errors.NO_TYPE:
				message = 'you need to define a type'+todoMessage;
				break;
			case _static.errors.NO_POINTS:
				message = 'you need to define an array of points'+todoMessage;
				break;
			default:
				message = 'no predefined error message for\n'+errorType+todoMessage;
				break;
		}
		Util.log('** PointTween Silent Error Catch **',message);
	};
	//
	return {
		to:_to,
		TYPE:_static.types
	};
}();
