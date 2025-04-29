// react-native-webgl.d.ts
declare module 'react-native-webgl' {
  import {Component} from 'react';
  import {ViewProps} from 'react-native';

  interface WebGLContextAttributes {
    alpha?: boolean;
    depth?: boolean;
    stencil?: boolean;
    antialias?: boolean;
    premultipliedAlpha?: boolean;
    preserveDrawingBuffer?: boolean;
    powerPreference?: 'default' | 'high-performance' | 'low-power';
    failIfMajorPerformanceCaveat?: boolean;
  }

  interface WebGLObject {
    id: number;
    getContext: (
      contextType: string,
      contextAttributes?: WebGLContextAttributes,
    ) => WebGLRenderingContext | WebGL2RenderingContext | null;
    endFrameEXP: () => void;
    [key: string]: any; // Allow other potential properties
  }

  interface WebGLViewProps extends ViewProps {
    onContextCreate: (gl: WebGLObject) => void;
    msaaSamples?: number;
  }

  export class WebGLView extends Component<WebGLViewProps> {}
}
