
declare global {
    interface HTMLElement {
        /**
         * @param listener - the callback to call when this node has been migrated to another window.
         * @returns destroy - a function to remove the event handler to avoid memory leaks.
         */
        onWindowMigrated(this: HTMLElement, listener: (win: Window) => any): () => void;
    }
    interface Window {
        /**
         * The actively focused Window object. This is usually the same as `window` but
         * it will be different when using popout windows.
         */
        activeWindow: Window;
    }
}

/**
 * @public
 */
export class Component {

    /**
     * Load this component and its children
     * @public
     */
    load(): void;
    /**
     * Override this to load your component
     * @public
     * @virtual
     */
    onload(): void;
    /**
     * Unload this component and its children
     * @public
     */
    unload(): void;
    /**
     * Override this to unload your component
     * @public
     * @virtual
     */
    onunload(): void;
    /**
     * Adds a child component, loading it if this component is loaded
     * @public
     */
    addChild<T extends Component>(component: T): T;
    /**
     * Removes a child component, unloading it
     * @public
     */
    removeChild<T extends Component>(component: T): T;
    /**
     * Registers a callback to be called when unloading
     * @public
     */
    register(cb: () => any): void;
    /**
     * Registers an event to be detached when unloading
     * @public
     */
    registerEvent(eventRef: EventRef): void;
    /**
     * Registers an DOM event to be detached when unloading
     * @public
     */
    registerDomEvent<K extends keyof WindowEventMap>(el: Window, type: K, callback: (this: HTMLElement, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    /**
     * Registers an DOM event to be detached when unloading
     * @public
     */
    registerDomEvent<K extends keyof DocumentEventMap>(el: Document, type: K, callback: (this: HTMLElement, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    /**
     * Registers an DOM event to be detached when unloading
     * @public
     */
    registerDomEvent<K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, callback: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;

    /**
     * Registers an interval (from setInterval) to be cancelled when unloading
     * Use {@link window.setInterval} instead of {@link setInterval} to avoid TypeScript confusing between NodeJS vs Browser API
     * @public
     */
    registerInterval(id: number): number;
}

/**
 * @public
 */
export interface EventRef {

}

/**
 * @public
 */
export class Events {

    /**
     * @public
     */
    on(name: string, callback: (...data: any) => any, ctx?: any): EventRef;
    /**
     * @public
     */
    off(name: string, callback: (...data: any) => any): void;
    /**
     * @public
     */
    offref(ref: EventRef): void;
    /**
     * @public
     */
    trigger(name: string, ...data: any[]): void;
    /**
     * @public
     */
    tryTrigger(evt: EventRef, args: any[]): void;
}

/**
 * A post processor receives an element which is a section of the preview.
 *
 * Post processors can mutate the DOM to render various things, such as mermaid graphs, latex equations, or custom controls.
 *
 * If your post processor requires lifecycle management, for example, to clear an interval, kill a subprocess, etc when this element is
 * removed from the app, look into {@link MarkdownPostProcessorContext#addChild}
 * @public
 */
export interface MarkdownPostProcessor {
    /**
     * The processor function itself.
     * @public
     */
    (el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<any> | void;
    /**
     * An optional integer sort order. Defaults to 0. Lower number runs before higher numbers.
     * @public
     */
    sortOrder?: number;
}

/**
 * @public
 */
export interface MarkdownPostProcessorContext {
    /**
     * @public
     */
    docId: string;
    /** @public */
    sourcePath: string;
    /** @public */
    frontmatter: any | null | undefined;

    /**
     * Adds a child component that will have its lifecycle managed by the renderer.
     *
     * Use this to add a dependent child to the renderer such that if the containerEl
     * of the child is ever removed, the component's unload will be called.
     * @public
     */
    addChild(child: MarkdownRenderChild): void;
    /**
     * Gets the section information of this element at this point in time.
     * Only call this function right before you need this information to get the most up-to-date version.
     * This function may also return null in many circumstances; if you use it, you must be prepared to deal with nulls.
     * @public
     */
    getSectionInfo(el: HTMLElement): MarkdownSectionInformation | null;

}

/**
 * @public
 */
export class MarkdownPreviewRenderer {

    /**
     * @public
     */
    static registerPostProcessor(postProcessor: MarkdownPostProcessor, sortOrder?: number): void;
    /**
     * @public
     */
    static unregisterPostProcessor(postProcessor: MarkdownPostProcessor): void;

    /**
     * @public
     */
    static createCodeBlockPostProcessor(language: string, handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | void): (el: HTMLElement, ctx: MarkdownPostProcessorContext) => void;

}

/**
 * @public
 */
export class MarkdownRenderChild extends Component {
    /** @public */
    containerEl: HTMLElement;
    /**
     * @param containerEl - This HTMLElement will be used to test whether this component is still alive.
     * It should be a child of the markdown preview sections, and when it's no longer attached
     * (for example, when it is replaced with a new version because the user edited the markdown source code),
     * this component will be unloaded.
     * @public
     */
    constructor(containerEl: HTMLElement);
}

/** @public */
export interface MarkdownSectionInformation {
    /** @public */
    text: string;
    /** @public */
    lineStart: number;
    /** @public */
    lineEnd: number;
}

/** @public */
export class Publish extends Events {

    /** @public */
    get currentFilepath(): string;
    /**
     * @public
     */
    registerMarkdownPostProcessor(postProcessor: MarkdownPostProcessor, sortOrder?: number): MarkdownPostProcessor;
    /**
     * Register a special post processor that handles fenced code given a language and a handler.
     * This special post processor takes care of removing the <pre><code> and create a <div> that
     * will be passed to your handler, and is expected to be filled with your custom elements.
     * @public
     */
    registerMarkdownCodeBlockProcessor(language: string, handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | void, sortOrder?: number): MarkdownPostProcessor;

    /** @public */
    on(name: 'navigated', callback: () => any, ctx?: any): EventRef;
}

export { }

/** @public */
declare global {
    /**
	 * Global reference to the publish instance.
	 * @public
	 */
	var publish: Publish;
}

