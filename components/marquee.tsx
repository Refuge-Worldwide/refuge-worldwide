import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { isServer } from "../util";

interface MarqueeOptions {
  elementRef: MutableRefObject<HTMLElement>;
  parentRef: MutableRefObject<HTMLElement>;
  speed?: number;
  reverse?: boolean;
}

function useMarquee({
  elementRef,
  parentRef,
  speed = 0.25,
  reverse = false,
}: MarqueeOptions) {
  const element = elementRef?.current;
  const parent = parentRef?.current;

  const [parentProps, parentPropsSet] = useState<DOMRect>();
  const [content, contentSet] = useState<Element>();
  const [offset, offsetSet] = useState(0);
  const [wrapper, wrapperSet] = useState<HTMLDivElement>();
  const [contentWidth, contentWidthSet] = useState<number>();
  const [requiredReps, requiredRepsSet] = useState<number>();

  /**
   * Init
   */
  useEffect(() => {
    if (elementRef.current && parentRef.current) {
      console.log("6k Ready", {
        element,
        parent,
      });

      parentPropsSet(parent?.getBoundingClientRect());

      contentSet(element?.children[0]);

      console.log(content);

      // _setupWrapper();

      // _setupContent();

      // wrapper.appendChild(content);

      // element.appendChild(wrapper);
    }
  }, [elementRef, parentRef]);

  /**
   * Setup Wrapper
   */
  const _setupWrapper = () => {
    const elem = document.createElement("div");

    elem.classList.add("6k__wrapper");

    elem.style.whiteSpace = "nowrap";

    wrapperSet(elem);
  };

  /**
   * Setup Content
   */
  const _setupContent = () => {
    content.classList.add("6k__copy");

    // @ts-ignore
    content.style.display = "inline-block";

    // @ts-ignore
    contentWidthSet(content.offsetWidth);

    requiredRepsSet(
      contentWidth > parentProps.width
        ? 2
        : Math.ceil((parentProps.width - contentWidth) / contentWidth) + 1
    );

    for (let i = 0; i < requiredReps; i++) {
      _createClone();
    }

    if (reverse) {
      offsetSet(contentWidth * -1);
    }

    element.classList.add("is-init");
  };

  /**
   * Clone Element
   */
  const _createClone = () => {
    const clone = content.cloneNode(true);

    // @ts-ignore
    clone.style.display = "inline-block";

    // @ts-ignore
    clone.classList.add(`6k__copy`);

    wrapper.appendChild(clone);
  };

  const animate = () => {
    const isScrolled = reverse ? offset < 0 : offset > contentWidth * -1;

    const direction = reverse ? -1 : 1;

    const reset = reverse ? contentWidth * -1 : 0;

    if (isScrolled) {
      offsetSet((curr) => (curr -= speed * direction));
    } else {
      offsetSet(reset);
    }

    wrapper.style.whiteSpace = "nowrap";
    wrapper.style.transform = `translate(${offset}px, 0) translateZ(0)`;
  };

  return {
    animate,
  };
}

export default function Marquee({ text, ...rest }) {
  const elementRef = useRef<HTMLDivElement>();
  const parentRef = useRef<HTMLDivElement>();

  useMarquee({ elementRef, parentRef });

  return (
    <div ref={parentRef} className="flex-1 truncate mt-0.5" {...rest}>
      <div ref={elementRef}>
        <div>
          <span className="whitespace-nowrap leading-none pr-8">{text}</span>
        </div>
      </div>
    </div>
  );
}
