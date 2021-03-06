'use strict';

var inherits = require('inherits'),
    is = require('bpmn-js/lib/util/ModelUtil').is,
    assign = require('lodash/object/assign'),
    bind = require('lodash/function/bind');

var ContextPadProvider = require('bpmn-js/lib/features/context-pad/ContextPadProvider');

var availableActions = require('./modeler-options/Options').AVAILABLE_CONTEXTPAD_ENTRIES;

function CustomContextPadProvider(eventBus, contextPad, modeling, elementFactory, connect, create, popupMenu, canvas, rules, translate) {
  ContextPadProvider.call(this, eventBus, contextPad, modeling, elementFactory, connect, create, popupMenu, canvas, rules, translate);

  var cached = bind(this.getContextPadEntries, this);

  this.getContextPadEntries = function(element) {
    var actions = cached(element);

    var businessObject = element.businessObject;

    function appendAction(type, className, title, options) {

      if (typeof title !== 'string') {
        options = title;
        title = translate('Append {type}', { type: type.replace(/^bpmn\:/, '') });
      }

      function appendListener(event, element) {

        var shape = elementFactory.createShape(assign({ type: type }, options));
        create.start(event, shape, element);
      }

      return {
        group: 'model',
        className: className,
        title: title,
        action: {
          dragstart: appendListener,
          click: appendListener
        }
      };
    }


    var filteredActions = {};

    if (!is(businessObject, 'bpmn:EndEvent')) {
      assign(filteredActions, { 'append.append-service-task': appendAction('bpmn:ServiceTask', 'bpmn-icon-service-task') });
      assign(filteredActions, { 'append.append-receive-task': appendAction('bpmn:ReceiveTask', 'bpmn-icon-receive-task') });
      assign(filteredActions, { 'append.append-event': appendAction('bpmn:IntermediateCatchEvent', 'bpmn-icon-intermediate-event-catch-message','Message Event',{ eventDefinitionType: 'bpmn:MessageEventDefinition'}) });
   
    }

    for (var i = 0; i < availableActions.length; i++) {
      var availableAction = availableActions[i];
      if (actions[availableAction]) {
        if (availableAction == 'replace' && !is(businessObject, 'bpmn:SequenceFlow')) {
          continue;
        }
        filteredActions[availableAction] = actions[availableAction];
      }
    }
    return filteredActions;
  };
}



inherits(CustomContextPadProvider, ContextPadProvider);

CustomContextPadProvider.$inject = [
  'eventBus',
  'contextPad',
  'modeling',
  'elementFactory',
  'connect',
  'create',
  'popupMenu',
  'canvas',
  'rules',
  'translate'
];

module.exports = CustomContextPadProvider;
