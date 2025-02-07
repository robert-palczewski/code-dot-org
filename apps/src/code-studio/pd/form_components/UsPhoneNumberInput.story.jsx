import React from 'react';
import UsPhoneNumberInput from './UsPhoneNumberInput';

export default {
  title: 'UsPhoneNumberInput',
  component: UsPhoneNumberInput,
};

const Template = args => <UsPhoneNumberInput {...args} />;

export const DefaultPhoneInput = Template.bind({});
DefaultPhoneInput.args = {
  name: 'Storybook',
  label: 'Enter a phone number',
};
