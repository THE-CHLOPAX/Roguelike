type Listener<T, U> = {
    event: T;
    cb: (value: U) => void;
    originalCb?: (value: U) => void; // For .once() wrappers
}

/**
 * Emitter class, used to emit events
 * to listeners and subscribe to those
 * events.
 */
export class Emitter<T> {

    private _listeners: Array<Listener<keyof T, T[keyof T]>> = [];
    private _suppressedListeners: Array<Listener<keyof T, T[keyof T]>> = [];

    public get listeners(): Array<Listener<keyof T, T[keyof T]>> {
        return this._listeners;
    }

    /**
     * Add a listener to the emitter.
     * @param event
     * @param cb
     */
    public on<U extends keyof T>(event: U, cb: (value: T[U]) => void): void {
        this._listeners.push({ event, cb: cb as (value: T[keyof T]) => void });
    }


    /**
     * Add a listener that will
     * run only once.
     * @param event
     * @param cb
     */
    public once<U extends keyof T>(event: U, cb: (value: T[U]) => void): void {
        const wrapper = (value: T[U]) => {
            cb(value);
            this.off(event, cb);
        };
        // Store the wrapper with a reference to the original callback
        this._listeners.push({ 
            event, 
            cb: wrapper as (value: T[keyof T]) => void,
            originalCb: cb as (value: T[keyof T]) => void
        });
    }


    /**
     * Remove a listener from the emitter.
     * @param event
     * @param cb
     */
    public off<U extends keyof T>(event: U, cb: (value: T[U]) => void): void {
        // Filter out listeners that match either the callback or the original callback (for .once() wrappers)
        this._listeners = this._listeners.filter(listener => {
            const isMatchingEvent = listener.event === event;
            const isMatchingCallback = listener.cb === cb || listener.originalCb === cb;
            return !(isMatchingEvent && isMatchingCallback);
        });
    }


    /**
     * Remove all listeners from the emitter.
     */
    public removeAll(): void {
        this._listeners = [];
    }


    /**
     * Disable / Enable the specific event.
     */
    public toggleEvent(event: keyof T, enabled: boolean): void {
        // If the event is being enabled, remove it from suppressed listeners
        if (enabled) {
            this._suppressedListeners = this._suppressedListeners.filter(listener => listener.event !== event);
        }
        // Else, add it to suppressed listeners
        else {
            this._suppressedListeners = [
                ...this._suppressedListeners,
                ...this._listeners.filter(listener => listener.event === event)
            ];
        }
        
    }


    /**
     * Emit an event to all listeners.
     * @param event
     * @param payload
     */
    public trigger<U extends keyof T>(event: U, payload?: T[U]): void {
        // If the event is suppressed, do not trigger it
        if (this._suppressedListeners.some(listener => listener.event === event)) {
            return;
        }

        const callback = (listener: Listener<keyof T, T[keyof T]>) => listener.cb(payload as T[keyof T]);

        this._listeners
            .filter(listener => listener.event === event)
            .forEach(callback);
    }
}