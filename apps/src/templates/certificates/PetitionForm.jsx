import React from 'react';
import {Button, Form} from 'react-bootstrap';
import FieldGroup from './FieldGroup';
import {range} from 'lodash';

const PetitionForm = () => (
  <>
    <Form inline id="petition-form" className="petition_form">
      <FieldGroup id="name" placeholder="Name" type="text" />
      <FieldGroup id="email" placeholder="Email" type="text" />
      <FieldGroup
        id="zip-or-country"
        placeholder="ZIP code or country"
        type="number"
      />
      <FieldGroup id="zip-or-country" label="Age" componentClass="select">
        {['-', ...range(1, 101)].map((age, index) => (
          <option key={index} value={age}>
            {age}
          </option>
        ))}
      </FieldGroup>
      <FieldGroup id="profession" label="I am a" componentClass="select">
        {[
          '- Select -',
          'Student',
          'Parent',
          'Educator',
          'School Administrator',
          'Software Engineer',
          'None of the Above'
        ].map((profession, index) => (
          <option key={index} value={profession}>
            {profession}
          </option>
        ))}
      </FieldGroup>
      <Button
        className="go_button"
        bsStyle="primary"
        key="submit"
        id="submit"
        type="submit"
      >
        I agree
      </Button>
    </Form>
  </>
);

export default PetitionForm;
