import { chatMessageSchema, navigationRequestSchema, translateRequestSchema } from '@/utils/validation';

describe('Validation Schemas', () => {
  describe('chatMessageSchema', () => {
    it('accepts valid chat message', () => {
      const result = chatMessageSchema.safeParse({ message: 'Where is Gate 6?' });
      expect(result.success).toBe(true);
    });

    it('accepts message with language', () => {
      const result = chatMessageSchema.safeParse({ message: 'Hola', language: 'es' });
      expect(result.success).toBe(true);
    });

    it('rejects empty message', () => {
      const result = chatMessageSchema.safeParse({ message: '' });
      expect(result.success).toBe(false);
    });

    it('rejects message exceeding 2000 chars', () => {
      const result = chatMessageSchema.safeParse({ message: 'x'.repeat(2001) });
      expect(result.success).toBe(false);
    });

    it('defaults language to en', () => {
      const result = chatMessageSchema.safeParse({ message: 'Hello' });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.language).toBe('en');
    });
  });

  describe('navigationRequestSchema', () => {
    it('accepts valid navigation request', () => {
      const result = navigationRequestSchema.safeParse({
        origin: { latitude: 40.8128, longitude: -74.0745 },
        destination: 'restroom',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid latitude', () => {
      const result = navigationRequestSchema.safeParse({
        origin: { latitude: 91, longitude: -74.0745 },
        destination: 'restroom',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('translateRequestSchema', () => {
    it('accepts valid translation request', () => {
      const result = translateRequestSchema.safeParse({
        text: 'Hello',
        targetLanguage: 'es',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid language code', () => {
      const result = translateRequestSchema.safeParse({
        text: 'Hello',
        targetLanguage: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });
});
