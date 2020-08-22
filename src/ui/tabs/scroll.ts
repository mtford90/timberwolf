import { first, throttle } from "lodash";
import { useCallback, useRef } from "react";
import { MIN_LOG_ROW_HEIGHT_PX } from "../components/LogRow";

/**
 * Encapsulates logic related to managing the Div element used as a scroll view
 */
export class ScrollController {
  private readonly element: HTMLDivElement;

  constructor(element: HTMLDivElement) {
    this.element = element;
  }

  /**
   * Returns the id of the log displayed at the bottom-most part of the scroll view's viewport
   */
  public get lastVisibleRowId(): number | null {
    const value = this.lastVisibleLogRow?.attributes?.getNamedItem(
      "data-row-id"
    )?.value;

    return value ? parseInt(value, 10) : null;
  }

  public scrollToBottom() {
    setTimeout(() => {
      this._scrollToBottom();
    });
  }

  private _scrollToBottom() {
    this.element.scrollTop = this.element.scrollHeight;
  }

  get shouldFollowNewLogs() {
    const { scrollDifference } = this;
    const { lastLogChild } = this;

    const minimumRequiredScrollDifference =
      (lastLogChild?.clientHeight ?? 0) + MIN_LOG_ROW_HEIGHT_PX;

    return scrollDifference <= minimumRequiredScrollDifference;
  }

  private get scrollDifference() {
    const { scrollHeight, scrollTop, clientHeight } = this.element;

    return scrollHeight - scrollTop - clientHeight;
  }

  private get contentElem() {
    const { firstElementChild } = this.element;

    if (!firstElementChild) {
      throw new Error("Scroller misconfigured");
    }

    return firstElementChild;
  }

  private get lastLogChild() {
    return this.contentElem.lastElementChild;
  }

  private get lastVisibleLogRow() {
    const { x, y, height } = this.element.getBoundingClientRect();

    return first(
      document
        .elementsFromPoint(x, y + height - 1)
        .filter((e: Element) =>
          Boolean(e.attributes.getNamedItem("data-row-id")?.value)
        )
    );
  }
}

export function useScrollTracking({
  scrollController,
  onScrolledToRow,
}: {
  scrollController?: ScrollController;
  onScrolledToRow: (rowId: number) => void;
}) {
  return throttle(
    () => {
      const lastVisibleRowId = scrollController?.lastVisibleRowId;
      if (lastVisibleRowId !== null && lastVisibleRowId !== undefined) {
        onScrolledToRow(lastVisibleRowId);
      }
    },
    50,
    { leading: true, trailing: true }
  );
}

/**
 * Wraps an element in a ScrollController
 */
export function useScrollController() {
  const scrollControllerRef = useRef<ScrollController>();
  const scrollController = scrollControllerRef.current;
  const ref = useCallback((elem: HTMLDivElement | null) => {
    if (elem) {
      scrollControllerRef.current = new ScrollController(elem);
    }
  }, []);
  return { scroller: scrollController, ref };
}
