import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Emitter } from './Emitter';

type TestEvents = {
  ping: { count: number };
  pong: void;
};

describe('Emitter', () => {
  let emitter: Emitter<TestEvents>;

  beforeEach(() => {
    emitter = new Emitter<TestEvents>();
  });

  it('registers a handler and calls it when the event is triggered', () => {
    const handler = vi.fn();
    emitter.on('ping', handler);

    emitter.trigger('ping', { count: 1 });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ count: 1 });
  });

  it('removes a handler so it is no longer called after off()', () => {
    const handler = vi.fn();
    emitter.on('ping', handler);
    emitter.off('ping', handler);

    emitter.trigger('ping', { count: 1 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('registers a once handler that runs exactly once across multiple triggers', () => {
    const handler = vi.fn();
    emitter.once('ping', handler);

    emitter.trigger('ping', { count: 1 });
    emitter.trigger('ping', { count: 2 });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ count: 1 });
  });

  it('allows removing a once handler via off() before it fires', () => {
    const handler = vi.fn();
    emitter.once('ping', handler);
    emitter.off('ping', handler);

    emitter.trigger('ping', { count: 1 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('triggers all handlers registered for the same event', () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    const handlerC = vi.fn();
    emitter.on('ping', handlerA);
    emitter.on('ping', handlerB);
    emitter.on('ping', handlerC);

    emitter.trigger('ping', { count: 42 });

    expect(handlerA).toHaveBeenCalledWith({ count: 42 });
    expect(handlerB).toHaveBeenCalledWith({ count: 42 });
    expect(handlerC).toHaveBeenCalledWith({ count: 42 });
  });

  it('does not call handlers of a different event', () => {
    const pingHandler = vi.fn();
    const pongHandler = vi.fn();
    emitter.on('ping', pingHandler);
    emitter.on('pong', pongHandler);

    emitter.trigger('ping', { count: 1 });

    expect(pingHandler).toHaveBeenCalledOnce();
    expect(pongHandler).not.toHaveBeenCalled();
  });

  it('removeAll() clears every registered handler', () => {
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    emitter.on('ping', handlerA);
    emitter.on('pong', handlerB);

    emitter.removeAll();
    emitter.trigger('ping', { count: 1 });
    emitter.trigger('pong');

    expect(handlerA).not.toHaveBeenCalled();
    expect(handlerB).not.toHaveBeenCalled();
    expect(emitter.listeners).toHaveLength(0);
  });

  it('toggleEvent(false) suppresses the event so handlers do not run', () => {
    const handler = vi.fn();
    emitter.on('ping', handler);

    emitter.toggleEvent('ping', false);
    emitter.trigger('ping', { count: 1 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('toggleEvent(true) re-enables the event so handlers run again', () => {
    const handler = vi.fn();
    emitter.on('ping', handler);

    emitter.toggleEvent('ping', false);
    emitter.trigger('ping', { count: 1 });

    emitter.toggleEvent('ping', true);
    emitter.trigger('ping', { count: 2 });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ count: 2 });
  });

  it('toggleEvent suppresses only the specified event, not others', () => {
    const pingHandler = vi.fn();
    const pongHandler = vi.fn();
    emitter.on('ping', pingHandler);
    emitter.on('pong', pongHandler);

    emitter.toggleEvent('ping', false);
    emitter.trigger('ping', { count: 1 });
    emitter.trigger('pong');

    expect(pingHandler).not.toHaveBeenCalled();
    expect(pongHandler).toHaveBeenCalledOnce();
  });
});
