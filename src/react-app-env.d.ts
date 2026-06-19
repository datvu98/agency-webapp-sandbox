/// <reference types="react-scripts" />

// To solve the issue: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31245
/// <reference types="styled-components/cssprop" />
declare module '*.mp3';
declare module '*.xlsx' {
  const src: string;
  export default src;
}