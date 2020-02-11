/**
 * Theme: Uplon Admin Template
 * Author: Coderthemes
 * Tree view
 */

function clearObjectDetails(){
	$('#inline-objName').editable('setValue', '-').editable('disable');
	$('#detailTemplateName').html('-');
	$('#detailCategory').html('-');
	$('#detailTrunkedTo').html('-');
	$('#detailObjType').html('-');
	$('#detailObjFunction').html('-');
	$('#detailRUSize').html('-');
	$('#detailMountConfig').html('-');
	$('#detailPortRange').html('-');
	$('#detailPortOrientation').html('-');
	$('#detailPortType').html('-');
	$('#detailMediaType').html('-');
	$('#detailTemplateImage').html('-');
		
	//Disable the 'Delete' button in object details
	$('#objDelete').prop('disabled', true);
	
	//Clear the hightlight around any highlighted object
	$('.rackObjSelected').removeClass('rackObjSelected');
	
	//Reset selected object input value so it doesn't get highlighted again
	$('#selectedObjectID').val('');
	
	// -=Floorplan Object Details=-
	$('#inline-floorplanObjName').editable('setValue', '-').editable('disable');
	$('#floorplanDetailType').html('-');
	$('#floorplanDetailTrunkedTo').html('-');
	$('#floorplanObjDelete').prop('disabled', true);
}

function disableCabinetDetails(){
	$('#cabinetSizeInput').editable('setValue', '-').editable('disable');
	$('#cablePathTableBody').html('');
	$('#pathAdd').prop('disabled', true);
	$('.adjCabinetSelect').editable('setValue', '').editable('disable');
	$('#cabinetControls').hide();
}

function insertObject(droppableIndex, objectRUSize){
	$('.droppable').eq(droppableIndex).attr('rowspan', objectRUSize);
	for (x=1; x<objectRUSize; x++) {
		$('.droppable').eq(droppableIndex+x).hide();
	}
}

function removeObject(cabinetRUObject){
	var cabinetRU = $(cabinetRUObject).parent();
	var cabinetRUObjectSpan = parseInt($(cabinetRU).attr('rowspan'));
	var cabinetRowIndex = $('.droppable').index(cabinetRU);
	$(cabinetRU).attr('rowspan', '1');
	$('.droppable').slice(cabinetRowIndex+1, cabinetRowIndex+cabinetRUObjectSpan).each(function(){
		$(this).show();
	});
}

function makePathDeleteClickable(selectSource){
	$('.cablePathRemove').off('click');
	$('.cablePathRemove').on('click', function(){
		var parentElement = $(this).closest('tr');
		var pathID = $(parentElement).data('pathId');
		//Collect object data
		var data = {
			pathID: pathID,
			action: 'delete'
			};
		data = JSON.stringify(data);
		
		//Retrieve object details
		$.post("backend/process_cabinet.php", {data:data}, function(response){
			var responseJSON = JSON.parse(response);
			if (responseJSON.active == 'inactive'){
				window.location.replace("/");
			} else if ($(responseJSON.error).size() > 0){
				displayError(responseJSON.error);
			} else {
				$(parentElement).remove();
			}
		});
	});

	$('.pathDistanceNumber').editable({
		showbuttons: false,
		mode: 'inline',
		source: selectSource,
		url: 'backend/process_cabinet.php',
		params: function(params){
			var data = {
				action: 'distance',
				pathID: params.pk,
				distance: params.value
			};
			params.data = JSON.stringify(data);
			return params;
		}
	});

	$('.pathCabinetSelect').editable({
		showbuttons: false,
		mode: 'inline',
		source: selectSource,
		url: 'backend/process_cabinet.php',
		params: function(params){
			var data = {
				action: 'path',
				cabinetID: $('#cabinetHeader').data('cabinetId'),
				pathID: params.pk,
				value: params.value
			};
			params.data = JSON.stringify(data);
			return params;
		}
	});
	
	$('.pathNotesText').editable({
		showbuttons: false,
		mode: 'inline',
		url: 'backend/process_cabinet.php',
		params: function(params){
			var data = {
				action: 'notes',
				pathID: params.pk,
				value: params.value
			};
			params.data = JSON.stringify(data);
			return params;
		}
	});
}

function makeRackObjectsClickable(){
	$('#cabinetTable').find('.selectable').off('click');
	$('#cabinetTable').find('.selectable').on('click', function(event){
		event.stopPropagation();
		/*
		if($(this).hasClass('rackObj')) {
			var object = $(this);
			var partitionDepth = 0;
		} else {
			var object = $(this).closest('.rackObj');
			var partitionDepth =  parseInt($(this).data('depth'), 10);
		}
		*/
		
		var object = $(this).closest('.rackObj');
		var partitionDepth =  parseInt($(this).data('depth'), 10);
		
		//Store objectID
		var objID = $(object).data('templateObjectId');
		$('#selectedObjectID').val(objID);
		
		//Store objectFace
		var objFace = $(object).data('objectFace');
		$('#selectedObjectFace').val(objFace);
		
		//Store objectDepth
		$('#selectedPartitionDepth').val(partitionDepth);
		
		//Store cabinetFace
		var cabinetFace = $('#currentCabinetFace').val();
		
		//Remove hightlight from all racked objects
		$('.rackObjSelected').removeClass('rackObjSelected');
		
		//Hightlight the selected racked object
		$(this).addClass('rackObjSelected');
		
		//Collect object data
		var data = {
			objID: objID,
			page: 'build',
			objFace: objFace,
			cabinetFace: cabinetFace,
			partitionDepth: partitionDepth
			};
		data = JSON.stringify(data);
		
		//Retrieve object details
		$.post("backend/retrieve_object_details.php", {data:data}, function(responseJSON){
			var alertMsg = '';
			var response = JSON.parse(responseJSON);
			if (response.active == 'inactive'){
				window.location.replace("/");
			} else if ($(response.error).size() > 0){
				displayError(response.error);
			} else {
				var response = response.success;
				$('#inline-objName').editable('setValue', response.objectName).editable('enable');
				$('#detailTemplateName').html(response.templateName);
				$('#detailCategory').html(response.categoryName);
				$('#detailObjType').html(response.objectType);
				$('#detailObjFunction').html(response.function);
				$('#detailRUSize').html(response.RUSize);
				$('#detailMountConfig').html(response.mountConfig);
				$('#detailPortRange').html(response.portRange);
				$('#detailPortOrientation').html(response.portOrientationName);
				$('#detailPortType').html(response.portType);
				$('#detailMediaType').html(response.mediaType);
				if(response.templateImgExists) {
					$('#detailTemplateImage').html('<img id="elementTemplateImage" src="" height="" width="">');
					$('#elementTemplateImage').attr({
						src:response.templateImgPath,
						height:response.templateImgHeight + 'px',
						width:response.templateImgWidth + '%'
					});
				} else {
					$('#detailTemplateImage').html('None');
				}
				$('#objDelete').prop('disabled', false);
				$('#inline-name').editable('option', 'disabled', false);
				
				// Trunked to
				if(!response.trunkable) {
					$('#detailTrunkedTo').html(response.trunkFlatPath);
				} else {
					var cabinetTrunkedTo = $('<a id="cabinetTrunkedTo" data-modalTitle="Trunk Peer" href="#">'+response.trunkFlatPath+'</a>')
						.data('peerIDArray', response.peerIDArray);
					$('#detailTrunkedTo')
						.html(cabinetTrunkedTo);
					initializePathSelector();
				}
			}
		});
	});
}

function makeFloorplanObjectsClickable(){
	$('#floorplanContainer').find('.selectable').off('click');
	$('#floorplanContainer').find('.selectable').on('click', function(event){
		event.stopPropagation();
		var objectID = $(this).data('objectId');
		var objectType = $(this).data('type');
		$(document).data('selectedFloorplanObject', $(this));
		$(document).data('selectedFloorplanObjectID', objectID);
		$(document).data('selectedFloorplanObjectType', objectType);
		
		//Remove hightlight from all racked objects
		$('.floorplanObjSelected').removeClass('floorplanObjSelected');
		
		//Hightlight the selected racked object
		$(this).addClass('floorplanObjSelected');
		
		//Collect object data
		var data = {
			objectID: objectID
		};
		data = JSON.stringify(data);
		
		//Retrieve object details
		$.post("backend/retrieve_floorplan_object_details.php", {data:data}, function(responseJSON){
			var response = JSON.parse(responseJSON);
			if (response.active == 'inactive'){
				window.location.replace("/");
			} else if ($(response.error).size() > 0){
				displayError(response.error);
			} else {
				var response = response.success;
				$('#inline-floorplanObjName').editable('setValue', response.name).editable('enable');
				$('#floorplanDetailType').html(objectType);
				
				// Object delete button
				$('#floorplanObjDelete').prop('disabled', false);
				
				// Trunked to
				if(!response.trunkable) {
					$('#floorplanDetailTrunkedTo').html(response.trunkFlatPath);
				} else {
					var floorplanTrunkedTo = $('<a id="floorplanTrunkedTo" data-modalTitle="Trunk Peer" href="#">'+response.trunkFlatPath+'</a>')
						.data('peerIDArray', response.peerIDArray);
					$('#floorplanDetailTrunkedTo')
						.html(floorplanTrunkedTo);
					initializeFloorplanPathSelector();
				}
			}
		});
		
		$('#floorplanObjectTableBody').children().removeClass('table-info');
		$('#floorplanObjectTableBody').children('[data-id="'+objectID+'"]').addClass('table-info');
	});
}

function initializePathSelector(){
	$('#cabinetTrunkedTo').off('click');
	$('#cabinetTrunkedTo').on('click', function(e){
		e.preventDefault();

		var modalTitle = $(this).data('modaltitle');
		var peerIDArray = $(this).data('peerIDArray');
		$(document).data('peerIDArray', peerIDArray);
		var objectID = $('#selectedObjectID').val();
		var objectFace = $('#selectedObjectFace').val();
		var objectDepth = $('#selectedPartitionDepth').val();
		
		$('#objTree').jstree(true).settings.core.data = {url: 'backend/retrieve_environment-tree.php?scope=partition&objectID='+objectID+'&objectFace='+objectFace+'&objectDepth='+objectDepth};
		$('#objTree').jstree(true).settings.core.multiple = false;
		$('#objTree').jstree(true).refresh();
		$('#objectTreeModalLabel').html(modalTitle);
		$('#objectTreeModal').modal('show');
	});
}

function initializeFloorplanPathSelector(){
	$('#floorplanTrunkedTo').off('click');
	$('#floorplanTrunkedTo').on('click', function(e){
		e.preventDefault();

		var modalTitle = $(this).data('modalitle');
		var peerIDArray = $(this).data('peerIDArray');
		$(document).data('peerIDArray', peerIDArray);
		var objectID = $('#selectedObjectID').val();
		var objectFace = $('#selectedObjectFace').val();
		var objectDepth = $('#selectedPartitionDepth').val();
		
		$('#objTree').jstree(true).settings.core.data = {url: 'backend/retrieve_environment-tree.php?scope=floorplanObject'};
		if($(document).data('selectedFloorplanObjectType') == 'walljack') {
			$('#objTree').jstree(true).settings.core.multiple = true;
		} else {
			$('#objTree').jstree(true).settings.core.multiple = false;
		}
		$('#objTree').jstree(true).refresh();
		$('#objectTreeModalLabel').html(modalTitle);
		$('#objectTreeModal').modal('show');
	});
}

function setObjectSize(obj){
	$(obj).each(function(){
		$(this).height($(this).parent().height()-1);
	});
}

function initializeEditable(){
	//Object Name
	$('#inline-objName').editable({
		display: function(value){
			$(this).text(value);
		},
		pk: 1,
		mode: 'inline',
		url: 'backend/process_cabinet-objects.php',
		params: function(params){
			var selectedObjID = $('#selectedObjectID').val();
			var data = {
				'action':'edit',
				'objectID':selectedObjID,
				'value':params.value
			};
			params.data = JSON.stringify(data);
			return params;
		},
		success: function(response) {
			var selectedObjID = $('#selectedObjectID').val();
			var responseJSON = JSON.parse(response);
			if (responseJSON.active == 'inactive'){
				window.location.replace("/");
			} else if ($(responseJSON.error).size() > 0){
				displayError(responseJSON.error);
			} else {
				$('.objName'+selectedObjID).html(responseJSON.success);
				$('#alertMsg').empty();
			}
		}
	}).editable('option', 'disabled', true);
	
	//Floorplan Object Name
	$('#inline-floorplanObjName').editable({
		display: function(value){
			$(this).text(value);
		},
		pk: 1,
		mode: 'inline',
		url: 'backend/process_floorplan-objects.php',
		params: function(params){
			var selectedFloorplanObjID = $(document).data('selectedFloorplanObjectID');
			var data = {
				'action': 'editName',
				'objectID': selectedFloorplanObjID,
				'value': params.value
			};
			params.data = JSON.stringify(data);
			return params;
		},
		success: function(responseJSON) {
			var response = JSON.parse(responseJSON);
			if (response.active == 'inactive'){
				window.location.replace("/");
			} else if ($(response.error).size() > 0){
				displayError(response.error);
			} else {
				$('#alertMsg').empty();
				getFloorplanObjectPeerTable();
			}
		}
	}).editable('option', 'disabled', true);
}

function initializeInsertDroppable(){
	$('#cabinetTable').find('.insertDroppable').droppable({
		hoverClass: 'hoverClass',
		tolerance: 'pointer',
		accept: '.insertDraggable, .initialInsertDraggable',
		drop: function(event, ui){
			var data = {};
			var encHeight = $(this).height()+1;
			var validDrop = true;
			data['cabinetID'] = $('#cabinetID').val();
			data['cabinetFace'] = $('#currentCabinetFace').val();
			data['RU'] = 0;
			//data['objectID'] = ui.draggable.data('templateObjectId');
			data['parent_id'] = parseInt($(this).closest('.rackObj').data('templateObjectId'));
			data['parent_face'] = parseInt($(this).closest('.rackObj').data('objectFace'));
			data['parent_depth'] = parseInt($(this).closest('[data-depth]').data('depth'));
			data['insertSlotX'] = $(this).data('encX');
			data['insertSlotY'] = $(this).data('encY');
			
			//If object came from stock, then append the clone.  Otherwise append the object.
			if (ui.draggable.hasClass('stockObj')){
				var object = ui.draggable.clone();
				data['objectID'] = ui.draggable.data('templateId');
				data['action'] = 'add';
			} else {
				var object = ui.draggable;
				data['objectID'] = ui.draggable.data('templateObjectId');
				data['action'] = 'updateInsert';
			}
			
			//Write object info to DB
			data = JSON.stringify(data);
			$.ajax({
				url: 'backend/process_cabinet-objects.php',
				method: 'POST',
				data: {'data':data},
				success: function(result){
					var responseJSON = JSON.parse(result);
					if (responseJSON.active == 'inactive'){
						window.location.replace("/");
					} else if ($(responseJSON.error).size() > 0){
						displayError(responseJSON.error);
						validDrop = false;
					} else if (responseJSON.success != ''){
						$('#objectID').val(responseJSON.success);
					}
				},
				async: false
			});
			
			//Quit function if object needs to be reverted.
			if(!validDrop){
				$(ui.draggable).addClass('revert');
				return false;
			} else {
				$(ui.draggable).addClass('valid');
			}
			
			//If object came from stock, then set cabinetObjectID to the ID retreived from the insert
			//else, set it to its current value.
			if (ui.draggable.hasClass('stockObj')){
				var cabinetObjectID = $('#objectID').val();
			} else {
				var cabinetObjectID = ui.draggable.data('objectId');
			}
			
			//Create object where it was dropped.
			$(this).append(object
				.show()
				.removeClass('stockObj obj-border')
				//Mark object as being racked in cabinet and landing in a valid dropZone
				.addClass('rackObj insert')
				.css({
					//'left':0,
					//'top':0,
					//'width':'auto',
					//'height':'auto',
					//'display':'flex'
				})
				.attr('data-template-object-id', cabinetObjectID)
				.draggable({
					delay: 200,
					helper: 'clone',
					classes: {'ui-draggable-dragging': 'obj-border'},
					zIndex: 1000,
					cursorAt: {
						top:10
					},
					start: function(){
						var cabinetRUObject = $(this).parent();
						var dragStartWidth = $(cabinetRUObject).width();
						var dragStartHeight = $(cabinetRUObject).height();
						$(cabinetRUObject).children().eq(1).width(dragStartWidth).height(dragStartHeight);
					},
					revert: function(){
						return determineRevert($(this), false)
					}
				})
			);
			makeRackObjectsClickable();
		}
    });
}

function retrieveCabinet(cabinetID, cabinetFace){
	var objID = $('#selectedObjectID').val();
	
	//Collect object data
	var data = {
		id: cabinetID,
		face: cabinetFace,
		view: 'port',
		page: 'environment'
	};
	data = JSON.stringify(data);
	
	//Retrieve object details
	$.post("backend/create_build_space.php", {data:data}, function(responseJSON){
		var response = JSON.parse(responseJSON);
		if (response.active == 'inactive'){
			window.location.replace("/");
		} else if ($(response.error).size() > 0){
			displayError(response.error);
		} else {
			$('#buildSpaceContent').html(response.success.html);
			loadCabinetBuild();
			//Re-highlight select cabinet object when switching cabinet side.
			if (objID) {
				$('[data-template-object-id="'+objID+'"]').find('.flex-container-parent:first').addClass('rackObjSelected');
			}
		}
	});
}

function determineRevert(obj, expandDroppable){
	var droppableIndex = $('.droppable').index($(obj).parent());
	var objectRUSize = parseInt($(obj).data('ruSize'));
	if ($(obj).hasClass('revert')) {
		$(obj).removeClass('revert');
		if(expandDroppable){
			insertObject(droppableIndex, objectRUSize);
		}
		return true;
	} else if ($(obj).hasClass('valid')){
		$('.rackObj').removeClass('valid');
		$('.stockObj').removeClass('valid');
		return false;
	} else {
		if(expandDroppable){
			insertObject(droppableIndex, objectRUSize);
		}
		return true;
	}
}

function makeRackUnitsDroppable(target){
	$(target).droppable({
		tolerance: 'pointer',
		accept: '.draggable, .initialDraggable',
		drop: function(event, ui){
			var data = {};
			var dataSecondary = {};
			var cabinetRU = parseInt($(this).data('cabinetru'));
			var objectRUSize = parseInt($(ui.draggable).data('ruSize'));
			var droppableIndex = $('.droppable').index($(this));
			var currentCabinetFace = $('#currentCabinetFace').val();
			var cabinetID = $('#cabinetID').val();
			var validDrop = true;
			data['cabinetID'] = cabinetID;
			data['cabinetFace'] = currentCabinetFace;
			data['objectFace'] = ui.draggable.data('objectFace');
			data['RU'] = cabinetRU;
			dataSecondary['cabinetID'] = cabinetID;
			
			//If object came from stock, then append the clone.  Otherwise append the object.
			if (ui.draggable.hasClass('stockObj')){
				var object = ui.draggable.clone();
				data['objectID'] = ui.draggable.data('templateId');
				data['action'] = 'add';
			} else {
				var object = ui.draggable;
				data['objectID'] = ui.draggable.data('templateObjectId');
				data['action'] = 'updateObject';
			}
			
			//Write object info to DB
			data = JSON.stringify(data);
			$.ajax({
				url: 'backend/process_cabinet-objects.php',
				method: 'POST',
				data: {'data':data},
				success: function(result){
					var response = JSON.parse(result);
					if (response.active == 'inactive'){
						window.location.replace("/");
					} else if ($(response.error).size() > 0){
						displayError(response.error);
						validDrop = false;
					} else if (response.success != ''){
						$('#objectID').val(response.success);
					}
					
					// Update RUSize Minimum
					dataSecondary['action'] = 'updateCabinetRUMin';
					dataSecondary = JSON.stringify(dataSecondary);
					$.ajax({
						url: 'backend/process_cabinet.php',
						method: 'POST',
						data: {'data':dataSecondary},
						success: function(resultSecondary){
							var responseSecondary = JSON.parse(resultSecondary);
							if (responseSecondary.active == 'inactive'){
								window.location.replace("/");
							} else if ($(responseSecondary.error).size() > 0){
								displayError(responseSecondary.error);
							} else if ($(responseSecondary.success.RUData).length) {
								$('#cabinetSizeInput').editable('option', 'min', responseSecondary.success.RUData.orientationSpecificMin);
							}
						},
						async: false
					});
				},
				async: false
			});
			
			if(!validDrop){
				$(ui.draggable).addClass('revert');
				return false;
			} else {
				$(ui.draggable).addClass('valid');
			}
			
			//If object came from stock, then set cabinetObjectID to the ID retreived from the insert
			//else, set it to its current value.
			if (ui.draggable.hasClass('stockObj')){
				var cabinetObjectID = $('#objectID').val();
			} else {
				var cabinetObjectID = ui.draggable.data('templateObjectId');
				removeObject($(ui.draggable));
			}
			
			//Adjust droppable table to fit dropped object
			insertObject(droppableIndex, objectRUSize);
			
			//Create object where it was dropped.
			$(this).append(object
				.removeClass('stockObj')
				//Mark object as being racked in cabinet and landing in a valid dropZone
				.addClass('rackObj')
				.css({
					'left':0,
					'top':0,
					'width':'auto'
				})
				.show()
				.attr('data-template-object-id', cabinetObjectID)
				.draggable({
					delay: 200,
					helper: 'clone',
					zIndex: 1000,
					cursorAt: {
						top:10
					},
					start: function(){
						var cabinetRUObject = $(this).parent();
						var dragStartWidth = $(cabinetRUObject).width();
						var dragStartHeight = $(cabinetRUObject).height();
						$(cabinetRUObject).children().eq(1).width(dragStartWidth).height(dragStartHeight);
					},
					revert: function(){
						return determineRevert($(this), true);
					}
				})
			);
			makeRackObjectsClickable();
			initializeInsertDroppable();
		}
    }).removeClass('newDroppable');
}

function loadCabinetBuild(){
	initializeInsertDroppable();
	makeRackObjectsClickable();
	
    $('.draggable').draggable({
		delay: 200,
		helper: 'clone',
		cursorAt: {top:10},
		start: function(event, ui){
			var dragStartWidth = $(this).width();
			$(ui.helper).width(dragStartWidth);
		},
		revert: function(){
			return determineRevert($(this), false);
		},
		zIndex: 1000
    });
    
    $('.insertDraggable').draggable({
		delay: 200,
		helper: 'clone',
		classes: {'ui-draggable-dragging': 'obj-border'},
		cursorAt: {top:10},
		start: function(event, ui){
			var dragStartWidth = $(this).width();
			var dragStartHeight = $(this).height();
			$(ui.helper).width(dragStartWidth).height(dragStartHeight);
		},
		revert: function(){
			return determineRevert($(this), false);
		},
		zIndex: 1000
    });
	
	$('.initialDraggable').draggable({
		delay: 200,
		helper: 'clone',
		zIndex: 1000,
		cursorAt: {top:10},
		start: function(){
			var cabinetRUObject = $(this).parent();
			var dragStartWidth = $(cabinetRUObject).width();
			$(cabinetRUObject).children().eq(1).width(dragStartWidth);
		},
		revert: function(){
			return determineRevert($(this), true);
		}
	});
	
	$('.initialInsertDraggable').draggable({
		delay: 200,
		helper: 'clone',
		zIndex: 1000,
		cursorAt: {
			top:10
		},
		start: function(){
			var cabinetRUObject = $(this).parent();
			var dragStartWidth = $(cabinetRUObject).width();
			$(cabinetRUObject).children().eq(1).width(dragStartWidth);
		},
		revert: function(){
			return determineRevert($(this), false);
		}
	});

	makeRackUnitsDroppable($('.droppable'));

}

function filterTemplates(){
	var tags = $('#templateFilter').tagsinput('items');
	var templates = $('.object-wrapper');
	var categoryContainers = $('.categoryContainerEntire');
	
	if($(tags).length) {
		$(templates).hide().attr('data-visible', false);;
		
		$.each(templates, function(indexTemplate, valueTemplate){
			var templateObj = $(this);
			var templateName = $(valueTemplate).data('templateName').toLowerCase();
			var match = true;
			$.each(tags, function(indexTag, valueTag){
				var tag = valueTag.toLowerCase();
				if(templateName.indexOf(tag) >= 0 && match) {
					match = true;
				} else {
					match = false;
				}
			});
			if(match) {
				$(templateObj).show().attr('data-visible', true);
			}
		});
		
		$.each(categoryContainers, function(){
			if($(this).children('.categoryContainer').children('.object-wrapper[data-visible="true"]').size()) {
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	} else {
		$(templates).show().attr('data-visible', true);;
		$(categoryContainers).show();
	}
}

function determineObjectTreeModalSaveState(){
	var disableSaveButton = false
	var selectedNodes = $('#objTree').jstree().get_selected(true);
	$.each(selectedNodes, function(index, item){
		if(item.type != 'port') {
			disableSaveButton = true;
			return;
		}
	});
	
	$('#buttonObjectTreeModalSave').prop("disabled", disableSaveButton);
}

function getFloorplanObjectPeerTable(){
	var cabinetID = $(document).data('selectedNodeID');
	
	//Collect object data
	var data = {
		cabinetID: cabinetID,
		action: 'getFloorplanObjectPeerTable'
	};
	data = JSON.stringify(data);

	//Retrieve floorplan details
	$.post("backend/process_cabinet.php", {data:data}, function(response){
		var response = $.parseJSON(response);
		if (response.error != ''){
			displayError(response.error);
		} else {
	
			$('#floorplanObjectTable').remove();
			var table = '<table id="floorplanObjectTable" class="table table-hover">';
			table += '<thead>';
			table += '<tr>';
			table += '<th>Name</th>';
			table += '<th>PortName</th>';
			table += '</tr>';
			table += '</thead>';
			table += '<tbody id="floorplanObjectTableBody">';
			
			$.each(response.success.floorplanObjectPeerTable, function(index, item){
				table += '<tr data-object-id="'+item.objID+'" style="cursor: pointer;">';
				table += '<td>'+item.objName+'</td>';
				table += '<td>'+item.peerPortName+'</td>';
				table += '</tr>';
			});
			table += '</tbody>';
			table += '</table>';
			
			$('#floorplanObjectTableContainer').html($(table).on('click', 'tr', function(){
				var floorplanObjID = $(this).data('objectId');
				$('#floorplanObj'+floorplanObjID).click();
			}));
			
			$('#floorplanObjectTable').DataTable({
				'paging': false,
				'info': false,
				'scrollY': '200px',
				'scrollCollapse': true
			});
		}
	});
}

function initializeImageUpload(floorplanID){
	$('#fileFloorplanImage').remove();
	$('#containerFloorplanImage').html('<input type="file" name="files[]" id="fileFloorplanImage" multiple="multiple">');
	$('#fileFloorplanImage').filer({
        limit: 1,
        maxSize: null,
        extensions: null,
        changeInput: '<div class="jFiler-input-dragDrop"><div class="jFiler-input-inner"><div class="jFiler-input-icon"><i class="icon-jfi-cloud-up-o"></i></div><div class="jFiler-input-text"><h3>Drag & Drop file here</h3> <span style="display:inline-block; margin: 15px 0">or</span></div><a class="jFiler-input-choose-btn btn btn-custom waves-effect waves-light">Browse Files</a></div></div>',
        showThumbs: true,
        theme: "dragdropbox",
        templates: {
            box: '<ul class="jFiler-items-list jFiler-items-grid"></ul>',
            item: '<li class="jFiler-item">\
                        <div class="jFiler-item-container">\
                            <div class="jFiler-item-inner">\
                                <div class="jFiler-item-thumb">\
                                    <div class="jFiler-item-status"></div>\
                                    <div class="jFiler-item-info">\
                                        <span class="jFiler-item-title"><b title="{{fi-name}}">{{fi-name | limitTo: 25}}</b></span>\
                                        <span class="jFiler-item-others">{{fi-size2}}</span>\
                                    </div>\
                                    {{fi-image}}\
                                </div>\
                                <div class="jFiler-item-assets jFiler-row">\
                                    <ul class="list-inline pull-left">\
                                        <li>{{fi-progressBar}}</li>\
                                    </ul>\
                                    <ul class="list-inline pull-right">\
                                        <li><a class="icon-jfi-trash jFiler-item-trash-action"></a></li>\
                                    </ul>\
                                </div>\
                            </div>\
                        </div>\
                    </li>',
            itemAppend: '<li class="jFiler-item">\
                            <div class="jFiler-item-container">\
                                <div class="jFiler-item-inner">\
                                    <div class="jFiler-item-thumb">\
                                        <div class="jFiler-item-status"></div>\
                                        <div class="jFiler-item-info">\
                                            <span class="jFiler-item-title"><b title="{{fi-name}}">{{fi-name | limitTo: 25}}</b></span>\
                                            <span class="jFiler-item-others">{{fi-size2}}</span>\
                                        </div>\
                                        {{fi-image}}\
                                    </div>\
                                    <div class="jFiler-item-assets jFiler-row">\
                                        <ul class="list-inline pull-left">\
                                            <li><span class="jFiler-item-others">{{fi-icon}}</span></li>\
                                        </ul>\
                                        <ul class="list-inline pull-right">\
                                            <li><a class="icon-jfi-trash jFiler-item-trash-action"></a></li>\
                                        </ul>\
                                    </div>\
                                </div>\
                            </div>\
                        </li>',
            progressBar: '<div class="bar"></div>',
            itemAppendToEnd: false,
            removeConfirmation: true,
            _selectors: {
                list: '.jFiler-items-list',
                item: '.jFiler-item',
                progressBar: '.bar',
                remove: '.jFiler-item-trash-action'
            }
        },
        dragDrop: {
            dragEnter: null,
            dragLeave: null,
            drop: null,
        },
        uploadFile: {
            url: 'backend/process_image-upload.php',
            data: {
				action:'floorplanImage',
				floorplanID:floorplanID
			},
            type: 'POST',
            enctype: 'multipart/form-data',
            beforeSend: function(){},
            success: function(data, el){
                var parent = el.find(".jFiler-jProgressBar").parent();
                el.find(".jFiler-jProgressBar").fadeOut("slow", function(){
                    $("<div class=\"jFiler-item-others text-success\"><i class=\"icon-jfi-check-circle\"></i> Success</div>").hide().appendTo(parent).fadeIn("slow");
                });
				var responseJSON = JSON.parse(data);
				var response = responseJSON.success;
				$('#imgFloorplan').attr('src', response.imgPath);
            },
            error: function(el){
                var parent = el.find(".jFiler-jProgressBar").parent();
                el.find(".jFiler-jProgressBar").fadeOut("slow", function(){
                    $("<div class=\"jFiler-item-others text-error\"><i class=\"icon-jfi-minus-circle\"></i> Error</div>").hide().appendTo(parent).fadeIn("slow");
                });
            },
            statusCode: null,
            onProgress: null,
            onComplete: null
        },
        addMore: false,
        clipBoardPaste: true,
        excludeName: null,
        beforeRender: null,
        afterRender: null,
        beforeShow: null,
        beforeSelect: null,
        onSelect: null,
        afterShow: null,
        onRemove: null,
        onEmpty: null,
        options: null,
        captions: {
            button: "Choose Files",
            feedback: "Choose files To Upload",
            feedback2: "files were chosen",
            drop: "Drop file here to Upload",
            removeConfirmation: "Are you sure you want to remove this file?",
            errors: {
                filesLimit: "Only {{fi-limit}} files are allowed to be uploaded.",
                filesType: "Only Images are allowed to be uploaded.",
                filesSize: "{{fi-name}} is too large! Please upload file up to {{fi-maxSize}} MB.",
                filesSizeAll: "Files you've choosed are too large! Please upload files up to {{fi-maxSize}} MB."
            }
        }
    });
}

function renumberCabinet(){
	var RUOrientation = $('#cabinetHeader').data('ruOrientation');
	var cabSize = $('.cabinetRU').length;
	$('.cabinetRU').each(function(){
		elemIndex = $(this).index();
		RUNumber = cabSize - elemIndex;
		if(RUOrientation == 0) {
			$(this).children('.leftRail').html(RUNumber);
			$(this).children('.droppable').data('cabinetru', RUNumber);
		} else {
			$(this).children('.leftRail').html(elemIndex + 1);
			$(this).children('.droppable').data('cabinetru', RUNumber);
		}
	});
}

$( document ).ready(function() {
	
	$('#btnImageUpload').on('click', function(event){
		$('#modalImageUpload').modal('show');
	});
	
	$('.floorplanObject').draggable({
		helper: "clone",
		zIndex: 1000
	});
	
	$('#floorplanContainer').droppable({
		drop: function(event, ui){
			var objectOrig = ui.draggable;
			var objectClone = ui.draggable.clone();
			var type = objectClone.data('type');
			var objectOffsetTop = ui.offset.top;
			var objectOffsetLeft = ui.offset.left;
			var canvasOffsetTop = $(this).offset().top;
			var canvasOffsetLeft = $(this).offset().left;
			var objectPositionTop = objectOffsetTop - canvasOffsetTop;
			var objectPositionLeft = objectOffsetLeft - canvasOffsetLeft;
			var matrix = $(this).panzoom('getMatrix');
			var scale = matrix[0];
			objectPositionTop = Math.round(objectPositionTop / scale);
			objectPositionLeft = Math.round(objectPositionLeft / scale);
			
			if(ui.draggable.hasClass('floorplanStockObj')) {
				var action = 'add';
				var nodeID = $(document).data('selectedNodeID');
				var object = objectClone.removeClass('floorplanStockObj');
				var data = {
					action: action,
					type: type,
					positionTop: objectPositionTop,
					positionLeft: objectPositionLeft,
					nodeID: nodeID
				};
				
				$(this).append(object
				.css({
					'z-index': 1000,
					'position': 'absolute',
					'top': objectPositionTop,
					'left': objectPositionLeft
				})
				.draggable()
					.hover(
						function(){
							$('#floorplanContainer').panzoom('option', {
								disablePan: true
							});
						},
						function(){
							$('#floorplanContainer').panzoom('option', {
								disablePan: false
							});
						}
					)
				);
				makeFloorplanObjectsClickable();
			} else {
				var action = 'editLocation';
				var objectID = ui.draggable.data('objectId');
				var object = objectOrig;
				var data = {
					action: action,
					positionTop: objectPositionTop,
					positionLeft: objectPositionLeft,
					objectID: objectID
				};
			}	
			
			
			
			data = JSON.stringify(data);
			
			$.post('backend/process_floorplan-objects.php', {data:data}, function(responseJSON){
				var response = JSON.parse(responseJSON);
				if (response.active == 'inactive'){
					window.location.replace("/");
				} else if ($(response.error).size() > 0){
					displayError(response.error);
				} else {
					if(action == 'add') {
						object.data('objectId', response.success.id);
						object.attr('id', 'floorplanObj'+response.success.id);
						getFloorplanObjectPeerTable();
					}
				}
			});
		}
	});
	
	$('#floorplanContainer').panzoom({
		$zoomIn: $('#btnZoomIn'),
		$zoomOut: $('#btnZoomOut'),
		$reset: $('#btnZoomReset')
	});
	
	// Ajax Tree
	$('#objTree')
	.on('select_node.jstree', function(e, data){
		determineObjectTreeModalSaveState();
	})
	.on('deselect_node.jstree', function(e, data){
		determineObjectTreeModalSaveState();
	})
	.on('refresh.jstree', function(){
		var peerIDArray = $(document).data('peerIDArray');
		$('#objTree').jstree('deselect_all', true);
		$.each(peerIDArray, function(index, item){
			$('#objTree').jstree(true).select_node(item);
		});
	})
	.jstree({
		'core' : {
			'multiple': false,
			'check_callback': function(operation, node, node_parent, node_position, more){
				if(operation == 'move_node'){
					return node_parent.type === 'location';
				}
				return true;
			},
			'themes': {
				'responsive': false
			},
			'data': {'url' : false,
				'data': function (node) {
					return { 'id' : node.id };
				}
			}
		},
		'state' : {
			'key' : 'trunkNavigation'
		},
		"types" : {
			'default' : {
				'icon' : 'fa fa-building'
			},
			'location' : {
				'icon' : 'fa fa-building'
			},
			'pod' : {
				'icon' : 'zmdi zmdi-group-work'
			},
			'cabinet' : {
				'icon' : 'fa fa-server'
			},
			'floorplan' : {
				'icon' : 'fa fa-map-o'
			},
			'object' : {
				'icon' : 'fa fa-minus'
			},
			'port' : {
				'icon' : 'fa fa-circle'
			}
        },
		"plugins" : [ "search", "state", "types", "wholerow" ]
    });
	
	$('#buttonObjectTreeModalSave').on('click', function(){
		var selectedObjectType = $(document).data('selectedObjectType');
		var selectedNodes = $('#objTree').jstree('get_selected', true);
		var selectedNodeArray = [];
		$.each(selectedNodes, function(index, item){
			selectedNodeArray.push(item.data.globalID);
		});
		if(selectedObjectType == 'floorplan') {
			var value = selectedNodeArray;
			var objectID = $(document).data('selectedFloorplanObjectID');
			var trunkPathContainer = $('#floorplanTrunkedTo');
			
			var data = {
				action: 'trunkFloorplanPeer',
				value: value,
				objectID: objectID
			}
		} else if(selectedObjectType == 'cabinet') {
			var value = selectedNodeArray[0];
			var objectID = $('#selectedObjectID').val();
			var objectFace = $('#selectedObjectFace').val();
			var objectDepth = $('#selectedPartitionDepth').val();
			var trunkPathContainer = $('#cabinetTrunkedTo');
			
			var data = {
				action: 'trunkPeer',
				value: value,
				objectID: objectID,
				objectFace: objectFace,
				objectDepth: objectDepth
			};
		} else {
			return;
		}
		data = JSON.stringify(data);
		
		$.post('backend/process_cabinet.php', {data:data}, function(response){
			var responseJSON = JSON.parse(response);
			if (responseJSON.active == 'inactive'){
				window.location.replace("/");
			} else if ($(responseJSON.error).size() > 0){
				displayError(responseJSON.error);
			} else {
				$(trunkPathContainer)
					.html(responseJSON.success.trunkFlatPath)
					.data('peerIDArray', [value]);
				$('#objectTreeModal')
					.modal('hide');
					
				if(selectedObjectType == 'floorplan') {
					getFloorplanObjectPeerTable();
				} else {
					$('[data-template-object-id='+objectID+']').find('[data-depth='+objectDepth+']').find('.port').addClass('endpointTrunked');
					var peerArray = value.split('-');
					var peerID = peerArray[1];
					var peerDepth = peerArray[3];
					$('[data-template-object-id='+peerID+']').find('[data-depth='+peerDepth+']').find('.port').addClass('endpointTrunked');
				}
			}
		});
	});
	
	$('#buttonObjectTreeModalClear').on('click', function(){
		var selectedObjectType = $(document).data('selectedObjectType');
		
		if(selectedObjectType == 'floorplan') {
			var objectID = $(document).data('selectedFloorplanObjectID');
			
			var data = {
				action: 'clearFloorplanTrunkPeer',
				objectID: objectID
			};
		} else if(selectedObjectType == 'cabinet') {
			var objectID = $('#selectedObjectID').val();
			var objectFace = $('#selectedObjectFace').val();
			var objectDepth = $('#selectedPartitionDepth').val();
			
			var data = {
				action: 'clearTrunkPeer',
				objectID: objectID,
				objectFace: objectFace,
				objectDepth: objectDepth
			};
		} else {
			return;
		}
		
		data = JSON.stringify(data);
		
		$.post('backend/process_cabinet.php', {data:data}, function(responseJSON){
			var response = JSON.parse(responseJSON);
			if (response.active == 'inactive'){
				window.location.replace("/");
			} else if ($(response.error).size() > 0){
				displayError(response.error);
			} else {
				
				$('#objectTreeModal').modal('hide');
				
				if(selectedObjectType == 'cabinet') {
					$('#detailTrunkedTo')
					.children('a')
					.html(response.success.trunkFlatPath)
					.data('peerIDArray', []);
					
					// Clear trunked style
					$('[data-template-object-id='+objectID+']').find('[data-depth='+objectDepth+']').find('.port').removeClass('endpointTrunked');
					$('[data-template-object-id='+response.success.peerID+']').find('[data-depth='+response.success.peerFace+']').find('.port').removeClass('endpointTrunked');
				} else if(selectedObjectType == 'floorplan') {
					$('#floorplanTrunkedTo')
					.html(response.success.trunkFlatPath)
					.data('peerIDArray', []);
					getFloorplanObjectPeerTable();
				}
			}
		});
	});
	
	$('#templateFilter').on('itemAdded', function(event){
		filterTemplates();
	});
	
	$('#templateFilter').on('itemRemoved', function(event){
		filterTemplates();
	});
	
	$('.categoryTitle').on('click', function(){
		var categoryName = $(this).data('categoryName');
		if($('.category'+categoryName+'Container').is(':visible')) {
			$('.category'+categoryName+'Container').hide(400);
			$(this).children('i').removeClass('fa-caret-down').addClass('fa-caret-right');
		} else {
			$('.categoryContainer').hide(400);
			$('.categoryTitle').children('i').removeClass('fa-caret-down').addClass('fa-caret-right');
			$('.category'+categoryName+'Container').show(400);
			$(this).children('i').removeClass('fa-caret-right').addClass('fa-caret-down');
		}
	});
	
	$('.sideSelectorCabinet').on('change', function(){
		var currentCabinetFace = $(this).val();
		var cabinetID = $('#cabinetHeader').data('cabinetId');
		$('#currentCabinetFace').val(currentCabinetFace);
		retrieveCabinet(cabinetID, currentCabinetFace);
		if (currentCabinetFace == 0) {
			$('#detailsContainer1').hide();
			$('#detailsContainer0').show();
		} else {
			$('#detailsContainer1').show();
			$('#detailsContainer0').hide();
		}
	});
	
	$('#pathAdd').click(function(){
		var data = {};
		data['cabinetID'] = $('#cabinetHeader').data('cabinetId');
		data['action'] = 'new';
		data = JSON.stringify(data);
		$.post('backend/process_cabinet.php', {data:data}, function(data){
			var responseJSON = JSON.parse(data);
			if (responseJSON['error'] != ''){
				alert(responseJSON['error']);
			} else {
				var cablePathLine = '';
				cablePathLine += '<tr data-path-id="'+responseJSON.success.newID+'">';
				cablePathLine += '<td><a href="#" class="pathCabinetSelect" data-type="select" data-pk="'+responseJSON.success.newID+'" data-value=""></a></td>';
				cablePathLine += '<td><a href="#" class="pathDistanceNumber" data-type="number" data-pk="'+responseJSON.success.newID+'" data-min="1" data-value="1"></a></td>';				
				cablePathLine += '<td><a href="#" class="pathNotesText" data-type="text" data-pk="'+responseJSON.success.newID+'"></a></td>';
				cablePathLine += '<td><button class="btn btn-sm waves-effect waves-light btn-danger cablePathRemove"> <i class="fa fa-remove"></i> </button></td>';
				cablePathLine += '</tr>';
				$('#cablePathTableBody').append(cablePathLine);
				makePathDeleteClickable(responseJSON.success.localCabinets);
			}
		});
	});

	//X-editable buttons style
	$.fn.editableform.buttons = 
	'<button type="submit" class="btn btn-sm btn-primary editable-submit waves-effect waves-light"><i class="zmdi zmdi-check"></i></button>' +
	'<button type="button" class="btn btn-sm editable-cancel btn-secondary waves-effect"><i class="zmdi zmdi-close"></i></button>';
	initializeEditable();

	$('#objDelete').click(function(){
		var cabinetID = $('#cabinetID').val();
		var objectID = $('#selectedObjectID').val();
		var object = $('#cabinetTable').find('[data-template-object-id='+objectID+']');
		
		var data = {
			objectID: objectID,
			action: 'delete'
		};
		
		var dataSecondary = {
			cabinetID: cabinetID,
			action: 'updateCabinetRUMin'
		};
		
		data = JSON.stringify(data);
		$.post('backend/process_cabinet-objects.php', {data:data}, function(response){
				var alertMsg = '';
				var responseJSON = JSON.parse(response);
				if (responseJSON.active == 'inactive'){
					window.location.replace("/");
				} else if ($(responseJSON.error).size() > 0){
					displayError(responseJSON.error);
				} else {
					removeObject(object);
					$(object).remove();
					clearObjectDetails();
					
					// Update RUSize Minimum
					dataSecondary = JSON.stringify(dataSecondary);
					$.ajax({
						url: 'backend/process_cabinet.php',
						method: 'POST',
						data: {'data':dataSecondary},
						success: function(resultSecondary){
							var responseSecondary = JSON.parse(resultSecondary);
							if (responseSecondary.active == 'inactive'){
								window.location.replace("/");
							} else if ($(responseSecondary.error).size() > 0){
								displayError(responseSecondary.error);
							} else if ($(responseSecondary.success.RUData).length) {
								$('#cabinetSizeInput').editable('option', 'min', responseSecondary.success.RUData.orientationSpecificMin);
							}
						},
						async: false
					});
				}
			}
		);
	});
	
	$('#floorplanObjDelete').click(function(){
		var objectID = $(document).data('selectedFloorplanObjectID');
		
		var data = {
			objectID: objectID,
			action: 'delete'
		};
		
		data = JSON.stringify(data);
		$.post('backend/process_floorplan-objects.php', {data:data}, function(response){
				var alertMsg = '';
				var responseJSON = JSON.parse(response);
				if (responseJSON.active == 'inactive'){
					window.location.replace("/");
				} else if ($(responseJSON.error).size() > 0){
					displayError(responseJSON.error);
				} else {
					$(document).data('selectedFloorplanObject').remove();
					clearObjectDetails();
					getFloorplanObjectPeerTable();
				}
			}
		);
	});
	

	// Ajax Tree
	$('#ajaxTree')
	.on('select_node.jstree', function (e, data) {
		clearObjectDetails();
		var portAndPathObject = $('#portAndPath').detach();
		$('#rowCabinet').hide();
		$('#cabinetCardBox').hide();
		$('#rowFloorplan').hide();
		$('#floorplanDetails').hide();
		$('#floorplanContainer').children('i').remove();
		
		//Store objectID
		var cabinetID = data.node.id;
		$(document).data('selectedNodeID', cabinetID);
		if(data.node.type == 'cabinet'){
			$(document).data('selectedObjectType', 'cabinet');
			var currentCabinetFace = $('#currentCabinetFace').val();
			retrieveCabinet(cabinetID, currentCabinetFace);
			$('#portAndPathContainerCabinet').html(portAndPathObject);
			$('#rowCabinet').show();
			$('#cabinetCardBox').show();
			
			//Collect object data
			var data = {
				cabinetID: cabinetID,
				action: 'get'
			};
			data = JSON.stringify(data);

			//Retrieve cabinet details
			$.post("backend/process_cabinet.php", {data:data}, function(response){
				var response = $.parseJSON(response);
				if (response.error != ''){
					displayError(response.error);
				} else {
					
					//Initialize cabinet size input
					$('#cabinetSizeInput').editable('destroy');
					$('#cabinetSizeInput').editable({
						showbuttons: false,
						mode: 'inline',
						url: 'backend/process_cabinet.php',
						params: function(params){
							var data = {
								action: 'RU',
								cabinetID: cabinetID,
								RUSize: params.value
							};
							params.data = JSON.stringify(data);
							return params;
						},
						success: function(response) {
							var response = $.parseJSON(response);
							if (response.error.length){
								displayError(response.error);
								$('#cabinetSizeInput').editable('setValue', response.success.originalSize);
							} else {
								var origSize = parseInt(response.success.originalSize);
								var newSize = parseInt(response.success.size);
								if(newSize > origSize) {
									var cabAdjustment = 'grow';
								} else {
									var cabAdjustment = 'shrink';
								}
								var RUOrientation = $('#cabinetHeader').data('ruOrientation');
								var rackUnitHTML = '';
								rackUnitHTML += '<tr class="cabinet cabinetRU">';
								rackUnitHTML += '<td class="cabinet cabinetRail leftRail">42</td>';
								rackUnitHTML += '<td class="newDroppable droppable ui-droppable" rowspan="1" data-cabinetru="42"></td>';
								rackUnitHTML += '<td class="cabinet cabinetRail rightRail"></td>';
								rackUnitHTML += '</tr>';
								
								// Get difference between new and original cabinet size
								if(cabAdjustment == 'grow') {
									var sizeDiff = newSize - origSize;
								} else {
									var sizeDiff = origSize - newSize;
								}
								
								// Grow or shrink cabinet
								for(x=0; x<sizeDiff; x++) {
									console.log('grow/shrink loopX = '+x);
									if(RUOrientation == 0) {
										
										// Bottom-To-Top
										if(cabAdjustment == 'grow') {
											$('#cabinetTable').prepend(rackUnitHTML);
										} else {
											$('.cabinet.cabinetRU').first().remove();
										}
									} else {
										
										// Top-To-Bottom
										if(cabAdjustment == 'grow') {
											$('#cabinetTable').append(rackUnitHTML);
										} else {
											$('.cabinet.cabinetRU').last().remove();
										}
									}
								}
								
								renumberCabinet();
								makeRackUnitsDroppable($('.newDroppable'));
							}
						}
					});
					$('#cabinetSizeInput').editable('setValue', response.success.cabSize);
					$('#cabinetSizeInput').editable('option', 'min', response.success.RUData.orientationSpecificMin);
					
					// Cabinet RU Orientation
					var ruOrientationData = [
						{'value':0,'text':'Bottom-Up'},
						{'value':1,'text':'Top-Down'}
					];

					// Make cabinet RU orientation editable
					$('#cabinetRUOrientationInput').editable('destroy');
					$('#cabinetRUOrientationInput').editable({
						showbuttons: false,
						mode: 'inline',
						source: ruOrientationData,
						params: function(params){
							var data = {
								action: 'RUOrientation',
								cabinetID: cabinetID,
								value: parseInt(params.value, 10)
							};
							params.data = JSON.stringify(data);
							return params;
						},
						url: 'backend/process_cabinet.php',
						success: function(response) {
							var response = $.parseJSON(response);
							if (response.error.length){
								displayError(response.error);
							} else {
								$('#cabinetHeader').data('ruOrientation', response.success.RUOrientation);
								$('#cabinetSizeInput').editable('option', 'min', response.success.RUData.orientationSpecificMin);
								renumberCabinet();
							}
						}
					});
					$('#cabinetRUOrientationInput').editable('setValue', response.success.RUOrientation);
					
					//Build cable path table
					var tableData = '';
					$(response.success.path).each(function(index, path){
						tableData += '<tr data-path-id="'+path.id+'">';
						tableData += '<td><a href="#" class="pathCabinetSelect" data-type="select" data-pk="'+path.id+'" data-value="'+path.cabinetID+'"></a></td>';
						tableData += '<td><a href="#" class="pathDistanceNumber" data-type="number" data-pk="'+path.id+'" data-min="1" data-value="'+path.distance+'"></a></td>';
						tableData += '<td><a href="#" class="pathNotesText" data-type="text" data-pk="'+path.id+'">'+path.notes+'</a></td>';
						tableData += '<td><button class="btn btn-sm waves-effect waves-light btn-danger cablePathRemove"> <i class="fa fa-remove"></i> </button></td>';
						tableData += '</tr>';
					});
					$('#cablePathTableBody').html(tableData);
					makePathDeleteClickable(response.success.allCabinets);
					
					//Enable 'Add Path' button
					$('#pathAdd').prop('disabled', false);
					
					//Initialize cabinet adjacency inputs
					$('.adjCabinetSelect').editable('destroy');
					$('.adjCabinetSelect').editable({
						showbuttons: false,
						mode: 'inline',
						source: response.success.localCabinets,
						url: 'backend/process_cabinet.php',
						params: function(params){
							var data = {
								action: 'adj',
								cabinetID: cabinetID,
								side: params.name,
								adjCabinetID: params.value
							};
							params.data = JSON.stringify(data);
							return params;
						}
					});
					
					var adjLeftCabinetID = 'adjLeft' in response.success ? response.success.adjLeft.cabinetID : '-';
					var adjRightCabinetID = 'adjRight' in response.success ? response.success.adjRight.cabinetID : '-';
					$('#adjCabinetSelectL').editable('setValue', adjLeftCabinetID).editable('enable');
					$('#adjCabinetSelectR').editable('setValue', adjRightCabinetID).editable('enable');
					
					// Enable cabinet face selector
					$('#cabinetControls').show();
				}
			});
		} else if (data.node.type == 'floorplan') {
			$(document).data('selectedObjectType', 'floorplan');
			initializeImageUpload($(document).data('selectedNodeID'));
			disableCabinetDetails();
			
			$('#portAndPathContainerFloorplan').html(portAndPathObject);
			$('#rowFloorplan').show();
			$('#floorplanDetails').show();
			
			//Collect object data
			var data = {
				cabinetID: cabinetID,
				action: 'getFloorplan'
			};
			data = JSON.stringify(data);

			//Retrieve floorplan details
			$.post("backend/process_cabinet.php", {data:data}, function(response){
				var response = $.parseJSON(response);
				if (response.error != ''){
					displayError(response.error);
				} else {
					var walljackObject = '<i class="floorplanObject selectable fa fa-square-o fa-lg" style="cursor:grab;" data-type="walljack"></i>';
					var wapObject = '<i class="floorplanObject selectable fa fa-wifi fa-2x" style="cursor:grab;" data-type="wap"></i>';
					var deviceObject = '<i class="floorplanObject selectable fa fa-laptop fa-2x" style="cursor:grab;" data-type="device"></i>';
					
					var floorplanImgPath = '/images/floorplanImages/'+response.success.floorplanImg;
					$('#imgFloorplan').attr('src', floorplanImgPath);
					
					$.each(response.success.floorplanObjectData, function(index, item){
						if(item.type == 'walljack') {
							var object = $(walljackObject);
						} else if(item.type == 'wap') {
							var object = $(wapObject);
						} else if(item.type == 'device') {
							var object = $(deviceObject);
						}
						var positionTop = item.position_top+'px';
						var positionLeft = item.position_left+'px';
						
						$('#floorplanContainer')
						.append(object
							.css({
								'z-index': 1000,
								'position': 'absolute',
								'top': positionTop,
								'left': positionLeft})
							.draggable()
							.hover(
								function(){
									$('#floorplanContainer').panzoom('option', {
										disablePan: true
									});
								},
								function(){
									$('#floorplanContainer').panzoom('option', {
										disablePan: false
									});
								})
							.data('objectId', item.id)
							.attr('id', 'floorplanObj'+item.id)
						);
						
						makeFloorplanObjectsClickable();
					});
					
					getFloorplanObjectPeerTable();
				}
			});
			
		} else if (data.node.type == 'location' || data.node.type == 'pod') {
			$(document).data('selectedObjectType', 'location');
			disableCabinetDetails();
			
			$("#buildSpaceContent").html("Please select a cabinet from the Environment Tree.");
			$('#portAndPathContainerCabinet').html(portAndPathObject);
			$('#rowCabinet').show();
			
		} else {
			$(document).data('selectedObjectType', '');
			$("#buildSpaceContent").html("Error");	
		}

	})
	.bind('rename_node.jstree', function(event, nodeData){
		var data = {
			operation: 'rename_node',
			id: nodeData.node.id,
			name: nodeData.node.text
			};
		data = JSON.stringify(data);
		
		$.post('/backend/process_environment-tree.php', {data:data}, function(response){
			var responseJSON = JSON.parse(response);
			if (responseJSON.active == 'inactive'){
				window.location.replace("/");
			} else if ($(responseJSON.error).size() > 0){
				displayError(responseJSON.error);
			} else {
				var nodeType = $("#ajaxTree").jstree(true).get_type(nodeData.node);
				if (nodeType == 'cabinet') {
					$('#cabinetHeader').html(nodeData.node.text);
				}
			}
		});
		return false;
	})
	.bind('move_node.jstree', function(event, nodeData){
		var data = {
			operation: 'move_node',
			id: nodeData.node.id,
			parent: nodeData.node.parent
			};
		data = JSON.stringify(data);
		
		$.post('/backend/process_environment-tree.php', {data:data}, function(response){
			var responseJSON = JSON.parse(response);
			if (responseJSON.active == 'inactive'){
				window.location.replace("/");
			} else if ($(responseJSON.error).size() > 0){
				displayError(responseJSON.error);
			}
		});
	})
	.jstree({
		'core' : {
			'check_callback' : function(operation, node, node_parent, node_position, more){
				//alert("Position: "+node_position+" Operation: "+operation+" Type: "+node.type+" Parent: "+node_parent.type+" Node name: "+node.text+" Node ID: "+node.id);
				if(operation == 'move_node'){
					if(node.type == 'location') {
						if(node_parent.type == 'pod' || node_parent.type == 'cabinet') {
							return false;
						}
					} else if(node.type == 'pod') {
						if(node_parent.type === '#' || node_parent.type == 'cabinet' || node_parent.type == 'pod') {
							return false;
						}
					} else if(node.type == 'cabinet' || node.type == 'floorplan') {
						if(node_parent.type === '#') {
							return false;
						}
					}
				}
				return true;
			},
			'themes' : {
				'responsive': false
			},
			'data' : {
				'url' : function (node) {
					return 'backend/process_environment-tree.php';
				}
			},
			'strings' : {
				'New node' : 'New_Node'
			},
			'multiple' : false
		},
		'dnd' : {
			'check_while_dragging': false
		},
		'state' : {
			'key' : 'envNavigation',
			'filter': function(state){
				// Select template requested by app
				if($('#nodeID').length) {
					var nodeID = $('#nodeID').val();
					state.core.selected = [nodeID];
					$('#nodeID').remove();
				}
				return state;
			}
		},
		"types" : {
			'default' : {
				'icon' : 'fa fa-building'
			},
			'location' : {
				'icon' : 'fa fa-building'
			},
			'pod' : {
				'icon' : 'zmdi zmdi-group-work'
			},
			'cabinet' : {
				'icon' : 'fa fa-server'
			},
			'floorplan' : {
				'icon' : 'fa fa-map-o'
			}
        },
		"contextmenu":{
			"items": customMenu
		},
		"plugins" : [ "contextmenu", "dnd", "search", "state", "types", "wholerow" ]
    });
	
});

function createNode(refData, newNodeType) {
	var ref = $.jstree.reference(refData.reference);
	node = ref.get_selected();
	if(!node.length) { return false; }
	nodeID = node[0];
	var data = {
		operation: 'create_node',
		parent: nodeID,
		type: newNodeType
	};
	data = JSON.stringify(data);
	$.post('/backend/process_environment-tree.php', {data:data}, function(response){
		var responseJSON = JSON.parse(response);
		if (responseJSON.active == 'inactive'){
			window.location.replace("/");
		} else if ($(responseJSON.error).size() > 0){
			displayError(responseJSON.error);
		} else {
			var newNodeID = responseJSON.success.nodeID;
			var newNodeName = responseJSON.success.nodeName;
			nodeID = ref.create_node(nodeID, {
				type:newNodeType,
				id:newNodeID,
				text:newNodeName
			});
			if(nodeID) {
				ref.edit(nodeID);
				$('#ajaxTree').jstree('deselect_all');
				$('#ajaxTree').jstree('select_node', newNodeID);
			}
		}
	});
}

function customMenu(node) {
	var items = {
		"New Location": {
			"label": "New Location",
			"action": function(data) {
				createNode(data, 'location');
			}
		},
		"New Pod": {
			"label": "New Pod",
			"action": function(data) {
				createNode(data, 'pod');
			}
		},
		"New Cabinet": {
			"label": "New Cabinet",
			"action": function(data) {
				createNode(data, 'cabinet');
			}
		},
		"New Floorplan": {
			"label": "New Floorplan",
			"action": function(data) {
				createNode(data, 'floorplan');
			}
		},
		"Rename": {
			"label": "Rename",
			"action": function (data) {
				var inst = $.jstree.reference(data.reference);
				obj = inst.get_node(data.reference);
				inst.edit(obj);
			}
		},
		"Delete": {
			"label": "Delete",
			"action": function (data) {
				var ref = $.jstree.reference(data.reference),
				node = ref.get_selected();
				if(!node.length) { return false; }
				var nodeID = node[0];
				var data = {
					operation: 'delete_node',
					id: nodeID
				}
				
				data = JSON.stringify(data);
			
				$.post('backend/process_environment-tree.php', {data:data}, function(response){
					var responseJSON = JSON.parse(response);
					if($(responseJSON.error).size() > 0) {
						displayError(responseJSON.error);
					} else {
						ref.delete_node(node);
					}
				});
			}
		}
	};
	if(node.type == 'cabinet' || node.type == 'floorplan') {
		delete items['New Location'];
		delete items['New Cabinet'];
		delete items['New Pod'];
		delete items['New Floorplan'];
	} else if(node.type == 'pod') {
		delete items['New Location'];
		delete items['New Pod'];
		delete items['New Floorplan'];
	}
	return items;
}
