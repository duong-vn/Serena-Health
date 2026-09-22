import assert from 'node:assert/strict';
import { test } from 'node:test';
import { emergencyGuidance } from './safety.js';

test('urgent English and Vietnamese symptoms bypass ordinary AI chat', () => {
  for (const text of ['I have severe chest pain', 'I cannot breathe', 'My mother is unconscious', 'Tôi đau ngực dữ dội', 'Tôi không thở được', 'Chảy máu không cầm', 'I will kill myself tonight', 'Tôi muốn tự tử']) {
    assert.ok(emergencyGuidance(text), text);
  }
});

test('ordinary symptoms do not trigger emergency rules', () => {
  assert.equal(emergencyGuidance('Tôi bị sổ mũi từ hôm qua'), null);
  assert.equal(emergencyGuidance('What services does the clinic offer?'), null);
});

test('emergency guidance directs professional help, never diagnosis', () => {
  const result = emergencyGuidance('khó thở nghiêm trọng');
  assert.match(result ?? '', /115/);
  assert.match(result ?? '', /không phải chẩn đoán/);
});
