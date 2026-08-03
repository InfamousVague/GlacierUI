import { describe, expect, it } from 'vitest';
import {
  MAX_CHROMA,
  MAX_HUE,
  HUE_STEP,
  channelRamp,
  formatOklch,
  inSrgbGamut,
  oklchToHex,
  oklchToRgb,
  parseHex,
  parseOklch,
  readableOn,
  rgbToHex,
  rgbToOklch,
} from '../src/color.ts';

describe('oklch <-> rgb', () => {
  it('maps white', () => {
    const rgb = oklchToRgb({ l: 1, c: 0, h: 0 });
    expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('maps black', () => {
    expect(oklchToRgb({ l: 0, c: 0, h: 0 })).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('maps mid grey to a neutral with no chroma', () => {
    const lch = rgbToOklch({ r: 128, g: 128, b: 128 });
    expect(lch.c).toBeLessThan(0.001);
  });

  it('round-trips pure red within a rounding step', () => {
    const lch = rgbToOklch({ r: 255, g: 0, b: 0 });
    const back = oklchToRgb(lch);
    expect(back.r).toBe(255);
    expect(back.g).toBe(0);
    expect(back.b).toBe(0);
  });

  it('round-trips a set of arbitrary colours', () => {
    for (const rgb of [
      { r: 12, g: 200, b: 90 },
      { r: 255, g: 128, b: 0 },
      { r: 3, g: 7, b: 240 },
      { r: 199, g: 199, b: 12 },
    ]) {
      const back = oklchToRgb(rgbToOklch(rgb));
      // Within one 8-bit step in each channel.
      expect(Math.abs(back.r - rgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.g - rgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(1);
    }
  });

  it('gives a neutral a stable hue rather than a jumping one', () => {
    // atan2(0, 0) is undefined territory; pinning it to 0 stops the hue slider
    // leaping about as chroma passes through zero.
    expect(rgbToOklch({ r: 40, g: 40, b: 40 }).h).toBe(0);
  });

  it('clamps an out-of-gamut colour into range instead of overflowing', () => {
    const rgb = oklchToRgb({ l: 0.9, c: 0.35, h: 140 });
    for (const channel of [rgb.r, rgb.g, rgb.b]) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(255);
    }
  });

  it('carries alpha through', () => {
    expect(oklchToRgb({ l: 0.5, c: 0.1, h: 200, a: 0.5 }).a).toBe(0.5);
  });
});

describe('hex', () => {
  it('formats', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 128 })).toBe('#ff0080');
  });

  it('pads single digits', () => {
    expect(rgbToHex({ r: 1, g: 2, b: 3 })).toBe('#010203');
  });

  it('appends alpha only when it is below 1', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0, a: 1 })).toBe('#000000');
    expect(rgbToHex({ r: 0, g: 0, b: 0, a: 0.5 })).toBe('#00000080');
  });

  it('parses long form', () => {
    expect(parseHex('#ff0080')).toEqual({ r: 255, g: 0, b: 128 });
  });

  it('parses short form by doubling each digit', () => {
    expect(parseHex('#f08')).toEqual({ r: 255, g: 0, b: 136 });
  });

  it('parses without the hash', () => {
    expect(parseHex('ff0080')).toEqual({ r: 255, g: 0, b: 128 });
  });

  it('parses eight-digit alpha', () => {
    expect(parseHex('#00000080')?.a).toBeCloseTo(0.502, 2);
  });

  it('returns null for a half-typed value rather than resolving to black', () => {
    // So a text field does not apply garbage on every keystroke. Note 4 and 3
    // digits ARE valid (#rgba and #rgb); 5 and 7 are the half-typed lengths.
    expect(parseHex('#ff000')).toBeNull();
    expect(parseHex('#ff00000')).toBeNull();
    expect(parseHex('#')).toBeNull();
    expect(parseHex('nope')).toBeNull();
    expect(parseHex('#gggggg')).toBeNull();
  });

  it('round-trips through hex', () => {
    expect(oklchToHex(rgbToOklch(parseHex('#3b82f6')!))).toBe('#3b82f6');
  });
});

describe('css oklch', () => {
  it('formats without alpha when opaque', () => {
    expect(formatOklch({ l: 0.5, c: 0.1, h: 200 })).toBe('oklch(0.5 0.1 200)');
  });

  it('includes alpha when it is below 1', () => {
    expect(formatOklch({ l: 0.5, c: 0.1, h: 200, a: 0.4 })).toBe('oklch(0.5 0.1 200 / 0.4)');
  });

  it('omits alpha at 1', () => {
    expect(formatOklch({ l: 0.5, c: 0.1, h: 200, a: 1 })).toBe('oklch(0.5 0.1 200)');
  });

  it('parses the form it writes', () => {
    expect(parseOklch('oklch(0.5 0.1 200)')).toEqual({ l: 0.5, c: 0.1, h: 200 });
  });

  it('parses a percentage lightness', () => {
    expect(parseOklch('oklch(50% 0.1 200)')?.l).toBe(0.5);
  });

  it('parses alpha', () => {
    expect(parseOklch('oklch(0.5 0.1 200 / 0.4)')?.a).toBe(0.4);
  });

  it('wraps a hue past 360', () => {
    expect(parseOklch('oklch(0.5 0.1 400)')?.h).toBe(40);
  });

  it('returns null for anything that is not an oklch string', () => {
    expect(parseOklch('#ff0000')).toBeNull();
    expect(parseOklch('rgb(1 2 3)')).toBeNull();
    expect(parseOklch('oklch(0.5 0.1)')).toBeNull();
  });

  it('round-trips', () => {
    const css = 'oklch(0.64 0.162 228)';
    expect(formatOklch(parseOklch(css)!)).toBe(css);
  });
});

describe('inSrgbGamut', () => {
  it('accepts a displayable colour', () => {
    expect(inSrgbGamut(rgbToOklch({ r: 59, g: 130, b: 246 }))).toBe(true);
  });

  it('rejects a colour no display can produce', () => {
    // Very high chroma at high lightness is well outside sRGB.
    expect(inSrgbGamut({ l: 0.95, c: 0.35, h: 140 })).toBe(false);
  });
});

describe('readableOn', () => {
  it('puts black on a light background', () => {
    expect(readableOn({ l: 0.9, c: 0, h: 0 })).toBe('#000000');
  });

  it('puts white on a dark background', () => {
    expect(readableOn({ l: 0.2, c: 0, h: 0 })).toBe('#ffffff');
  });
});

describe('channelRamp', () => {
  const base = { l: 0.64, c: 0.162, h: 228 };

  it('samples the requested number of stops', () => {
    expect(channelRamp(base, 'l', 8)).toHaveLength(8);
    expect(channelRamp(base, 'l')).toHaveLength(96);
  });

  it('spans lightness from black to white, whatever the hue', () => {
    const ramp = channelRamp(base, 'l', 5);
    expect(ramp[0]).toBe(oklchToHex({ ...base, l: 0 }));
    expect(ramp[4]).toBe(oklchToHex({ ...base, l: 1 }));
  });

  it('starts chroma at grey and ends at the maximum', () => {
    const ramp = channelRamp(base, 'c', 3);
    expect(ramp[0]).toBe(oklchToHex({ ...base, c: 0 }));
    expect(ramp[2]).toBe(oklchToHex({ ...base, c: MAX_CHROMA }));
  });

  it('closes the hue circle, because 0 and 360 are one colour', () => {
    const ramp = channelRamp(base, 'h', 7);
    expect(ramp[0]).toBe(ramp[6]);
  });

  it('holds the colour steady while alpha climbs', () => {
    const ramp = channelRamp(base, 'a', 3);
    expect(ramp[0]).toMatch(/^rgba\(.*, 0\)$/);
    expect(ramp[2]).toMatch(/^rgba\(.*, 1\)$/);
    // Same rgb throughout: opacity is not a change of colour.
    const rgbOf = (s: string) => s.slice(0, s.lastIndexOf(','));
    expect(rgbOf(ramp[0]!)).toBe(rgbOf(ramp[2]!));
  });

  it('varies only the channel it was asked for', () => {
    // Every lightness stop keeps the base hue, so the ramp reads as one colour
    // getting lighter rather than sliding across the wheel.
    const ramp = channelRamp(base, 'l', 5);
    const expected = [0, 0.25, 0.5, 0.75, 1].map((l) => oklchToHex({ ...base, l }));
    expect(ramp).toEqual(expected);
  });

  it('is deterministic, so both bindings paint the same track', () => {
    expect(channelRamp(base, 'h', 12)).toEqual(channelRamp(base, 'h', 12));
  });

  it('survives a single-step request without dividing by zero', () => {
    expect(channelRamp(base, 'l', 1)).toEqual([oklchToHex({ ...base, l: 0 })]);
  });
});

describe('hue is circular, so a control must stop short of a full turn', () => {
  it('normalises a full turn back to zero', () => {
    // The behaviour MAX_HUE exists to work around: a slider whose max is 360
    // reads its own maximum back as its minimum, and the thumb snaps to the
    // start the moment it reaches the end.
    expect(parseOklch('oklch(0.64 0.162 360)')!.h).toBe(0);
  });

  it('round-trips MAX_HUE unchanged, so the thumb stays where it was dragged', () => {
    const at = { l: 0.64, c: 0.162, h: MAX_HUE };
    expect(parseOklch(formatOklch(at))!.h).toBe(MAX_HUE);
  });

  it('leaves MAX_HUE inside the circle', () => {
    expect(MAX_HUE).toBeLessThan(360);
    expect(MAX_HUE).toBe(360 - HUE_STEP);
  });

  it('renders MAX_HUE indistinguishably from a full turn', () => {
    // Being one step short costs nothing visible, which is why stopping there
    // is the right trade rather than a compromise.
    const base = { l: 0.64, c: 0.162 };
    const rgbA = oklchToRgb({ ...base, h: MAX_HUE });
    const rgbB = oklchToRgb({ ...base, h: 360 });
    // One degree of hue moves a channel by at most a couple of 8-bit steps.
    for (const ch of ['r', 'g', 'b'] as const) {
      expect(Math.abs(rgbA[ch] - rgbB[ch])).toBeLessThanOrEqual(2);
    }
  });

  it('still wraps values past a full turn, which is what normalising is for', () => {
    expect(parseOklch('oklch(0.64 0.162 400)')!.h).toBe(40);
  });

  it('rejects a negative hue rather than wrapping it', () => {
    // CSS does allow a negative hue angle; this parser's number pattern does
    // not take a sign, so it declines the whole string instead of reading it
    // as 340deg. Pinned because it is a real limit, not because it is desirable
    // - nothing in the kit emits one, and the picker cannot produce one.
    expect(parseOklch('oklch(0.64 0.162 -20)')).toBeNull();
  });
});
