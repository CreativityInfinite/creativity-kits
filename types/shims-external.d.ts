// 类型补充：第三方库最小声明，便于 TS 校验通过

declare module 'pinyin-pro' {
  export interface PinyinOptions {
    toneType?: 'symbol' | 'num' | 'none';
    type?: 'string' | 'array';
    nonZh?: 'consecutive' | 'removed' | 'spaced';
    multiple?: boolean;
    pattern?: 'pinyin' | 'initial' | 'final';
    toneSandhi?: boolean;
    v?: 'v' | 'u:';
    format?: (pinyin: string, index: number) => string;
  }
  export function pinyin(text: string, options?: PinyinOptions): string | string[];
}

declare module 'opencc-js' {
  export interface ConverterOptions {
    from?: 'cn' | 'tw' | 'hk' | 'twp' | 't' | 's';
    to?: 'cn' | 'tw' | 'hk' | 'twp' | 't' | 's';
    segment?: boolean;
  }
  // 使用命名空间导入：import * as OpenCC from 'opencc-js'; OpenCC.Converter(...)
  export function Converter(options?: ConverterOptions): (text: string) => string;
  export function Segmentation(): any;
}
