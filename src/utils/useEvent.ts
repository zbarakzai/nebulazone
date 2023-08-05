import {useEffect, useRef} from 'react';
import type {RefObject} from 'react';

type EventListenerTargets =
  | Window
  | Document
  | HTMLElement
  | RefObject<HTMLElement>;

type TargetedElement<T extends EventListenerTargets> =
  T extends RefObject<HTMLElement>
    ? HTMLElement
    : T extends Window
    ? Window
    : T extends Document
    ? Document
    : HTMLElement;

type EventMap<Target extends EventListenerTargets> =
  TargetedElement<Target> extends Window
    ? WindowEventMap
    : TargetedElement<Target> extends Document
    ? DocumentEventMap
    : TargetedElement<Target> extends HTMLElement
    ? HTMLElementEventMap
    : never;

type EventName<Target extends EventListenerTargets> = keyof EventMap<Target>;

type TargetedEvent<
  Target extends EventListenerTargets,
  Name extends EventName<Target>,
> = EventMap<Target>[Name];

export function useEventListener<
  TargetEventName extends EventName<Target>,
  TargetEvent extends TargetedEvent<Target, TargetEventName>,
  Target extends EventListenerTargets = Window,
>(
  eventName: TargetEventName,
  handler: (event: TargetEvent) => void,
  target?: null | Target,
  options?: AddEventListenerOptions,
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    const eventListener = (event: Event) =>
      handlerRef.current(event as TargetEvent);

    if (typeof eventName === 'string' && target !== null) {
      let targetElement: HTMLElement | Document | Window;

      if (typeof target === 'undefined') {
        targetElement = window;
      } else if ('current' in target && target.current !== null) {
        targetElement = target.current;
      } else {
        targetElement = target as HTMLElement | Window | Document;
      }

      targetElement.addEventListener(eventName, eventListener, options);

      return () => {
        targetElement.removeEventListener(eventName, eventListener, options);
      };
    }
  }, [eventName, options, target]);
}
