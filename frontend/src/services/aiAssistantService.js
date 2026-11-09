import { api } from './api';

export function sendAssistantMessage(question, conversation = []) {
  return api('/ai-assistant/chat', {
    method: 'POST',
    body: { question, conversation },
  });
}
