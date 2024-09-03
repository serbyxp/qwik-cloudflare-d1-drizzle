import type { CSSProperties } from '@builder.io/qwik';

type StyleProp = CSSProperties | string | undefined;

export function computedStyle(style: StyleProp, additionalStyles: CSSProperties = {}): CSSProperties {
    let baseStyle: CSSProperties = {};

    if (typeof style === 'object') {
        baseStyle = style;
    } else if (typeof style === 'string' && style.trim() !== '') {
        baseStyle = style.split(';').reduce((acc, stylePair) => {
            const [key, value] = stylePair.split(':');
            if (key && value) {
                const camelCaseKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                (acc as any)[camelCaseKey] = value.trim();
            }
            return acc;
        }, {} as CSSProperties);
    }

    return { ...baseStyle, ...additionalStyles };
}