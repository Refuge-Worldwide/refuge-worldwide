import { RefObject, useCallback, useEffect } from "react";
import useAnimationFrame from "./useAnimationFrame";

interface MarqueeOptions {
  speed?: number;
  reverse?: boolean;
}

export default function useMarquee(
  ref: RefObject<Element> | Element | null,
  options: MarqueeOptions = { speed: 0.25, reverse: false }
) {
  const { speed, reverse } = options;

  let element: Element;
  let wrapper: HTMLDivElement;
  let content: Element;
  let parentProps: DOMRect;
  let requiredReps: number;
  let contentWidth: number;
  let offset = 0;

  const _createClone = useCallback(() => {
    const clonedContentElement = content.cloneNode(true);

    // @ts-ignore
    clonedContentElement.style.display = "inline-block";

    // @ts-ignore
    clonedContentElement.classList.add(`6k__copy`);

    wrapper.appendChild(clonedContentElement);
  }, []);

  const _setupWrapper = useCallback(() => {
    const wrapperElement = document.createElement("div");

    wrapperElement.classList.add("6k__wrapper");

    wrapperElement.style.whiteSpace = "nowrap";

    wrapper = wrapperElement;
  }, []);

  const _setupContent = useCallback(() => {
    content.classList.add("6k__copy");

    // @ts-ignore
    content.style.display = "inline-block";

    // @ts-ignore
    contentWidth = content.offsetWidth;

    requiredReps =
      contentWidth > parentProps.width
        ? 2
        : Math.ceil((parentProps.width - contentWidth) / contentWidth) + 1;

    for (let i = 0; i < requiredReps; i++) {
      _createClone();
    }

    if (reverse) {
      offset = contentWidth * -1;
    }

    element.classList.add("6k__init");
  }, [_createClone]);

  const _animate = useCallback(() => {
    const isScrolled = reverse ? offset < 0 : offset > contentWidth * -1;

    const direction = reverse ? -1 : 1;

    const reset = reverse ? contentWidth * -1 : 0;

    if (isScrolled) {
      offset -= speed * direction;
    } else {
      offset = reset;
    }

    wrapper.style.whiteSpace = "nowrap";
    wrapper.style.transform = `translate(${offset}px, 0) translateZ(0)`;
  }, []);

  useEffect(() => {
    if (ref === null) {
      return;
    }

    element = ref instanceof Element ? ref : ref.current;
    if (element === null) {
      return;
    }

    parentProps = element.parentElement.getBoundingClientRect();
    content = element.children[0];

    _setupWrapper();
    _setupContent();

    wrapper.appendChild(content);
    element.appendChild(wrapper);
  }, [ref, _setupWrapper, _setupContent]);

  useAnimationFrame(_animate);
}
