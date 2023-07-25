import React from "react";

/**
 * @see https://github.com/uidotdev/usehooks/blob/acce70639fa09051dc6d9e1ba6517d5bb3f034d3/index.js#L525
 */
export default function useIsFirstRender() {
  const renderRef = React.useRef(true);
  if (renderRef.current === true) {
    renderRef.current = false;
    return true;
  }
  return renderRef.current;
}
