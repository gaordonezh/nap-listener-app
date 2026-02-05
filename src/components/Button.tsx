import React, { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { ERROR_COLOR, INFO_COLOR, MAIN_COLOR, SUCCESS_COLOR, WARNING_COLOR } from '../utils/constants';

interface ButtonProps extends TouchableOpacityProps {
  label?: ReactNode;
  color?: keyof typeof buttonColors;
  variant?: 'filled' | 'outlined' | 'transparent';
  size?: keyof typeof sizes;
  loading?: boolean;
}

const buttonColors = {
  main: MAIN_COLOR,
  info: INFO_COLOR,
  success: SUCCESS_COLOR,
  warning: WARNING_COLOR,
  error: ERROR_COLOR,
};

const sizes = {
  large: { height: 50, paddingHorizontal: 20 },
  normal: { height: 40, paddingHorizontal: 16 },
  small: { height: 30, paddingHorizontal: 12 },
};

const Button = ({ style, label, color = 'main', variant = 'filled', size = 'normal', loading, ...rest }: ButtonProps) => {
  const currentColor = buttonColors[color];
  const currentSize = sizes[size];

  const buttonVariants = {
    filled: {
      container: {
        backgroundColor: currentColor,
        ...currentSize,
        ...styles.button,
        opacity: rest.disabled ? 0.5 : 1,
      },
      text: { color: '#ffffff' },
    },
    outlined: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: currentColor,
        ...currentSize,
        ...styles.button,
        opacity: rest.disabled ? 0.5 : 1,
      },
      text: { color: currentColor },
    },
    transparent: {
      container: {
        backgroundColor: 'transparent',
        ...currentSize,
        ...styles.button,
        opacity: rest.disabled ? 0.5 : 1,
      },
      text: { color: currentColor },
    },
  };
  const variantClasses = buttonVariants[variant];

  return (
    <TouchableOpacity style={[variantClasses.container, style]} disabled={rest.disabled || loading} {...rest}>
      {loading ? <ActivityIndicator size={currentSize.height - 15} /> : <Text style={[variantClasses.text, styles.buttonText]}>{label}</Text>}
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    borderRadius: 7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
});
