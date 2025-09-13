import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path, Ellipse } from 'react-native-svg';

export const SunCloud: React.FC<{ width?: number; height?: number; style?: any }> = ({ width = 96, height = 48, style }) => (
  <View style={style}>
    <Svg width={width} height={height} viewBox="0 0 96 48">
      <Circle cx="16" cy="16" r="8" fill="rgba(255,79,97,0.15)" />
      <Path d="M32 28c6 0 10-4 10-8s-4-8-10-8c-2 0-4 .5-6 1.6C23 14 20 12 16 12 10 12 6 16 6 20s4 8 10 8h16z" fill="#6EBAA6" opacity="0.12" />
    </Svg>
  </View>
);

export const TreeDoodle: React.FC<{ width?: number; height?: number; style?: any }>=({ width=64, height=64, style })=> (
  <View style={style}>
    <Svg width={width} height={height} viewBox="0 0 64 64">
      <Path d="M32 8c8 0 14 6 14 14 0 2-0.5 4-1.4 5.8C49 29 54 34 54 40c0 6-6 10-14 10H24c-8 0-14-4-14-10 0-6 5-11 9.4-12.2C18.5 26 18 24 18 22 18 14 24 8 32 8z" fill="#6EBAA6" opacity="0.14" />
      <Path d="M30 44v10h4V44h-4z" fill="#8B5E3C" opacity="0.9" />
    </Svg>
  </View>
)

export const BirdDoodle: React.FC<{ width?: number; height?: number; style?: any }>=({ width=48, height=32, style }) => (
  <View style={style}>
    <Svg width={width} height={height} viewBox="0 0 48 32">
      <Path d="M6 20c4-6 10-8 18-4 4 2 8 2 14-4" stroke="#FF4F61" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9}/>
      <Path d="M24 8c1 1 2 2 3 2" stroke="#FF4F61" strokeWidth={1.5} fill="none" strokeLinecap="round"/>
    </Svg>
  </View>
)