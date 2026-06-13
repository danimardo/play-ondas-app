import { describe, it, expect } from 'vitest';
import { WAVE_CATEGORIES } from '../../../src/lib/data/waves';

describe('Wave categories medical checks', () => {
  it('should not contain medical claims', () => {
    const forbiddenWords = ['cura', 'trata', 'diagnóstica', 'garantiza', 'científicamente probado', 'terapéutico'];
    
    WAVE_CATEGORIES.forEach(wave => {
      // Verificar precaución
      expect(wave.caution).toBeDefined();
      expect(wave.caution.length).toBeGreaterThan(0);

      // Comprobar palabras prohibidas
      const text = `${wave.shortDescription} ${wave.recommendedFor} ${wave.caution}`.toLowerCase();
      forbiddenWords.forEach(word => {
        expect(text).not.toContain(word);
      });
    });
  });
});
