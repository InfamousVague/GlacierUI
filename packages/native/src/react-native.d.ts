/**
 * Ambient types for the slice of `react-native` the Glacier native kit uses.
 *
 * react-native-web ships no type declarations and `@types/react-native` is
 * deprecated (React Native now owns its types, which we do not install here
 * because the web docs only need react-native-web). This shim declares just the
 * primitives the kit renders, kept intentionally permissive: styles accept
 * `var(--glacier-*)` strings, which react-native-web resolves on the DOM even
 * though a strict React Native style object would want numbers. When a device
 * build lands with real react-native, its own types supersede this file.
 */
declare module 'react-native' {
  import type { ComponentType, ReactNode } from 'react';

  export type Style = Record<string, unknown>;
  // A falsy style (null/undefined/false) is valid in React Native, and style
  // arrays can nest arbitrarily (`[a, [b, c], cond && d]`), so StyleProp is
  // recursive — matching RN's own flattening behavior.
  export type StyleProp = Style | false | null | undefined | ReadonlyArray<StyleProp>;

  // The shared accessibility/test props every primitive accepts. Listed
  // explicitly (no index signature) so `...rest` stays strongly typed and does
  // not widen known props like `disabled` back to `unknown`.
  interface CommonProps {
    testID?: string;
    accessibilityRole?: string;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    accessibilityState?: { disabled?: boolean; selected?: boolean; checked?: boolean | 'mixed'; expanded?: boolean; busy?: boolean };
    accessibilityElementsHidden?: boolean;
    importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
    nativeID?: string;
    pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
    // Modern React Native (0.71+) and react-native-web accept ARIA props
    // directly; only the few the kit sets are declared.
    'aria-orientation'?: 'horizontal' | 'vertical';
    'aria-hidden'?: boolean;
    'aria-checked'?: boolean | 'mixed';
    'aria-label'?: string;
  }

  export interface ResponderEvent {
    nativeEvent: { locationX: number; locationY: number };
  }

  export interface ResponderProps {
    onStartShouldSetResponder?: () => boolean;
    onResponderGrant?: (event: ResponderEvent) => void;
    onResponderMove?: (event: ResponderEvent) => void;
  }

  export interface PointerEvent {
    nativeEvent: { clientX: number; clientY: number; buttons?: number };
    currentTarget: { getBoundingClientRect(): { left: number; top: number; width: number; height: number } };
  }

  export interface PointerProps {
    onClick?: (event: PointerEvent) => void;
    onPointerDown?: (event: PointerEvent) => void;
    onPointerMove?: (event: PointerEvent) => void;
    onPointerUp?: (event: PointerEvent) => void;
  }

  export interface ViewProps extends CommonProps, ResponderProps, PointerProps {
    style?: StyleProp;
    children?: ReactNode;
    className?: string;
  }

  export interface TextProps extends CommonProps {
    style?: StyleProp;
    children?: ReactNode;
    numberOfLines?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
    selectable?: boolean;
  }

  export interface PressableStateCallbackType {
    pressed: boolean;
    hovered?: boolean;
    focused?: boolean;
  }

  export interface PressableProps extends CommonProps, ResponderProps, PointerProps {
    style?: StyleProp | ((state: PressableStateCallbackType) => StyleProp);
    children?: ReactNode | ((state: PressableStateCallbackType) => ReactNode);
    disabled?: boolean;
    onPress?: (event?: ResponderEvent) => void;
    onPressMove?: (event: ResponderEvent) => void;
    onLongPress?: () => void;
    onHoverIn?: () => void;
    onHoverOut?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    hitSlop?: number | { top?: number; bottom?: number; left?: number; right?: number };
  }

  export interface ImageSource {
    uri?: string;
    width?: number;
    height?: number;
  }

  export interface ImageProps extends CommonProps {
    style?: StyleProp;
    source?: ImageSource | number;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'repeat';
    onError?: () => void;
    onLoad?: () => void;
  }

  export interface TextInputProps extends CommonProps {
    style?: StyleProp;
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    placeholderTextColor?: string;
    editable?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    maxLength?: number;
    secureTextEntry?: boolean;
    autoFocus?: boolean;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
    onChangeText?: (text: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onKeyPress?: (e: { nativeEvent: { key: string } }) => void;
    onSubmitEditing?: () => void;
  }

  export interface ScrollViewProps extends CommonProps {
    style?: StyleProp;
    contentContainerStyle?: StyleProp;
    children?: ReactNode;
    horizontal?: boolean;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    scrollEnabled?: boolean;
    onScroll?: (e: { nativeEvent: { contentOffset: { x: number; y: number } } }) => void;
    stickyHeaderIndices?: number[];
  }

  export interface ModalProps extends CommonProps {
    visible?: boolean;
    transparent?: boolean;
    animationType?: 'none' | 'slide' | 'fade';
    onRequestClose?: () => void;
    onDismiss?: () => void;
    children?: ReactNode;
  }

  export const View: ComponentType<ViewProps>;
  export const Text: ComponentType<TextProps>;
  export const Pressable: ComponentType<PressableProps>;
  export const Image: ComponentType<ImageProps>;
  export const TextInput: ComponentType<TextInputProps>;
  export const ScrollView: ComponentType<ScrollViewProps>;
  export const Modal: ComponentType<ModalProps>;

  export const Platform: {
    OS: 'android' | 'ios' | 'web';
  };

  export function useWindowDimensions(): { width: number; height: number; scale: number; fontScale: number };

  export const StyleSheet: {
    create<T extends Record<string, Style>>(styles: T): T;
    flatten(style?: StyleProp): Style;
    readonly hairlineWidth: number;
    readonly absoluteFill: Style;
  };

  export interface AnimatedValue {
    interpolate(config: { inputRange: number[]; outputRange: Array<string | number> }): unknown;
  }

  export interface CompositeAnimation {
    start(callback?: () => void): void;
    stop(): void;
  }

  export const Animated: {
    Value: new (value: number) => AnimatedValue;
    View: ComponentType<ViewProps>;
    timing(value: AnimatedValue, config: { toValue: number; duration: number; useNativeDriver: boolean }): CompositeAnimation;
    loop(animation: CompositeAnimation): CompositeAnimation;
  };
}
