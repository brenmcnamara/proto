export interface EventSubscription {
  remove: () => void;
}

export const NoOpEventSubscription = { remove: () => {} };

export function trySubscribeToDOMEvent<
  T extends string,
  S extends (event: Event) => void
>(
  element: Node | Window | null | undefined,
  eventName: T,
  callback: S,
): EventSubscription {
  if (element) {
    return subscribedToDOMEvent(element, eventName, callback);
  }
  return NoOpEventSubscription;
}

export function subscribedToDOMEvent<
  T extends string,
  S extends (event: Event) => void
>(element: Node | Window, eventName: T, callback: S): EventSubscription {
  element.addEventListener(eventName, callback);
  return {
    remove: () => {
      element.removeEventListener(eventName, callback);
    },
  };
}

export function composeSubscriptions(
  subscriptions: EventSubscription[],
): EventSubscription {
  return {
    remove: () => {
      subscriptions.forEach(s => s.remove());
    },
  };
}
