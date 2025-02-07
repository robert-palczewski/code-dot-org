import PropTypes from 'prop-types';
import React from 'react';
import applabMsg from '@cdo/applab/locale';
import PropertyRow from './PropertyRow';
import BooleanPropertyRow from './BooleanPropertyRow';
import ZOrderRow from './ZOrderRow';
import EventHeaderRow from './EventHeaderRow';
import EventRow from './EventRow';
import * as elementUtils from './elementUtils';
import $ from 'jquery';

class CanvasProperties extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onDepthChange: PropTypes.func.isRequired,
  };

  render() {
    const element = this.props.element;

    return (
      <div id="propertyRowContainer">
        <PropertyRow
          desc={applabMsg.designElementProperty_id()}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_widthPx()}
          isNumber={true}
          initialValue={parseInt(element.getAttribute('width'), 10)}
          handleChange={this.props.handleChange.bind(this, 'width')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_heightPx()}
          isNumber={true}
          initialValue={parseInt(element.getAttribute('height'), 10)}
          handleChange={this.props.handleChange.bind(this, 'height')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_xPositionPx()}
          isNumber={true}
          initialValue={parseInt(element.style.left, 10)}
          handleChange={this.props.handleChange.bind(this, 'left')}
        />
        <PropertyRow
          desc={applabMsg.designElementProperty_yPositionPx()}
          isNumber={true}
          initialValue={parseInt(element.style.top, 10)}
          handleChange={this.props.handleChange.bind(this, 'top')}
        />
        <BooleanPropertyRow
          desc={applabMsg.designElementProperty_hidden()}
          initialValue={$(element).hasClass('design-mode-hidden')}
          handleChange={this.props.handleChange.bind(this, 'hidden')}
        />
        <ZOrderRow
          element={this.props.element}
          onDepthChange={this.props.onDepthChange}
        />
      </div>
    );
  }
}

class CanvasEvents extends React.Component {
  static propTypes = {
    element: PropTypes.instanceOf(HTMLElement).isRequired,
    handleChange: PropTypes.func.isRequired,
    onInsertEvent: PropTypes.func.isRequired,
  };

  getClickEventCode() {
    const id = elementUtils.getId(this.props.element);
    const commands = [
      `console.log("${id} clicked at x: " + event.offsetX + " y: " + event.offsetY);`,
      `setActiveCanvas("${id}");`,
      `circle(event.offsetX, event.offsetY, 10);`,
    ];
    const callback = `function(event) {\n\t${commands.join('\n\t')}\n}`;
    return `onEvent("${id}", "click", ${callback});`;
  }

  insertClick = () => this.props.onInsertEvent(this.getClickEventCode());

  render() {
    const element = this.props.element;

    return (
      <div id="eventRowContainer">
        <PropertyRow
          desc={applabMsg.designElementProperty_id()}
          initialValue={elementUtils.getId(element)}
          handleChange={this.props.handleChange.bind(this, 'id')}
          isIdRow={true}
        />
        <EventHeaderRow />
        <EventRow
          name={applabMsg.designElementEvent_click()}
          desc={applabMsg.designElement_canvas_clickEventDesc()}
          handleInsert={this.insertClick}
        />
      </div>
    );
  }
}

export default {
  PropertyTab: CanvasProperties,
  EventTab: CanvasEvents,
  create: function () {
    const element = document.createElement('canvas');
    element.setAttribute('width', '100px');
    element.setAttribute('height', '100px');

    return element;

    // Note: we use CSS to make this element have a background in design mode
    // but not in code mode.
  },
};
